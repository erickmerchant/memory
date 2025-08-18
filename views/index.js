import { h } from "@handcraft/lib";
import page from "./page.js";

const { script, link } = h.html;

export default function ({ resolve }) {
  return page({
    scriptOrStyles: [
      link.rel("stylesheet").href(resolve("/index.css")),
      script.type("module").src(resolve("/index.js")),
    ],
    resolve,
  });
}
