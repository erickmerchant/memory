import { define, each, h, watch, when } from "@handcraft/lib";
import { scheduleSong, trySong } from "./audio.ts";

const { span, div, dialog, p, button } = h.html;

export function game(settings: Settings) {
  return define("memory-game").setup((host) => {
    const buttons = host.find(`> button`);
    const state: {
      incomplete: number;
      modalOpen: boolean;
      characters: Array<CharacterAndState>;
      previous: CharacterAndState | null;
    } = watch({
      incomplete: settings.characters.length,
      modalOpen: false,
      characters: watch<Array<CharacterAndState>>([]),
      previous: null,
    });

    resetState();

    const btns = each<CharacterAndState>(state.characters).map(
      (current, index) => {
        const btn = buttons[index()] ?? button();

        const faces = div.class("faces").style({
          "--turns": () => current.total,
          "--duration": () => current.latest,
          "--background": () => `var(--${current.color})`,
        })(
          span.class("front face")("🦉"),
          span.class("back face")(span.class("text")(() => current.text)),
        );
        const clickCard = () => {
          if (!current.interactive) {
            return;
          }

          if (!current.revealed) {
            if (state.previous) {
              const previous = state.previous;

              turn(current, 1);

              trySong(settings.songs.reveal);

              current.interactive = false;
              previous.interactive = false;

              if (current.text === state.previous.text) {
                btn.once("transitionend", () => {
                  turn(current, 2);
                  turn(previous, 2);

                  state.incomplete -= 1;

                  if (state.incomplete === 0) {
                    scheduleSong(settings.songs.win);

                    for (const character of state.characters) {
                      turn(character, 6);
                    }

                    state.modalOpen = true;

                    state.incomplete = -1;
                  } else {
                    scheduleSong(settings.songs.match);
                  }
                });
              } else {
                btn.once("transitionend", () => {
                  setTimeout(() => {
                    turn(current, 1);
                    turn(previous, 1);

                    current.interactive = true;
                    previous.interactive = true;

                    trySong(settings.songs.cover);
                  }, 1_000);
                });
              }

              state.previous = null;
            } else {
              turn(current, 1);

              trySong(settings.songs.reveal);

              state.previous = current;
            }
          } else {
            turn(current, 1);

            state.previous = null;

            trySong(settings.songs.cover);
          }
        };

        return btn
          .aria({
            label: () => (current.total % 2 === 0 ? "owl" : current.name),
          })
          .on(
            "click",
            clickCard,
          )(faces);
      },
    );
    const reloadEffect = (el: HTMLDialogElement) => {
      if (state.modalOpen) {
        el.showModal();
      } else {
        el.close();
      }
    };
    const reloadDialog = () =>
      dialog.class("reload-dialog").effect(
        reloadEffect as ((el: HTMLElement) => void),
      )(
        div.class("card")(div.class("faces")(span.class("front face")("🦉"))),
        div.class("bubble")(
          p("Hoo-ray! You found all my owl friends."),
          button.class("play-again").on("click", resetState)("Play Again!"),
        ),
      );
    host(btns, when((prev) => prev || state.modalOpen).show(reloadDialog));

    function resetState() {
      state.incomplete = settings.characters.length;
      state.modalOpen = false;
      state.characters.splice(
        0,
        Infinity,
        ...settings.characters
          .concat(settings.characters)
          .map((character) =>
            watch({
              ...character,
              interactive: true,
              order: Math.random(),
              total: 0,
              latest: 0,
              revealed: false,
            })
          )
          .toSorted((a, b) => a.order - b.order),
      );
    }

    function turn(model: CharacterAndState, val: number) {
      model.total += val;

      model.latest = val ?? 0;

      model.revealed = (model.total % 2) === 1;
    }
  });
}
