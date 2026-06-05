import { ComicPanel } from '../types';
import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face Inference SDK
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const IMAGE_GENERATION_FAILED_URL =
  'https://placehold.co/600x400?text=Image+Generation+Failed';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function fetchWithRetry(url: string, options: RequestInit, retries = 5): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Fetch failed (attempt ${i + 1}/${retries}). Retrying in ${2000 * (i + 1)}ms...`, error);
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error("Fetch failed after all retries");
}

export async function generateAndUploadImages(
  panels: ComicPanel[]
): Promise<ComicPanel[]> {
  const updatedPanels: ComicPanel[] = [];

  // Process each panel sequentially to avoid network crashes and rate limits
  for (const panel of panels) {
    try {
      // 1. Generate image using Hugging Face Inference SDK
      let blob = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          blob = await hf.textToImage({
            model: 'black-forest-labs/FLUX.1-schnell',
            inputs: panel.image_prompt,
          });
          break; // Success, exit the retry loop
        } catch (err) {
          if (attempt === 4) break; // Exhausted all retries
          console.log(`HF failed (attempt ${attempt + 1}/5), retrying in ${2000 * (attempt + 1)}ms...`);
          await sleep(2000 * (attempt + 1));
        }
      }

      if (!blob) {
        console.warn(`Completely failed to generate image for panel ${panel.panel_number}. Using placeholder URL.`);
        updatedPanels.push({
          ...panel,
          image_url: IMAGE_GENERATION_FAILED_URL,
        });
        await sleep(2000);
        continue;
      }

      // 2. Upload to Cloudinary (permanent URLs only — no base64 fallback)
      let image_url: string = IMAGE_GENERATION_FAILED_URL;
      try {
        // Create FormData payload
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET as string);

        // Upload FormData to Cloudinary (with exponential backoff retries)
        const cloudinaryResponse = await fetchWithRetry(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            // Do NOT set Content-Type header; fetch handles multipart boundary automatically
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error(`Cloudinary API error: ${cloudinaryResponse.status} ${cloudinaryResponse.statusText}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        image_url = cloudinaryData.secure_url;
      } catch (uploadError) {
        console.warn(
          `Cloudinary upload failed for panel ${panel.panel_number} after all retries. Using placeholder URL.`,
          uploadError
        );
        image_url = IMAGE_GENERATION_FAILED_URL;
      }

      updatedPanels.push({
        ...panel,
        image_url,
      });
    } catch (error) {
      console.error(`Failed to process image for panel ${panel.panel_number}:`, error);
      updatedPanels.push({
        ...panel,
        image_url: IMAGE_GENERATION_FAILED_URL,
      });
    }

    // Sleep to avoid EAI_AGAIN network errors from rapid sequential connections
    await sleep(2000);
  }

  return updatedPanels;
}
