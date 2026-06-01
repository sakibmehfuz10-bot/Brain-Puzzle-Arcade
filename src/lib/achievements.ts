export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: string;
  iconName: 'Trophy' | 'Compass' | 'Award' | 'Zap' | 'Grid' | 'BrainCircuit' | 'Type' | 'Sparkles';
  color: string; // Tailwind bg color class
  textColor: string; // Tailwind text color class
  borderColor: string; // Tailwind border color class
  glowColor: string; // CSS box shadow glow color
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'trivia_pioneer',
    name: 'Trivia Pioneer',
    description: 'Completed your first dynamic quiz topic successfully!',
    requirement: 'Finish 1 generated quiz draft',
    iconName: 'Compass',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-100 dark:border-indigo-900/40',
    glowColor: 'rgba(99, 102, 241, 0.2)'
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Scored a perfect score on any customized topic!',
    requirement: 'Score 100% (5 out of 5) on any quiz',
    iconName: 'Award',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-100 dark:border-amber-900/40',
    glowColor: 'rgba(245, 158, 11, 0.2)'
  },
  {
    id: 'fast_thinker',
    name: 'Fast Thinker',
    description: 'Answered a quiz question correctly in Less than 4 seconds!',
    requirement: 'Solve quiz questions in record time',
    iconName: 'Zap',
    color: 'bg-rose-500',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-100 dark:border-rose-900/40',
    glowColor: 'rgba(244, 63, 94, 0.2)'
  },
  {
    id: 'sudoku_ninja',
    name: 'Sudoku Ninja',
    description: 'Decoded the full 4x4 Mini-Sudoku matrix perfectly!',
    requirement: 'Complete any Sudoku riddle correctly',
    iconName: 'Grid',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-100 dark:border-emerald-900/40',
    glowColor: 'rgba(16, 185, 129, 0.2)'
  },
  {
    id: 'memory_monarch',
    name: 'Memory Monarch',
    description: 'Matched all pairs in the Memory challenge!',
    requirement: 'Complete the Memory Match board',
    iconName: 'BrainCircuit',
    color: 'bg-pink-500',
    textColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-100 dark:border-pink-900/40',
    glowColor: 'rgba(236, 72, 153, 0.2)'
  },
  {
    id: 'math_overlord',
    name: 'Math Overlord',
    description: 'Scored 100+ points on the rapid Math Speed Run!',
    requirement: 'Get a score of 100 or higher in Math Blitz',
    iconName: 'Sparkles',
    color: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-100 dark:border-blue-900/40',
    glowColor: 'rgba(59, 130, 246, 0.2)'
  },
  {
    id: 'scramble_solver',
    name: 'Scramble Solver',
    description: 'Unscrambled a word correctly in Word Scramble! ',
    requirement: 'Unscramble any word correctly',
    iconName: 'Type',
    color: 'bg-violet-500',
    textColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-100 dark:border-violet-900/40',
    glowColor: 'rgba(139, 92, 246, 0.2)'
  },
  {
    id: 'arcade_champion',
    name: 'Arcade Champion',
    description: 'Unlocked 3 or more distinctive badges on your profile!',
    requirement: 'Earn at least 3 other basic achievements',
    iconName: 'Trophy',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600 dark:text-yellow-500',
    borderColor: 'border-yellow-100 dark:border-yellow-900/40',
    glowColor: 'rgba(234, 179, 8, 0.2)'
  }
];

export function getUnlockedAchievements(): string[] {
  try {
    const rawData = localStorage.getItem('arcade_unlocked_achievements');
    return rawData ? JSON.parse(rawData) : [];
  } catch (e) {
    console.error('Error fetching unlocked achievements', e);
    return [];
  }
}

export function saveUnlockedAchievements(unlockedIds: string[]): void {
  try {
    localStorage.setItem('arcade_unlocked_achievements', JSON.stringify(unlockedIds));
  } catch (e) {
    console.error('Error saving unlocked achievements', e);
  }
}
