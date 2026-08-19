import { MemoryGame } from "./memory-game.ts";
import { generateNotes } from "../utils/audio.ts";

const [A, B, C, D, E, F, G] = generateNotes(200, 7, 0.1);

class IndexMemoryGame extends MemoryGame {
  override settings = {
    characters: [
      { text: "🐰", name: "rabbit", color: "gray" },
      { text: "🐶", name: "dog", color: "blue" },
      { text: "🐸", name: "frog", color: "green" },
      { text: "🐱", name: "cat", color: "yellow" },
      { text: "🦊", name: "fox", color: "orange" },
      { text: "🐻", name: "bear", color: "red" },
    ],
    songs: {
      cover: [B, A],
      reveal: [C, E, G],
      match: [C(2), C(2), G, F, E, C(2)],
      win: [C(2), C(2), G(2), F, E, D, E, C(2), C(2), G(2), F, E, D, E, C(2)],
    },
  };
}

export default IndexMemoryGame.define("memory-game");
