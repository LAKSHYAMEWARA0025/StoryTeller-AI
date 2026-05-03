import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DIRECTOR_SYSTEM_INSTRUCTION } from '../../../lib/prompts/systemPrompts';
import { StoryResponse } from '../../../lib/types';
import { generateAndUploadImages } from '../../../lib/agents/artAgent';

// Initialize the GoogleGenAI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, theme, tone, panelCount, language = 'English' } = body;

    if (!description || !theme || !tone || !panelCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize the model with dynamic language injection in systemInstruction
    const languageInstruction = `\nSTRICT LANGUAGE RULE: The user has requested the language: ${language}. You MUST follow this split: The 'dialogue' field MUST be written natively in ${language} (e.g., if Hindi, use Devanagari script). However, the 'image_prompt' and 'character_descriptions' fields MUST be written strictly in English so the image generator can understand them.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION + languageInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    // Construct the dynamic user prompt
    const prompt = `Create a ${panelCount}-panel comic script.
Narrative: ${description}
Theme: ${theme}
Tone: ${tone}

Ensure the output adheres strictly to the StoryResponse JSON schema with exactly ${panelCount} panels.`;

    // Call the model with retry logic to handle 429 quota errors
    let result;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break; // Success — exit the retry loop
      } catch (err: unknown) {
        const is429 =
          (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 429) ||
          (err instanceof Error && err.message.includes('429'));

        if (is429 && attempt < 3) {
          console.warn(`Gemini 429 rate limit hit (attempt ${attempt}/3). Waiting 15s before retry...`);
          await sleep(15000);
        } else {
          throw attempt === 3
            ? new Error('AI is currently overloaded. Please try again in a minute.')
            : err;
        }
      }
    }

    if (!result) throw new Error('AI is currently overloaded. Please try again in a minute.');
    const responseText = result.response.text();
    
    // Parse the returned JSON string into our StoryResponse object
    const storyData = JSON.parse(responseText) as StoryResponse;

    // Concurrently generate and upload images for all panels
    storyData.panels = await generateAndUploadImages(storyData.panels);

    // Return the strictly typed response
    return NextResponse.json(storyData);
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
