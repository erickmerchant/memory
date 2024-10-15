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
	#resolvePrevious;
	#previousArgs = [];

	#onAnimationEnd = (e) => {
		if (this.#previousArgs.length) {
			let [matched, ...elements] = this.#previousArgs.splice(0, Infinity);

			if (!matched) {
				let {promise, resolve} = Promise.withResolvers();

				this.#resolvePrevious = resolve;

				promise.then(() => {
					for (let element of elements) {
						element.className = "covered";
						element.ariaLabel = "owl";
					}

					trySong("noMatch");
				});

				setTimeout(resolve, 2_000);
			} else {
				for (let element of elements) {
					element.className = "matched";
					element.ariaLabel += " (matched)";
				}

				this.#incomplete -= 1;

				trySong("match");
			}
		} else if (this.#incomplete === 0) {
			this.#incomplete = -1;

			this.className = "completed";

			scheduleSong("win");

			let reloadDialog = this.querySelector("dialog");

			if (reloadDialog) {
				reloadDialog.showModal();
			}
		}
	};

	#onClick = (e) => {
		let current = e.currentTarget;

		if (current.className === "matched") return;

		let isFlipped = current.className === "flipped";

		if (isFlipped) {
			current.className = "covered";
			current.ariaLabel = "owl";

			if (this.#previous === current) {
				this.#previous = null;
			}
		} else {
			current.className = "flipped";
			current.ariaLabel = current.dataset.name;

			if (this.#previous) {
				let matched = this.#previous.textContent === current.textContent;

				this.#previousArgs = [matched, this.#previous, current];

				if (!matched) {
					trySong("reveal");
				}

				this.#previous = null;
			} else {
				trySong("reveal");

				this.#previous = current;
			}
		}

		this.#resolvePrevious?.();
	};

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
			current.addEventListener("click", this.#onClick);
		}

		let reloadDialog = this.querySelector("dialog");

		if (reloadDialog) {
			reloadDialog.querySelector(".play-again")?.addEventListener?.(
				"click",
				() => {
					window.location.reload();
				},
				{once: true}
			);

			reloadDialog.querySelector(".stop-playing")?.addEventListener?.(
				"click",
				() => {
					reloadDialog.close();
				},
				{once: true}
			);
		}

		this.addEventListener("animationend", this.#onAnimationEnd);
	}
}

customElements.define("memory-game", MemoryGame);
