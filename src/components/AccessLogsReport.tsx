
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, Filter, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AccessLogsReport = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        search: '',
        type: 'all' // all, entry, exit
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('access_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.startDate) {
                query = query.gte('created_at', `${filters.startDate}T00:00:00`);
            }
            if (filters.endDate) {
                query = query.lte('created_at', `${filters.endDate}T23:59:59`);
            }
            if (filters.type !== 'all') {
                query = query.eq('type', filters.type);
            }

            // Client-side filtering for search term as Supabase doesn't support complex OR across multiple columns easily without RPC
            const { data, error } = await query;

            if (data) {
                let filteredData = data;
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    filteredData = data.filter(log =>
                        (log.rut && log.rut.toLowerCase().includes(searchLower)) ||
                        (log.name && log.name.toLowerCase().includes(searchLower)) ||
                        (log.patent && log.patent.toLowerCase().includes(searchLower)) ||
                        (log.vehicle && log.vehicle.toLowerCase().includes(searchLower)) ||
                        (log.notes && log.notes.toLowerCase().includes(searchLower))
                    );
                }
                setLogs(filteredData);
            }
        } catch (error) {
            console.error("Error fetching logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters.startDate, filters.endDate, filters.type]); // Auto-refetch on date/type change

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);


    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('Reporte de Control de Acceso', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);

        if (filters.startDate || filters.endDate) {
            doc.text(`Rango: ${filters.startDate || 'Inicio'} a ${filters.endDate || 'Hoy'}`, 14, 36);
        }

        const tableColumn = ["Fecha/Hora", "Tipo", "RUT", "Nombre", "Patente", "Notas"];
        const tableRows = logs.map(log => [
            new Date(log.created_at).toLocaleString(),
            log.type === 'entry' ? 'ENTRADA' : 'SALIDA',
            log.rut || '-',
            log.name || '-',
            log.patent || '-',
            log.notes || '-'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`reporte_acceso_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Historial de Accesos</h1>
                    <p className="text-slate-500 text-sm">Monitoreo y descarga de registros de entrada y salida.</p>
                </div>
                <button
                    onClick={generatePDF}
                    disabled={logs.length === 0}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    Exportar PDF
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-1 w-full relative">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Buscar (RUT, Nombre, Patente...)</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Buscar..."
                            value={filters.search}
                            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Desde</label>
                        <input
                            type="date"
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            value={filters.startDate}
                            onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Hasta</label>
                        <input
                            type="date"
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            value={filters.endDate}
                            onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tipo</label>
                        <select
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm w-full"
                            value={filters.type}
                            onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="all">Todos</option>
                            <option value="entry">Entrada</option>
                            <option value="exit">Salida</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                <th className="p-4">Fecha / Hora</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Persona</th>
                                <th className="p-4">Vehículo</th>
                                <th className="p-4">Guardia</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">Cargando registros...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">No se encontraron registros de acceso.</td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-600">
                                            <div className="font-bold text-slate-900">{new Date(log.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs">{new Date(log.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.type === 'entry' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {log.type === 'entry' ? 'ENTRADA' : 'SALIDA'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{log.name || 'Desconocido'}</div>
                                            <div className="text-xs text-slate-500 font-mono">{log.rut || 'S/RUT'}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {log.patent ? (
                                                <>
                                                    <div className="font-bold uppercase bg-slate-100 px-1 rounded w-fit">{log.patent}</div>
                                                    <div className="text-xs mt-0.5">{log.vehicle || '-'}</div>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic">Peatón</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">
                                            ID: {log.guard_id?.substring(0, 8)}...
                                        </td>
                                        <td className="p-4">
                                            {/* Future: View Details Modal with Photo */}
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Ver Detalle</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && logs.length > 50 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
                        Mostrando últimos 50 registros. Use filtros para ver más.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessLogsReport;
