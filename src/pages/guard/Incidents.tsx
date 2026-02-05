
import { useState } from 'react';
import { AlertTriangle, Camera, Mic, Send, Video } from 'lucide-react';

const Incidents = () => {
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-500">
                <AlertTriangle />
                Reportar Incidente
            </h2>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">

                {/* Priority Selector */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Nivel de Prioridad</label>
                    <div className="flex gap-2">
                        {[
                            { id: 'low', label: 'Baja', color: 'bg-blue-500' },
                            { id: 'medium', label: 'Media', color: 'bg-amber-500' },
                            { id: 'high', label: 'Alta', color: 'bg-red-500' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPriority(p.id as any)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${priority === p.id
                                        ? `${p.color} text-white shadow-lg scale-105`
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Descripción del Evento</label>
                    <textarea
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="Describa qué sucedió, personas involucradas, daños, etc..."
                    />
                </div>

                {/* Multimedia Evidence */}
                <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px]">FOTO</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors">
                        <Video size={24} className="mb-1" />
                        <span className="text-[10px]">VIDEO</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors">
                        <Mic size={24} className="mb-1" />
                        <span className="text-[10px]">AUDIO</span>
                    </button>
                </div>

                {/* Submit */}
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 mt-4">
                    <Send size={20} />
                    Enviar Reporte Inmediato
                </button>
            </div>
        </div>
    );
};

export default Incidents;
