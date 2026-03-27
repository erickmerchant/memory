import { h } from "@handcraft/lib/templating";
import page from "./page.ts";

const { link, script, "memory-game": memoryGame } = h.html;

export default function () {
  return page({
    memoryGame,
    scriptOrStyles: () => [
      link.rel("stylesheet").href("/includes/halloween.css"),
      script.type("module").src("/includes/halloween.ts"),
    ],
  });
}
