import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { BarChart3, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Calendar, BookOpen } from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
     const fetchStats = () => {
         fetch('http://localhost:3000/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
     };

     fetchStats();
     window.addEventListener('library-updated', fetchStats);
     return () => window.removeEventListener('library-updated', fetchStats);
  }, []);

  if (!stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando estadísticas...</div>;

  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Análisis & Reportes</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Métricas en tiempo real</p>
          </div>
          <button style={{ 
             display: 'flex', alignItems: 'center', gap: '8px',
             padding: '8px 16px', borderRadius: 'var(--radius-md)', 
             border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)'
          }}>
             <Calendar size={16} /> Últimos 6 meses
          </button>
       </div>

       {/* Key Metrics Grid */}
       <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
          <Card>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Préstamos Históricos</span>
                <BarChart3 size={20} color="var(--primary)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.loans}</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center' }}>
                   <ArrowUpRight size={14} /> Activos
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>Total acumulado</span>
             </div>
          </Card>

          <Card>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Usuarios Registrados</span>
                <PieChart size={20} color="var(--primary)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.users}</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Estudiantes y Profesores</span>
             </div>
             <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                 <div style={{ height: '6px', width: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
             </div>
          </Card>

           <Card>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Libros "Perdidos"</span>
                <TrendingUp size={20} color="var(--status-danger)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.lost}</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                 <span style={{ color: 'var(--status-danger)' }}>Requiere Atención</span>
             </div>
          </Card>
       </div>

       {/* Big Chart Area */}
       <Card title="Tendencia de Préstamos (Mensual)" style={{ marginTop: 'var(--space-lg)', minHeight: '400px' }}>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 0', borderBottom: '1px solid var(--border-subtle)' }}>
             {stats.chart && stats.chart.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                   <div 
                      className="bar-animate"
                      style={{ 
                         width: '40px', 
                         height: `${Math.max(item.count * 20, 10)}px`, // Simple scaling
                         background: 'var(--primary)', 
                         borderRadius: '4px 4px 0 0',
                         transition: 'height 1s ease'
                      }}
                   ></div>
                   <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {item.month}
                   </span>
                   <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.count}</span>
                </div>
             ))}
             {stats.chart && stats.chart.length === 0 && <p style={{color: 'var(--text-tertiary)'}}>No hay datos suficientes aún.</p>}
          </div>
       </Card>
       
       <style>{`
          .bar-animate {
             animation: growUp 0.8s ease-out;
          }
          @keyframes growUp {
             from { height: 0; }
          }
       `}</style>
    </div>
  );
};

export default Statistics;
