import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { REQUEST_TYPES, ROLES } from '../utils/constants.js';
import { formatVND, formatDate } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import { IconPlus, IconExternal } from '../components/Icons.jsx';

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
    updateContractStatus
  } = useApp();

  const role = currentPerson.role;

  // Lọc dữ liệu cá nhân
  const myContract = contracts.find(c => c.personId === currentPerson.id);
  const myRequests = requests.filter(r => r.requesterId === currentPerson.id);
  const myCustomers = customers.filter(c => c.ownerId === currentPerson.id);

  // Lọc dữ liệu đội ngũ cho Manager
  const myTeamMembers = people.filter(p => p.managerId === currentPerson.id);
  const myTeamRequests = requests.filter(r => {
    const requester = people.find(p => p.id === r.requesterId);
    return requester && requester.managerId === currentPerson.id;
  });

  // Lọc dữ liệu chờ duyệt
  const managerPending = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'MANAGER_REVIEW');
  const directorPendingRequests = requests.filter(r => r.status === 'DIRECTOR_REVIEW');
  const directorPendingContracts = contracts.filter(c => c.status === 'DIRECTOR_REVIEW' || c.status === 'SUBMITTED');
  const accountingPending = requests.filter(r => 
    r.status === 'ACCOUNTING_REVIEW' || r.status === 'READY_FOR_PAYMENT' || 
    (r.requestType === 'ADVANCE' && r.status === 'DIRECTOR_REVIEW')
  );

  return (
    <div className="page-container">
      {/* 1. Quick Actions Bar chung */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(to right, #f8faf9, #eef7f4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gf-primary)' }}>
              Xin chào, {currentPerson.fullName}!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Vai trò hiện tại: <strong>{ROLES[role]?.label}</strong> • Vùng: {currentPerson.region}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <DriveLinkButton url={currentPerson.driveFolderUrl} label="Thư Mục Drive Hồ Sơ" />
          </div>
        </div>

        <div className="quick-actions-bar" style={{ marginBottom: 0 }}>
          <button className="quick-action-btn" onClick={() => openQuickAction('BUSINESS_TRIP')}>
            <span className="quick-action-icon">✈️</span>
            <span>+ Đề Nghị Công Tác</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('ADVANCE')}>
            <span className="quick-action-icon">💰</span>
            <span>+ Đề Nghị Tạm Ứng</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('PAYMENT')}>
            <span className="quick-action-icon">🧾</span>
            <span>+ Đề Nghị Thanh Toán</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('SETTLEMENT')}>
            <span className="quick-action-icon">⚖️</span>
            <span>+ Quyết Toán Hoàn Ứng</span>
          </button>
          <button className="quick-action-btn" onClick={() => openQuickAction('SAMPLE')}>
            <span className="quick-action-icon">📦</span>
            <span>+ Đề Nghị Xuất Mẫu</span>
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD THEO TỪNG VAI TRÒ */}

      {/* A. DASHBOARD CHO CTV / STAFF / PARTNER */}
      {(role === 'CTV' || role === 'STAFF' || role === 'PARTNER') && (
        <>
          {/* Thống kê nhanh */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Hợp Đồng Của Tôi</span>
              <span className="stat-value" style={{ fontSize: '18px', color: 'var(--gf-primary)' }}>
                {myContract ? myContract.contractCode : 'Chưa có HĐ'}
              </span>
              <span className="stat-sub">
                {myContract ? `Hiệu lực đến: ${formatDate(myContract.endDate)}` : 'Liên hệ Quản lý'}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Khách Hàng Phụ Trách</span>
              <span className="stat-value">{myCustomers.length}</span>
              <span className="stat-sub">Nhà thuốc & Đối tác trong vùng</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Đề Nghị Của Tôi</span>
              <span className="stat-value">{myRequests.length}</span>
              <span className="stat-sub">
                {myRequests.filter(r => r.status === 'COMPLETED' || r.status === 'PAID').length} đã hoàn tất
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Đang Chờ Xử Lý</span>
              <span className="stat-value" style={{ color: 'var(--gf-accent)' }}>
                {myRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'PAID' && r.status !== 'REJECTED').length}
              </span>
              <span className="stat-sub">Đang trong quy trình duyệt</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Danh sách đề nghị gần đây */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Đề Nghị Gần Đây Của Tôi</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('operations')}>
                  Xem tất cả
                </button>
              </div>
              {myRequests.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p className="empty-desc">Bạn chưa tạo đề nghị nào.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => openQuickAction('BUSINESS_TRIP')}>
                    + Tạo đề nghị đầu tiên
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mã & Tiêu đề</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.slice(0, 5).map(r => (
                        <tr key={r.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{r.requestCode}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{r.title}</small>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {r.amount > 0 ? formatVND(r.amount) : '—'}
                          </td>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedRequestId(r.id);
                                setActiveTab('operations');
                              }}
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Danh sách khách hàng phụ trách */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Khách Hàng Tôi Đang Phụ Trách</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('customers')}>
                  Xem danh bạ
                </button>
              </div>
              {myCustomers.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p className="empty-desc">Chưa có khách hàng nào được gán cho bạn.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('customers')}>
                    + Thêm khách hàng mới
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tên Khách Hàng</th>
                        <th>Khu Vực</th>
                        <th>Liên Hệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myCustomers.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{c.customerType}</small>
                          </td>
                          <td>{c.region}</td>
                          <td>
                            <div>{c.contactPerson}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{c.phone}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* B. DASHBOARD CHO SALES MANAGER */}
      {role === 'MANAGER' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Đề Nghị Chờ Tôi Duyệt</span>
              <span className="stat-value" style={{ color: 'var(--gf-accent)' }}>
                {managerPending.length}
              </span>
              <span className="stat-sub">Cần hành động ngay (Action first)</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Thành Viên Trong Team</span>
              <span className="stat-value">{myTeamMembers.length}</span>
              <span className="stat-sub">CTV & Nhân sự trực thuộc</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng Đề Nghị Của Team</span>
              <span className="stat-value">{myTeamRequests.length}</span>
              <span className="stat-sub">Toàn bộ 5 loại tác nghiệp</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Khách Hàng Toàn Team</span>
              <span className="stat-value">{customers.length}</span>
              <span className="stat-sub">Đang hoạt động trong danh bạ</span>
            </div>
          </div>

          {/* Vùng Quan Trọng Nhất: Việc Chờ Tôi Duyệt */}
          <div className="card" style={{ border: '2px solid var(--gf-tint)' }}>
            <div className="card-header">
              <span className="card-title" style={{ color: 'var(--gf-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚡ Việc Cần Xử Lý Ngay (Needs My Action)
              </span>
              <span className="badge badge-action">{managerPending.length} đề nghị</span>
            </div>

            {managerPending.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p className="empty-desc">Tuyệt vời! Không còn đề nghị nào đang chờ bạn phê duyệt.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã Đề Nghị</th>
                      <th>Người Đề Xuất</th>
                      <th>Loại & Tiêu Đề</th>
                      <th>Số Tiền</th>
                      <th>Thao Tác Duyệt Nhanh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerPending.map(r => {
                      const requester = people.find(p => p.id === r.requesterId);
                      return (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.requestCode}</strong>
                            <div><small style={{ color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</small></div>
                          </td>
                          <td>
                            <div>{requester?.fullName || r.requesterId}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{ROLES[requester?.role]?.label}</small>
                          </td>
                          <td>
                            <div>{r.title}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{REQUEST_TYPES[r.requestType]?.label}</small>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {r.amount > 0 ? formatVND(r.amount) : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => updateRequestAction(r.id, 'APPROVE', 'Manager đã phê duyệt')}
                              >
                                ✓ Duyệt
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => updateRequestAction(r.id, 'REQUEST_REVISION', 'Cần bổ sung chi tiết')}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setSelectedRequestId(r.id);
                                  setActiveTab('operations');
                                }}
                              >
                                Xem
                              </button>
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

      {/* C. DASHBOARD CHO BAN GIÁM ĐỐC (DIRECTOR) */}
      {role === 'DIRECTOR' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Hợp Đồng Chờ Ký Duyệt</span>
              <span className="stat-value" style={{ color: 'var(--gf-accent)' }}>
                {directorPendingContracts.length}
              </span>
              <span className="stat-sub">Hợp đồng CTV & Lao động mới</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Đề Nghị Chờ Giám Đốc Phê Duyệt</span>
              <span className="stat-value" style={{ color: 'var(--gf-primary)' }}>
                {directorPendingRequests.length}
              </span>
              <span className="stat-sub">Công tác, Tạm ứng & Xuất mẫu</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng Nhân Sự & CTV</span>
              <span className="stat-value">{people.length}</span>
              <span className="stat-sub">Toàn bộ lực lượng kinh doanh</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Hợp Đồng Đang Hiệu Lực</span>
              <span className="stat-value">{contracts.filter(c => c.status === 'ACTIVE').length}</span>
              <span className="stat-sub">Đang vận hành toàn quốc</span>
            </div>
          </div>

          {/* Hợp đồng chờ Giám Đốc phê duyệt */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Hợp Đồng Chờ Ban Giám Đốc Phê Duyệt</span>
              <span className="badge badge-action">{directorPendingContracts.length} hợp đồng</span>
            </div>
            {directorPendingContracts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Không có hợp đồng nào đang chờ phê duyệt.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã HĐ</th>
                      <th>Nhân Sự / CTV</th>
                      <th>Loại HĐ & Vùng</th>
                      <th>Mức Thù Lao / Lương</th>
                      <th>Thao Tác Ký Duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directorPendingContracts.map(c => {
                      const person = people.find(p => p.id === c.personId);
                      return (
                        <tr key={c.id}>
                          <td><strong>{c.contractCode}</strong></td>
                          <td>
                            <div>{person?.fullName}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{person?.phone}</small>
                          </td>
                          <td>{c.contractType} • {c.territoryDescription}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatVND(c.salary)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => updateContractStatus(c.id, 'APPROVED', 'Tổng Giám Đốc đã phê duyệt')}
                              >
                                ✓ Duyệt HĐ
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => updateContractStatus(c.id, 'REVISION_REQUESTED', 'Yêu cầu điều chỉnh')}
                              >
                                Sửa
                              </button>
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

          {/* Đề nghị tác nghiệp chờ Giám Đốc duyệt */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Đề Nghị Tác Nghiệp Chờ Giám Đốc Duyệt</span>
              <span className="badge badge-action">{directorPendingRequests.length} đề nghị</span>
            </div>
            {directorPendingRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Không có đề nghị nào chờ Giám Đốc duyệt.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã Đề Nghị</th>
                      <th>Người Nộp</th>
                      <th>Loại & Tiêu Đề</th>
                      <th>Kinh Phí</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directorPendingRequests.map(r => {
                      const requester = people.find(p => p.id === r.requesterId);
                      return (
                        <tr key={r.id}>
                          <td><strong>{r.requestCode}</strong></td>
                          <td>{requester?.fullName}</td>
                          <td>{r.title}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {r.amount > 0 ? formatVND(r.amount) : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => updateRequestAction(r.id, 'APPROVE', 'Ban Giám Đốc phê duyệt')}
                              >
                                ✓ Duyệt
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setSelectedRequestId(r.id);
                                  setActiveTab('operations');
                                }}
                              >
                                Xem
                              </button>
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

      {/* D. DASHBOARD CHO KẾ TOÁN (ACCOUNTING) */}
      {role === 'ACCOUNTING' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Cần Xử Lý Thanh Toán</span>
              <span className="stat-value" style={{ color: 'var(--gf-accent)' }}>
                {accountingPending.length}
              </span>
              <span className="stat-sub">Thanh toán, Tạm ứng & Quyết toán</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Đề Nghị Đã Chi (Paid)</span>
              <span className="stat-value" style={{ color: 'var(--gf-primary)' }}>
                {requests.filter(r => r.status === 'PAID').length}
              </span>
              <span className="stat-sub">Đã hoàn tất giải ngân</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng Khoản Chi Thanh Toán</span>
              <span className="stat-value" style={{ fontSize: '18px' }}>
                {formatVND(requests.filter(r => r.status === 'PAID').reduce((sum, r) => sum + (r.amount || 0), 0))}
              </span>
              <span className="stat-sub">Ghi nhận qua hệ thống</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Quyết Toán Cần Đối Soát</span>
              <span className="stat-value">
                {requests.filter(r => r.requestType === 'SETTLEMENT' && r.status !== 'COMPLETED').length}
              </span>
              <span className="stat-sub">Đối soát tạm ứng vs thực chi</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Hàng Đợi Xử Lý Tài Chính Kế Toán</span>
              <span className="badge badge-action">{accountingPending.length} khoản chi</span>
            </div>

            {accountingPending.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p className="empty-desc">Không có khoản chi hay tạm ứng nào đang chờ xử lý.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã Đề Nghị</th>
                      <th>Người Nhận / Đối Tác</th>
                      <th>Loại & Tiêu Đề</th>
                      <th>Số Tiền</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động Kế Toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountingPending.map(r => {
                      const requester = people.find(p => p.id === r.requesterId);
                      return (
                        <tr key={r.id}>
                          <td><strong>{r.requestCode}</strong></td>
                          <td>
                            <div>{r.payload?.paymentRecipient || requester?.fullName}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{r.payload?.bankInfo || requester?.bankAccount}</small>
                          </td>
                          <td>
                            <div>{r.title}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{REQUEST_TYPES[r.requestType]?.label}</small>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gf-primary)' }}>
                            {formatVND(r.amount)}
                          </td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {r.status === 'READY_FOR_PAYMENT' ? (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => updateRequestAction(r.id, 'MARK_PAID', 'Kế toán đã thực hiện lệnh chuyển khoản')}
                                >
                                  ✓ Xác nhận Đã Chi
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => updateRequestAction(r.id, 'READY_PAYMENT', 'Kế toán đã thẩm định chứng từ')}
                                >
                                  Sẵn sàng chi
                                </button>
                              )}
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => updateRequestAction(r.id, 'NEED_INFO', 'Yêu cầu bổ sung hóa đơn GTGT')}
                              >
                                Cần HĐ
                              </button>
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

      {/* E. DASHBOARD CHO ADMIN */}
      {role === 'ADMIN' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tổng Quan Quản Trị Hệ Thống (System Overview)</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('admin')}>
              Mở Trang Cấu Hình
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Tổng Tài Khoản Nhân Sự</span>
              <span className="stat-value">{people.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng Danh Bạ Khách Hàng</span>
              <span className="stat-value">{customers.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng Hợp Đồng Đã Lập</span>
              <span className="stat-value">{contracts.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng Đề Nghị Đã Tạo</span>
              <span className="stat-value">{requests.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
