import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Zap, Timer, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  num1: number;
  num2: number;
  operator: '+' | '-' | '*';
  answer: number;
  options: number[];
}

export function MathSpeedRun() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = (currentScore: number): Question => {
    // Escalate difficulty based on score
    let min = 1, max = 10;
    let ops: ('+' | '-' | '*')[] = ['+', '-'];

    if (currentScore >= 10) {
      max = 20;
    }
    if (currentScore >= 25) {
      ops.push('*');
      max = 12; // keep multiplication reasonable
    }
    if (currentScore >= 50) {
      max = 30;
    }

    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let n2 = Math.floor(Math.random() * (max - min + 1)) + min;

    // Avoid negative answers for easy subtraction
    if (op === '-' && n1 < n2) {
      [n1, n2] = [n2, n1];
    }

    let ans = 0;
    switch (op) {
      case '+': ans = n1 + n2; break;
      case '-': ans = n1 - n2; break;
      case '*': ans = n1 * n2; break;
    }

    // Generate options
    const optionsSet = new Set<number>([ans]);
    while (optionsSet.size < 4) {
      const offset = Math.floor(Math.random() * 9) - 4; // -4 to +4
      const wrongAns = ans + (offset === 0 ? 5 : offset);
      if (wrongAns >= 0) optionsSet.add(wrongAns);
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return { num1: n1, num2: n2, operator: op, answer: ans, options };
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(45);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCurrentQuestion(generateQuestion(0));
  };

  const handleAnswer = (option: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(option);
    const correct = option === currentQuestion.answer;
    setIsAnswerCorrect(correct);

    if (correct) {
      setScore(prev => prev + 10 + Math.floor(streak / 3) * 2);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setCurrentQuestion(generateQuestion(score));
    }, 800);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            if (score > 100) {
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft, score]);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Zap className="w-6 h-6 mr-2 text-amber-500 fill-amber-500" /> Math Speed Run
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Answer fast to raise your combo meter</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{score}</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-900/40 p-6 rounded-2xl mb-6 relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Timer className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">{timeLeft}s remaining</span>
          </div>

          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.15, 1] }}
              className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full shadow-sm flex items-center"
            >
              🔥 Combo x{streak}
            </motion.div>
          )}
        </div>

        {/* Question View */}
        <div className="h-40 flex items-center justify-center text-center">
          {isPlaying && currentQuestion ? (
            <div className="space-y-2 select-none">
              <span className="text-4xl font-extrabold text-gray-800 dark:text-slate-100">
                {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4 text-center">
                Test your mental math power! You have 45 seconds to solve equations.
              </p>
              <button
                onClick={startGame}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
              >
                <Play className="w-4 h-4 mr-2" /> Start Math Blitz
              </button>
            </div>
          )}
        </div>

        {/* Feedback Animations */}
        <AnimatePresence>
          {isAnswerCorrect === true && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500/10 rounded-2xl flex items-center justify-center border-2 border-green-500/50"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
          )}
          {isAnswerCorrect === false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/10 rounded-2xl flex items-center justify-center border-2 border-red-500/50"
            >
              <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isPlaying && currentQuestion && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.answer;
            
            let btnClass = "py-4 text-xl font-bold rounded-2xl shadow-xs transition-all active:scale-95 border ";
            if (selectedAnswer !== null) {
              if (isCorrectOption) {
                btnClass += "bg-green-500 border-green-600 text-white";
              } else if (isSelected) {
                btnClass += "bg-red-500 border-red-600 text-white";
              } else {
                btnClass += "bg-gray-100 border-gray-200 dark:bg-slate-700 dark:border-slate-600 opacity-50";
              }
            } else {
              btnClass += "bg-white hover:bg-gray-50 border-gray-200 text-gray-800 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={btnClass}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Game statistics */}
      {!isPlaying && score > 0 && (
        <div className="mb-6 p-4 border border-blue-100 dark:border-slate-700/60 bg-blue-50/20 dark:bg-slate-900/20 rounded-2xl text-center space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white">Timer Ended! Excellent job.</h3>
          <div className="flex justify-around text-sm font-semibold">
            <div>
              <span className="text-gray-400 block text-xs">Total Score</span>
              <span className="text-blue-600 dark:text-blue-400 text-lg">{score} pts</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Best Combo streak</span>
              <span className="text-amber-500 text-lg">🔥 {bestStreak}</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 font-medium text-center">
        Solve dynamic equations rapidly. Harder questions reward heavier scoring multipliers!
      </div>
    </div>
  );
}
