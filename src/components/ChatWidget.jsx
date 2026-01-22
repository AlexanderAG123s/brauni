import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';

const ChatWidget = ({ onUnreadChange, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bienvenido. Soy Hatsune Miku, tu asistente bibliotecaria. ¿En qué puedo apoyarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(1);
    const [toastMessage, setToastMessage] = useState(null); // Toast state
    const messagesEndRef = useRef(null);

    // Sync unread count with parent
    useEffect(() => {
        onUnreadChange?.(unreadCount);
    }, [unreadCount, onUnreadChange]);

    // Auto-scroll
    useEffect(() => {
        if (isOpen) {
             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
             setUnreadCount(0);
             setToastMessage(null); // Clear toast on open
        }
    }, [messages, isOpen]);

    // Handle Toast Display
    const showToast = (msg) => {
        if (!isOpen) { 
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 5000); // Hide after 5s
        }
    };

    // Interactive Handlers
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        // Optimistic UI
        setMessages(prev => [...prev, { role: 'system', content: 'Subiendo imagen...', hidden: true }]);

        try {
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            // Send hidden message with URL so AI knows it
            const hiddenMsg = { role: 'user', content: `[SYSTEM: User uploaded image: ${data.url}]` };
            const uiMsg = { role: 'user', content: '📷 Imagen subida exitosamente.' }; 
            
            setMessages(prev => {
                const filtered = prev.filter(m => m.content !== 'Subiendo imagen...');
                return [...filtered, uiMsg];
            });

            // Trigger AI response with the new context
            await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    messages: [...messages, hiddenMsg],
                    user: user ? { role: user.role, id: user.id, name: user.name } : null 
                }) 
            }).then(r => r.json()).then(aiRes => {
                setMessages(prev => [...prev, aiRes]);
            });

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'system', content: 'Error al subir imagen.' }]);
        }
    };

    const handleColorSelect = async (color) => {
        const msgContent = `[SYSTEM: User selected color: ${color}]`;
        const uiMsg = { role: 'user', content: `🎨 Color seleccionado: ${color}` };

        setMessages(prev => [...prev, uiMsg]);

        // Trigger AI
        await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    messages: [...messages, { role: 'user', content: msgContent }],
                    user: user ? { role: user.role, id: user.id, name: user.name } : null 
                }) 
        }).then(r => r.json()).then(aiRes => {
            setMessages(prev => [...prev, aiRes]);
        });
    };

    const renderMessageContent = (content) => {
        if (!content) return null;
        
        // Split by markers - Safer regex
        const parts = content.split(/(\[UPLOAD_BUTTON\]|\[COLOR_PICKER\]|\[GIF:[^\]]+\])/g);
        
        return parts.map((part, index) => {
            if (part === '[UPLOAD_BUTTON]') {
                return (
                    <div key={index} style={{ margin: '10px 0' }}>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            style={{ display: 'none' }} 
                            id="chat-upload"
                        />
                        <label htmlFor="chat-upload" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', background: 'var(--primary)', color: 'white',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                        }}>
                            <Sparkles size={16} /> Subir Imagen
                        </label>
                    </div>
                );
            }
            if (part === '[COLOR_PICKER]') {
                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
                return (
                    <div key={index} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0' }}>
                        {colors.map(c => (
                            <div 
                                key={c}
                                onClick={() => handleColorSelect(c)}
                                style={{
                                    width: '24px', height: '24px', borderRadius: '50%', background: c,
                                    cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            />
                        ))}
                    </div>
                );
            }
            // GIF Rendering
            if (part.startsWith('[GIF:')) {
                const url = part.replace('[GIF:', '').replace(']', '').trim();
                return (
                    <div key={index} style={{ margin: '12px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <img 
                            src={url} 
                            alt="Miku Reaction" 
                            style={{ width: '100%', display: 'block', objectFit: 'cover' }} 
                            loading="lazy"
                        />
                    </div>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };
    
    // Proactive Notifications (Poll every 10s for demo)
    useEffect(() => {
        const checkNotifications = () => {
             fetch(`${API_BASE_URL}/api/notifications`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            const msg = `🎶 ¡Atención! Encontré ${data.length} préstamos vencidos. Por favor revisa los reportes.`;
                            if (last.role === 'assistant' && last.content === msg) return prev;
                            
                            if (!isOpen) { setUnreadCount(c => c + 1); showToast(msg); }
                            return [...prev, { role: 'assistant', content: msg }];
                        });
                    } else {
                        // Occasional "Presence" Messages
                        if (Math.random() > 0.6) { 
                             const idlePhrases = [
                                 "¡Estoy aquí en la biblioteca digital si me necesitas!",
                                 "No olvides organizar las nuevas llegadas.",
                                 "¿Están todos los libros en orden?",
                                 "Ordenar datos es muy divertido~",
                                 "🎵 ¿Necesitas ayuda con el catálogo?"
                             ];
                             const randomPhrase = idlePhrases[Math.floor(Math.random() * idlePhrases.length)];
                             
                             setMessages(prev => {
                                const last = prev[prev.length - 1];
                                if (last.role === 'assistant' && idlePhrases.includes(last.content)) return prev; 
                                
                                if (!isOpen) { setUnreadCount(c => c + 1); showToast(randomPhrase); }
                                return [...prev, { role: 'assistant', content: randomPhrase }];
                             });
                        }
                    }
                })
                .catch(() => {});
        };

        setTimeout(checkNotifications, 2000);
        const interval = setInterval(checkNotifications, 10000); 
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    messages: [...messages, newMsg],
                    user: user ? { role: user.role, id: user.id, name: user.name } : null 
                }) 
            });
            const data = await res.json();
            
            if (res.ok) {
                 setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
                 
                 // Trigger global update (for tools like add_book, delete_book)
                 // We could parse if a tool was used, but for simplicity, any AI response might imply a change
                 // or we can rely on the server confirming the action. 
                 // A safer lightweight approach: Always dispatch strictly on tool success? 
                 // The backend executes tools and returns a message. If the AI says "Book deleted" or similar, we probably want to refresh.
                 // Given the complexity of parsing, let's just trigger a soft refresh on every successful AI turn 
                 // OR we can make the backend return a "should_refresh" flag? 
                 // Let's stick to the simplest frontend-only fix: Dispatch event on every successful AI response to be safe.
                 window.dispatchEvent(new Event('library-updated'));
            } else {
                 setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error de comunicación.' }]);
            }

        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
            
            {/* Widget Window */}
            {isOpen && (
                <div style={{ 
                    width: '350px', height: '500px', background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-elevation)',
                    border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column',
                    marginBottom: '20px', overflow: 'hidden', animation: 'slideUp 0.3s ease'
                }}>
                   {/* ... Header & Body same as before ... */} 
                   <div style={{ 
                        padding: '16px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                                <div style={{ width: '100%', height: '100%', background: '#39c5bb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Try to use local image, fallback to icon */}
                                    <img src="/src/assets/miku.jpg" 
                                         onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                         alt="Miku"
                                    />
                                    <Bot size={20} color="white" style={{ display: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>Hatsune Miku</h4>
                                <div style={{ fontSize: '10px', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }}></span> En línea
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
                    </div>

                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ 
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
                                borderBottomLeftRadius: m.role === 'assistant' ? '2px' : '12px',
                                background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-app)',
                                color: m.role === 'user' ? 'var(--bg-app)' : 'var(--text-primary)',
                                border: m.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                                fontSize: '13px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', padding: '10px', background: 'var(--bg-app)', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                                <span className="dot-blink" style={{ animationDelay: '0s' }}>•</span>
                                <span className="dot-blink" style={{ animationDelay: '0.2s' }}>•</span>
                                <span className="dot-blink" style={{ animationDelay: '0.4s' }}>•</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                        <input 
                            placeholder="Escribe una instrucción..." 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            autoFocus
                            style={{ 
                                flex: 1, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', 
                                borderRadius: '20px', padding: '10px 16px', color: 'white', outline: 'none', fontSize: '13px'
                            }}
                        />
                        <button 
                             onClick={handleSend}
                             disabled={loading}
                             style={{ 
                                 width: '40px', height: '40px', borderRadius: '50%', 
                                 background: 'var(--primary)', color: 'var(--bg-app)',
                                 display: 'flex', alignItems: 'center', justifyContent: 'center'
                             }}>
                             <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button Container for Closed State */}
            {!isOpen && (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    
                    {/* TOAST MESSAGE BUBBLE */}
                    {toastMessage && (
                        <div style={{ 
                            position: 'absolute', right: '80px', bottom: '0px', 
                            background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px',
                            borderBottomRightRadius: '4px',
                            boxShadow: 'var(--shadow-elevation)', border: '1px solid var(--primary)',
                            maxWidth: '320px', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            display: 'flex', flexDirection: 'column', gap: '6px'
                        }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 {/* Avatar in Toast */}
                                 <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                                      <img src="/src/assets/miku.jpg" 
                                           onError={(e) => { e.target.style.display='none'; }}
                                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                           alt="Miku"
                                      />
                                      <Bot size={16} color="var(--primary)" style={{ display: 'block' }} /> 
                                 </div>
                                 <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>Hatsune Miku</div>
                             </div>
                             <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{toastMessage}</div>
                        </div>
                    )}

                    <button 
                        onClick={() => setIsOpen(true)}
                        className="miku-btn"
                        style={{ 
                            width: '60px', height: '60px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/src/assets/miku.jpg" 
                                 alt="Miku" 
                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {unreadCount > 0 && (
                                <span className="notification-badge" style={{ 
                                    position: 'absolute', top: '-6px', right: '-6px', 
                                    minWidth: '22px', height: '22px', background: '#ef4444', 
                                    borderRadius: '50%', color: 'white', fontSize: '12px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                                    border: '2px solid var(--bg-card)', zIndex: 10
                                }}>{unreadCount}</span>
                            )}
                        </div>
                        <div className="btn-glow"></div>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="miku-tooltip">Hatsune Miku IA</div>
                </div>
            )}
            
            <style>{`
                .dot-blink { font-size: 20px; line-height: 10px; animation: blink 1.4s infinite; opacity: 0; }
                @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
                @keyframes popIn { from { opacity: 0; transform: scale(0.8) translateX(-10px); } to { opacity: 1; transform: scale(1) translateX(0); } }
                .miku-btn { transition: transform 0.2s; }
                .miku-btn:hover { transform: scale(1.1); }
                .notification-badge { animation: pulseRed 2s infinite; }
                @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
                .btn-glow {
                    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                    background: radial-gradient(circle, rgba(57, 197, 187, 0.4) 0%, transparent 70%);
                    animation: pulseGlow 3s infinite;
                    pointer-events: none; z-index: 1;
                }
                @keyframes pulseGlow { 0% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 0.8; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.8); } }
                
                /* Tooltip Styles */
                .miku-tooltip {
                    position: absolute;
                    right: 75px;
                    background: var(--bg-card);
                    color: var(--primary);
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: bold;
                    white-space: nowrap;
                    box-shadow: var(--shadow-elevation);
                    border: 1px solid var(--border-subtle);
                    opacity: 0;
                    transform: translateX(10px) scale(0.9);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transition-delay: 0.1s;
                    pointer-events: none;
                }
                .miku-btn:hover + .miku-tooltip {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                    transition-delay: 0.5s; /* Delay before appearing */
                }
            `}</style>
        </div>
    );
};
            


export default ChatWidget;
