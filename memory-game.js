class MemoryGame extends HTMLElement {
	connectedCallback() {
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
			.toSorted((a, b) => a.order - b.order);

		let shadow = this.shadowRoot;
		let cards = shadow.querySelector("memory-cards");

		let previous = null;

		for (let current of cards.querySelectorAll("button")) {
			let character = characters.shift();

			current.addEventListener("click", () => {
				if (current.classList.contains("locked")) return;

				current.classList.toggle("flipped");

				if (previous) {
					if (previous === current) {
						current.classList.remove("flipped");
					} else {
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
							incomplete -= 1;

							if (!incomplete) {
								cards.classList.add("completed");
							} else {
								previous.classList.add("matched");
								current.classList.add("matched");
							}
						}
					}
				}

				previous = previous ? null : current;
			});

			let faces = document.createElement("div");
			let front = document.createElement("span");
			let back = document.createElement("span");
			let text = document.createElement("span");

			faces.className = "faces";
			front.className = "front";
			back.className = "back";
			text.className = "text";

			back.style.setProperty("--front-background", `var(--${character.color}`);

			front.append("🦉");
			text.append(character.text);
			back.append(text);
			faces.append(front, back);
			current.append(faces);
		}
	}
}

customElements.define("memory-game", MemoryGame);
customElements.define("memory-cards", class extends HTMLElement {});
