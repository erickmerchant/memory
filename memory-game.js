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

		characters = characters
			.concat(characters)
			.map((character) => ({...character, order: Math.random()}))
			.toSorted((a, b) => a.order - b.order);

		let shadow = this.shadowRoot;
		let cards = shadow.querySelectorAll("button");

		let firstCard = null;

		for (let card of cards) {
			let faces = document.createElement("div");
			let front = document.createElement("span");
			let back = document.createElement("span");
			let character = characters.shift();

			front.append("🦉");

			back.append(character.text);

			back.style.setProperty("--front-background", `var(--${character.color}`);

			faces.append(front, back);

			card.append(faces);

			card.addEventListener("click", () => {
				if (card.classList.contains("locked")) return;

				card.classList.toggle("flipped");

				let currentCard = card;

				if (firstCard) {
					if (firstCard === currentCard) {
						firstCard.className = "";
						currentCard.className = "";
					} else {
						firstCard.classList.toggle("locked", true);
						currentCard.classList.toggle("locked", true);

						if (firstCard.textContent !== currentCard.textContent) {
							setTimeout(
								(firstCard, currentCard) => {
									firstCard.className = "";
									currentCard.className = "";
								},
								1000,
								firstCard,
								currentCard
							);
						}
					}
				}

				firstCard = firstCard ? null : currentCard;
			});
		}
	}
}

customElements.define("memory-game", MemoryGame);
