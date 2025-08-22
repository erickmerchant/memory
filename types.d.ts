type Character = { text: string; name: string; color: string };

type Song = Array<[number, number]>;

type CharacterAndState = Character & {
  interactive: boolean;
  order: number;
  total: number;
  latest: number;
  revealed: boolean;
};

type Settings = {
  characters: Array<Character>;
  songs: Record<string, Song>;
};
