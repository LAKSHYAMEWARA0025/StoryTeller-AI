'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryForm, { StoryFormData } from '../components/StoryForm';
import ComicBoard from '../components/ComicBoard';
import { StoryResponse } from '../lib/types';

// ── Loading Sequence ──────────────────────────────────────────────────────────
const LOADING_STEPS = [
  'Brainstorming narrative...',
  'Casting characters...',
  'Inking comic panels...',
  'Adding speech bubbles...',
  'Finalizing layout...',
];

function LoadingSequence() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      {/* Neon pulsing spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin shadow-[0_0_30px_rgba(168,85,247,0.5)]" />
        <div className="absolute inset-3 rounded-full border-2 border-t-pink-400 border-r-transparent border-b-cyan-400 border-l-purple-500 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
      </div>

      {/* Cycling status text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-lg font-medium text-purple-300 tracking-wide"
        >
          {LOADING_STEPS[currentStep]}
        </motion.p>
      </AnimatePresence>

      {/* Step dots */}
      <div className="flex gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-700 ${
              i === currentStep ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [storyData, setStoryData] = useState<StoryResponse | null>(null);
  const [language, setLanguage] = useState('English');

  const handleGenerateStory = async (formData: StoryFormData) => {
    setIsLoading(true);
    setStoryData(null);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

      const data: StoryResponse = await response.json();
      setStoryData(data);
    } catch (error) {
      console.error('Failed to generate story:', error);
      alert('There was an error generating your story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white px-4 py-12 sm:px-8">

      {/* ── Hero Header ── */}
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-4 border border-purple-500/30 rounded-full px-4 py-1 bg-purple-500/10">
            AI-Powered Comic Generator
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
              StoryTeller AI
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Turn any idea into a cinematic graphic novel in seconds.
          </p>
        </motion.div>
      </div>

      {/* ── Form / Loading / ComicBoard ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSequence />
          </motion.div>
        ) : storyData ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Your Storyboard</h2>
              <p className="text-slate-400 text-sm">Use the arrows to navigate through your comic.</p>
            </div>
            <ComicBoard panels={storyData.panels} language={language} />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStoryData(null)}
              className="mt-4 text-sm text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              ← Generate a new story
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Glassmorphism form card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto">
              {/* Language Selector */}
              <div className="mb-6">
                <label htmlFor="language" className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-2 block">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm cursor-pointer appearance-none"
                >
                  {['English','Japanese', 'Spanish', 'French','Mandarin Chinese'].map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
                  ))}
                </select>
              </div>
              <StoryForm onSubmit={handleGenerateStory} isSubmitting={isLoading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
