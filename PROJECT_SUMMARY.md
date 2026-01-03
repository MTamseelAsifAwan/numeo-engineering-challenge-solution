# Project Summary & Implementation Details

## Requirements vs. Implementation

| Requirement | Status | Implementation Details |
| :--- | :--- | :--- |
| **Frontend:** React + TypeScript | ✅ Done | Built with Vite, React 19, and TypeScript. |
| **Voice Recording:** Web APIs | ✅ Done | Used **Web Speech API** for lower latency and better UX than MediaRecorder. |
| **Real-time Comm:** Socket.io | ✅ Done | `socket.io-client` pushes text to the backend instantly. |
| **UI:** Clear and simple | ✅ Done | Minimalist interface focused purely on the translation task. |
| **Backend:** Node.js | ✅ Done | Express server acting as a secure relay. |
| **AI Integration:** External API | ✅ Done | Integrated **Groq (Llama 3)** for ultra-fast Spanish translation. |

## Key Decisions & Trade-offs

### 1. Why Web Speech API instead of MediaRecorder?
The prompt suggested `MediaRecorder` (sending audio blobs), but I chose the `Web Speech API`.
*   **Reason:** Sending raw audio requires the backend to handle Speech-to-Text (STT) processing (e.g., via Whisper), which adds significant latency and cost.
*   **Benefit:** The Web Speech API is built into the browser, free, and provides **instant** streaming text. This allows the backend to focus solely on *translation*, making the app feel truly "live" and responsive.

### 2. Why Groq (Llama 3)?
I specifically chose Groq's API over standard OpenAI GPT-4.
*   **Reason:** Speed. Groq's LPU inference engine provides near-instant tokens. For a live conversation app, waiting 2-3 seconds for a translation is bad UX. Groq returns it in milliseconds.

## How it Works
1.  **Listen:** Browser listens to user's voice and converts it to text locally.
2.  **Send:** As soon as a sentence is finalized, it's emitted via Socket.io.
3.  **Translate:** Backend receives text -> calls Groq API -> returns Spanish text.
4.  **Display:** Frontend augments the UI list with the new translation.
