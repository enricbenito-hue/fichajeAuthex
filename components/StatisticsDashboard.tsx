
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
      const hours = (new Date(shift.endTime!).getTime() - start.getTime()) / 3600000;
      const label = start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      if (last7Days.hasOwnProperty(label)) last7Days[label] += hours;
      if (start >= startOfWeek) totalHoursThisWeek += hours;
    });

    return {
      dailyLabels: Object.keys(last7Days),
      dailyValues: Object.values(last7Days),
      totalHoursThisWeek: totalHoursThisWeek.toFixed(1)
    };
  }, [shifts]);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // @ts-ignore
        chartInstance.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: stats.dailyLabels,
            datasets: [{
              label: 'Horas',
              data: stats.dailyValues,
              backgroundColor: '#065f46',
              hoverBackgroundColor: '#064e3b',
              borderRadius: 12,
              barThickness: 24,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { display: false }, ticks: { color: '#a8a29e' } },
              x: { grid: { display: false }, ticks: { color: '#78716c' } }
            }
          }
        });
      }
    }
  }, [stats]);

  const exportToCSV = () => {
    const headers = ["Fecha", "Duración", "Notas"];
    const rows = shifts.filter(s => s.endTime).map(s => [
      new Date(s.startTime).toLocaleDateString('es-ES'),
      ((new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()) / 3600000).toFixed(2),
      (s.aiSummary || s.notes || "").replace(/,/g, " ")
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fichaje_TOT_HERBA_${user.name}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-stone-800 flex items-center gap-3">
            <i className="fas fa-chart-pie text-emerald-700"></i>
            Resumen de Actividad
          </h3>
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Crecimiento Semanal</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition-all"
        >
          <i className="fas fa-cloud-download-alt"></i>
          Descargar Datos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 bg-stone-50 p-6 rounded-[2rem] border border-stone-100 flex flex-col justify-center">
          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Acumulado</span>
          <div className="text-4xl font-bold text-emerald-800">{stats.totalHoursThisWeek}h</div>
          <div className="w-full bg-stone-200 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-800 h-full transition-all duration-1000" style={{ width: `${Math.min((parseFloat(stats.totalHoursThisWeek) / 40) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="md:col-span-3 h-56 relative">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
