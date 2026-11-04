export interface Drop {
  id: number;
  x: number;
  y: number;
  size: number;
  points: number;
  missPenalty: number;
  speed: number;
  isBrown: boolean;
}

export interface Country {
  name: string;
  description: string;
  themeClass: string;
  threshold: number;
}

export type GameState = 'idle' | 'playing' | 'gameover';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  badge: string;
  description: string;
  time: number;
  winScore: number;
  dropInterval: number;
  baseSpeed: number;
  speedVariance: number;
  brownRate: number;
  stunDuration: number;
}

export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  type: 'positive' | 'bonus' | 'negative' | 'special';
}

export interface SplashEffect {
  id: number;
  x: number;
  y: number;
  type: 'water' | 'mud' | 'gold' | 'purify';
}

export interface JerryCanItem {
  id: number;
  x: number;
  y: number;
  speedX: number;
  points: number;
  width: number;
  height: number;
}

export interface Milestone {
  score: number;
  title: string;
  message: string;
  badgeColor?: string;
}
