import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ROLES } from '../utils/constants.js';
import { IconPlus } from './Icons.jsx';

export default function Header({ title }) {
  const { people, currentPerson, setCurrentPersonId, openQuickAction, totalMyTasksCount } = useApp();

  return (
    <div>
      {/* Demo Role Switcher Bar */}
      <div className="role-switcher-bar">
        <div className="role-switcher-label">
          <span>🎭 Demo Role Switcher:</span>
        </div>
        <div className="role-chips">
          {people.map(p => {
            const isActive = p.id === currentPerson.id;
            return (
              <button
                key={p.id}
                className={`role-chip ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentPersonId(p.id)}
                title={`${p.fullName} - ${ROLES[p.role]?.label} (${p.region})`}
              >
                <span>{p.fullName.split(' ').slice(-1)[0]}</span>
                <small style={{ opacity: 0.8 }}>({ROLES[p.role]?.label})</small>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Top Header */}
      <header className="top-header">
        <div className="header-title-area">
          <h2>{title}</h2>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => openQuickAction('BUSINESS_TRIP')}
          >
            <IconPlus size={15} />
            <span>+ Tạo Đề Nghị</span>
          </button>
        </div>
      </header>
    </div>
  );
}
