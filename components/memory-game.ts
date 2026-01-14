import type { Song } from "./audio.ts";
import { define, h, observe, watch, when } from "@handcraft/lib";
import { scheduleSong, trySong } from "./audio.ts";

export type Character = { text: string; name: string; color: string };

export type CharacterAndState = Character & {
  interactive: boolean;
  order: number;
  total: number;
  latest: number;
  revealed: boolean;
};

export type Settings = {
  characters: Array<Character>;
  songs: Record<string, Song>;
};

type State = {
  incomplete: number;
  modalOpen: boolean;
  characters: Array<CharacterAndState>;
  previous: CharacterAndState | null;
};

const { span, div, dialog, p, button } = h.html;

export const memoryGame = (settings: Settings) => {
  const tag = define("memory-game").setup((host) => {
    const state: State = watch({
      incomplete: settings.characters.length,
      modalOpen: false,
      characters: watch<Array<CharacterAndState>>([]),
      previous: null,
    });

    resetState();

    const reloadDialog = () =>
      dialog.class("reload-dialog").effect(
        (el: HTMLDialogElement) => {
          if (state.modalOpen) {
            el.showModal();
          } else {
            el.close();
          }
        },
      )(
        div.class("card")(
          div.class("faces")(span.class("front face")("🦉")),
        ),
        div.class("bubble")(
          p("Hoo-ray! You found all my owl friends."),
          button.class("play-again").on("click", resetState)("Play Again!"),
        ),
      );

    host(
      observe(host)("> button").map(
        (button, i) => {
          const character = state.characters[i];

          const faces = div.class("faces").style({
            "--turns": () => character.total,
            "--duration": () => character.latest,
            "--background": () => `var(--${character.color})`,
          })(
            span.class("front face")("🦉"),
            span.class("back face")(span.class("text")(() => character.text)),
          );
          const clickCard = () => {
            if (!character.interactive) {
              return;
            }

            if (!character.revealed) {
              if (state.previous) {
                const previous = state.previous;

                turn(character, 1);

                trySong(settings.songs.reveal);

                character.interactive = false;
                previous.interactive = false;

                if (character.text === state.previous.text) {
                  button.on("transitionend", () => {
                    turn(character, 2);
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
                  }, { once: true });
                } else {
                  button.on("transitionend", () => {
                    setTimeout(() => {
                      turn(character, 1);
                      turn(previous, 1);

                      character.interactive = true;
                      previous.interactive = true;

                      trySong(settings.songs.cover);
                    }, 1_000);
                  }, { once: true });
                }

                state.previous = null;
              } else {
                turn(character, 1);

                trySong(settings.songs.reveal);

                state.previous = character;
              }
            } else {
              turn(character, 1);

              state.previous = null;

              trySong(settings.songs.cover);
            }
          };

          return button
            .aria({
              label: () => (character.total % 2 === 0 ? "owl" : character.name),
            })
            .on("click", clickCard)(faces);
        },
      ),
      when((prev) => prev || state.modalOpen).show(reloadDialog),
    );

    function resetState() {
      state.incomplete = settings.characters.length;
      state.modalOpen = false;

      const characters = settings.characters
        .concat(settings.characters)
        .map((character) => {
          return {
            ...character,
            interactive: true,
            order: Math.random(),
            total: 0,
            latest: 0,
            revealed: false,
          };
        })
        .toSorted((a, b) => a.order - b.order);

      for (let i = 0; i < characters.length; i++) {
        if (state.characters[i]) {
          Object.assign(state.characters[i], characters[i]);
        } else {
          state.characters.push(watch(characters[i]));
        }
      }
    }

    function turn(model: CharacterAndState, val: number) {
      model.total += val;

      model.latest = val ?? 0;

      model.revealed = (model.total % 2) === 1;
    }
  });

  return tag(
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
  );
};
