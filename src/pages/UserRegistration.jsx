import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import UserDetailModal from '../components/UserDetailModal';
import { Plus, User, Phone, Mail, GraduationCap, MoreVertical, Loader2 } from 'lucide-react';

const UserRegistration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // New state for modal
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    matricula: '',
    career: '',
    email: '',
    phone: ''
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://brauni-backend.onrender.com/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch('https://brauni-backend.onrender.com/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const newUser = await response.json();
          setUsers(prev => [newUser, ...prev]);
          setIsModalOpen(false);
          setFormData({ name: '', matricula: '', career: '', email: '', phone: '' }); // Reset form
        } else {
          alert('Error al registrar. Verifique los datos.');
        }
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Error de conexión con el servidor');
      }
  };

  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Usuarios Registrados</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Administración de estudiantes y personal</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', 
              background: 'var(--text-primary)', 
              color: 'var(--bg-app)', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
            }}>
            <Plus size={20} />
            Nuevo Usuario
          </button>
       </div>

       {/* User Cards Grid */}
       {loading ? (
         <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
         </div>
       ) : (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
            {users.length === 0 ? (
               <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                  No hay usuarios registrados aún.
               </div>
            ) : (
              users.map((user) => (
               <Card key={user.id} className="user-card" style={{ position: 'relative', padding: '24px' }}>
                  <button style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-tertiary)' }}>
                     <MoreVertical size={20} />
                  </button>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                     <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        background: 'var(--border-subtle)', color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px', fontSize: '24px', fontWeight: 'bold'
                     }}>
                        {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
                     </div>
                     <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{user.name}</h3>
                     <span style={{ 
                        padding: '4px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', 
                        fontSize: '12px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)'
                     }}>
                        {user.matricula}
                     </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GraduationCap size={16} />
                        {user.career || 'N/A'}
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Mail size={16} />
                        {user.email || 'N/A'}
                     </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center' }}>
                     <button 
                        onClick={() => setSelectedUser(user)}
                        style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}
                     >
                        Ver Historial & Opciones
                     </button>
                  </div>
               </Card>
              ))
            )}
         </div>
       )}

       {/* Registration Modal */}
       <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Registrar Nuevo Usuario"
       >
          <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-card-hover)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--text-tertiary)', cursor: 'pointer' }}>
                   <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <User size={24} style={{ margin: '0 auto', display: 'block' }} />
                      <span style={{ fontSize: '12px' }}>Subir Foto</span>
                   </div>
                </div>
             </div>
             
             <div>
                <label className="input-label">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="modal-input" 
                  placeholder="Juan Pérez" 
                />
             </div>
             <div>
                <label className="input-label">Matrícula / ID</label>
                <input 
                  type="text" 
                  name="matricula"
                  required
                  value={formData.matricula}
                  onChange={handleInputChange}
                  className="modal-input" 
                  placeholder="A01234567" 
                />
             </div>
             
             <div>
                <label className="input-label">Carrera / Puesto</label>
                <input 
                  type="text" 
                  name="career"
                  value={formData.career}
                  onChange={handleInputChange}
                  className="modal-input" 
                  placeholder="Ingeniería..." 
                />
             </div>
             <div>
                <label className="input-label">Teléfono</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="modal-input" 
                  placeholder="55 5555 5555" 
                />
             </div>
             
             <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Email Institucional</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modal-input" 
                  placeholder="juan@ejemplo.com" 
                />
             </div>

             <div style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}
                >
                   Cancelar
                </button>
                <button 
                   type="submit"
                   style={{ 
                      background: 'var(--text-primary)', color: 'var(--bg-app)', 
                      padding: '10px 24px', borderRadius: 'var(--radius-md)', fontWeight: '600'
                   }}>
                   Guardar Usuario
                </button>
             </div>
          </form>
       </Modal>

       {/* User Detail & History Modal */}
       <UserDetailModal 
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUpdate={(updatedUser) => {
             setUsers(prev => prev.map(u => u.id === updatedUser.id ? {...u, ...updatedUser} : u));
          }}
          onDelete={async (id) => {
             try {
                await fetch(`https://brauni-backend.onrender.com/api/users/${id}`, { method: 'DELETE' });
                setUsers(prev => prev.filter(u => u.id !== id));
                setSelectedUser(null);
             } catch (err) { alert('Error deleting'); }
          }}
       />
       
       <style>{`
          .input-label {
             display: block;
             font-size: 13px;
             margin-bottom: 8px;
             color: var(--text-secondary);
          }
          .modal-input {
             width: 100%;
             padding: 10px;
             background: var(--bg-app);
             border: 1px solid var(--border-subtle);
             border-radius: var(--radius-sm);
             color: var(--text-primary);
             outline: none;
          }
          .modal-input:focus {
             border-color: var(--primary);
          }
          .animate-spin {
             animation: spin 1s linear infinite;
          }
          @keyframes spin {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
          }
       `}</style>
    </div>
  );
};

export default UserRegistration;
