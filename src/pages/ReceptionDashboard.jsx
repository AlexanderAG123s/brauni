import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import RecentActivity from '../components/RecentActivity';
import { Search, UserCheck, BookOpen, ArrowRight, CornerDownLeft, Plus, ScanLine, Clock, CheckCircle, X, Loader2 } from 'lucide-react';

const ReceptionDashboard = () => {
    // UI States
    const [scanState, setScanState] = useState('idle'); // idle, user_found, book_scanned, success
    const [scannedUser, setScannedUser] = useState(null);
    const [scannedBook, setScannedBook] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Data & Search States
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    
    // User Search
    const [userQuery, setUserQuery] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [showUserResults, setShowUserResults] = useState(false);

    // Book Search
    const [bookQuery, setBookQuery] = useState('');
    const [bookResults, setBookResults] = useState([]);
    const [showBookResults, setShowBookResults] = useState(false);
    
    const [selectedDuration, setSelectedDuration] = useState(7); // Default 7 days

    // Fetch Data on Mount
    const fetchData = () => {
        Promise.all([
            fetch('https://brauni-backend.onrender.com/api/users').then(r => r.json()),
            fetch('https://brauni-backend.onrender.com/api/books').then(r => r.json())
        ]).then(([usersData, booksData]) => {
            setUsers(Array.isArray(usersData) ? usersData : []);
            setBooks(Array.isArray(booksData) ? booksData : []);
        }).catch(err => console.error(err));
    };

    useEffect(() => {
        fetchData();
        
        window.addEventListener('library-updated', fetchData);
        return () => window.removeEventListener('library-updated', fetchData);
    }, [scanState]);

    // User Filter
    useEffect(() => {
        if (userQuery.trim().length > 0 && Array.isArray(users)) {
            const lower = userQuery.toLowerCase();
            const results = users.filter(u => 
                u.name.toLowerCase().includes(lower) || 
                u.matricula.toLowerCase().includes(lower)
            );
            setUserResults(results.slice(0, 5));
            setShowUserResults(true);
        } else {
            setUserResults([]);
            setShowUserResults(false);
        }
    }, [userQuery, users]);

    // Book Filter
    useEffect(() => {
        if (bookQuery.trim().length > 0 && Array.isArray(books)) {
            const lower = bookQuery.toLowerCase();
            const results = books.filter(b => 
                (b.title.toLowerCase().includes(lower) || 
                b.author.toLowerCase().includes(lower) ||
                (b.isbn && b.isbn.includes(lower))) &&
                b.status === 'Available' // Only show available books
            );
            setBookResults(results.slice(0, 5));
            setShowBookResults(true);
        } else {
            setBookResults([]);
            setShowBookResults(false);
        }
    }, [bookQuery, books]);

    const handleSelectUser = (user) => {
        setScannedUser(user);
        setScanState('user_found');
        setUserQuery('');
        setShowUserResults(false);
    };

    const handleSelectBook = (book) => {
        setScannedBook(book);
        setScanState('book_scanned');
        setBookQuery('');
        setShowBookResults(false);
    };

    const confirmLoan = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://brauni-backend.onrender.com/api/loans', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ user_id: scannedUser.id, book_id: scannedBook.id, days: selectedDuration })
            });

            if (res.ok) {
                // Show Toast Notification (Simulated for now, or global if context existed)
                alert(`Préstamo registrado por ${selectedDuration} días.`);
                setScanState('success');
                setTimeout(() => {
                    resetProcess();
                }, 2000);
            } else {
                alert('Error al procesar préstamo');
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        setScanState('idle');
        setScannedUser(null);
        setScannedBook(null);
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', minHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Recepción & Circulación</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Control de préstamos y devoluciones</p>
            </header>

            {/* GLOBAL USER SEARCH */}
            {scanState === 'idle' && (
                <div style={{ marginBottom: 'var(--space-xl)', position: 'relative', zIndex: 20 }}>
                    <div style={{ 
                        display: 'flex', gap: 'var(--space-md)', 
                        background: 'var(--bg-card)', padding: 'var(--space-md)', 
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <ScanLine size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input 
                                type="text" 
                                placeholder="Escanear credencial o buscar usuario (Nombre/Matrícula)..." 
                                className="scan-input"
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                style={{ 
                                    width: '100%', padding: '16px 16px 16px 50px', 
                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', 
                                    background: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none',
                                    fontSize: '16px'
                                }} 
                            />
                            {/* User Suggestions */}
                            {showUserResults && userResults.length > 0 && (
                                <div style={{ 
                                    position: 'absolute', top: '100%', left: 0, right: 0, 
                                    marginTop: '8px', background: 'var(--bg-card)', 
                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                                    boxShadow: 'var(--shadow-elevation)'
                                }}>
                                    {userResults.map(user => (
                                        <div 
                                            key={user.id}
                                            onClick={() => handleSelectUser(user)}
                                            className="search-item"
                                            style={{ 
                                                padding: '16px', display: 'flex', gap: '12px', alignItems: 'center',
                                                cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)'
                                            }}
                                        >
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.matricula}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-xl)', flex: 1 }}>
                
                {/* Active Loan Canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <Card style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                        
                        {scanState !== 'idle' && (
                            <button onClick={resetProcess} style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px', borderRadius: '50%', background: 'var(--bg-card-hover)', color: 'var(--text-tertiary)' }}>
                                <X size={20} />
                            </button>
                        )}

                        {scanState === 'idle' && (
                            <div style={{ textAlign: 'center', opacity: 0.4 }}>
                                <ScanLine size={64} style={{ margin: '0 auto 20px' }} />
                                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Esperando Usuario</h3>
                            </div>
                        )}

                        {scanState === 'success' && (
                             <div style={{ textAlign: 'center', color: 'var(--status-success)' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <CheckCircle size={40} />
                                </div>
                                <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-primary)' }}>Préstamo Guardado</h3>
                            </div>
                        )}

                        {(scanState === 'user_found' || scanState === 'book_scanned') && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.3s ease' }}>
                                {/* User Card */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-focus)' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                                        {scannedUser.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '18px' }}>{scannedUser.name}</h4>
                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{scannedUser.matricula}</span>
                                    </div>
                                </div>

                                {/* Connector */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ArrowRight style={{ transform: 'rotate(90deg)' }} color="var(--border-focus)" />
                                </div>

                                {/* BOOK SELECTION AREA */}
                                {scanState === 'user_found' ? (
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Seleccionar Libro</label>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                            <input 
                                                type="text" 
                                                value={bookQuery}
                                                onChange={(e) => setBookQuery(e.target.value)}
                                                placeholder="Buscar libro disponible por título..." 
                                                autoFocus
                                                style={{ 
                                                    width: '100%', padding: '14px 14px 14px 40px', 
                                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', 
                                                    background: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none',
                                                    boxShadow: '0 0 0 2px rgba(255,255,255,0.1)'
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Book Autocomplete */}
                                        {showBookResults && bookResults.length > 0 && (
                                            <div style={{ 
                                                position: 'absolute', top: '100%', left: 0, right: 0, 
                                                marginTop: '8px', background: 'var(--bg-card)', 
                                                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                                                boxShadow: 'var(--shadow-elevation)', zIndex: 10
                                            }}>
                                                {bookResults.map(book => (
                                                    <div 
                                                        key={book.id}
                                                        onClick={() => handleSelectBook(book)}
                                                        className="search-item"
                                                        style={{ 
                                                            padding: '12px', display: 'flex', gap: '12px', alignItems: 'center',
                                                            cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)'
                                                        }}
                                                    >
                                                        <div style={{ width: '30px', height: '45px', background: book.cover_color || '#333', borderRadius: '2px' }}></div>
                                                        <div>
                                                            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{book.title}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{book.author}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Selected Book Card with Duration */
                                    <div style={{ animation: 'slideUp 0.3s ease' }}>
                                        <div style={{ display: 'flex', gap: '24px', padding: '24px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-focus)', marginBottom: '20px' }}>
                                            <div style={{ 
                                                width: '60px', height: '90px', 
                                                background: scannedBook.cover_image ? `url(https://brauni-backend.onrender.com${scannedBook.cover_image}) center/cover` : scannedBook.cover_color || '#333',
                                                borderRadius: '4px'
                                            }}></div>
                                            
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{scannedBook.title}</h4>
                                                <p style={{ color: 'var(--text-secondary)' }}>{scannedBook.author}</p>
                                            </div>
                                            <button onClick={() => setScanState('user_found')} style={{ alignSelf: 'start', color: 'var(--text-tertiary)' }}><X size={16}/></button>
                                        </div>

                                        {/* Duration Selector */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>Duración del Préstamo</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {[3, 7, 15, 30].map(days => (
                                                    <button 
                                                        key={days}
                                                        onClick={() => setSelectedDuration(days)}
                                                        style={{
                                                            padding: '10px 20px', borderRadius: '8px', 
                                                            background: selectedDuration === days ? 'var(--primary)' : 'var(--bg-card)',
                                                            color: selectedDuration === days ? 'var(--bg-app)' : 'var(--text-secondary)',
                                                            border: selectedDuration === days ? 'none' : '1px solid var(--border-subtle)',
                                                            fontWeight: '600', transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {days} días
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={confirmLoan}
                                            disabled={loading}
                                            style={{ 
                                                width: '100%', padding: '16px', 
                                                background: 'var(--primary)', color: 'var(--bg-app)', 
                                                borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 'bold',
                                                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1
                                            }}>
                                            {loading ? 'Procesando...' : 'Confirmar Préstamo'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
                 {/* Right Col: Recent Activity */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <RecentActivity limit={8} />
                 </div>
            </div>
            <style>{`.search-item:hover { background: var(--bg-card-hover); }`}</style>
        </div>
    );
};

export default ReceptionDashboard;
