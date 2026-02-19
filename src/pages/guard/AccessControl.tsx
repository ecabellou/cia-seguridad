import { useState, useRef } from 'react';
import { Camera, FileText, X, Check, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';

const AccessControl = () => {
    const { profile } = useOutletContext<{ profile: any }>();
    const [mode, setMode] = useState<'entry' | 'exit'>('entry');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        rut: '',
        name: '',
        vehicle: '',
        patent: '',
        notes: ''
    });

    // Multiple file state
    const [files, setFiles] = useState<{
        rut: File | null;
        vehicle: File | null;
        cargo: File | null;
    }>({
        rut: null,
        vehicle: null,
        cargo: null
    });

    const [suggestions, setSuggestions] = useState<any[]>([]);

    // Refs for file inputs
    const rutInputRef = useRef<HTMLInputElement>(null);
    const vehicleInputRef = useRef<HTMLInputElement>(null);
    const cargoInputRef = useRef<HTMLInputElement>(null);

    // Search for existing users by RUT
    const handleRutChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, rut: value }));

        if (value.length > 3) {
            const { data } = await supabase
                .from('access_logs')
                .select('rut, name, vehicle, patent')
                .ilike('rut', `%${value}%`)
                .limit(5);

            // Remove duplicates based on RUT
            const unique = data ? Array.from(new Map(data.map(item => [item.rut, item])).values()) : [];
            setSuggestions(unique);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (item: any) => {
        setFormData(prev => ({
            ...prev,
            rut: item.rut,
            name: item.name,
            vehicle: item.vehicle || '',
            patent: item.patent || ''
        }));
        setSuggestions([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'rut' | 'vehicle' | 'cargo') => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const removeFile = (type: 'rut' | 'vehicle' | 'cargo') => {
        setFiles(prev => ({ ...prev, [type]: null }));
        // Reset input value to allow re-uploading same file if needed
        if (type === 'rut' && rutInputRef.current) rutInputRef.current.value = '';
        if (type === 'vehicle' && vehicleInputRef.current) vehicleInputRef.current.value = '';
        if (type === 'cargo' && cargoInputRef.current) cargoInputRef.current.value = '';
    };

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('access-evidence')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading:', uploadError);
            return null;
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('access-evidence')
                .getPublicUrl(filePath);
            return publicUrl;
        }
    };

    const handleSubmit = async () => {
        if (!formData.rut || !formData.name) {
            alert('Por favor complete RUT y Nombre');
            return;
        }

        setLoading(true);
        try {
            // Upload files in parallel
            const [urlRut, urlVehicle, urlCargo] = await Promise.all([
                files.rut ? uploadFile(files.rut) : null,
                files.vehicle ? uploadFile(files.vehicle) : null,
                files.cargo ? uploadFile(files.cargo) : null
            ]);

            // Insert Log
            const { error } = await supabase.from('access_logs').insert({
                type: mode,
                rut: formData.rut,
                name: formData.name,
                vehicle: formData.vehicle,
                patent: formData.patent.toUpperCase(),
                notes: formData.notes,
                url_rut: urlRut,
                url_vehicle: urlVehicle,
                url_cargo: urlCargo,
                guard_id: profile?.id
            });

            if (error) throw error;

            setSuccess(true);
            setFormData({ rut: '', name: '', vehicle: '', patent: '', notes: '' });
            setFiles({ rut: null, vehicle: null, cargo: null });

            setTimeout(() => setSuccess(false), 3000);

        } catch (error: any) {
            console.error('Error saving access log:', error);
            alert('Error al guardar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Control Guardia</h2>
                <p className="text-slate-500">Registro de acceso y captura de evidencia fotográfica.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {success && (
                    <div className="absolute inset-0 bg-emerald-50/95 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Check size={40} className="text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-800">¡Registro Exitoso!</h3>
                        <p className="text-emerald-600">El acceso ha sido guardado correctamente.</p>
                    </div>
                )}

                {/* Mode Selection (Radios) */}
                <div className="flex gap-6 justify-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${mode === 'entry' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                            {mode === 'entry' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <input type="radio" name="mode" className="hidden" checked={mode === 'entry'} onChange={() => setMode('entry')} />
                        <span className={`font-bold text-lg ${mode === 'entry' ? 'text-emerald-700' : 'text-slate-500'}`}>ENTRADA</span>
                    </label>

                    <div className="w-px h-8 bg-slate-300 mx-4"></div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${mode === 'exit' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                            {mode === 'exit' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <input type="radio" name="mode" className="hidden" checked={mode === 'exit'} onChange={() => setMode('exit')} />
                        <span className={`font-bold text-lg ${mode === 'exit' ? 'text-amber-700' : 'text-slate-500'}`}>SALIDA</span>
                    </label>
                </div>

                <hr className="border-slate-100" />

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-1">RUT / Identificación *</label>
                        <input
                            type="text"
                            placeholder="Ej: 12.345.678-9"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium uppercase"
                            value={formData.rut}
                            onChange={handleRutChange}
                        />
                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-20 mt-1 max-h-48 overflow-y-auto">
                                {suggestions.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectSuggestion(item)}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0"
                                    >
                                        <div className="font-bold text-sm text-slate-800">{item.rut}</div>
                                        <div className="text-xs text-slate-500">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Persona *</label>
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Vehículo</label>
                        <input
                            type="text"
                            placeholder="Ej: Camioneta Ford F-150"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={formData.vehicle}
                            onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Patente</label>
                        <input
                            type="text"
                            placeholder="Ej: ABCD-12"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase font-mono"
                            value={formData.patent}
                            onChange={e => setFormData({ ...formData, patent: e.target.value })}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Notas / Carga</label>
                    <textarea
                        rows={3}
                        placeholder="Describa carga, documentos, empresa, o cualquier observación relevante..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                {/* Evidence Panel */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Evidencia Fotográfica (Opcional)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {/* RUT Photo Group */}
                        <div className="space-y-2">
                            <input
                                type="file"
                                ref={rutInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'rut')}
                            />
                            {!files.rut ? (
                                <button
                                    onClick={() => rutInputRef.current?.click()}
                                    className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Camera size={24} className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">FOTO RUT</span>
                                </button>
                            ) : (
                                <div className="relative p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium text-blue-900 truncate">Adjunto</span>
                                    </div>
                                    <button onClick={() => removeFile('rut')} className="p-1 hover:bg-blue-200 rounded-full text-blue-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Vehicle Photo Group */}
                        <div className="space-y-2">
                            <input
                                type="file"
                                ref={vehicleInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'vehicle')}
                            />
                            {!files.vehicle ? (
                                <button
                                    onClick={() => vehicleInputRef.current?.click()}
                                    className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 group"
                                >
                                    <ImageIcon size={24} className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">FOTO VEHÍCULO</span>
                                </button>
                            ) : (
                                <div className="relative p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium text-blue-900 truncate">Adjunto</span>
                                    </div>
                                    <button onClick={() => removeFile('vehicle')} className="p-1 hover:bg-blue-200 rounded-full text-blue-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cargo Photo Group */}
                        <div className="space-y-2">
                            <input
                                type="file"
                                ref={cargoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'cargo')}
                            />
                            {!files.cargo ? (
                                <button
                                    onClick={() => cargoInputRef.current?.click()}
                                    className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Camera size={24} className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">FOTO CARGA</span>
                                </button>
                            ) : (
                                <div className="relative p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium text-blue-900 truncate">Adjunto</span>
                                    </div>
                                    <button onClick={() => removeFile('cargo')} className="p-1 hover:bg-blue-200 rounded-full text-blue-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">* Puede tomar múltiples fotos si es necesario.</p>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-lg text-white transform active:scale-[0.98] ${mode === 'entry'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30'
                                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/30'
                            }`}
                    >
                        {loading ? 'Guardando...' : `REGISTRAR ${mode === 'entry' ? 'ENTRADA' : 'SALIDA'}`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AccessControl;
