/**
 * Sound Player Utility
 * Plays notification sounds respecting user preferences
 */

export enum SoundType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  NOTIFICATION = 'notification',
}

// Frequency map for different sound types
const soundFrequencies: Record<SoundType, number[]> = {
  [SoundType.SUCCESS]: [523, 659, 784], // C, E, G (major chord)
  [SoundType.ERROR]: [440, 415, 392], // A, Ab, G (descending)
  [SoundType.WARNING]: [659, 523], // E, C (alert pattern)
  [SoundType.INFO]: [523, 659], // C, E (ascending)
  [SoundType.NOTIFICATION]: [800, 1000], // High beeps
};

/**
 * Get sound settings from localStorage
 */
const getSoundSettings = () => {
  try {
    const settings = localStorage.getItem('userSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        enabled: parsed.sound !== false,
        volume: parsed.volume || 80,
      };
    }
  } catch (error) {
    console.error('Failed to load sound settings:', error);
  }
  return { enabled: true, volume: 80 };
};

/**
 * Play a notification sound
 * @param type - Type of sound to play
 * @param duration - Duration of each tone in seconds (default: 0.15)
 */
export const playSound = (type: SoundType = SoundType.NOTIFICATION, duration: number = 0.15) => {
  const { enabled, volume } = getSoundSettings();
  
  if (!enabled) {
    console.log('Sound disabled in settings');
    return;
  }

  try {
    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported');
      return;
    }

    const audioContext = new AudioContext();
    const frequencies = soundFrequencies[type];
    let startTime = audioContext.currentTime;

    // Play each frequency in sequence
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure oscillator
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Set volume (0 to 1)
      const normalizedVolume = Math.min(100, Math.max(0, volume)) / 100;
      gainNode.gain.value = normalizedVolume * 0.3; // Max 30% to prevent loud sounds

      // Smooth volume envelope (fade in/out)
      const fadeTime = 0.02;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume * 0.3, startTime + fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration - fadeTime);

      // Play tone
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);

      // Increment start time for next tone
      startTime += duration;
    });

    console.log(`Playing ${type} sound at ${volume}% volume`);
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

/**
 * Play success sound (e.g., when saving settings, submitting form)
 */
export const playSuccessSound = () => playSound(SoundType.SUCCESS, 0.15);

/**
 * Play error sound (e.g., validation error, API failure)
 */
export const playErrorSound = () => playSound(SoundType.ERROR, 0.2);

/**
 * Play warning sound (e.g., confirmation dialogs)
 */
export const playWarningSound = () => playSound(SoundType.WARNING, 0.18);

/**
 * Play info sound (e.g., tooltip opened, info message)
 */
export const playInfoSound = () => playSound(SoundType.INFO, 0.12);

/**
 * Play notification sound (e.g., new message, status update)
 */
export const playNotificationSound = () => playSound(SoundType.NOTIFICATION, 0.15);

/**
 * Test sound with current volume
 */
export const playTestSound = () => {
  const { enabled, volume } = getSoundSettings();
  
  if (!enabled) {
    console.log('Sound disabled in settings');
    return false;
  }

  playSound(SoundType.NOTIFICATION, 0.2);
  return true;
};

export default {
  playSound,
  playSuccessSound,
  playErrorSound,
  playWarningSound,
  playInfoSound,
  playNotificationSound,
  playTestSound,
  SoundType,
};
