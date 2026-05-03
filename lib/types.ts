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
}
