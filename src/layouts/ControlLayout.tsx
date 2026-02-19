import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Radio, FileText, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ControlLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { to: '/control/monitor', icon: Activity, label: 'Monitor En Vivo' },
        { to: '/control/access-logs', icon: FileText, label: 'Historial Accesos' },
        { to: '/control/communications', icon: Radio, label: 'Comunicaciones' },
        { to: '/control/docs', icon: FileText, label: 'Documentos' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300">
                <div className="p-6 flex items-center justify-center border-b border-slate-800">
                    <Activity className="text-emerald-400" size={28} />
                    <span className="hidden lg:block ml-3 font-bold text-lg text-emerald-400">CONTROL</span>
                </div>

                <nav className="flex-1 p-2 lg:p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center lg:px-4 px-2 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1 flex flex-col justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
                    <img src="/logo.png" alt="Company Logo" className="hidden lg:block w-48 h-auto drop-shadow-2xl filter brightness-110 animate-float-pulse" />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center lg:justify-start w-full lg:px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block ml-3">Salir</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto bg-slate-50 relative text-slate-900">
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white sticky top-0 z-10 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">Centro de Control</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold">
                            CC
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ControlLayout;
