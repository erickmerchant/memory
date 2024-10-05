import * as Tone from "https://cdn.jsdelivr.net/npm/tone@15.0.4/+esm";

let synth = new Tone.Synth().toDestination();

let sounds = new Proxy(
	{
		reveal: {
			notes: ["C4", "E4", "G4"],
			duration: 0.2,
		},
		match: {notes: ["C4", "D4", "C4", "E4", "G4", "C4"], duration: 0.8},
		win: {
			notes: [
				"C4",
				"C4",
				"G4",
				"F4",
				"E4",
				"D4",
				"E4",
				"F4",
				"C4",
				"C4",
				"G4",
				"F4",
				"E4",
				"D4",
				"C4",
			],
			duration: 2.6,
		},
	},
	{
		get(sounds, prop) {
			let {notes, duration} = sounds[prop];

			return () => {
				let now = Tone.now();
				let stepTime = Number((duration / notes.length).toFixed(2));
				let progress = 0;

				for (let note of notes) {
					synth.triggerAttackRelease(note, stepTime, now + progress);

					progress += stepTime;
				}
			};
		},
	}
);

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

			if (this.#previous === current) {
				this.#previous = null;
			}
		} else if (this.#previous) {
			current.className = "flipped";

			let matched = this.#previous.textContent === current.textContent;
			let previous = this.#previous;

			if (matched) {
				this.#incomplete -= 1;

				if (this.#incomplete) {
					sounds.match();
				} else {
					sounds.win();
				}
			} else {
				sounds.reveal();
			}

			faces.addEventListener(
				"animationend",
				() => {
					if (!matched) {
						this.#queue.push(() => {
							current.className = "covered";
							previous.className = "covered";
						});

						setTimeout(() => this.#queue.shift()?.(), 2_000);
					} else {
						current.className = "matched";
						previous.className = "matched";

						if (!this.#incomplete) {
							this.addEventListener(
								"animationend",
								() => {
									this.className = "completed";

									let reloadDialog = this.querySelector("dialog");

									if (reloadDialog) {
										reloadDialog.showModal();

										reloadDialog
											.querySelector("#playAgain")
											?.addEventListener?.(
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

			sounds.reveal();

			this.#previous = current;
		}
	}
}

customElements.define("memory-game", MemoryGame);
