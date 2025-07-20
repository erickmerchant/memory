import { h } from "handcraft/env/server.js";
import page from "./page.js";

const { script } = h.html;

export default function ({ urls }) {
	return page({
		scriptOrStyles: script.type("module").src(urls["/index.js"]),
		urls,
	});
}
