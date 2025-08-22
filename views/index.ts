import type { FlintRouteContext } from "@flint/framework";
import { h } from "@handcraft/lib";
import page from "./page.ts";

const { script, link } = h.html;

export default function ({ resolve }: FlintRouteContext) {
  return page({
    scriptOrStyles: [
      link.rel("stylesheet").href(resolve("/index.css")),
      script.type("module").src(resolve("/index.js")),
    ],
  });
}
