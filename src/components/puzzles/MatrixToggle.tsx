import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, RotateCcw, HelpCircle, Trophy, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playWinSound } from '../../lib/sound';

export function MatrixToggle() {
  const [boardSize, setBoardSize] = useState<3 | 4>(3); // Support 3x3 or 4x4
  const [grid, setGrid] = useState<boolean[]>([]); // true = active/on, false = inactive/off
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [bestMoves3x3, setBestMoves3x3] = useState<number | null>(null);
  const [bestMoves4x4, setBestMoves4x4] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Load record from localStorage on load and boardSize shift
  useEffect(() => {
    const saved3x3 = localStorage.getItem('puzzle_matrix_best_moves_3');
    const saved4x4 = localStorage.getItem('puzzle_matrix_best_moves_4');
    if (saved3x3) setBestMoves3x3(parseInt(saved3x3, 10));
    if (saved4x4) setBestMoves4x4(parseInt(saved4x4, 10));
  }, []);

  // Set up board states securely
  const initGame = () => {
    const totalCells = boardSize * boardSize;
    let initialGrid = Array(totalCells).fill(false);
    
    // Simulate valid moves to ensure solvability
    // Randomly clicking cells guarantees the final state is solvable!
    const clicksToPerform = boardSize === 3 ? 5 : 8;
    for (let click = 0; click < clicksToPerform; click++) {
      const idx = Math.floor(Math.random() * totalCells);
      initialGrid = toggleCells(initialGrid, idx, boardSize);
    }

    // Edge case - if simulated clicks accidentally solved it or left it empty, force some lights on
    if (initialGrid.every(cell => cell === true) || initialGrid.every(cell => cell === false)) {
      initialGrid[0] = true;
      initialGrid[totalCells - 1] = true;
    }

    setGrid(initialGrid);
    setMoves(0);
    setHasWon(false);
    setIsNewRecord(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initGame();
  }, [boardSize]);

  // Helper toggle function
  const toggleCells = (currGrid: boolean[], targetIdx: number, size: number) => {
    const gridCopy = [...currGrid];
    const row = Math.floor(targetIdx / size);
    const col = targetIdx % size;

    // Toggle self
    gridCopy[targetIdx] = !gridCopy[targetIdx];

    // Orthogonal offsets: Up, Down, Left, Right
    const neighbors = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    neighbors.forEach(({ r, c }) => {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        const neighborIdx = r * size + c;
        gridCopy[neighborIdx] = !gridCopy[neighborIdx];
      }
    });

    return gridCopy;
  };

  const handleCellClick = (idx: number) => {
    if (!isPlaying || hasWon) return;

    playClickSound();

    const nextGrid = toggleCells(grid, idx, boardSize);
    const nextMoves = moves + 1;

    setGrid(nextGrid);
    setMoves(nextMoves);

    // Grid is solved if ALL cells are TRUE / ILLUMINATED
    const allLit = nextGrid.every(val => val === true);
    if (allLit) {
      setHasWon(true);
      setIsPlaying(false);
      playWinSound();

      // Verify records and update persistence
      const currentBest = boardSize === 3 ? bestMoves3x3 : bestMoves4x4;
      const achievedNewBest = currentBest === null || nextMoves < currentBest;

      if (achievedNewBest) {
        setIsNewRecord(true);
        if (boardSize === 3) {
          setBestMoves3x3(nextMoves);
          localStorage.setItem('puzzle_matrix_best_moves_3', nextMoves.toString());
        } else {
          setBestMoves4x4(nextMoves);
          localStorage.setItem('puzzle_matrix_best_moves_4', nextMoves.toString());
        }

        // Side canoons confetti stream
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 },
            colors: ['#a855f7', '#6366f1', '#e9d5ff', '#fbbf24', '#3b82f6']
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 },
            colors: ['#a855f7', '#6366f1', '#e9d5ff', '#fbbf24', '#3b82f6']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        confetti({
          particleCount: 90,
          spread: 65,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const activeBestMoves = boardSize === 3 ? bestMoves3x3 : bestMoves4x4;

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl" id="matrix-toggle-container">
      {/* Header section with Difficulty Size selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-500" />
            Matrix Toggle
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Light up all matrix bulbs to solve</p>
        </div>
        
        {/* Board Size Toggle Switch */}
        <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl text-xs font-bold leading-none self-end sm:self-auto shrink-0 select-none">
          <button
            onClick={() => { playClickSound(); setBoardSize(3); }}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
              boardSize === 3
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Classic 3x3
          </button>
          <button
            onClick={() => { playClickSound(); setBoardSize(4); }}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
              boardSize === 4
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Tactical 4x4
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 rounded-2xl p-3 text-center mb-6 text-xs gap-2">
        <div>
          <span className="text-gray-400 block dark:text-gray-500 uppercase font-bold tracking-wider text-[10px]">Current Moves</span>
          <p className="text-lg font-black text-purple-600 dark:text-purple-400">{moves}</p>
        </div>
        <div>
          <span className="text-green-500 block uppercase font-bold tracking-wider text-[10px]">Record ({boardSize}x{boardSize})</span>
          <p className="text-lg font-black text-green-600 dark:text-green-400">
            {activeBestMoves !== null ? `${activeBestMoves} Moves` : '—'}
          </p>
        </div>
      </div>

      {/* Main Grid display size dependent */}
      <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-100 dark:border-slate-700/60 mb-6 flex items-center justify-center">
        <div 
          className={`grid gap-3 w-full h-full`}
          style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        >
          {grid.map((cellState, idx) => (
            <button
              key={`${boardSize}-${idx}`}
              onClick={() => handleCellClick(idx)}
              disabled={hasWon}
              className={`relative rounded-xl cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400/50 flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                cellState
                  ? 'bg-purple-500 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.4)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)] border-purple-400'
                  : 'bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-300 dark:text-slate-500 border border-gray-100 dark:border-slate-600/50'
              }`}
              title={`Toggle cell ${Math.floor(idx / boardSize) + 1}, ${(idx % boardSize) + 1}`}
              aria-label={`Grid toggle bulb at row ${Math.floor(idx / boardSize) + 1} column ${(idx % boardSize) + 1}`}
              id={`matrix-toggle-btn-${idx}`}
            >
              {/* Optional glowing bulb icon indicator */}
              <Lightbulb className={`w-5 h-5 transition-transform duration-300 ${cellState ? 'scale-110 rotate-12 fill-purple-200' : 'scale-90 opacity-40'}`} />
            </button>
          ))}
        </div>

        {/* Win overlay screen */}
        <AnimatePresence>
          {hasWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 rounded-3xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-2">
                <Trophy className="w-12 h-12 text-yellow-500 animate-bounce mb-1" />
                {isNewRecord && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full animate-pulse">
                    🏆 New Record Achieved! 🏆
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grid Fully Lit!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Solved in <span className="font-bold text-purple-500">{moves} total moves</span>.</p>
                
                <button
                  onClick={initGame}
                  className="mt-4 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs text-center cursor-pointer"
                  id="matrix-toggle-restart"
                >
                  Play Grid Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Help and Restart Actions */}
      <div className="flex flex-col items-center gap-4 text-xs font-semibold">
        <div className="flex w-full justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
          <button
            onClick={() => {
              playClickSound();
              setShowHelper(!showHelper);
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            id="matrix-toggle-help"
          >
            <HelpCircle className="w-4 h-4" /> Instructions
          </button>
          <button
            onClick={() => {
              playClickSound();
              initGame();
            }}
            className="flex items-center gap-1 text-purple-500 hover:text-purple-600 cursor-pointer"
            id="matrix-toggle-restart-instant"
          >
            <RotateCcw className="w-4 h-4" /> Reset Grid
          </button>
        </div>

        <AnimatePresence>
          {showHelper && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/30 p-3 rounded-xl border border-gray-100 dark:border-slate-700/30 text-left overflow-hidden mt-2"
            >
              💡 **Rulebook:** Every light is linked! Clicking a box toggles its state (Lit ↔ Unlit) and also toggles the top, bottom, left, and right adjacent neighbors. Plan your chain-reactions to complete a fully lit matrix!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
