import {watch, $, html} from "vanilla-kit";

let {div, span} = html;

class MemoryGame extends HTMLElement {
	connectedCallback() {
		let state = watch({completed: false});

		let characters = [
			{text: "🐰", color: "gray"},
			{text: "🐶", color: "blue"},
			{text: "🐸", color: "green"},
			{text: "🐱", color: "yellow"},
			{text: "🦊", color: "orange"},
			{text: "🐻", color: "red"},
		];
		let incomplete = 6;

		characters = characters
			.concat(characters)
			.map((character) => ({...character, order: Math.random()}))
			.toSorted((a, b) => a.order - b.order)
			.map((c) => watch({...c, locked: false, flipped: false}));

		let shadow = this.shadowRoot;
		let cards = shadow.querySelectorAll("button");

		let first = null;

		for (let i = 0; i < cards.length; i++) {
			let card = cards[i];
			let character = characters[i];

			$(card)
				.on("click", () => {
					let current = character;

					if (current.locked) return;

					current.flipped = !current.flipped;

					if (first) {
						if (first === current) {
							current.flipped = false;
						} else {
							first.locked = true;
							current.locked = true;

							if (first.text !== current.text) {
								setTimeout(
									(first, current) => {
										first.flipped = false;
										first.locked = false;
										current.flipped = false;
										current.locked = false;
									},
									1000,
									first,
									current
								);
							} else {
								incomplete -= 1;

								if (!incomplete) {
									state.completed = true;
								} else {
									first.matched = true;
									current.matched = true;
								}
							}
						}
					}

					first = first ? null : current;
				})
				.children(
					div()
						.classes("faces", {
							matched: () => character.matched,
							completed: () => state.completed,
							flipped: () => character.flipped,
						})
						.children(
							span().classes("front").children("🦉"),
							span()
								.classes("back")
								.styles({"--front-background": `var(--${character.color}`})
								.children(span().classes("text").children(character.text))
						)
				);
		}
	}
}

customElements.define("memory-game", MemoryGame);
customElements.define("memory-cards", class extends HTMLElement {});
