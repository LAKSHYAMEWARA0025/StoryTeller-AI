'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { ComicPanel } from '../lib/types';

interface StaticComicViewerProps {
  panels: ComicPanel[];
  title?: string;
}

function ComicPageExporter({ panels }: { panels: ComicPanel[] }) {
  const count = panels.length;
  
  const renderPanel = (panel: ComicPanel) => (
    <div key={panel.panel_number} className="relative bg-black w-full aspect-square overflow-hidden border border-white/10 rounded-xl">
      {panel.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={panel.image_url}
          alt={`Panel ${panel.panel_number}`}
          crossOrigin="anonymous"
          className="block w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm bg-slate-900">
          Image unavailable
        </div>
      )}
      {panel.image_url && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[90%] pointer-events-none">
            <div className="bg-white/95 text-black border-2 border-black rounded-2xl shadow-lg px-5 py-4">
              <p className="text-base sm:text-lg font-bold leading-snug text-center break-words">
                &ldquo;{panel.dialogue}&rdquo;
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (count === 4) {
    return (
      <div id="comic-strip-0" className="w-[1200px] bg-slate-950 p-8 grid grid-cols-2 gap-8 rounded-3xl">
        {panels.map(renderPanel)}
      </div>
    );
  } else if (count === 6) {
    return (
      <div className="flex flex-col gap-8">
        <div id="comic-strip-0" className="w-[1600px] bg-slate-950 p-8 grid grid-cols-3 gap-8 rounded-3xl">
          {panels.slice(0, 3).map(renderPanel)}
        </div>
        <div id="comic-strip-1" className="w-[1600px] bg-slate-950 p-8 grid grid-cols-3 gap-8 rounded-3xl">
          {panels.slice(3, 6).map(renderPanel)}
        </div>
      </div>
    );
  } else if (count === 8) {
    return (
      <div className="flex flex-col gap-8">
        <div id="comic-strip-0" className="w-[1200px] bg-slate-950 p-8 grid grid-cols-2 gap-8 rounded-3xl">
          {panels.slice(0, 4).map(renderPanel)}
        </div>
        <div id="comic-strip-1" className="w-[1200px] bg-slate-950 p-8 grid grid-cols-2 gap-8 rounded-3xl">
          {panels.slice(4, 8).map(renderPanel)}
        </div>
      </div>
    );
  }

  return (
    <div id="comic-strip-0" className="w-[1200px] bg-slate-950 p-8 grid grid-cols-2 gap-8 rounded-3xl">
      {panels.map(renderPanel)}
    </div>
  );
}

export default function StaticComicViewer({ panels, title = 'Comic' }: StaticComicViewerProps) {
  const [downloadingFull, setDownloadingFull] = useState(false);
  const [downloadingPanel, setDownloadingPanel] = useState<number | null>(null);
  const panelRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleDownload = async (panelNumber: number) => {
    const node = panelRefs.current[panelNumber];
    if (!node) return;

    setDownloadingPanel(panelNumber);

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        width: node.offsetWidth,
        height: node.offsetHeight,
        style: { margin: '0', padding: '0' },
        filter: (node) => !(node as HTMLElement).classList?.contains('exclude-from-export'),
      });

      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `panel-${panelNumber}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('Failed to capture panel snapshot:', error);
      alert(
        'Could not export this panel. If images are hosted on Cloudinary, ensure CORS is enabled for your domain.'
      );
    } finally {
      setDownloadingPanel(null);
    }
  };

  const handleDownloadFullComic = async () => {
    setDownloadingFull(true);
    const count = panels.length;
    const isMultiStrip = count === 6 || count === 8;
    const containers = isMultiStrip ? ['comic-strip-0', 'comic-strip-1'] : ['comic-strip-0'];
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    try {
      for (let i = 0; i < containers.length; i++) {
        const node = document.getElementById(containers[i]);
        if (!node) continue;
        
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2,
          style: { margin: '0', padding: '0' },
          filter: (n) => !(n as HTMLElement).classList?.contains('exclude-from-export'),
        });

        const anchor = document.createElement('a');
        anchor.href = dataUrl;
        anchor.download = isMultiStrip 
          ? `${safeTitle}-master-strip-${i + 1}.png`
          : `${safeTitle}-master-strip.png`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        if (i < containers.length - 1) {
          await new Promise(res => setTimeout(res, 500));
        }
      }
    } catch (error) {
      console.error('Failed to capture full comic snapshot:', error);
      alert('Could not export full comic. If images are hosted on Cloudinary, ensure CORS is enabled for your domain.');
    } finally {
      setDownloadingFull(false);
    }
  };

  if (!panels?.length) return null;

  const captureMaxClass = 'max-w-xl';

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 relative">
      <div id="full-comic-export-page" className="absolute left-[-9999px] top-0 pointer-events-none opacity-0">
        <ComicPageExporter panels={panels} />
      </div>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleDownloadFullComic}
          disabled={downloadingFull}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm
            bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600
            hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloadingFull ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Download Master Comic Strip
        </button>
      </div>

      {panels.map((panel) => (
        <article
          key={panel.panel_number}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="flex justify-center p-4 sm:p-6 bg-black/20">
            <div
              id={`panel-capture-${panel.panel_number}`}
              ref={(el) => {
                panelRefs.current[panel.panel_number] = el;
              }}
              className={`relative w-fit max-w-full inline-block overflow-hidden bg-black ${captureMaxClass}`}
            >
              {panel.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={panel.image_url}
                  alt={`Panel ${panel.panel_number}`}
                  crossOrigin="anonymous"
                  className="block w-full h-auto"
                />
              ) : (
                <div className="w-72 min-h-[200px] flex items-center justify-center text-slate-500 text-sm bg-slate-900">
                  Image unavailable
                </div>
              )}

              {panel.image_url && (
                <>
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[90%] pointer-events-none">
                    <div className="bg-white/95 text-black border-2 border-black rounded-2xl shadow-lg px-4 py-3">
                      <p className="text-sm sm:text-base font-semibold leading-snug text-center break-words">
                        &ldquo;{panel.dialogue}&rdquo;
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="exclude-from-export absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 pointer-events-none">
                Panel {panel.panel_number}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleDownload(panel.panel_number)}
              disabled={!panel.image_url || downloadingPanel === panel.panel_number}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {downloadingPanel === panel.panel_number ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Image
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
