
import React from 'react';
import { Shift } from '../types';

interface HistoryTableProps {
  shifts: Shift[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ shifts }) => {
  const sortedShifts = [...shifts].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return 'En curso...';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-history text-indigo-500"></i>
          Historial de Turnos
        </h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
          Últimos {shifts.length} registros
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Inicio</th>
              <th className="px-6 py-3">Fin</th>
              <th className="px-6 py-3">Duración</th>
              <th className="px-6 py-3">Notas IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedShifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  No hay registros todavía. ¡Empieza tu jornada arriba!
                </td>
              </tr>
            ) : (
              sortedShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(shift.startTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {shift.endTime 
                        ? new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${shift.endTime ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {calculateDuration(shift.startTime, shift.endTime)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500 truncate max-w-xs" title={shift.aiSummary || shift.notes}>
                      {shift.aiSummary || shift.notes || <span className="text-slate-300 italic">Sin notas</span>}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
