import { h, render } from "handcraft/env/server.js";

const {
	html,
	head,
	meta,
	link,
	title,
	body,
	div,
	["memory-game"]: memoryGame,
	button,
	footer,
	p,
} = h.html;

export default function ({ scriptOrStyles }, resolve) {
	return render(
		html.lang("en-US")(
			head(
				meta.charset("utf-8"),
				meta
					.name("viewport")
					.content(
						"width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0",
					),
				title("Memory"),
				link.rel("stylesheet").href(resolve("/page.css")),
				link.rel("stylesheet").href(resolve("/memory-game.css")),
				scriptOrStyles,
			),
			body.class("page")(
				div.class("game")(
					memoryGame(
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
						button(),
					),
				),
				footer.class("dedication")(
					p("Made with ❤️ for Louise"),
				),
			),
		),
	);
}
