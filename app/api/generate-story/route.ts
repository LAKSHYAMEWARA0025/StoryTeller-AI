import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DIRECTOR_SYSTEM_INSTRUCTION } from '../../../lib/prompts/systemPrompts';
import { SavedStory, StoryGenerateResponse, StoryResponse } from '../../../lib/types';
import { generateAndUploadImages, IMAGE_GENERATION_FAILED_URL } from '../../../lib/agents/artAgent';
import { createClient } from '@/utils/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateStoryTitle(description: string): Promise<string> {
  const titleModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const titlePrompt = `Generate a short, catchy comic book title (maximum 8 words) for this story premise:
"${description}"

Return only the title text. No quotes, no punctuation at the end, no explanation.`;

  try {
    const result = await titleModel.generateContent(titlePrompt);
    const title = result.response.text().trim().replace(/^["']|["']$/g, '');
    return title || 'Untitled Story';
  } catch (error) {
    console.warn('Failed to generate title with Gemini, using fallback:', error);
    const words = description.trim().split(/\s+/).slice(0, 6).join(' ');
    return words ? `${words}...` : 'Untitled Story';
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      description,
      theme,
      tone,
      panelCount,
      language = 'English',
      format,
    } = body;

    if (!description || !theme || !tone || !panelCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const languageInstruction = `\nSTRICT LANGUAGE RULE: The user has requested the language: ${language}. You MUST follow this split: The 'dialogue' field MUST be written natively in ${language} (e.g., if Hindi, use Devanagari script). However, the 'image_prompt' and 'character_descriptions' fields MUST be written strictly in English so the image generator can understand them.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION + languageInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Create a ${panelCount}-panel comic script.
Narrative: ${description}
Theme: ${theme}
Tone: ${tone}

Ensure the output adheres strictly to the StoryResponse JSON schema with exactly ${panelCount} panels.`;

    let result;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
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

    const storyData = JSON.parse(result.response.text()) as StoryResponse;
    storyData.format = format;
    storyData.language = language;

    const [title, panelsWithImages] = await Promise.all([
      generateStoryTitle(description),
      generateAndUploadImages(storyData.panels),
    ]);

    storyData.panels = panelsWithImages;

    const panel_urls = storyData.panels.map(
      (panel) => panel.image_url ?? IMAGE_GENERATION_FAILED_URL
    );

    const storyInsert: Omit<SavedStory, 'id' | 'created_at'> = {
      user_id: user.id,
      title,
      panel_urls,
      panels_data: storyData,
      theme,
      tone,
      panel_count: Number(panelCount),
      format,
      language,
    };

    const responsePayload: StoryGenerateResponse = {
      ...storyData,
      format,
      language,
    };

    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert(storyInsert)
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to save story to database:', saveError);
      responsePayload.saveWarning =
        'Your comic was generated successfully, but it could not be saved to your gallery. Please try again later.';
    } else if (savedStory) {
      responsePayload.savedStoryId = savedStory.id;
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
