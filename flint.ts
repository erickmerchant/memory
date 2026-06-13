import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint from "@flint/framework";
import { view } from "@handcraft/lib/ssr";
import index from "./pages/index.ts";
import halloween from "./pages/halloween.ts";

const app = flint()
  .route("/", view(index))
  .route("/halloween/", view(halloween))
  .route("/robots.txt")
  .file("/elements/halloween.js", js)
  .file("/elements/index.js", js)
  .file("/styles/halloween.css", css)
  .file("/styles/index.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
