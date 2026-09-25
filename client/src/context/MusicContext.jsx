import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LOFI_TRACKS } from '../config/audioCatalog';
import { useAuth } from './AuthContext';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('studyhive_music_volume');
    return saved !== null ? parseFloat(saved) : 0.65;
  });
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const webAudioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);

  const currentTrack = LOFI_TRACKS[currentTrackIndex] || LOFI_TRACKS[0];

  // Initialize or update HTML Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = false;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      // Auto-advance to next track
      setCurrentTrackIndex((prev) => (prev + 1) % LOFI_TRACKS.length);
    });

    audio.addEventListener('error', (e) => {
      console.warn('Audio file error, falling back to ambient synth:', e);
      if (isPlaying) {
        startAmbientSynth();
      }
    });

    return () => {
      audio.pause();
      stopAmbientSynth();
      audioRef.current = null;
    };
  }, []);

  // Update track source when track index changes
  useEffect(() => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.src = currentTrack.src;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Autoplay prevented or failed, using ambient synth:', err.message);
        startAmbientSynth();
      });
    }
  }, [currentTrackIndex]);

  // Update volume
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
    // Also adjust synth gain if running
    synthNodesRef.current.forEach(({ gainNode, baseGain }) => {
      if (gainNode?.gain) {
        gainNode.gain.setValueAtTime(baseGain * effectiveVol, 0);
      }
    });
    localStorage.setItem('studyhive_music_volume', volume.toString());
  }, [volume, isMuted]);

  // Automatically pause when user logs out
  useEffect(() => {
    if (!isAuthenticated && isPlaying) {
      pause();
    }
  }, [isAuthenticated]);

  // Web Audio Procedural Lo-Fi Ambient Synthesizer (Zero-dependency backup & accompaniment)
  const startAmbientSynth = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!webAudioCtxRef.current || webAudioCtxRef.current.state === 'closed') {
        webAudioCtxRef.current = new AudioCtx();
      }
      const ctx = webAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbientSynth();

      // Soft major/minor 7th chord frequencies for cozy library vibe
      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
      ];

      const chord = chords[currentTrackIndex % chords.length];
      const effectiveVol = isMuted ? 0 : volume;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const baseGain = 0.04 / (idx + 1);
        gain.gain.setValueAtTime(baseGain * effectiveVol, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        synthNodesRef.current.push({ osc, gainNode: gain, baseGain });
      });
    } catch (e) {
      console.warn('Web Audio synth could not initialize:', e);
    }
  };

  const stopAmbientSynth = () => {
    synthNodesRef.current.forEach(({ osc, gainNode }) => {
      try {
        osc.stop();
        osc.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = [];
  };

  const play = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        startAmbientSynth();
      });
    } else {
      startAmbientSynth();
    }
  };

  const pause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopAmbientSynth();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % LOFI_TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + LOFI_TRACKS.length) % LOFI_TRACKS.length);
  };

  const setVolume = (newVol) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const selectTrack = (index) => {
    if (index >= 0 && index < LOFI_TRACKS.length) {
      setCurrentTrackIndex(index);
      if (!isPlaying) {
        play();
      }
    }
  };

  return (
    <MusicContext.Provider
      value={{
        tracks: LOFI_TRACKS,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        volume,
        isMuted,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        selectTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
