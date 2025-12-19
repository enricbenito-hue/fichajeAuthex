
import React, { useMemo } from 'react';
import { User, Shift } from '../types';

const AdminDashboard: React.FC = () => {
  const users: User[] = useMemo(() => JSON.parse(localStorage.getItem('authex_all_users') || '[]'), []);
  const globalShifts: Shift[] = useMemo(() => JSON.parse(localStorage.getItem('authex_global_shifts') || '[]'), []);

  const employeeStats = useMemo(() => {
    return users.filter(u => u.role === 'employee').map(u => {
      const userShifts = globalShifts.filter(s => s.userId === u.id);
      const totalHours = userShifts.reduce((acc, s) => {
        if (!s.endTime) return acc;
        return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000;
      }, 0);
      const isActive = userShifts.some(s => !s.endTime);
      
      return {
        ...u,
        totalHours: totalHours.toFixed(1),
        shiftsCount: userShifts.filter(s => s.endTime).length,
        isActive
      };
    });
  }, [users, globalShifts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel de Control General</h2>
          <p className="text-slate-500">Supervisión de toda la plantilla de AUTHEX S.A</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">Sistema Activo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Total Empleados</span>
          <div className="text-3xl font-bold text-slate-900">{employeeStats.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Fichados ahora</span>
          <div className="text-3xl font-bold text-indigo-600">{employeeStats.filter(e => e.isActive).length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Jornadas Totales</span>
          <div className="text-3xl font-bold text-slate-900">{globalShifts.filter(s => s.endTime).length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Media Horas/Sem</span>
          <div className="text-3xl font-bold text-emerald-600">38.4h</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-users text-indigo-500"></i>
            Estado de la Plantilla
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-8 py-4">Empleado</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4">Horas Totales</th>
                <th className="px-8 py-4">Días Trabajados</th>
                <th className="px-8 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.map(emp => (
                <tr key={emp.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-500">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {emp.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold ring-1 ring-inset ring-green-600/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        TRABAJANDO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-bold ring-1 ring-inset ring-slate-600/10">
                        AUSENTE
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono font-bold text-slate-700">{emp.totalHours}h</span>
                  </td>
                  <td className="px-8 py-5 text-slate-600">{emp.shiftsCount} días</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
