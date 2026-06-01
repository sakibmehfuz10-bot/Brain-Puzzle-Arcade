import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { QuizDifficulty } from '../types';

interface StartScreenProps {
  key?: any;
  onStart: (topic: string, category: string, difficulty: QuizDifficulty) => void;
  isLoading: boolean;
}

const CATEGORIES = [
  'General', 'Science', 'History', 'Technology', 'Entertainment', 'Geography'
];

const DIFFICULTIES: QuizDifficulty[] = ['Easy', 'Medium', 'Hard'];

export function StartScreen({ onStart, isLoading }: StartScreenProps) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onStart(topic.trim(), category, difficulty);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-900/50">
          <BrainCircuit className="w-8 h-8" />
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">AI Quiz Arena</h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
          Challenge yourself with an AI-generated quiz across multiple question types.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            What do you want to learn today?
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. JavaScript basics..."
            className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={isLoading}
            required
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
            >
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="w-full py-4 px-4 mt-2 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Conjuring knowledge...
            </>
          ) : (
            'Start Quiz'
          )}
        </button>
      </form>
    </motion.div>
  );
}
