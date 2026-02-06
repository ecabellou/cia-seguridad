import { useState, useEffect, useMemo } from 'react';
import { Send, Users, MessageSquare, CheckCircle, Clock, AlertTriangle, User, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMessages, type Message } from '../../lib/useMessages';
import { supabase } from '../../lib/supabase';
import clsx from 'clsx';

const ControlCommunications = () => {
    const { sendMessage, messages, markAsRead } = useMessages();
    const [searchParams] = useSearchParams();

    // State for Threaded View
    const [selectedThreadId, setSelectedThreadId] = useState<string>('general');
    const [replyText, setReplyText] = useState('');
    const [priority, setPriority] = useState<'normal' | 'high'>('normal');

    // Guards Data
    const [guardsList, setGuardsList] = useState<{ id: string, name: string, status: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Guards
    useEffect(() => {
        const fetchGuards = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, status')
                .eq('role', 'guard');

            if (data) {
                setGuardsList(data.map(g => ({
                    id: g.id,
                    name: `${g.first_name} ${g.last_name || ''}`,
                    status: g.status
                })));
            }
        };
        fetchGuards();
    }, []);

    // Auto-select thread from URL
    useEffect(() => {
        const replyTo = searchParams.get('replyTo');
        if (replyTo) {
            if (replyTo === 'admin') setSelectedThreadId('admin');
            else if (replyTo === 'control') setSelectedThreadId('general'); // Fallback
            else setSelectedThreadId(replyTo);
        }
    }, [searchParams]);

    // --- LOGIC: Group Messages into Threads ---
    const threads = useMemo(() => {
        const groups: Record<string, Message[]> = {
            'general': [],
            'admin': []
        };

        // Initialize groups for known guards so they appear even if empty
        guardsList.forEach(g => {
            groups[g.id] = [];
        });

        messages.forEach(msg => {
            // 1. General Broadcasts (Control -> All Guards)
            if (msg.to === 'guards' || msg.to === 'all') {
                groups['general'].push(msg);
                return;
            }

            // 2. Admin Channel
            if (msg.to === 'admin' || msg.from === 'admin') {
                groups['admin'].push(msg);
                return;
            }

            // 3. Direct Guard Messages
            // If Control sent it -> key is msg.to
            // If Guard sent it -> key is msg.sender_id
            let threadKey: string | null = null;

            if (msg.from === 'control') {
                threadKey = msg.to; // Sent TO a specific guard
            } else if (msg.from === 'guard') {
                threadKey = msg.sender_id || null; // Sent FROM a specific guard
            }

            if (threadKey && groups[threadKey] !== undefined) {
                groups[threadKey].push(msg);
            } else if (threadKey) {
                // If we get a message from a guard not in our active list (maybe retired/deleted), add bucket
                if (!groups[threadKey]) groups[threadKey] = [];
                groups[threadKey].push(msg);
            }
        });

        return groups;
    }, [messages, guardsList]);

    // Computed Thread List for Sidebar
    const threadList = useMemo(() => {
        const list = [
            { id: 'general', name: 'Canal General (Todos)', type: 'system', unread: 0, lastMsg: threads['general'][0], status: 'active' },
            { id: 'admin', name: 'Administración', type: 'admin', unread: threads['admin'].filter(m => !m.read && m.from !== 'control').length, lastMsg: threads['admin'][0], status: 'active' }
        ];

        const guardThreads = guardsList
            .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(g => {
                const msgs = threads[g.id] || [];
                const unread = msgs.filter(m => !m.read && m.from === 'guard').length;
                return {
                    id: g.id,
                    name: g.name,
                    type: 'guard',
                    unread,
                    lastMsg: msgs[0], // Already sorted desc in hook
                    status: g.status
                };
            })
            // Sort by: Has Unread > Last Msg Time > Name
            .sort((a, b) => {
                if (a.unread !== b.unread) return b.unread - a.unread;
                const timeA = a.lastMsg?.timestamp || 0;
                const timeB = b.lastMsg?.timestamp || 0;
                if (timeA !== timeB) return timeB - timeA;
                return a.name.localeCompare(b.name);
            });

        return [...list, ...guardThreads];
    }, [guardsList, threads, searchTerm]);


    // Helper: Mark thread as read when opening
    useEffect(() => {
        if (selectedThreadId === 'general') return; // Don't auto-read 'sent' broadcast messages usually

        const unreadIds = threads[selectedThreadId]?.filter(m => !m.read && m.from !== 'control').map(m => m.id) || [];
        if (unreadIds.length > 0) {
            // Optional: Debounce this or requires manual click? 
            // Better UX: Auto mark as read when viewing thread
            unreadIds.forEach(id => markAsRead(id));
        }
    }, [selectedThreadId, threads]);


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        let target: any = selectedThreadId;
        if (selectedThreadId === 'general') target = 'guards';

        try {
            await sendMessage({
                title: selectedThreadId === 'general' ? 'Instrucción General' : 'Mensaje Directo',
                message: replyText,
                from: 'control',
                to: target,
                priority
            });
            setReplyText('');
            setPriority('normal');
        } catch (error) {
            alert('Error al enviar mensaje');
        }
    };

    const activeThreadMessages = threads[selectedThreadId] || []; // already sorted desc
    // We want to display asc (oldest top) for chat view usually, or desc if we stick to 'feed' style. 
    // Chat standard is bottom-up (newest at bottom).
    const displayMessages = [...activeThreadMessages].reverse();

    return (
        <div className="h-[calc(100vh-6rem)] grid grid-cols-12 gap-6 max-w-7xl mx-auto overflow-hidden">

            {/* LEFT SIDEBAR: Threads List */}
            <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={20} />
                        Comunicaciones
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar guardia..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {threadList.map((thread) => (
                        <button
                            key={thread.id}
                            onClick={() => setSelectedThreadId(thread.id)}
                            className={clsx(
                                "w-full text-left p-3 rounded-xl transition-all relative group",
                                selectedThreadId === thread.id
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                    : "hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={clsx("font-bold text-sm truncate pr-4", selectedThreadId === thread.id ? "text-white" : "text-slate-800")}>
                                    {thread.name}
                                </span>
                                {thread.lastMsg && (
                                    <span className={clsx("text-[10px]", selectedThreadId === thread.id ? "text-blue-200" : "text-slate-400")}>
                                        {new Date(thread.lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-end">
                                <p className={clsx("text-xs truncate w-3/4 opacity-90", selectedThreadId === thread.id ? "text-blue-100" : "text-slate-500")}>
                                    {thread.lastMsg ? (
                                        <>
                                            <span className="font-bold">{thread.lastMsg.from === 'control' ? 'Tú: ' : ''}</span>
                                            {thread.lastMsg.message}
                                        </>
                                    ) : (
                                        <span className="italic opacity-50">Sin mensajes</span>
                                    )}
                                </p>
                                {thread.unread > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm animate-pulse">
                                        {thread.unread}
                                    </span>
                                )}
                            </div>

                            {/* Online Status Dot */}
                            {thread.type === 'guard' && (
                                <div className={clsx(
                                    "absolute top-3 right-3 w-2 h-2 rounded-full border border-white",
                                    thread.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                                )}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT MAIN: Chat Area */}
            <div className="col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm",
                            selectedThreadId === 'general' ? "bg-blue-600" :
                                selectedThreadId === 'admin' ? "bg-purple-600" : "bg-emerald-600"
                        )}>
                            {selectedThreadId === 'general' ? <Users size={20} /> :
                                selectedThreadId === 'admin' ? <MessageSquare size={20} /> :
                                    <User size={20} />}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">
                                {threadList.find(t => t.id === selectedThreadId)?.name || 'Chat'}
                            </h2>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                {selectedThreadId === 'general' ? 'Canal de difusión masiva' : 'Canal privado y seguro'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    {displayMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <MessageSquare size={48} className="mb-4 text-slate-300" />
                            <p>No hay mensajes en esta conversación</p>
                        </div>
                    ) : (
                        displayMessages.map((msg) => {
                            const isMe = msg.from === 'control';
                            return (
                                <div key={msg.id} className={clsx("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div className={clsx(
                                        "p-4 rounded-2xl shadow-sm text-sm relative group transition-all",
                                        isMe
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                                    )}>
                                        {msg.priority === 'high' && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold mb-1 opacity-90 uppercase tracking-wider text-amber-300">
                                                <AlertTriangle size={10} /> Prioritario
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap">{msg.message}</p>

                                        <div className={clsx("flex items-center gap-1 text-[10px] mt-2 opacity-70", isMe ? "justify-end text-blue-100" : "text-slate-400")}>
                                            <Clock size={10} />
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && (
                                                <span className="flex items-center gap-0.5 ml-1">
                                                    {msg.read ? <CheckCircle size={10} /> : <CheckCircle size={10} className="opacity-50" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!isMe && msg.sender_id && selectedThreadId === 'general' && (
                                        <span className="text-[10px] text-slate-400 ml-2 mt-1">
                                            Enviado por: {guardsList.find(g => g.id === msg.sender_id)?.name || 'Desconocido'}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-2 w-max">
                        <button
                            type="button"
                            onClick={() => setPriority('normal')}
                            className={clsx("px-3 py-1 text-xs font-medium rounded-lg transition-all", priority === 'normal' ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}
                        >
                            Normal
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriority('high')}
                            className={clsx("px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1", priority === 'high' ? "bg-red-500 text-white shadow-sm" : "text-slate-500 hover:text-red-500")}
                        >
                            <AlertTriangle size={10} />
                            Prioritario
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={selectedThreadId === 'general' ? "Escribir mensaje global a todos los guardias..." : "Escribir mensaje..."}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center aspect-square"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ControlCommunications;
