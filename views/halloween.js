import { h } from "handcraft/env/server.js";
import page from "./page.js";

const { link, script } = h.html;

export default function ({ resolve }) {
  return page({
    scriptOrStyles: [
      link.rel("stylesheet").href(resolve("/halloween.css")),
      script.type("module").src(resolve("/halloween.js")),
    ],
    resolve,
  });
}
