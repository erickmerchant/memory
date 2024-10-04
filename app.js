import {Howl} from "https://esm.sh/howler";

const SOUNDS = {
	// flip: makeSound("./sounds/card_flip.mp3"),
	match: makeSound("./sounds/match_correct.mp3"),
	win: makeSound("./sounds/game_complete.mp3"),
};

let CHARACTERS = [
	{text: "🐰", color: "gray"},
	{text: "🐶", color: "blue"},
	{text: "🐸", color: "green"},
	{text: "🐱", color: "yellow"},
	{text: "🦊", color: "orange"},
	{text: "🐻", color: "red"},
];

class MemoryGame extends HTMLElement {
	#incomplete = CHARACTERS.length;
	#previous;
	#queue = [];

	connectedCallback() {
		let characters = CHARACTERS.concat(CHARACTERS)
			.map((character) => ({...character, order: Math.random()}))
			.toSorted((a, b) => a.order - b.order);

		for (let current of this.querySelectorAll(":scope > button")) {
			let character = characters.shift();
			let front = document.createElement("span");

			front.className = "front";
			front.append("🦉");

			let text = document.createElement("span");

			text.className = "text";
			text.append(character.text);

			let back = document.createElement("span");

			back.className = "back";
			back.style.setProperty("--back-background", `var(--${character.color}`);
			back.append(text);

			let faces = document.createElement("div");

			faces.className = "faces";
			faces.append(front, back);

			current.append(faces);
			current.addEventListener("click", this);
		}
	}

	handleEvent(e) {
		for (let i = 0; i < this.#queue.length; i++) {
			let cb = this.#queue[i];

			if (cb) cb();

			this.#queue[i] = null;
		}

		let current = e.currentTarget;

		let faces = current.querySelector(".faces");

		if (current.className === "matched") return;

		let flipped = current.className === "flipped";

		if (flipped) {
			current.className = "covered";

			// SOUNDS.flip.play();

			if (this.#previous === current) {
				this.#previous = null;
			}
		} else if (this.#previous) {
			current.className = "flipped";

			// SOUNDS.flip.play();

			let matched = this.#previous.textContent === current.textContent;
			let previous = this.#previous;

			faces.addEventListener(
				"animationend",
				() => {
					if (!matched) {
						this.#queue.push(() => {
							current.className = "covered";
							previous.className = "covered";

							// SOUNDS.flip.play();
							// SOUNDS.flip.play();
						});

						setTimeout(() => this.#queue.shift()?.(), 2_000);
					} else {
						this.#incomplete -= 1;

						current.className = "matched";
						previous.className = "matched";

						SOUNDS.match.play();

						if (!this.#incomplete) {
							this.addEventListener(
								"animationend",
								() => {
									this.className = "completed";

									SOUNDS.win.play();

									let reload = this.querySelector("dialog");

									if (reload) {
										reload.showModal();

										reload.querySelector("button")?.addEventListener?.(
											"click",
											() => {
												window.location.reload();
											},
											{once: true}
										);
									}
								},
								{
									once: true,
									capture: true,
								}
							);
						}
					}
				},
				{
					once: true,
				}
			);

			this.#previous = null;
		} else {
			current.className = "flipped";

			// SOUNDS.flip.play();

			this.#previous = current;
		}
	}
}

customElements.define("memory-game", MemoryGame);

function makeSound(url) {
	return new Howl({
		src: [url],
	});
}
