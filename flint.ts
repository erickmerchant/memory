import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint, { pattern as p } from "@flint/framework";
import index from "./pages/index.ts";
import halloween from "./pages/halloween.ts";

const app = flint()
  .route("/", index)
  .route("/halloween/", halloween)
  .file("/includes/halloween.js", js)
  .file("/includes/index.js", js)
  .file(p`/includes/*.css`, css);

export default app;

if (import.meta.main) {
  app.run();
}
