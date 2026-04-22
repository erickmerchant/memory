import { h } from "@handcraft/lib/templating";
import page from "./page.ts";

const { script, link } = h.html;

export default function () {
  return page([
    link.rel("stylesheet").href("/pages/index.css"),
    script.type("module").src("/elements/index.ts"),
  ]);
}
