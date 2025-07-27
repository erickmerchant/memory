const { game } = await import("./memory-game.js");

const A = [220, 0.1];
// const AA = [220, 0.2];
// const B = [246, 0.1];
const C = [261, 0.1];
const CC = [261, 0.2];
const D = [293, 0.1];
const E = [329, 0.1];
const F = [349, 0.1];
const G = [392, 0.1];
const GG = [392, 0.2];

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
