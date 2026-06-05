import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { SavedStory } from '@/lib/types';
import { reconstructPanelsFromStory } from '@/lib/utils/reconstructPanels';
import StoryViewerClient from '@/components/StoryViewerClient';

function StoryNotFound() {
  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 sm:p-14 max-w-md w-full text-center shadow-2xl">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3">Story not found</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          This comic may have been removed, or you may not have permission to view it.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600
            hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

interface StoryViewerPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryViewerPage({ params }: StoryViewerPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !story) {
    return <StoryNotFound />;
  }

  const savedStory = story as SavedStory;
  const panels = reconstructPanelsFromStory(savedStory);

  if (panels.length === 0) {
    return <StoryNotFound />;
  }

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white px-4 py-12 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Studio
        </Link>

        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3 border border-purple-500/30 rounded-full px-4 py-1 bg-purple-500/10">
            {savedStory.theme}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{savedStory.title}</h1>
          <p className="text-slate-400 text-sm">
            {savedStory.panel_count} panels · {savedStory.tone} tone
          </p>
        </div>

        <StoryViewerClient
          panels={panels}
          title={savedStory.title}
          format={savedStory.format ?? savedStory.panels_data?.format}
          language={savedStory.language ?? savedStory.panels_data?.language ?? 'English'}
        />
      </div>
    </main>
  );
}
