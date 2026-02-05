
import { useState, useEffect } from 'react';
import { Edit2, Plus, Search, Trash2, User, X, CheckCircle, Ban, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Guard {
    id: string; // UUID
    first_name: string;
    last_name: string;
    rut: string;
    phone: string;
    email: string;
    photo_url?: string;
    role: string;
    status: 'active' | 'suspended';
}

const UserManagement = () => {
    const [guards, setGuards] = useState<Guard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Guard>>({
        first_name: '', last_name: '', rut: '', phone: '', email: '', status: 'active', role: 'guard'
    });

    const fetchGuards = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching guards:', error);
        else setGuards(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchGuards();
    }, []);

    const handleOpenModal = (guard?: Guard) => {
        if (guard) {
            setEditingGuard(guard);
            setFormData(guard);
        } else {
            setEditingGuard(null);
            setFormData({
                first_name: '',
                last_name: '',
                rut: '',
                phone: '',
                email: '',
                status: 'active',
                role: 'guard'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const dataToSave = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                rut: formData.rut,
                phone: formData.phone,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                updated_at: new Date(),
            };

            if (editingGuard) {
                const { error } = await supabase
                    .from('profiles')
                    .update(dataToSave)
                    .eq('id', editingGuard.id);
                if (error) throw error;
                alert('Usuario actualizado correctamente');
            } else {
                const { error } = await supabase
                    .from('profiles')
                    .insert([{
                        ...dataToSave,
                        id: crypto.randomUUID(),
                        created_at: new Date()
                    }]);
                if (error) throw error;
                alert('Nuevo usuario creado correctamente. Recuerda que para iniciar sesión debe tener una cuenta en Auth.');
            }

            await fetchGuards();
            setIsModalOpen(false);
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
        }
    };

    const toggleStatus = async (guard: Guard) => {
        const newStatus = guard.status === 'active' ? 'suspended' : 'active';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', guard.id);

            if (error) throw error;
            fetchGuards();
        } catch (error: any) {
            alert('Error al cambiar estado: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Está seguro de eliminar este perfil? (Esto no borra la cuenta de acceso, solo el perfil de datos)')) {
            try {
                const { error } = await supabase.from('profiles').delete().eq('id', id);
                if (error) throw error;
                fetchGuards();
            } catch (error: any) {
                alert('Error al eliminar: ' + error.message);
            }
        }
    };

    const filteredGuards = guards.filter(g =>
        `${g.first_name} ${g.last_name} ${g.rut || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestión de Personal</h1>
                    <p className="text-slate-500">Administre guardias, supervisores y permisos.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchGuards}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-2 rounded-lg transition-colors shadow-sm"
                        title="Refrescar Lista"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <Plus size={20} />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o RUT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Personal</th>
                            <th className="px-6 py-4">RUT</th>
                            <th className="px-6 py-4">Contacto</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500">Cargando personal...</td>
                            </tr>
                        ) : filteredGuards.map((guard) => (
                            <tr key={guard.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 overflow-hidden">
                                            {guard.photo_url ? <img src={guard.photo_url} className="w-full h-full object-cover" /> : <User size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{guard.first_name || 'Sin Nombre'} {guard.last_name}</div>
                                            <div className="text-xs text-slate-500 capitalize">{guard.role}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{guard.rut || '---'}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600">{guard.email}</div>
                                    <div className="text-xs text-slate-400">{guard.phone || 'Sin teléfono'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${guard.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                        guard.role === 'control' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                        {guard.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${guard.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                        {guard.status === 'active' ? 'ACTIVO' : 'SUSPENDIDO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => toggleStatus(guard)} title={guard.status === 'active' ? 'Suspender' : 'Activar'} className="p-2 text-slate-400 hover:text-amber-600 bg-white border border-slate-200 rounded-lg hover:bg-amber-50 transition-colors">
                                            {guard.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                        <button onClick={() => handleOpenModal(guard)} title="Editar" className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(guard.id)} title="Eliminar" className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredGuards.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No se encontraron usuarios. Asegúrese de crearlos en Supabase Auth primero.
                    </div>
                )}
            </div>

            {/* Info Modal for Creation */}
            {isInfoModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                        <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                <User size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Crear Nuevo Usuario</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Por seguridad, el registro inicial de credenciales (Email/Password) debe realizarse en el panel de Supabase o mediante el sistema de invitación.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-left text-sm space-y-2">
                                <p className="text-slate-700 font-bold">Instrucciones:</p>
                                <ol className="list-decimal pl-4 text-slate-600 space-y-1">
                                    <li>Vaya a su Proyecto Supabase {'>'} <strong>Authentication</strong></li>
                                    <li>Click en <strong>Add User</strong></li>
                                    <li>Ingrese el email y cree el usuario.</li>
                                </ol>
                            </div>
                            <p className="text-emerald-600 text-xs font-bold">
                                ¡El usuario aparecerá automáticamente en esta lista para que edite sus datos!
                            </p>
                            <button onClick={() => setIsInfoModalOpen(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingGuard ? 'Editar Perfil' : 'Ingresar Nuevo Personal'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="flex gap-6">
                                {/* Photo Upload Placeholder */}
                                <div className="w-32 flex-shrink-0">
                                    <div className="w-32 h-32 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                        {formData.photo_url ? (
                                            <img src={formData.photo_url} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <User size={32} />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-center mt-2 text-slate-500 italic">Avatar automático</p>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Email / Usuario</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                disabled={!!editingGuard}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="ejemplo@cia.cl"
                                                className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-500 ${editingGuard ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">RUT</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="12.345.678-9"
                                                value={formData.rut}
                                                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Apellido</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Rol</label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 outline-none capitalize"
                                            >
                                                <option value="guard">Guardia</option>
                                                <option value="control">Control</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 outline-none"
                                            >
                                                <option value="active">Activo</option>
                                                <option value="suspended">Suspendido</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
                                            <input
                                                type="tel"
                                                placeholder="+56 9..."
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
