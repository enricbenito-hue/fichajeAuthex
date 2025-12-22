
import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { enhanceShiftSummary } from '../services/geminiService';

interface ClockPanelProps {
  activeShift: Shift | null;
  onClockIn: (location?: { latitude: number; longitude: number }) => void;
  onClockOut: (notes: string, aiSummary: string, location?: { latitude: number; longitude: number }) => void;
}

const ClockPanel: React.FC<ClockPanelProps> = ({ activeShift, onClockIn, onClockOut }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onClockIn({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => onClockIn()
      );
    } else {
      onClockIn();
    }
  };

  const handleClockOut = async () => {
    setIsProcessing(true);
    let enhanced = notes;
    if (notes.trim()) enhanced = await enhanceShiftSummary(notes);

    const finalize = (loc?: { latitude: number; longitude: number }) => {
      onClockOut(notes, enhanced, loc);
      setNotes('');
      setIsProcessing(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => finalize()
      );
    } else finalize();
  };

  const elapsedSeconds = activeShift 
    ? Math.floor((currentTime.getTime() - new Date(activeShift.startTime).getTime()) / 1000)
    : 0;

  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 p-8 flex flex-col items-center overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-800"></div>
      
      <div className="text-center mb-8">
        <h2 className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Tiempo Presente</h2>
        <div className="text-5xl font-mono font-bold text-stone-900 tracking-tighter">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p className="text-stone-500 font-medium text-sm mt-2">{currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {!activeShift ? (
        <button
          onClick={handleClockIn}
          className="w-full sm:w-72 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="fas fa-play text-xl ml-1"></i>
          </div>
          <span className="tracking-wide">Iniciar Jornada</span>
        </button>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
               <i className="fas fa-leaf text-6xl"></i>
            </div>
            <span className="text-emerald-800 text-[10px] font-bold uppercase block mb-1 tracking-widest">En Curso</span>
            <div className="text-4xl font-mono font-bold text-stone-800">
              {formatElapsed(elapsedSeconds)}
            </div>
            <div className="text-stone-400 text-[10px] font-bold mt-2">
              DESDE LAS {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Observaciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Cómo ha ido el día?..."
              className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-800 outline-none transition-all resize-none text-stone-700 placeholder-stone-300"
              rows={3}
            />
          </div>

          <button
            onClick={handleClockOut}
            disabled={isProcessing}
            className={`w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-5 px-8 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-out-alt"></i>}
            <span>Cerrar Jornada</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ClockPanel;
