import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Award, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🧠', '⚡', '🌟', '🍀', '🍎', '🐱', '🐼', '🚀'];

export function MemoryCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]); // indexes of flipped cards
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const initGame = () => {
    // Generate matched pairs
    const pairList = [...EMOJIS, ...EMOJIS];
    // Shuffle
    for (let i = pairList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairList[i], pairList[j]] = [pairList[j], pairList[i]];
    }

    const initialCards: Card[] = pairList.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));

    setCards(initialCards);
    setSelected([]);
    setMoves(0);
    setHasWon(false);
    setIsPlaying(true);
  };

  const handleCardClick = (index: number) => {
    if (!isPlaying || selected.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Matched!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setSelected([]);

          // Check if won
          const won = matchedCards.every(c => c.isMatched);
          if (won) {
            setHasWon(true);
            setIsPlaying(false);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }, 500);
      } else {
        // Mis-match, flip back
        setTimeout(() => {
          const flippedBack = [...cards];
          flippedBack[firstIdx].isFlipped = false;
          flippedBack[secondIdx].isFlipped = false;
          setCards(flippedBack);
          setSelected([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Memory Match</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Match all the hidden emoji pairs</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Moves</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{moves}</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900/60 p-4 rounded-3xl mb-6 relative">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="aspect-square relative cursor-pointer select-none"
            >
              <motion.div
                className="w-full h-full rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-200/50 dark:border-slate-600/50"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  transformStyle: 'preserve-3d',
                  backgroundColor: card.isMatched 
                    ? '#dcfce7' 
                    : card.isFlipped 
                      ? '#ffffff' 
                      : '#3b82f6',
                  color: card.isMatched ? '#15803d' : '#ffffff'
                }}
              >
                {(card.isFlipped || card.isMatched) ? (
                  <span style={{ transform: 'rotateY(180deg)' }}>{card.emoji}</span>
                ) : (
                  <span className="text-xl font-bold">?</span>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {hasWon && (
          <div className="absolute inset-0 bg-green-500/15 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xs border-2 border-green-500">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <Award className="w-12 h-12 text-yellow-500 mb-2 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cleared in {moves} moves!</h3>
              <button
                onClick={initGame}
                className="mt-4 flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>Click on any card to reveal its symbol.</span>
        <button
          onClick={initGame}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-shuffle Cards
        </button>
      </div>
    </div>
  );
}
