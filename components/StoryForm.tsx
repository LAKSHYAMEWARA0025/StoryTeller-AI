'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface StoryFormData {
  description: string;
  panelCount: number;
  theme: string;
  tone: string;
}

interface StoryFormProps {
  onSubmit: (data: StoryFormData) => void;
  isSubmitting?: boolean;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm';

const labelClass = 'text-xs font-semibold text-slate-400 tracking-widest uppercase mb-2 block';

export default function StoryForm({ onSubmit, isSubmitting = false }: StoryFormProps) {
  const [description, setDescription] = useState('');
  const [panelCount, setPanelCount] = useState<number>(4);
  const [theme, setTheme] = useState('Cyberpunk');
  const [tone, setTone] = useState('Noir');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ description, panelCount, theme, tone });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Story Description
        </label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., A lone astronaut discovers an ancient, glowing artifact on a desolate moon..."
          className={`${inputClass} resize-y`}
          required
        />
      </div>

      {/* Dropdowns row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="panelCount" className={labelClass}>
            Panel Count
          </label>
          <select
            id="panelCount"
            value={panelCount}
            onChange={(e) => setPanelCount(Number(e.target.value))}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            <option value={4} className="bg-slate-900">4 Panels</option>
            <option value={6} className="bg-slate-900">6 Panels</option>
            <option value={8} className="bg-slate-900">8 Panels</option>
          </select>
        </div>

        <div>
          <label htmlFor="theme" className={labelClass}>
            Visual Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            <option className="bg-slate-900">Cyberpunk</option>
            <option className="bg-slate-900">1980&apos;s</option>
            <option className="bg-slate-900">Black and White</option>
            <option className="bg-slate-900">Anime</option>
            <option className="bg-slate-900">Cartoon</option>
            <option className="bg-slate-900">Sketch</option>
          </select>
        </div>

        <div>
          <label htmlFor="tone" className={labelClass}>
            Story Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            <option className="bg-slate-900">Noir</option>
            <option className="bg-slate-900">Romantic</option>
            <option className="bg-slate-900">Cinematic</option>
            <option className="bg-slate-900">Fear & Horror</option>
            <option className="bg-slate-900">Surprised</option>
            <option className="bg-slate-900">Sad</option>
            <option className="bg-slate-900">Humorous</option>
            <option className="bg-slate-900">Motivating</option>
            <option className="bg-slate-900">Melancholy</option>
            <option className="bg-slate-900">Action</option>
          </select>
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isSubmitting || !description.trim()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 px-8 rounded-xl font-bold text-white text-base
          bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600
          hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all
          disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
      >
        {isSubmitting ? 'Generating...' : '✦ Generate Comic Board'}
      </motion.button>
    </form>
  );
}
