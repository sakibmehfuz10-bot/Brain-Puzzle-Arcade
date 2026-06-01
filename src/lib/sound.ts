// Web Audio API Sound Synthesizer for Arcade Puzzle Feedback

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Standard and prefixed AudioContext compatibility
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume if suspended (common browser autoplay policy)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch((err) => console.log("Failed to resume AudioContext", err));
  }
  
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem("arcade_sound_enabled");
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem("arcade_sound_enabled", enabled ? "true" : "false");
  } catch (e) {
    console.error("Local storage not accessible", e);
  }
}

// Helper to play synthesized sounds quickly
function synthesize(options: {
  type?: OscillatorType;
  sequence: { freq: number; duration: number; timeOffset: number }[];
  volume?: number;
}) {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const type = options.type || "sine";
  const defaultVolume = options.volume !== undefined ? options.volume : 0.15;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let totalDuration = 0;

  options.sequence.forEach((note) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.timeOffset);

    // Filter frequency sweetening
    osc.connect(gainNode);
    gainNode.connect(masterGain);

    const startTime = ctx.currentTime + note.timeOffset;
    const endTime = startTime + note.duration;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(defaultVolume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.start(startTime);
    osc.stop(endTime);

    totalDuration = Math.max(totalDuration, note.timeOffset + note.duration);
  });

  // Fade out overall gain to prevent sudden popping sounds
  masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
  masterGain.gain.setValueAtTime(1, ctx.currentTime + totalDuration - 0.02);
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + totalDuration);
}

/**
 * Click sound: A short, filtered high click/pop
 */
export function playClickSound() {
  synthesize({
    type: "sine",
    volume: 0.1,
    sequence: [
      { freq: 800, duration: 0.04, timeOffset: 0 },
      { freq: 400, duration: 0.03, timeOffset: 0.01 },
    ],
  });
}

/**
 * Correct answer: A sweet major chord or arpeggio
 */
export function playCorrectSound() {
  synthesize({
    type: "triangle",
    volume: 0.18,
    sequence: [
      { freq: 523.25, duration: 0.1, timeOffset: 0 },       // C5
      { freq: 659.25, duration: 0.12, timeOffset: 0.06 },   // E5
      { freq: 783.99, duration: 0.2, timeOffset: 0.12 },    // G5
    ],
  });
}

/**
 * Incorrect feedback: A gentle low buzzing frequency bending downwards
 */
export function playIncorrectSound() {
  synthesize({
    type: "sawtooth",
    volume: 0.08,
    sequence: [
      { freq: 174.61, duration: 0.15, timeOffset: 0 },      // F3
      { freq: 146.83, duration: 0.22, timeOffset: 0.08 },   // D3
    ],
  });
}

/**
 * Win / Level Complete: Fast ascending festive arcade melody with sine sweet elements
 */
export function playWinSound() {
  synthesize({
    type: "sine",
    volume: 0.18,
    sequence: [
      { freq: 523.25, duration: 0.1, timeOffset: 0 },       // C5
      { freq: 659.25, duration: 0.1, timeOffset: 0.08 },    // E5
      { freq: 783.99, duration: 0.1, timeOffset: 0.16 },    // G5
      { freq: 1046.50, duration: 0.15, timeOffset: 0.24 },  // C6
      { freq: 1318.51, duration: 0.3, timeOffset: 0.32 },   // E6
    ],
  });
}
