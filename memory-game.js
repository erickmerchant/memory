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
		let current = e.currentTarget;

		let faces = current.querySelector(".faces");

		current.classList.add("clicked");

		if (current.classList.contains("matched")) return;

		let flipped = current.classList.toggle("flipped");

		if (!flipped) {
			if (this.#previous === current) {
				this.#previous = null;
			}
		} else if (this.#previous) {
			let matched = this.#previous.textContent === current.textContent;
			let previous = this.#previous;

			faces.addEventListener(
				"animationend",
				(e) => {
					if (!matched) {
						setTimeout(() => {
							previous.classList.remove("flipped");
							current.classList.remove("flipped");
						}, 1_000);
					} else {
						this.#incomplete -= 1;

						previous.classList.add("matched");
						current.classList.add("matched");

						if (!this.#incomplete) {
							this.addEventListener(
								"animationend",
								() => {
									this.classList.add("completed");

									setTimeout(() => {
										let reload = this.querySelector("#reload");

										if (reload) {
											reload.showModal();

											reload.querySelector("button")?.addEventListener(
												"click",
												() => {
													window.location.reload();
												},
												{once: true}
											);
										}
									}, 5_000);
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
					capture: true,
				}
			);

			this.#previous = null;
		} else {
			this.#previous = current;
		}
	}
}

customElements.define("memory-game", MemoryGame);
