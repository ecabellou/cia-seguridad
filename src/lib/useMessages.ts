import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface Message {
    id: number;
    title: string;
    message: string;
    from: 'control' | 'admin' | 'guard';
    to: 'admin' | 'guards' | 'control' | 'all' | string;
    timestamp: number;
    read: boolean;
    priority: 'normal' | 'high';
    sender_id?: string; // Nuevo campo opcional para identificar quien envió
}

export const useMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [latestMessage, setLatestMessage] = useState<Message | null>(null);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching messages:", error);
            return;
        }

        const formatted = data.map((m: any) => ({
            id: m.id,
            title: m.title,
            message: m.message,
            from: m.from_role,
            to: m.to_target,
            timestamp: new Date(m.created_at).getTime(),
            read: m.is_read,
            priority: m.priority,
            sender_id: m.sender_id
        }));
        setMessages(formatted);
    };

    useEffect(() => {
        fetchMessages();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                // Emitir el nuevo mensaje para alertas globales
                setLatestMessage({
                    id: newMsg.id,
                    title: newMsg.title,
                    message: newMsg.message,
                    from: newMsg.from_role,
                    to: newMsg.to_target,
                    timestamp: new Date(newMsg.created_at).getTime(),
                    read: newMsg.is_read,
                    priority: newMsg.priority,
                    sender_id: newMsg.sender_id
                });
                fetchMessages();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, fetchMessages)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const sendMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
        const { error } = await supabase
            .from('messages')
            .insert({
                title: msg.title,
                message: msg.message,
                from_role: msg.from,
                to_target: msg.to,
                priority: msg.priority,
                is_read: false,
                sender_id: msg.sender_id // Guardar quien envió
            });

        if (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    };

    const markAsRead = async (messageId: number) => {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);

        if (error) console.error("Error marking as read:", error);
    };

    return { messages, sendMessage, markAsRead, latestMessage };
};
