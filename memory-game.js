import "handcraft/dom/_nodes.js";
import "handcraft/dom/append.js";
import "handcraft/dom/aria.js";
import "handcraft/dom/classes.js";
import "handcraft/dom/effect.js";
import "handcraft/dom/observe.js";
import "handcraft/dom/on.js";
import "handcraft/dom/styles.js";
import "handcraft/dom/text.js";
import {trySong, scheduleSong} from "audio";
import {html} from "handcraft/dom.js";
import {watch} from "handcraft/reactivity.js";
import {each} from "handcraft/each.js";
import {when} from "handcraft/when.js";

let {span: SPAN, div: DIV, dialog: DIALOG, p: P, button: BUTTON} = html;

export default (settings) => (host) => {
	let observed = host.observe();
	let buttons = observed.find(`:scope > button`);
	let state = watch({
		incomplete: null,
		previousStack: [],
		resolvePrevious: null,
		modalOpen: false,
		characters: watch([]),
	});

	resetState();

	let btns = each(state.characters).map((entry) => {
		let btn = buttons[entry.index] ?? BUTTON();

		let faces = DIV()
			.classes("faces")
			.append(
				SPAN().classes("front", "face").text("🦉"),
				SPAN()
					.classes("back", "face")
					.styles({
						"--back-background": () =>
							entry.value.animating ||
							entry.value.state === "flipped" ||
							entry.value.state === "matched"
								? `var(--${entry.value.color})`
								: null,
					})
					.append(
						SPAN()
							.classes("text")
							.text(() => entry.value.text)
					)
			);

		return btn
			.aria({
				label: () =>
					entry.value.state === "covered" ? "owl" : entry.value.name,
			})
			.classes({
				completed: () => state.incomplete === -1,
				covered: () => entry.value.state === "covered",
				flipped: () => entry.value.state === "flipped",
				matched: () => entry.value.state === "matched",
			})
			.append(faces)
			.on("click", onClick(entry));
	});

	let reloadDialog = () =>
		DIALOG()
			.classes("reload-dialog")
			.append(
				DIV().classes("face").text("🦉"),
				DIV()
					.classes("bubble")
					.append(
						P().text("Hoo-ray! You found all my owl friends."),
						BUTTON()
							.classes("play-again")
							.text("Play Again!")
							.on("click", () => resetState("covered"))
					)
			)
			.effect((el) => {
				if (state.modalOpen) {
					el.showModal();
				} else {
					el.close();
				}
			});

	host
		.append(btns, when((prev) => prev || state.modalOpen).show(reloadDialog))
		.on("animationend", onAnimationEnd);

	function resetState(defaultState) {
		state.incomplete = settings.characters.length;
		state.modalOpen = false;

		state.characters.splice(
			0,
			Infinity,
			...settings.characters
				.concat(settings.characters)
				.map((character) =>
					watch({
						...character,
						state: defaultState,
						animating: false,
						order: Math.random(),
					})
				)
				.toSorted((a, b) => a.order - b.order)
		);
	}

	function onClick(entry) {
		return () => {
			if (entry.value.state === "matched") return;

			let isFlipped = entry.value.state === "flipped";

			entry.value.animating = true;

			if (isFlipped && state.previousStack.length === 1) {
				entry.value.state = "covered";
			} else {
				entry.value.state = "flipped";

				if (!state.previousStack.includes(entry.value)) {
					state.previousStack.push(entry.value);
				}
			}

			state.resolvePrevious?.(true);
		};
	}

	function onAnimationEnd() {
		if (state.previousStack.length === 2) {
			let localStack = [...state.previousStack];
			let matched = localStack[0].name === localStack[1].name;

			state.previousStack = [];

			if (!matched) {
				let {promise, resolve} = Promise.withResolvers();

				state.resolvePrevious = resolve;

				promise.then((early) => {
					for (let model of localStack) {
						model.state = "covered";
						model.animating = false;
					}

					if (!early) {
						trySong(settings.songs?.cover);
					}
				});

				trySong(settings.songs?.reveal);

				setTimeout(resolve, 2_000, false);
			} else {
				for (let model of localStack) {
					model.state = "matched";
					model.animating = false;
				}

				state.incomplete -= 1;

				if (state.incomplete === 0) {
					state.incomplete = -1;
					state.modalOpen = true;

					scheduleSong(settings.songs?.win);
				} else {
					trySong(settings.songs?.match);
				}
			}
		} else if (state.previousStack.length === 1) {
			state.previousStack[0].animating = false;

			if (state.previousStack[0].state !== "covered") {
				trySong(settings.songs?.reveal);
			} else {
				state.previousStack = [];

				trySong(settings.songs?.cover);
			}
		}
	}
};
