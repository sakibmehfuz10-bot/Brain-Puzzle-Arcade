import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Flame, RefreshCw as Recycle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playIncorrectSound, playWinSound } from '../../lib/sound';

interface GridCell {
  id: number;
  value: number;
  selected: boolean;
}

export function SumGrid() {
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [targetSum, setTargetSum] = useState(15);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Initialize a 4x4 grid of random numbers from 1 to 9
  const generateNewGrid = () => {
    const freshGrid: GridCell[] = [];
    for (let i = 0; i < 16; i++) {
      freshGrid.push({
        id: i,
        value: Math.floor(Math.random() * 9) + 1,
        selected: false
      });
    }
    return freshGrid;
  };

  const getValidSumObjective = (workingGrid: GridCell[]) => {
    // Generate an objective sum that is actually solvable with some random cells
    const shuffled = [...workingGrid].sort(() => Math.random() - 0.5);
    const subsetCount = Math.floor(Math.random() * 2) + 2; // sum of 2 to 3 cells
    let sum = 0;
    for (let i = 0; i < Math.min(subsetCount, shuffled.length); i++) {
      sum += shuffled[i].value;
    }
    // Return sum or a default robust value if 0
    return sum > 0 ? sum : 15;
  };

  const startSumGridGame = () => {
    playClickSound();
    const raw = generateNewGrid();
    setGrid(raw);
    const targetObj = getValidSumObjective(raw);
    setTargetSum(targetObj);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setIsPlaying(true);
  };

  const handleCellClick = (index: number) => {
    if (!isPlaying) return;

    // Play tile click feedback
    playClickSound();

    const updated = [...grid];
    updated[index].selected = !updated[index].selected;
    setGrid(updated);

    // Evaluate sum of all selected cells
    const selectedCells = updated.filter(c => c.selected);
    const currentSum = selectedCells.reduce((acc, c) => acc + c.value, 0);

    if (currentSum === targetSum) {
      // SUCCESS: Clear cells & add score points!
      playCorrectSound();
      setScore(prev => prev + currentSum + streak * 5);
      setStreak(prev => prev + 1);
      
      // Cascade/Regenerate matched cells
      const regenerated = updated.map(c => {
        if (c.selected) {
          return {
            id: c.id,
            value: Math.floor(Math.random() * 9) + 1,
            selected: false
          };
        }
        return c;
      });

      // Show confetti for high sum matches!
      if (currentSum >= 18) {
        confetti({
          particleCount: 40,
          spread: 30,
          origin: { y: 0.8 }
        });
      }

      setGrid(regenerated);
      // Select new sum target
      setTargetSum(getValidSumObjective(regenerated));
    } else if (currentSum > targetSum) {
      // EXCEEDED: Clear choice after subtle timeout
      playIncorrectSound();
      setTimeout(() => {
        const cleared = updated.map(c => ({ ...c, selected: false }));
        setGrid(cleared);
        setStreak(0);
      }, 300);
    }
  };

  const recycleGrid = () => {
    playClickSound();
    const raw = generateNewGrid();
    setGrid(raw);
    setTargetSum(getValidSumObjective(raw));
    setStreak(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsPlaying(false);
            playWinSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft]);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Flame className="w-6 h-6 mr-2 text-rose-500 fill-rose-500" /> Sum Cascade
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select numbers that add up to target</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{score}</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900/60 p-6 rounded-2xl mb-6 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            <span>⏱️ {timeLeft}s Left</span>
          </div>

          <div className="bg-rose-500/10 text-rose-600 px-4 py-1.5 rounded-full text-sm font-extrabold flex items-center">
            🎯 Target Sum: <span className="text-rose-600 dark:text-rose-400 text-lg font-black ml-1.5">{targetSum}</span>
          </div>
        </div>

        {/* 4x4 Grid Board */}
        <div className="grid grid-cols-4 gap-3 relative min-h-[280px]">
          {isPlaying ? (
            grid.map((cell, index) => {
              let cellClass = "aspect-square rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-sm border select-none transition-all duration-150 cursor-pointer ";
              
              if (cell.selected) {
                cellClass += "bg-rose-500 border-rose-600 text-white scale-95 shadow-md shadow-rose-500/20";
              } else {
                cellClass += "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600/50";
              }

              return (
                <motion.div
                  key={cell.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleCellClick(index)}
                  className={cellClass}
                >
                  {cell.value}
                </motion.div>
              );
            })
          ) : (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs">
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4 text-center px-6">
                Connect sums matching the target! Solving gives heavy cascading combo streaks.
              </p>
              <button
                onClick={startSumGridGame}
                className="flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
              >
                <Play className="w-4 h-4 mr-2" /> Start Solver Game
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>Click multiples matching the target sum exactly.</span>
        {isPlaying && (
          <button
            onClick={recycleGrid}
            className="flex items-center text-rose-500 hover:underline font-bold"
          >
            <Recycle className="w-3.5 h-3.5 mr-1" /> Re-shuffle Grid
          </button>
        )}
      </div>
    </div>
  );
}
