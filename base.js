import {trySong, scheduleSong} from "audio";
import {html} from "handcraft/dom.js";
import {watch} from "handcraft/reactivity.js";
import {each} from "handcraft/each.js";
import "handcraft/element/aria.js";
import "handcraft/element/classes.js";
import "handcraft/element/effect.js";
import "handcraft/element/nodes.js";
import "handcraft/element/observe.js";
import "handcraft/element/on.js";
import "handcraft/element/styles.js";
import "handcraft/element/text.js";

let {span, div, dialog, figure, p, button} = html;

export default (settings) => (host) => {
	let observed = host.observe();
	let buttons = observed.find(
		`:scope:has(button:nth-child(${settings.characters.length * 2})) > button`
	);
	let state = watch({
		incomplete: null,
		previous: null,
		resolvePrevious: null,
		previousArgs: null,
		modalOpen: false,
		characters: watch([]),
	});

	resetState();

	let btns = each(state.characters)
		.zip(buttons)
		.map((entry, btn = button()) => {
			let faces = div()
				.classes("faces")
				.nodes(
					span().classes("front", "face").text("🦉"),
					span()
						.classes("back", "face")
						.styles({"--back-background": () => `var(--${entry.value.color}`})
						.nodes(
							span()
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
					covered: () => entry.value.state === "covered",
					flipped: () => entry.value.state === "flipped",
					matched: () => entry.value.state === "matched",
				})
				.nodes(faces)
				.on("click", onClick(entry));
		});

	let reloadDialog = dialog()
		.nodes(
			figure().classes("face").text("🦉"),
			div().nodes(
				p().text("Hoo-ray! You found all my owl friends."),
				button()
					.classes("play-again")
					.text("Play Again!")
					.on("click", resetState)
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
		.classes({completed: () => state.incomplete === -1})
		.nodes(btns, reloadDialog)
		.on("animationend", onAnimationEnd);

	function resetState() {
		state.incomplete = settings.characters.length;
		state.modalOpen = false;

		state.characters.splice(
			0,
			Infinity,
			...settings.characters
				.concat(settings.characters)
				.map((character) =>
					watch({...character, state: "", order: Math.random()})
				)
				.toSorted((a, b) => a.order - b.order)
		);
	}

	function onClick(entry) {
		return () => {
			if (entry.value.state === "matched") return;

			let isFlipped = entry.value.state === "flipped";

			if (isFlipped) {
				entry.value.state = "covered";

				if (state.previous === entry.value) {
					state.previous = null;
				}
			} else {
				entry.value.state = "flipped";

				if (state.previous) {
					let matched = state.previous.text === entry.value.text;

					state.previousArgs = {matched, models: [state.previous, entry.value]};

					if (!matched) {
						trySong(settings.songs?.reveal ?? []);
					}

					state.previous = null;
				} else {
					trySong(settings.songs?.reveal ?? []);

					state.previous = entry.value;
				}
			}

			state.resolvePrevious?.();
		};
	}

	function onAnimationEnd(e) {
		if (state.previousArgs) {
			let {matched, models} = state.previousArgs;

			state.previousArgs = null;

			if (!matched) {
				let {promise, resolve} = Promise.withResolvers();

				state.resolvePrevious = resolve;

				promise.then(() => {
					for (let model of models) {
						model.state = "covered";
					}

					trySong(settings.songs?.noMatch ?? []);
				});

				setTimeout(resolve, 2_000);
			} else {
				for (let model of models) {
					model.state = "matched";
				}

				state.incomplete -= 1;

				if (state.incomplete === 0) {
					state.incomplete = -1;
					state.modalOpen = true;

					scheduleSong(settings.songs?.win ?? []);
				} else {
					trySong(settings.songs?.match ?? []);
				}
			}
		}
	}
};
