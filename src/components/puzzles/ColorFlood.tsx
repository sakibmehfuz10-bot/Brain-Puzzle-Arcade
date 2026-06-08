import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, RotateCcw, HelpCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playIncorrectSound, playWinSound } from '../../lib/sound';

const GRID_SIZE = 5;
const MAX_MOVES = 15;

const COLOR_PALETTE = [
  { id: 0, class: 'bg-rose-500 hover:bg-rose-600', name: 'Rose', hex: '#f43f5e' },
  { id: 1, class: 'bg-sky-500 hover:bg-sky-600', name: 'Sky', hex: '#0ea5e9' },
  { id: 2, class: 'bg-emerald-500 hover:bg-emerald-600', name: 'Emerald', hex: '#10b981' },
  { id: 3, class: 'bg-amber-400 hover:bg-amber-500', name: 'Amber', hex: '#fbbf24' },
  { id: 4, class: 'bg-indigo-500 hover:bg-indigo-600', name: 'Indigo', hex: '#6366f1' },
];

export function ColorFlood() {
  const [grid, setGrid] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Load best moves score
  useEffect(() => {
    const saved = localStorage.getItem('puzzle_flood_best_moves');
    if (saved) {
      setBestMoves(parseInt(saved, 10));
    }
  }, []);

  // Initialize the grid with random color ids
  const initGame = () => {
    const newGrid: number[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(Math.floor(Math.random() * COLOR_PALETTE.length));
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setMoves(0);
    setHasWon(false);
    setHasLost(false);
    setIsNewRecord(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Flood fill algorithm to find all connected cells of same color
  const flood = (gridCopy: number[][], r: number, c: number, targetCol: number, replacementCol: number, visited: boolean[][]) => {
    if (
      r < 0 ||
      r >= GRID_SIZE ||
      c < 0 ||
      c >= GRID_SIZE ||
      visited[r][c] ||
      gridCopy[r][c] !== targetCol
    ) {
      return;
    }

    visited[r][c] = true;
    gridCopy[r][c] = replacementCol;

    flood(gridCopy, r + 1, c, targetCol, replacementCol, visited);
    flood(gridCopy, r - 1, c, targetCol, replacementCol, visited);
    flood(gridCopy, r, c + 1, targetCol, replacementCol, visited);
    flood(gridCopy, r, c - 1, targetCol, replacementCol, visited);
  };

  const handleColorSelection = (colorId: number) => {
    if (!isPlaying || hasWon || hasLost) return;

    const startColor = grid[0][0];
    if (colorId === startColor) return; // Same color selected, do nothing

    playClickSound();

    const gridCopy = grid.map(row => [...row]);
    const visited = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));

    // Flood starting from top-left (0, 0)
    flood(gridCopy, 0, 0, startColor, colorId, visited);

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setGrid(gridCopy);

    // Check if entire board is flooded with selected color
    const isCleared = gridCopy.every(row => row.every(cell => cell === colorId));

    if (isCleared) {
      setHasWon(true);
      setIsPlaying(false);
      playWinSound();

      // Check record
      const previousBest = bestMoves;
      const reachedNewBest = previousBest === null || nextMoves < previousBest;

      if (reachedNewBest) {
        setIsNewRecord(true);
        setBestMoves(nextMoves);
        localStorage.setItem('puzzle_flood_best_moves', nextMoves.toString());

        // Launch celebratory dual-sided confetti
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 },
            colors: ['#f43f5e', '#0ea5e9', '#10b981', '#fbbf24', '#6366f1']
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 },
            colors: ['#f43f5e', '#0ea5e9', '#10b981', '#fbbf24', '#6366f1']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else if (nextMoves >= MAX_MOVES) {
      setHasLost(true);
      setIsPlaying(false);
      playIncorrectSound();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl" id="color-flood-container">
      {/* Header section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-500 animate-spin-slow" />
            Color Flood
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Flood-fill the board with 1 solid color</p>
        </div>
        <div className="flex items-center space-x-4 text-right">
          {bestMoves !== null && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-500 block">Best</span>
              <p className="text-xl font-black text-green-600 dark:text-green-400">{bestMoves} moves</p>
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Moves</span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {moves}
              <span className="text-xs text-gray-400 font-normal">/{MAX_MOVES}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid display */}
      <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-gray-100 dark:border-slate-700/60 mb-6 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1.5 w-full h-full">
          {grid.map((row, rIdx) =>
            row.map((colorVal, cIdx) => (
              <motion.div
                key={`${rIdx}-${cIdx}`}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`rounded-lg shadow-inner ${COLOR_PALETTE[colorVal].class} transition-colors duration-300 relative`}
              >
                {/* Visual marker inside starting top-left tile */}
                {rIdx === 0 && cIdx === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-black select-none pointer-events-none drop-shadow-md">
                    ★
                  </span>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Win/Loss screen overlay */}
        <AnimatePresence>
          {(hasWon || hasLost) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-2">
                {hasWon ? (
                  <>
                    <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                    {isNewRecord && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full animate-pulse">
                        🏆 New Personal Best! 🏆
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Success! Grid Flooded</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You filled the board in <span className="font-bold text-green-500">{moves} moves</span>!</p>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-12 h-12 text-red-500 animate-spin-slow mb-1" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Out of moves!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Don't worry, you'll master the tactical spread next time.</p>
                  </>
                )}
                
                <button
                  onClick={initGame}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs text-center cursor-pointer"
                  id="color-flood-restart"
                >
                  {hasWon ? 'Play Again' : 'Try Again'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color selection controls */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Choose Next Flood Color</p>
        <div className="flex gap-3 justify-center items-center">
          {COLOR_PALETTE.map((col) => (
            <button
              key={col.id}
              onClick={() => handleColorSelection(col.id)}
              disabled={!isPlaying || grid[0]?.[0] === col.id}
              className={`w-12 h-12 rounded-full cursor-pointer shadow-md transform active:scale-90 transition-all ${col.class} ${
                grid[0]?.[0] === col.id ? 'ring-4 ring-indigo-500 scale-90 opacity-40 cursor-not-allowed' : 'hover:scale-110'
              }`}
              title={`Flood Grid to ${col.name}`}
              aria-label={`Flood to ${col.name}`}
              id={`color-flood-btn-${col.id}`}
            />
          ))}
        </div>

        {/* Action Button & Help */}
        <div className="flex w-full mt-4 justify-between border-t border-gray-100 dark:border-slate-700/60 pt-4 text-xs font-semibold">
          <button
            onClick={() => {
              playClickSound();
              setShowHelper(!showHelper);
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            id="color-flood-help"
          >
            <HelpCircle className="w-4 h-4" /> Help
          </button>
          <button
            onClick={() => {
              playClickSound();
              initGame();
            }}
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 cursor-pointer"
            id="color-flood-restart-instant"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>

        {/* Dynamic Help Section */}
        <AnimatePresence>
          {showHelper && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/30 p-3 rounded-xl border border-gray-100 dark:border-slate-700/30 text-left overflow-hidden mt-2"
            >
              💡 **Rulebook:** Flood starting from the top-left star tile (★). Selecting a colored button turns the unified flooded area and all neighboring matching tiles to your new chosen shade. Strategically cascade outwards to consume the full matrix under **{MAX_MOVES} moves**!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
