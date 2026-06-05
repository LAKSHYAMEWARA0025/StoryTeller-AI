import Link from 'next/link';
import { Sparkles, BookOpen, Mic } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-6 border border-purple-500/30 rounded-full px-4 py-1.5 bg-purple-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Comic Generator
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
              StoryTeller AI:
            </span>
            <br />
            <span className="text-white mt-2 block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              Your Words, Our Comics.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Transform text into 4-panel interactive comics with native narration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white text-base
                bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600
                hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white text-base
                bg-white/5 backdrop-blur-xl border border-white/10
                hover:bg-white/10 transition-all text-center"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full px-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-1">Visual Storyboards</h3>
            <p className="text-sm text-slate-400">AI-generated panels with cinematic Ken Burns motion.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <Mic className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-1">Native Narration</h3>
            <p className="text-sm text-slate-400">Hear every panel in your chosen language as you read.</p>
          </div>
        </div>
      </section>
    </main>
  );
}


