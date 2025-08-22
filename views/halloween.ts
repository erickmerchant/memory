import { h } from "@handcraft/lib";
import page from "./page.ts";
import type { FlintRouteContext } from "@flint/framework";

const { link, script } = h.html;

export default function ({ resolve }: FlintRouteContext) {
  return page({
    scriptOrStyles: [
      link.rel("stylesheet").href(resolve("/halloween.css")),
      script.type("module").src(resolve("/halloween.js")),
    ],
  });
}
