import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint from "@flint/framework";
import index from "./src/pages/index.ts";
import halloween from "./src/pages/halloween.ts";

const app = flint("src", "dist")
  .route("/", { handler: index })
  .file("/index.js", { handler: js })
  .file("/index.css", { handler: css })
  .route("/halloween/", { handler: halloween })
  .file("/halloween.js", { handler: js })
  .file("/halloween.css", { handler: css });

export default app;

if (import.meta.main) {
  app.run();
}
