
import React, { useState } from 'react';
import { User } from '../types';

interface RegisterFormProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onRegister({
        id: crypto.randomUUID(),
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Nueva Cuenta</h2>
        <p className="text-slate-500 text-sm">Regístrate en el sistema AUTHEX S.A</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
            placeholder="Ej: Manuel García"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Profesional</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
            placeholder="m.garcia@authex.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Usuario</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`py-3 rounded-xl border text-sm font-bold transition-all ${role === 'employee' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fas fa-user-tie mr-2"></i> Empleado
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-3 rounded-xl border text-sm font-bold transition-all ${role === 'admin' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fas fa-shield-halved mr-2"></i> Admin
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-100 mt-4"
        >
          Crear cuenta
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onSwitchToLogin} className="text-indigo-600 font-bold hover:underline">
            Entrar aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
