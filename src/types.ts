export type Character = { text: string; name: string; color: string };

export type Song = Array<[number, number]>;

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
