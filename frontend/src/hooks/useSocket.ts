import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Translation {
    original: string;
    translated: string;
    targetLanguage: string;
    timestamp: string;
}

export const useSocket = (url: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(url);

        socket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        // Listen for translation results
        socket.on('translation', (data: Translation) => {
            // console.log('Translation received:', data);
            setTranslations((prev) => [data, ...prev]);
        });

        // Listen for errors
        socket.on('error', (data: { message: string; type?: string }) => {
            console.error('Error:', data);
            setError(data.message);
            setTimeout(() => setError(null), 5000);
        });

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, [url]);

    const translate = (text: string, targetLanguage: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('translate', { text, targetLanguage });
        }
    };

    return {
        isConnected,
        translations,
        error,
        translate
    };
};
