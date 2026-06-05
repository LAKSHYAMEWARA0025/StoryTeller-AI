'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, Play } from 'lucide-react';
import { ComicPanel } from '../lib/types';

type CameraMotion = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'static';

const kenBurnsVariants: Record<CameraMotion, TargetAndTransition> = {
  'zoom-in':  { scale: [1, 1.15] },
  'zoom-out': { scale: [1.15, 1] },
  'pan-left': { scale: 1.15, x: ['0%', '5%'] },
  'pan-right':{ scale: 1.15, x: ['0%', '-5%'] },
  'pan-up':   { scale: 1.15, y: ['0%', '5%'] },
  'pan-down': { scale: 1.15, y: ['0%', '-5%'] },
  'static':   { scale: 1 },
};

interface ComicBoardProps {
  panels: ComicPanel[];
  language: string;
}

export default function ComicBoard({ panels, language }: ComicBoardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenIndex = useRef(-1);

  if (!panels || panels.length === 0) {
    return null;
  }

  const panel = panels[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === panels.length - 1;

  // ── TTS Helper ──────────────────────────────────────────────────────────────
  const langMap: Record<string, string> = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Japanese': 'ja-JP',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'Mandarin Chinese': 'zh-CN',
  };

  // ── Part 1: Voice Loading Diagnostics ───────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const logVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log(`[Audio System] Loaded ${voices.length} voices from the OS.`);
    };
    logVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = logVoices;
    }
  }, []);

  // ── Part 2: Delayed Playback with Ref (fixes Chrome GC interrupted bug) ──────
  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      console.error('Web Speech API is not supported.');
      return;
    }

    // 1. Cancel any currently playing audio
    window.speechSynthesis.cancel();

    // 2. Wrap in a tiny timeout to avoid the cancel-overlap bug
    setTimeout(() => {
      const textToRead = panels[currentIndex].dialogue;
      const targetLangCode = langMap[language] || 'en-US';

      const utterance = new SpeechSynthesisUtterance(textToRead);

      // 3. THE MAGIC FIX: Save it to a ref so Chrome doesn't garbage collect it!
      utteranceRef.current = utterance;

      utterance.lang = targetLangCode;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        v => v.lang.includes(targetLangCode) || v.lang.includes(targetLangCode.split('-')[0])
      );

      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onerror = (event) => {
        // Silently ignore expected interruptions from slide changes or React Strict Mode
        if (event.error === 'interrupted' || event.error === 'canceled') return;
        console.error('Playback Error:', event.error);
      };
      utterance.onstart = () => console.log('Audio playing securely.');

      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  // Strictly locked autoplay — only fires when the user moves to a new panel
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!hasStarted) return;

    if (lastSpokenIndex.current !== currentIndex) {
      playAudio();
      lastSpokenIndex.current = currentIndex; // Mark this panel as spoken
    }

    // Cleanup: cancel speech if component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // STRICT DEPENDENCY: Only trigger when currentIndex changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasStarted]);


  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 px-4">
      {/* Cinematic Container */}
      <div className="relative w-full aspect-[4/3] md:aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">

        {/* Start Overlay */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <button
                onClick={() => setHasStarted(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
              >
                <Play className="w-6 h-6 fill-white" />
                Play Comic
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Image or Placeholder */}
            {panel.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                src={panel.image_url}
                alt={`Panel ${panel.panel_number}`}
                className="w-full h-full object-cover"
                animate={kenBurnsVariants[(panel.camera_motion as CameraMotion) ?? 'zoom-in'] ?? kenBurnsVariants['zoom-in']}
                transition={{ duration: 15, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
                <svg className="w-10 h-10 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-xs italic max-w-xs line-clamp-4">&quot;{panel.image_prompt}&quot;</p>
              </div>
            )}

            {/* Bottom gradient for text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Speech Bubble with Replay Button */}
            <div className="absolute bottom-6 left-5 right-5 z-20">
              <div className="bg-white/95 text-black border-2 border-black rounded-2xl shadow-lg px-4 py-3 max-w-xl mx-auto flex items-center gap-3">
                <p className="text-sm sm:text-base font-semibold leading-snug text-center flex-1">
                  {panel.dialogue
                    ? `"${panel.dialogue}"`
                    : <span className="text-gray-400 italic font-normal">No dialogue</span>
                  }
                </p>
                {/* Replay Audio Button */}
                <motion.button
                  onClick={playAudio}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Replay audio"
                  className="shrink-0 text-gray-500 hover:text-purple-600 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Panel Number Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20">
              {currentIndex + 1} / {panels.length}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left Button */}
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm border border-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Previous panel"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Button */}
        <button
          onClick={() => setCurrentIndex((i) => i + 1)}
          disabled={isLast}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm border border-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next panel"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dot Progress Indicator */}
      <div className="flex items-center gap-2">
        {panels.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to panel ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-purple-400 w-6 h-2.5'
                : 'bg-white/20 hover:bg-white/40 w-2.5 h-2.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
