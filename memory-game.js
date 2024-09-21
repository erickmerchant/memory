class MemoryGame extends HTMLElement {
	#incomplete = 0;
	#locked = new Set();

	connectedCallback() {
		let characters = [
			{text: "🐰", color: "gray"},
			{text: "🐶", color: "blue"},
			{text: "🐸", color: "green"},
			{text: "🐱", color: "yellow"},
			{text: "🦊", color: "orange"},
			{text: "🐻", color: "red"},
		];

		this.#incomplete = characters.length;

		characters = characters
			.concat(characters)
			.map((character) => ({...character, order: Math.random()}))
			.toSorted((a, b) => a.order - b.order);

		let shadow = this.shadowRoot;
		let cards = shadow.querySelector("memory-cards");

		let previous = null;

		for (let current of cards.querySelectorAll("button")) {
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
			current.addEventListener("click", () => {
				current.classList.add("clicked");

				if (this.#locked.has(current)) return;

				current.classList.toggle("flipped", previous !== current);

				if (previous && previous !== current) {
					faces.addEventListener(
						"animationend",
						this.#getAnimationEnd(current, previous, cards),
						{once: true, capture: true}
					);
				}

				previous = previous ? null : current;
			});
		}
	}

	#getAnimationEnd(current, previous, cards) {
		return () => {
			this.#locked.add(current);
			this.#locked.add(previous);

			if (previous.textContent !== current.textContent) {
				setTimeout(
					(previous, current) => {
						this.#locked.delete(current);
						this.#locked.delete(previous);

						previous.classList.remove("flipped");
						current.classList.remove("flipped");
					},
					1000,
					previous,
					current
				);
			} else {
				this.#incomplete -= 1;

				previous.classList.add("matched");
				current.classList.add("matched");

				if (!this.#incomplete) {
					cards.addEventListener(
						"animationend",
						() => {
							cards.classList.add("completed");
						},
						{once: true, capture: true}
					);
				}
			}
		};
	}
}

customElements.define("memory-game", MemoryGame);
customElements.define("memory-cards", class extends HTMLElement {});
