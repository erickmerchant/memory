import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint from "@flint/framework";
import index from "./pages/index.ts";
import halloween from "./pages/halloween.ts";

const app = flint()
  .route("/", index)
  .file("/components/index.js", js)
  .file("/styles/index.css", css)
  .route("/halloween/", halloween)
  .file("/components/halloween.js", js)
  .file("/styles/halloween.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
