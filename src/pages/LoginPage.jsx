import React, { useState } from 'react';
import { BookOpen, User, Lock, Loader2 } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const user = await res.json();
                onLogin(user);
            } else {
                setError('Email o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', width: '100%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop') center/cover`,
            color: 'white'
        }}>
            <div style={{ 
                width: '100%', maxWidth: '400px', 
                background: 'rgba(20, 20, 23, 0.6)', backdropFilter: 'blur(20px)',
                padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                        width: '64px', height: '64px', margin: '0 auto 16px', 
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                    }}>
                        <BookOpen size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Bienvenido a Brauni</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Sistema de Gestión Bibliotecaria</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={20} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="email" placeholder="Correo electrónico" 
                            value={email} onChange={e => setEmail(e.target.value)}
                            required
                            style={{ 
                                width: '100%', padding: '16px 16px 16px 48px', 
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', outline: 'none', fontSize: '16px',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <Lock size={20} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="password" placeholder="Contraseña"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required
                            style={{ 
                                width: '100%', padding: '16px 16px 16px 48px', 
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', outline: 'none', fontSize: '16px',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                    <button 
                         type="submit" 
                         disabled={loading}
                         style={{ 
                             padding: '16px', background: 'white', color: 'black', 
                             borderRadius: '12px', fontWeight: 'bold', fontSize: '16px',
                             cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                             transition: 'transform 0.1s'
                         }}>
                         {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Iniciar Sesión'}
                    </button>
                    
                    <a href="#" style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>¿Olvidaste tu contraseña?</a>
                </form>
            </div>
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginPage;
