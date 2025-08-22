const { game } = await import("./memory-game.ts");

const A: [number, number] = [220, 0.1];
// const AA : [number, number] = [220, 0.2];
// const B : [number, number] = [246, 0.1];
const C: [number, number] = [261, 0.1];
const CC: [number, number] = [261, 0.2];
const D: [number, number] = [293, 0.1];
const E: [number, number] = [329, 0.1];
const F: [number, number] = [349, 0.1];
const G: [number, number] = [392, 0.1];
const GG: [number, number] = [392, 0.2];

game({
  characters: [
    { text: "🐰", name: "rabbit", color: "gray" },
    { text: "🐶", name: "dog", color: "blue" },
    { text: "🐸", name: "frog", color: "green" },
    { text: "🐱", name: "cat", color: "yellow" },
    { text: "🦊", name: "fox", color: "orange" },
    { text: "🐻", name: "bear", color: "red" },
  ],
  songs: {
    cover: [A, A],
    reveal: [C, E, G],
    match: [CC, CC, G, F, E, CC],
    win: [CC, CC, GG, F, E, D, E, CC, CC, GG, F, E, D, E, CC],
  },
});
