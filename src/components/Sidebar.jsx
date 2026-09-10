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
  IconSettings,
  IconCloudDone,
  IconSupport
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
      <div>
        <div className="sidebar-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-logo-badge" aria-hidden="true" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--stitch-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
            GF
          </div>
          <div className="brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--stitch-primary)', lineHeight: 1.2 }}>OpsPortal</span>
            <span className="brand-subtitle" style={{ fontSize: '11px', fontWeight: '600', color: 'var(--stitch-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales & CTV • Genki Fami</span>
          </div>
        </div>

        <div style={{ padding: '16px 16px 6px 16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--stitch-outline)', paddingLeft: '8px' }}>
            Nghiệp vụ cốt lõi
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Điều hướng chính hệ thống" style={{ padding: '0 12px' }}>
          <ul className="nav-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? '600' : '400',
                      backgroundColor: isActive ? 'var(--stitch-primary-container)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-primary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="nav-badge" aria-label={`${item.badge} mục cần xử lý`} style={{ backgroundColor: isActive ? '#ffffff' : 'var(--stitch-danger)', color: isActive ? 'var(--stitch-primary)' : '#ffffff', padding: '2px 7px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)' }}>
        {/* Google Drive Status Widget */}
        <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--stitch-surface-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--stitch-primary)' }}>
              <IconCloudDone size={20} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Google Drive Kho</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Đã kết nối đồng bộ</p>
            </div>
          </div>
          <span className="stitch-pulse-dot" title="Đang đồng bộ Google Drive"></span>
        </div>

        {/* Hỗ trợ nội bộ button */}
        <button
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--stitch-surface-lowest)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          onClick={() => alert('Bộ phận hỗ trợ nội bộ Genki Fami:\nHotline IT/Vận hành: 0988 123 456\nEmail: ops@genkifami.vn')}
        >
          <IconSupport size={16} />
          <span>Hỗ trợ nội bộ</span>
        </button>

        {/* User Mini Card */}
        <div className="user-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
          <div className="user-avatar" aria-hidden="true" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--stitch-surface-container)', color: 'var(--stitch-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
            {currentPerson.fullName.charAt(0)}
          </div>
          <div className="user-details" style={{ minWidth: 0, flex: 1 }}>
            <span className="user-name" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPerson.fullName}
            </span>
            <span className="user-role-badge" style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
              {ROLES[currentPerson.role]?.label} • {currentPerson.region}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
