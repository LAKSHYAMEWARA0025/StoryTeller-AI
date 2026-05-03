# StoryTeller AI - Narrative Story Agent

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js) ![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react) ![Tailwind **CSS**](https://img.shields.io/badge/Tailwind_CSS-**38B2AC**?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-**8E75B2**?style=for-the-badge&logo=google)

Transform simple text prompts into fully visualized, multi-panel comic boards complete with native multi-lingual audio narration. Powered by Google Gemini 2.5 Flash and Next.js.

Live Demo: [Insert Vercel Link Here]

---

## Features

- Cinematic Director AI: A highly structured system prompt that guarantees character consistency and accurate camera framing across multiple generative images.
- Native Audio Engine: Utilizes the Web Speech **API** (window.speechSynthesis) to dynamically narrate panels in multiple languages without relying on external **TTS** limits.
- Multi-Lingual Support: Generates dialogue and audio in English, Japanese, Spanish, French, and Mandarin Chinese.
- Robust Error Handling: Built-in fault tolerance for **API** rate limits (**429** errors) and browser garbage collection bugs.

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini **API** Key

### Installation

## Clone the repository:
    git clone [https://github.com/lakshyamewara0025/StoryTeller-AI.git](https://github.com/lakshyamewara0025/StoryTeller-AI.git)
    cd narrative-story-agent

## Install dependencies:

npm install

## Set up your environment variables. Create a .env.local file in the root directory:

GEMINI_API_KEY=your_api_key_here

## Start the development server:

npm run dev

## Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Testability & Evaluation Guide

This application is engineered to strictly adhere to evaluation criteria regarding coherence, scene breakdown logic, ambiguity handling, and determinism.

### How to Reproduce Results

## Ensure the app is running locally or via the Live Demo link. 
## Select English as the language. ## Copy and paste one of the predefined test stories below into the prompt area. 

## Click Generate.

### Predefined Test Inputs

#### Test Case 1: The Ambiguity Test

- Input Story: "A clock strikes 13. The cat looks at the calendar. It's time."
- Target Tone: Noir Mystery
- Expected Output Characteristics:
    * Logic: The AI establishes a surreal or mysterious tone automatically without explicit instruction.
    * Scene Breakdown: Visually bridges the gap between a clock, a cat, and an impending event.
    * Determinism: The visual prompt locks onto a specific physical blueprint for the cat (e.g., *black cat, green eyes*) and maintains that exact description across all panels.

#### Test Case 2: The Coherence & Logic Test

- Input Story: "A young cyberpunk hacker named Jinx breaks into a megacorp server room. She downloads the data, but trips an alarm. She escapes by shattering the glass window and jumping onto a passing hover-train."
- Target Tone: Cinematic
- Expected Output Characteristics:
    * Logic: Storyboard follows chronological progression (Infiltration -> Download -> Alarm -> Escape).
    * Coherence: The character blueprint for *Jinx* (e.g., neon hair, tech-wear) remains perfectly consistent across changing environments (server room to mid-air jump).
    * Audio: Generated dialogue matches the escalating tension of the scene.

#### Test Case 3: The Determinism & Framing Test

- Input Story: "A solitary astronaut stands on a red dusty planet. They look up at two moons in the sky. They plant a flag with a golden star."
- Target Tone: Cinematic
- Expected Output Characteristics:
    * Determinism: The environment (red dust, two moons) and the astronaut's suit design remain consistent. 
    * Framing: The prompt engine enforces cinematic camera angles (e.g., *Wide shot of the red landscape*, *Close up on the gloved hand planting the flag*) rather than generic, disjointed imagery.

---

## Architecture Notes on Determinism

To achieve high determinism and visual consistency, this application utilizes a strictly formatted *Cinematic Director* system prompt. This forces the **LLM** to generate a physical blueprint for characters and copy-paste it into every subsequent image generation prompt, drastically reducing the 'shapeshifting' issue common in unstructured text-to-image pipelines.

Note on Audio: Non-English text-to-speech generation requires the respective OS language packs to be installed on the user's machine (e.g., Windows Time & Language Settings).