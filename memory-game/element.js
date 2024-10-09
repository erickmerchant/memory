import {trySong, scheduleSong} from "memory-game/audio";

const CHARACTERS = [
	{text: "🐰", name: "rabbit", color: "gray"},
	{text: "🐶", name: "dog", color: "blue"},
	{text: "🐸", name: "frog", color: "green"},
	{text: "🐱", name: "cat", color: "yellow"},
	{text: "🦊", name: "fox", color: "orange"},
	{text: "🐻", name: "bear", color: "red"},
];

class MemoryGame extends HTMLElement {
	#incomplete = CHARACTERS.length;
	#previous;
	#noMatch;

	connectedCallback() {
		let characters = CHARACTERS.concat(CHARACTERS)
			.map((character) => ({...character, order: Math.random()}))
			.toSorted((a, b) => a.order - b.order);

		for (let current of this.querySelectorAll(":scope > button")) {
			let character = characters.shift();

			current.ariaLabel = "owl";
			current.dataset.name = character.name;

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
		let current = e.currentTarget;

		let faces = current.querySelector(".faces");

		if (current.className === "matched") return;

		let flipped = current.className === "flipped";

		if (flipped) {
			current.className = "covered";
			current.ariaLabel = "owl";

			if (this.#previous === current) {
				this.#previous = null;
			}
		} else if (this.#previous) {
			current.className = "flipped";
			current.ariaLabel = current.dataset.name;

			let matched = this.#previous.textContent === current.textContent;
			let previous = this.#previous;

			if (!matched) {
				trySong("reveal");
			}

			faces.addEventListener(
				"animationend",
				() => {
					if (!matched) {
						let {promise, resolve} = Promise.withResolvers();

						this.#noMatch = resolve;

						promise.then(() => {
							current.className = "covered";
							current.ariaLabel = "owl";

							previous.className = "covered";
							previous.ariaLabel = "owl";

							trySong("noMatch");
						});

						setTimeout(resolve, 2_000);
					} else {
						current.className = "matched";
						current.ariaLabel += " (matched)";

						previous.className = "matched";
						previous.ariaLabel += " (matched)";

						this.#incomplete -= 1;

						trySong("match");

						faces.addEventListener(
							"animationend",
							() => {
								if (this.#incomplete) return;

								this.className = "completed";

								scheduleSong("win");

								let reloadDialog = this.querySelector("dialog");

								if (reloadDialog) {
									reloadDialog.showModal();

									reloadDialog.querySelector("#playAgain")?.addEventListener?.(
										"click",
										() => {
											window.location.reload();
										},
										{once: true}
									);

									reloadDialog
										.querySelector("#stopPlaying")
										?.addEventListener?.(
											"click",
											() => {
												reloadDialog.close();
											},
											{once: true}
										);
								}
							},
							{
								once: true,
							}
						);
					}
				},
				{
					once: true,
				}
			);

			this.#previous = null;
		} else {
			current.className = "flipped";
			current.ariaLabel = current.dataset.name;

			trySong("reveal");

			this.#previous = current;
		}

		this.#noMatch?.();
	}
}

customElements.define("memory-game", MemoryGame);
