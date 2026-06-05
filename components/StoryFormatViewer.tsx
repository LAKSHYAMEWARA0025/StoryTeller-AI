'use client';

import { ComicPanel } from '../lib/types';
import { isInteractiveFormat } from '../lib/utils/formatAndAspect';
import ComicBoard from './ComicBoard';
import StaticComicViewer from './StaticComicViewer';

interface StoryFormatViewerProps {
  panels: ComicPanel[];
  format?: string;
  language?: string;
  title?: string;
}

export default function StoryFormatViewer({
  panels,
  format,
  language = 'English',
  title,
}: StoryFormatViewerProps) {
  if (isInteractiveFormat(format)) {
    return <ComicBoard panels={panels} language={language} />;
  }

  return <StaticComicViewer panels={panels} title={title} />;
}
