import css from "@flint/framework/plugins/css";
import js from "@flint/framework/plugins/js";
import flint from "@flint/framework";
import index from "./views/index.js";
import halloween from "./views/halloween.js";

const app = flint("public", "dist")
	.cache("/", "/halloween/")
	.route("/", index)
	.route("/halloween/", halloween)
	.use("/index.css", css)
	.use("/halloween.css", css)
	.use("/index.js", js)
	.use("/halloween.js", js);

export default app;

if (import.meta.main) {
	app.run();
}
