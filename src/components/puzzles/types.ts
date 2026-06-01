export type GameMode = 'quiz' | 'sliding' | 'scramble' | 'sudoku' | 'memory';

export interface Tile {
  id: number;
  value: number;
  isEmpty: boolean;
}

export interface MemoryCard {
  id: number;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}
