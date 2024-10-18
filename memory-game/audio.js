let audio;
let lastSong = Promise.resolve();
let isPlaying = false;

function initApi() {
	let context = new AudioContext();

	let oscillatorNode = new OscillatorNode(context);
	let gainNode = new GainNode(context);
	let wave = context.createPeriodicWave(
		[0, 1, 0.1, 0.1, 0.01, 0.01, 0.001, 0.001, 0.0001, 0.1],
		[0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.1],
		{
			disableNormalization: false,
		}
	);

	oscillatorNode.connect(gainNode).connect(context.destination);

	oscillatorNode.setPeriodicWave(wave);

	oscillatorNode.start(context.currentTime);

	return {context, gain: gainNode.gain, frequency: oscillatorNode.frequency};
}

export function trySong(song) {
	if (isPlaying) return;

	isPlaying = true;

	audio ??= initApi();

	let time = audio.context.currentTime;
	let length = 0;

	for (let [note, len] of song) {
		length += len;

		audio.frequency.setValueAtTime(note, time);

		audio.gain.linearRampToValueAtTime(1, time);

		time += len;

		audio.gain.linearRampToValueAtTime(0, time);
	}

	let {promise, resolve} = Promise.withResolvers();

	setTimeout(resolve, 1000 * length);

	lastSong = promise.then(() => {
		isPlaying = false;
	});
}

export function scheduleSong(song) {
	lastSong.then(() => {
		trySong(song);
	});
}
