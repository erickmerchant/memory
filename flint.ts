import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint from "@flint/framework";
import index from "./views/index.ts";
import halloween from "./views/halloween.ts";

const app = flint("public", "dist")
  .route("/", index)
  .file("/index.js", js)
  .file("/index.css", css)
  .route("/halloween/", halloween)
  .file("/halloween.js", js)
  .file("/halloween.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
