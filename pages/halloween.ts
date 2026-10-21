import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import page from "./page.ts";
import memoryGame from "../elements/halloween.ts";

export default function () {
  return page([
    html.link(attr.rel("stylesheet"), attr.href("/styles/halloween.css")),
    html.script(attr.type("module"), attr.src("/elements/halloween.js")),
  ], memoryGame());
}
