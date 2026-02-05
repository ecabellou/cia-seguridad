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
    const { messages, sendMessage } = useMessages();
    const { allLocations } = useLocationTracker();

    // Convertimos a array (ya vienen filtrados por el Hook useLocationTracker con la BD Real)
    const guardsOnMap = Object.values(allLocations);

    const [mapState, setMapState] = useState<{ center: [number, number], zoom: number }>({
        center: [-33.4489, -70.6483],
        zoom: 11
    });

    const incomingMessages = messages.filter(m => m.to === 'control' || m.to === 'all');

    // Alertas de GPS perdido
    const [alerts, setAlerts] = useState(mockAlerts);
    const [lostSignalGuards, setLostSignalGuards] = useState<Set<string>>(new Set());

    // Monitoreo de señal perdida
    useEffect(() => {
        const checkSignals = () => {
            const now = Date.now();
            const threshold = 20000; // 20 segundos sin señal se considera "Alerta"

            guardsOnMap.forEach(guard => {
                const timeSinceLastSeen = now - guard.lastSeen;

                if (timeSinceLastSeen > threshold && !lostSignalGuards.has(guard.id)) {
                    // DISPARAR ALERTA
                    const alertMsg = `⚠️ ALERTA: Perdida de señal GPS - ${guard.name} (${guard.id})`;

                    // 1. Agregar a la lista de alertas visuales
                    const newAlert = {
                        id: Date.now(),
                        type: 'CRITICAL',
                        msg: alertMsg,
                        time: 'Justo ahora'
                    };
                    setAlerts(prev => [newAlert, ...prev]);

                    // 2. Enviar mensaje formal al sistema de comunicaciones
                    sendMessage({
                        title: 'PÉRDIDA DE SEÑAL GPS',
                        message: `El sistema detectó que el dispositivo de ${guard.name} dejó de reportar ubicación hace más de 20 segundos. Se requiere contacto preventivo.`,
                        from: 'control',
                        to: 'all',
                        priority: 'high'
                    });

                    // 3. Registrar como "ya alertado" para no duplicar
                    setLostSignalGuards(prev => new Set(prev).add(guard.id));
                }

                // Si la señal vuelve, lo quitamos de la lista de "perdidos"
                if (timeSinceLastSeen < threshold && lostSignalGuards.has(guard.id)) {
                    setLostSignalGuards(prev => {
                        const next = new Set(prev);
                        next.delete(guard.id);
                        return next;
                    });
                }
            });
        };

        const interval = setInterval(checkSignals, 5000);
        return () => clearInterval(interval);
    }, [guardsOnMap, lostSignalGuards, sendMessage]);

    // Toast State
    const [toast, setToast] = useState<{ show: boolean, msg: Message | null }>({ show: false, msg: null });
    const [lastSeenId, setLastSeenId] = useState<number>(0);

    useEffect(() => {
        if (incomingMessages.length > 0) {
            const latest = incomingMessages[0];

            // Set initial state without toast to avoid notification spam on load
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
                        {guardsOnMap.map((guard) => {
                            const isLost = (Date.now() - guard.lastSeen) > 20000;
                            return (
                                <Overlay
                                    key={guard.id}
                                    anchor={[guard.lat, guard.lng]}
                                    offset={[0, 0]}
                                >
                                    <div className="relative group/marker">
                                        {/* Name Tag */}
                                        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 ${isLost ? 'bg-red-600' : 'bg-slate-900'} text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity flex flex-col items-center z-50`}>
                                            <span className="font-bold">{guard.name}</span>
                                            <span className="text-[8px] text-slate-200">{isLost ? '¡SEÑAL PERDIDA!' : `ID: ${guard.id.slice(-6)}`}</span>
                                            <div className={`absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 ${isLost ? 'bg-red-600' : 'bg-slate-900'} rotate-45`} />
                                        </div>

                                        {/* Indicator */}
                                        <div className={`w-10 h-10 ${isLost ? 'bg-red-500/40' : 'bg-blue-500/20'} rounded-full animate-ping absolute -translate-x-1/2 -translate-y-1/2`} />
                                        <div className={`w-5 h-5 ${isLost ? 'bg-red-600 animate-pulse' : 'bg-blue-600'} rounded-full border-2 border-white shadow-lg relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-bold text-[8px] text-white`}>
                                            {isLost ? '!' : guard.id.slice(-3)}
                                        </div>
                                    </div>
                                </Overlay>
                            );
                        })}
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
                        {/* Historial de mensajes */}
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
                            {alerts.map(alert => (
                                <div key={alert.id} className={`p-3 rounded-lg border flex flex-col gap-1 animate-pulse-subtle ${alert.type === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                                    alert.type === 'WARNING' ? 'bg-amber-50 border-amber-100' :
                                        'bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${alert.type === 'CRITICAL' ? 'bg-red-200 text-red-700' :
                                            alert.type === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>{alert.type}</span>
                                        <span className="text-[9px] text-slate-400">{alert.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-bold leading-tight">{alert.msg}</p>
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
                                guardsOnMap.map(guard => {
                                    const isLost = (Date.now() - guard.lastSeen) > 20000;
                                    return (
                                        <div key={guard.id} className={`flex items-center justify-between p-2 rounded-lg transition-colors border border-transparent ${isLost ? 'bg-red-50 border-red-100' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${isLost ? 'bg-red-600 text-white border-red-700' : 'bg-blue-900 text-blue-100 border-blue-800'}`}>
                                                    {guard.name.charAt(0)}{guard.name.split(' ')[1]?.charAt(0) || ''}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isLost ? 'text-red-700' : 'text-slate-800'}`}>{guard.name}</p>
                                                    <p className="text-[10px] uppercase flex items-center gap-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isLost ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                                                        <span className={isLost ? 'text-red-500 font-bold' : 'text-slate-500'}>
                                                            {isLost ? 'SEÑAL PERDIDA' : 'CONECTADO'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setMapState({ center: [guard.lat, guard.lng], zoom: 16 })}
                                                className={`p-1.5 rounded-md transition-colors ${isLost ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'hover:bg-blue-50 text-blue-600'}`}
                                            >
                                                <MapPin size={14} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Monitor;
