import React, { useState } from 'react';
import { LayoutDashboard, Book, Users, Repeat, BarChart3, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavigate, role }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Libros', icon: Book },
    { name: 'Usuarios', icon: Users },
    { name: 'Préstamos', icon: Repeat },
    { name: 'Estadísticas', icon: BarChart3 },
  ];

  if (role === 'Admin') {
      menuItems.push({ name: 'Bibliotecarios', icon: Users }); // Using Users icon again or similar
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">B</div>
        <h2>Brauni</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button 
                  className={`nav-item ${activeView === item.name ? 'active' : ''}`}
                  onClick={() => onNavigate(item.name)}
                >
                  <Icon size={20} className="nav-icon" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-divider"></div>

        <ul>
          <li>
            <button className="nav-item">
              <Settings size={20} className="nav-icon" />
              <span>Configuración</span>
            </button>
          </li>
          <li>
            <button className="nav-item danger">
              <LogOut size={20} className="nav-icon" />
              <span>Salir</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
