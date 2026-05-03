import { ComicPanel } from '../types';
import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face Inference SDK
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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

export async function generateAndUploadImages(panels: ComicPanel[]): Promise<ComicPanel[]> {
  const updatedPanels: ComicPanel[] = [];

  // Process each panel sequentially to avoid network crashes and rate limits
  for (const panel of panels) {
    try {
      // 1. Generate image using Hugging Face Inference SDK
      let blob = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          blob = await hf.textToImage(
            {
              model: 'black-forest-labs/FLUX.1-schnell',
              inputs: panel.image_prompt,
            },
            {
              outputType: 'blob',
            }
          );
          break; // Success, exit the retry loop
        } catch (err) {
          if (attempt === 4) break; // Exhausted all retries
          console.log(`HF failed (attempt ${attempt + 1}/5), retrying in ${2000 * (attempt + 1)}ms...`);
          await sleep(2000 * (attempt + 1));
        }
      }

      if (!blob) {
        console.warn(`Completely failed to generate image for panel ${panel.panel_number}. Skipping...`);
        updatedPanels.push(panel); // Push original panel (no image_url) so dialogue still renders
        await sleep(2000);
        continue; // Skip Cloudinary upload and move to the next panel
      }

      // 2. Attempt Cloudinary upload, with Base64 fallback if it fails entirely
      let image_url: string | undefined;
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
        console.warn(`Cloudinary upload failed for panel ${panel.panel_number}. Using Base64 fallback...`, uploadError);
        // Convert blob directly to a Base64 data URI so the frontend still receives a valid image
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        image_url = `data:${blob.type};base64,${buffer.toString('base64')}`;
      }

      // 3. Push the panel with the resolved image URL (Cloudinary or Base64)
      updatedPanels.push({
        ...panel,
        image_url,
      });
    } catch (error) {
      console.error(`Failed to process image for panel ${panel.panel_number}:`, error);
      // On failure, push the original panel without an image_url and continue the loop
      updatedPanels.push(panel);
    }

    // Sleep to avoid EAI_AGAIN network errors from rapid sequential connections
    await sleep(2000);
  }

  return updatedPanels;
}
