import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Question, QuizState, QuizDifficulty } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { SoundToggle } from './components/SoundToggle';
import { playClickSound } from './lib/sound';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { SlidingPuzzle } from './components/puzzles/SlidingPuzzle';
import { WordScramble } from './components/puzzles/WordScramble';
import { MiniSudoku } from './components/puzzles/MiniSudoku';
import { MemoryCards } from './components/puzzles/MemoryCards';
import { MathSpeedRun } from './components/puzzles/MathSpeedRun';
import { MissingOperator } from './components/puzzles/MissingOperator';
import { SumGrid } from './components/puzzles/SumGrid';
import { NumberSeries } from './components/puzzles/NumberSeries';
import { ColorFlood } from './components/puzzles/ColorFlood';
import { MatrixToggle } from './components/puzzles/MatrixToggle';
import { LogicWeight } from './components/puzzles/LogicWeight';
import { MemoryEcho } from './components/puzzles/MemoryEcho';
import { IQ_PUZZLES } from './lib/puzzleList';
import { IQPuzzleEngine } from './components/puzzles/IQPuzzleEngine';
import { BrainCircuit, Grid, Type, LayoutGrid, Zap, HelpCircle, Flame, BookOpen, Trophy, Palette, Layers, Scale, Radio } from 'lucide-react';
import { useAchievements } from './context/AchievementsContext';

export default function App() {
  const { unlockedList, setTrophyModalOpen } = useAchievements();
  const [activeTab, setActiveTab] = useState<string>('quiz');
  const [gameCategoryFilter, setGameCategoryFilter] = useState<'all' | 'classic' | 'math' | 'iq'>('all');
  const [state, setState] = useState<QuizState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('Medium');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const selectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    playClickSound();
  };

  const selectFilter = (filter: typeof gameCategoryFilter) => {
    setGameCategoryFilter(filter);
    playClickSound();
  };

  const startQuiz = async (selectedTopic: string, selectedCategory: string, selectedDifficulty: QuizDifficulty, numberOfQuestions: number) => {
    setIsLoading(true);
    setTopic(selectedTopic);
    setCategory(selectedCategory);
    setDifficulty(selectedDifficulty);
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: selectedTopic, 
          category: selectedCategory, 
          difficulty: selectedDifficulty,
          count: numberOfQuestions 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await response.json();
      const sanitizedData = data.map((q: any, i: number) => ({
        ...q,
        id: q.id ? `${q.id}-${i}` : `q-${Date.now()}-${i}`
      }));
      setQuestions(sanitizedData);
      setScore(0);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setState('playing');
    } catch (error) {
      console.error(error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string, isCorrect: boolean, usedHint?: boolean) => {
    if (isCorrect) setScore(prev => prev + (usedHint ? 0.5 : 1));
    setUserAnswers(prev => [...prev, answer]);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setState('result');
    }
  };

  const resetQuiz = () => {
    setState('start');
    setQuestions([]);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const isQuizInProgress = state === 'playing' || state === 'result';

  return (
    <div className="min-h-screen py-12 px-4 selection:bg-blue-200 dark:selection:bg-blue-900 flex flex-col font-sans">
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
        <button
          onClick={() => {
            playClickSound();
            setTrophyModalOpen(true);
          }}
          className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-all shadow-sm bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 relative flex items-center justify-center text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 cursor-pointer"
          aria-label="View Achievements Trophy Room"
          title="Achievements Trophy Room"
          id="achievements-trophy-button"
        >
          <Trophy className="w-5 h-5" />
          {unlockedList.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-xs animate-pulse">
              {unlockedList.length}
            </span>
          )}
        </button>
        <SoundToggle />
        <ThemeToggle />
      </div>

      {/* Tabs Navigation (Hidden during active quiz to maintain concentration) */}
      {!isQuizInProgress && (
        <div className="w-full max-w-xl mx-auto mb-8 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Brain Puzzle Arcade</h1>
            
            {/* Category Select Filter */}
            <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => selectFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  gameCategoryFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => selectFilter('classic')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  gameCategoryFilter === 'classic'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => selectFilter('math')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  gameCategoryFilter === 'math'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Math
              </button>
              <button
                onClick={() => selectFilter('iq')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  gameCategoryFilter === 'iq'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                IQ Tests
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-none snap-x h-16 items-center">
            {/* Classic Brain games */}
            {(gameCategoryFilter === 'all' || gameCategoryFilter === 'classic') && (
              <>
                <button
                  onClick={() => selectTab('quiz')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'quiz'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
                  Quiz
                </button>
                
                <button
                  onClick={() => selectTab('sliding')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'sliding'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                  Sliding
                </button>

                <button
                  onClick={() => selectTab('scramble')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'scramble'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 mr-1.5" />
                  Scramble
                </button>

                <button
                  onClick={() => selectTab('sudoku')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'sudoku'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 mr-1.5" />
                  Sudoku
                </button>

                 <button
                  onClick={() => selectTab('memory')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'memory'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
                  Memory Match
                </button>

                <button
                  onClick={() => selectTab('flood')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'flood'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                  id="nav-tab-flood"
                >
                  <Palette className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                  Color Flood
                </button>

                <button
                  onClick={() => selectTab('matrix')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'matrix'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                  id="nav-tab-matrix"
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                  Matrix Toggle
                </button>

                <button
                  onClick={() => selectTab('echo')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'echo'
                      ? 'bg-gray-900 text-white dark:bg-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700/40 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                  id="nav-tab-echo"
                >
                  <Radio className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                  Memory Echo
                </button>
              </>
            )}

            {/* Space splitter */}
            {gameCategoryFilter === 'all' && (
              <span className="w-[1px] h-6 bg-gray-200 dark:bg-slate-700 block flex-none"></span>
            )}

            {/* Math Brain games */}
            {(gameCategoryFilter === 'all' || gameCategoryFilter === 'math') && (
              <>
                <button
                  onClick={() => selectTab('speedrun')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'speedrun'
                      ? 'bg-rose-600 text-white dark:bg-rose-600 shadow-md'
                      : 'bg-rose-50/20 dark:bg-slate-700/40 text-rose-500 hover:text-rose-900 dark:text-rose-400 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5 fill-rose-500" />
                  Math Blitz
                </button>

                <button
                  onClick={() => selectTab('operator')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'operator'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow-md'
                      : 'bg-indigo-50/20 dark:bg-slate-700/40 text-indigo-500 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  Sign Finder
                </button>

                <button
                  onClick={() => selectTab('sumgrid')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'sumgrid'
                      ? 'bg-emerald-600 text-white dark:bg-emerald-600 shadow-md'
                      : 'bg-emerald-50/20 dark:bg-slate-700/40 text-emerald-500 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 mr-1.5 fill-emerald-500" />
                  Sum Cascade
                </button>

                <button
                  onClick={() => selectTab('pattern')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'pattern'
                      ? 'bg-teal-600 text-white dark:bg-teal-600 shadow-md'
                      : 'bg-teal-50/20 dark:bg-slate-700/40 text-teal-500 hover:text-teal-900 dark:text-teal-400 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Pattern Riddle
                </button>

                <button
                  onClick={() => selectTab('weight')}
                  className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                    activeTab === 'weight'
                      ? 'bg-amber-600 text-white dark:bg-amber-600 shadow-md'
                      : 'bg-amber-50/20 dark:bg-slate-700/40 text-amber-500 hover:text-amber-900 dark:text-amber-400 dark:hover:text-white'
                  }`}
                  id="nav-tab-weight"
                >
                  <Scale className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Logic Weight
                </button>
              </>
            )}

            {/* Space splitter */}
            {(gameCategoryFilter === 'all' || gameCategoryFilter === 'iq') && (
              <span className="w-[1px] h-6 bg-gray-200 dark:bg-slate-700 block flex-none"></span>
            )}

            {/* IQ Puzzle games */}
            {(gameCategoryFilter === 'all' || gameCategoryFilter === 'iq') && (
              <>
                {IQ_PUZZLES.map(puzzle => (
                  <button
                    key={puzzle.id}
                    onClick={() => selectTab(puzzle.id)}
                    className={`flex-none snap-start py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                      activeTab === puzzle.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-50/20 dark:bg-slate-700/40 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5 fill-purple-500" />
                    {puzzle.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
      
      <main className="flex-1 flex items-center justify-center relative w-full h-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'quiz' && state === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <StartScreen 
                onStart={startQuiz} 
                isLoading={isLoading} />
            </motion.div>
          )}
          
          {activeTab === 'quiz' && state === 'playing' && questions.length > 0 && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <QuizScreen
                question={questions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                difficulty={difficulty}
                onAnswer={handleAnswer}
                onNext={nextQuestion}
              />
            </motion.div>
          )}
          
          {activeTab === 'quiz' && state === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <ResultScreen 
                score={score}
                totalQuestions={questions.length}
                topic={topic}
                onRestart={resetQuiz}
                questions={questions}
                userAnswers={userAnswers}
              />
            </motion.div>
          )}

          {activeTab === 'sliding' && (
            <motion.div
              key="sliding"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <SlidingPuzzle />
            </motion.div>
          )}

          {activeTab === 'scramble' && (
            <motion.div
              key="scramble"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <WordScramble />
            </motion.div>
          )}

          {activeTab === 'sudoku' && (
            <motion.div
              key="sudoku"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <MiniSudoku />
            </motion.div>
          )}

          {activeTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <MemoryCards />
            </motion.div>
          )}

          {activeTab === 'speedrun' && (
            <motion.div
              key="speedrun"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <MathSpeedRun />
            </motion.div>
          )}

          {activeTab === 'operator' && (
            <motion.div
              key="operator"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <MissingOperator />
            </motion.div>
          )}

          {activeTab === 'sumgrid' && (
            <motion.div
              key="sumgrid"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <SumGrid />
            </motion.div>
          )}

          {activeTab === 'pattern' && (
            <motion.div
              key="pattern"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <NumberSeries />
            </motion.div>
          )}

          {activeTab === 'flood' && (
            <motion.div
              key="flood"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <ColorFlood />
            </motion.div>
          )}

          {activeTab === 'matrix' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <MatrixToggle />
            </motion.div>
          )}

          {activeTab === 'weight' && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <LogicWeight />
            </motion.div>
          )}

          {activeTab === 'echo' && (
            <motion.div
              key="echo"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <MemoryEcho />
            </motion.div>
          )}

          {IQ_PUZZLES.map(puzzle => (
            activeTab === puzzle.id && (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex justify-center"
              >
                <IQPuzzleEngine config={puzzle} />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
}

