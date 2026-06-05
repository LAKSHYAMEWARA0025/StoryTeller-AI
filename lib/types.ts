export interface ComicPanel {
  panel_number: number;
  dialogue: string;
  character_descriptions: string;
  image_prompt: string;
  camera_motion?: string;
  image_url?: string;
}


export interface StoryResponse {
  panels: ComicPanel[];
  format?: string;
  language?: string;
}

export interface StoryGenerateResponse extends StoryResponse {
  savedStoryId?: string;
  saveWarning?: string;
}

export interface SavedStory {
  id: string;
  user_id: string;
  title: string;
  panel_urls: string[];
  panels_data: any; // This will store the full Gemini JSON
  theme: string;
  tone: string;
  panel_count: number;
  format?: string;
  language?: string;
  is_public?: boolean;
  created_at: string;
}
