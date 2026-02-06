import type { Song } from "./audio.ts";
import { $, define, h, watch, when } from "@handcraft/lib";
import { scheduleSong, trySong } from "./audio.ts";

export type CharacterStub = { text: string; name: string; color: string };

export type Character = CharacterStub & {
  interactive: boolean;
  order: number;
  total: number;
  latest: number;
  revealed: boolean;
  matching: boolean;
  previous: Character | null;
};

export type Settings = {
  characters: Array<CharacterStub>;
  songs: Record<string, Song>;
};

type State = {
  incomplete: number;
  modalOpen: boolean;
  characters: Array<Character>;
  previous: Character | null;
};

const { span, div, dialog, p, button } = h.html;

export function memoryGame(settings: Settings) {
  return define("memory-game", {
    connected(host) {
      const state: State = watch({
        incomplete: settings.characters.length,
        modalOpen: false,
        characters: watch<Array<Character>>([]),
        previous: null,
      });

      resetState();

      $(host)(
        state.characters.map(
          (character) => {
            const faces = div.class("faces").style({
              "--turns": () => character.total,
              "--duration": () => character.latest,
              "--background": () => `var(--${character.color})`,
            })(
              span.class("front face")("🦉"),
              span.class("back face")(span.class("text")(() => character.text)),
            );

            return button
              .aria({
                label:
                  () => (character.total % 2 === 0 ? "owl" : character.name),
              })
              .on("click", clickCard)
              .on("transitionend", transitionEndCard)(faces);

            function clickCard(e: Event) {
              if (e.currentTarget == null) return;

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

                  character.matching = character.text === state.previous.text;

                  character.previous = state.previous;

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
            }

            function transitionEndCard() {
              if (!character.previous) return;

              if (character.matching) {
                turn(character, 2);
                turn(character.previous, 2);

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

                character.previous = null;
              } else {
                setTimeout(
                  () => {
                    turn(character, 1);

                    character.interactive = true;

                    if (character.previous) {
                      turn(character.previous, 1);
                      character.previous.interactive = true;
                    }

                    trySong(settings.songs.cover);

                    character.previous = null;
                  },
                  1_000,
                );
              }
            }
          },
        ),
        when((prev) => prev || state.modalOpen).show(reloadDialog),
      );

      function reloadDialog() {
        return dialog.class("reload-dialog").effect(
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
      }

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
              matching: false,
              previous: null,
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

      function turn(model: Character, val: number) {
        model.total += val;

        model.latest = val ?? 0;

        model.revealed = (model.total % 2) === 1;
      }
    },
  });
}
