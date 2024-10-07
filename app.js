const WAVEFORM = {
	real: [0, 1, -0.01, 0.3, -0.01, 0.1, -0.001, 0.001, -0.0001, 0.1],
	imag: [0, -0.005, 0.005, -0.005, 0.005, -0.005, 0.005, -0.005, 0.005, 0],
};

const FREQUENCIES = {
	C: 261.63,
	D: 293.66,
	E: 329.63,
	F: 349.23,
	G: 392,
	A: 440,
	B: 493.88,
};

const CHARACTERS = [
	{text: "🐰", color: "gray"},
	{text: "🐶", color: "blue"},
	{text: "🐸", color: "green"},
	{text: "🐱", color: "yellow"},
	{text: "🦊", color: "orange"},
	{text: "🐻", color: "red"},
];

let audio;
let soundIsPlaying = false;

let songs = new Proxy(
	{
		reveal: {
			notes: ["C", "E", "G"],
			duration: 0.2,
		},
		match: {notes: ["C", "D", "C", "E", "G", "C"], duration: 0.8},
		win: {
			notes: [
				"C",
				"C",
				"G",
				"F",
				"E",
				"D",
				"E",
				"F",
				"C",
				"C",
				"G",
				"F",
				"E",
				"D",
				"C",
			],
			duration: 2,
		},
	},
	{
		get(songs, prop) {
			let song = songs[prop];

			return () => {
				if (soundIsPlaying) return;

				soundIsPlaying = true;

				audio = audio ?? new AudioContext();

				let step = Number((song.duration / song.notes.length).toFixed(3));

				let vco = audio.createOscillator();
				let vca = audio.createGain();
				let wave = audio.createPeriodicWave(WAVEFORM.real, WAVEFORM.imag, {
					disableNormalization: true,
				});

				vco.setPeriodicWave(wave);
				// vco.type = "triangle";
				vco.connect(vca);

				vca.connect(audio.destination);

				vca.gain.setValueAtTime(0, audio.currentTime);

				vco.start(audio.currentTime);

				let time = audio.currentTime;

				for (let note of song.notes) {
					vco.frequency.setValueAtTime(FREQUENCIES[note], time);

					vca.gain.linearRampToValueAtTime(2, time);

					time += step;

					vca.gain.linearRampToValueAtTime(0, time);
				}

				vco.stop(time);

				setTimeout(() => {
					soundIsPlaying = false;
				}, song.duration * 1_000);
			};
		},
	}
);

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
					songs.match();
				} else {
					songs.win();
				}
			} else {
				songs.reveal();
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
						if (this.#incomplete) {
							current.className = "matched";
							previous.className = "matched";
						} else {
							this.className = "completed";

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

								reloadDialog.querySelector("#stopPlaying")?.addEventListener?.(
									"click",
									() => {
										reloadDialog.close();
									},
									{once: true}
								);
							}
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

			songs.reveal();

			this.#previous = current;
		}
	}
}

customElements.define("memory-game", MemoryGame);
