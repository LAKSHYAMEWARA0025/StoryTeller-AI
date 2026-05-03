# 📖 StoryTeller AI - Narrative Story Agent

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google)

Transform simple text prompts into fully visualized, multi-panel comic boards complete with native multi-lingual audio narration. Powered by Google Gemini 2.5 Flash and Next.js.

🔴 **Live Demo:** [Insert Vercel Link Here]

---

## ✨ Features
* **Cinematic Director AI:** A highly structured system prompt that guarantees character consistency and accurate camera framing across multiple generative images.
* **Native Audio Engine:** Utilizes the Web Speech API (`window.speechSynthesis`) to dynamically narrate panels in multiple languages without relying on external TTS limits.
* **Multi-Lingual Support:** Generates dialogue and audio in English, Japanese, Spanish, French, and Mandarin Chinese.
* **Robust Error Handling:** Built-in fault tolerance for API rate limits (429 errors) and browser garbage collection bugs.

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* A Google Gemini API Key

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/narrative-story-agent.git](https://github.com/YOUR_USERNAME/narrative-story-agent.git)
   cd narrative-story-agent