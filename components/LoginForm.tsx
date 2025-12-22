
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
    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/50">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-stone-900">Bienvenido</h2>
        <p className="text-stone-500 font-medium text-sm mt-1">Accede a tu panel de control</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email Profesional</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none transition-all text-stone-800"
            placeholder="ejemplo@authex.com"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-900/10 mt-2"
        >
          Entrar en el sistema
        </button>
      </form>

      <div className="mt-8 text-center pt-8 border-t border-stone-50">
        <p className="text-sm text-stone-500 font-medium">
          ¿No tienes cuenta?{' '}
          <button onClick={onSwitchToRegister} className="text-emerald-800 font-bold hover:underline ml-1">
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
