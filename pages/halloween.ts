import { h } from "@handcraft/lib";
import page from "./page.ts";

const { link, script } = h.html;

export default function () {
  return page({
    scriptOrStyles: [
      link.rel("stylesheet").href("/styles/halloween.css"),
      script.type("module").src("/components/halloween.js"),
    ],
  });
}
