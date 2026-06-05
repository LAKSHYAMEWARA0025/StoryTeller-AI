'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DeleteStoryButton({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('stories').delete().eq('id', storyId);

      if (error) {
        console.error('Error deleting story:', error);
        alert('Failed to delete story. Please try again.');
        setIsDeleting(false);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-slate-300 hover:text-red-400 hover:bg-black/70 border border-white/10 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Delete story"
      title="Delete story"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
