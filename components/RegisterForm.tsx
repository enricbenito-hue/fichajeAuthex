
import React, { useState } from 'react';
import { User } from '../types';

interface RegisterFormProps {
  onRegister: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin, isLoading = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && !isLoading) {
      onRegister({
        name,
        email,
        role
      });
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/50">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-stone-900">Nueva Cuenta</h2>
        <p className="text-stone-500 font-medium text-sm mt-1">Regístrate en el sistema AUTHEX S.A</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
          <input
            type="text"
            required
            disabled={isLoading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none transition-all text-stone-800 disabled:opacity-50"
            placeholder="Ej: Manuel García"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email Profesional</label>
          <input
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none transition-all text-stone-800 disabled:opacity-50"
            placeholder="m.garcia@authex.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Tipo de Usuario</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setRole('employee')}
              className={`py-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${role === 'employee' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
            >
              <i className="fas fa-user-tie"></i> Empleado
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setRole('admin')}
              className={`py-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${role === 'admin' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
            >
              <i className="fas fa-shield-halved"></i> Admin
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-900/10 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-8 border-t border-stone-50">
        <p className="text-sm text-stone-500 font-medium">
          ¿Ya tienes cuenta?{' '}
          <button 
            onClick={onSwitchToLogin} 
            disabled={isLoading}
            className="text-emerald-800 font-bold hover:underline ml-1 disabled:opacity-50"
          >
            Entrar aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
