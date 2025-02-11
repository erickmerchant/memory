import {trySong, scheduleSong} from "audio";
import {html} from "handcraft/dom.js";
import {watch, effect} from "handcraft/reactivity.js";
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
	let state = watch({
		incomplete: settings.characters.length,
		previous: null,
		resolvePrevious: null,
		previousArgs: null,
		modalOpen: false,
	});

	let characters = settings.characters
		.concat(settings.characters)
		.map((character) => ({...character, order: Math.random()}))
		.toSorted((a, b) => a.order - b.order);
	let observed = host.observe();
	let buttons = observed.find(
		`:scope:has(button:nth-child(${characters.length})) > button`
	);

	for (let current of buttons) {
		let character = characters.shift();
		let model = watch({
			state: "",
			...character,
		});
		let faces = div()
			.classes("faces")
			.nodes(
				span().classes("front").text("🦉"),
				span()
					.classes("back")
					.styles({"--back-background": `var(--${character.color}`})
					.nodes(span().classes("text").text(character.text))
			);

		current
			.aria({label: () => (model.state === "covered" ? "owl" : model.name)})
			.classes({
				covered: () => model.state === "covered",
				flipped: () => model.state === "flipped",
				matched: () => model.state === "matched",
			})
			.nodes(faces)
			.on("click", onClick(model));
	}

	let reloadDialog = dialog()
		.nodes(
			figure().text("🦉"),
			div().nodes(
				p().text("Hoo-ray! You found all my owl friends. Play again?"),
				button()
					.classes("play-again")
					.text("Yes")
					.on(
						"click",
						() => {
							window.location.reload();
						},
						{once: true}
					),
				button()
					.classes("stop-playing")
					.text("No")
					.on(
						"click",
						() => {
							state.modalOpen = false;
						},
						{once: true}
					)
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
		.on("animationend", onAnimationEnd)
		.classes({completed: () => state.incomplete === -1})
		.nodes(reloadDialog);

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

				trySong(settings.songs?.match ?? []);
			}
		} else if (state.incomplete === 0) {
			state.incomplete = -1;
			state.modalOpen = true;

			scheduleSong(settings.songs?.win ?? []);
		}
	}

	function onClick(current) {
		return () => {
			if (current.state === "matched") return;

			let isFlipped = current.state === "flipped";

			if (isFlipped) {
				current.state = "covered";

				if (state.previous === current) {
					state.previous = null;
				}
			} else {
				current.state = "flipped";

				if (state.previous) {
					let matched = state.previous.text === current.text;

					state.previousArgs = {matched, models: [state.previous, current]};

					if (!matched) {
						trySong(settings.songs?.reveal ?? []);
					}

					state.previous = null;
				} else {
					trySong(settings.songs?.reveal ?? []);

					state.previous = current;
				}
			}

			state.resolvePrevious?.();
		};
	}
};
