const CHARACTERS = [
	{text: "🐰", name: "rabbit", color: "gray"},
	{text: "🐶", name: "dog", color: "blue"},
	{text: "🐸", name: "frog", color: "green"},
	{text: "🐱", name: "cat", color: "yellow"},
	{text: "🦊", name: "fox", color: "orange"},
	{text: "🐻", name: "bear", color: "red"},
];

const WAVEFORM = {
	real: [0, 1, 0.1, 0.1, 0.01, 0.01, 0.001, 0.001, 0.0001, 0.1],
	imag: [0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.1],
};

const FREQUENCIES = {
	C: 261,
	D: 293,
	E: 329,
	F: 349,
	G: 392,
	A: 440,
	B: 493,
};

const SONGS = {
	reveal: "C E G",
	match: "C D C E G C",
	noMatch: "A A",
	win: "C C G F E D E F C C G F E D C",
};

let lastSong = Promise.resolve();
let currentlyPlaying = 0;

function playSong(key) {
	let song = SONGS[key].split(" ");

	currentlyPlaying += 1;

	audioContext = audioContext ?? new AudioContext();

	let step = 0.1;
	let oscillator = new OscillatorNode(audioContext);
	let gainNode = new GainNode(audioContext);
	let wave = audioContext.createPeriodicWave(WAVEFORM.real, WAVEFORM.imag, {
		disableNormalization: false,
	});

	oscillator.connect(gainNode).connect(audioContext.destination);

	oscillator.setPeriodicWave(wave);

	oscillator.start(audioContext.currentTime);

	let time = audioContext.currentTime;

	for (let note of song) {
		oscillator.frequency.setValueAtTime(FREQUENCIES[note], time);

		gainNode.gain.linearRampToValueAtTime(1, time);

		time += step;

		gainNode.gain.linearRampToValueAtTime(0, time);
	}

	oscillator.stop(time);

	let {promise, resolve} = Promise.withResolvers();

	setTimeout(() => {
		resolve();

		currentlyPlaying -= 1;
	}, 100 * song.length);

	lastSong = promise;
}

function trySong(key) {
	if (currentlyPlaying === 0) {
		playSong(key);
	}
}

function scheduleSong(key) {
	lastSong.then(() => {
		playSong(key);
	});
}

let audioContext;

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
						this.#queue.push(() => {
							current.className = "covered";
							current.ariaLabel = "owl";

							previous.className = "covered";
							previous.ariaLabel = "owl";

							trySong("noMatch");
						});

						setTimeout(() => this.#queue.shift()?.(false), 2_000);
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

		for (let i = 0; i < this.#queue.length; i++) {
			let cb = this.#queue[i];

			if (cb) cb(true);

			this.#queue[i] = null;
		}
	}
}

customElements.define("memory-game", MemoryGame);
