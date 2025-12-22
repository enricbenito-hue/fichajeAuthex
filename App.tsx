
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

  useEffect(() => {
    const savedUser = localStorage.getItem('authex_active_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAuthStatus('authenticated');
      const savedShifts = localStorage.getItem(`authex_shifts_${parsedUser.id}`);
      if (savedShifts) setShifts(JSON.parse(savedShifts));
    } else {
      setAuthStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`authex_shifts_${user.id}`, JSON.stringify(shifts));
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
    if (authStatus === 'authenticated') fetchInsights();
  }, [authStatus, fetchInsights]);

  const handleRegister = (newUser: User) => {
    const users = JSON.parse(localStorage.getItem('authex_all_users') || '[]');
    if (users.some((u: User) => u.email === newUser.email)) {
      alert('Email ya registrado.'); return;
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
      alert('No se encuentra el usuario.');
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
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf7]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-600 font-bold tracking-widest uppercase text-xs">AUTHEX S.A</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <Layout user={null} onLogout={() => {}}>
        <div className="max-w-md mx-auto mt-16 px-4 animate-in">
          <div className="text-center mb-12 flex flex-col items-center">
            {/* Logotipo Minimalista: Solo Texto en una línea */}
            <div className="flex items-center mb-4">
               <h1 className="text-6xl font-black text-emerald-800 tracking-tighter uppercase flex items-baseline">
                 TOT<span className="ml-2 text-stone-700">HERBA</span>
               </h1>
            </div>
            <div className="w-20 h-1 bg-emerald-800/10 rounded-full"></div>
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
              <div className="bg-gradient-to-br from-emerald-800 to-stone-800 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-900/10 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="font-bold flex items-center gap-2 text-emerald-100">
                    <i className="fas fa-sparkles"></i>
                    Eco-Análisis IA
                  </h3>
                  {isRefreshingInsights && <i className="fas fa-circle-notch fa-spin text-emerald-300"></i>}
                </div>
                <p className="text-stone-100 text-sm leading-relaxed font-medium relative z-10">
                  "{insights}"
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <StatisticsDashboard shifts={shifts} user={user!} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <i className="fas fa-calendar-check text-lg"></i>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] font-bold uppercase block tracking-wider">Registros</span>
                  <div className="text-2xl font-bold text-stone-900">{shifts.filter(s => s.endTime).length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeShift ? 'bg-amber-50 text-amber-700' : 'bg-stone-50 text-stone-400'}`}>
                  <i className="fas fa-mountain text-lg"></i>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] font-bold uppercase block tracking-wider">Estado</span>
                  <div className={`text-2xl font-bold ${activeShift ? 'text-amber-700' : 'text-stone-400'}`}>
                    {activeShift ? 'Activo' : 'Pausa'}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <i className="fas fa-compass text-lg"></i>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] font-bold uppercase block tracking-wider">Últ. Pulso</span>
                  <div className="text-2xl font-bold text-stone-900">
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
