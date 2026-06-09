import { h } from "@handcraft/lib";
import page from "./page.ts";
import memoryGame from "../elements/index.ts";

const { script, link } = h.html;

export default function () {
  return page([
    link.rel("stylesheet").href("/styles/index.css"),
    script.type("module").src("/elements/index.ts"),
  ], memoryGame());
}
