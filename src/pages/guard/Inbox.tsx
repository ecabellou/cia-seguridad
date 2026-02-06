import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle } from 'lucide-react';
import { useMessages } from '../../lib/useMessages';
import { supabase } from '../../lib/supabase';

const Inbox = () => {
    const { messages, markAsRead, sendMessage } = useMessages();
    const [userId, setUserId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<any | null>(null); // Message type inference issue workaround
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    // Filter messages for this specific guard
    const myMessages = messages.filter(m =>
        m.to === 'guards' ||
        m.to === 'all' ||
        m.to === userId
    );

    const formatTimestamp = (ts: number) => {
        const diff = Date.now() - ts;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours} horas`;
        return new Date(ts).toLocaleDateString();
    };

    const handleSendReply = async () => {
        if (!replyingTo || !replyText.trim()) return;

        setSending(true);
        try {
            // Identificar el destino correcto basado en quién envió el mensaje original
            // Si viene de 'admin', respondemos a 'admin'. Si viene de 'control', respondemos a 'control'.
            const targetRole = replyingTo.from === 'admin' ? 'admin' : 'control';

            await sendMessage({
                title: `Re: ${replyingTo.title}`,
                message: replyText,
                from: 'guard',
                to: targetRole,
                priority: 'normal'
            });

            setReplyingTo(null);
            setReplyText("");
            // Opcional: Marcar como leído automáticamente al responder
            if (!replyingTo.read) {
                markAsRead(replyingTo.id);
            }
        } catch (error) {
            console.error("Error enviando respuesta:", error);
            alert("No se pudo enviar la respuesta");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4 pb-20">
            <div className="flex items-center justify-between mb-4 px-2">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="text-blue-600" />
                    Mis Mensajes
                </h1>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{myMessages.filter(m => !m.read).length} nuevos</span>
            </div>

            <div className="space-y-4">
                {myMessages.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 italic text-slate-400">
                        No tienes mensajes nuevos en tu bandeja.
                    </div>
                ) : (
                    myMessages.map((msg) => (
                        <div key={msg.id} className={`relative bg-white border rounded-2xl p-5 shadow-sm transition-all ${!msg.read ? 'border-l-4 border-l-blue-500 shadow-md' : 'border-slate-200 opacity-90'}`}>

                            {/* Priority Badge */}
                            {msg.priority === 'high' && (
                                <div className="absolute -top-3 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse z-10">
                                    <AlertTriangle size={10} />
                                    PRIORITARIO
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${msg.from === 'admin' ? 'bg-slate-800' : 'bg-blue-600'}`}>
                                        {msg.from[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{msg.from === 'admin' ? 'Administración' : 'Central Control'}</h3>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                            <Clock size={10} /> {formatTimestamp(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h4 className={`font-bold text-base mb-1 ${msg.read ? 'text-slate-700' : 'text-slate-900'}`}>{msg.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{msg.message}</p>

                            <div className="flex gap-2 mt-4">
                                {!msg.read && (
                                    <button
                                        onClick={() => markAsRead(msg.id)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={14} />
                                        Leído
                                    </button>
                                )}
                                <button
                                    onClick={() => setReplyingTo(msg)}
                                    className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    Responder
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800">Responder Mensaje</h3>
                                <p className="text-xs text-slate-500">Para: {replyingTo.from === 'admin' ? 'Administración' : 'Central Control'}</p>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="p-2 text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Cerrar</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4 border border-slate-100 italic">
                                " {replyingTo.message.substring(0, 100)}{replyingTo.message.length > 100 ? '...' : ''} "
                            </div>

                            <textarea
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-800"
                            ></textarea>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 sm:rounded-b-2xl flex gap-3">
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="flex-1 py-3 text-slate-600 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={!replyText.trim() || sending}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {sending ? 'Enviando...' : 'Enviar Respuesta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inbox;
