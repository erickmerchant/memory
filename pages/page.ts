import { h, type HandcraftTemplatingChild } from "@handcraft/lib/templating";

const {
  html,
  head,
  meta,
  title,
  body,
  div,
  footer,
  p,
  button,
  template,
  link,
  "memory-game": memoryGame,
} = h.html;

export default function (
  scriptOrStyles: HandcraftTemplatingChild,
) {
  return html.lang("en-US")(
    head(
      meta.charset("utf-8"),
      meta
        .name("viewport")
        .content(
          "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0",
        ),
      title("Memory"),
      scriptOrStyles,
    ),
    body.class("page")(
      div.class("game")(
        memoryGame(
          template.shadowrootmode("open")(
            link.rel("stylesheet").href("./elements/memory-game.css"),
            button,
            button,
            button,
            button,
            button,
            button,
            button,
            button,
            button,
            button,
            button,
            button,
          ),
        ),
      ),
      footer.class("dedication")(p("Made with ❤️ for Louise")),
    ),
  );
}
