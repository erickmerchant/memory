import { h } from "@handcraft/lib";
import page from "./page.ts";

const { script, link } = h.html;

export default function () {
  return page
    .scriptOrStyles([
      link.rel("stylesheet").href("/index.css"),
      script.type("module").src("/index.js"),
    ])();
}
