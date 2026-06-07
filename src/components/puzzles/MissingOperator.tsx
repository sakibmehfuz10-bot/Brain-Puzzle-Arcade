import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, RefreshCw, Check, AlertTriangle, Play, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playIncorrectSound } from '../../lib/sound';

interface OperatorQuestion {
  num1: number;
  num2: number;
  num3?: number;
  operator1: string;
  operator2?: string;
  target: number;
  options: string[];
}

export function MissingOperator() {
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<OperatorQuestion | null>(null);
  const [selectedOp1, setSelectedOp1] = useState<string | null>(null);
  const [selectedOp2, setSelectedOp2] = useState<string | null>(null);
  const [hasWonLevel, setHasWonLevel] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [bestLevel, setBestLevel] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('puzzle_operator_best_level');
    if (saved) {
      setBestLevel(parseInt(saved, 10));
    }
  }, []);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? Math.floor(a / b) : 0;
      default: return 0;
    }
  };

  const generateLevelsOfMath = (lvl: number): OperatorQuestion => {
    const ops = ['+', '-', '×', '÷'];
    
    if (lvl <= 5) {
      // Level 1-5: Single operator questions
      while (true) {
        const op = ops[Math.floor(Math.random() * ops.length)];
        const n1 = Math.floor(Math.random() * 20) + 2;
        const n2 = Math.floor(Math.random() * 10) + 1;

        if (op === '÷' && n1 % n2 !== 0) continue;

        const targetVal = calculate(n1, n2, op);
        if (targetVal < 0 || targetVal > 100) continue;

        return {
          num1: n1,
          num2: n2,
          operator1: op,
          target: targetVal,
          options: ops
        };
      }
    } else {
      // Level 6+: Double operators equation like: (n1 [op1] n2) [op2] n3 = target
      while (true) {
        const op1 = ops[Math.floor(Math.random() * ops.length)];
        const op2 = ops[Math.floor(Math.random() * ops.length)];
        const n1 = Math.floor(Math.random() * 12) + 2;
        const n2 = Math.floor(Math.random() * 8) + 1;
        const n3 = Math.floor(Math.random() * 6) + 1;

        if (op1 === '÷' && n1 % n2 !== 0) continue;
        const subResult = calculate(n1, n2, op1);

        if (op2 === '÷' && (n3 === 0 || subResult % n3 !== 0)) continue;
        const targetVal = calculate(subResult, n3, op2);

        if (targetVal < 0 || targetVal > 150) continue;

        return {
          num1: n1,
          num2: n2,
          num3: n3,
          operator1: op1,
          operator2: op2,
          target: targetVal,
          options: ops
        };
      }
    }
  };

  const startLevel = (lvl: number) => {
    playClickSound();
    setLevel(lvl);
    setCurrentQuestion(generateLevelsOfMath(lvl));
    setSelectedOp1(null);
    setSelectedOp2(null);
    setHasWonLevel(null);
    setIsNewRecord(false);
  };

  const selectOperator = (op: string) => {
    if (hasWonLevel === true) return;
    playClickSound();

    if (!selectedOp1) {
      setSelectedOp1(op);
    } else if (currentQuestion?.num3 && !selectedOp2) {
      setSelectedOp2(op);
    }
  };

  const clearSelection = () => {
    playClickSound();
    setSelectedOp1(null);
    setSelectedOp2(null);
    setHasWonLevel(null);
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;
    if (currentQuestion.num3) {
      if (selectedOp1 && selectedOp2) {
        const subRes = calculate(currentQuestion.num1, currentQuestion.num2, selectedOp1);
        const finalRes = calculate(subRes, currentQuestion.num3, selectedOp2);
        correct = finalRes === currentQuestion.target;
      }
    } else {
      if (selectedOp1) {
        const finalRes = calculate(currentQuestion.num1, currentQuestion.num2, selectedOp1);
        correct = finalRes === currentQuestion.target;
      }
    }

    if (correct) {
      playCorrectSound();
      setHasWonLevel(true);
      setScore(prev => prev + lvlBonus());

      const previousBest = bestLevel || 0;
      const reachedNewBest = level > previousBest;

      if (reachedNewBest) {
        setIsNewRecord(true);
        setBestLevel(level);
        localStorage.setItem('puzzle_operator_best_level', level.toString());

        // Epic dual side-cannons confetti stream for high level record
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 },
            colors: ['#6366f1', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 },
            colors: ['#6366f1', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        // Standard solved level confetti
        confetti({
          particleCount: 60,
          spread: 45,
          origin: { y: 0.8 }
        });
      }
    } else {
      playIncorrectSound();
      setHasWonLevel(false);
    }
  };

  const advanceLevel = () => {
    startLevel(level + 1);
  };

  const lvlBonus = () => (level >= 6 ? 25 : 10);

  useEffect(() => {
    startLevel(1);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-indigo-500" /> Missing Operator
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill the blank equations correctly</p>
        </div>
        <div className="flex items-center space-x-6 text-right">
          {bestLevel !== null && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-500">Best Level</span>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">Lvl {bestLevel}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">+{score}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50">
          Equation Solver Level {level}
        </span>
        {level >= 6 && (
          <span className="text-xs font-semibold text-rose-500 animate-pulse">🔥 Duo Equation Mode</span>
        )}
      </div>

      <div className="bg-gradient-to-br from-indigo-50/40 to-blue-50/20 dark:from-slate-900/40 dark:to-slate-800 p-8 rounded-2xl mb-6 relative text-center">
        {currentQuestion && (
          <div className="flex items-center justify-center space-x-3 text-3xl font-extrabold text-gray-800 dark:text-white select-none">
            {currentQuestion.num3 && <span>(</span>}
            <span>{currentQuestion.num1}</span>
            
            {/* Blank Slot 1 */}
            <button
              onClick={() => setSelectedOp1(null)}
              className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 text-2xl font-bold transition-all ${
                selectedOp1
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white border-dashed border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-transparent animate-pulse'
              }`}
            >
              {selectedOp1 || '?'}
            </button>

            <span>{currentQuestion.num2}</span>
            {currentQuestion.num3 && <span>)</span>}

            {/* Blank Slot 2 (if dynamic duo mode is on) */}
            {currentQuestion.num3 && (
              <>
                <button
                  onClick={() => setSelectedOp2(null)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 text-2xl font-bold transition-all ${
                    selectedOp2
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white border-dashed border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-transparent animate-pulse'
                  }`}
                >
                  {selectedOp2 || '?'}
                </button>
                <span>{currentQuestion.num3}</span>
              </>
            )}

            <span>=</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentQuestion.target}</span>
          </div>
        )}

        <AnimatePresence>
          {hasWonLevel === true && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-green-500/10 rounded-2xl border border-green-500 flex flex-col items-center justify-center p-3"
            >
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col items-center max-w-[90%]">
                <Check className="w-8 h-8 text-green-500 mb-1" />
                {isNewRecord && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mb-1 animate-pulse">
                    🏆 New Best Level! 🏆
                  </span>
                )}
                <span className="text-sm font-bold text-gray-800 dark:text-white text-center">Solved correctly! (+{lvlBonus()} pts)</span>
                <button
                  onClick={advanceLevel}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center"
                >
                  Next Level <span className="ml-1">➔</span>
                </button>
              </div>
            </motion.div>
          )}

          {hasWonLevel === false && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-red-500/10 rounded-2xl border border-red-500 flex flex-col items-center justify-center"
            >
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col items-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-1 animate-bounce" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Incorrect calculation!</span>
                <button
                  onClick={clearSelection}
                  className="mt-3 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Operator options list */}
      {currentQuestion && hasWonLevel === null && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {currentQuestion.options.map(op => (
              <button
                key={op}
                onClick={() => selectOperator(op)}
                className="py-4 bg-white hover:bg-gray-50 border-2 border-gray-200 dark:bg-slate-700 dark:border-slate-600 text-2xl font-black text-gray-800 dark:text-white rounded-2xl active:scale-95 transition-all shadow-sm"
              >
                {op}
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={clearSelection}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-xs"
            >
              Reset Sign Space
            </button>
            <button
              onClick={checkAnswer}
              disabled={!selectedOp1 || (!!currentQuestion.num3 && !selectedOp2)}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs disabled:opacity-40"
            >
              Validate Solution
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 font-medium text-center">
        Complete bracket calculations matching the objective target value. Level up raises complexity.
      </div>
    </div>
  );
}
