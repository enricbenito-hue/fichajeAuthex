
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
    if (notes.trim()) {
      enhanced = await enhanceShiftSummary(notes);
    }

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
    } else {
      finalize();
    }
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Hora Actual</h2>
        <div className="text-4xl font-mono font-bold text-slate-900">
          {currentTime.toLocaleTimeString()}
        </div>
        <p className="text-slate-400 text-sm mt-1">{currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {!activeShift ? (
        <button
          onClick={handleClockIn}
          className="w-full sm:w-64 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
        >
          <i className="fas fa-play text-2xl"></i>
          <span>Iniciar Jornada</span>
        </button>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 text-center">
            <span className="text-indigo-600 text-xs font-bold uppercase block mb-1">Tiempo Transcurrido</span>
            <div className="text-3xl font-mono font-bold text-indigo-700">
              {formatElapsed(elapsedSeconds)}
            </div>
            <div className="text-slate-500 text-xs mt-2">
              Iniciado a las {new Date(activeShift.startTime).toLocaleTimeString()}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Resumen de tareas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué has hecho hoy? La IA mejorará tu resumen..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleClockOut}
            disabled={isProcessing}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-stop"></i>
            )}
            <span>Terminar Jornada</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ClockPanel;
