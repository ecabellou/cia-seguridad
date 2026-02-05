import { FileText, Download, Search, Filter } from 'lucide-react';

const mockDocs = [
    { id: 1, name: 'Protocolo de Seguridad 2024.pdf', type: 'PDF', size: '2.4 MB', date: '01/01/2024' },
    { id: 2, name: 'Manual de Operaciones CCTV.pdf', type: 'PDF', size: '5.1 MB', date: '15/01/2024' },
    { id: 3, name: 'Registro de Incidentes_Enero.xlsx', type: 'Excel', size: '1.2 MB', date: '01/02/2024' },
    { id: 4, name: 'Turnos_Q1_2024.xlsx', type: 'Excel', size: '850 KB', date: '10/02/2024' },
];

const Docs = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Documentación Operativa
                </h1>
                <p className="text-slate-500">Repositorio central de procedimientos y registros.</p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar documentos..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={20} />
                    <span>Filtrar</span>
                </button>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockDocs.map((doc) => (
                    <div key={doc.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-lg text-blue-600 group-hover:bg-blue-50 transition-colors">
                                <FileText size={24} />
                            </div>
                            <span className="text-xs font-mono text-slate-400">{doc.type}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1 truncate" title={doc.name}>{doc.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                        </div>
                        <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                ))}

                {/* Upload Placeholder */}
                <button className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50/10 transition-all cursor-not-allowed group">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <span className="font-medium text-sm">Subir Documento</span>
                    <span className="text-xs mt-1">Solo Administradores</span>
                </button>
            </div>
        </div>
    );
};

export default Docs;
