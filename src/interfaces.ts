export interface CurrentGame {
  user: string;
  word: string;
  gamemode: string;
  tries: number;
  length: number;
  wordTries: string[];
  score: number;
  isWon: boolean;
}

export interface Game {
  user: string;
  word: string;
  gamemode: string;
  isWin: boolean;
  tries: number;
  score: number;
  date: string;
}

export interface Stats {
  history: Game[];
}
