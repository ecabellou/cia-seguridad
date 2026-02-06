import { useState, useEffect, useRef } from 'react';
import { Send, Bell, Clock, AlertTriangle, CheckCircle, User, Shield } from 'lucide-react';
import { useMessages } from '../../lib/useMessages';
import { supabase } from '../../lib/supabase';
import clsx from 'clsx';

const Inbox = () => {
    const { messages, markAsRead, sendMessage } = useMessages();
    const [userId, setUserId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    // Filter messages: Incoming (to me/all) OR Outgoing (from me)
    const chatMessages = messages.filter(m => {
        const isIncoming = m.to === 'guards' || m.to === 'all' || m.to === userId;
        const isOutgoing = m.sender_id === userId;
        return isIncoming || isOutgoing;
    }).sort((a, b) => a.timestamp - b.timestamp); // Sort chronological for Chat (oldest top, newest bottom)

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        // Auto-mark visible unread messages as read
        if (userId) {
            const unreadIds = chatMessages
                .filter(m => !m.read && m.to === userId) // Only mark direct messages or targeted ones
                .map(m => m.id);

            if (unreadIds.length > 0) {
                unreadIds.forEach(id => markAsRead(id));
            }
        }
    }, [chatMessages.length, userId]);


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        setSending(true);
        try {
            // Default to sending to 'control'
            await sendMessage({
                title: 'Mensaje de Guardia',
                message: messageText,
                from: 'guard',
                to: 'control',
                priority: 'normal',
                sender_id: userId || undefined
            });

            setMessageText("");
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            alert("No se pudo enviar el mensaje");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-100 -m-4 md:-m-8">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-full text-white">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 leading-none">Central de Mensajes</h1>
                        <span className="text-xs text-slate-500">Conexión Directa</span>
                    </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    EN LÍNEA
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <Shield size={48} className="mb-4 text-slate-300" />
                        <p>No hay mensajes en el historial.</p>
                        <p className="text-sm">Tus comunicaciones con la central aparecerán aquí.</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        const isMe = msg.sender_id === userId;
                        const isAdmin = msg.from === 'admin';

                        return (
                            <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                <div className={clsx(
                                    "p-3 rounded-2xl shadow-sm text-sm relative group transition-all",
                                    isMe
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : isAdmin
                                            ? "bg-slate-800 text-white rounded-bl-none border-2 border-slate-700"
                                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                                )}>
                                    {/* Sender Label for Incoming */}
                                    {!isMe && (
                                        <div className={clsx("text-[10px] font-bold mb-1 opacity-90 flex items-center gap-1", isAdmin ? "text-purple-300" : "text-blue-600")}>
                                            {isAdmin ? <Shield size={10} /> : <User size={10} />}
                                            {isAdmin ? 'ADMINISTRACIÓN' : 'CENTRAL CONTROL'}
                                        </div>
                                    )}

                                    {/* Priority Badge */}
                                    {msg.priority === 'high' && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold mb-1 opacity-90 uppercase tracking-wider text-amber-300">
                                            <AlertTriangle size={10} /> Prioritario
                                        </div>
                                    )}

                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                                    <div className={clsx("flex items-center gap-1 text-[10px] mt-1 opacity-70", isMe ? "justify-end text-blue-100" : "text-slate-400 font-medium")}>
                                        <Clock size={10} />
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <span className="flex items-center gap-0.5 ml-1">
                                                {msg.read ? <CheckCircle size={10} /> : <CheckCircle size={10} className="opacity-50" />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Escribir a central..."
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3 shadow-lg shadow-blue-600/20 transition-all aspect-square flex items-center justify-center"
                >
                    <Send size={24} />
                </button>
            </form>
        </div>
    );
};

export default Inbox;
