import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '📦', label: 'Products', path: '/products' },
    { icon: '🏷️', label: 'Categories', path: '/categories' },
    { icon: '🏢', label: 'Suppliers', path: '/suppliers' },
    { icon: '📈', label: 'Stock', path: '/stock' },
    { icon: '🛒', label: 'Orders', path: '/orders' },
    { icon: '📉', label: 'Charts', path: '/charts' },  
    { icon: '📋', label: 'Reports', path: '/reports' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.label === 'Stock' && <span className="sidebar-badge">5</span>}
            {item.label === 'Charts' && <span className="sidebar-badge">📈</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;