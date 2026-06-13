import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Glasses } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playWinSound } from '../lib/sound';
import { Question } from '../types';

interface ResultScreenProps {
  key?: any;
  score: number;
  totalQuestions: number;
  topic: string;
  onRestart: () => void;
  questions?: Question[];
  userAnswers?: string[];
}

export function ResultScreen({ score, totalQuestions, topic, onRestart, questions = [], userAnswers = [] }: ResultScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Play completion sound on result screen mount
    playWinSound();

    // Dispatch achievements dynamically
    window.dispatchEvent(new CustomEvent('unlock-achievement', { detail: { id: 'trivia_pioneer' } }));
    if (score === totalQuestions && totalQuestions > 0) {
      window.dispatchEvent(new CustomEvent('unlock-achievement', { detail: { id: 'quiz_master' } }));
    }
  }, [isLoading, score, totalQuestions]);

  useEffect(() => {
    if (isLoading) return;

    if (percentage >= 80) {
      const duration = 3.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    } else if (percentage >= 60) {
      // Standard successful completion (>= 60%) gets a nice prompt burst
      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.6 },
        zIndex: 50
      });
    }
  }, [isLoading, percentage]);

  let message = "";
  if (percentage === 100) message = "Flawless Victory!";
  else if (percentage >= 80) message = "A True Expert!";
  else if (percentage >= 60) message = "Solid Effort!";
  else message = "Keep Learning!";

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden text-center animate-pulse">
        {/* Skeleton Header */}
        <div className="pt-12 pb-10 px-8 bg-gray-900 dark:bg-slate-900 text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          <div className="w-24 h-24 mx-auto bg-slate-700 dark:bg-slate-700 rounded-[2rem] mb-6" />
          <div className="h-8 bg-slate-700 dark:bg-slate-700 rounded-full w-48 mx-auto mb-3" />
          <div className="h-4 bg-slate-700 dark:bg-slate-700 rounded-full w-32 mx-auto" />
        </div>

        {/* Skeleton Body */}
        <div className="p-8">
          <div className="flex justify-center items-center space-x-12 mb-10">
            <div className="flex flex-col items-center flex-1">
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-12 mb-3" />
              <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl w-16 animate-pulse" />
            </div>
            <div className="w-px h-16 bg-gray-200 dark:bg-slate-700" />
            <div className="flex flex-col items-center flex-1">
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-16 mb-3" />
              <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl w-16 animate-pulse" />
            </div>
          </div>
          {/* Skeleton Button */}
          <div className="w-full h-14 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden text-center"
    >
      <div className="pt-12 pb-10 px-8 bg-gray-900 dark:bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
        
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
          className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-900/50 rotate-3 transform relative z-10"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">{message}</h2>
          <p className="text-gray-400 font-medium capitalize">Topic: {topic}</p>
        </div>
      </div>

      <div className="p-8">
        {!isReviewing ? (
          <>
            <div className="flex justify-center items-center space-x-12 mb-10">
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-2">Score</p>
                <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{score}<span className="text-xl text-gray-400 font-medium">/{totalQuestions}</span></p>
              </div>
              <div className="w-px h-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-2">Accuracy</p>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{percentage}%</p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setIsReviewing(true);
              }}
              className="w-full py-4 px-6 mb-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 font-semibold rounded-2xl transition-colors flex items-center justify-center active:scale-[0.98]"
            >
              <Glasses className="w-5 h-5 mr-3" />
              Review Answers
            </button>

            <button
              onClick={() => {
                playClickSound();
                onRestart();
              }}
              className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-2xl transition-colors flex items-center justify-center active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5 mr-3" />
              Challenge Another Topic
            </button>
          </>
        ) : (
          <div className="space-y-6 text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review your answers</h3>
            <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
              {questions.map((q, i) => {
                 const userAnswer = userAnswers[i] || '';
                 const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                 return (
                   <div key={i} className="p-5 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/30">
                     <p className="font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight"><span className="text-gray-400">Q{i + 1}.</span> {q.text}</p>
                     
                     <div className="space-y-2">
                        <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border border-green-100 dark:border-green-800/30' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-100 dark:border-red-800/30'}`}>
                           <span className="text-xs uppercase tracking-widest font-bold opacity-60 mb-1 block">Your Answer</span>
                           <span className="font-medium text-lg">{userAnswer || 'No answer'}</span>
                        </div>
                        
                        {!isCorrect && (
                          <div className="p-4 rounded-xl bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border border-green-100 dark:border-green-800/30">
                             <span className="text-xs uppercase tracking-widest font-bold opacity-60 mb-1 block">Correct Answer</span>
                             <span className="font-medium text-lg">{q.correctAnswer}</span>
                          </div>
                        )}
                        
                        {(q.explanation && !isCorrect) && (
                          <p className="text-sm mt-4 text-gray-600 dark:text-gray-400 italic">"{q.explanation}"</p>
                        )}
                     </div>
                   </div>
                 );
              })}
            </div>
            
            <button
              onClick={() => {
                playClickSound();
                setIsReviewing(false);
              }}
              className="w-full mt-2 py-4 text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-800 dark:hover:text-white transition-colors"
            >
               Back to Score
            </button>
            <button
              onClick={() => {
                playClickSound();
                onRestart();
              }}
              className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-2xl transition-colors flex items-center justify-center active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5 mr-3" />
              Challenge Another Topic
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
