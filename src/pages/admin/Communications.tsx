
import { useState } from 'react';
import { Send, Users, Radio, MessageSquare, Clock } from 'lucide-react';

import { useMessages } from '../../lib/useMessages';

const Communications = () => {
    const { messages, sendMessage } = useMessages();
    const [target, setTarget] = useState<'all' | 'guards' | 'control'>('all');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    // History: messages sent BY admin OR sent TO admin/all
    const history = messages
        .filter(m => m.from === 'admin' || m.to === 'admin' || m.to === 'all')
        .slice(0, 10);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendMessage({
                title,
                message,
                from: 'admin',
                to: target,
                priority: 'normal'
            });
            setTitle('');
            setMessage('');
            alert('✅ Mensaje enviado exitosamente');
        } catch (error) {
            alert('❌ Error al enviar el mensaje');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare />
                Centro de Comunicaciones
            </h1>
            <p className="text-slate-500">Envíe anuncios y alertas a todo el personal operativo.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Compose Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Redactar Mensaje</h2>

                        <form onSubmit={handleSend} className="space-y-6">

                            {/* Target Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-3">Destinatarios</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${target === 'all' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <Radio className={target === 'all' ? 'text-blue-600' : 'text-slate-400'} />
                                        <span className="font-bold text-sm">Todos</span>
                                        <input type="radio" name="target" className="hidden" onClick={() => setTarget('all')} />
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${target === 'guards' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <Users className={target === 'guards' ? 'text-emerald-500' : 'text-slate-400'} />
                                        <span className="font-bold text-sm">Guardias</span>
                                        <input type="radio" name="target" className="hidden" onClick={() => setTarget('guards')} />
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${target === 'control' ? 'bg-amber-50 border-amber-500 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <Radio className={target === 'control' ? 'text-amber-500' : 'text-slate-400'} />
                                        <span className="font-bold text-sm">Central Control</span>
                                        <input type="radio" name="target" className="hidden" onClick={() => setTarget('control')} />
                                    </label>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Asunto</label>
                                    <input
                                        required
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Cambio de turno urgente"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Mensaje</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Escriba su comunicado aquí..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                <Send size={20} />
                                Enviar Comunicado
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Sidebar */}
                <div className="space-y-4 h-fit sticky top-6">
                    <h2 className="text-lg font-bold text-slate-800">Historial (Últimos 10)</h2>
                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                        {history.length === 0 && (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Clock size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No hay mensajes recientes</p>
                            </div>
                        )}
                        {history.map((alert) => (
                            <div key={alert.id} className={`bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all group shadow-sm ${alert.from === 'control' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-blue-400'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${alert.from === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {alert.from === 'admin' ? 'Enviado' : 'Recibido'}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                            A: {alert.to.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors text-sm">{alert.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2">{alert.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Communications;
