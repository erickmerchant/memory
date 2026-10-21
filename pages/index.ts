import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import page from "./page.ts";
import memoryGame from "../elements/index.ts";

export default function () {
  return page([
    html.link(attr.rel("stylesheet"), attr.href("/styles/index.css")),
    html.script(attr.type("module"), attr.src("/elements/index.js")),
  ], memoryGame());
}
