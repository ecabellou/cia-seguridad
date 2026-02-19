
import { useState, useRef } from 'react';
import { Camera, FileText, X, Check } from 'lucide-react';
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
    const [file, setFile] = useState<File | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.rut || !formData.name) {
            alert('Por favor complete RUT y Nombre');
            return;
        }

        setLoading(true);
        try {
            let documentUrl = null;

            // Upload File if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('access-evidence')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Error uploading:', uploadError);
                    // Continue without file if upload fails, or alert user?
                    // For now, let's alert but continue if critical
                    alert('Error al subir imagen, se guardará el registro sin ella.');
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('access-evidence')
                        .getPublicUrl(filePath);
                    documentUrl = publicUrl;
                }
            }

            // Insert Log
            const { error } = await supabase.from('access_logs').insert({
                type: mode,
                rut: formData.rut,
                name: formData.name,
                vehicle: formData.vehicle,
                patent: formData.patent.toUpperCase(),
                notes: formData.notes,
                document_url: documentUrl,
                guard_id: profile?.id
            });

            if (error) throw error;

            setSuccess(true);
            setFormData({ rut: '', name: '', vehicle: '', patent: '', notes: '' });
            setFile(null);
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
                <h2 className="text-2xl font-bold text-slate-800">Nuevo Registro</h2>
                <p className="text-slate-500">Complete los datos para registrar un nuevo evento de acceso.</p>
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
                        <label className="block text-sm font-bold text-slate-700 mb-1">Vehículo (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Camioneta Ford F-150"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={formData.vehicle}
                            onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Patente (Opcional)</label>
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
                    <label className="block text-sm font-bold text-slate-700 mb-1">Notas ({mode === 'entry' ? 'Entrada' : 'Salida'})</label>
                    <textarea
                        rows={3}
                        placeholder="Describa carga, documentos, empresa, o cualquier observación relevante..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                {/* File Attachment */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Evidencia / Documento</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                    />

                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-3 px-4 py-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all group"
                        >
                            <Camera size={24} className="text-slate-400 group-hover:text-slate-600" />
                            <span className="text-slate-500 font-medium group-hover:text-slate-700">Tomar foto o adjuntar archivo...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="text-blue-500" />
                                <span className="text-sm font-medium text-blue-900 truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <button onClick={() => setFile(null)} className="p-1 hover:bg-blue-100 rounded-full text-blue-500">
                                <X size={18} />
                            </button>
                        </div>
                    )}
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
