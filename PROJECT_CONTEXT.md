# Project Goal
Build a Narrative-to-Visual Story Agent using Next.js. It takes a text narrative, theme, and tone from a user, uses Gemini to generate a structured 4/6/8/12-panel comic script with image generation prompts, and outputs the final visual comic board.

# Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript
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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

# Current Architecture
```text
.
├── app
│   ├── api
│   │   └── generate-story
│   │       └── route.ts          ← POST handler: Gemini script → artAgent → JSON response
│   ├── dashboard
│   │   ├── page.tsx              ← Project Gallery (fetches SavedStory[] from Supabase)
│   │   ├── generate
│   │   │   └── page.tsx          ← Generation workspace (StoryForm + format-aware viewer)
│   │   └── story/[id]
│   │       └── page.tsx          ← Story viewer (interactive or static playback)
│   ├── login
│   ├── auth/callback
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  ← Public landing page (hero + Get Started / Login)
├── components
│   ├── Navbar.tsx                ← Session-aware nav; logo routes by auth state
│   ├── ComicBoard.tsx            ← Interactive carousel (framer-motion + TTS)
│   ├── StaticComicViewer.tsx     ← Vertical static comic + blob downloads
│   ├── StoryFormatViewer.tsx     ← Routes to ComicBoard or StaticComicViewer by format
│   └── StoryForm.tsx             ← Form incl. aspect ratio & format selectors
├── middleware.ts                 ← Session refresh + route guards (/ → /dashboard, /dashboard → /login)
└── utils/supabase                ← Browser + server Supabase clients
    ├── client.ts
    └── server.ts
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
- **`StoryForm.tsx`**: Client-side settings card. Inputs: story description (textarea), panel count (4/6/8), visual theme (Cyberpunk, 1980's, Black and White, Anime, Cartoon, Sketch), story tone (Noir, Humorous, Motivating, Melancholy, Action, Surprised, Fear, Love). Passes data up via `onSubmit` prop.
- **Hero Component**: The background video was replaced with a static photo.
- **`ComicBoard.tsx`**: Upgraded to a **cinematic storybook carousel** using Framer Motion (`AnimatePresence` + `motion.div`). Features: slide-in/out panel transitions, full-bleed image, speech bubble overlaid at the bottom, left/right `ChevronLeft`/`ChevronRight` navigation buttons (auto-disabled at ends), panel counter badge, and a clickable pill-dot progress indicator below.

## Phase 3 — Main Page Controller ✅
- `app/dashboard/generate/page.tsx` is a `'use client'` component managing `isLoading`, `storyData`, and `language` state.
- **Multi-language Support**: A glassmorphism dropdown allows users to select English, Japanese, Spanish, French, or Mandarin. The selected language is sent to the backend and passed down to the audio engine.
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

## Phase 6 — Deployment & Documentation ✅
- Successfully deployed the application on Vercel.
- Fully updated the README with the Ambiguity, Coherence, and Determinism test cases.

## Phase 7 — Gallery vs. Workspace Architecture ✅
- **Supabase Auth**: SSR clients (`utils/supabase`), middleware session refresh, login page (Email/Password + Google OAuth), and API auth guard on `/api/generate-story`.
- **SavedStory type**: `SavedStory` interface in `lib/types.ts` mirrors the Supabase `stories` table (`title`, `panel_urls`, `panels_data`, `theme`, `tone`, `panel_count`, etc.).
- **Public landing** (`app/page.tsx`): Marketing hero with Get Started / Login → `/login`.
- **Project Gallery** (`app/dashboard/page.tsx`): Server component fetches the user's `stories` from Supabase. Empty state shows Welcome + "Generate Your First Story"; populated state shows a card grid (title, theme, first `panel_urls` thumbnail) plus Create New Story (top-right on desktop, FAB on mobile).
- **Generation workspace** (`app/dashboard/generate/page.tsx`): Client-side generator (StoryForm, ComicBoard, loading sequence) — unchanged generation logic.
- **Route guards**: Middleware redirects `/` → `/dashboard` (signed in), `/dashboard/*` → `/login` (guests).
- **Navbar**: Logo and Dashboard link point to `/dashboard` for authenticated users; `/` for guests.
- **Post-login**: Sign-in and OAuth callback redirect to `/dashboard`.

## Phase 8.5 — Story Playback & Viewer Route ✅
- **Dynamic route** (`app/dashboard/story/[id]/page.tsx`): Server-fetches a `SavedStory` by ID (RLS enforces ownership).
- **Panel reconstruction** (`lib/utils/reconstructPanels.ts`): Merges `panels_data` with `panel_urls` into `ComicPanel[]` for `ComicBoard`.
- **Viewer UI**: `StoryViewerClient` wraps `ComicBoard` without modifying its internals; includes "Back to Studio" navigation.
- **Not found state**: Friendly message + link to `/dashboard` when the story is missing or inaccessible.
- **Gallery links**: Story cards in `app/dashboard/page.tsx` link to `/dashboard/story/[id]`.

## Phase 8 — Story Persistence Logic ✅
- **Strict Cloudinary policy** (`lib/agents/artAgent.ts`): Removed Base64 fallback. Failed HF generation or Cloudinary upload (after 5 retries) assigns a permanent placeholder URL (`placehold.co/600x400?text=Image+Generation+Failed`) so the database only stores durable URLs.
- **API save flow** (`app/api/generate-story/route.ts`): Uses authenticated `user_id`, generates a comic title via Gemini from the user's prompt, runs `artAgent`, then inserts into Supabase `stories` before responding.
- **Saved fields**: `user_id`, `title`, `panel_urls`, `panels_data` (full `StoryResponse` JSON), `theme`, `tone`, `panel_count` — typed with `SavedStory` / `Omit<SavedStory, 'id' | 'created_at'>`.
- **Resilient UX**: DB insert failures are logged; the client still receives the generated comic with optional `saveWarning` and `savedStoryId` in `StoryGenerateResponse`.

## Phase 9 — Static Format & Aspect Ratio Options ✅
- **Types**: `aspect_ratio` and `format` on `StoryResponse` and `SavedStory`.
- **StoryForm**: Aspect ratio (Square 1:1, Portrait 9:16, Landscape 16:9) and format (Interactive vs Static Comic) selectors.
- **artAgent**: Hugging Face `textToImage` uses `parameters: { width, height }` per aspect ratio (1024×1024, 576×1024, 1024×576).
- **API**: Passes `aspectRatio` / `format` to `artAgent` and persists them on Supabase `stories` rows.
- **StaticComicViewer**: Vertical web-comic layout with dialogue and per-panel blob-based download (CORS-safe).
- **Conditional UI**: `StoryFormatViewer` renders `ComicBoard` (interactive) or `StaticComicViewer` (static) on generate and story viewer routes.

## Next Logical Step
- **Phase 10**: ElevenLabs Audio & High-Res Export — replace or augment Web Speech TTS and add export-quality deliverables.
