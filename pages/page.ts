import { h, type HandcraftChild } from "@handcraft/lib";

const {
  html,
  head,
  meta,
  title,
  body,
  div,
  footer,
  p,
  "memory-game": memoryGame,
} = h.html;

export default function (
  scriptOrStyles: HandcraftChild,
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
        memoryGame(),
      ),
      footer.class("dedication")(p("Made with ❤️ for Louise")),
    ),
  );
}
