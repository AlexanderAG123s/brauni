import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { User, Clock, ShieldAlert, Trash2, Save, Ban } from 'lucide-react';

const UserDetailModal = ({ isOpen, onClose, user, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('history'); // history, edit
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user && isOpen) {
       setFormData({ ...user });
       fetchHistory();
    }
  }, [user, isOpen]);

  const fetchHistory = async () => {
     try {
         const res = await fetch(`https://brauni-backend.onrender.com/api/users/${user.id}/history`);
         if (res.ok) {
             const data = await res.json();
             setHistory(data);
         }
     } catch (err) {
         console.error('Failed history fetch', err);
     }
  };

  const handleUpdate = async () => {
      try {
          const res = await fetch(`https://brauni-backend.onrender.com/api/users/${user.id}`, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(formData)
          });
          if (res.ok) {
              onUpdate(formData); // Update parent state
              onClose();
          }
      } catch (err) {
          alert('Error updating');
      }
  };

  const handleBlock = async () => {
      const newStatus = formData.status === 'Blocked' ? 'Active' : 'Blocked';
      setFormData(prev => ({...prev, status: newStatus}));
      // Auto save? or wait for save button. Let's auto save this action generally or make it explicit.
      // For now, update local form and let user press save? Or dedicated action.
      // Dedicated action is better.
      // ... (Implementation detail simplification: just update form state)
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Administrar: ${user.name}`}>
       <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <button 
             onClick={() => setActiveTab('history')}
             style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'history' ? 'var(--bg-card-hover)' : 'transparent', color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >Historial</button>
          <button 
             onClick={() => setActiveTab('edit')}
             style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'edit' ? 'var(--bg-card-hover)' : 'transparent', color: activeTab === 'edit' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >Opciones • Editar</button>
       </div>

       {activeTab === 'history' && (
           <div>
               {history.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                       <Clock size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                       <p>Sin historial de préstamos reciente.</p>
                   </div>
               ) : (
                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                       <thead>
                           <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                               <th style={{ padding: '10px' }}>Libro</th>
                               <th style={{ padding: '10px' }}>Fecha</th>
                               <th style={{ padding: '10px' }}>Estatus</th>
                           </tr>
                       </thead>
                       <tbody>
                           {history.map(item => (
                               <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                   <td style={{ padding: '10px', color: 'var(--text-primary)' }}>{item.title}</td>
                                   <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{new Date(item.loan_date).toLocaleDateString()}</td>
                                   <td style={{ padding: '10px' }}>
                                       <span style={{ 
                                           padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                                           background: item.status === 'Active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                           color: item.status === 'Active' ? 'var(--status-danger)' : 'var(--status-success)' 
                                       }}>
                                           {item.status === 'Active' ? 'No Devuelto' : 'Devuelto'}
                                       </span>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               )}
           </div>
       )}

       {activeTab === 'edit' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div>
                       <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre</label>
                       <input 
                          value={formData.name || ''} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} 
                        />
                   </div>
                   <div>
                       <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
                       <input 
                          value={formData.email || ''} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} 
                        />
                   </div>
                   <div>
                       <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Estatus</label>
                       <select 
                          value={formData.status || 'Active'} 
                          onChange={e => setFormData({...formData, status: e.target.value})}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} 
                       >
                           <option value="Active">Activo</option>
                           <option value="Blocked">Bloqueado</option>
                       </select>
                   </div>
               </div>

               <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '10px 0' }}></div>

               <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Acciones Peligrosas</h4>
               <div style={{ display: 'flex', gap: '10px' }}>
                   <button 
                      onClick={handleBlock}
                      style={{ flex: 1, padding: '10px', border: '1px solid var(--status-warning)', color: 'var(--status-warning)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Ban size={16} /> {formData.status === 'Blocked' ? 'Desbloquear' : 'Suspender/Bloquear'}
                   </button>
                   <button 
                      onClick={() => { if(confirm('¿Eliminar usuario permanentemente?')) onDelete(user.id); }}
                      style={{ flex: 1, padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Trash2 size={16} /> Eliminar Cuenta
                   </button>
               </div>

               <button 
                  onClick={handleUpdate}
                  style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'var(--primary)', color: 'var(--bg-app)', borderRadius: '6px', fontWeight: 'bold' }}>
                  Guardar Cambios
               </button>
           </div>
       )}
    </Modal>
  );
};

export default UserDetailModal;
