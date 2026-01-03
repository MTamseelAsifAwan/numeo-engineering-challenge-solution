import { useState, useEffect, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import './App.css';

// Type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function App() {
  const { isConnected, translations, translate } = useSocket('http://localhost:3001');
  const [isRecording, setIsRecording] = useState(false);
  const [liveEnglish, setLiveEnglish] = useState('');

  // Ref to track if we *should* be recording
  const shouldRecordRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        // 1. Construct full transcript for display (History + Current)
        // We join with a space to separate sentences
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        setLiveEnglish(currentTranscript);

        // 2. Identify NEW final chunks to translate
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalChunk = event.results[i][0].transcript;
            translate(finalChunk, 'Spanish');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access blocked.');
          shouldRecordRef.current = false;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if silence stopped it but we want to keep recording
        if (shouldRecordRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // ignore
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      shouldRecordRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [translate]);

  const toggleRecording = () => {
    if (isRecording) {
      shouldRecordRef.current = false;
      recognitionRef.current?.stop();
    } else {
      shouldRecordRef.current = true;
      try {
        recognitionRef.current?.start();
        setLiveEnglish(''); // Clear previous session text on new start
      } catch (e) {
        console.error("Could not start recording:", e);
      }
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Live Voice Translator
        </h1>
        <p className="text-slate-400">English - Spanish</p>
      </header>

      <div className={`mb-6 px-4 py-2 rounded-full text-sm font-semibold ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">

        {/* English Section */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
              English
            </h2>
            {isRecording && <span className="animate-pulse text-red-400 text-xs font-bold">LISTENING</span>}
          </div>

          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 overflow-y-auto font-medium text-lg text-slate-200 whitespace-pre-wrap">
            {liveEnglish || <span className="text-slate-600 italic">Click record and start speaking...</span>}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={toggleRecording}
              className={`p-6 rounded-full transition-all duration-300 shadow-lg ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-500/30 scale-110'
                  : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
                }`}
            >
              <div className={`w-8 h-8 ${isRecording ? 'bg-white rounded px-1' : 'bg-white rounded-full'}`} style={{ borderRadius: isRecording ? '4px' : '50%' }} />
            </button>
          </div>
          <p className="text-center mt-2 text-slate-500 text-sm">
            {isRecording ? 'Tap to Stop' : 'Tap to Record'}
          </p>
        </div>

        {/* Spanish Section */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-400">Spanish</h2>
            <span className="text-xs text-slate-500">{translations.length} translations</span>
          </div>

          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 overflow-y-auto space-y-4">
            {translations.length === 0 ? (
              <span className="text-slate-600 italic">Translation will appear here...</span>
            ) : (
              translations.map((t, idx) => (
                <div key={idx} className="animate-slide-in">
                  <p className="text-purple-300 text-lg font-medium leading-relaxed">{t.translated}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 h-20 flex items-center justify-center text-slate-500 text-sm">
            Live translations via Groq
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
