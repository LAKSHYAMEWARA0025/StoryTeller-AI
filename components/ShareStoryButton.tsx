'use client';

import React, { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import { publishStory } from '@/app/actions/publish';

export default function ShareStoryButton({ storyId, initialIsPublic }: { storyId: string; initialIsPublic?: boolean }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isPublic) {
      setIsPublishing(true);
      try {
        await publishStory(storyId);
        setIsPublic(true);
      } catch (error) {
        console.error('Failed to publish story:', error);
        alert('Failed to publish story for sharing.');
        setIsPublishing(false);
        return;
      }
      setIsPublishing(false);
    }

    const url = `${window.location.origin}/view/${storyId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      alert(`Share link: ${url}`);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isPublishing}
      className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-slate-300 hover:text-cyan-400 hover:bg-black/70 border border-white/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Share story"
      title={copied ? "Link Copied!" : "Share story"}
    >
      {isPublishing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
    </button>
  );
}
