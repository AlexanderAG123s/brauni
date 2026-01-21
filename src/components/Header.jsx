import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings, ChevronDown, AlertCircle, Bot } from 'lucide-react';

const Header = ({ onSearchClick, user, chatUnreadCount = 0 }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // Fetch Notifications
    useEffect(() => {
        fetch('http://localhost:3000/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                } else {
                    console.error("Notifications API returned non-array:", data);
                    setNotifications([]);
                }
            })
            .catch(err => console.error(err));
    }, []); // In a real app, use polling or sockets

    const totalNotifications = notifications.length + chatUnreadCount;

    return (
        <header style={{ 
            height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 var(--space-xl)', borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)', position: 'sticky', top: 0, zIndex: 10
        }}>
            {/* Search Bar */}
            <div 
               onClick={onSearchClick}
               title="Ctrl + K"
               style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'var(--bg-card)', padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)', width: '100%', maxWidth: '500px',
                  cursor: 'text', color: 'var(--text-tertiary)', transition: 'border-color 0.2s'
               }}
               onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
               onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
                <Search size={18} />
                <span style={{ fontSize: '14px' }}>Buscar en la biblioteca...</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', border: '1px solid var(--border-subtle)', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + K</span>
            </div>

            {/* Right Logic */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                
                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                   <button onClick={() => setShowNotifs(!showNotifs)} style={{ position: 'relative', color: 'var(--text-secondary)' }}>
                       <Bell size={20} />
                       {totalNotifications > 0 && (
                           <div style={{ 
                               position: 'absolute', top: '-2px', right: '-2px', 
                               minWidth: '8px', height: '8px', padding: totalNotifications > 9 ? '0 3px' : '0',
                               background: 'var(--status-danger)', borderRadius: '50%',
                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                               fontSize: '9px', color: 'white', fontWeight: 'bold'
                           }}>
                               {totalNotifications > 9 ? '9+' : ''}
                           </div>
                       )}
                   </button>
                   
                   {/* Dropdown */}
                   {showNotifs && (
                       <div className="dropdown-menu" style={{ width: '320px', right: '-80px' }}>
                           <h4 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                               Notificaciones
                               {totalNotifications > 0 && <span style={{ fontSize: '11px', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '10px' }}>{totalNotifications} nuevas</span>}
                           </h4>
                           
                           {totalNotifications === 0 ? (
                               <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                   Todo al día.
                               </div>
                           ) : (
                               <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                   
                                   {/* Chat Notifications Section */}
                                   {chatUnreadCount > 0 && (
                                       <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(57, 197, 187, 0.05)' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                                                        <img src="/src/assets/miku.jpg" 
                                                             onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                             alt="Miku"
                                                        />
                                                        <div style={{ width: '100%', height: '100%', background: '#39c5bb', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                            <Bot size={16} />
                                                        </div>
                                                    </div>
                                                    <span style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Hatsune Miku</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        Has recibido {chatUnreadCount} {chatUnreadCount === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}.
                                                    </div>
                                                </div>
                                            </div>
                                       </div>
                                   )}

                                   {/* Other Notifications */}
                                   {notifications.map(n => (
                                       <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '10px' }}>
                                           <AlertCircle size={16} color="var(--status-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                           <div>
                                               <div style={{ fontSize: '13px', fontWeight: '500' }}>Préstamo Vencido</div>
                                               <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                   <strong>{n.user_name}</strong> debe devolver <em>{n.book_title}</em> since {new Date(n.due_date).toLocaleDateString()}
                                               </div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}
                </div>

                {/* Vertical Line Separator */}
                <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }}></div>

                {/* Profile */}
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowProfile(!showProfile)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    >
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {user ? user.name.charAt(0) : 'U'}
                        </div>
                        <div style={{ textAlign: 'left', display: 'none', md: 'block' }}> 
                             <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user ? user.name : 'Usuario'}</div>
                             <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user ? user.role : 'Invitado'}</div>
                        </div>
                        <ChevronDown size={14} color="var(--text-tertiary)" />
                    </button>

                    {/* Profile Dropdown */}
                    {showProfile && (
                        <div className="dropdown-menu" style={{ width: '180px', right: 0 }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user ? user.name : 'Usuario'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user ? user.email : ''}</div>
                            </div>
                            <button className="dropdown-item">
                                <Settings size={14} /> Configuración
                            </button>
                            <button className="dropdown-item" style={{ color: 'var(--status-danger)' }}>
                                <LogOut size={14} /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Global Dropdown Styles */}
            <style>{`
                .dropdown-menu {
                    position: absolute; top: 100%; marginTop: 10px;
                    background: var(--bg-card); border: 1px solid var(--border-subtle);
                    borderRadius: var(--radius-md); boxShadow: var(--shadow-elevation);
                    zIndex: 50; animation: slideDown 0.2s ease;
                }
                .dropdown-item {
                    width: 100%; padding: 10px 16px; display: flex; alignItems: center; gap: 8px;
                    fontSize: 13px; color: var(--text-primary); transition: background 0.1s;
                }
                .dropdown-item:hover { background: var(--bg-card-hover); }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </header>
    );
};

export default Header;
