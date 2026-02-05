import { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMessages } from '../../lib/useMessages';
import { supabase } from '../../lib/supabase';

const ControlCommunications = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<'normal' | 'high'>('normal');
    const [target, setTarget] = useState<'guards' | 'admin' | string>('guards');
    const [guardsList, setGuardsList] = useState<{ id: string, name: string }[]>([]);

    const { sendMessage, messages } = useMessages();
    const [searchParams] = useSearchParams();

    // Fetch All Active Guards for Individual selection
    useEffect(() => {
        const fetchGuards = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .eq('role', 'guard')
                .eq('status', 'active');

            if (data) {
                setGuardsList(data.map(g => ({
                    id: g.id,
                    name: `${g.first_name} ${g.last_name || ''}`
                })));
            }
        };
        fetchGuards();
    }, []);

    // Auto-select target if replying
    useEffect(() => {
        const replyTo = searchParams.get('replyTo');
        if (replyTo === 'admin') setTarget('admin');
        if (replyTo && replyTo !== 'admin' && replyTo !== 'control') setTarget(replyTo);
    }, [searchParams]);

    // Filter history
    const history = messages.filter(m => m.from === 'control' || m.to === 'control' || m.to === 'all');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        sendMessage({
            title,
            message,
            from: 'control',
            to: target as any,
            priority
        });

        const targetName = target === 'guards' ? 'todos los guardias' :
            target === 'admin' ? 'la administración' :
                guardsList.find(g => g.id === target)?.name || 'el guardia';

        setTitle('');
        setMessage('');
        alert(`Comunicado enviado a ${targetName}`);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="text-blue-600" />
                    Central de Despacho e Instrucciones
                </h1>
                <p className="text-slate-500">Envíe órdenes directas y alertas al personal de guardia.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Compose Form */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Nueva Instrucción</h2>

                    <form onSubmit={handleSend} className="space-y-6">

                        {/* Recipient Selection */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-500">Destinatario de la Orden</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTarget('guards')}
                                    className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${target === 'guards' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-400'}`}
                                >
                                    <Users size={20} />
                                    <span className="font-bold text-xs">Todos los Guardias</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTarget('admin')}
                                    className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${target === 'admin' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-400'}`}
                                >
                                    <MessageSquare size={20} />
                                    <span className="font-bold text-xs">Administración</span>
                                </button>

                                <div className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${target !== 'guards' && target !== 'admin' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-400'}`}>
                                    <User size={20} />
                                    <select
                                        value={target !== 'guards' && target !== 'admin' ? target : ''}
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="bg-transparent font-bold text-xs focus:outline-none w-full text-center"
                                    >
                                        <option value="" disabled className="text-slate-800">Seleccionar Guardia...</option>
                                        {guardsList.map(g => (
                                            <option key={g.id} value={g.id} className="text-slate-800">{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Priority Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setPriority('normal')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${priority === 'normal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
                            >
                                Normal
                            </button>
                            <button
                                type="button"
                                onClick={() => setPriority('high')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${priority === 'high' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-red-500'}`}
                            >
                                <AlertTriangle size={14} />
                                Prioritaria
                            </button>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Título</label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Revisar Portón Norte"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Detalle de la Orden</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Instrucciones precisas para el personal..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button type="submit" className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${priority === 'high' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}>
                            <Send size={20} />
                            Enviar Instrucción
                        </button>
                    </form>
                </div>

                {/* Live Feed History */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2 flex justify-between items-center">
                        <span>Historial de Despacho</span>
                        <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-slate-50 rounded border border-slate-200">Últimas 24h</span>
                    </h2>

                    <div className="space-y-4 flex-1 overflow-auto pr-2">
                        {history.map((alert) => (
                            <div key={alert.id} className={`border-l-4 rounded-r-xl p-4 transition-all hover:bg-slate-50 ${alert.from === 'control' ? (alert.priority === 'high' ? 'border-blue-600 bg-blue-50/20' : 'border-blue-400 bg-slate-50/50') : 'border-amber-400 bg-amber-50/30'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${alert.from === 'control' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {alert.from === 'control' ? 'ENVIADO' : `RECIBIDO: ${alert.from.toUpperCase()}`}
                                        </span>
                                        {alert.priority === 'high' && <AlertTriangle size={14} className="text-red-500" />}
                                        <h3 className={`font-bold text-sm ${alert.priority === 'high' ? 'text-red-600' : 'text-slate-800'}`}>{alert.title}</h3>
                                    </div>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{alert.message}</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 flex items-center gap-1">
                                        {alert.to === 'guards' ? (
                                            <><Users size={12} /> Para Guardias</>
                                        ) : alert.to === 'admin' ? (
                                            <><MessageSquare size={12} /> Para Admin</>
                                        ) : (
                                            <><User size={12} /> Para: {guardsList.find(g => g.id === alert.to)?.name || alert.to}</>
                                        )}
                                    </span>
                                    <span className={`flex items-center gap-1 ${alert.read ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        <CheckCircle size={12} />
                                        {alert.from === 'control' ? (alert.read ? 'Confirmado' : 'Enviado') : 'Leído'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlCommunications;
