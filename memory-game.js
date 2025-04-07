import "handcraft/dom/_nodes.js";
import "handcraft/dom/append.js";
import "handcraft/dom/aria.js";
import "handcraft/dom/classes.js";
import "handcraft/dom/effect.js";
import "handcraft/dom/find.js";
import "handcraft/dom/on.js";
import "handcraft/dom/once.js";
import "handcraft/dom/styles.js";
import "handcraft/dom/text.js";
import {define} from "handcraft/define.js";
import {html} from "handcraft/dom.js";
import {watch} from "handcraft/reactivity.js";
import {each} from "handcraft/each.js";
import {when} from "handcraft/when.js";
import {trySong, scheduleSong} from "audio";

let {span: SPAN, div: DIV, dialog: DIALOG, p: P, button: BUTTON} = html;

export default (settings) =>
	define("memory-game").connected((host) => {
		let buttons = host.find(`:scope > button`);
		let state = watch({
			incomplete: null,
			modalOpen: false,
			characters: watch([]),
			previous: null,
		});

		resetState();

		let btns = each(state.characters).map((current, index) => {
			let btn = buttons[index()] ?? BUTTON();
			let faces = DIV()
				.classes("faces")
				.styles({
					"--turns": () => current.total,
					"--duration": () => current.latest,
					"--background": () => `var(--${current.color})`,
				})
				.append(
					SPAN().classes("front", "face").text("🦉"),
					SPAN()
						.classes("back", "face")
						.append(
							SPAN()
								.classes("text")
								.text(() => current.text)
						)
				);

			return btn
				.aria({
					label: () => (current.total % 2 === 0 ? "owl" : current.name),
				})
				.append(faces)
				.on("click", () => {
					if (!current.interactive) return;

					if (!current.revealed) {
						if (state.previous) {
							let previous = state.previous;

							turn(current, 1);

							trySong(settings.songs.reveal);

							current.interactive = false;
							previous.interactive = false;

							if (current.text === state.previous.text) {
								btn.once("transitionend", () => {
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
								});
							} else {
								btn.once("transitionend", () => {
									setTimeout(() => {
										turn(current, 1);
										turn(previous, 1);

										current.interactive = true;
										previous.interactive = true;

										trySong(settings.songs.cover);
									}, 1000);
								});
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
				});
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

		host.append(
			btns,
			when((prev) => prev || state.modalOpen).show(reloadDialog)
		);

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
	});
