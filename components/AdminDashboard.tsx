
import React, { useMemo, useState, useEffect } from 'react';
import { User, Shift } from '../types';

const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'employee' as 'employee' | 'admin' });
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios al inicio
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('authex_all_users') || '[]');
    setAllUsers(savedUsers);
  }, []);

  const globalShifts: Shift[] = useMemo(() => JSON.parse(localStorage.getItem('authex_global_shifts') || '[]'), []);

  const employeeStats = useMemo(() => {
    return allUsers
      .map(u => {
        const userShifts = globalShifts.filter(s => s.userId === u.id);
        const totalHours = userShifts.reduce((acc, s) => {
          if (!s.endTime) return acc;
          return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000;
        }, 0);
        const isActive = userShifts.some(s => !s.endTime);
        
        return {
          ...u,
          totalHours: totalHours.toFixed(1),
          isActive
        };
      })
      .filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allUsers, globalShifts, searchTerm]);

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

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar duplicados de email (excepto si estamos editando al mismo usuario)
    if (allUsers.some(u => u.email === formData.email && u.id !== editingUser?.id)) {
      setError('Este email ya está registrado por otro usuario.');
      return;
    }

    let updatedUsers: User[];

    if (editingUser) {
      // Lógica de edición
      updatedUsers = allUsers.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: formData.name, email: formData.email, role: formData.role } 
          : u
      );
    } else {
      // Lógica de creación
      const userToAdd: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString()
      };
      updatedUsers = [...allUsers, userToAdd];
    }

    setAllUsers(updatedUsers);
    localStorage.setItem('authex_all_users', JSON.stringify(updatedUsers));
    setIsModalOpen(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      setAllUsers(updatedUsers);
      localStorage.setItem('authex_all_users', JSON.stringify(updatedUsers));
      
      // Opcional: Limpiar turnos del usuario eliminado
      // localStorage.removeItem(`authex_shifts_${userId}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel de Control General</h2>
          <p className="text-slate-500">Supervisión, edición y gestión de la plantilla de AUTHEX S.A</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95"
        >
          <i className="fas fa-plus"></i>
          Añadir Empleado
        </button>
      </div>

      {/* Modal Dinámico (Alta / Edición) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">
                {editingUser ? 'Editar Empleado' : 'Dar de Alta Empleado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Laura Martínez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Profesional</label>
                <input 
                  type="email" 
                  required
                  placeholder="l.martinez@authex.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Rol en el Sistema</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  {editingUser ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Indicadores de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Total Plantilla</span>
          <div className="text-3xl font-bold text-slate-900">{allUsers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Activos Ahora</span>
          <div className="text-3xl font-bold text-indigo-600">{employeeStats.filter(e => e.isActive).length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Registros Hoy</span>
          <div className="text-3xl font-bold text-slate-900">
            {globalShifts.filter(s => new Date(s.startTime).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Media Semanal</span>
          <div className="text-3xl font-bold text-emerald-600">38.4h</div>
        </div>
      </div>

      {/* Tabla de Gestión */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-users text-indigo-500"></i>
            Listado de Empleados
          </h3>
          <div className="relative w-full sm:w-72">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 border-b border-slate-100">Empleado</th>
                <th className="px-8 py-4 border-b border-slate-100">Rol</th>
                <th className="px-8 py-4 border-b border-slate-100">Email</th>
                <th className="px-8 py-4 border-b border-slate-100">Estado</th>
                <th className="px-8 py-4 border-b border-slate-100">Horas Tot.</th>
                <th className="px-8 py-4 border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">
                    No se han encontrado registros de empleados.
                  </td>
                </tr>
              ) : (
                employeeStats.map(emp => (
                  <tr key={emp.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${emp.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {emp.name.charAt(0)}
                        </div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tight ${emp.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 group/email">
                        <span className="text-sm text-slate-600 font-medium">{emp.email}</span>
                        <button 
                          onClick={() => handleCopyEmail(emp.email)}
                          className="opacity-0 group-hover/email:opacity-100 p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-md transition-all"
                          title="Copiar email"
                        >
                          <i className={`fas ${copyFeedback === emp.email ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold ring-1 ring-inset ring-green-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                          EN JORNADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold ring-1 ring-inset ring-slate-600/10">
                          FUERA
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono font-bold text-slate-700 text-sm">{emp.totalHours}h</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(emp)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar empleado"
                        >
                          <i className="fas fa-pen text-sm"></i>
                        </button>
                        <a 
                          href={`mailto:${emp.email}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Enviar correo"
                        >
                          <i className="fas fa-envelope text-sm"></i>
                        </a>
                        <button 
                          onClick={() => handleDeleteUser(emp.id, emp.name)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar empleado"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
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
