
import { Users, Shield, MapPin, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import { useMessages, type Message } from '../../lib/useMessages';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const stats = [
    {
        label: "Guardias Activos",
        value: "12",
        subtext: "Personal en turno actualmente",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        label: "Incidentes (24h)",
        value: "3",
        subtext: "+20% desde ayer",
        icon: Shield,
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    },
    {
        label: "Rondas Completadas",
        value: "95%",
        subtext: "Del total programado para hoy",
        icon: MapPin,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        label: "Accesos Registrados",
        value: "156",
        subtext: "En todas las instalaciones hoy",
        icon: Clock,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { messages } = useMessages();
    const incomingMessages = messages.filter(m => m.to === 'admin' || m.to === 'all');

    // Toast State
    const [toast, setToast] = useState<{ show: boolean, msg: Message | null }>({ show: false, msg: null });
    const [lastSeenId, setLastSeenId] = useState<number>(0);

    useEffect(() => {
        if (incomingMessages.length > 0) {
            const latest = incomingMessages[0];

            if (lastSeenId === 0) {
                setLastSeenId(latest.id);
                return;
            }

            if (latest.id > lastSeenId) {
                setToast({ show: true, msg: latest });
                setLastSeenId(latest.id);
                const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [incomingMessages, lastSeenId]);

    return (
        <div className="space-y-8 relative">
            {/* Toast Notification */}
            {toast.show && toast.msg && (
                <div className="fixed bottom-8 right-8 bg-white border-l-4 border-blue-600 shadow-2xl rounded-lg p-4 max-w-sm animate-bounce-in z-50 flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Nuevo Mensaje Recibido</h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{toast.msg.message}</p>
                        <span className="text-xs text-slate-400 mt-2 block">De: {toast.msg.from.toUpperCase()}</span>
                    </div>
                    <button onClick={() => setToast({ show: false, msg: null })} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
            )}

            {/* Incoming Messages from Control (Now at Top) */}
            {incomingMessages.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in mb-8">
                    <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="text-blue-500" size={18} />
                            Mensajes Recientes
                        </h3>
                        <span className="text-xs text-slate-400">Mostrando últimos 2</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {incomingMessages.slice(0, 2).map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => navigate('/admin/communications')}
                                className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer group ${msg.priority === 'high' ? 'bg-red-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        {msg.priority === 'high' && <AlertTriangle size={14} className="text-red-500" />}
                                        <span className="text-[10px] font-bold uppercase text-slate-500 border border-slate-200 px-1.5 rounded">
                                            {msg.from.toUpperCase()}
                                        </span>
                                        <h4 className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{msg.title}</h4>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 pl-1 line-clamp-1">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-xs text-slate-500">{stat.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Access Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Accesos Recientes</h3>
                        <p className="text-sm text-slate-500">Últimos registros de acceso en todas las instalaciones.</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-200">
                        Ver Historial Completo →
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Hora Entrada</th>
                                <th className="px-6 py-4">Persona</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Guardia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { time: "7:05:25 p.m.", name: "Lalin Cabeza", type: "Entrada", status: "Completo", guard: "Guardia Anónimo" },
                                { time: "6:58:10 p.m.", name: "Juan Pérez", type: "Salida", status: "Completo", guard: "Roberto Gómez" },
                                { time: "6:45:00 p.m.", name: "Camión Ford F-150", type: "Entrada", status: "Pendiente", guard: "Roberto Gómez" },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700">{row.time}</td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {row.name.charAt(0)}
                                        </div>
                                        {row.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'Entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Completo' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{row.guard}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
