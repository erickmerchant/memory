import type { HandcraftNode } from "@handcraft/lib";
import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";

export default function (
  scriptOrStyles: Array<HandcraftNode | null>,
  game: HandcraftNode,
) {
  return html.html(
    attr.lang("en-US"),
    html.head(
      html.meta(attr.charset("utf-8")),
      html.meta(
        attr.name("viewport"),
        attr.content(
          "width=device-width, maximum-scale=1.0, user-scalable=0",
        ),
      ),
      html.title(text("Memory")),
      ...scriptOrStyles,
    ),
    html.body(
      attr.class("page"),
      html.div(attr.class("game"), game),
      html.footer(
        attr.class("dedication"),
        html.p(text("Made with ❤️ for Louise")),
      ),
    ),
  );
}
