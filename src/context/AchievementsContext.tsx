import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Trophy, Compass, Award, Zap, Grid, BrainCircuit, Type, Sparkles,
  Lock, CheckCircle2, Award as TrophyIcon, Flame, X, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Achievement, ACHIEVEMENTS_LIST, getUnlockedAchievements, saveUnlockedAchievements } from '../lib/achievements';

interface AchievementsContextType {
  unlockedList: string[];
  isTrophyModalOpen: boolean;
  setTrophyModalOpen: (open: boolean) => void;
  triggerUnlock: (id: string) => void;
  resetProgress: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [unlockedList, setUnlockedList] = useState<string[]>([]);
  const [isTrophyModalOpen, setTrophyModalOpen] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [activeNotification, setActiveNotification] = useState<Achievement | null>(null);

  // Initialize and load from standard localStorage on load
  useEffect(() => {
    const list = getUnlockedAchievements();
    setUnlockedList(list);
  }, []);

  // Event listener for global events dispatched from non-context files
  useEffect(() => {
    const handleUnlockEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      if (customEvent.detail && customEvent.detail.id) {
        triggerUnlock(customEvent.detail.id);
      }
    };

    window.addEventListener('unlock-achievement', handleUnlockEvent);
    return () => {
      window.removeEventListener('unlock-achievement', handleUnlockEvent);
    };
  }, [unlockedList]);

  // Queue runner for showing notifications one-by-one
  useEffect(() => {
    if (notificationQueue.length > 0 && !activeNotification) {
      const nextNotification = notificationQueue[0];
      setNotificationQueue(prev => prev.slice(1));
      setActiveNotification(nextNotification);
      
      // Fire beautiful interactive fireworks confetti
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [notificationQueue, activeNotification]);

  const triggerUnlock = (id: string) => {
    if (unlockedList.includes(id)) return;

    const findBadge = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (!findBadge) return;

    const updated = [...unlockedList, id];
    
    // Check if Arcade Champion is unlocked (which requires 3 other basic achievements)
    const isArcadeChampionUnlocked = updated.includes('arcade_champion');
    const basicEarnedCount = updated.filter(earnedId => earnedId !== 'arcade_champion').length;

    if (!isArcadeChampionUnlocked && basicEarnedCount >= 3) {
      const finalUpdated = [...updated, 'arcade_champion'];
      const cupBadge = ACHIEVEMENTS_LIST.find(a => a.id === 'arcade_champion');
      
      setUnlockedList(finalUpdated);
      saveUnlockedAchievements(finalUpdated);
      
      // Add both to notifications!
      setNotificationQueue(prev => {
        const queue = [...prev, findBadge];
        if (cupBadge) queue.push(cupBadge);
        return queue;
      });
    } else {
      setUnlockedList(updated);
      saveUnlockedAchievements(updated);
      setNotificationQueue(prev => [...prev, findBadge]);
    }
  };

  const resetProgress = () => {
    setUnlockedList([]);
    saveUnlockedAchievements([]);
  };

  const mapIcon = (iconName: string, className: string = "w-6 h-6") => {
    switch (iconName) {
      case 'Trophy': return <Trophy className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Grid': return <Grid className={className} />;
      case 'BrainCircuit': return <BrainCircuit className={className} />;
      case 'Type': return <Type className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      default: return <Award className={className} />;
    }
  };

  return (
    <AchievementsContext.Provider value={{ unlockedList, isTrophyModalOpen, setTrophyModalOpen, triggerUnlock, resetProgress }}>
      {children}

      {/* Achievement Unlocked Flash Notification Modal */}
      <AnimatePresence>
        {activeNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setActiveNotification(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative bg-white dark:bg-slate-900 border-2 border-amber-400 max-w-md w-full rounded-3xl p-8 shadow-2xl text-center overflow-hidden z-20"
            >
              {/* Golden Sunburst Background */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

              <div className="flex justify-center mb-6 relative">
                {/* Visual Shine behind the badge */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full filter blur-xl opacity-30 animate-pulse mx-auto" />
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white ${activeNotification.color} border-4 border-amber-300 dark:border-amber-400 shadow-xl shadow-amber-500/15 animate-bounce`}>
                  {mapIcon(activeNotification.iconName, "w-11 h-11")}
                </div>
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full inline-block mb-3 border border-amber-500/20">
                ⭐ Achievement Awarded ⭐
              </span>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                {activeNotification.name}
              </h3>

              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6">
                {activeNotification.requirement}
              </p>

              <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl mb-8">
                <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed italic text-sm">
                  "{activeNotification.description}"
                </p>
              </div>

              <button
                onClick={() => setActiveNotification(null)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Claim Badge
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Achievements Board (Trophy Modal) */}
      <AnimatePresence>
        {isTrophyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setTrophyModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-20 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Arcade Trophy Room</h2>
                    <p className="text-sm font-semibold text-gray-400">
                      Earn system achievements during gameplays and dynamic quizzes
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setTrophyModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Summary bar */}
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Your Cabinet Progress
                  </p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                    {unlockedList.length} of {ACHIEVEMENTS_LIST.length} Badges Acquired
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-500 dark:text-amber-400">
                    {Math.round((unlockedList.length / ACHIEVEMENTS_LIST.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ACHIEVEMENTS_LIST.map((badge) => {
                    const isUnlocked = unlockedList.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`flex items-start p-4 rounded-2xl border transition-all ${
                          isUnlocked 
                            ? `bg-white dark:bg-slate-800/80 ${badge.borderColor} shadow-xs` 
                            : 'bg-gray-50/50 dark:bg-slate-800/30 border-gray-100 dark:border-slate-800/50'
                        }`}
                      >
                        {/* Icon Block */}
                        <div className="mr-4 mt-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white relative shadow-md transition-all ${
                            isUnlocked 
                              ? badge.color
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                          }`}>
                            {isUnlocked ? mapIcon(badge.iconName, "w-6 h-6") : <Lock className="w-5 h-5" />}
                            
                            {isUnlocked && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 p-[1px] rounded-full border border-white">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-yellow-400 text-slate-950" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-extrabold text-sm flex items-center ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {badge.name}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 line-clamp-1 font-semibold">
                            Goal: {badge.requirement}
                          </p>
                          <p className={`text-xs mt-1.5 leading-relaxed font-medium ${isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400/80 dark:text-gray-500/80 italic'}`}>
                            {isUnlocked ? badge.description : 'Locked badge. Continue playing to reveal criteria!'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your earned badges and progress?')) {
                      resetProgress();
                    }
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline transition-colors cursor-pointer"
                >
                  Clear Badges Profile
                </button>
                <button
                  onClick={() => setTrophyModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all text-xs cursor-pointer"
                >
                  Return to Games
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used inside AchievementsProvider');
  }
  return context;
}
