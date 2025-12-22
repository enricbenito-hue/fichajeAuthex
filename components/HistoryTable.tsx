
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
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
        <h3 className="font-bold text-stone-800 flex items-center gap-3">
          <i className="fas fa-seedling text-emerald-700"></i>
          Registro de Actividad
        </h3>
        <span className="text-[10px] font-bold text-stone-400 bg-white border border-stone-100 px-3 py-1 rounded-full uppercase tracking-widest">
          {shifts.length} Entradas
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50/80 text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-4">Fecha</th>
              <th className="px-8 py-4">Ciclo</th>
              <th className="px-8 py-4">Duración</th>
              <th className="px-8 py-4">Eco-Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {sortedShifts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center text-stone-400 italic">
                  No hay registros en tu historial.
                </td>
              </tr>
            ) : (
              sortedShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-stone-900">
                        {new Date(shift.startTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase font-medium">
                        {new Date(shift.startTime).toLocaleDateString('es-ES', { weekday: 'long' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm text-stone-600 font-medium">
                      {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <i className="fas fa-arrow-right mx-2 text-[10px] text-stone-300"></i>
                      {shift.endTime 
                        ? new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Actual'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${shift.endTime ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100 animate-pulse'}`}>
                      {calculateDuration(shift.startTime, shift.endTime)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-stone-500 truncate max-w-xs font-medium italic" title={shift.aiSummary || shift.notes}>
                      {shift.aiSummary || shift.notes || '—'}
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
