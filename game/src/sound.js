// Small WebAudio sounds, synthesised on the spot: no audio files, no network.
// Every call is guarded, so a browser without audio (or a headless one) simply
// plays nothing instead of throwing.

export function createSound() {
  let context = null;
  let muted = false;

  function ensureContext() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone(frequency, duration, type, delay, volume) {
    if (muted) return;
    try {
      const audio = ensureContext();
      if (!audio) return;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume || 0.12, audio.currentTime + (delay || 0));
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (delay || 0) + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(audio.currentTime + (delay || 0));
      oscillator.stop(audio.currentTime + (delay || 0) + duration);
    } catch (error) {
      // No audio available: stay silent.
    }
  }

  return {
    click() {
      tone(440, 0.05, 'square', 0, 0.04);
    },
    found() {
      tone(660, 0.12, 'sine', 0, 0.14);
      tone(880, 0.2, 'sine', 0.09, 0.14);
    },
    wrong() {
      tone(160, 0.16, 'sawtooth', 0, 0.06);
    },
    hint() {
      tone(520, 0.1, 'sine', 0, 0.1);
    },
    sceneDone() {
      [523, 659, 784, 1047].forEach((freq, i) => tone(freq, 0.16, 'sine', i * 0.11, 0.13));
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
  };
}
