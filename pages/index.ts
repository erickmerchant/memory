import { h } from "@handcraft/lib";
import { stringify } from "@handcraft/lib/stringify";
import page from "./page.ts";
import memoryGame from "../elements/index.ts";

const { script, link } = h.html;

export default function () {
  return stringify(page([
    link.rel("stylesheet").href("/styles/index.css"),
    script.type("module").src("/elements/index.ts"),
  ], memoryGame()));
}
