
import React, { useMemo, useState, useEffect } from 'react';
import { User, Shift } from '../types';
import { db } from '../services/database';

const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [globalShifts, setGlobalShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'employee' as 'employee' | 'admin' });
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const users = await db.getAllUsers();
    const shifts = await db.getAllGlobalShifts();
    setAllUsers(users);
    setGlobalShifts(shifts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const employeeStats = useMemo(() => {
    return allUsers
      .map(u => {
        const userShifts = globalShifts.filter(s => s.userId === u.id);
        const totalHours = userShifts.reduce((acc, s) => {
          if (!s.endTime) return acc;
          return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000;
        }, 0);
        const isActive = userShifts.some(s => !s.endTime);
        return { ...u, totalHours: totalHours.toFixed(1), isActive };
      })
      .filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allUsers, globalShifts, searchTerm]);

  const exportGlobalReport = () => {
    const now = new Date();
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const headers = ["Nombre", "Email", "Rol", "Horas Hoy", "Horas Semana", "Horas Mes", "Horas Totales"];
    const rows = allUsers.map(u => {
      const userShifts = globalShifts.filter(s => s.userId === u.id && s.endTime);
      const sumHours = (filterFn: (d: Date) => boolean) => {
        return userShifts
          .filter(s => filterFn(new Date(s.startTime)))
          .reduce((acc, s) => acc + (new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()) / 3600000, 0)
          .toFixed(2);
      };
      return [ u.name, u.email, u.role === 'admin' ? 'Administrador' : 'Empleado', sumHours(d => d >= startOfToday), sumHours(d => d >= startOfWeek), sumHours(d => d >= startOfMonth), sumHours(() => true) ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_RRHH_TOT_HERBA_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopyFeedback(email);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'employee' });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allUsers.some(u => u.email === formData.email && u.id !== editingUser?.id)) {
      setError('Email ya en uso por otro miembro.'); return;
    }
    const userData: User = editingUser 
      ? { ...editingUser, ...formData }
      : { id: crypto.randomUUID(), ...formData, createdAt: new Date().toISOString() };
    await db.saveUser(userData);
    await loadData();
    setIsModalOpen(false);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
      await db.deleteUser(userId);
      await loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Cargando Ecosistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Gestión de Ecosistema</h2>
          <p className="text-stone-500 font-medium">Supervisión y armonización de la plantilla de TOT HERBA</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportGlobalReport} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 border border-stone-200">
            <i className="fas fa-file-excel"></i> Descargar Reporte
          </button>
          <button onClick={openAddModal} className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-900/20 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i> Nuevo Miembro
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in">
            <div className="px-10 py-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="text-xl font-bold text-stone-900">{editingUser ? 'Actualizar Miembro' : 'Alta de Miembro'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-10 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Nombre</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Rol</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none appearance-none cursor-pointer">
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 px-4 py-4 rounded-2xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 shadow-lg shadow-emerald-900/10 transition-all active:scale-95">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Plantilla', val: allUsers.length, color: 'text-stone-900', icon: 'fa-users' },
          { label: 'En Jornada', val: employeeStats.filter(e => e.isActive).length, color: 'text-emerald-700', icon: 'fa-sun' },
          { label: 'Registros Hoy', val: globalShifts.filter(s => new Date(s.startTime).toDateString() === new Date().toDateString()).length, color: 'text-stone-900', icon: 'fa-clock' },
          { label: 'Horas Totales', val: employeeStats.reduce((acc, curr) => acc + parseFloat(curr.totalHours), 0).toFixed(0) + 'h', color: 'text-amber-700', icon: 'fa-seedling' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
              <i className={`fas ${s.icon} text-stone-200`}></i>
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/50">
          <h3 className="font-bold text-stone-800 flex items-center gap-3">
            <i className="fas fa-list-ul text-emerald-700"></i> Listado de Colaboradores
          </h3>
          <div className="relative w-full sm:w-80">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"></i>
            <input type="text" placeholder="Filtrar por nombre o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase text-stone-400 tracking-[0.2em] bg-stone-50">
              <tr>
                <th className="px-10 py-5">Nombre</th>
                <th className="px-10 py-5">Email</th>
                <th className="px-10 py-5">Estado</th>
                <th className="px-10 py-5">Carga</th>
                <th className="px-10 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {employeeStats.length === 0 ? (
                <tr> <td colSpan={5} className="px-10 py-12 text-center text-stone-400 italic">No se encontraron colaboradores.</td> </tr>
              ) : (
                employeeStats.map(emp => (
                  <tr key={emp.id} className="group hover:bg-stone-50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${emp.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'}`}>{emp.name.charAt(0)}</div>
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900">{emp.name}</span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{emp.role === 'admin' ? 'Administrador' : 'Empleado'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 group/email">
                        <span className="text-sm text-stone-600">{emp.email}</span>
                        <button onClick={() => handleCopyEmail(emp.email)} className="opacity-0 group-hover/email:opacity-100 p-1.5 text-stone-300 hover:text-emerald-700 transition-all" title="Copiar email"><i className={`fas ${copyFeedback === emp.email ? 'fa-check text-green-600' : 'fa-copy'}`}></i></button>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      {emp.isActive ? <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>PRESENTE</span> : <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-400 text-[10px] font-bold">AUSENTE</span>}
                    </td>
                    <td className="px-10 py-6"><span className="font-mono font-bold text-stone-700 text-sm">{emp.totalHours}h</span></td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(emp)} className="p-2 text-stone-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all" title="Editar"><i className="fas fa-pencil"></i></button>
                        <button onClick={() => handleDeleteUser(emp.id, emp.name)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Eliminar"><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
