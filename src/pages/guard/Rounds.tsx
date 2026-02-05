
import { useState } from 'react';
import { MapPin, Camera, CheckSquare, XCircle, Navigation, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const mockCheckpoints = [
    { id: 1, name: 'Acceso Principal', status: 'completed' },
    { id: 2, name: 'Bodega de Materiales', status: 'pending' },
    { id: 3, name: 'Perímetro Norte', status: 'pending' },
    { id: 4, name: 'Estacionamiento Gerencia', status: 'pending' },
];

const Rounds = () => {
    const [activeCheckpoint, setActiveCheckpoint] = useState<number | null>(null);

    const handleCheckpointClick = (id: number) => {
        setActiveCheckpoint(id);
    };

    const closeChecklist = () => {
        setActiveCheckpoint(null);
    };

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold">Ronda Nocturna</h2>
                    <p className="text-sm text-slate-400">01:00 AM - 02:00 AM</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                    En Progreso
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-48 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-70.6483,33.4489,14,0/600x400@2x?access_token=placeholder')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                <div className="z-10 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700">
                    <Navigation size={16} className="text-blue-400" />
                    <span className="text-xs font-medium">Mapa Operativo</span>
                </div>
            </div>

            {/* Checkpoints List */}
            <div className="space-y-3">
                {mockCheckpoints.map((cp) => (
                    <button
                        key={cp.id}
                        onClick={() => handleCheckpointClick(cp.id)}
                        className={clsx(
                            "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                            cp.status === 'completed'
                                ? "bg-slate-900 border-slate-800 opacity-60"
                                : "bg-slate-800/80 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center border",
                                cp.status === 'completed'
                                    ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-500"
                                    : "bg-blue-900/20 border-blue-500/30 text-blue-400"
                            )}>
                                {cp.status === 'completed' ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
                            </div>
                            <div className="text-left">
                                <p className={clsx("font-medium", cp.status === 'completed' ? "text-slate-500" : "text-slate-200")}>
                                    {cp.name}
                                </p>
                                <p className="text-xs text-slate-500">{cp.status === 'completed' ? 'Verificado 01:15 AM' : 'Pendiente'}</p>
                            </div>
                        </div>
                        {cp.status === 'pending' && <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Verificar</div>}
                    </button>
                ))}
            </div>

            {/* Checklist Modal */}
            {activeCheckpoint && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <CheckSquare className="text-blue-400" />
                                    Checklist: {mockCheckpoints.find(c => c.id === activeCheckpoint)?.name}
                                </h3>
                                <button onClick={closeChecklist} className="text-slate-400 hover:text-white">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Checklist Items */}
                            <div className="space-y-4">
                                {[
                                    { label: "Portón / Puertas", icon: "🚪" },
                                    { label: "Ventanas / Vidrios", icon: "🪟" },
                                    { label: "Candados / Cerraduras", icon: "🔒" },
                                    { label: "Iluminación", icon: "💡" },
                                    { label: "Conexiones de Agua", icon: "💧" },
                                    { label: "Energía Eléctrica", icon: "⚡" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="text-sm font-medium text-slate-300">{item.label}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                                                ✓
                                            </button>
                                            <button className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Photo */}
                            <button className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                                <Camera size={24} />
                                <span className="font-medium">Tomar Foto Obligatoria</span>
                            </button>

                            {/* Observations */}
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                placeholder="Observaciones adicionales..."
                                rows={2}
                            ></textarea>

                            <button onClick={closeChecklist} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                                Confirmar Punto de Control
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rounds;
