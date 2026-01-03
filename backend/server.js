import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('Server Configuration:');
console.log('  - Groq API:', process.env.GROQ_API_KEY ? 'Configured' : 'Missing');

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('translate', async ({ text, targetLanguage }) => {
    try {
      if (!text) return;
      // console.log(`Translating: "${text}" to ${targetLanguage}`);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following English text to ${targetLanguage || 'Spanish'}. Provide ONLY the translated text. Do not add any explanations or quotes.`
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "llama-3.3-70b-versatile",
      });

      const translatedText = completion.choices[0]?.message?.content || "";
      // console.log('Translated:', translatedText);

      socket.emit('translation', {
        original: text,
        translated: translatedText,
      });

    } catch (error) {
      console.error('Translation error:', error.message);
      socket.emit('error', {
        message: 'Translation failed: ' + error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;

httpServer.listen(PORT, () => {
  console.log(`Translation Server running on http://localhost:${PORT}`);
});
