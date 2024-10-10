const WAVEFORM = {
	real: [0, 1, 0.1, 0.1, 0.01, 0.01, 0.001, 0.001, 0.0001, 0.1],
	imag: [0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.1],
};

const FREQUENCIES = {
	A: 220,
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

let audio;
let lastSong = Promise.resolve();
let isPlaying = false;
let step = 0.1;

function initApi() {
	let context = new AudioContext();

	let oscillatorNode = new OscillatorNode(context);
	let gainNode = new GainNode(context);
	let wave = context.createPeriodicWave(WAVEFORM.real, WAVEFORM.imag, {
		disableNormalization: false,
	});

	oscillatorNode.connect(gainNode).connect(context.destination);

	oscillatorNode.setPeriodicWave(wave);

	oscillatorNode.start(context.currentTime);

	return {context, gain: gainNode.gain, frequency: oscillatorNode.frequency};
}

export function trySong(key) {
	if (isPlaying) return;

	let song = SONGS[key].split(" ");

	isPlaying = true;

	audio ??= initApi();

	let time = audio.context.currentTime;
	let length = 0;

	for (let part of song) {
		let len = part.length;
		let note = part.charAt(0);

		length += len;

		audio.frequency.setValueAtTime(FREQUENCIES[note], time);

		audio.gain.linearRampToValueAtTime(1, time);

		time += step * len;

		audio.gain.linearRampToValueAtTime(0, time);
	}

	let {promise, resolve} = Promise.withResolvers();

	setTimeout(resolve, 100 * length);

	lastSong = promise.then(() => {
		isPlaying = false;
	});
}

export function scheduleSong(key) {
	lastSong.then(() => {
		trySong(key);
	});
}
