import { h } from "@handcraft/lib/templating";
import page from "./page.ts";

const { script, link, "memory-game": memoryGame } = h.html;

export default function () {
  return page({
    memoryGame,
    scriptOrStyles: () => [
      link.rel("stylesheet").href("/includes/index.css"),
      script.type("module").src("/includes/index.ts"),
    ],
  });
}
