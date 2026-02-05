
import { AlertTriangle, Bell, Clock, Info, User } from 'lucide-react';

interface Message {
    id: number;
    from: 'Admin' | 'Control';
    title: string;
    body: string;
    timestamp: string;
    priority: 'normal' | 'high';
    read: boolean;
}

const mockMessages: Message[] = [
    { id: 1, from: 'Control', title: 'Atención: Vehículo Sospechoso', body: 'Camioneta blanca patente AB-1234 rondando perímetro norte.', timestamp: 'Hace 5 min', priority: 'high', read: false },
    { id: 2, from: 'Admin', title: 'Recordatorio de Turno', body: 'Recuerden sincronizar sus dispositivos antes de las 22:00.', timestamp: 'Hace 2 horas', priority: 'normal', read: true },
    { id: 3, from: 'Control', title: 'Verificación de Perímetro', body: 'Favor confirmar estado de portón 3.', timestamp: 'Hace 45 min', priority: 'normal', read: true },
];

const Inbox = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-4 pb-20">
            <div className="flex items-center justify-between mb-4 px-2">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="text-blue-600" />
                    Mis Mensajes
                </h1>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{mockMessages.filter(m => !m.read).length} nuevos</span>
            </div>

            <div className="space-y-4">
                {mockMessages.map((msg) => (
                    <div key={msg.id} className={`relative bg-white border rounded-2xl p-5 shadow-sm transition-all ${!msg.read ? 'border-l-4 border-l-blue-500 shadow-md' : 'border-slate-200 opacity-90'}`}>

                        {/* Priority Badge */}
                        {msg.priority === 'high' && (
                            <div className="absolute -top-3 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                <AlertTriangle size={10} />
                                PRIORITARIO
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${msg.from === 'Admin' ? 'bg-slate-800' : 'bg-blue-600'}`}>
                                    {msg.from[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{msg.from === 'Admin' ? 'Administración' : 'Central Control'}</h3>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Clock size={10} /> {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h4 className={`font-bold text-base mb-1 ${msg.read ? 'text-slate-700' : 'text-slate-900'}`}>{msg.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{msg.body}</p>

                        {!msg.read && (
                            <button className="mt-4 w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors">
                                Marcar como Leído
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inbox;
