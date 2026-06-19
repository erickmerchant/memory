import { h, type HandcraftChild, type HandcraftNode } from "@handcraft/lib";

const {
  html,
  head,
  meta,
  title,
  body,
  div,
  footer,
  p,
} = h.html;

export default function (
  scriptOrStyles: HandcraftChild,
  game: HandcraftNode,
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
      div.class("game")(game),
      footer.class("dedication")(p("Made with ❤️ for Louise")),
    ),
  );
}
