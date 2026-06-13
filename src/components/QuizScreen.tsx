import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Question } from '../types';
import { playClickSound, playCorrectSound, playIncorrectSound } from '../lib/sound';

interface QuizScreenProps {
  key?: any;
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  difficulty: string;
  onAnswer: (answer: string, isCorrect: boolean, usedHint?: boolean) => void;
  onNext: () => void;
}

export function QuizScreen({ question, questionNumber, totalQuestions, difficulty, onAnswer, onNext }: QuizScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillInText, setFillInText] = useState('');
  const initialTime = difficulty === 'Hard' ? 15 : difficulty === 'Medium' ? 20 : 30;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isWrongShake, setIsWrongShake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [textClue, setTextClue] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    if (isAnswered) return;
    
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  // Reset state on new question
  useEffect(() => {
    setSelectedAnswer(null);
    setFillInText('');
    setIsAnswered(false);
    setTimeLeft(initialTime);
    setIsWrongShake(false);
    setHintUsed(false);
    setEliminatedOptions([]);
    setTextClue(null);
  }, [question, initialTime]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    playIncorrectSound();
    setIsWrongShake(true);
    onAnswer('', false, hintUsed); // Empty answer means timeout
  };

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
    }

    // Fast Thinker trigger: correct answer with at least (initialTime - 4) seconds remaining (took <= 4 seconds)
    if (isCorrect && timeLeft >= initialTime - 4) {
      window.dispatchEvent(new CustomEvent('unlock-achievement', { detail: { id: 'fast_thinker' } }));
    }

    onAnswer(option, isCorrect, hintUsed);
  };

  const handleFillInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !fillInText.trim()) return;
    handleSelect(fillInText.trim());
  };

  const handleHint = () => {
    if (hintUsed || isAnswered) return;
    setHintUsed(true);

    if (question.type === 'multiple-choice' && question.options) {
      const incorrectOptions = question.options.filter(opt => opt.toLowerCase().trim() !== question.correctAnswer.toLowerCase().trim());
      if (incorrectOptions.length > 0) {
        const toEliminate = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
        setEliminatedOptions([toEliminate]);
      }
    } else if (question.type === 'fill-in-the-blank') {
      const ans = question.correctAnswer;
      setTextClue(`Starts with '${ans[0]}' and has ${ans.length} characters.`);
    } else if (question.type === 'true-false') {
      setTextClue(`Here is a clue to help: The correct answer has ${question.correctAnswer.length} letters.`);
    }
  };

  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-widest hidden sm:inline-block">
            {question.type?.replace(/-/g, ' ')}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
            difficulty === 'Easy' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {difficulty}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${timeLeft <= 5 && !isAnswered ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-700'} font-mono shadow-sm`}>
            <Timer className={`w-5 h-5 ${timeLeft <= 5 && !isAnswered ? 'animate-pulse' : ''}`} />
            <span className="text-lg font-bold">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 mt-2 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-600'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / initialTime) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-10 overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className={`bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 mb-8 ${isWrongShake ? 'animate-shake' : ''}`}
        >
          {question.imageUrl && (
            <div className="w-full h-64 mb-6 rounded-2xl overflow-hidden shadow-sm">
              <img src={question.imageUrl} referrerPolicy="no-referrer" alt="Question specific" className="w-full h-full object-cover" />
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-gray-50 leading-snug">
            {question.text}
          </h2>

          {!isAnswered && !hintUsed && (
            <button onClick={handleHint} className="flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-6 text-sm bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
              <span className="mr-2">💡</span> Get a Hint (-0.5 pts)
            </button>
          )}

          {textClue && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-xl border border-yellow-200 dark:border-yellow-800/30 flex items-start text-sm">
              <span className="mr-2 text-lg">💡</span> {textClue}
            </div>
          )}

          <div className={question.type === 'true-false' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
            {question.type === 'fill-in-the-blank' ? (
              <form onSubmit={handleFillInSubmit} className="mt-6">
                <input
                  type="text"
                  value={fillInText}
                  onChange={(e) => setFillInText(e.target.value)}
                  disabled={isAnswered}
                  placeholder="Type your answer here..."
                  className={`w-full px-6 py-5 rounded-2xl border-2 text-lg outline-none transition-all ${isAnswered ? selectedAnswer?.toLowerCase() === question.correctAnswer.toLowerCase() ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 focus:border-blue-500 dark:text-white'}`}
                />
                {!isAnswered && (
                  <button type="submit" disabled={!fillInText.trim()} className="mt-4 w-full py-4 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50">
                    Submit Answer
                  </button>
                )}
                {isAnswered && selectedAnswer?.toLowerCase() !== question.correctAnswer.toLowerCase() && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 flex items-center border border-red-200 dark:border-red-800/30">
                    <XCircle className="w-5 h-5 mr-3" />
                    <div>Correct answer was: <span className="font-bold">{question.correctAnswer}</span></div>
                  </div>
                )}
                {isAnswered && selectedAnswer?.toLowerCase() === question.correctAnswer.toLowerCase() && (
                  <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 flex items-center border border-green-200 dark:border-green-800/30">
                    <CheckCircle2 className="w-5 h-5 mr-3" />
                    <div>Correct!</div>
                  </div>
                )}
              </form>
            ) : (
              question.options?.map((option, index) => {
                const isEliminated = eliminatedOptions.includes(option);
                let btnClass = question.type === 'true-false' 
                  ? "w-full text-center px-6 py-8 rounded-2xl border-2 transition-all font-bold text-xl flex flex-col justify-center items-center gap-3" 
                  : "w-full text-left px-6 py-5 rounded-2xl border-2 transition-all font-medium flex justify-between items-center text-lg";
                let icon = null;

                if (!isAnswered) {
                  if (isEliminated) {
                    btnClass += " border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-800/30 text-gray-400 dark:text-gray-600 line-through opacity-50 cursor-not-allowed";
                  } else {
                    btnClass += " border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500/50 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 text-gray-800 dark:text-gray-200";
                  }
                } else {
                  if (option === question.correctAnswer) {
                    btnClass += " border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 shadow-sm";
                    icon = <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400" />;
                  } else if (option === selectedAnswer) {
                    btnClass += " border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                    icon = <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />;
                  } else {
                    btnClass += " border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50 opacity-40 text-gray-500 border-dashed";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isEliminated) handleSelect(option);
                    }}
                    disabled={isAnswered || isEliminated}
                    className={btnClass}
                  >
                    <span className={question.type === 'true-false' ? "" : "flex-1 pr-4"}>{option}</span>
                    {icon && (question.type === 'true-false' ? icon : React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' }))}
                  </button>
                );
              })
            )}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              className="mt-8 p-6 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30"
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Explanation</p>
                  <p className="text-blue-800/80 dark:text-blue-200/80 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-10"
        >
          <button
            onClick={() => {
              playClickSound();
              onNext();
            }}
            className="flex items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-gray-900/20 dark:shadow-none"
          >
            {questionNumber === totalQuestions ? 'See Final Results' : 'Next Question'}
            <ArrowRight className="w-5 h-5 ml-3" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
