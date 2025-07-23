import { h } from "handcraft/env/server.js";
import page from "./page.js";

const { script } = h.html;

export default function (_, resolve) {
	return page({
		scriptOrStyles: script.type("module").src(resolve("/index.js")),
	}, resolve);
}
