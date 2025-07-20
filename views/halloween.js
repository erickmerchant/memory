import { h } from "handcraft/env/server.js";
import page from "./page.js";

const { link, script } = h.html;

export default function ({ urls }) {
	return page({
		scriptOrStyles: [
			link.rel("stylesheet").href(urls["/halloween.css"]),
			script.type("module").src(urls["/halloween.js"]),
		],
		urls,
	});
}
