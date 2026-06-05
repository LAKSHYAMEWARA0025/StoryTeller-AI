import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Sparkles, LayoutGrid } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { SavedStory } from '@/lib/types';
import DeleteStoryButton from '@/components/DeleteStoryButton';
import ShareStoryButton from '@/components/ShareStoryButton';

function StoryCard({ story }: { story: SavedStory }) {
  const thumbnail = story.panel_urls?.[0];

  return (
    <div className="group flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/40 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative">
      <Link href={`/dashboard/story/${story.id}`} className="block flex-1 z-0">
        <div className="aspect-[4/3] bg-black/40 relative overflow-hidden">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LayoutGrid className="w-10 h-10 text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 text-xs font-medium text-purple-300 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            {story.theme}
          </span>
        </div>
      </Link>
      
      <div className="p-4 flex items-center justify-between bg-black/20 border-t border-white/5 z-10">
        <Link href={`/dashboard/story/${story.id}`} className="block flex-1 min-w-0 mr-4">
          <h3 className="font-semibold text-white truncate hover:text-purple-400 transition-colors">{story.title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {story.panel_count} panels · {new Date(story.created_at).toLocaleDateString()}
          </p>
        </Link>
        <div className="flex gap-2 flex-shrink-0">
          <ShareStoryButton storyId={story.id} initialIsPublic={story.is_public} />
          <DeleteStoryButton storyId={story.id} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardGalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch stories:', error);
  }

  const savedStories = (stories ?? []) as SavedStory[];
  const hasStories = savedStories.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-8 sm:py-16">
        {hasStories ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3 border border-purple-500/30 rounded-full px-4 py-1 bg-purple-500/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Project Gallery
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Your Stories</h1>
                <p className="text-slate-400 mt-2 text-sm">
                  {savedStories.length} {savedStories.length === 1 ? 'comic' : 'comics'} in your library
                </p>
              </div>
              <Link
                href="/dashboard/generate"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600
                  hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-shadow"
              >
                <Plus className="w-4 h-4" />
                Create New Story
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            <Link
              href="/dashboard/generate"
              className="fixed bottom-8 right-8 sm:hidden flex items-center justify-center w-14 h-14 rounded-full
                bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              aria-label="Create new story"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 sm:p-14 max-w-lg w-full shadow-2xl">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Welcome</h1>
              <p className="text-slate-400 leading-relaxed mb-8">
                Your gallery is empty. Create your first interactive comic with AI-generated panels and native narration.
              </p>
              <Link
                href="/dashboard/generate"
                className="inline-flex items-center justify-center w-full px-8 py-4 rounded-xl font-bold text-white text-base
                  bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600
                  hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-shadow"
              >
                Generate Your First Story
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

