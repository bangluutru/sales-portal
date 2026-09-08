import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { REQUEST_TYPES, ROLES } from '../utils/constants.js';
import { formatVND, formatDate } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function MyTasksView() {
  const {
    myTasks,
    pendingContracts,
    totalMyTasksCount,
    currentPerson,
    people,
    setSelectedRequestId,
    setSelectedContractId,
    setActiveTab,
    updateRequestAction,
    updateContractStatus
  } = useApp();

  const role = currentPerson.role;

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Hộp Việc Cần Xử Lý (My Tasks)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Tập trung tất cả các yêu cầu, hồ sơ hợp đồng và đề nghị tác nghiệp đang chờ {currentPerson.fullName} ({ROLES[role]?.label}) giải quyết.
            </p>
          </div>
          <span className="badge badge-action" style={{ fontSize: '14px', padding: '6px 14px' }}>
            {totalMyTasksCount} việc cần làm
          </span>
        </div>

        {totalMyTasksCount === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h4 className="empty-title">Không Có Việc Nào Tồn Đọng!</h4>
            <p className="empty-desc">
              Tất cả các đề nghị và hợp đồng thuộc thẩm quyền của bạn đã được xử lý xong.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Hợp đồng chờ xử lý */}
            {pendingContracts.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gf-primary)', marginBottom: '12px' }}>
                  📄 Hợp Đồng Đang Chờ ({pendingContracts.length})
                </h4>
                <div className="table-responsive">
                  <table className="data-table">
                    <caption className="visually-hidden">Danh sách hợp đồng đang chờ xử lý</caption>
                    <thead>
                      <tr>
                        <th scope="col">Mã Hợp Đồng</th>
                        <th scope="col">Nhân Sự Thụ Hưởng</th>
                        <th scope="col">Loại HĐ</th>
                        <th scope="col">Mức Lương / Thù Lao</th>
                        <th scope="col">Trạng Thái</th>
                        <th scope="col">Xử Lý Nhanh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingContracts.map(c => {
                        const person = people.find(p => p.id === c.personId);
                        return (
                          <tr key={c.id}>
                            <td><strong>{c.contractCode}</strong></td>
                            <td>
                              <div>{person?.fullName}</div>
                              <small style={{ color: 'var(--text-muted)' }}>{person?.position}</small>
                            </td>
                            <td>{c.contractType}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{formatVND(c.salary)}</td>
                            <td><StatusBadge status={c.status} /></td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {role === 'DIRECTOR' && (
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() => updateContractStatus(c.id, 'APPROVED', 'Giám Đốc duyệt trong My Tasks')}
                                  >
                                    ✓ Ký Duyệt
                                  </button>
                                )}
                                {role === 'MANAGER' && c.status === 'DRAFT' && (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => updateContractStatus(c.id, 'DIRECTOR_REVIEW', 'Manager gửi Giám Đốc')}
                                  >
                                    🚀 Trình Giám Đốc
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setSelectedContractId(c.id);
                                    setActiveTab('contracts');
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
              </div>
            )}

            {/* 2. Đề nghị tác nghiệp chờ xử lý */}
            {myTasks.length > 0 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gf-primary)', marginBottom: '12px' }}>
                  ⚡ Đề Nghị Tác Nghiệp Đang Chờ ({myTasks.length})
                </h4>
                <div className="table-responsive">
                  <table className="data-table">
                    <caption className="visually-hidden">Danh sách đề nghị tác nghiệp đang chờ xử lý</caption>
                    <thead>
                      <tr>
                        <th scope="col">Mã Đề Nghị</th>
                        <th scope="col">Người Nộp</th>
                        <th scope="col">Loại & Tiêu Đề</th>
                        <th scope="col">Số Tiền</th>
                        <th scope="col">Trạng Thái</th>
                        <th scope="col">Thao Tác Xử Lý Nhanh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTasks.map(r => {
                        const requester = people.find(p => p.id === r.requesterId);
                        const cfg = REQUEST_TYPES[r.requestType] || {};

                        return (
                          <tr key={r.id}>
                            <td>
                              <strong>{r.requestCode}</strong>
                              <div><small style={{ color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</small></div>
                            </td>
                            <td>
                              <div>{requester?.fullName}</div>
                              <small style={{ color: 'var(--text-muted)' }}>{requester?.region}</small>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{cfg.icon}</span>
                                <strong>{r.title}</strong>
                              </div>
                              <small style={{ color: 'var(--text-secondary)' }}>{r.description}</small>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gf-primary)' }}>
                              {r.amount > 0 ? formatVND(r.amount) : '—'}
                            </td>
                            <td><StatusBadge status={r.status} /></td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {(role === 'MANAGER' || role === 'DIRECTOR') && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => updateRequestAction(r.id, 'APPROVE', 'Đã duyệt qua My Tasks')}
                                  >
                                    ✓ Phê Duyệt
                                  </button>
                                )}

                                {role === 'ACCOUNTING' && (
                                  r.status === 'READY_FOR_PAYMENT' ? (
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => updateRequestAction(r.id, 'MARK_PAID', 'Đã chuyển khoản thành công')}
                                    >
                                      ✓ Chi Tiền
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => updateRequestAction(r.id, 'READY_PAYMENT', 'Đã duyệt chi')}
                                    >
                                      Sẵn Sàng Chi
                                    </button>
                                  )
                                )}

                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setSelectedRequestId(r.id);
                                    setActiveTab('operations');
                                  }}
                                >
                                  Chi Tiết
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
