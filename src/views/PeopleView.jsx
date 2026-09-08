import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ROLES, PERSON_TYPES, PERSON_STATUS } from '../utils/constants.js';
import { formatDate } from '../utils/helpers.js';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import { IconClose } from '../components/Icons.jsx';

export default function PeopleView() {
  const { people, currentPerson, contracts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [viewingPerson, setViewingPerson] = useState(null);

  const role = currentPerson.role;

  // Phân quyền hiển thị danh sách người:
  // - CTV / Staff / Partner: Chỉ được xem chi tiết thông tin của chính mình (hoặc danh sách cơ bản của đồng nghiệp không lộ lương/hợp đồng)
  // - Manager: Được xem chi tiết nhân sự thuộc team mình
  // - Director / Admin: Xem tất cả
  const filteredPeople = people.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || p.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Hồ Sơ Nhân Sự & Mạng Lưới CTV</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Quản lý danh sách nhân viên, cộng tác viên bán hàng và đối tác kinh doanh Genki Fami.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '300px' }}
            placeholder="Tìm theo tên, email, vùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: '200px' }}
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            {Object.entries(ROLES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ & Tên</th>
                <th>Phân Loại & Vai Trò</th>
                <th>Khu Vực Phụ Trách</th>
                <th>Thông Tin Liên Hệ</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map(p => {
                const isSelf = p.id === currentPerson.id;
                const isMyTeam = p.managerId === currentPerson.id;
                const canViewDetails = isSelf || isMyTeam || role === 'DIRECTOR' || role === 'ADMIN';

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gf-ink)' }}>
                        {p.fullName} {isSelf && <span style={{ color: 'var(--gf-primary)' }}>(Tôi)</span>}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>{p.position}</small>
                    </td>
                    <td>
                      <div><strong>{ROLES[p.role]?.label}</strong></div>
                      <small style={{ color: 'var(--text-muted)' }}>{PERSON_TYPES[p.personType]}</small>
                    </td>
                    <td>{p.region}</td>
                    <td>
                      <div>{p.phone}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{p.email}</small>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-approved' : 'badge-draft'}`}>
                        {PERSON_STATUS[p.status] || p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={!canViewDetails}
                        onClick={() => setViewingPerson(p)}
                        title={!canViewDetails ? 'Bạn không có quyền xem hồ sơ người khác' : 'Xem chi tiết'}
                      >
                        {canViewDetails ? 'Xem Hồ Sơ' : 'Khóa'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi tiết Hồ sơ Person */}
      {viewingPerson && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gf-ink)' }}>
                Chi Tiết Hồ Sơ Nhân Sự — {viewingPerson.fullName}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingPerson(null)}>
                <IconClose size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Họ và tên:</span>
                  <div style={{ fontWeight: 600 }}>{viewingPerson.fullName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã nhân sự:</span>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>{viewingPerson.id}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vai trò & Chức danh:</span>
                  <div>{ROLES[viewingPerson.role]?.label} — {viewingPerson.position}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phân loại:</span>
                  <div>{PERSON_TYPES[viewingPerson.personType]}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Khu vực:</span>
                  <div>{viewingPerson.region}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ngày bắt đầu:</span>
                  <div>{formatDate(viewingPerson.startDate)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Số CCCD/CMND:</span>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>{viewingPerson.identityNumber || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã số thuế cá nhân:</span>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>{viewingPerson.taxNumber || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tài khoản ngân hàng:</span>
                  <div style={{ fontWeight: 600 }}>{viewingPerson.bankAccount} ({viewingPerson.bankName})</div>
                  <small style={{ color: 'var(--text-muted)' }}>Chủ TK: {viewingPerson.bankAccountName}</small>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Địa chỉ:</span>
                  <div>{viewingPerson.address}</div>
                </div>
              </div>

              {/* Thư mục tài liệu Google Drive */}
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Hồ Sơ Điện Tử Lưu Trữ Ngoài:
                </span>
                <DriveLinkButton url={viewingPerson.driveFolderUrl} label="Mở Thư Mục Google Drive Của Nhân Sự" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingPerson(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
