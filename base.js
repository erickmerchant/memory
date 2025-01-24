import {watch, html, effect} from "vanilla-kit";
import {trySong, scheduleSong} from "audio";

let {span, div, dialog, figure, p, button} = html;

export default function (settings) {
	return (host) => {
		let state = watch({
			incomplete: settings.characters.length,
			previous: null,
			resolvePrevious: null,
			previousArgs: null,
		});

		let characters = settings.characters
			.concat(settings.characters)
			.map((character) => ({...character, order: Math.random()}))
			.toSorted((a, b) => a.order - b.order);
		let buttons = host.find(":scope > button");

		if (buttons.length !== characters.length) return;

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

		let reloadDialog = dialog().nodes(
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
							reloadDialog.deref().close();
						},
						{once: true}
					)
			)
		);

		effect(() => {
			if (state.incomplete === -1) {
				reloadDialog.deref().showModal();
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
}
