class MemoryGame extends HTMLElement {
	#incomplete = 0;

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
			let faces = document.createElement("div");
			let front = document.createElement("span");
			let back = document.createElement("span");
			let text = document.createElement("span");

			current.addEventListener("click", () => {
				if (current.classList.contains("locked")) return;

				current.classList.toggle("flipped", previous !== current);

				if (previous && previous !== current) {
					faces.addEventListener(
						"transitionend",
						this.#getTransitionEnd(current, previous, cards),
						{once: true, capture: true}
					);
				}

				previous = previous ? null : current;
			});

			faces.className = "faces";
			front.className = "front";
			back.className = "back";
			text.className = "text";

			back.style.setProperty("--back-background", `var(--${character.color}`);

			front.append("🦉");
			text.append(character.text);
			back.append(text);
			faces.append(front, back);
			current.append(faces);
		}
	}

	#getTransitionEnd(current, previous, cards) {
		return () => {
			previous.classList.add("locked");
			current.classList.add("locked");

			if (previous.textContent !== current.textContent) {
				setTimeout(
					(previous, current) => {
						previous.classList.remove("flipped");
						previous.classList.remove("locked");
						current.classList.remove("flipped");
						current.classList.remove("locked");
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
						"transitionend",
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
