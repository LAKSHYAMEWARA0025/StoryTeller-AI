# Project Goal
Build a Narrative-to-Visual Story Agent using Next.js. It takes a text narrative, theme, and tone from a user, uses Gemini to generate a structured 4/6/8/12-panel comic script with image generation prompts, and outputs the final visual comic board.

# Tech Stack
- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **AI / Script Generation**: Google Gemini API (`gemini-flash-latest`) via `@google/generative-ai`
- **Image Generation**: Hugging Face Inference SDK (`@huggingface/inference`) → `black-forest-labs/FLUX.1-schnell`
- **Image Hosting**: Cloudinary (unsigned upload via upload preset)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Installed packages**: `@google/generative-ai`, `@huggingface/inference`, `next-cloudinary`, `framer-motion`, `lucide-react`
- **Audio**: Web Speech API (Native TTS) with Cloud Audio fallback (experimental)
- **Cinematography**: Custom `camera_motion` logic and Ken Burns effects via Framer Motion

# Core Rule
Every time you complete a major task, you MUST update this PROJECT_CONTEXT.md file with what was built and what the next logical step is.

# Environment Variables Required (`.env.local`)
```
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=
```

# Current Architecture
```text
.
├── app
│   ├── api
│   │   └── generate-story
│   │       └── route.ts          ← POST handler: Gemini script → artAgent → JSON response
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  ← 'use client' main controller; isLoading + storyData state
├── components
│   ├── ComicBoard.tsx            ← Animated carousel (framer-motion); speech bubble overlay
│   └── StoryForm.tsx             ← 'use client' form; description, panelCount, theme, tone
└── lib
    ├── agents
    │   ├── artAgent.ts           ← Image gen + upload pipeline (sequential, fully retried)
    │   └── directorAgent.ts      ← (reserved for future director agent logic)
    ├── prompts
    │   └── systemPrompts.ts      ← DIRECTOR_SYSTEM_INSTRUCTION with JSON schema enforcement
    └── types.ts                  ← ComicPanel, StoryResponse interfaces
```

# Task Progress

## Phase 1 — Types & Prompts ✅
- Defined `ComicPanel` (panel_number, dialogue, character_descriptions, image_prompt, image_url?) and `StoryResponse` in `lib/types.ts`.
- Created `DIRECTOR_SYSTEM_INSTRUCTION` in `lib/prompts/systemPrompts.ts`. The prompt enforces strict JSON output, mandates non-empty dialogue on every panel (inner thoughts if no speech), enforces visual character consistency across all `image_prompt` fields, and prepends `Art style: [THEME]` to every image prompt.

## Phase 2 — UI Components ✅
- **`StoryForm.tsx`**: Client-side settings card. Inputs: story description (textarea), panel count (4/6/8), visual theme (Cyberpunk, 1980's, Black and White, Anime, Cartoon, Sketch), story tone (Noir, Humorous, Motivating, Melancholy, Action). Passes data up via `onSubmit` prop.
- **`ComicBoard.tsx`**: Upgraded to a **cinematic storybook carousel** using Framer Motion (`AnimatePresence` + `motion.div`). Features: slide-in/out panel transitions, full-bleed image, speech bubble overlaid at the bottom, left/right `ChevronLeft`/`ChevronRight` navigation buttons (auto-disabled at ends), panel counter badge, and a clickable pill-dot progress indicator below.

## Phase 3 — Main Page Controller ✅
- `app/page.tsx` is a `'use client'` component managing `isLoading`, `storyData`, and `language` state.
- **Multi-language Support**: A glassmorphism dropdown allows users to select English, Hindi, Japanese, Spanish, French, or Mandarin. The selected language is sent to the backend and passed down to the audio engine.
- `handleGenerateStory` makes a POST to `/api/generate-story`, shows a custom `LoadingSequence` (pulsing neon spinner with cycling status text), and passes `storyData.panels` to `ComicBoard`.

## Phase 4 — API Route & Agent Pipeline ✅
- **`app/api/generate-story/route.ts`**: POST handler extracts form body, injects a **dynamic language instruction** into the Gemini system prompt (Dialogue in native script, Prompts in English), and handles 429 rate limits with a **3-attempt retry loop (15s backoff)**.
- **Cinematography Logic**: The prompt mandates a `camera_motion` field ("zoom-in/out", "pan-left/right/up/down") based on the narrative beat.
- **`lib/agents/artAgent.ts`**: Full sequential image generation + upload pipeline. Key design decisions:
  - `fetchWithRetry` and HF retry loops (5 attempts) with exponential backoff.
  - Base64 fallback if Cloudinary fails completely.

## Phase 5 — UI Polish & Cinematic Features ✅
- **Ken Burns Effect**: `ComicBoard.tsx` implements dynamic Framer Motion animations (scale, x/y translations) on the images based on the `camera_motion` field, creating a living "breathing" storyboard.
- **Cinematic Audio Engine**:
  - Native Web Speech API with BCP-47 language mapping (`hi-IN`, `ja-JP`, etc.).
  - **Autoplay Lock**: Uses `useRef` to ensure each panel plays audio exactly once upon transition.
  - **GC Fix**: Persists `SpeechSynthesisUtterance` in a ref to prevent Chrome's garbage collector from interrupting speech.
  - **Micro-delay**: 50ms `setTimeout` between `cancel()` and `speak()` to prevent API race conditions.
  - **Error Filtering**: Silently ignores expected 'interrupted' and 'canceled' events.
  - Includes a `Volume2` replay button inside the speech bubble.
- **Advanced Prompt Engineering**: `systemPrompts.ts` overhauled with strict character anchoring (copy-paste physical blueprints), cinematic framing rules (Medium shot, Close up), and an isolation rule to prevent background extras.
- Dark glassmorphism styling throughout with gradient text and pulsing loading sequences.

## Next Logical Step
- **Phase 6**: Deployment (Vercel), final environment variable setup, performance testing, and README documentation.
