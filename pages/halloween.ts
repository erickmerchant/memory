import { h } from "@handcraft/lib";
import page from "./page.ts";
import memoryGame from "../elements/halloween.ts";

const { link, script } = h.html;

export default function () {
  return page([
    link.rel("stylesheet").href("/styles/halloween.css"),
    script.type("module").src("/elements/halloween.ts"),
  ], memoryGame());
}
