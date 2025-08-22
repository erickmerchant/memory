import type { Song } from "../types.ts";

let audio;
let lastSong = Promise.resolve();
let isPlaying = false;

function initApi() {
  const context = new AudioContext();
  const oscillatorNode = new OscillatorNode(context);
  const gainNode = new GainNode(context);
  const wave = context.createPeriodicWave(
    [
      0,
      1,
      1,
      1,
      0.1,
      0.1,
      0.01,
      0.01,
      0.001,
      0.001,
      0.0001,
      0.1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    [
      0,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    {
      disableNormalization: false,
    },
  );

  oscillatorNode.connect(gainNode).connect(context.destination);

  oscillatorNode.setPeriodicWave(wave);

  oscillatorNode.start(context.currentTime);

  return { context, gain: gainNode.gain, frequency: oscillatorNode.frequency };
}

export function trySong(song: Song = []) {
  if (isPlaying) {
    return;
  }

  isPlaying = true;

  audio ??= initApi();

  const { context, gain, frequency } = audio;
  let time = context.currentTime;
  let length = 0;

  for (const [note, len] of song) {
    length += len;

    frequency.setValueAtTime(note, time);

    gain.linearRampToValueAtTime(1, time);

    time += len;

    gain.linearRampToValueAtTime(0, time);
  }

  const { promise, resolve } = Promise.withResolvers();

  setTimeout(resolve, 1000 * length);

  lastSong = promise.then(() => {
    isPlaying = false;
  });
}

export function scheduleSong(song: Song = []) {
  lastSong.then(() => {
    trySong(song);
  });
}
