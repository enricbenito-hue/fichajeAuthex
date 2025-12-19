
import React, { useState, useEffect, useCallback } from 'react';
import { User, Shift, AuthStatus } from './types';
import Layout from './components/Layout';
import ClockPanel from './components/ClockPanel';
import HistoryTable from './components/HistoryTable';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import StatisticsDashboard from './components/StatisticsDashboard';
import AdminDashboard from './components/AdminDashboard';
import { getWeeklyInsights } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Inicialización y carga de datos
  useEffect(() => {
    const savedUser = localStorage.getItem('authex_active_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAuthStatus('authenticated');
      
      const savedShifts = localStorage.getItem(`authex_shifts_${parsedUser.id}`);
      if (savedShifts) {
        setShifts(JSON.parse(savedShifts));
      }
    } else {
      setAuthStatus('unauthenticated');
    }
  }, []);

  // Persistencia de turnos por usuario
  useEffect(() => {
    if (user) {
      localStorage.setItem(`authex_shifts_${user.id}`, JSON.stringify(shifts));
      
      // Si el usuario es el activo, guardamos sus turnos también en una lista global para el admin (Simulación)
      const allGlobalShifts = JSON.parse(localStorage.getItem('authex_global_shifts') || '[]');
      const otherUserShifts = allGlobalShifts.filter((s: Shift) => s.userId !== user.id);
      localStorage.setItem('authex_global_shifts', JSON.stringify([...otherUserShifts, ...shifts]));
    }
  }, [shifts, user]);

  const fetchInsights = useCallback(async () => {
    if (shifts.length > 0 && user && user.role === 'employee') {
      setIsRefreshingInsights(true);
      const dataStr = JSON.stringify(shifts.slice(-5).map(s => ({
        start: s.startTime,
        end: s.endTime,
        summary: s.aiSummary
      })));
      const result = await getWeeklyInsights(dataStr);
      setInsights(result);
      setIsRefreshingInsights(false);
    }
  }, [shifts, user]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchInsights();
    }
  }, [authStatus, fetchInsights]);

  const handleRegister = (newUser: User) => {
    const users = JSON.parse(localStorage.getItem('authex_all_users') || '[]');
    if (users.some((u: User) => u.email === newUser.email)) {
      alert('Este email ya está registrado.');
      return;
    }
    users.push(newUser);
    localStorage.setItem('authex_all_users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('authex_active_user', JSON.stringify(newUser));
    setAuthStatus('authenticated');
    setShifts([]);
  };

  const handleLogin = (email: string) => {
    const users = JSON.parse(localStorage.getItem('authex_all_users') || '[]');
    const found = users.find((u: User) => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('authex_active_user', JSON.stringify(found));
      setAuthStatus('authenticated');
      
      const savedShifts = localStorage.getItem(`authex_shifts_${found.id}`);
      setShifts(savedShifts ? JSON.parse(savedShifts) : []);
    } else {
      alert('Email no encontrado. Por favor, regístrate.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authex_active_user');
    setUser(null);
    setShifts([]);
    setAuthStatus('unauthenticated');
    setInsights('');
  };

  const activeShift = shifts.find(s => !s.endTime) || null;

  const handleClockIn = (location?: { latitude: number; longitude: number }) => {
    if (!user) return;
    const newShift: Shift = {
      id: crypto.randomUUID(),
      userId: user.id,
      startTime: new Date().toISOString(),
      startLocation: location,
    };
    setShifts(prev => [...prev, newShift]);
  };

  const handleClockOut = (notes: string, aiSummary: string, location?: { latitude: number; longitude: number }) => {
    if (!activeShift) return;
    setShifts(prev => prev.map(s => 
      s.id === activeShift.id 
        ? { ...s, endTime: new Date().toISOString(), notes, aiSummary, endLocation: location } 
        : s
    ));
    setTimeout(fetchInsights, 1000);
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando AUTHEX S.A...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <Layout user={null} onLogout={() => {}}>
        <div className="max-w-md mx-auto mt-12 px-4">
          <div className="text-center mb-10">
            <i className="fas fa-briefcase text-5xl text-indigo-600 mb-4"></i>
            <h1 className="text-3xl font-bold text-slate-900">AUTHEX S.A</h1>
            <p className="text-slate-500">Gestión de Presencia y Control Horario</p>
          </div>
          {showRegister ? (
            <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user!} onLogout={handleLogout}>
      {user?.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <ClockPanel 
              activeShift={activeShift} 
              onClockIn={handleClockIn} 
              onClockOut={handleClockOut} 
            />
            
            {insights && (
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <i className="fas fa-sparkles"></i>
                    Análisis de IA
                  </h3>
                  {isRefreshingInsights && <i className="fas fa-circle-notch fa-spin text-indigo-300"></i>}
                </div>
                <p className="text-indigo-50 text-sm leading-relaxed italic">
                  "{insights}"
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <StatisticsDashboard shifts={shifts} user={user!} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Jornadas</span>
                  <div className="text-xl font-bold text-slate-900">{shifts.filter(s => s.endTime).length}</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeShift ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  <i className="fas fa-user-clock"></i>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Estado</span>
                  <div className={`text-xl font-bold ${activeShift ? 'text-green-600' : 'text-slate-400'}`}>
                    {activeShift ? 'Fichado' : 'Ausente'}
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <i className="fas fa-door-open"></i>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Últ. Salida</span>
                  <div className="text-xl font-bold text-slate-900">
                    {shifts.find(s => s.endTime) ? new Date(shifts.find(s => s.endTime)!.endTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </div>
                </div>
              </div>
            </div>
            
            <HistoryTable shifts={shifts} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
