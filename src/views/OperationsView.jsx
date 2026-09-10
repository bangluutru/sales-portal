import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { REQUEST_TYPES, ROLES } from '../utils/constants.js';
import { formatVND, formatDate } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import WorkflowTimeline from '../components/WorkflowTimeline.jsx';
import {
  IconPlus,
  IconClose,
  IconExternal,
  IconPayment,
  IconClock,
  IconFactCheck,
  IconVerified,
  IconInventory,
  IconApproval,
  IconFileText,
  IconSupport,
  IconEdit,
  IconTrash,
  IconWarning
} from '../components/Icons.jsx';
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
    updateRequestAction,
    updateRequest,
    deleteRequest,
    isAdmin,
    scopedRequests
  } = useApp();

  const [mainTab, setMainTab] = useState('WORKFLOW'); // 'WORKFLOW' | 'TRAVEL_FORMS'
  const [activeTravelForm, setActiveTravelForm] = useState(null); // { template, data }
  const [scopeTab, setScopeTab] = useState('MY'); // 'MY' | 'TEAM' | 'ALL'
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // States Sửa & Hủy Đề Xuất
  const [editingRequest, setEditingRequest] = useState(null);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const role = currentPerson.role;

  const handleStartEditRequest = (req) => {
    setEditingRequest({
      ...req,
      amount: req.amount || 0,
      title: req.title || '',
      description: req.description || '',
      notes: req.notes || ''
    });
  };

  const handleSaveEditRequest = (e) => {
    e.preventDefault();
    if (!editingRequest || !editingRequest.title.trim()) return;
    updateRequest(editingRequest.id, {
      title: editingRequest.title.trim(),
      amount: Number(editingRequest.amount) || 0,
      description: editingRequest.description,
      notes: editingRequest.notes
    });
    setEditingRequest(null);
  };

  const handleStartDeleteRequest = (req) => {
    setRequestToDelete(req);
  };

  const handleConfirmDeleteRequest = () => {
    if (!requestToDelete) return;
    deleteRequest(requestToDelete.id);
    if (selectedRequestId === requestToDelete.id) {
      setSelectedRequestId(null);
    }
    setRequestToDelete(null);
  };

  const [categoryTab, setCategoryTab] = useState('ALL'); // 'ALL' | 'TRIP_ADVANCE' | 'PAYMENT_SETTLE' | 'SAMPLE_ONLY'

  // Metric overview calculations
  const pendingManagerCount = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'MANAGER_REVIEW').length;
  const pendingAccountingCount = requests.filter(r => r.status === 'ACCOUNTING_REVIEW').length;
  const approvedDirectorCount = requests.filter(r => r.status === 'DIRECTOR_REVIEW' || r.status === 'READY_FOR_PAYMENT').length;
  const sampleCount = requests.filter(r => r.requestType === 'SAMPLE').length;

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

    // 2. Lọc theo category tab
    if (categoryTab === 'TRIP_ADVANCE' && !['BUSINESS_TRIP', 'ADVANCE'].includes(r.requestType)) {
      return false;
    }
    if (categoryTab === 'PAYMENT_SETTLE' && !['PAYMENT', 'SETTLEMENT'].includes(r.requestType)) {
      return false;
    }
    if (categoryTab === 'SAMPLE_ONLY' && r.requestType !== 'SAMPLE') {
      return false;
    }

    // 3. Lọc theo loại đề nghị cụ thể
    if (typeFilter !== 'ALL' && r.requestType !== typeFilter) {
      return false;
    }

    // 4. Lọc theo trạng thái
    if (statusFilter !== 'ALL' && r.status !== statusFilter) {
      return false;
    }

    // 5. Tìm kiếm
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

  // Tính trạng thái 3 bước phê duyệt cho mỗi request
  const getApprovalStepState = (r) => {
    if (r.status === 'REJECTED') {
      return { s1: 'rejected', s2: 'pending', s3: 'pending', text: 'Bị từ chối' };
    }
    if (r.status === 'REVISION_REQUESTED') {
      return { s1: 'current', s2: 'pending', s3: 'pending', text: 'Cần bổ sung' };
    }
    if (r.status === 'PAID' || r.status === 'COMPLETED') {
      return { s1: 'done', s2: 'done', s3: 'done', text: 'Đã hoàn tất' };
    }
    if (r.status === 'READY_FOR_PAYMENT') {
      return { s1: 'done', s2: 'done', s3: 'current', text: 'Chờ chi tiền' };
    }
    if (r.status === 'DIRECTOR_REVIEW') {
      return { s1: 'done', s2: 'current', s3: 'pending', text: 'Chờ BGĐ duyệt' };
    }
    if (r.status === 'ACCOUNTING_REVIEW') {
      return { s1: 'done', s2: 'current', s3: 'pending', text: 'Kế toán soát xét' };
    }
    return { s1: 'current', s2: 'pending', s3: 'pending', text: 'Chờ TBP duyệt' };
  };

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
      {/* Stitch Screen 2 Header: Operations Center */}
      <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--stitch-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <IconPayment size={28} color="var(--stitch-primary)" />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Trung Tâm Nghiệp Vụ & Đề Xuất (Operations Center)
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '850px' }}>
              Quản trị quy trình phê duyệt công tác, tạm ứng kinh phí, đối soát hóa đơn thanh toán và xuất mẫu thử. Đồng bộ liên tục với kho chứng từ kế toán Google Drive.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '12px' }}>
              <span className="stitch-pulse-dot" />
              Đồng bộ Drive: 100% Sẵn sàng
            </span>
          </div>
        </div>

        {/* 4 Metric Overview Snippets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Chờ TBP duyệt</span>
              <IconClock size={18} color="#b45309" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingManagerCount}</div>
            <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>Cần phê duyệt sơ bộ</span>
          </div>

          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Kế toán soát xét</span>
              <IconFactCheck size={18} color="var(--stitch-primary)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--stitch-primary)' }}>{pendingAccountingCount}</div>
            <span style={{ fontSize: '11px', color: 'var(--stitch-primary)', fontWeight: 600 }}>Kiểm tra hóa đơn & thuế</span>
          </div>

          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>BGĐ duyệt chi</span>
              <IconVerified size={18} color="var(--color-success)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)' }}>{approvedDirectorCount}</div>
            <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>Sẵn sàng giải ngân</span>
          </div>

          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Mẫu thử lưu kho</span>
              <IconInventory size={18} color="#4f46e5" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#4f46e5' }}>{sampleCount}</div>
            <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600 }}>Đơn demo phòng khám</span>
          </div>
        </div>

        {/* 5 Quick Action Buttons */}
        <div className="quick-actions-bar" style={{ marginBottom: 0, paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
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
          style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconApproval size={18} />
          <span>Quản Lý Đề Nghị & Phê Duyệt ({filteredRequests.length})</span>
        </button>
        <button
          className={`btn ${mainTab === 'TRAVEL_FORMS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMainTab('TRAVEL_FORMS')}
          style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconFileText size={18} />
          <span>Kho Biểu Mẫu Công Tác (Nghị Định 30)</span>
          <span className="badge badge-accent" style={{ fontSize: '11px', padding: '2px 7px' }}>
            6 Mẫu Ngang & Dọc
          </span>
        </button>
      </div>

      {/* TAB 1: WORKFLOW VIEW */}
      {mainTab === 'WORKFLOW' && (
        <div className="stitch-split-grid">
          {/* LEFT COLUMN: Operations Requests List */}
          <div>
            <div className="card">
              {/* Category Sub-Tabs (Stitch Screen 2) */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
                <button
                  className={`btn btn-sm ${categoryTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryTab('ALL')}
                >
                  Tất cả đề xuất ({requests.length})
                </button>
                <button
                  className={`btn btn-sm ${categoryTab === 'TRIP_ADVANCE' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryTab('TRIP_ADVANCE')}
                >
                  ✈️ Công tác & Tạm ứng
                </button>
                <button
                  className={`btn btn-sm ${categoryTab === 'PAYMENT_SETTLE' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryTab('PAYMENT_SETTLE')}
                >
                  🧾 Thanh toán & Hoàn ứng
                </button>
                <button
                  className={`btn btn-sm ${categoryTab === 'SAMPLE_ONLY' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryTab('SAMPLE_ONLY')}
                >
                  📦 Xuất mẫu thử Demo
                </button>
              </div>

              {/* Scope & Search */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                  <button
                    className={`btn btn-sm ${scopeTab === 'MY' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setScopeTab('MY')}
                  >
                    Của Tôi ({requests.filter(r => r.requesterId === currentPerson.id).length})
                  </button>
                  {(role === 'MANAGER' || role === 'DIRECTOR' || role === 'ADMIN') && (
                    <button
                      className={`btn btn-sm ${scopeTab === 'TEAM' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setScopeTab('TEAM')}
                    >
                      Team
                    </button>
                  )}
                  {(role === 'DIRECTOR' || role === 'ACCOUNTING' || role === 'ADMIN') && (
                    <button
                      className={`btn btn-sm ${scopeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setScopeTab('ALL')}
                    >
                      Hệ Thống ({requests.length})
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  className="form-input"
                  style={{ maxWidth: '240px' }}
                  placeholder="Tìm mã hoặc tiêu đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters: Type & Status */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả loại nghiệp vụ</option>
                  {Object.entries(REQUEST_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>

                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
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

              {/* Table with Visual 3-Step Approval Stepper */}
              {filteredRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📬</div>
                  <h4 className="empty-title">Không tìm thấy đề xuất nào</h4>
                  <p className="empty-desc">Không có bản ghi phù hợp với bộ lọc hiện tại.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => openQuickAction('BUSINESS_TRIP')}>
                    + Tạo đề xuất mới ngay
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <caption className="visually-hidden">Danh sách đề nghị tác nghiệp</caption>
                    <thead>
                      <tr>
                        <th scope="col">Mã Đề Xuất</th>
                        <th scope="col">Loại & Nội Dung</th>
                        <th scope="col">Kinh Phí</th>
                        <th scope="col">Tiến Trình Duyệt 3 Cấp</th>
                        <th scope="col">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => {
                        const requester = people.find(p => p.id === r.requesterId);
                        const cfg = REQUEST_TYPES[r.requestType] || {};
                        const stepInfo = getApprovalStepState(r);

                        return (
                          <tr key={r.id}>
                            <td>
                              <strong>{r.requestCode}</strong>
                              <div><small style={{ color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</small></div>
                              <small style={{ color: 'var(--stitch-primary)', fontWeight: 600 }}>{requester?.fullName}</small>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <span>{cfg.icon}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{cfg.label?.replace('Đề nghị ', '')}</span>
                              </div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{r.title}</div>
                              <small style={{ color: 'var(--text-muted)' }}>{r.description}</small>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--stitch-primary)' }}>
                              {r.amount > 0 ? formatVND(r.amount) : '0 ₫ (Mẫu)'}
                            </td>
                            <td>
                              {/* 3-Step Visual Approval Stepper */}
                              <div className="stitch-stepper" style={{ minWidth: '170px' }}>
                                <div className="stitch-step-item">
                                  <div className={`stitch-step-node ${stepInfo.s1 === 'done' ? 'done' : stepInfo.s1 === 'current' ? 'current' : ''}`}>
                                    {stepInfo.s1 === 'done' ? '✓' : '1'}
                                  </div>
                                  <span className="stitch-step-text">TBP</span>
                                </div>
                                <div className={`stitch-step-line ${stepInfo.s2 === 'done' || stepInfo.s2 === 'current' ? 'active' : ''}`} />
                                <div className="stitch-step-item">
                                  <div className={`stitch-step-node ${stepInfo.s2 === 'done' ? 'done' : stepInfo.s2 === 'current' ? 'current' : ''}`}>
                                    {stepInfo.s2 === 'done' ? '✓' : '2'}
                                  </div>
                                  <span className="stitch-step-text">Kế toán</span>
                                </div>
                                <div className={`stitch-step-line ${stepInfo.s3 === 'done' || stepInfo.s3 === 'current' ? 'active' : ''}`} />
                                <div className="stitch-step-item">
                                  <div className={`stitch-step-node ${stepInfo.s3 === 'done' ? 'done' : stepInfo.s3 === 'current' ? 'current' : ''}`}>
                                    {stepInfo.s3 === 'done' ? '✓' : '3'}
                                  </div>
                                  <span className="stitch-step-text">BGĐ/Kho</span>
                                </div>
                              </div>
                              <div style={{ marginTop: '4px' }}>
                                <StatusBadge status={r.status} />
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSelectedRequestId(r.id)}
                                  >
                                    Chi Tiết
                                  </button>
                                  {(r.status === 'SUBMITTED' || r.status === 'MANAGER_REVIEW' || r.status === 'REVISION_REQUESTED' || isAdmin) && (
                                    <>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}
                                        title="Chỉnh sửa đề xuất"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEditRequest(r);
                                        }}
                                      >
                                        <IconEdit size={13} />
                                      </button>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '3px 6px', color: 'var(--color-danger, #ef4444)' }}
                                        title="Hủy / Xóa đề xuất"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartDeleteRequest(r);
                                        }}
                                      >
                                        <IconTrash size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                                {['BUSINESS_TRIP', 'ADVANCE', 'SETTLEMENT', 'PAYMENT'].includes(r.requestType) && (
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--stitch-primary)', borderColor: 'var(--stitch-primary)' }}
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
          </div>

          {/* RIGHT COLUMN: Settlement Cycle & Accounting Compliance Guidelines */}
          <div>
            {/* Card 1: Settlement Cycle Tracker */}
            <div className="card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(30, 64, 175, 0.02) 100%)', border: '1px solid var(--stitch-primary-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <IconClock size={22} color="var(--stitch-primary)" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Kỳ Chốt Sổ & Chi Trả Tuần Này
                </h4>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--stitch-primary)', marginBottom: '6px' }}>
                15:30 Thứ 3 & Thứ 6
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Kế toán thanh toán đối soát và giải ngân theo 2 đợt cố định mỗi tuần.
              </p>
              <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '6px', borderLeft: '3px solid #eab308' }}>
                <span style={{ fontSize: '11.5px', color: '#854d0e', fontWeight: 600 }}>
                  ⚠️ Lưu ý: Hóa đơn điện tử VAT nộp sau 12:00 thứ 5 sẽ kết chuyển sang đợt thứ 3 tuần kế tiếp.
                </span>
              </div>
            </div>

            {/* Card 2: Accounting Golden Rules */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <IconFactCheck size={20} color="var(--stitch-primary)" />
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700 }}>
                  Quy Chuẩn Kế Toán Hợp Lệ
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: '13px' }}>1.</span>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <strong>Hóa đơn GTGT tên Cty:</strong> Xuất đúng tên <em>Công ty TNHH Dược phẩm Genki Fami</em>, MST chính xác.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: '13px' }}>2.</span>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <strong>Kèm file XML gốc:</strong> Đính kèm file XML gốc của nhà cung cấp vào thư mục Drive đối soát.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: '13px' }}>3.</span>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <strong>Chuyển khoản &gt; 20 triệu:</strong> Mọi chi phí trên 20 triệu VNĐ bắt buộc thanh toán qua tài khoản ngân hàng.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: '13px' }}>4.</span>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <strong>Bảng kê có chữ ký TBP:</strong> Kèm bảng kê chi tiết chi phí công tác theo mẫu NĐ 30 đã ký.
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Accountant Officer Contact */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <IconSupport size={20} color="var(--stitch-primary)" />
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700 }}>
                  Đầu Mối Kế Toán Phụ Trách
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--stitch-primary-light)', color: 'var(--stitch-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
                  HY
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Chị Hoàng Yến</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kế toán thanh toán & Tạm ứng</div>
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <div>📞 <strong>Hotline nội bộ:</strong> Ext #104</div>
                <div>💬 <strong>Zalo Ops:</strong> Hoàng Yến (Kế Toán GF)</div>
              </div>
              <DriveLinkButton
                url="https://drive.google.com/drive/folders/genki-accounting-invoices"
                label="Mở Drive Hóa Đơn Kế Toán"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => setSupportModalOpen(true)}
              >
                <span>📞 Đầu Mối Hotline & Hỗ Trợ Nội Bộ</span>
              </button>
            </div>

            {/* Card 4: Tải Nhanh Mẫu Trống */}
            <div className="card">
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700 }}>
                Tải Nhanh Biểu Mẫu Trắng (.docx)
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                File mẫu chuẩn Nghị định 30 có sẵn công thức tính:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '12px' }}
                  onClick={() => {
                    const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_CONG_TAC);
                    if (tpl) exportTravelFormToDocx(tpl.id, tpl.defaultData, tpl.defaultOrientation);
                  }}
                >
                  📥 Giấy Đề Nghị Đi Công Tác (.docx)
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '12px' }}
                  onClick={() => {
                    const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_TAM_UNG);
                    if (tpl) exportTravelFormToDocx(tpl.id, tpl.defaultData, tpl.defaultOrientation);
                  }}
                >
                  📥 Giấy Đề Nghị Tạm Ứng (.docx)
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '12px' }}
                  onClick={() => {
                    const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG);
                    if (tpl) exportTravelFormToDocx(tpl.id, tpl.defaultData, tpl.defaultOrientation);
                  }}
                >
                  📥 Giấy Thanh Toán Tạm Ứng Mẫu 04-TT (.docx)
                </button>
              </div>
            </div>
          </div>
        </div>
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
                          onClick={() => setStampModalOpen(true)}
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
                          onClick={() => setStampModalOpen(true)}
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

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(selectedRequest.status === 'SUBMITTED' || selectedRequest.status === 'MANAGER_REVIEW' || selectedRequest.status === 'REVISION_REQUESTED' || isAdmin) && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartEditRequest(selectedRequest)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconEdit size={14} />
                      <span>Sửa Đề Xuất</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartDeleteRequest(selectedRequest)}
                      style={{ color: 'var(--color-danger, #ef4444)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconTrash size={14} />
                      <span>Hủy / Xóa Đề Xuất</span>
                    </button>
                  </>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedRequestId(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL APPROVAL STAMP MODAL */}
      {stampModalOpen && selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconVerified size={24} color="#16a34a" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--gf-ink)' }}>
                  Xác Nhận Ký Duyệt Số Điện Tử
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStampModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>MÃ DẤU KÝ ĐIỆN TỬ DỰ KIẾN:</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--gf-primary)', letterSpacing: '0.5px' }}>
                {`STAMP-GF2026-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />
              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                <div>👤 <strong>Người ký duyệt:</strong> {currentPerson.fullName} ({ROLES[currentPerson.role]?.label || currentPerson.role})</div>
                <div>📋 <strong>Đề xuất:</strong> {selectedRequest.requestCode} — {selectedRequest.title}</div>
                {selectedRequest.amount && (
                  <div>💰 <strong>Số tiền phê duyệt:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{formatVND(selectedRequest.amount)}</span></div>
                )}
                <div>🕒 <strong>Thời gian ký số:</strong> {new Date().toLocaleString('vi-VN')}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Ý kiến chỉ đạo / Ghi chú phê duyệt:
              </label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Đồng ý duyệt chi / Phê duyệt đề xuất..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setStampModalOpen(false)}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => {
                  updateRequestAction(selectedRequest.id, 'APPROVE', commentInput || 'Đã xác nhận ký duyệt số điện tử');
                  setStampModalOpen(false);
                  setSelectedRequestId(null);
                  setCommentInput('');
                }}
              >
                ✓ Đóng Dấu Ký Số & Phê Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL SUPPORT & HOTLINE MODAL */}
      {supportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconSupport size={24} color="var(--stitch-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--gf-ink)' }}>
                  Đầu Mối Hỗ Trợ Kế Toán & Hotline Nội Bộ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: 1.6 }}>
              <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '14px', marginBottom: '2px' }}>
                  📞 Hotline Nội Bộ: Ext #104
                </div>
                <div style={{ color: '#047857', fontSize: '12px' }}>
                  Kết nối trực tiếp máy bàn Kế toán thanh toán & Tạm ứng Genki Fami.
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>💬 <strong>Zalo OA Vận Hành:</strong> Hoàng Yến (Kế Toán GF - 0988.xxx.104)</div>
                <div>✉️ <strong>Email Kế toán:</strong> ketoan@genkifami.vn</div>
                <div>🛡️ <strong>Email Quản trị hệ thống:</strong> admin@genkifami.vn</div>
                <div>🏢 <strong>Địa chỉ trụ sở:</strong> Số 107 ngõ 192 Lê Trọng Tấn, P. Phương Liệt, TP. Hà Nội</div>
                <div>⏰ <strong>Giờ làm việc:</strong> 08:00 - 17:30 (Thứ Hai đến Thứ Bảy)</div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                * Lưu ý: Mọi chứng từ hóa đơn đỏ điện tử (file XML và PDF) vui lòng tải lên thư mục Drive kế toán hoặc đính kèm trong đề nghị trước ngày 25 hàng tháng.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSupportModalOpen(false)}
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA NỘI DUNG ĐỀ XUẤT (CRUD UPDATE) */}
      {editingRequest && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconEdit size={20} color="var(--stitch-primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                  Chỉnh Sửa Đề Xuất: {editingRequest.requestCode}
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingRequest(null)}>
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tiêu Đề Đề Xuất *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editingRequest.title}
                    onChange={(e) => setEditingRequest(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kinh Phí Dự Kiến (VNĐ)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="1000"
                    value={editingRequest.amount}
                    onChange={(e) => setEditingRequest(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô Tả / Nội Dung Chi Tiết</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={editingRequest.description}
                    onChange={(e) => setEditingRequest(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi Chú Giải Trình Bổ Sung</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Giải trình bổ sung cho Quản lý / Kế toán..."
                    value={editingRequest.notes || ''}
                    onChange={(e) => setEditingRequest(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRequest(null)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN HỦY / XÓA ĐỀ XUẤT (CRUD DELETE) */}
      {requestToDelete && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '460px' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconWarning size={22} color="var(--color-danger, #ef4444)" />
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--color-danger, #ef4444)' }}>
                  Xác Nhận Hủy / Xóa Đề Xuất
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setRequestToDelete(null)}>
                <IconClose size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
              <p style={{ marginTop: 0, color: 'var(--text-primary)' }}>
                Bạn có chắc chắn muốn hủy / xóa đề xuất <strong>{requestToDelete.requestCode}</strong> ({requestToDelete.title})?
              </p>
              <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Thao tác này sẽ gỡ bỏ đề xuất khỏi hàng đợi phê duyệt của cấp Quản lý và Kế toán.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRequestToDelete(null)}
              >
                Giữ Lại
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: 'var(--color-danger, #ef4444)', color: '#fff', border: 'none' }}
                onClick={handleConfirmDeleteRequest}
              >
                Xác Nhận Hủy Đề Xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

