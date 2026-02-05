import { useState, useEffect } from 'react';

// Define the shape of our message
export interface Message {
    id: number;
    title: string;
    message: string;
    from: 'control' | 'admin';
    to: 'admin' | 'guards' | 'control' | 'all';
    timestamp: number;
    read: boolean;
    priority: 'normal' | 'high';
}

const STORAGE_KEY = 'cia_security_communications';

export const useMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    // Load messages from storage on mount
    useEffect(() => {
        const loadMessages = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setMessages(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse messages", e);
                }
            }
        };

        loadMessages();

        // Listen for storage events (cross-tab sync)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadMessages();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const sendMessage = (msg: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
        const newMessage: Message = {
            ...msg,
            id: Date.now(),
            timestamp: Date.now(),
            read: false,
        };

        const updatedMessages = [newMessage, ...messages];
        setMessages(updatedMessages);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));

        // Dispatch a custom event for same-tab updates if needed, 
        // though React state update handles this component's re-render.
        // For other components in the SAME tab to update effectively without Context, 
        // we can dispatch a window event.
        window.dispatchEvent(new Event('local-storage-update'));
    };

    // Poll for changes in the same tab (since storage event only fires for OTHER tabs)
    useEffect(() => {
        const handleLocalUpdate = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setMessages(JSON.parse(stored));
            }
        };

        window.addEventListener('local-storage-update', handleLocalUpdate);
        return () => window.removeEventListener('local-storage-update', handleLocalUpdate);
    }, []);

    return { messages, sendMessage };
};
