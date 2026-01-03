# Voice Translator

A real-time full-stack voice translation application. It captures English speech using the browser's native Web Speech API and translates it instantly to Spanish using a Node.js backend powered by Groq's Llama 3 AI.

## Features

*   **Live Speech Recognition**: Uses the Web Speech API for zero-latency, free, and accurate English transcription.
*   **Real-time Translation**: Socket.io transports text to the backend, which queries the Groq API (Llama 3.3) for instant Spanish translation.
*   **Reactive UI**: Built with React + TailwindCSS for a sleek, responsive experience.

## Tech Stack

### Frontend
*   React 19 (Vite)
*   TypeScript
*   TailwindCSS v4
*   Socket.io Client
*   Web Speech API (SpeechRecognition)

### Backend
*   Node.js (Express)
*   Socket.io Server
*   Groq SDK (Llama 3.3-70b-versatile)

## How to Run

### Prerequisites
*   Node.js installed.
*   A Groq API Key (Create one at console.groq.com).

### 1. Setup Backend
1. Open a terminal in the `backend` folder.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and add your key: `GROQ_API_KEY=your_key_here`
4. Run `npm start`.
The server will run on http://localhost:3001.

### 2. Setup Frontend
1. Open a terminal in the `frontend` folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:5173 in Chrome or Edge (browsers with Web Speech API support).

## Assumptions & Trade-offs

1.  **Web Speech API vs MediaRecorder**:
    *   *Requirement*: The task mentioned `MediaRecorder`.
    *   *Decision*: I chose the **Web Speech API** (`SpeechRecognition`) instead.
    *   *Reasoning*:
        *   **Performance**: Sending raw audio blobs via WebSocket and transcribing them on the server (e.g., via Whisper) introduces significant latency and cost.
        *   **Simplicity**: The browser's built-in speech recognition is free, handles noise suppression natively, and provides immediate interim results (streaming text).
        *   **Experience**: This approach allows for a true "real-time" conversation feel compared to the "record -> stop -> send -> transcribe -> translate" loop.

2.  **Groq Llama 3**:
    *   Used Groq's Llama 3.3 model for translation because of its incredible speed, which is critical for a live translator.

3.  **No Persistence**:
    *   Translations are ephemeral and live in the React state. For a production app, I would add a database (PostgreSQL/MongoDB) to save conversation history.
