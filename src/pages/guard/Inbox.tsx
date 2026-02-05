import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle } from 'lucide-react';
import { useMessages, type Message } from '../../lib/useMessages';
import { supabase } from '../../lib/supabase';

const Inbox = () => {
    const { messages } = useMessages();
    const [userId, setUserId] = useState<string | null>(null);

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

                            {!msg.read && (
                                <button className="mt-4 w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                    <CheckCircle size={14} />
                                    Marcar como Leído
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Inbox;
