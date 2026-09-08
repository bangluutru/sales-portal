import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ROLES } from '../utils/constants.js';
import { IconPlus } from './Icons.jsx';

export default function Header({ title }) {
  const { people, currentPerson, setCurrentPersonId, openQuickAction } = useApp();

  return (
    <div>
      {/* Demo Role Switcher Bar */}
      <div className="role-switcher-bar" role="region" aria-label="Thanh chuyển đổi vai trò trải nghiệm">
        <div className="role-switcher-label">
          <span>🎭 Demo Role Switcher:</span>
        </div>
        <div className="role-chips" role="group" aria-label="Danh sách vai trò mẫu">
          {people.map(p => {
            const isActive = p.id === currentPerson.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`role-chip ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentPersonId(p.id)}
                aria-pressed={isActive}
                aria-label={`Chuyển vai trò sang: ${p.fullName}, chức vụ: ${ROLES[p.role]?.label}, khu vực: ${p.region}`}
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
          <h1>{title}</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openQuickAction('BUSINESS_TRIP')}
            aria-label="Tạo đề nghị tác nghiệp mới"
          >
            <IconPlus size={15} />
            <span>+ Tạo Đề Nghị</span>
          </button>
        </div>
      </header>
    </div>
  );
}
