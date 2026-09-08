import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ROLES } from '../utils/constants.js';
import {
  IconDashboard,
  IconUsers,
  IconCustomers,
  IconContracts,
  IconOperations,
  IconMyTasks,
  IconSettings
} from './Icons.jsx';

export default function Sidebar() {
  const { activeTab, setActiveTab, currentPerson, totalMyTasksCount } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Trang Chủ', icon: <IconDashboard /> },
    { id: 'people', label: 'Nhân Sự & CTV', icon: <IconUsers /> },
    { id: 'customers', label: 'Khách Hàng', icon: <IconCustomers /> },
    { id: 'contracts', label: 'Hợp Đồng', icon: <IconContracts /> },
    { id: 'operations', label: 'Đề Nghị (Operations)', icon: <IconOperations /> },
    {
      id: 'my-tasks',
      label: 'Việc Cần Làm',
      icon: <IconMyTasks />,
      badge: totalMyTasksCount > 0 ? totalMyTasksCount : null
    }
  ];

  // Chỉ hiển thị menu Quản trị cho vai trò ADMIN hoặc DIRECTOR
  if (currentPerson.role === 'ADMIN' || currentPerson.role === 'DIRECTOR') {
    navItems.push({ id: 'admin', label: 'Quản Trị Hệ Thống', icon: <IconSettings /> });
  }

  return (
    <aside className="sidebar" aria-label="Thanh điều hướng bên">
      <div className="sidebar-header">
        <div className="brand-logo-badge" aria-hidden="true">GF</div>
        <div className="brand-text">
          <span className="brand-title">Genki Fami</span>
          <span className="brand-subtitle">Operations Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Điều hướng chính hệ thống">
        <ul className="nav-list">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="nav-item-left">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="nav-badge" aria-label={`${item.badge} mục cần xử lý`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar" aria-hidden="true">
            {currentPerson.fullName.charAt(0)}
          </div>
          <div className="user-details">
            <span className="user-name">{currentPerson.fullName}</span>
            <span className="user-role-badge">
              {ROLES[currentPerson.role]?.label} • {currentPerson.region}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
