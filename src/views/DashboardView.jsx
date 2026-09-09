import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { REQUEST_TYPES, ROLES } from '../utils/constants.js';
import { formatVND, formatDate } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function DashboardView() {
  const {
    currentPerson,
    contracts,
    requests,
    customers,
    people,
    openQuickAction,
    setSelectedRequestId,
    setActiveTab,
    updateRequestAction,
    pinnedFolders,
    pinDriveFolder,
    unpinDriveFolder,
    scopedContracts,
    scopedRequests
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinUrl, setPinUrl] = useState('');
  const [pinNote, setPinNote] = useState('');
  const role = currentPerson.role;

  // Lọc đề xuất theo ngữ cảnh
  const myRequests = requests.filter(r => r.requesterId === currentPerson.id);
  const displayRequests = requests.filter(r => {
    if (role === 'DIRECTOR' || role === 'ADMIN' || role === 'ACCOUNTING') return true;
    if (role === 'MANAGER') {
      const p = people.find(person => person.id === r.requesterId);
      return r.requesterId === currentPerson.id || (p && p.managerId === currentPerson.id);
    }
    return r.requesterId === currentPerson.id;
  });

  const filteredRecentRequests = displayRequests.filter(r => {
    const q = searchFilter.toLowerCase();
    return r.requestCode.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
  });

  // Tính toán số liệu cho 4 KPI counters
  const pendingCount = displayRequests.filter(r => 
    r.status === 'SUBMITTED' || r.status === 'MANAGER_REVIEW' || r.status === 'DIRECTOR_REVIEW' || r.status === 'ACCOUNTING_REVIEW'
  ).length;

  const needDocsCount = displayRequests.filter(r => 
    r.status === 'REJECTED' || r.status === 'NEED_DOCS'
  ).length;

  const approvedReadyCount = displayRequests.filter(r => 
    r.status === 'READY_FOR_PAYMENT' || r.status === 'APPROVED'
  ).length;

  const draftContractsCount = contracts.filter(c => c.status === 'DRAFT' || c.status === 'SUBMITTED').length;

  // Helper lấy icon nghiệp vụ
  const getRequestTypeMeta = (type) => {
    switch (type) {
      case 'SAMPLE':
        return { label: 'Xuất mẫu', icon: 'inventory_2', color: 'var(--stitch-primary)' };
      case 'PAYMENT':
      case 'SETTLEMENT':
        return { label: 'Thanh toán', icon: 'receipt_long', color: 'var(--stitch-warning-text)' };
      case 'BUSINESS_TRIP':
      case 'ADVANCE':
        return { label: 'Công tác', icon: 'flight_takeoff', color: 'var(--stitch-tertiary)' };
      default:
        return { label: 'Hồ sơ', icon: 'description', color: 'var(--stitch-primary)' };
    }
  };

  // Helper lấy người duyệt kế tiếp
  const getNextReviewer = (req) => {
    if (req.status === 'SUBMITTED' || req.status === 'MANAGER_REVIEW') {
      const requester = people.find(p => p.id === req.requesterId);
      const mgr = requester ? people.find(p => p.id === requester.managerId) : null;
      return mgr ? { name: `${mgr.fullName} (Quản lý)`, initials: mgr.fullName.split(' ').slice(-1)[0].slice(0, 2).toUpperCase() } : { name: 'Trưởng bộ phận', initials: 'TBP' };
    }
    if (req.status === 'ACCOUNTING_REVIEW' || req.status === 'READY_FOR_PAYMENT') {
      return { name: 'Lê Hoàng Yến (Kế toán)', initials: 'HY' };
    }
    if (req.status === 'DIRECTOR_REVIEW') {
      return { name: 'Vũ Mạnh Hùng (GĐ Vùng)', initials: 'VH' };
    }
    if (req.status === 'COMPLETED' || req.status === 'PAID') {
      return { name: 'Đã hoàn tất duyệt', initials: '✓' };
    }
    return { name: 'Tự động kiểm tra', initials: 'SYS' };
  };

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      {/* Top Operational Banner & Greetings */}
      <div className="stitch-banner">
        <div>
          <div className="stitch-status-strip">
            <span className="stitch-pulse-dot"></span>
            <span>Hệ thống trực tuyến • Sẵn sàng thao tác</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            Bàn làm việc & Tác vụ nhanh
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Xin chào <strong>{currentPerson.fullName}</strong> ({ROLES[role]?.label}) — Truy cập tức thì các quy trình đề xuất, tạo văn bản tự động và theo dõi luồng ký số nội bộ.
          </p>
        </div>

        {/* External CRM Bridge Button */}
        <div>
          <a
            href="https://sales.genkifami.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="stitch-crm-btn"
            title="Mở hệ thống CRM công ty"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>insights</span>
            <span>Mở hệ thống CRM công ty (Xem lịch sử giao dịch & doanh số)</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: 0.7 }}>open_in_new</span>
          </a>
        </div>
      </div>

      {/* SECTION 1: 4 Large Prominent Quick Actions */}
      <div className="stitch-action-grid">
        {/* Action 1: Create Contract */}
        <button
          type="button"
          className="stitch-action-card primary"
          onClick={() => setActiveTab('contracts')}
        >
          <span className="material-symbols-outlined stitch-watermark-icon">description</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div className="stitch-action-icon-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>post_add</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', opacity: 0.8 }}>arrow_forward</span>
          </div>
          <div style={{ zIndex: 2 }}>
            <div className="stitch-action-title">Tạo nhanh hợp đồng theo mẫu</div>
            <div className="stitch-action-subtitle">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cloud_upload</span>
              <span>Xuất bản nháp & tự động lưu Google Drive</span>
            </div>
          </div>
        </button>

        {/* Action 2: Business Trip / Advance Request */}
        <button
          type="button"
          className="stitch-action-card surface"
          onClick={() => openQuickAction('BUSINESS_TRIP')}
        >
          <span className="material-symbols-outlined stitch-watermark-icon">flight_takeoff</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div className="stitch-action-icon-badge purple">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>flight_takeoff</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--stitch-outline)' }}>arrow_forward</span>
          </div>
          <div style={{ zIndex: 2 }}>
            <div className="stitch-action-title">Tạo đề nghị công tác</div>
            <div className="stitch-action-subtitle">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-tertiary)' }}>payments</span>
              <span>Kèm xin hạn mức tạm ứng đi đường</span>
            </div>
          </div>
        </button>

        {/* Action 3: Payment / Settlement Request */}
        <button
          type="button"
          className="stitch-action-card surface"
          onClick={() => openQuickAction('PAYMENT')}
        >
          <span className="material-symbols-outlined stitch-watermark-icon">receipt_long</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div className="stitch-action-icon-badge blue">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>receipt_long</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--stitch-outline)' }}>arrow_forward</span>
          </div>
          <div style={{ zIndex: 2 }}>
            <div className="stitch-action-title">Tạo đề nghị thanh toán / Hoàn ứng</div>
            <div className="stitch-action-subtitle">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-secondary)' }}>attach_money</span>
              <span>Chi phí tiếp khách, hoàn ứng công tác</span>
            </div>
          </div>
        </button>

        {/* Action 4: Sample Dispatch Request */}
        <button
          type="button"
          className="stitch-action-card surface"
          onClick={() => openQuickAction('SAMPLE')}
        >
          <span className="material-symbols-outlined stitch-watermark-icon">inventory_2</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div className="stitch-action-icon-badge slate">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>inventory_2</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--stitch-outline)' }}>arrow_forward</span>
          </div>
          <div style={{ zIndex: 2 }}>
            <div className="stitch-action-title">Tạo đề nghị xuất hàng mẫu</div>
            <div className="stitch-action-subtitle">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-primary)' }}>local_shipping</span>
              <span>Yêu cầu xuất kho gửi mẫu cho khách</span>
            </div>
          </div>
        </button>
      </div>

      {/* SECTION 2: Process Status Cards (4 Counters) */}
      <div className="stitch-kpi-grid">
        {/* Card 1: Pending Approval */}
        <div className="stitch-kpi-card">
          <div className="stitch-kpi-main">
            <div className="stitch-kpi-icon amber">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>hourglass_top</span>
            </div>
            <div>
              <div className="stitch-kpi-label">Đang chờ duyệt</div>
              <div className="stitch-kpi-value">
                {String(pendingCount).padStart(2, '0')} <span className="stitch-kpi-unit">phiếu</span>
              </div>
            </div>
          </div>
          <span className="stitch-kpi-pill amber">Cần xử lý</span>
        </div>

        {/* Card 2: Need Documentation */}
        <div className="stitch-kpi-card">
          <div className="stitch-kpi-main">
            <div className="stitch-kpi-icon rose">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>warning</span>
            </div>
            <div>
              <div className="stitch-kpi-label">Cần bổ sung chứng từ</div>
              <div className="stitch-kpi-value" style={{ color: 'var(--stitch-danger-text)' }}>
                {String(needDocsCount).padStart(2, '0')} <span className="stitch-kpi-unit">phiếu</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="stitch-kpi-pill rose"
            onClick={() => setActiveTab('operations')}
          >
            Bổ sung ngay
          </button>
        </div>

        {/* Card 3: Approved / Pending Disbursement */}
        <div className="stitch-kpi-card">
          <div className="stitch-kpi-main">
            <div className="stitch-kpi-icon emerald">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>task_alt</span>
            </div>
            <div>
              <div className="stitch-kpi-label">Đã duyệt chờ chi / xuất</div>
              <div className="stitch-kpi-value">
                {String(approvedReadyCount).padStart(2, '0')} <span className="stitch-kpi-unit">phiếu</span>
              </div>
            </div>
          </div>
          <span className="stitch-kpi-pill emerald">Kế toán nhận</span>
        </div>

        {/* Card 4: Draft Contracts */}
        <div className="stitch-kpi-card">
          <div className="stitch-kpi-main">
            <div className="stitch-kpi-icon indigo">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>quick_reference_all</span>
            </div>
            <div>
              <div className="stitch-kpi-label">Hợp đồng nháp vừa sinh</div>
              <div className="stitch-kpi-value">
                {String(draftContractsCount).padStart(2, '0')} <span className="stitch-kpi-unit">bản</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="stitch-kpi-pill indigo"
            onClick={() => setActiveTab('contracts')}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Xem HĐ
          </button>
        </div>
      </div>

      {/* SECTION 3 & 4: Split Layout (8-col Left Table + 4-col Right Drive Shortcuts) */}
      <div className="stitch-split-grid grid-8-4">
        {/* Left Column: Recent Requests Table */}
        <div className="stitch-card">
          <div className="stitch-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '20px' }}>history_toggle_off</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Các đề nghị gần nhất của tôi</span>
              <span style={{ padding: '2px 8px', borderRadius: '9999px', background: 'var(--stitch-surface-container)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600' }}>
                Tổng: {displayRequests.length} phiếu
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Lọc nhanh mã phiếu..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    height: '32px',
                    paddingLeft: '28px',
                    paddingRight: '10px',
                    backgroundColor: 'var(--stitch-surface-low)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    outline: 'none',
                    width: '160px'
                  }}
                />
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '7px', top: '7px', fontSize: '16px', color: 'var(--stitch-outline)' }}>
                  filter_alt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  backgroundColor: 'var(--stitch-surface-container)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>refresh</span>
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          <div className="stitch-table-wrapper">
            <table className="stitch-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Nghiệp vụ</th>
                  <th>Đối tượng / Mục đích</th>
                  <th>Ngày gửi</th>
                  <th>Duyệt kế tiếp</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentRequests.slice(0, 6).map(req => {
                  const meta = getRequestTypeMeta(req.requestType);
                  const reviewer = getNextReviewer(req);
                  const isAttention = req.status === 'REJECTED' || req.status === 'NEED_DOCS';

                  return (
                    <tr key={req.id} className={isAttention ? 'row-attention' : ''}>
                      <td className="stitch-code-num">{req.requestCode}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: meta.color }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                          {req.title}
                        </div>
                        <div style={{ fontSize: '12px', color: isAttention ? 'var(--stitch-danger-text)' : 'var(--text-secondary)', marginTop: '2px' }}>
                          {req.payload?.customerName || req.payload?.destination || req.payload?.purpose || 'Chi phí tiếp khách & hỗ trợ bán hàng'}
                          {req.amount ? ` • ${formatVND(req.amount)}` : ''}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {formatDate(req.createdAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--stitch-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--stitch-primary)' }}>
                            {reviewer.initials}
                          </div>
                          <span>{reviewer.name}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', background: 'var(--stitch-surface-container)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Xem chi tiết phiếu"
                            onClick={() => {
                              setSelectedRequestId(req.id);
                              setActiveTab('operations');
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                          </button>
                          <button
                            type="button"
                            style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', background: 'var(--stitch-surface-container)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="In phiếu đề xuất"
                            onClick={() => {
                              setSelectedRequestId(req.id);
                              setActiveTab('operations');
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', backgroundColor: 'var(--stitch-surface-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Hiển thị {Math.min(filteredRecentRequests.length, 6)} trên {displayRequests.length} đề xuất trong hệ thống</span>
            <button
              type="button"
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--stitch-surface-container)', color: 'var(--stitch-primary)', fontWeight: '600', cursor: 'pointer' }}
              onClick={() => setActiveTab('operations')}
            >
              Xem toàn bộ lịch sử đề xuất →
            </button>
          </div>
        </div>

        {/* Right Column: Google Drive Folders & Desk Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Drive Shortcuts Card */}
          <div className="stitch-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '22px' }}>folder_shared</span>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Thư mục Google Drive liên kết</h2>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--stitch-outline)' }}>sync</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              Liên kết trực tiếp tới kho tài nguyên chuẩn của doanh nghiệp. Tự động đồng bộ quyền theo tài khoản @company.vn.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="https://drive.google.com/drive/folders/genki-finance-policies"
                target="_blank"
                rel="noopener noreferrer"
                className="stitch-drive-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ea4335', fontSize: '20px' }}>folder</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Biểu mẫu & Quy chế tài chính</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cập nhật: 3 ngày trước • 12 tệp tin</div>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-outline)' }}>open_in_new</span>
              </a>

              <a
                href="https://drive.google.com/drive/folders/genki-legal-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="stitch-drive-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#4285f4', fontSize: '20px' }}>folder</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Mẫu Hợp đồng Pháp lý 2025</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Đã ký số • 8 hợp đồng mẫu</div>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-outline)' }}>open_in_new</span>
              </a>

              <a
                href="https://drive.google.com/drive/folders/genki-customer-dossiers"
                target="_blank"
                rel="noopener noreferrer"
                className="stitch-drive-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#34a853', fontSize: '20px' }}>folder</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Hồ sơ Khách hàng & Đại lý</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Phân vùng Miền Bắc & Nam</div>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-outline)' }}>open_in_new</span>
              </a>
              {/* Personal Pinned Folders */}
              {pinnedFolders && pinnedFolders.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    📌 Thư mục bạn đã ghim ({pinnedFolders.length})
                  </div>
                  {pinnedFolders.map(folder => (
                    <div
                      key={folder.id}
                      className="stitch-drive-item"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}
                    >
                      <a
                        href={folder.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}
                      >
                        <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '20px' }}>folder_shared</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{folder.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{folder.note || 'Lối tắt cá nhân'}</div>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => unpinDriveFolder(folder.id)}
                        style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
                        title="Bỏ ghim thư mục này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              style={{ width: '100%', marginTop: '14px', padding: '9px', borderRadius: '6px', border: '1px dashed var(--stitch-outline)', backgroundColor: 'transparent', color: 'var(--stitch-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => setPinModalOpen(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              <span>Ghim thêm thư mục cá nhân</span>
            </button>
          </div>

          {/* Desk Guidelines Card */}
          <div className="stitch-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '20px' }}>lightbulb</span>
              <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Quy chuẩn Bàn làm việc</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--stitch-primary)', fontWeight: 800, fontSize: '12px' }}>01.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Quyết toán hoàn ứng:</strong> Phải nộp hóa đơn VAT điện tử trong vòng 03 ngày làm việc sau khi kết thúc chuyến công tác.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--stitch-primary)', fontWeight: 800, fontSize: '12px' }}>02.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Hạn mức chi tiếp khách:</strong> Vượt trên 5.000.000đ bắt buộc phải có phê duyệt trước từ Giám Đốc Kinh Doanh.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--stitch-primary)', fontWeight: 800, fontSize: '12px' }}>03.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Kiểm kê hàng mẫu:</strong> Đối soát số lượng hàng mẫu demo tồn kho định kỳ vào ngày 25 hàng tháng.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--stitch-primary)', fontWeight: 800, fontSize: '12px' }}>04.</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Bảo mật hợp đồng CTV:</strong> Không gửi tệp tin dự thảo có mức thù lao qua các kênh liên lạc phi chính thức.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ghim Thư Mục Drive Cá Nhân */}
      {pinModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--gf-ink)' }}>
                📌 Ghim Thư Mục Google Drive Cá Nhân
              </h3>
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!pinName) return;
              pinDriveFolder({ name: pinName, url: pinUrl, note: pinNote });
              setPinName('');
              setPinUrl('');
              setPinNote('');
              setPinModalOpen(false);
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Tên thư mục hiển thị *
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="VD: Hóa đơn đỏ công tác Quý 1/2026"
                  value={pinName}
                  onChange={(e) => setPinName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Đường dẫn Google Drive URL (hoặc link thư mục chia sẻ)
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={pinUrl}
                  onChange={(e) => setPinUrl(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Ghi chú mục đích
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: Chứa hình ảnh vé máy bay và bill khách sạn"
                  value={pinNote}
                  onChange={(e) => setPinNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPinModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Lưu & Ghim Lên Bàn Làm Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
