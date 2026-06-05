'use client';

import { ComicPanel } from '../lib/types';
import StoryFormatViewer from './StoryFormatViewer';

interface StoryViewerClientProps {
  panels: ComicPanel[];
  format?: string;
  language?: string;
  title?: string;
}

export default function StoryViewerClient({
  panels,
  format,
  language = 'English',
  title,
}: StoryViewerClientProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <StoryFormatViewer
        panels={panels}
        format={format}
        language={language}
        title={title}
      />
    </div>
  );
}
