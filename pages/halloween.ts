import { h } from "@handcraft/lib";
import page from "./page.ts";
import memoryGame from "../includes/halloween.ts";

const { link, script } = h.html;

export default function () {
  return page({
    memoryGame,
    scriptOrStyles: [
      link.rel("stylesheet").href("/includes/halloween.css?inline"),
      script.type("module").src("/includes/halloween.ts?inline"),
    ],
  });
}
