import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Award, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playWinSound } from '../../lib/sound';

interface Tile {
  id: number;
  value: number;
  isEmpty: boolean;
}

export function SlidingPuzzle() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Load best moves on mount
  useEffect(() => {
    const saved = localStorage.getItem('puzzle_sliding_best_moves');
    if (saved) {
      setBestMoves(parseInt(saved, 10));
    }
  }, []);

  // Initialize ordered tiles
  const initTiles = () => {
    const list: Tile[] = [];
    for (let i = 1; i <= 8; i++) {
      list.push({ id: i, value: i, isEmpty: false });
    }
    list.push({ id: 9, value: 0, isEmpty: true });
    return list;
  };

  const checkSolvable = (arr: number[]) => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i] > arr[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const startNewGame = () => {
    playClickSound();
    let rawValues = [1, 2, 3, 4, 5, 6, 7, 8];
    // Shuffle values
    do {
      for (let i = rawValues.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rawValues[i], rawValues[j]] = [rawValues[j], rawValues[i]];
      }
    } while (!checkSolvable(rawValues));

    const shuffled: Tile[] = rawValues.map((v, idx) => ({
      id: idx + 1,
      value: v,
      isEmpty: false
    }));
    shuffled.push({ id: 9, value: 0, isEmpty: true });

    setTiles(shuffled);
    setMoves(0);
    setHasWon(false);
    setIsNewRecord(false);
    setIsPlaying(true);
  };

  const getRowCol = (index: number) => {
    return { row: Math.floor(index / 3), col: index % 3 };
  };

  const handleTileClick = (index: number) => {
    if (hasWon || !isPlaying) return;

    const tile = tiles[index];
    if (tile.isEmpty) return;

    // Find empty tile index
    const emptyIndex = tiles.findIndex(t => t.isEmpty);
    const tilePos = getRowCol(index);
    const emptyPos = getRowCol(emptyIndex);

    // Check adjacency
    const isAdjacent = 
      (Math.abs(tilePos.row - emptyPos.row) === 1 && tilePos.col === emptyPos.col) ||
      (Math.abs(tilePos.col - emptyPos.col) === 1 && tilePos.row === emptyPos.row);

    if (isAdjacent) {
      const updated = [...tiles];
      // Swap positions
      updated[emptyIndex] = { ...tile };
      updated[index] = { id: 9, value: 0, isEmpty: true };
      
      setTiles(updated);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // Check win condition
      const won = updated.slice(0, 8).every((t, idx) => t.value === idx + 1);
      if (won) {
        setHasWon(true);
        setIsPlaying(false);
        playWinSound();

        // Check high score moves
        const previousBest = bestMoves;
        const reachedNewBest = previousBest === null || nextMoves < previousBest;
        
        if (reachedNewBest) {
          setIsNewRecord(true);
          setBestMoves(nextMoves);
          localStorage.setItem('puzzle_sliding_best_moves', nextMoves.toString());

          // Launch spectacular elite side-cannon animations for high score record
          const duration = 2.5 * 1000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 4,
              angle: 60,
              spread: 60,
              origin: { x: 0, y: 0.8 },
              colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
            });
            confetti({
              particleCount: 4,
              angle: 120,
              spread: 60,
              origin: { x: 1, y: 0.8 },
              colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        } else {
          // Standard win confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        playClickSound();
      }
    }
  };

  useEffect(() => {
    setTiles(initTiles());
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sliding Tile Puzzle</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reorder numbers 1 to 8 chronologically</p>
        </div>
        <div className="flex items-center space-x-6 text-right">
          {bestMoves !== null && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-500">Best Moves</span>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">{bestMoves}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Moves</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{moves}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900/60 p-4 rounded-2xl mb-6 relative select-none">
        <div className="grid grid-cols-3 gap-3 aspect-square">
          {tiles.map((tile, index) => (
            <motion.button
              key={tile.id}
              layout
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 26
              }}
              onClick={() => handleTileClick(index)}
              className={`w-full h-full rounded-xl flex items-center justify-center text-2xl font-bold transition-shadow ${
                tile.isEmpty
                  ? 'bg-transparent'
                  : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow active:scale-95 cursor-pointer'
              }`}
              style={{ minHeight: '80px' }}
            >
              {!tile.isEmpty && tile.value}
            </motion.button>
          ))}
        </div>

        {!isPlaying && !hasWon && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs">
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">Are you ready to scramble?</p>
            <button
              onClick={startNewGame}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 mr-2" /> Start Puzzle
            </button>
          </div>
        )}

        {hasWon && (
          <div className="absolute inset-0 bg-green-500/15 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs border-2 border-green-500">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <Award className="w-12 h-12 text-yellow-500 mb-2 animate-bounce" />
              {isNewRecord && (
                <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-2 animate-pulse">
                  🏆 New Personal Record! 🏆
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Solved in {moves} moves!</h3>
              <button
                onClick={startNewGame}
                className="mt-4 flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Click the adjacent tiles next to the empty slot to swap.</span>
        {isPlaying && (
          <button
            onClick={startNewGame}
            className="flex items-center font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Scramble Again
          </button>
        )}
      </div>
    </div>
  );
}
