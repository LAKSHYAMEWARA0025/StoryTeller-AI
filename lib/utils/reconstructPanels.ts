import { ComicPanel, SavedStory, StoryResponse } from '../types';

export function reconstructPanelsFromStory(story: SavedStory): ComicPanel[] {
  const panelsData = story.panels_data as StoryResponse | ComicPanel[] | null | undefined;

  const rawPanels: ComicPanel[] = Array.isArray(panelsData)
    ? panelsData
    : Array.isArray(panelsData?.panels)
      ? panelsData.panels
      : [];

  return rawPanels.map((panel, index) => ({
    ...panel,
    image_url: story.panel_urls[index] ?? panel.image_url,
  }));
}
