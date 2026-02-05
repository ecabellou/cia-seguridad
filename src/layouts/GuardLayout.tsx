import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ScanLine, MapPin, BookOpen, AlertTriangle, LogOut, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { useLocationTracker } from '../lib/useLocationTracker';
import { supabase } from '../lib/supabase';

const GuardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [profile, setProfile] = useState<{ id: string, first_name: string, last_name: string } | null>(null);

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            }
        };
        getProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Use REAL ID and Name from profile, fallback to search params for testing/emergency
    const guardId = profile?.id || searchParams.get('id') || 'G-WAIT';
    const guardName = profile ? `${profile.first_name} ${profile.last_name || ''}` : (searchParams.get('name') || 'Cargando...');

    // Solo activamos el tracker si ya tenemos el perfil u operamos en modo test
    useLocationTracker(guardId !== 'G-WAIT' ? guardId : undefined, guardName);

    const navItems = [
        { to: '/guard/home', icon: ShieldCheck, label: 'Dashboard' },
        { to: '/guard/access', icon: ScanLine, label: 'Control de Acceso' },
        { to: '/guard/rounds', icon: MapPin, label: 'Rondas' },
        { to: '/guard/incidents', icon: BookOpen, label: 'Libro de Novedades' },
        { to: '/guard/communications', icon: MessageSquare, label: 'Mensajes' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col text-slate-300">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                    <div className="w-10 h-10 mr-3 flex items-center justify-center">
                        <img src="/logo.png" alt="CIA Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">CIA Seguridad</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-600/10 text-blue-400 border-r-2 border-blue-500"
                                        : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon size={20} className={clsx(isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1 flex flex-col justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
                    <img src="/logo.png" alt="Company Logo" className="w-40 h-auto drop-shadow-2xl filter brightness-110" />
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-800 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all animate-pulse">
                        <AlertTriangle size={20} />
                        <span>Botón de Pánico</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 py-2 text-sm transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Only visible on small screens) */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-slate-900 z-50 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="h-8 w-8 object-contain" />
                    <span className="text-white font-bold">CIA Seguridad</span>
                </div>
                {/* Mobile menu toggle would go here */}
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-hidden relative">
                {/* Header Context for Desktop */}
                <header className="h-16 bg-white border-b border-slate-200 hidden md:flex items-center justify-between px-8 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {navItems.find(i => location.pathname.includes(i.to))?.label || 'Panel de Guardia'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">Guardia Turno</p>
                            <p className="text-xs text-slate-500">Zona Norte</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold">
                            GT
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 bg-slate-100 dark:bg-slate-950">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav (Fallback for small screens if needed, or hide if transforming completely) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 h-16 flex justify-around items-center z-50">
                {navItems.map((item) => (
                    <Link key={item.to} to={item.to} className={clsx("flex flex-col items-center p-2", location.pathname === item.to ? "text-blue-400" : "text-slate-500")}>
                        <item.icon size={20} />
                        <span className="text-[10px] mt-1">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default GuardLayout;
