
import { useState } from 'react';
import { Camera, CheckCircle, Upload, ScanLine, FileText } from 'lucide-react';

const AccessControl = () => {
    const [mode, setMode] = useState<'entry' | 'exit'>('entry');

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Nuevo Registro</h2>
                <p className="text-slate-500">Complete los datos para registrar un nuevo evento de acceso. El sistema validará la identidad y capturará evidencia.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">

                {/* Camera Viewport Placeholder */}
                <div className="w-full h-64 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <Camera size={48} className="mb-4 text-slate-300" />
                    <p className="font-bold text-slate-500">Cámara Desactivada</p>
                    <p className="text-sm">Escanee una cédula o active la cámara para foto de evidencia.</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200">
                        <ScanLine size={18} />
                        Escanear Cédula (OCR)
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200">
                        <Camera size={18} />
                        Adjuntar Foto Evidencia
                    </button>
                </div>

                <hr className="border-slate-100" />

                {/* Mode Selection (Radios) */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === 'entry' ? 'border-slate-800' : 'border-slate-300'}`}>
                            {mode === 'entry' && <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />}
                        </div>
                        <input type="radio" name="mode" className="hidden" checked={mode === 'entry'} onChange={() => setMode('entry')} />
                        <span className={`font-medium ${mode === 'entry' ? 'text-slate-900' : 'text-slate-500'}`}>Entrada</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === 'exit' ? 'border-slate-800' : 'border-slate-300'}`}>
                            {mode === 'exit' && <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />}
                        </div>
                        <input type="radio" name="mode" className="hidden" checked={mode === 'exit'} onChange={() => setMode('exit')} />
                        <span className={`font-medium ${mode === 'exit' ? 'text-slate-900' : 'text-slate-500'}`}>Salida</span>
                    </label>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">RUT / Identificación</label>
                        <input type="text" placeholder="Ej: 12.345.678-9" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Persona</label>
                        <input type="text" placeholder="Nombre autocompletado o manual" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Vehículo (Opcional)</label>
                        <input type="text" placeholder="Ej: Camioneta Ford F-150" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Patente (Opcional)</label>
                        <input type="text" placeholder="Ej: ABCD-12" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase" />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Notas ({mode === 'entry' ? 'Entrada' : 'Salida'})</label>
                    <textarea rows={3} placeholder="Describa carga, documentos, o cualquier observación relevante..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
                </div>

                {/* File Attachment */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Adjuntar Documento</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors group">
                        <FileText size={20} className="text-slate-400 group-hover:text-slate-600" />
                        <span className="text-slate-500 text-sm group-hover:text-slate-700">Seleccionar archivo...</span>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-all flex items-center gap-2">
                        Registrar {mode === 'entry' ? 'Entrada' : 'Salida'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AccessControl;
