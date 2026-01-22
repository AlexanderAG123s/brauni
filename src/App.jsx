import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Card from './components/Card';
import BookCatalog from './pages/BookCatalog';
import UserRegistration from './pages/UserRegistration';
import ReceptionDashboard from './pages/ReceptionDashboard';
import Statistics from './pages/Statistics';
import GlobalSearch from './components/GlobalSearch';

import LoginPage from './pages/LoginPage';
import Librarians from './pages/Librarians';
// import ChatWidget from './components/ChatWidget'; // DISABLED

function App() {
  const [user, setUser] = useState(() => {
    // Recover session from localStorage on app load
    const savedUser = localStorage.getItem('brauni_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Save user to localStorage when login/logout
  useEffect(() => {
    if (user) {
      localStorage.setItem('brauni_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('brauni_user');
    }
  }, [user]);

  // Ctrl+K Handler
  useEffect(() => {
     if (!user) return; // Only if logged in
     const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'k') {
           e.preventDefault();
           setIsSearchOpen(true);
        }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  if (!user) {
      return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Overview setActiveView={setActiveView} role={user.role} user={user} />;
      case 'Libros':
        return <BookCatalog />;
      case 'Usuarios':
        return <UserRegistration />;
      case 'Préstamos':
        return <ReceptionDashboard />;
      case 'Estadísticas':
        return <Statistics />;
      case 'Bibliotecarios':
          return user.role === 'Admin' ? <Librarians /> : <Card>Acceso Denegado</Card>;
      case 'Configuración':
          return (
             <Card title="Configuración de Demo">
                 <p>Usuario: {user.name} ({user.role})</p>
                 <button onClick={() => setUser(null)} style={{ marginTop: '20px', padding: '10px', background: 'var(--status-danger)', color: 'white', borderRadius: '4px' }}>Cerrar Sesión</button>
             </Card>
          );
      default:
        return <Overview setActiveView={setActiveView} user={user} />;
    }
  };

  // ... (inside component)

  return (
    <div className="layout">
      <Sidebar activeView={activeView} onNavigate={setActiveView} role={user.role} onLogout={() => setUser(null)} />
      <div className="main-content">
         <Header 
            onSearchClick={() => setIsSearchOpen(true)} 
            user={user} 
            chatUnreadCount={chatUnreadCount}
            onLogout={() => setUser(null)}
         />
         <div className="content-scroll">
            {renderContent()}
         </div>
         {/* AI Chat Widget - DISABLED */}
         {/* <ChatWidget onUnreadChange={setChatUnreadCount} user={user} /> */}
      </div>
      
      <GlobalSearch 
         isOpen={isSearchOpen} 
         onClose={() => setIsSearchOpen(false)} 
         onNavigate={setActiveView}
      />
    </div>
  );
}

export default App;
