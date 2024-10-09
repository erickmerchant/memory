const WAVEFORM = {
	real: [0, 1, 0.1, 0.1, 0.01, 0.01, 0.001, 0.001, 0.0001, 0.1],
	imag: [0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.1],
};

const FREQUENCIES = {
	A: 110,
	B: 246,
	C: 261,
	D: 293,
	E: 329,
	F: 349,
	G: 392,
};

const SONGS = {
	reveal: "C E G",
	match: "CC CC G F E CC",
	noMatch: "A AA",
	win: "CC CC GG F E D E CC CC GG F E D E CC",
};

let audioContext;
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
	let length = 0;

	for (let part of song) {
		let len = part.length;
		let note = part.charAt(0);

		length += len;

		oscillator.frequency.setValueAtTime(FREQUENCIES[note], time);

		gainNode.gain.linearRampToValueAtTime(1, time);

		time += step * len;

		gainNode.gain.linearRampToValueAtTime(0, time);
	}

	oscillator.stop(time);

	let {promise, resolve} = Promise.withResolvers();

	setTimeout(resolve, 100 * length);

	lastSong = promise.then(() => {
		currentlyPlaying -= 1;
	});
}

export function trySong(key) {
	if (currentlyPlaying === 0) {
		playSong(key);
	}
}

export function scheduleSong(key) {
	lastSong.then(() => {
		playSong(key);
	});
}
