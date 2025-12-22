
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7]">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-800 p-2 rounded-xl shadow-sm">
              <i className="fas fa-leaf text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight uppercase">
              AUTHEX<span className="text-emerald-700 ml-1 text-sm font-black">S.A</span>
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-stone-800">{user.name}</span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">{user.role}</span>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
              >
                <i className="fas fa-power-off"></i>
                <span className="hidden sm:inline">Desconectar</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-stone-100 border-t border-stone-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-stone-500 font-medium">
            &copy; {new Date().getFullYear()} AUTHEX S.A. Gestión del tiempo para TOT HERBA.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
