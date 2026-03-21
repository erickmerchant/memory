import type { HandcraftChildArg } from "@handcraft/lib";
import { h, VNode } from "@handcraft/lib/templating";

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
  { memoryGame, scriptOrStyles }: {
    memoryGame: HandcraftChildArg<VNode>;
    scriptOrStyles: () => HandcraftChildArg<VNode>;
  },
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
      scriptOrStyles(),
    ),
    body.class("page")(
      div.class("game")(
        memoryGame,
      ),
      footer.class("dedication")(p("Made with ❤️ for Louise")),
    ),
  );
}
