
import React, { useEffect, useRef, useMemo } from 'react';
import { Shift, User } from '../types';

interface StatisticsDashboardProps {
  shifts: Shift[];
  user: User;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ shifts, user }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const stats = useMemo(() => {
    const completedShifts = shifts.filter(s => s.endTime);
    
    // Group by day for the last 7 days
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days[d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })] = 0;
    }

    let totalHoursThisWeek = 0;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    startOfWeek.setHours(0, 0, 0, 0);

    completedShifts.forEach(shift => {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime!);
      const hours = (end.getTime() - start.getTime()) / 3600000;
      
      const label = start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      if (last7Days.hasOwnProperty(label)) {
        last7Days[label] += hours;
      }

      if (start >= startOfWeek) {
        totalHoursThisWeek += hours;
      }
    });

    return {
      dailyLabels: Object.keys(last7Days),
      dailyValues: Object.values(last7Days),
      totalHoursThisWeek: totalHoursThisWeek.toFixed(1)
    };
  }, [shifts]);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // @ts-ignore (Chart is loaded via CDN)
        chartInstance.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: stats.dailyLabels,
            datasets: [{
              label: 'Horas Trabajadas',
              data: stats.dailyValues,
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              borderColor: 'rgba(79, 70, 229, 1)',
              borderWidth: 2,
              borderRadius: 8,
              barThickness: 32,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context: any) => `${context.parsed.y.toFixed(2)} horas`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { color: '#94a3b8' }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
              }
            }
          }
        });
      }
    }
  }, [stats]);

  const exportToCSV = () => {
    const headers = ["Fecha", "Inicio", "Fin", "Duración (Horas)", "Notas"];
    const rows = shifts.filter(s => s.endTime).map(s => [
      new Date(s.startTime).toLocaleDateString('es-ES'),
      new Date(s.startTime).toLocaleTimeString('es-ES'),
      new Date(s.endTime!).toLocaleTimeString('es-ES'),
      ((new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()) / 3600000).toFixed(2),
      (s.aiSummary || s.notes || "").replace(/,/g, " ")
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fichajes_AUTHEX_${user.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-chart-line text-indigo-500"></i>
            Estadísticas Semanales
          </h3>
          <p className="text-sm text-slate-500">Resumen de actividad de los últimos 7 días</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-green-100"
        >
          <i className="fas fa-file-excel"></i>
          Exportar a Google Sheets (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Horas esta semana</span>
          <div className="text-3xl font-bold text-indigo-600">{stats.totalHoursThisWeek}h</div>
          <div className="mt-2 text-[10px] text-slate-400 uppercase font-bold">Objetivo: 40h</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min((parseFloat(stats.totalHoursThisWeek) / 40) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="md:col-span-3 h-48 relative">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
