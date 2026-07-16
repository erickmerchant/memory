import { MemoryGame } from "./memory-game.ts";

const A: [number, number] = [55, 0.2];
const B: [number, number] = [61, 0.2];
const C: [number, number] = [65, 0.2];
const D: [number, number] = [73, 0.2];
const E: [number, number] = [82, 0.2];
const F: [number, number] = [87, 0.2];
const G: [number, number] = [98, 0.2];
const A2: [number, number] = [110, 0.2];

class HalloweenMemoryGame extends MemoryGame {
  override settings = {
    characters: [
      { text: "🦇", name: "bat", color: "brown" },
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
  };
}

export default HalloweenMemoryGame.define("memory-game");
