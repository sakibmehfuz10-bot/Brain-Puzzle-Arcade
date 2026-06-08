import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, RotateCcw, HelpCircle, Trophy, Play, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCorrectSound, playIncorrectSound, playWinSound, isSoundEnabled } from '../../lib/sound';

interface Pad {
  id: number;
  colorClass: string;
  activeColorClass: string;
  name: string;
  frequency: number;
}

const PADS: Pad[] = [
  { id: 0, colorClass: 'bg-rose-500/80 hover:bg-rose-500 border-rose-450 dark:border-rose-600/40', activeColorClass: 'bg-rose-400 ring-8 ring-rose-300 shadow-[0_0_30px_rgba(239,68,68,0.8)]', name: 'Coral Rose', frequency: 261.63 }, // C4
  { id: 1, colorClass: 'bg-sky-500/80 hover:bg-sky-500 border-sky-450 dark:border-sky-600/40', activeColorClass: 'bg-sky-400 ring-8 ring-sky-300 shadow-[0_0_30px_rgba(14,165,233,0.8)]', name: 'Sky Blue', frequency: 329.63 }, // E4
  { id: 2, colorClass: 'bg-emerald-500/80 hover:bg-emerald-500 border-emerald-450 dark:border-emerald-600/40', activeColorClass: 'bg-emerald-400 ring-8 ring-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.8)]', name: 'Emerald Green', frequency: 392.00 }, // G4
  { id: 3, colorClass: 'bg-amber-400/80 hover:bg-amber-400 border-amber-300 dark:border-amber-500/40', activeColorClass: 'bg-amber-300 ring-8 ring-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.8)]', name: 'Sunny Gold', frequency: 523.25 }, // C5
];

export function MemoryEcho() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  
  const [score, setScore] = useState(0);
  const [bestSequence, setBestSequence] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');

  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize best score from storage
  useEffect(() => {
    const saved = localStorage.getItem('puzzle_echo_best_sequence');
    if (saved) {
      setBestSequence(parseInt(saved, 10));
    }
    return () => {
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
  }, []);

  // Play custom synth notes using Web Audio API safely
  const playTone = (freq: number, duration: number = 0.35) => {
    if (!isSoundEnabled()) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio synthesis block/fail:', e);
    }
  };

  const startGame = () => {
    playClickSound();
    setScore(0);
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayerSequence([]);
    setIsNewRecord(false);
    setGameState('playing');
    setIsShowingSequence(true);
  };

  // Play sequence effect when sequence additions occur
  useEffect(() => {
    if (gameState === 'playing' && sequence.length > 0) {
      playSequence(sequence);
    }
  }, [sequence, gameState]);

  const playSequence = async (seq: number[]) => {
    setIsShowingSequence(true);
    await new Promise((r) => setTimeout(r, 450)); // Tiny buffer before sequence starts playing

    for (let i = 0; i < seq.length; i++) {
      const padId = seq[i];
      const pad = PADS[padId];
      
      setActivePad(padId);
      playTone(pad.frequency, 0.4);
      
      await new Promise((r) => setTimeout(r, 420));
      setActivePad(null);
      await new Promise((r) => setTimeout(r, 120));
    }
    
    setIsShowingSequence(false);
    setPlayerSequence([]);
  };

  const handlePadClick = (padId: number) => {
    if (gameState !== 'playing' || isShowingSequence) return;

    const pad = PADS[padId];
    playTone(pad.frequency, 0.3);
    setActivePad(padId);
    setTimeout(() => {
      setActivePad(null);
    }, 250);

    const nextPlayerSeq = [...playerSequence, padId];
    setPlayerSequence(nextPlayerSeq);

    // Verify compliance
    const currentStepIndex = nextPlayerSeq.length - 1;
    if (nextPlayerSeq[currentStepIndex] !== sequence[currentStepIndex]) {
      // Game Over
      playIncorrectSound();
      setGameState('gameover');
      
      const previousBest = bestSequence || 0;
      if (score > previousBest) {
        setIsNewRecord(true);
        setBestSequence(score);
        localStorage.setItem('puzzle_echo_best_sequence', score.toString());

        // Side-cannon festive confetti
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 },
            colors: ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#ec4899']
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 },
            colors: ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#ec4899']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
      return;
    }

    // Finished entire sequence safely!
    if (nextPlayerSeq.length === sequence.length) {
      playCorrectSound();
      const nextScore = score + 1;
      setScore(nextScore);

      // Trigger standard round success splash confetti on milestone
      if (nextScore % 3 === 0) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.75 }
        });
      }

      // Add a randomized note to sequence for next stage trigger
      setTimeout(() => {
        setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl" id="memory-echo-container">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
            Memory Echo
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Memorize & echo the visual-auditory sequence</p>
        </div>

        {/* High Scores */}
        <div className="flex items-center space-x-4 text-right">
          {bestSequence !== null && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-500 block">Record</span>
              <p className="text-xl font-black text-green-600 dark:text-green-400">{bestSequence} pts</p>
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Stage</span>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">{score + 1}</p>
          </div>
        </div>
      </div>

      {/* Main interactive gaming area */}
      <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900/40 p-5 rounded-full border border-gray-100 dark:border-slate-700/60 mb-6 flex items-center justify-center">
        
        {/* Core pad ring layout */}
        <div className="grid grid-cols-2 gap-4 w-full h-full relative p-2">
          {PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={gameState !== 'playing' || isShowingSequence}
                className={`w-full aspect-square rounded-2xl cursor-pointer border-2 transition-all duration-150 relative ${
                  isActive ? pad.activeColorClass : `${pad.colorClass} border-transparent hover:scale-[1.02]`
                } ${gameState !== 'playing' || isShowingSequence ? 'opacity-80 cursor-not-allowed' : 'active:scale-95'}`}
                title={`Pad ${pad.name}`}
                aria-label={`Sonic color pad ${pad.name}`}
                id={`memory-echo-pad-${pad.id}`}
              >
                {/* Sonic node helper decoration */}
                <span className="absolute bottom-2 right-2 text-[10px] uppercase font-black tracking-widest text-white/40 pointer-events-none select-none">
                  {pad.id === 0 ? 'C' : pad.id === 1 ? 'E' : pad.id === 2 ? 'G' : 'C5'}
                </span>
              </button>
            );
          })}

          {/* Central status node */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-gray-100 dark:border-slate-700 shadow-md flex items-center justify-center z-10 select-nonepointer-events-none">
            {isShowingSequence ? (
              <Music className="w-5 h-5 text-rose-500 animate-bounce" />
            ) : (
              <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {gameState === 'playing' ? `Go` : 'Play'}
              </span>
            )}
          </div>
        </div>

        {/* Start Game / GameOver Overlays */}
        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 rounded-full flex flex-col items-center justify-center p-6 text-center backdrop-blur-md z-20"
            >
              {gameState === 'start' ? (
                <div className="flex flex-col items-center gap-3">
                  <Play className="w-10 h-10 text-rose-500 animate-pulse cursor-pointer" onClick={startGame} />
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest">Acoustic Sequencer</h3>
                  <button
                    onClick={startGame}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs text-center cursor-pointer"
                    id="memory-echo-start-btn"
                  >
                    Start Sequencer
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <RotateCcw className="w-10 h-10 text-red-500 animate-spin-slow cursor-pointer" onClick={startGame} />
                  {isNewRecord && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
                      🏆 New Best Sequence! 🏆
                    </span>
                  )}
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Mistake Made!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">You matched <span className="font-bold text-rose-500">{score} items</span> perfectly.</p>
                  
                  <button
                    onClick={startGame}
                    className="mt-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs text-center cursor-pointer"
                    id="memory-echo-play-again-btn"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Actions & Info instructions */}
      <div className="flex flex-col items-center gap-4 text-xs font-semibold">
        <div className="flex w-full justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
          <button
            onClick={() => {
              playClickSound();
              setShowHelper(!showHelper);
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            id="memory-echo-help"
          >
            <HelpCircle className="w-4 h-4" /> Instructions
          </button>
          
          {gameState === 'playing' && (
            <button
              onClick={() => {
                playClickSound();
                startGame();
              }}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-600 cursor-pointer"
              id="memory-echo-restart-btn2"
            >
              <RotateCcw className="w-4 h-4" /> Restart
            </button>
          )}
        </div>

        <AnimatePresence>
          {showHelper && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/30 p-3 rounded-xl border border-gray-100 dark:border-slate-700/30 text-left overflow-hidden mt-2"
            >
              💡 **Rulebook:** Watch and listen closely! The machine illuminates acoustic nodes. Repeat the pattern in the identical order. Each successful sequence adds a new tone to the progressive pattern lock!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
