import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, HelpCircle } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, playWinSound } from '../../lib/sound';

interface PuzzleConfig {
  id: string;
  name: string;
  description: string;
  generator: (level: number) => { question: string | React.ReactNode, options?: string[], correctAnswer: string, explanation: string };
}

export function IQPuzzleEngine({ config }: { config: PuzzleConfig }) {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState(config.generator(1));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [hasWonLevel, setHasWonLevel] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setLevel(1);
    setScore(0);
    setPuzzle(config.generator(1));
    resetTurn();
  }, [config.id]);

  const resetTurn = () => {
    setSelectedAnswer(null);
    setInputAnswer('');
    setHasWonLevel(null);
  };

  const handleAnswer = (answer: string) => {
    if (hasWonLevel !== null) return;
    
    setSelectedAnswer(answer);
    
    if (answer.toLowerCase().trim() === puzzle.correctAnswer.toLowerCase().trim()) {
      playCorrectSound();
      setHasWonLevel(true);
      setScore(s => s + 10);
      setTimeout(() => {
        setLevel(l => l + 1);
        setPuzzle(config.generator(level + 1));
        resetTurn();
      }, 1500);
    } else {
      playIncorrectSound();
      setHasWonLevel(false);
      setTimeout(() => {
        // You don't advance level if wrong, you answer again or lose
        resetTurn();
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAnswer.trim()) {
      handleAnswer(inputAnswer);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Level</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{level}</p>
        </div>
      </div>

      <div className="mb-8 p-6 bg-blue-50/50 dark:bg-slate-700/30 rounded-2xl border border-blue-100 dark:border-slate-600/50 text-center relative overflow-hidden">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{puzzle.question}</h3>
      </div>

      <div className="space-y-4">
        {puzzle.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {puzzle.options.map((opt, i) => {
              let btnClass = "w-full p-4 rounded-xl font-bold text-lg transition-all border-2 ";
              if (hasWonLevel === null) {
                btnClass += "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:border-blue-400 text-gray-800 dark:text-gray-200";
              } else if (hasWonLevel && opt === puzzle.correctAnswer) {
                btnClass += "bg-green-100 border-green-500 text-green-800";
              } else if (!hasWonLevel && opt === selectedAnswer) {
                btnClass += "bg-red-100 border-red-500 text-red-800";
              } else if (!hasWonLevel && opt === puzzle.correctAnswer) {
                btnClass += "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200";
              } else {
                btnClass += "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 dark:text-gray-500";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={hasWonLevel !== null}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 text-black dark:text-white items-center">
            <input 
              type="text" 
              value={inputAnswer} 
              onChange={e => setInputAnswer(e.target.value)}
              disabled={hasWonLevel !== null}
              placeholder="Type your answer..."
              className="flex-1 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 text-lg"
            />
            <button 
              type="submit"
              disabled={hasWonLevel !== null || !inputAnswer.trim()}
              className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
            >
              Submit
            </button>
          </form>
        )}
      </div>
      
      <AnimatePresence>
        {hasWonLevel !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${hasWonLevel ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
          >
            {hasWonLevel ? <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" /> : <XCircle className="w-6 h-6 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{hasWonLevel ? 'Correct!' : 'Incorrect!'}</p>
              <p className="text-sm mt-1">{hasWonLevel ? puzzle.explanation : 'Try again!'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
