import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ROLES } from '../utils/constants.js';
import {
  IconPlus,
  IconSearch,
  IconFolderOpen,
  IconBell,
  IconChevronDown,
  IconUser,
  IconClose
} from './Icons.jsx';

export default function Header({ title }) {
  const {
    people,
    currentPerson,
    setCurrentPersonId,
    isAdmin,
    openQuickAction,
    contracts,
    requests,
    customers,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setActiveTab,
    setSelectedRequestId,
    setSelectedContractId
  } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifContainerRef = useRef(null);

  // Role Selector Dropdown state
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleContainerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (roleContainerRef.current && !roleContainerRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedContracts = contracts.filter(c => 
      (c.contractCode && c.contractCode.toLowerCase().includes(q)) ||
      (c.partyBName && c.partyBName.toLowerCase().includes(q)) ||
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedRequests = requests.filter(r => 
      (r.requestCode && r.requestCode.toLowerCase().includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.requestType && r.requestType.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedCustomers = customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.taxCode && c.taxCode.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedPeople = people.filter(p => 
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    ).slice(0, 3);

    const totalMatches = matchedContracts.length + matchedRequests.length + matchedCustomers.length + matchedPeople.length;
    return {
      contracts: matchedContracts,
      requests: matchedRequests,
      customers: matchedCustomers,
      people: matchedPeople,
      totalMatches
    };
  }, [searchQuery, contracts, requests, customers, people]);

  const handleSelectContract = (contractId) => {
    setSelectedContractId(contractId);
    setActiveTab('contracts');
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setActiveTab('operations');
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectCustomer = () => {
    setActiveTab('customers');
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectPerson = (personId) => {
    if (isAdmin) {
      setActiveTab('admin');
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="top-header">
      {/* Search Input Bar with Instant Results Dropdown */}
      <div ref={searchContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '480px', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--stitch-outline)', pointerEvents: 'none' }}>
            <IconSearch size={18} />
          </div>
          <input
            type="search"
            placeholder="Tìm nhanh mã khách, số phiếu đề xuất, hợp đồng, nhân sự..."
            aria-label="Tìm kiếm toàn hệ thống"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setSearchOpen(true);
            }}
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '36px',
              paddingRight: searchQuery ? '32px' : '12px',
              backgroundColor: 'var(--stitch-surface-lowest)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '14px',
                padding: '2px 4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {searchOpen && searchResults && (
          <div
            style={{
              position: 'absolute',
              top: '44px',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '440px',
              overflowY: 'auto'
            }}
          >
            {searchResults.totalMatches === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Không tìm thấy kết quả phù hợp với <strong>"{searchQuery}"</strong>
              </div>
            ) : (
              <div style={{ padding: '8px' }}>
                {/* Contracts Group */}
                {searchResults.contracts.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                      📄 Hợp Đồng ({searchResults.contracts.length})
                    </div>
                    {searchResults.contracts.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectContract(c.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px'
                        }}
                        className="search-item-hover"
                      >
                        <div>
                          <strong style={{ color: 'var(--gf-primary)' }}>{c.contractCode || c.id}</strong>
                          <span style={{ marginLeft: '8px', color: 'var(--text-primary)' }}>{c.partyBName || c.fullName}</span>
                        </div>
                        <span className="badge badge-draft" style={{ fontSize: '11px' }}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Requests Group */}
                {searchResults.requests.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                      📋 Đề Xuất Nghiệp Vụ ({searchResults.requests.length})
                    </div>
                    {searchResults.requests.map(r => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRequest(r.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px'
                        }}
                        className="search-item-hover"
                      >
                        <div>
                          <strong style={{ color: 'var(--gf-secondary)' }}>{r.requestCode || r.id}</strong>
                          <span style={{ marginLeft: '8px', color: 'var(--text-primary)' }}>{r.description || r.requestType}</span>
                        </div>
                        <span className="badge badge-action" style={{ fontSize: '11px' }}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customers Group */}
                {searchResults.customers.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                      🏢 Khách Hàng ({searchResults.customers.length})
                    </div>
                    {searchResults.customers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer()}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px'
                        }}
                        className="search-item-hover"
                      >
                        <div>
                          <strong style={{ color: 'var(--gf-ink)' }}>{c.name}</strong>
                          <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>MST: {c.taxCode || '—'}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.region || 'Toàn quốc'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* People Group */}
                {searchResults.people.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                      👤 Nhân Sự ({searchResults.people.length})
                    </div>
                    {searchResults.people.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPerson(p.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px'
                        }}
                        className="search-item-hover"
                      >
                        <div>
                          <strong>{p.fullName}</strong>
                          <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>{p.email}</span>
                        </div>
                        <span className="badge badge-action" style={{ fontSize: '11px' }}>{p.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Actions & Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Compact Role Selector Dropdown */}
        <div ref={roleContainerRef} className="role-selector-container">
          <button
            type="button"
            className="role-selector-btn"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            aria-expanded={roleDropdownOpen}
            aria-label="Chọn tài khoản chuyển đổi nhanh"
            title="Bấm để chuyển đổi vai trò nhân sự / quản trị"
          >
            <span style={{ fontSize: '13px' }}>{isAdmin ? '👑' : '👤'}</span>
            <span style={{ fontWeight: '700' }}>
              {currentPerson.fullName.split(' ').slice(-1)[0]}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }} className="hidden-mobile">
              ({ROLES[currentPerson.role]?.label || currentPerson.role})
            </span>
            <IconChevronDown size={14} />
          </button>

          {roleDropdownOpen && (
            <div className="role-selector-dropdown">
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Chuyển tài khoản demo ({people.length})
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {people.map(p => {
                  const isActive = p.id === currentPerson.id;
                  const roleObj = ROLES[p.role];
                  return (
                    <div
                      key={p.id}
                      className={`role-selector-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPersonId(p.id);
                        setRoleDropdownOpen(false);
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isActive ? 'var(--stitch-primary)' : 'var(--stitch-surface-high)', color: isActive ? '#fff' : 'var(--stitch-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                        {p.fullName.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: isActive ? '700' : '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.fullName} {isActive && '✓'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {roleObj?.label || p.role} • {p.region}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Google Drive Link */}
        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            height: '36px',
            padding: '0 12px',
            backgroundColor: 'var(--stitch-surface-lowest)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
          title="Mở Google Drive Kho Hồ Sơ Doanh Nghiệp"
        >
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--stitch-primary)' }}>
            <IconFolderOpen size={18} />
          </span>
          <span className="hidden-mobile">Drive Kho</span>
        </a>

        {/* Notification Center Popover */}
        <div ref={notifContainerRef} style={{ position: 'relative' }}>
          <button
            type="button"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: notifOpen ? '#f1f5f9' : 'var(--stitch-surface-lowest)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)'
            }}
            aria-label="Thông báo hệ thống"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--stitch-secondary)' }}>
              <IconBell size={19} />
            </span>
            {unreadNotificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--stitch-danger)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '0 5px',
                fontSize: '10px',
                fontWeight: 700,
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '360px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 1100,
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <strong style={{ fontSize: '13px', color: 'var(--gf-ink)' }}>
                  🔔 Thông Báo ({unreadNotificationCount} mới)
                </strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      style={{ border: 'none', background: 'none', color: 'var(--gf-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Đã đọc tất cả
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearNotifications}
                      style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                    >
                      Xóa hết
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Không có thông báo mới nào
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setNotifOpen(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        backgroundColor: n.read ? '#ffffff' : '#f0fdfa',
                        transition: 'background-color 0.15s'
                      }}
                      className="notif-item-hover"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '13px', color: n.read ? 'var(--text-primary)' : 'var(--gf-ink)' }}>
                          {n.title}
                        </strong>
                        {!n.read && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--stitch-primary)', flexShrink: 0, marginTop: '5px' }}></span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <small style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick CTA */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => openQuickAction('BUSINESS_TRIP')}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--stitch-primary-container)',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <IconPlus size={15} />
          <span>+ Tạo Đề Nghị</span>
        </button>
      </div>
    </header>
  );
}

