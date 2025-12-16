# QuickVest AI

QuickVest AI is an AI-assisted onboarding system built during a hackathon to
streamline user sign-up by combining conversational AI, structured data
extraction, and voice interaction.

The system acts as an intelligent assistant that guides users through account
creation, automatically fills required fields, and responds via both text and
audio.

---

## Problem

Traditional onboarding flows require users to manually fill long forms, often
leading to friction, confusion, and drop-off.

We explored whether a conversational, AI-driven approach could:
- Reduce user effort
- Interpret free-form responses
- Automatically populate structured signup fields

---

## Solution Overview

QuickVest AI functions as an **AI-powered signup assistant**:

1. User interacts via text or voice
2. The assistant asks contextual follow-up questions
3. Responses are processed by an LLM
4. Structured JSON output is generated
5. Signup form fields are automatically populated
6. The assistant responds using synthesized voice output

The experience resembles a guided chatbot rather than a static form.

---

## System Architecture

### Frontend
- **Next.js / React**
- Dynamic form updates based on AI responses
- Real-time conversational UI

### AI & Backend Logic
- **Gemini API**
  - Processes user input
  - Returns structured JSON representing extracted signup data
- **ElevenLabs**
  - Converts user speech to text
  - Generates audio responses for the assistant

### Data Flow
User (Text / Voice)
- Gemini (LLM)
- Structured JSON
- Form Autofill
- Assistant Response (Text + Audio)

---

## Key Features

- AI-guided signup experience
- Automatic form field population from LLM-generated JSON
- Voice input and audio output
- Context-aware follow-up questions
- Conversational alternative to traditional onboarding forms

---

## Hackathon Context

This project was built as part of a hackathon in a limited timeframe.
While not production-ready, it demonstrates:
- Rapid prototyping of AI-powered workflows
- Integration of multiple AI services
- Practical use of LLMs for structured data extraction

---

## My Contributions

- Designed the AI-assisted onboarding flow
- Integrated Gemini API for JSON-based field extraction
- Implemented dynamic form population logic
- Integrated ElevenLabs for speech input and audio output
- Built frontend components for conversational interaction

---

## Technologies Used

- Next.js / React
- Gemini API
- ElevenLabs
- Node.js
- TypeScript / JavaScript

---

## Notes

This repository reflects a prototype developed under hackathon constraints.
The focus is on system design, AI integration, and user experience rather than
full production hardening.
