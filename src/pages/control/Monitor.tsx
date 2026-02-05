import { Activity, AlertTriangle, Radio, Users, MessageSquare, MapPin } from 'lucide-react';
import { Map as PigeonMap, Overlay } from 'pigeon-maps'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages, type Message } from '../../lib/useMessages';
import { useLocationTracker } from '../../lib/useLocationTracker';

const mockAlerts = [
    { id: 1, type: 'CRITICAL', msg: 'Botón de Pánico activado - Inst. Norte', time: 'Hace 2 min' },
    { id: 2, type: 'WARNING', msg: 'Ronda atrasada - Bodega Central', time: 'Hace 15 min' },
    { id: 3, type: 'INFO', msg: 'Guardia inició turno - Acceso Sur', time: 'Hace 30 min' },
];

const Monitor = () => {
    const navigate = useNavigate();
    const { messages } = useMessages();
    const { allLocations } = useLocationTracker();

    // Convertimos a array (ya vienen filtrados por el Hook useLocationTracker con la BD Real)
    const guardsOnMap = Object.values(allLocations);

    const [mapState, setMapState] = useState<{ center: [number, number], zoom: number }>({
        center: [-33.4489, -70.6483],
        zoom: 11
    });

    const incomingMessages = messages.filter(m => m.to === 'control' || m.to === 'all');

    // Toast State
    const [toast, setToast] = useState<{ show: boolean, msg: Message | null }>({ show: false, msg: null });
    const [lastSeenId, setLastSeenId] = useState<number>(() => {
        const msgs = JSON.parse(localStorage.getItem('cia_security_communications') || '[]');
        return msgs.length > 0 ? msgs[0].id : 0;
    });

    useEffect(() => {
        if (incomingMessages.length > 0) {
            const latest = incomingMessages[0];
            if (latest.id > lastSeenId) {
                setToast({ show: true, msg: latest });
                setLastSeenId(latest.id);
                const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [incomingMessages, lastSeenId]);

    // Función para ir a la vista general automáticamente
    const handleGeneralView = () => {
        if (guardsOnMap.length === 0) {
            setMapState({ center: [-33.4489, -70.6483], zoom: 11 });
            return;
        }

        // Calcular el centro promedio de todos los guardias
        const avgLat = guardsOnMap.reduce((sum, g) => sum + g.lat, 0) / guardsOnMap.length;
        const avgLng = guardsOnMap.reduce((sum, g) => sum + g.lng, 0) / guardsOnMap.length;

        // Ajustar zoom dinámicamente si hay más de uno (simplificado)
        const zoom = guardsOnMap.length > 1 ? 12 : 15;

        setMapState({ center: [avgLat, avgLng], zoom });
    };

    const handleMessageClick = (msg: Message) => {
        navigate(`/control/communications?replyTo=${msg.from}`);
    };

    return (
        <div className="p-6 space-y-6 h-full flex flex-col relative">
            {/* Toast Notification */}
            {toast.show && toast.msg && (
                <div
                    onClick={() => handleMessageClick(toast.msg!)}
                    className="fixed bottom-8 right-8 bg-white border-l-4 border-amber-600 shadow-2xl rounded-lg p-4 max-w-sm animate-bounce-in z-50 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-1">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Mensaje de {toast.msg.from.toUpperCase()}</h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{toast.msg.message}</p>
                        <span className="text-[10px] text-blue-600 font-bold mt-2 block">PINCHA PARA RESPONDER →</span>
                    </div>
                </div>
            )}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Activity className="text-emerald-600" />
                        Control de Operaciones
                    </h1>
                    <p className="text-slate-500">Monitoreo en tiempo real de unidades y dispositivos</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleGeneralView}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all font-bold text-sm"
                    >
                        <Users size={18} />
                        Vista General
                    </button>
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {guardsOnMap.length} en Turno
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Map Column (2/3 width) */}
                <div className="lg:col-span-2 bg-slate-100 border border-slate-200 rounded-2xl p-0 relative overflow-hidden group shadow-sm min-h-[500px]">
                    <PigeonMap
                        center={mapState.center}
                        zoom={mapState.zoom}
                        onBoundsChanged={({ center, zoom }) => setMapState({ center, zoom })}
                        metaWheelZoom={true}
                    >
                        {guardsOnMap.map((guard) => (
                            <Overlay
                                key={guard.id}
                                anchor={[guard.lat, guard.lng]}
                                offset={[0, 0]}
                            >
                                <div className="relative group/marker">
                                    {/* Name Tag */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity flex flex-col items-center z-50">
                                        <span className="font-bold">{guard.name}</span>
                                        <span className="text-[8px] text-slate-400">ID: {guard.id}</span>
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                    </div>

                                    {/* Indicator */}
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full animate-ping absolute -translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                        <span className="text-[8px] text-white font-bold">{guard.id.slice(-3)}</span>
                                    </div>
                                </div>
                            </Overlay>
                        ))}
                    </PigeonMap>

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-emerald-600 border border-emerald-500/30 flex items-center gap-2 shadow-sm z-10 pointer-events-none">
                        <Radio size={12} className="animate-pulse" /> LIVE GPS FEED
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6 flex flex-col min-h-0">

                    {/* Alerts/Messages Panel */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1 overflow-hidden flex flex-col shadow-sm">
                        <h3 className="text-slate-800 font-bold mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={18} className="text-blue-500" />
                                Mensajes Directos
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">Recientes</span>
                        </h3>
                        {/* (History mapping same as before...) */}
                        <div className="space-y-3 mb-6">
                            {incomingMessages.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4 italic">Sin mensajes nuevos</p>
                            ) : (
                                incomingMessages.slice(0, 2).map(msg => (
                                    <div
                                        key={msg.id}
                                        onClick={() => handleMessageClick(msg)}
                                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 rounded">
                                                {msg.from}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium line-clamp-1 group-hover:text-blue-700">{msg.title}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            Alertas de Sistema
                        </h3>
                        <div className="space-y-3 overflow-y-auto pr-2">
                            {mockAlerts.map(alert => (
                                <div key={alert.id} className={`p-3 rounded-lg border flex flex-col gap-1 ${alert.type === 'CRITICAL' ? 'bg-red-50 border-red-100' :
                                    alert.type === 'WARNING' ? 'bg-amber-50 border-amber-100' :
                                        'bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${alert.type === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            alert.type === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>{alert.type}</span>
                                        <span className="text-xs text-slate-400">{alert.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium leading-tight">{alert.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Guards Panel */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1 overflow-hidden flex flex-col shadow-sm">
                        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <Users size={18} className="text-blue-600" />
                            Personal en Turno
                        </h3>
                        <div className="space-y-3 overflow-y-auto">
                            {guardsOnMap.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No hay personal autorizado reportando GPS</p>
                            ) : (
                                guardsOnMap.map(guard => (
                                    <div key={guard.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center font-bold text-xs border border-blue-800">
                                                {guard.name.charAt(0)}{guard.name.split(' ')[1]?.charAt(0) || ''}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{guard.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                    GPS Activo - {guard.id}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setMapState({ center: [guard.lat, guard.lng], zoom: 16 })}
                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                            title="Enfocar en mapa"
                                        >
                                            <MapPin size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Monitor;
