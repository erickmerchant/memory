import { h } from "@handcraft/lib/templating";
import page from "./page.ts";

const { link, script } = h.html;

export default function () {
  return page([
    link.rel("stylesheet").href("/pages/halloween.css"),
    script.type("module").src("/elements/halloween.ts"),
  ]);
}
