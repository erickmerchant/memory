export type Note = {
  (multiplier: number): Note;
  value: number;
  time: number;
};

export type Song = Array<Note>;

function note(value: number, time: number): Note {
  const n = (multiplier: number) => {
    return note(value, time * multiplier);
  };

  n.value = value;
  n.time = time;

  return n;
}

export function* generateNotes(
  base: number,
  divisor: number,
  time: number,
): Iterable<Note> {
  let current = 0;

  while (true) {
    const value = base + (base / divisor * current++);

    yield note(value, time);
  }
}

let audio;
let lastSong = Promise.resolve();
let isPlaying = false;

function initApi() {
  const context = new AudioContext();
  const oscillatorNode = new OscillatorNode(context, { type: "triangle" });
  const gainNode = new GainNode(context);
  const wave = context.createPeriodicWave(
    [
      0,
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
      disableNormalization: true,
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

  for (const note of song) {
    length += note.time;

    frequency.setValueAtTime(note.value, time);

    gain.linearRampToValueAtTime(1, time);

    time += note.time;

    gain.linearRampToValueAtTime(0, time);
  }

  const { promise, resolve } = Promise.withResolvers();

  setTimeout(resolve, 1_000 * length);

  lastSong = promise.then(() => {
    isPlaying = false;
  });
}

export function scheduleSong(song: Song = []) {
  lastSong.then(() => {
    trySong(song);
  });
}
