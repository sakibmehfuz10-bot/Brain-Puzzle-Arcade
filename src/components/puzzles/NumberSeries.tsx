import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, RefreshCw, AlertTriangle, ArrowRight, BookOpen, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeriesPuzzle {
  sequenceDisplay: string;
  solution: number;
  patternType: string;
  hint: string;
  options: number[];
}

const PUZZLE_SERIES: SeriesPuzzle[] = [
  {
    sequenceDisplay: "2, 4, 8, 16, 32, ?",
    solution: 64,
    patternType: "Geometric progression",
    hint: "Every term is multiplied by 2 to generate the next one.",
    options: [48, 64, 128, 56]
  },
  {
    sequenceDisplay: "1, 4, 9, 16, 25, ?",
    solution: 36,
    patternType: "Perfect Squares",
    hint: "Find the squares of positive integers: 1², 2², 3², 4², etc.",
    options: [30, 36, 49, 42]
  },
  {
    sequenceDisplay: "1, 1, 2, 3, 5, 8, 13, ?",
    solution: 21,
    patternType: "Fibonacci Sequence",
    hint: "Add the two preceding numbers to find the next value.",
    options: [18, 20, 21, 25]
  },
  {
    sequenceDisplay: "3, 5, 9, 17, 33, ?",
    solution: 65,
    patternType: "Double minus one",
    hint: "Multiply by 2 and subtract 1 from the result.",
    options: [50, 66, 65, 49]
  },
  {
    sequenceDisplay: "2, 3, 5, 7, 11, 13, ?",
    solution: 17,
    patternType: "Prime Numbers",
    hint: "Think about the sequence of numbers only divisible by 1 and themselves.",
    options: [15, 17, 19, 21]
  },
  {
    sequenceDisplay: "10, 15, 12, 17, 14, 19, ?",
    solution: 16,
    patternType: "Alternate Addition-Subtraction",
    hint: "Perform +5, subtract 3, perform +5, subtract 3, successively.",
    options: [15, 16, 17, 21]
  },
  {
    sequenceDisplay: "1, 8, 27, 64, 125, ?",
    solution: 216,
    patternType: "Perfect Cubes",
    hint: "Multiply each progressive natural number to power 3: 1³, 2³, 3³, etc.",
    options: [150, 196, 216, 243]
  },
  {
    sequenceDisplay: "1, 2, 6, 24, 120, ?",
    solution: 720,
    patternType: "Factorials",
    hint: "Multiply consecutive integers: 1*2, 2*3, 6*4, 24*5, etc.",
    options: [240, 500, 600, 720]
  }
];

export function NumberSeries() {
  const [level, setLevel] = useState(0);
  const [selectedWordObj, setSelectedWordObj] = useState<SeriesPuzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  const initLevel = (lvlIndex: number) => {
    const puzzle = PUZZLE_SERIES[lvlIndex % PUZZLE_SERIES.length];
    
    // Shuffle the options array slightly so order is unique
    const randomizedOptions = [...puzzle.options].sort(() => Math.random() - 0.5);

    setSelectedWordObj({
      ...puzzle,
      options: randomizedOptions
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
  };

  const handleChoice = (num: number) => {
    if (selectedAnswer !== null || !selectedWordObj) return;

    setSelectedAnswer(num);
    const correct = num === selectedWordObj.solution;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 25);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
  };

  const advanceLevel = () => {
    const nextIdx = level + 1;
    setLevel(nextIdx);
    initLevel(nextIdx);
  };

  useEffect(() => {
    initLevel(0);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-teal-500" /> Pattern Riddle
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Figure out the sequence pattern logic</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</span>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400">+{score}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-extrabold px-3 py-1 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full border border-teal-100 dark:border-teal-900/30">
          Pattern stage {level + 1} of {PUZZLE_SERIES.length}
        </span>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900/60 rounded-3xl p-8 mb-6 text-center select-none">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-4">Complete the sequence</label>
        <div className="text-3xl font-extrabold tracking-wide text-teal-600 dark:text-teal-400">
          {selectedWordObj?.sequenceDisplay}
        </div>
      </div>

      {selectedWordObj && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {selectedWordObj.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === selectedWordObj.solution;

            let choiceClass = "py-4 text-xl font-bold rounded-2xl border transition-all active:scale-95 shadow-xs ";
            if (selectedAnswer !== null) {
              if (isCorrectOption) {
                choiceClass += "bg-green-500 border-green-600 text-white";
              } else if (isSelected) {
                choiceClass += "bg-red-500 border-red-600 text-white";
              } else {
                choiceClass += "bg-gray-100 border-gray-200 dark:bg-slate-700 dark:border-slate-600 opacity-55";
              }
            } else {
              choiceClass += "bg-white hover:bg-gray-50 border-gray-200 text-gray-800 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600";
            }

            return (
              <button
                key={idx}
                onClick={() => handleChoice(option)}
                disabled={selectedAnswer !== null}
                className={choiceClass}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex space-x-3 mb-4">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-xs"
        >
          {showHint ? 'Hide Hint Log' : 'Examine Pattern Hint'}
        </button>
      </div>

      <AnimatePresence>
        {showHint && selectedWordObj && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl"
          >
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold">Logic:</span> {selectedWordObj.hint}
            </p>
          </motion.div>
        )}

        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/20 rounded-xl flex items-center justify-between"
          >
            <div className="text-xs">
              <span className="font-bold block">Correct Pattern!</span>
              <span className="opacity-80">It is a {selectedWordObj?.patternType}.</span>
            </div>
            <button
              onClick={advanceLevel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center"
            >
              Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </motion.div>
        )}

        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/20 rounded-xl flex items-center"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-semibold text-xs text-red-700 dark:text-red-400">Incorrect! Expose hint and analyze terms.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-400 font-medium text-center mt-6">
        Test your cognitive numeric reasoning with sequence series puzzles.
      </div>
    </div>
  );
}
