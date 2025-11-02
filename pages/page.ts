import type { HandcraftChildArg } from "@handcraft/lib";
import { h, render } from "@handcraft/lib";

const {
  html,
  head,
  meta,
  title,
  body,
  div,
  button,
  footer,
  p,
  "memory-game": memoryGame,
} = h.html;

export default function (
  { scriptOrStyles }: { scriptOrStyles: HandcraftChildArg },
) {
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
        footer.class("dedication")(p("Made with ❤️ for Louise")),
      ),
    ),
  );
}
