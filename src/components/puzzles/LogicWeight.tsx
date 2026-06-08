import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, RotateCcw, HelpCircle, Trophy, Sparkles, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playIncorrectSound, playWinSound } from '../../lib/sound';

const EMOJI_POOL = ['💎', '🏆', '🥇', '🎁', '🎈', '🥥', '🍔', '🚀', '🔑', '🧊'];

interface OrderItem {
  emoji: string;
  weight: number;
}

export function LogicWeight() {
  const [itemsCount, setItemsCount] = useState<3 | 4 | 5>(4); // Easy=3, Medium=4, Hard=5 items
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  
  // Game states
  const [secretScaleItems, setSecretScaleItems] = useState<OrderItem[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]); // User's clicked order from heaviest -> lightest
  const [solved, setSolved] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('puzzle_weight_best_streak');
    if (saved) {
      setBestStreak(parseInt(saved, 10));
    }
  }, []);

  const generateClues = (sortedItems: OrderItem[]) => {
    // We want to generate clues that make the sorted order fully deducible without being too obvious.
    // Pairwise relationships: e.g. "Diamond > Medal", or "Medal > Gift".
    const parsedClues: string[] = [];
    const len = sortedItems.length;

    // To ensure it is solvable, let's establish simple adjacencies
    // e.g., A > B, B > C, C > D
    for (let i = 0; i < len - 1; i++) {
      const heavier = sortedItems[i].emoji;
      const lighter = sortedItems[i + 1].emoji;
      
      // Randomly change the clue wording: "X is heavier than Y" or "Y is lighter than X"
      if (Math.random() > 0.5) {
        parsedClues.push(`${heavier} is heavier than ${lighter}`);
      } else {
        parsedClues.push(`${lighter} is lighter than ${heavier}`);
      }
    }

    // Add 1 or 2 extra random clues for flavor if itemsCount > 3
    if (len > 3) {
      // Connect non-adjacent ones (e.g. A > C or B > D)
      const offset = 2;
      const i = Math.floor(Math.random() * (len - offset));
      const heavier = sortedItems[i].emoji;
      const lighter = sortedItems[i + offset].emoji;
      if (Math.random() > 0.5) {
        parsedClues.push(`${heavier} weighs more than ${lighter}`);
      } else {
        parsedClues.push(`${lighter} weighs less than ${heavier}`);
      }
    }

    // Shuffle the clues in random display order
    return parsedClues.sort(() => Math.random() - 0.5);
  };

  const initLevel = () => {
    // Select dynamic pool of emojis randomly
    const shuffledPool = [...EMOJI_POOL].sort(() => Math.random() - 0.5);
    const chosenEmojis = shuffledPool.slice(0, itemsCount);

    // Assign secret weight values from lightest to heaviest (1 to itemsCount)
    const scaleItems: OrderItem[] = chosenEmojis.map((emoji, idx) => ({
      emoji,
      weight: idx + 1, // Secret unique weight
    }));

    // Secret sorted order: Heaviest to Lightest (highest weight first)
    const sortedItems = [...scaleItems].sort((a, b) => b.weight - a.weight);

    // Generate clues based on secret sorted order
    const generated = generateClues(sortedItems);

    setSecretScaleItems(scaleItems);
    setClues(generated);
    setUserSelection([]);
    setSolved(null);
    setIsNewRecord(false);
  };

  useEffect(() => {
    initLevel();
  }, [itemsCount]);

  const handleEmojiClick = (emoji: string) => {
    if (solved === true) return;
    
    playClickSound();

    if (userSelection.includes(emoji)) {
      // De-select emoji
      setUserSelection(prev => prev.filter(e => e !== emoji));
    } else {
      // Select emoji
      setUserSelection(prev => [...prev, emoji]);
    }
  };

  const verifySolution = () => {
    if (userSelection.length !== itemsCount) return;

    // Find the correct sorted order: Heaviest list (Weight itemsCount down to 1)
    const sortedSecretOrder = [...secretScaleItems]
      .sort((a, b) => b.weight - a.weight)
      .map(item => item.emoji);

    // Compare
    const isCorrect = userSelection.every((e, idx) => e === sortedSecretOrder[idx]);

    if (isCorrect) {
      playCorrectSound();
      setSolved(true);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore(prev => prev + 40 + itemsCount * 5); // Larger size grants higher scores!

      // Check record
      const previousStreak = bestStreak || 0;
      if (nextStreak > previousStreak) {
        setIsNewRecord(true);
        setBestStreak(nextStreak);
        localStorage.setItem('puzzle_weight_best_streak', nextStreak.toString());

        // Stream confetti celebrating high score streak
        const duration = 2 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        confetti({
          particleCount: 60,
          spread: 45,
          origin: { y: 0.8 }
        });
      }
    } else {
      playIncorrectSound();
      setSolved(false);
      setStreak(0);
    }
  };

  const handleNext = () => {
    playClickSound();
    setLevel(prev => prev + 1);
    initLevel();
  };

  const handleResetStreak = () => {
    playClickSound();
    setStreak(0);
    setScore(0);
    setLevel(1);
    initLevel();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl" id="logic-weight-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-500" />
            Logic Weight
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deduce weights and sort Heaviest → Lightest</p>
        </div>

        {/* Dynamic Scale difficulty toggle */}
        <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl text-xs font-bold leading-none select-none select-none">
          <button
            onClick={() => { playClickSound(); setItemsCount(3); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              itemsCount === 3
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Easy (3)
          </button>
          <button
            onClick={() => { playClickSound(); setItemsCount(4); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              itemsCount === 4
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Mid (4)
          </button>
          <button
            onClick={() => { playClickSound(); setItemsCount(5); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              itemsCount === 5
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Hard (5)
          </button>
        </div>
      </div>

      {/* Info Stats indicators */}
      <div className="flex justify-between items-center mb-6 text-center bg-gray-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-gray-100 dark:border-slate-700/40 text-xs">
        <div>
          <span className="text-gray-400 block font-bold uppercase tracking-widest text-[9px]">Streak</span>
          <p className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
            🔥 {streak}
          </p>
        </div>
        {bestStreak !== null && (
          <div>
            <span className="text-green-500 block font-bold uppercase tracking-widest text-[9px]">Best Streak</span>
            <p className="text-base font-black text-green-600 dark:text-green-400">🏆 {bestStreak}</p>
          </div>
        )}
        <div>
          <span className="text-gray-400 block font-bold uppercase tracking-widest text-[9px]">Score</span>
          <p className="text-base font-black text-indigo-600 dark:text-indigo-400">+{score}</p>
        </div>
      </div>

      {/* Clues box panel */}
      <div className="mb-6 bg-amber-550/5 dark:bg-amber-400/5 border border-amber-200/40 dark:border-amber-400/20 p-4 rounded-2xl relative">
        <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold uppercase text-[9px] tracking-widest rounded-md">
          ⚖️ Balance Scales Reports
        </span>
        <div className="space-y-2 mt-2">
          {clues.map((clue, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
              <span className="text-amber-500 text-xs shrink-0">■</span>
              <p>{clue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secret objects collection selection */}
      <div className="mb-6">
        <p className="text-center text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
          Available Objects (Click to Rank heaviest to lightest)
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {secretScaleItems.map((item) => {
            const isClickSelected = userSelection.includes(item.emoji);
            const rankIndex = userSelection.indexOf(item.emoji);
            
            return (
              <button
                key={item.emoji}
                onClick={() => handleEmojiClick(item.emoji)}
                disabled={solved === true}
                className={`relative w-14 h-14 rounded-2xl cursor-pointer text-2xl flex flex-col items-center justify-center border font-bold transition-all transform active:scale-90 ${
                  isClickSelected
                    ? 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500 text-amber-600 scale-95 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:scale-105'
                }`}
                id={`logic-weight-btn-${item.emoji}`}
              >
                <span>{item.emoji}</span>
                {isClickSelected && (
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-500 text-white border-2 border-white dark:border-slate-800 text-[11px] font-black flex items-center justify-center shadow-xs">
                    {rankIndex + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Selection Queue preview */}
      <div className="mb-6 overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/60 min-h-[70px] flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">
              ⚖️ Secret Order Guess:
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {userSelection.length === 0 ? (
                <span className="text-xs italic text-gray-400">Click items above to assemble sequence guesses...</span>
              ) : (
                userSelection.map((emoji, idx) => (
                  <div key={emoji} className="flex items-center gap-1.5">
                    <span className="text-2xl">{emoji}</span>
                    {idx < userSelection.length - 1 && <span className="text-gray-300 dark:text-slate-600 text-xs font-black">➔</span>}
                  </div>
                ))
              )}
            </div>
          </div>
          {userSelection.length > 0 && solved !== true && (
            <button
              onClick={() => { playClickSound(); setUserSelection([]); }}
              className="text-xs text-red-500 hover:text-red-600 font-bold uppercase shrink-0 hover:underline cursor-pointer"
              id="logic-weight-clear"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Feedback & Submission controls */}
      <div className="space-y-4">
        {solved === null ? (
          <button
            onClick={verifySolution}
            disabled={userSelection.length !== itemsCount}
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center transition-all shadow-md transform active:scale-[0.98] ${
              userSelection.length === itemsCount
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
            id="logic-weight-check-btn"
          >
            <Check className="w-4 h-4 mr-1.5" /> Confirm Sequence
          </button>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {solved === true ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/20 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-extrabold flex items-center gap-1.5">
                      ★ Decoded Successfully!
                      {isNewRecord && (
                        <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full animate-pulse inline-block">
                          🥇 New Record! 🥇
                        </span>
                      )}
                    </span>
                    <span className="opacity-85">You correctly ranked the relative weight scales! Keep up the brilliant deduction streak.</span>
                  </div>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                    id="logic-weight-next-btn"
                  >
                    Next Level <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/20 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">Deduction Failed</span>
                    <span className="opacity-80">That sequence order is incorrect. Recheck the balance report scale clues!</span>
                  </div>
                  <button
                    onClick={() => { playClickSound(); setUserSelection([]); setSolved(null); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    id="logic-weight-try-again-btn"
                  >
                    Try Order Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Global actions and help panel */}
        <div className="flex w-full justify-between items-center text-xs font-semibold pt-2 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={() => {
              playClickSound();
              setShowHelper(!showHelper);
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            id="logic-weight-help"
          >
            <HelpCircle className="w-4 h-4" /> Instructions
          </button>
          <button
            onClick={handleResetStreak}
            className="flex items-center gap-1 text-amber-500 hover:text-amber-600 cursor-pointer"
            id="logic-weight-reset-btn"
          >
            <RotateCcw className="w-4 h-4" /> Reset Streak
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
              💡 **Rulebook:** Each emoji objects have sequential private weights. 
              Analyze the balance scale reports (where "X weighs more than Y" means X is heavier than Y, and "Y weighs less than X" means Y is lighter than X) and use process of elimination or transitivity to arrange them. Click the objects in order starting from **Heaviest (Rank 1)** down to **Lightest**.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
