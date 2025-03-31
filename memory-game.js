import "handcraft/dom/_nodes.js";
import "handcraft/dom/append.js";
import "handcraft/dom/aria.js";
import "handcraft/dom/classes.js";
import "handcraft/dom/effect.js";
import "handcraft/dom/find.js";
import "handcraft/dom/on.js";
import "handcraft/dom/styles.js";
import "handcraft/dom/text.js";
import {html} from "handcraft/dom.js";
import {watch} from "handcraft/reactivity.js";
import {each} from "handcraft/each.js";
import {when} from "handcraft/when.js";
import {trySong, scheduleSong} from "audio";

let {span: SPAN, div: DIV, dialog: DIALOG, p: P, button: BUTTON} = html;

export default (settings) => (host) => {
	let buttons = host.find(`:scope > button`);
	let state = watch({
		incomplete: null,
		modalOpen: false,
		characters: watch([]),
		previous: null,
	});

	resetState();

	let btns = each(state.characters).map((entry) => {
		let btn = buttons[entry.index] ?? BUTTON();
		let faces = DIV()
			.classes("faces")
			.styles({
				"--turns": () => entry.value.total,
				"--duration": () => entry.value.latest,
				"--background": () => `var(--${entry.value.color})`,
			})
			.append(
				SPAN().classes("front", "face").text("🦉"),
				SPAN()
					.classes("back", "face")
					.append(
						SPAN()
							.classes("text")
							.text(() => entry.value.text)
					)
			)
			.on("transitionend", () => {
				entry.value.aftertransition?.();

				entry.value.aftertransition = null;
			});

		return btn
			.aria({
				label: () => (entry.value.total % 2 === 0 ? "owl" : entry.value.name),
			})
			.append(faces)
			.on("click", onClick(entry));
	});

	let reloadDialog = () =>
		DIALOG()
			.classes("reload-dialog")
			.append(
				DIV()
					.classes("card")
					.append(
						DIV()
							.classes("faces")
							.append(SPAN().classes("front", "face").text("🦉"))
					),
				DIV()
					.classes("bubble")
					.append(
						P().text("Hoo-ray! You found all my owl friends."),
						BUTTON()
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

	host.append(btns, when((prev) => prev || state.modalOpen).show(reloadDialog));

	function resetState() {
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
						interactive: true,
						order: Math.random(),
						aftertransition: null,
						total: 0,
						latest: 0,
						revealed: false,
					})
				)
				.toSorted((a, b) => a.order - b.order)
		);
	}

	function turn(model, val) {
		model.total += val;

		model.latest = val ?? 0;

		model.revealed = model.total % 2;
	}

	function onClick(entry) {
		return () => {
			let current = entry.value;

			if (!current.interactive) return;

			if (!current.revealed) {
				if (state.previous) {
					let previous = state.previous;

					turn(current, 1);

					trySong(settings.songs.reveal);

					current.interactive = false;
					previous.interactive = false;

					if (current.text === state.previous.text) {
						current.aftertransition = () => {
							turn(current, 2);
							turn(previous, 2);

							state.incomplete -= 1;

							if (state.incomplete === 0) {
								scheduleSong(settings.songs.win);

								for (let character of state.characters) {
									turn(character, 6);
								}

								state.modalOpen = true;

								state.incomplete = -1;
							} else {
								scheduleSong(settings.songs.match);
							}
						};
					} else {
						current.aftertransition = () => {
							setTimeout(() => {
								turn(current, 1);
								turn(previous, 1);

								current.interactive = true;
								previous.interactive = true;

								trySong(settings.songs.cover);
							}, 1000);
						};
					}

					state.previous = null;
				} else {
					turn(current, 1);

					trySong(settings.songs.reveal);

					state.previous = current;
				}
			} else {
				turn(current, 1);

				state.previous = null;

				trySong(settings.songs.cover);
			}
		};
	}
};
