import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../config';
import { User, Shield, Trash2, Plus, Loader2, Mail, Lock, CheckCircle, BadgeCheck } from 'lucide-react';

const Librarians = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Bibliotecario' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = () => {
        fetch(`${API_BASE_URL}/api/staff`)
            .then(res => res.json())
            .then(data => { setStaff(data); setLoading(false); })
            .catch(err => console.error(err));
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar bibliotecario?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/staff/${id}`, { method: 'DELETE' });
            fetchStaff();
        } catch(e) { alert('Error'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/staff`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'Bibliotecario' });
                fetchStaff();
            } else {
                alert('Error al crear usuario');
            }
        } catch(e) { alert('Error de conexión'); }
        setIsSubmitting(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <div>
                   <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Gestión de Bibliotecarios</h2>
                   <p style={{ color: 'var(--text-secondary)' }}>Administra el acceso del personal al sistema</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{ display: 'flex', gap: '8px', padding: '10px 20px', background: 'var(--primary)', color: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontWeight: '600' }}
                >
                   <Plus size={18} /> Nuevo Usuario
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {staff.map(user => (
                    <Card key={user.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                             <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '50%', 
                                    background: user.role === 'Admin' ? 'var(--primary)' : 'var(--bg-card-hover)',
                                    color: user.role === 'Admin' ? 'var(--bg-app)' : 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                             }}>
                                    {user.role === 'Admin' ? <Shield size={24} /> : <User size={24} />}
                             </div>
                             {(
                                <button onClick={() => handleDelete(user.id)} style={{ color: 'var(--status-danger)', opacity: 0.6, cursor: 'pointer', padding: '4px' }} title="Eliminar">
                                    <Trash2 size={16} />
                                </button>
                             )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                             <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.name}</h3>
                             <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{user.email}</p>
                             
                             <div style={{ display: 'flex', gap: '8px' }}>
                                 <Badge text={user.role} active={user.role === 'Admin'} />
                                 <Badge text="Activo" active={true} color="var(--status-success)" />
                             </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            Registrado: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Miembro del Staff">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Role Selection Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                         <RoleCard 
                            role="Bibliotecario" 
                            selected={formData.role === 'Bibliotecario'} 
                            onClick={() => setFormData({...formData, role: 'Bibliotecario'})}
                            icon={User}
                            description="Acceso básico a préstamos y devoluciones."
                         />
                         <RoleCard 
                            role="Admin" 
                            selected={formData.role === 'Admin'} 
                            onClick={() => setFormData({...formData, role: 'Admin'})}
                            icon={Shield}
                            description="Control total del sistema y usuarios."
                         />
                    </div>

                    {/* Inputs */}
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <div className="input-wrapper">
                            <User size={18} />
                            <input 
                                placeholder="Ej. Juan Pérez" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input 
                                placeholder="correo@brauni.edu" 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input 
                                placeholder="••••••••" 
                                type="password"
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{ 
                            padding: '14px', background: 'var(--primary)', color: 'var(--bg-app)', 
                            borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            marginTop: '10px'
                        }}
                    >
                        {isSubmitting ? <Loader2 className="spin" size={18} /> : <CheckCircle size={18} />}
                        Confirmar Registro
                    </button>
                </form>
            </Modal>

            <style>{`
                .form-group label { display: block; font-size: 13px; color: var(--text-secondary); marginBottom: 8px; font-weight: 500; }
                .input-wrapper { 
                    display: flex; alignItems: center; gap: 12px; padding: 12px; 
                    background: var(--bg-card); border: 1px solid var(--border-subtle); 
                    borderRadius: var(--radius-md); transition: border-color 0.2s;
                    color: var(--text-tertiary);
                }
                .input-wrapper:focus-within { border-color: var(--primary); color: var(--primary); }
                .input-wrapper input { 
                    flex: 1; background: transparent; border: none; outline: none; 
                    color: var(--text-primary); font-size: 14px; 
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const Badge = ({ text, active, color }) => (
    <span style={{ 
        fontSize: '11px', padding: '4px 10px', borderRadius: '12px', fontWeight: '500',
        background: active ? (color ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--bg-card)') : 'transparent',
        border: `1px solid ${active ? (color || 'var(--text-primary)') : 'var(--border-subtle)'}`,
        color: active ? (color || 'var(--text-primary)') : 'var(--text-secondary)'
    }}>
        {text}
    </span>
);

const RoleCard = ({ role, selected, onClick, icon: Icon, description }) => (
    <div 
        onClick={onClick}
        style={{ 
            padding: '16px', borderRadius: 'var(--radius-md)', border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-subtle)'}`,
            background: selected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            cursor: 'pointer', transition: 'all 0.2s'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Icon size={16} color={selected ? 'var(--primary)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: '600', fontSize: '14px', color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>{role}</span>
            {selected && <BadgeCheck size={16} color="var(--primary)" style={{ marginLeft: 'auto' }} />}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{description}</p>
    </div>
);

export default Librarians;
