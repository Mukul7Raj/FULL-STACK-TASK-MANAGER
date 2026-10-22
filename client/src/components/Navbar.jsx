import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-logo">
          <CheckSquare size={22} />
        </div>
        <div>
          <h1 className="brand-title">TaskFlow</h1>
        </div>
        <span className="tech-badge">Node • Postgres • JWT</span>
      </div>

      {user && (
        <div className="nav-user">
          <div className="user-profile-badge">
            <div className="avatar-circle">{getInitials(user.name)}</div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary"
            title="Log out of account"
            style={{ padding: '6px 12px' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
