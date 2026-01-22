import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import RecentActivity from '../components/RecentActivity';
import { API_BASE_URL } from '../config';
import { 
   Zap, PlusCircle, UserPlus, BookOpen, 
   CheckSquare, Clock, AlertCircle, ArrowRight,
   Sun, Loader2
} from 'lucide-react';

const Overview = ({ setActiveView, user }) => {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);

  useEffect(() => {
     fetch(`${API_BASE_URL}/api/stats`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error(err));

     fetch(`${API_BASE_URL}/api/loans`)
        .then(res => res.json())
        .then(data => setRecentLoans(data))
        .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Hero / Greeting Section */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
         <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sun color="var(--status-warning)" />
            Buenos días, {user ? user.name.split(' ')[0] : 'Bibliotecario'}
         </h1>
         <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Aquí tienes el resumen de hoy y algunas sugerencias para empezar.
         </p>
      </div>

      {/* Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
         <ActionCard icon={PlusCircle} label="Nuevo Préstamo" color="var(--primary)" onClick={() => setActiveView('Préstamos')} />
         <ActionCard icon={UserPlus} label="Registrar Usuario" color="#8b5cf6" onClick={() => setActiveView('Usuarios')} />
         <ActionCard icon={BookOpen} label="Catálogo Rápido" color="#10b981" onClick={() => setActiveView('Libros')} />
         <ActionCard icon={Zap} label="Ver Estadísticas" color="#f59e0b" onClick={() => setActiveView('Estadísticas')} />
      </div>

      {/* Dashboard Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
         
         {/* Left Col: Suggestions / ToDo */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <Card title="Sugerencias & Pendientes">
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <SuggestionItem icon={Clock} color="var(--status-warning)" title="Revisar devoluciones" desc="Verificar libros prestados que vencen hoy." />
                  <SuggestionItem icon={CheckSquare} color="var(--status-success)" title="Sistema optimizado" desc="La base de datos está respondiendo correctamente." />
               </div>
            </Card>
            
            <RecentActivity loans={recentLoans} />
         </div>

         {/* Right Col: Stats & Shortcuts */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            
            {/* Real Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)' }}>
                <Card>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Libros Prestados (Activos)</div>
                   <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats ? stats.active_loans : '-'}</div>
                   <div style={{ height: '4px', background: 'var(--bg-card-hover)', marginTop: '10px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: stats ? (stats.active_loans / (stats.books||1)) * 100 + '%' : '0%', height: '100%', background: 'var(--primary)', transition: 'width 1s' }}></div>
                   </div>
                </Card>
                <Card>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Usuarios Totales</div>
                   <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats ? stats.users : '-'}</div>
                </Card>
            </div>

            <Card title="Atajos Rápidos" style={{ flex: 1 }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ShortcutItem label="Ver Catálogo Completo" onClick={() => setActiveView('Libros')} />
                  <ShortcutItem label="Administrar Usuarios" onClick={() => setActiveView('Usuarios')} />
                  <ShortcutItem label="Ir a Recepción" onClick={() => setActiveView('Préstamos')} />
                  
                  <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                     <div style={{ padding: '16px', background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'white' }}>💡 Pro Tip</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                           Presiona <strong>Ctrl + K</strong> para buscar cualquier libro o usuario rápidamente.
                        </p>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon: Icon, label, color, onClick }) => (
   <button onClick={onClick} className="action-card" style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      gap: '12px', padding: '24px', background: 'var(--bg-card)', 
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
      transition: 'all 0.2s ease', cursor: 'pointer', textAlign: 'center'
   }}>
      <div style={{ 
         width: '48px', height: '48px', borderRadius: '50%', 
         background: `color-mix(in srgb, ${color} 15%, transparent)`, 
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         color: color
      }}>
         <Icon size={24} />
      </div>
      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{label}</span>
      <style>{`
         .action-card:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
            box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
         }
      `}</style>
   </button>
);

const SuggestionItem = ({ icon: Icon, color, title, desc }) => (
   <div style={{ display: 'flex', gap: '16px', alignItems: 'start', padding: '12px', borderRadius: '8px', transition: 'background 0.2s', cursor: 'pointer' }} className="suggestion-item">
      <div style={{ padding: '8px', borderRadius: '8px', background: `color-mix(in srgb, ${color} 10%, transparent)`, color: color }}>
         <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
         <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{title}</h4>
         <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
      <style>{`
         .suggestion-item:hover {
            background: var(--bg-card-hover);
         }
      `}</style>
   </div>
);

const ShortcutItem = ({ label, onClick }) => (
   <button style={{ 
      width: '100%', padding: '12px 16px', textAlign: 'left', 
      background: 'transparent', border: '1px solid var(--border-subtle)', 
      borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)',
      transition: 'all 0.2s', cursor: 'pointer'
   }}
   onClick={onClick}
   onMouseOver={(e) => {
      e.currentTarget.style.borderColor = 'var(--text-primary)';
      e.currentTarget.style.color = 'var(--text-primary)';
   }}
   onMouseOut={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-subtle)';
      e.currentTarget.style.color = 'var(--text-secondary)';
   }}
   >
      {label}
   </button>
);

export default Overview;
