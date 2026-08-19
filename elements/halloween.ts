import { MemoryGame } from "./memory-game.ts";
import { generateNotes } from "../utils/audio.ts";

const [A, B, C, D, E, F, G, A2] = generateNotes(50, 7, .2);

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
