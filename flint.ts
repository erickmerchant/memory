import css from "@flint/framework/plugins/css";
import js from "@flint/framework/plugins/js";
import create from "@flint/framework/create";
import index from "./views/index.js";
import halloween from "./views/halloween.js";

const app = create("public")
	.cache(["/", "/halloween/"])
	.route("/", index)
	.route("/halloween/", halloween)
	.route("/*.css", css)
	.route("/index.js", js)
	.route("/halloween.js", js)
	.output("dist");

export default app;

if (import.meta.main) {
	app.run();
}
