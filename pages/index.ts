import { h } from "@handcraft/lib";
import page from "./page.ts";
import { memoryGame } from "../components/index.ts";

const { script, link } = h.html;

export default function () {
  return page({
    memoryGame,
    scriptOrStyles: [
      link.rel("stylesheet").href("/styles/index.css"),
      script.type("module").src("/components/index.js"),
    ],
  });
}
