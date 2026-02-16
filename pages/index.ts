import { h } from "@handcraft/lib";
import page from "./page.ts";
import memoryGame from "../includes/index.ts";

const { script, link } = h.html;

export default function () {
  return page({
    memoryGame,
    scriptOrStyles: [
      link.rel("stylesheet").href("/includes/index.css"),
      script.type("module").src("/includes/index.js"),
    ],
  });
}
