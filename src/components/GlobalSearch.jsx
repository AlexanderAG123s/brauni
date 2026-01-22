import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import Modal from './Modal';
import { Search, Command, Book, User, ArrowRight, X } from 'lucide-react';

const GlobalSearch = ({ isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ books: [], users: [] });
    const [data, setData] = useState({ books: [], users: [] });
    const inputRef = useRef(null);

    // Fetch data once on mount (cache strategy for smoothness)
    useEffect(() => {
        Promise.all([
            fetch('https://brauni-backend.onrender.com/api/books').then(r => r.json()),
            fetch('https://brauni-backend.onrender.com/api/users').then(r => r.json())
        ]).then(([books, users]) => {
            setData({ 
                books: Array.isArray(books) ? books : [], 
                users: Array.isArray(users) ? users : [] 
            });
        }).catch(err => {
            console.error("Global Search fetch error:", err);
            setData({ books: [], users: [] });
        });
    }, []);

    // Autoset focus
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [isOpen]);

    // Handle Search
    useEffect(() => {
        if (!query.trim()) {
            setResults({ books: [], users: [] });
            return;
        }
        const lower = query.toLowerCase();
        const resBooks = data.books.filter(b => b.title.toLowerCase().includes(lower) || b.author.toLowerCase().includes(lower));
        const resUsers = data.users.filter(u => u.name.toLowerCase().includes(lower) || u.matricula.toLowerCase().includes(lower));
        setResults({ books: resBooks, users: resUsers });
    }, [query, data]);

    if (!isOpen) return null;

    const totalResults = results.books.length + results.users.length;

    return (
        <div style={{ 
            position: 'fixed', inset: 0, zIndex: 100, 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'start', padding: '60px 20px'
        }} onClick={onClose}>
            <div style={{ 
                width: '100%', maxWidth: '700px', background: 'var(--bg-app)', 
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', maxHeight: '80vh'
            }} onClick={e => e.stopPropagation()}>
                
                {/* Search Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Search size={24} color="var(--text-secondary)" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar libros, usuarios..." 
                        style={{ 
                            flex: 1, background: 'transparent', border: 'none', 
                            fontSize: '20px', color: 'var(--text-primary)', outline: 'none' 
                        }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ padding: '4px 8px', background: 'var(--bg-card)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-tertiary)' }}>ESC</span>
                    </div>
                </div>

                {/* Results Header */}
                {query && (
                    <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                        [{totalResults}] Resultados coincidentes
                    </div>
                )}

                {/* Results List */}
                <div style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {results.books.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px', letterSpacing: '1px' }}>Libros</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {results.books.map(book => (
                                    <div key={book.id} style={{ 
                                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', 
                                        padding: '12px', cursor: 'pointer', transition: 'transform 0.1s' 
                                    }} className="search-card" onClick={() => { onNavigate('Libros'); onClose(); }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ width: '40px', height: '60px', background: book.cover_color || '#333', borderRadius: '4px' }}></div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{book.author}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.users.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px', letterSpacing: '1px' }}>Usuarios</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {results.users.map(user => (
                                    <div key={user.id} style={{ 
                                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', 
                                        padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' 
                                    }} className="search-card" onClick={() => { onNavigate('Usuarios'); onClose(); }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.matricula}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {query && totalResults === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No se encontraron resultados para "{query}"
                        </div>
                    )}

                    {!query && (
                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                            <Command size={48} style={{ margin: '0 auto 16px' }} />
                            <p>Escribe para buscar en todo el sistema...</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`.search-card:hover { border-color: var(--primary) !important; transform: translateY(-2px); }`}</style>
        </div>
    );
};

export default GlobalSearch;
