import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '../lib/sound';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(isSoundEnabled());

  const handleToggle = () => {
    const nextState = !enabled;
    setSoundEnabled(nextState);
    setEnabled(nextState);
    if (nextState) {
      // Play a quick satisfying pop to preview sound activation
      setTimeout(() => {
        playClickSound();
      }, 50);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all shadow-sm bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 relative flex items-center justify-center text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white cursor-pointer"
      aria-label={enabled ? "Mute sound effects" : "Unmute sound effects"}
      title={enabled ? "Mute sounds" : "Unmute sounds"}
      id="sound-effects-toggle-button"
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );
}
