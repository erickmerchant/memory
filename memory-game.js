class MemoryGame extends HTMLElement {
	#incomplete = 0;
	#locked = new Set();
	#previous;

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

		for (let current of this.querySelectorAll("button")) {
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
		if (e.type === "click") {
			let current = e.currentTarget;
			let faces = current.querySelector(".faces");

			current.classList.add("clicked");

			if (this.#locked.has(current)) return;

			current.classList.toggle("flipped", this.#previous !== current);

			if (this.#previous && this.#previous !== current) {
				faces.addEventListener("animationend", this, {
					once: true,
					capture: true,
				});
			} else {
				this.#previous = current;
			}
		}

		if (e.type === "animationend") {
			let current = e.currentTarget.closest("button");

			if (current) {
				this.#locked.add(current);
				this.#locked.add(this.#previous);

				if (this.#previous.textContent !== current.textContent) {
					setTimeout(
						(previous, current) => {
							this.#locked.delete(current);
							this.#locked.delete(previous);

							previous.classList.remove("flipped");
							current.classList.remove("flipped");
						},
						1000,
						this.#previous,
						current
					);
				} else {
					this.#incomplete -= 1;

					this.#previous.classList.add("matched");
					current.classList.add("matched");

					if (!this.#incomplete) {
						this.addEventListener("animationend", this, {
							once: true,
							capture: true,
						});
					}
				}

				this.#previous = null;
			} else {
				this.classList.add("completed");
			}
		}
	}
}

customElements.define("memory-game", MemoryGame);
