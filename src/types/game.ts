export type MathCategory = 
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'order_of_ops'
  | 'fractions'
  | 'algebra'
  | 'mixed';

export type EnvironmentTheme = 
  | 'cosmic_math_dimension'
  | 'futuristic_city'
  | 'magic_forest'
  | 'desert_temple'
  | 'ice_kingdom'
  | 'volcano_world'
  | 'math_sanctuary';

export interface MathQuestion {
  id: string;
  category: MathCategory;
  questionText: string;
  questionArabic: string;
  equation: string;
  options: number[]; // 3 lane choices (index 0: Left, index 1: Middle, index 2: Right)
  correctIndex: number; // 0, 1, or 2
  correctAnswer: number;
  explanation: string;
  difficulty: number; // 1 to 10
}

export type ObstacleType = 
  | 'tech_crate' // Jump over
  | 'laser_barrier' // Slide under
  | 'spikes' // Switch lane
  | 'moving_drone' // Moving hazard
  | 'double_crate' // High barrier
  | 'energy_wall' // Tall energy forcefield
  | 'quantum_barrier'; // Dual plasma barrier

export interface ObstacleData {
  id: string;
  type: ObstacleType;
  lane: number; // -1: Left, 0: Center, 1: Right
  z: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface CoinData {
  id: string;
  lane: number;
  z: number;
  y: number;
  collected: boolean;
  isGem?: boolean;
}

export interface PowerUpItem {
  id: string;
  lane: number;
  z: number;
  type: 'shield' | 'magnet' | 'multiplier' | 'slowmo' | 'turbo';
  collected: boolean;
}

export interface GateData {
  id: string;
  z: number;
  question: MathQuestion;
  resolved: boolean;
  chosenLane?: number;
  isCorrect?: boolean;
}

export interface CharacterSkin {
  id: string;
  name: string;
  nameAr: string;
  titleAr: string;
  descriptionAr: string;
  price: number;
  unlocked: boolean;
  modelType: 'athletic_runner' | 'cyber_prodigy' | 'space_explorer' | 'desert_phantom' | 'quantum_champion';
  hoodieColor: string;
  pantsColor: string;
  hairColor: string;
  backpackColor: string;
  accentColor: string;
  thrusterColor: string;
  thrusterColorHex: number;
  icon: string;
  speedRating: number;
  jumpRating: number;
}

export interface ThrusterColorOption {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  unlocked: boolean;
  colorHex: number;
  colorCss: string;
}

export interface LevelInfo {
  levelNumber: number;
  world: EnvironmentTheme;
  title: string;
  titleAr: string;
  targetScore: number;
  questionsCount: number;
  category: MathCategory;
  difficulty: number;
  baseSpeed: number;
  starsEarned: number; // 0 to 3
  unlocked: boolean;
  highScore: number;
}

export const DIMENSION_INITIAL_STAGES: number[] = [1, 16, 31, 46, 61, 76, 91];

export interface PlayerProgress {
  coins: number;
  gems: number;
  currentLevel: number;
  highestLevelUnlocked: number;
  unlockedStages?: number[];
  completedStages?: number[];
  stageStars?: Record<number, number>;
  highScore: number;
  totalDistance: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  categoryStats: Record<MathCategory, { correct: number; total: number }>;
  equippedSkin: string;
  equippedThruster: string;
  unlockedSkins: string[];
  unlockedThrusters: string[];
  powerUpLevels: {
    shield: number;
    magnet: number;
    multiplier: number;
    slowmo: number;
    turbo: number;
  };
  audioEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  voiceTtsEnabled: boolean;
  controlsMode: 'swipe' | 'buttons' | 'both';
  graphicsQuality: 'high' | 'medium' | 'low';
  lastLoginDate?: string;
  consecutiveLoginDays?: number;
  hasClaimedDailyToday?: boolean;
}

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory' | 'shop' | 'levels' | 'stats' | 'characters';

