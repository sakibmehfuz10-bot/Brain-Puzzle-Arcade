import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, CheckCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playWinSound } from '../../lib/sound';

interface Cell {
  row: number;
  col: number;
  value: number; // 0 for empty
  original: boolean; // cannot edit original values
}

const SUDOKU_BOARDS = [
  {
    difficulty: 'Easy',
    board: [
      [1, 0, 3, 0],
      [0, 0, 0, 2],
      [3, 0, 0, 0],
      [0, 1, 0, 4]
    ],
    solution: [
      [1, 2, 3, 4],
      [4, 3, 1, 2],
      [3, 4, 2, 1],
      [2, 1, 4, 3]
    ]
  },
  {
    difficulty: 'Medium',
    board: [
      [0, 0, 4, 0],
      [4, 0, 0, 1],
      [1, 0, 0, 3],
      [0, 3, 0, 0]
    ],
    solution: [
      [3, 1, 4, 2],
      [4, 2, 3, 1],
      [1, 4, 2, 3],
      [2, 3, 1, 4]
    ]
  }
];

export function MiniSudoku() {
  const [boardIndex, setBoardIndex] = useState(0);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const initGame = (idx: number) => {
    const selected = SUDOKU_BOARDS[idx];
    const cells: Cell[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = selected.board[r][c];
        cells.push({
          row: r,
          col: c,
          value: val,
          original: val !== 0
        });
      }
    }
    setGrid(cells);
    setHasWon(false);
    setSelectedCell(null);
  };

  const setCellValue = (val: number) => {
    if (!selectedCell || hasWon) return;
    
    // Check if cell is editable
    const cellIdx = grid.findIndex(c => c.row === selectedCell.row && c.col === selectedCell.col);
    if (grid[cellIdx].original) return;

    const newGrid = [...grid];
    newGrid[cellIdx] = { ...newGrid[cellIdx], value: val };
    setGrid(newGrid);

    // Validate if the overall matrix is complete and matches the solution
    const solution = SUDOKU_BOARDS[boardIndex].solution;
    const isCompleted = newGrid.every(cell => cell.value === solution[cell.row][cell.col]);
    
    if (isCompleted) {
      setHasWon(true);
      playWinSound();
      window.dispatchEvent(new CustomEvent('unlock-achievement', { detail: { id: 'sudoku_ninja' } }));
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      playClickSound();
    }
  };

  useEffect(() => {
    initGame(boardIndex);
  }, [boardIndex]);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mini-Sudoku</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill the 4x4 matrix so every row/col has 1-4</p>
        </div>
        <select
          value={boardIndex}
          onChange={(e) => {
            playClickSound();
            setBoardIndex(Number(e.target.value));
          }}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl"
        >
          {SUDOKU_BOARDS.map((b, i) => (
            <option key={i} value={i}>{b.difficulty}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900/60 p-4 rounded-3xl mb-6 flex justify-center">
        <div className="grid grid-cols-4 gap-2 w-full max-w-xs aspect-square">
          {grid.map((cell, idx) => {
            const isSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col;
            let themeClass = "w-full h-full flex items-center justify-center text-2xl font-bold rounded-2xl transition-all cursor-pointer select-none ";
            
            if (cell.original) {
              themeClass += "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-extrabold cursor-not-allowed";
            } else {
              if (isSelected) {
                themeClass += "bg-blue-600 text-white shadow-lg shadow-blue-500/30";
              } else {
                themeClass += "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-slate-700/50";
              }
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!cell.original) {
                    playClickSound();
                    setSelectedCell({ row: cell.row, col: cell.col });
                  }
                }}
                className={themeClass}
                style={{ minHeight: '60px' }}
              >
                {cell.value !== 0 ? cell.value : ''}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {!hasWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-5 gap-3 mb-6"
          >
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setCellValue(num)}
                disabled={!selectedCell}
                className="py-4 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-2xl transition-all disabled:opacity-40 active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCellValue(0)}
              disabled={!selectedCell}
              className="py-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-2xl hover:bg-red-100 transition-all disabled:opacity-40"
            >
              Clear
            </button>
          </motion.div>
        )}

        {hasWon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-green-50 dark:bg-green-900/25 border border-green-200 dark:border-green-800/30 rounded-2xl flex flex-col items-center text-center mb-6"
          >
            <Award className="w-10 h-10 text-yellow-500 mb-2 animate-bounce" />
            <span className="font-bold text-green-800 dark:text-green-300">Fantastic! You completed the puzzle!</span>
            <button
              onClick={() => initGame(boardIndex)}
              className="mt-4 flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Replay
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>Click an empty slot, then choose a number (1-4).</span>
        <button
          onClick={() => initGame(boardIndex)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Grid
        </button>
      </div>
    </div>
  );
}
