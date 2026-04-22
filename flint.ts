import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint, { pattern as p } from "@flint/framework";
import index from "./pages/index.ts";
import halloween from "./pages/halloween.ts";

const app = flint()
  .route("/", index)
  .route("/halloween/", halloween)
  .file("/elements/halloween.js", js)
  .file("/elements/index.js", js)
  .file(p`/elements/*.css`, css)
  .file(p`/pages/*.css`, css);

export default app;

if (import.meta.main) {
  app.run();
}
