import type { HandcraftNode, HandcraftTag } from "@handcraft/lib";
import { HandcraftElement } from "@handcraft/lib/element";
import { html } from "@handcraft/lib/h";
import { watch } from "@handcraft/lib/reactivity";
import each from "@handcraft/lib/each";
import attr from "@handcraft/lib/attr";
import aria from "@handcraft/lib/aria";
import text from "@handcraft/lib/text";
import on from "@handcraft/lib/on";
import effect from "@handcraft/lib/effect";
import { scheduleSong, type Song, trySong } from "../utils/audio.ts";

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

export abstract class MemoryGame extends HandcraftElement {
  settings: Settings = {
    characters: [],
    songs: {},
  };

  state = watch({
    characters: watch<Array<Character>>([]),
    modalOpen: false,
  });
  previous: Character | null = null;
  incomplete = this.settings.characters.length;

  override view(host: HandcraftTag): HandcraftNode | void {
    this.resetState();

    return host(
      each(this.state.characters).map(
        (character) => {
          const faces = html.div(
            attr.class("faces"),
            attr.style(() =>
              `--turns: ${character.total}; --duration: ${character.latest}; --background: ${
                !this.ssr ? `var(--${character.color})` : null
              }`
            ),
            html.span(
              attr.class("back face"),
              text("🦉"),
              html.span(attr.class("frame")),
            ),
            !this.ssr
              ? html.span(
                attr.class("front face"),
                text(() => character().text),
                html.span(attr.class("frame")),
              )
              : null,
          );

          return html.button(
            aria.label(
              () => (character.total % 2 === 0 ? "owl" : character.name),
            ),
            on.click(this.clickCard(character)),
            on.transitionend(this.transitionEndCard(character)),
            faces,
          );
        },
      ),
      !this.ssr
        ? html.dialog(
          effect(
            (el: HTMLDialogElement) => {
              if (this.state.modalOpen) {
                el.showModal();
              } else {
                el.close();
              }
            },
          ),
          html.div(
            attr.class("card"),
            html.div(
              attr.class("faces"),
              html.span(
                attr.class("back face"),
                text("🦉"),
                html.span(attr.class("frame")),
              ),
            ),
          ),
          html.div(
            attr.class("bubble"),
            html.p(text("Hoo-ray! You found all my owl friends.")),
            html.button(
              attr.class("play-again"),
              on.click(this.resetState),
              text("Play Again!"),
            ),
          ),
        )
        : null,
    );
  }

  clickCard(character: Character) {
    return (e: Event) => {
      if (e.currentTarget == null) return;

      if (!character.interactive) {
        return;
      }

      if (!character.revealed) {
        if (this.previous) {
          const previous = this.previous;

          this.turn(character, 1);

          trySong(this.settings.songs.reveal);

          character.interactive = false;
          previous.interactive = false;

          character.matching = character.text === this.previous.text;

          character.previous = this.previous;

          this.previous = null;
        } else {
          this.turn(character, 1);

          trySong(this.settings.songs.reveal);

          this.previous = character;
        }
      } else {
        this.turn(character, 1);

        this.previous = null;

        trySong(this.settings.songs.cover);
      }
    };
  }

  transitionEndCard(character: Character) {
    return () => {
      if (!character.previous) return;

      if (character.matching) {
        this.turn(character, 2);
        this.turn(character.previous, 2);

        this.incomplete -= 1;

        if (this.incomplete === 0) {
          scheduleSong(this.settings.songs.win);

          for (const character of this.state.characters) {
            this.turn(character, 6);
          }

          this.state.modalOpen = true;

          this.incomplete = -1;
        } else {
          scheduleSong(this.settings.songs.match);
        }

        character.previous = null;
      } else {
        setTimeout(
          () => {
            this.turn(character, 1);

            character.interactive = true;

            if (character.previous) {
              this.turn(character.previous, 1);
              character.previous.interactive = true;
            }

            trySong(this.settings.songs.cover);

            character.previous = null;
          },
          1_000,
        );
      }
    };
  }

  resetState = () => {
    this.incomplete = this.settings.characters.length;
    this.state.modalOpen = false;
    this.previous = null;

    const stubs = this.settings.characters
      .concat(this.settings.characters);
    const orders = new Uint32Array(stubs.length);

    globalThis.crypto.getRandomValues(orders);

    const characters = stubs.map((character, i) => {
      return {
        ...character,
        interactive: true,
        order: orders[i],
        total: 0,
        latest: 0,
        revealed: false,
        matching: false,
        previous: null,
      };
    })
      .toSorted((a, b) => a.order - b.order);

    for (let i = 0; i < characters.length; i++) {
      if (this.state.characters[i]) {
        Object.assign(this.state.characters[i], characters[i]);
      } else {
        this.state.characters.push(watch(characters[i]));
      }
    }
  };

  turn(model: Character, val: number) {
    model.total += val;

    model.latest = val ?? 0;

    model.revealed = (model.total % 2) === 1;
  }
}
