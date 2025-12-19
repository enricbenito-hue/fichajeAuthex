
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string) => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h2>
        <p className="text-slate-500 text-sm">Introduce tu email para acceder a tu panel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="ejemplo@empresa.com"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-100"
        >
          Entrar
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <button onClick={onSwitchToRegister} className="text-indigo-600 font-bold hover:underline">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
