
import { ArrowRight, BookOpen, Calendar, MessageSquare, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">

            {/* Welcome Section */}
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto shadow-sm flex items-center justify-center mb-4 border border-slate-200">
                    <img src="/logo.png" alt="CIA Logo" className="w-10 h-10 object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">Bienvenido, Guardia</h1>
                <p className="text-slate-500">Su panel de control para las operaciones del turno.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Next Task Card (Main Feature) */}
                <div className="lg:col-span-2 bg-slate-800 text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-amber-400 font-bold mb-4 uppercase tracking-wider text-xs">
                            <Calendar size={14} />
                            Próxima Tarea Programada
                        </div>

                        <div className="mb-6">
                            <h2 className="text-5xl font-bold mb-2">22:00</h2>
                            <h3 className="text-xl font-medium text-slate-200">Próxima Ronda de Vigilancia</h3>
                        </div>

                        <p className="text-slate-400 mb-8 max-w-lg">
                            Ronda perimetral Zona Norte. Verificar puntos de control 1-5. Asegurar cierre de portones y perímetros.
                        </p>
                    </div>

                    <Link
                        to="/guard/rounds"
                        className="relative z-10 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all w-fit"
                    >
                        Iniciar Ronda Ahora
                        <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Quick Actions Column */}
                <div className="space-y-6">

                    {/* Access Control Action */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Control de Acceso</h3>
                                <p className="text-xs text-slate-500">Registrar entradas/salidas.</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <ScanLine size={24} />
                            </div>
                        </div>
                        <Link to="/guard/access" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-slate-800 transition-colors">
                            Ir a Control de Acceso
                        </Link>
                    </div>

                    {/* Incidents Action */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Libro de Novedades</h3>
                                <p className="text-xs text-slate-500">Reportar un evento.</p>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <BookOpen size={24} />
                            </div>
                        </div>
                        <Link to="/guard/incidents" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-slate-800 transition-colors">
                            Registrar Novedad
                        </Link>
                    </div>

                </div>
            </div>

            {/* Communications Feed */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center gap-2">
                    <MessageSquare size={20} className="text-slate-400" />
                    Comunicaciones Recientes
                </h3>
                <p className="text-slate-400 text-sm mb-6">Instrucciones y mensajes de supervisión.</p>

                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            S
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Supervisor</h4>
                            <p className="text-slate-600 text-sm mt-1">Recordatorio: Actualizar checklist de equipos de emergencia antes de las 23:00.</p>
                            <span className="text-xs text-slate-400 mt-2 block">Hace 30 minutos</span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            A
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Administración</h4>
                            <p className="text-slate-600 text-sm mt-1">Nuevo protocolo de comunicación disponible en la sección de documentos.</p>
                            <span className="text-xs text-slate-400 mt-2 block">Hace 2 horas</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
