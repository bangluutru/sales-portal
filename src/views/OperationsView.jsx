import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { REQUEST_TYPES, ROLES } from '../utils/constants.js';
import { formatVND, formatDate } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import WorkflowTimeline from '../components/WorkflowTimeline.jsx';
import { IconPlus, IconClose, IconExternal } from '../components/Icons.jsx';
import { TRAVEL_FORM_TEMPLATES, TRAVEL_FORM_TYPES } from '../utils/travelFormsConstants.js';
import TravelFormMiniDocEditor from '../components/TravelFormMiniDocEditor.jsx';
import { exportTravelFormToDocx } from '../utils/travelDocxGenerator.js';

export default function OperationsView() {
  const {
    requests,
    people,
    customers,
    workflowTemplates,
    currentPerson,
    openQuickAction,
    selectedRequestId,
    setSelectedRequestId,
    updateRequestAction
  } = useApp();

  const [mainTab, setMainTab] = useState('WORKFLOW'); // 'WORKFLOW' | 'TRAVEL_FORMS'
  const [activeTravelForm, setActiveTravelForm] = useState(null); // { template, data }
  const [scopeTab, setScopeTab] = useState('MY'); // 'MY' | 'TEAM' | 'ALL'
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [commentInput, setCommentInput] = useState('');

  const role = currentPerson.role;

  // Lọc danh sách đề nghị theo scope & filters
  const filteredRequests = requests.filter(r => {
    // 1. Phân loại scope
    if (scopeTab === 'MY' && r.requesterId !== currentPerson.id) {
      return false;
    }
    if (scopeTab === 'TEAM') {
      const requester = people.find(p => p.id === r.requesterId);
      if (!requester || requester.managerId !== currentPerson.id) return false;
    }
    // 'ALL' cho phép Director, Accounting, Admin xem tất cả

    // 2. Lọc theo loại đề nghị
    if (typeFilter !== 'ALL' && r.requestType !== typeFilter) {
      return false;
    }

    // 3. Lọc theo trạng thái
    if (statusFilter !== 'ALL' && r.status !== statusFilter) {
      return false;
    }

    // 4. Tìm kiếm
    const searchLower = searchTerm.toLowerCase();
    const matchesCode = r.requestCode.toLowerCase().includes(searchLower);
    const matchesTitle = r.title.toLowerCase().includes(searchLower);
    return matchesCode || matchesTitle;
  });

  const selectedRequest = requests.find(r => r.id === selectedRequestId);
  const selectedRequester = selectedRequest ? people.find(p => p.id === selectedRequest.requesterId) : null;
  const selectedCustomer = selectedRequest ? customers.find(c => c.id === selectedRequest.customerId) : null;
  const selectedWorkflow = selectedRequest ? workflowTemplates.find(wf => wf.requestType === selectedRequest.requestType) : null;

  // Quyền hành động trên request đang xem
  const canManagerAction = selectedRequest && role === 'MANAGER' && 
    (selectedRequest.status === 'SUBMITTED' || selectedRequest.status === 'MANAGER_REVIEW');

  const canDirectorAction = selectedRequest && role === 'DIRECTOR' && 
    (selectedRequest.status === 'DIRECTOR_REVIEW');

  const canAccountingAction = selectedRequest && role === 'ACCOUNTING' && 
    (selectedRequest.status === 'ACCOUNTING_REVIEW' || selectedRequest.status === 'READY_FOR_PAYMENT' || 
     (selectedRequest.requestType === 'ADVANCE' && selectedRequest.status === 'DIRECTOR_REVIEW'));

  // Ánh xạ dữ liệu từ Đề Nghị sang Biểu mẫu tương ứng
  const mapRequestToFormData = (request, templateId) => {
    const requester = people.find(p => p.id === request.requesterId) || currentPerson;
    const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === templateId) || TRAVEL_FORM_TEMPLATES[0];
    const def = { ...tpl.defaultData };

    const baseData = {
      ...def,
      requesterName: requester.fullName || def.requesterName,
      position: requester.position || def.position,
      department: requester.department || def.department || 'Phòng Kinh Doanh',
      docCode: request.requestCode || def.docCode,
      docDate: request.createdAt ? request.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      purpose: request.title || request.payload?.purpose || def.purpose
    };

    if (request.requestType === 'BUSINESS_TRIP') {
      return {
        ...baseData,
        destination: request.payload?.destination || def.destination,
        startDate: request.payload?.startDate || def.startDate,
        endDate: request.payload?.endDate || def.endDate,
        officerName: requester.fullName || def.officerName
      };
    }

    if (request.requestType === 'ADVANCE') {
      return {
        ...baseData,
        requestCode: request.requestCode,
        items: [
          { stt: 1, title: 'Tạm ứng theo đề nghị: ' + (request.title || 'Công tác phí'), amount: Number(request.amount || 5000000), note: 'Theo phê duyệt trên hệ thống' }
        ]
      };
    }

    if (request.requestType === 'SETTLEMENT') {
      return {
        ...baseData,
        advanceThisPeriod: Number(request.payload?.advanceAmount || request.amount || 5000000),
        actualExpenses: [
          { stt: 1, item: 'Tổng chi phí thực tế theo hóa đơn đối soát (' + (request.title || 'Hoàn ứng') + ')', amount: Number(request.payload?.actualAmount || request.amount || 4800000), voucherCode: 'Kèm bảng kê chứng từ' }
        ]
      };
    }

    if (request.requestType === 'PAYMENT') {
      return {
        ...baseData,
        requestCode: request.requestCode,
        expenseRows: [
          { stt: 1, date: formatDate(request.createdAt), voucherNo: 'HD-001', description: request.title || def.purpose, supplier: selectedCustomer?.name || 'Đối tác cung ứng', amount: Number(request.amount || 2000000), note: 'Hóa đơn VAT' }
        ]
      };
    }

    return baseData;
  };

  return (
    <div className="page-container">
      {/* Quick Actions Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Trung Tâm Đề Nghị Tác Nghiệp (Operations Center)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Cổng quản trị 5 nhóm tác nghiệp: Công tác, Tạm ứng, Thanh toán, Quyết toán hoàn ứng, và Xuất mẫu.
            </p>
          </div>
        </div>

        <div className="quick-actions-bar" style={{ marginBottom: 0 }}>
          <button className="quick-action-btn" onClick={() => openQuickAction('BUSINESS_TRIP')}>
            <span className="quick-action-icon">✈️</span>
            <span>+ Công Tác</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('ADVANCE')}>
            <span className="quick-action-icon">💰</span>
            <span>+ Tạm Ứng</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('PAYMENT')}>
            <span className="quick-action-icon">🧾</span>
            <span>+ Thanh Toán</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('SETTLEMENT')}>
            <span className="quick-action-icon">⚖️</span>
            <span>+ Quyết Toán</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('SAMPLE')}>
            <span className="quick-action-icon">📦</span>
            <span>+ Xuất Mẫu</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs: Workflow vs Travel Forms */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${mainTab === 'WORKFLOW' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMainTab('WORKFLOW')}
          style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>📋 Quản Lý Đề Nghị & Phê Duyệt ({filteredRequests.length})</span>
        </button>
        <button
          className={`btn ${mainTab === 'TRAVEL_FORMS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMainTab('TRAVEL_FORMS')}
          style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>📑 Kho Biểu Mẫu Công Tác (Nghị Định 30)</span>
          <span className="badge badge-accent" style={{ fontSize: '11px', padding: '2px 7px' }}>
            6 Mẫu Ngang & Dọc
          </span>
        </button>
      </div>

      {/* TAB 1: WORKFLOW VIEW */}
      {mainTab === 'WORKFLOW' && (
        <>
          {/* Bộ lọc Scope (My / Team / All) & Search */}
          <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          {/* Tabs Scope */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${scopeTab === 'MY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setScopeTab('MY')}
            >
              Đề Nghị Của Tôi ({requests.filter(r => r.requesterId === currentPerson.id).length})
            </button>
            {(role === 'MANAGER' || role === 'DIRECTOR' || role === 'ADMIN') && (
              <button
                className={`btn btn-sm ${scopeTab === 'TEAM' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setScopeTab('TEAM')}
              >
                Đề Nghị Của Team
              </button>
            )}
            {(role === 'DIRECTOR' || role === 'ACCOUNTING' || role === 'ADMIN') && (
              <button
                className={`btn btn-sm ${scopeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setScopeTab('ALL')}
              >
                Toàn Bộ Hệ Thống ({requests.length})
              </button>
            )}
          </div>

          {/* Search Box */}
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '280px' }}
            placeholder="Tìm theo mã hoặc tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters: Type & Status */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ maxWidth: '220px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">Tất cả loại đề nghị</option>
            {Object.entries(REQUEST_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ maxWidth: '220px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUBMITTED">Chờ duyệt ban đầu</option>
            <option value="MANAGER_REVIEW">Quản lý đang duyệt</option>
            <option value="DIRECTOR_REVIEW">Giám Đốc đang duyệt</option>
            <option value="ACCOUNTING_REVIEW">Kế toán đang xử lý</option>
            <option value="READY_FOR_PAYMENT">Sẵn sàng chi tiền</option>
            <option value="PAID">Đã thanh toán (Paid)</option>
            <option value="COMPLETED">Đã hoàn tất</option>
            <option value="REVISION_REQUESTED">Yêu cầu sửa đổi</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>
        </div>

        {/* Danh sách đề nghị */}
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📬</div>
            <h4 className="empty-title">Không tìm thấy đề nghị nào</h4>
            <p className="empty-desc">Không có bản ghi phù hợp với bộ lọc hiện tại.</p>
            <button className="btn btn-primary btn-sm" onClick={() => openQuickAction('BUSINESS_TRIP')}>
              + Tạo đề nghị mới ngay
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <caption className="visually-hidden">Danh sách đề nghị tác nghiệp</caption>
              <thead>
                <tr>
                  <th scope="col">Mã Đề Nghị</th>
                  <th scope="col">Loại Tác Nghiệp</th>
                  <th scope="col">Tiêu Đề & Nội Dung</th>
                  <th scope="col">Người Đề Xuất</th>
                  <th scope="col">Kinh Phí / Số Tiền</th>
                  <th scope="col">Trạng Thái</th>
                  <th scope="col">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => {
                  const requester = people.find(p => p.id === r.requesterId);
                  const cfg = REQUEST_TYPES[r.requestType] || {};

                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.requestCode}</strong>
                        <div><small style={{ color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</small></div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{cfg.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{cfg.label?.replace('Đề nghị ', '')}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gf-ink)' }}>{r.title}</div>
                        <small style={{ color: 'var(--text-secondary)' }}>{r.description}</small>
                      </td>
                      <td>
                        <div>{requester?.fullName || r.requesterId}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{requester?.region}</small>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gf-primary)' }}>
                        {r.amount > 0 ? formatVND(r.amount) : '—'}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedRequestId(r.id)}
                          >
                            Chi Tiết
                          </button>
                          {['BUSINESS_TRIP', 'ADVANCE', 'SETTLEMENT', 'PAYMENT'].includes(r.requestType) && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '11.5px', color: 'var(--gf-primary)', borderColor: 'var(--gf-primary)' }}
                              title="Mở biểu mẫu chuẩn Nghị định 30 tương ứng"
                              onClick={() => {
                                let tplId = TRAVEL_FORM_TYPES.FORM_CONG_TAC;
                                if (r.requestType === 'ADVANCE') tplId = TRAVEL_FORM_TYPES.FORM_TAM_UNG;
                                else if (r.requestType === 'SETTLEMENT') tplId = TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG;
                                else if (r.requestType === 'PAYMENT') tplId = TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN;
                                const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === tplId);
                                setActiveTravelForm({ template: tpl, data: mapRequestToFormData(r, tpl.id) });
                              }}
                            >
                              📄 Mẫu NĐ 30
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

  {/* TAB 2: TRAVEL FORMS HUB (NGHỊ ĐỊNH 30) */}
  {mainTab === 'TRAVEL_FORMS' && (
    <div>
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(0, 105, 100, 0.08) 0%, rgba(81, 191, 157, 0.05) 100%)', border: '1px solid rgba(0, 105, 100, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>📑</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--gf-ink)' }}>
                Kho Biểu Mẫu Công Tác & Tác Nghiệp (Quy Chuẩn Nghị Định 30/2020/NĐ-CP)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '900px', lineHeight: 1.5 }}>
              Tập hợp 6 biểu mẫu văn bản hành chính & chứng từ kế toán chuẩn hóa từ thực tế vận hành Genki Fami. Tự động dàn trang theo <strong>Khổ Dọc (Portrait)</strong> hoặc <strong>Khổ Ngang (Landscape)</strong> tùy độ rộng bảng biểu, hỗ trợ xem trực quan WYSIWYG, tải file Word (.docx) và in/xuất PDF chuẩn vector.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-accent" style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
              ✓ 6 Mẫu Chuẩn Nghị Định 30
            </span>
            <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
              ✓ Tự Động Ngang / Dọc
            </span>
          </div>
        </div>
      </div>

      {/* Grid 6 Form Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {TRAVEL_FORM_TEMPLATES.map(tpl => {
          const isLandscape = tpl.defaultOrientation === 'LANDSCAPE';
          return (
            <div key={tpl.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-primary" style={{ fontWeight: 700, fontSize: '11.5px' }}>
                    {tpl.code}
                  </span>
                  <span className={`badge ${isLandscape ? 'badge-accent' : 'badge-subtle'}`} style={{ fontWeight: 600, fontSize: '11px' }}>
                    {isLandscape ? '📑 Khổ Ngang (Landscape A4)' : '📄 Khổ Dọc (Portrait A4)'}
                  </span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  {tpl.name}
                </h4>
                <div style={{ fontSize: '11.5px', color: 'var(--gf-primary)', fontWeight: 600, marginBottom: '8px' }}>
                  {tpl.category}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {tpl.description}
                </p>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                  Căn cứ: {tpl.legalBasis}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setActiveTravelForm({ template: tpl, data: tpl.defaultData })}
                >
                  <span>✏️ Soạn Thảo & Xem</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 600 }}
                  title="Tải ngay file Word (.docx) chuẩn theo khổ giấy"
                  onClick={() => exportTravelFormToDocx(tpl.id, tpl.defaultData, tpl.defaultOrientation)}
                >
                  📥 Tải Word
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

      {/* Modal Chi Tiết Đề Nghị (Request Detail Page Layout) */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{REQUEST_TYPES[selectedRequest.requestType]?.icon}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                    {selectedRequest.requestCode} — {selectedRequest.title}
                  </h3>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRequestId(null)}>
                <IconClose size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Thông tin cốt lõi */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Người đề xuất:</span>
                  <div style={{ fontWeight: 600 }}>{selectedRequester?.fullName}</div>
                  <small style={{ color: 'var(--text-muted)' }}>{selectedRequester?.position} • {selectedRequester?.phone}</small>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Số tiền đề xuất:</span>
                  <div style={{ fontWeight: 700, color: 'var(--gf-primary)', fontSize: '18px', fontFamily: 'var(--font-mono)' }}>
                    {selectedRequest.amount > 0 ? formatVND(selectedRequest.amount) : '0 ₫ (Cấp mẫu)'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Khách hàng liên quan:</span>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer ? selectedCustomer.name : 'Nội bộ công ty'}</div>
                  {selectedCustomer && <small style={{ color: 'var(--text-muted)' }}>{selectedCustomer.region}</small>}
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thời gian tạo:</span>
                  <div>{formatDate(selectedRequest.createdAt)}</div>
                </div>
              </div>

              {/* Chi tiết theo từng loại (Payload) */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Thông Tin Chi Tiết Nghiệp Vụ:</h4>
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  {/* Trường hợp Công tác */}
                  {selectedRequest.requestType === 'BUSINESS_TRIP' && (
                    <>
                      <div><strong>Địa điểm đến:</strong> {selectedRequest.payload?.destination}</div>
                      <div><strong>Thời gian:</strong> {formatDate(selectedRequest.payload?.startDate)} đến {formatDate(selectedRequest.payload?.endDate)}</div>
                      <div><strong>Mục đích:</strong> {selectedRequest.payload?.purpose}</div>
                    </>
                  )}

                  {/* Trường hợp Tạm ứng */}
                  {selectedRequest.requestType === 'ADVANCE' && (
                    <>
                      {selectedRequest.payload?.relatedTripCode && (
                        <div><strong>Theo chuyến công tác:</strong> {selectedRequest.payload.relatedTripCode}</div>
                      )}
                      <div><strong>Mục đích tạm ứng:</strong> {selectedRequest.payload?.purpose || selectedRequest.description}</div>
                      <div><strong>Tài khoản nhận:</strong> {selectedRequest.payload?.bankInfo}</div>
                      <div><strong>Hạn cần tiền:</strong> {formatDate(selectedRequest.payload?.requiredDate)}</div>
                    </>
                  )}

                  {/* Trường hợp Thanh toán */}
                  {selectedRequest.requestType === 'PAYMENT' && (
                    <>
                      <div><strong>Đơn vị thụ hưởng:</strong> {selectedRequest.payload?.paymentRecipient}</div>
                      <div><strong>Tài khoản ngân hàng:</strong> {selectedRequest.payload?.bankInfo}</div>
                      <div><strong>Mục đích thanh toán:</strong> {selectedRequest.payload?.paymentPurpose || selectedRequest.description}</div>
                      <div><strong>Hạn thanh toán:</strong> {formatDate(selectedRequest.payload?.dueDate)}</div>
                    </>
                  )}

                  {/* Trường hợp Quyết toán */}
                  {selectedRequest.requestType === 'SETTLEMENT' && (
                    <>
                      <div><strong>Theo chuyến công tác:</strong> {selectedRequest.payload?.relatedTripCode || 'Công tác'}</div>
                      <div className="calc-box" style={{ marginTop: '8px' }}>
                        <div className="calc-row">
                          <span>Số tiền đã tạm ứng:</span>
                          <strong>{formatVND(selectedRequest.payload?.advanceAmount)}</strong>
                        </div>
                        <div className="calc-row">
                          <span>Chi phí thực tế phát sinh:</span>
                          <strong>{formatVND(selectedRequest.payload?.actualExpense)}</strong>
                        </div>
                        <div className="calc-result">
                          {selectedRequest.payload?.companyReimbursement > 0 
                            ? `Công ty chi trả bổ sung cho nhân viên: ${formatVND(selectedRequest.payload?.companyReimbursement)}`
                            : `Nhân viên hoàn trả lại tài khoản công ty: ${formatVND(selectedRequest.payload?.refundAmount)}`}
                        </div>
                      </div>
                      <div style={{ marginTop: '8px' }}><strong>Báo cáo chi tiết:</strong> {selectedRequest.payload?.expenseDescription || selectedRequest.description}</div>
                    </>
                  )}

                  {/* Trường hợp Xuất mẫu */}
                  {selectedRequest.requestType === 'SAMPLE' && (
                    <>
                      <div><strong>Sản phẩm mẫu:</strong> {selectedRequest.payload?.sampleDescription}</div>
                      <div><strong>Số lượng:</strong> {selectedRequest.payload?.quantity}</div>
                      <div><strong>Địa chỉ giao:</strong> {selectedRequest.payload?.shippingAddress}</div>
                      <div><strong>Người nhận:</strong> {selectedRequest.payload?.recipient}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Liên kết Google Drive & Miniapp bên ngoài */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <DriveLinkButton url={selectedRequest.driveFolderUrl} label="Mở Thư Mục Google Drive (Hóa Đơn / Chứng Từ)" />
                {selectedRequest.externalAppUrl && (
                  <a
                    href={selectedRequest.externalAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Mở Ứng Dụng Ngoài (OCR / Hóa Đơn)</span>
                    <IconExternal size={12} />
                  </a>
                )}
              </div>

              {/* Visual Workflow Stepper & Activity Timeline */}
              <WorkflowTimeline request={selectedRequest} workflowTemplate={selectedWorkflow} />

              {/* VĂN BẢN & BIỂU MẪU CHUẨN NGHỊ ĐỊNH 30 LIÊN KẾT */}
              {['BUSINESS_TRIP', 'ADVANCE', 'SETTLEMENT', 'PAYMENT'].includes(selectedRequest.requestType) && (
                <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(0, 105, 100, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 105, 100, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>📑</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--gf-primary)' }}>
                      Văn Bản & Biểu Mẫu Chuẩn (Nghị Định 30/2020/NĐ-CP):
                    </h4>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                    Bấm để mở trình soạn thảo, xem trước trang ngang/dọc, xuất file Word (.docx) hoặc in/xuất PDF:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedRequest.requestType === 'BUSINESS_TRIP' && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 600 }}
                          onClick={() => {
                            const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_CONG_TAC);
                            setActiveTravelForm({ template: tpl, data: mapRequestToFormData(selectedRequest, tpl.id) });
                          }}
                        >
                          📄 Giấy Đề Nghị Đi Công Tác (Khổ Dọc)
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 600 }}
                          onClick={() => {
                            const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN);
                            setActiveTravelForm({ template: tpl, data: mapRequestToFormData(selectedRequest, tpl.id) });
                          }}
                        >
                          📑 Kế Hoạch Tuần (Khổ Ngang - 7 Cột)
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 600 }}
                          onClick={() => {
                            const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG);
                            setActiveTravelForm({ template: tpl, data: mapRequestToFormData(selectedRequest, tpl.id) });
                          }}
                        >
                          📑 Giấy Đi Đường Lữ Hành (Mẫu 06-LĐTL)
                        </button>
                      </>
                    )}
                    {selectedRequest.requestType === 'ADVANCE' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontWeight: 600 }}
                        onClick={() => {
                          const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_TAM_UNG);
                          setActiveTravelForm({ template: tpl, data: mapRequestToFormData(selectedRequest, tpl.id) });
                        }}
                      >
                        💰 Giấy Đề Nghị Tạm Ứng (Khổ Dọc)
                      </button>
                    )}
                    {selectedRequest.requestType === 'SETTLEMENT' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontWeight: 600 }}
                        onClick={() => {
                          const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG);
                          setActiveTravelForm({ template: tpl, data: mapRequestToFormData(selectedRequest, tpl.id) });
                        }}
                      >
                        ⚖️ Giấy Thanh Toán Tạm Ứng (Mẫu 04-TT)
                      </button>
                    )}
                    {selectedRequest.requestType === 'PAYMENT' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontWeight: 600 }}
                        onClick={() => {
                          const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN);
                          setActiveTravelForm({ template: tpl, data: mapRequestToFormData(selectedRequest, tpl.id) });
                        }}
                      >
                        🧾 Giấy Đề Nghị Thanh Toán (Khổ Dọc)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* VÙNG HÀNH ĐỘNG THEO VAI TRÒ */}
              {(canManagerAction || canDirectorAction || canAccountingAction) && (
                <div style={{ marginTop: '24px', padding: '18px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--gf-ink)' }}>
                    Hành Động Xử Lý Đề Nghị:
                  </h4>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập ghi chú / ý kiến phê duyệt nếu có..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Thao tác của Manager */}
                    {canManagerAction && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'APPROVE', commentInput || 'Quản lý vùng đồng ý phê duyệt');
                            setSelectedRequestId(null);
                          }}
                        >
                          ✓ Phê Duyệt & Chuyển Giám Đốc
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'REQUEST_REVISION', commentInput || 'Yêu cầu điều chỉnh thông tin');
                            setSelectedRequestId(null);
                          }}
                        >
                          Yêu Cầu Sửa Đổi
                        </button>
                        <button
                          className="btn btn-accent"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'REJECT', commentInput || 'Quản lý từ chối đề nghị');
                            setSelectedRequestId(null);
                          }}
                        >
                          Từ Chối
                        </button>
                      </>
                    )}

                    {/* Thao tác của Director */}
                    {canDirectorAction && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'APPROVE', commentInput || 'Tổng Giám Đốc phê duyệt');
                            setSelectedRequestId(null);
                          }}
                        >
                          ✓ Ban Giám Đốc Phê Duyệt
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'REQUEST_REVISION', commentInput || 'Giám Đốc yêu cầu giải trình thêm');
                            setSelectedRequestId(null);
                          }}
                        >
                          Yêu Cầu Giải Trình Thêm
                        </button>
                        <button
                          className="btn btn-accent"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'REJECT', commentInput || 'Giám Đốc không đồng ý');
                            setSelectedRequestId(null);
                          }}
                        >
                          Từ Chối
                        </button>
                      </>
                    )}

                    {/* Thao tác của Accounting */}
                    {canAccountingAction && (
                      <>
                        {selectedRequest.status === 'READY_FOR_PAYMENT' ? (
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              updateRequestAction(selectedRequest.id, 'MARK_PAID', commentInput || 'Kế toán đã hoàn tất chuyển khoản');
                              setSelectedRequestId(null);
                            }}
                          >
                            ✓ Đã Giải Ngân / Đã Thanh Toán (Paid)
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              updateRequestAction(selectedRequest.id, 'READY_PAYMENT', commentInput || 'Chứng từ hợp lệ, sẵn sàng chi');
                              setSelectedRequestId(null);
                            }}
                          >
                            Xác Nhận Sẵn Sàng Chi Tiền
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            updateRequestAction(selectedRequest.id, 'NEED_INFO', commentInput || 'Cần bổ sung hóa đơn hợp lệ');
                            setSelectedRequestId(null);
                          }}
                        >
                          Cần Bổ Sung Hóa Đơn
                        </button>
                        {selectedRequest.requestType === 'SETTLEMENT' && (
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              updateRequestAction(selectedRequest.id, 'SETTLE_COMPLETE', commentInput || 'Đã đối soát chứng từ và tất toán hoàn ứng');
                              setSelectedRequestId(null);
                            }}
                          >
                            Tất Toán Quyết Toán
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRequestId(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAVEL FORM MINI DOC EDITOR MODAL (WYSIWYG, Landscape / Portrait, DOCX, Print & PDF) */}
      {activeTravelForm && (
        <TravelFormMiniDocEditor
          template={activeTravelForm.template}
          initialData={activeTravelForm.data}
          onClose={() => setActiveTravelForm(null)}
        />
      )}
    </div>
  );
}
