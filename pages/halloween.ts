import { h } from "@handcraft/lib";
import { stringify } from "@handcraft/lib/stringify";
import page from "./page.ts";
import memoryGame from "../elements/halloween.ts";

const { link, script } = h.html;

export default function () {
  return stringify(page([
    link.rel("stylesheet").href("/pages/halloween.css"),
    script.type("module").src("/elements/halloween.ts"),
  ], memoryGame()));
}
