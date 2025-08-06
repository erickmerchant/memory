const { game } = await import("./memory-game.js");

const A = [55, 0.2];
const B = [61, 0.2];
const C = [65, 0.2];
const D = [73, 0.2];
const E = [82, 0.2];
const F = [87, 0.2];
const G = [98, 0.2];
const A2 = [110, 0.2];

game({
  characters: [
    { text: "🦇", name: "bat", color: "yellow" },
    { text: "🕷️", name: "spider", color: "gray" },
    { text: "🧟‍♀️", name: "zombie", color: "green" },
    { text: "🎃", name: "jack-o'-lantern", color: "orange" },
    { text: "🐺", name: "wolf", color: "blue" },
    { text: "🧛‍♀️", name: "vampire", color: "red" },
  ],
  songs: {
    cover: [C, B],
    reveal: [A, B],
    match: [A, B, C, D],
    win: [A, B, C, D, E, F, G, A2, A2, G, F, E],
  },
});
