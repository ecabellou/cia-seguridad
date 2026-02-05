import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Map, FileText, LogOut, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/map', icon: Map, label: 'Mapa Global' },
        { to: '/admin/users', icon: Users, label: 'Usuarios' },
        { to: '/admin/communications', icon: MessageSquare, label: 'Comunicaciones' },
        { to: '/admin/reports', icon: FileText, label: 'Reportes' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 flex items-center justify-center border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">CIA SEGURIDAD</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-slate-800 text-blue-400 shadow-lg shadow-blue-500/10'
                                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1 flex flex-col justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
                    <img src="/logo.png" alt="Company Logo" className="w-48 h-auto drop-shadow-2xl filter brightness-110 animate-float-pulse" />
                </div>

                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white sticky top-0 z-10 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">Panel de Administrador</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold">
                            AD
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

export default AdminLayout;
