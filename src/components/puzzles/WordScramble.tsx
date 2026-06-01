import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playIncorrectSound } from '../../lib/sound';

const WORD_POOL = [
  { word: 'GALAXY', hint: 'A system of millions or billions of stars, together with gas and dust.' },
  { word: 'REACT', hint: 'A popular frontend framework/library built by Meta.' },
  { word: 'PYTHON', hint: 'A popular programming language named after a comedy group.' },
  { word: 'GRAVITY', hint: 'The force that attracts a body toward the center of the earth.' },
  { word: 'JOURNEY', hint: 'An act of traveling from one place to another.' },
  { word: 'CREATIVE', hint: 'Relating to or involving the imagination or original ideas.' },
  { word: 'PUZZLE', hint: 'A game, toy, or problem designed to test ingenuity or knowledge.' },
  { word: 'DASHBOARD', hint: 'An instrument panel on a vehicle or an interface of stats.' }
];

export function WordScramble() {
  const [currentWordObj, setCurrentWordObj] = useState(WORD_POOL[0]);
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const selectNewWord = () => {
    const listWithoutCurrent = WORD_POOL.filter(w => w.word !== currentWordObj.word);
    const chosen = listWithoutCurrent[Math.floor(Math.random() * listWithoutCurrent.length)] || WORD_POOL[0];
    
    // Scramble the letters
    let letterArr = chosen.word.split('');
    while (letterArr.join('') === chosen.word) {
      letterArr.sort(() => Math.random() - 0.5);
    }

    setCurrentWordObj(chosen);
    setScrambled(letterArr.join(' '));
    setUserInput('');
    setIsCorrect(null);
    setShowHint(false);
  };

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = userInput.trim().toUpperCase();
    if (cleanInput === currentWordObj.word) {
      setIsCorrect(true);
      setScore(prev => prev + 10);
      playCorrectSound();
      window.dispatchEvent(new CustomEvent('unlock-achievement', { detail: { id: 'scramble_solver' } }));
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
    } else {
      setIsCorrect(false);
      setAttempts(prev => prev + 1);
      playIncorrectSound();
    }
  };

  useEffect(() => {
    selectNewWord();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Word Scramble</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unscramble the letters to make a word</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+{score}</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900/60 rounded-2xl p-8 mb-6 text-center">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Scrambled Letters</label>
        <div className="text-3xl font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase select-none">
          {scrambled}
        </div>
      </div>

      <form onSubmit={checkAnswer} className="space-y-4">
        <div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              if (isCorrect !== null) setIsCorrect(null);
            }}
            placeholder="Type your guess..."
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:bg-white focus:border-blue-500 outline-none transition-all dark:text-white text-center text-xl font-bold tracking-wider placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
            disabled={isCorrect === true}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowHint(!showHint);
            }}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all flex items-center justify-center text-sm"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>

          <button
            type="submit"
            disabled={!userInput.trim() || isCorrect === true}
            className="flex-1 py-3 px-4 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            Check Guess
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl"
          >
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold">Hint: </span>{currentWordObj.hint}
            </p>
          </motion.div>
        )}

        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/20 rounded-xl flex items-center justify-between"
          >
            <span className="flex items-center font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Amazing! That's correct!
            </span>
            <button
              onClick={() => {
                playClickSound();
                selectNewWord();
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Next Word
            </button>
          </motion.div>
        )}

        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/20 rounded-xl flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold text-sm">Incorrect guess. Keep guessing!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
