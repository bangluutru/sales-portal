import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatVND, formatDate, compileContractTemplate } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import { IconPlus, IconClose } from '../components/Icons.jsx';

export default function ContractsView() {
  const {
    contracts,
    people,
    contractTemplates,
    currentPerson,
    addContract,
    updateContractStatus
  } = useApp();

  const [selectedContract, setSelectedContract] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form states tạo hợp đồng
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [contractType, setContractType] = useState('CTV');
  const [templateId, setTemplateId] = useState(contractTemplates[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
  const [salary, setSalary] = useState('');
  const [allowance, setAllowance] = useState('');
  const [travelAllowance, setTravelAllowance] = useState('');
  const [commissionDescription, setCommissionDescription] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [territoryDescription, setTerritoryDescription] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');

  const role = currentPerson.role;

  // Lọc hợp đồng theo phân quyền:
  // - CTV / Staff: CHỈ xem hợp đồng của chính mình
  // - Manager: Xem hợp đồng của nhân sự do mình quản lý
  // - Director / Admin: Xem tất cả
  const visibleContracts = contracts.filter(c => {
    if (role === 'DIRECTOR' || role === 'ADMIN' || role === 'ACCOUNTING') {
      return true;
    }
    if (role === 'MANAGER') {
      const person = people.find(p => p.id === c.personId);
      return person && (person.managerId === currentPerson.id || person.id === currentPerson.id);
    }
    return c.personId === currentPerson.id;
  });

  const handleCreateContract = (e) => {
    e.preventDefault();
    addContract({
      personId,
      contractType,
      templateId,
      startDate,
      endDate,
      salary: Number(salary) || 0,
      allowance: Number(allowance) || 0,
      travelAllowance: Number(travelAllowance) || 0,
      commissionDescription,
      targetDescription,
      territoryDescription,
      additionalTerms,
      driveFolderUrl: driveFolderUrl || 'https://drive.google.com/drive/folders/genki-contract-new'
    });
    setShowCreateModal(false);
  };

  // Xem trước hợp đồng
  const activeTemplate = contractTemplates.find(t => t.id === (selectedContract?.templateId || templateId)) || contractTemplates[0];
  const targetPerson = selectedContract ? people.find(p => p.id === selectedContract.personId) : people.find(p => p.id === personId);
  const compiledContent = compileContractTemplate(activeTemplate?.templateContent, {
    ...(selectedContract || {}),
    ...(targetPerson || {}),
    contractCode: selectedContract?.contractCode || 'CTR-DRAFT'
  });

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Quản Lý Hợp Đồng Nhân Sự & CTV</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Quản lý metadata, điều khoản thù lao, quy trình phê duyệt khép kín. Không lưu trữ trực tiếp file nặng.
            </p>
          </div>
          {(role === 'MANAGER' || role === 'DIRECTOR' || role === 'ADMIN') && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <IconPlus size={15} />
              <span>+ Lập Hợp Đồng Mới</span>
            </button>
          )}
        </div>

        {visibleContracts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h4 className="empty-title">Không tìm thấy hợp đồng nào</h4>
            <p className="empty-desc">
              {role === 'CTV' || role === 'STAFF' 
                ? 'Hiện tại chưa có hợp đồng nào được gán cho tài khoản của bạn. Vui lòng liên hệ Quản lý.' 
                : 'Chưa có hợp đồng nào được tạo trong phạm vi quản lý của bạn.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <caption className="visually-hidden">Danh sách hợp đồng nhân sự và đối tác</caption>
              <thead>
                <tr>
                  <th scope="col">Mã Hợp Đồng</th>
                  <th scope="col">Nhân Sự / CTV</th>
                  <th scope="col">Loại HĐ & Địa Bàn</th>
                  <th scope="col">Thời Hạn Hiệu Lực</th>
                  <th scope="col">Mức Thù Lao / Lương</th>
                  <th scope="col">Trạng Thái</th>
                  <th scope="col">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {visibleContracts.map(c => {
                  const person = people.find(p => p.id === c.personId);
                  const canManage = role === 'MANAGER' || role === 'DIRECTOR' || role === 'ADMIN';

                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.contractCode}</strong>
                        <div><small style={{ color: 'var(--text-muted)' }}>Tạo bởi: {c.createdBy}</small></div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{person?.fullName}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{person?.position}</small>
                      </td>
                      <td>
                        <div><strong>{c.contractType}</strong></div>
                        <small style={{ color: 'var(--text-secondary)' }}>{c.territoryDescription}</small>
                      </td>
                      <td>
                        <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {formatVND(c.salary)}
                        {c.allowance > 0 && <small style={{ display: 'block', color: 'var(--text-muted)' }}>+ Phụ cấp: {formatVND(c.allowance)}</small>}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedContract(c)}
                        >
                          Chi Tiết & Xem Lại
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Hợp Đồng */}
      {selectedContract && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                  Chi Tiết Hợp Đồng: {selectedContract.contractCode}
                </h3>
                <StatusBadge status={selectedContract.status} />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedContract(null)}>
                <IconClose size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nhân sự thụ hưởng:</span>
                  <div style={{ fontWeight: 600 }}>{targetPerson?.fullName} ({targetPerson?.phone})</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thời hạn hợp đồng:</span>
                  <div>{formatDate(selectedContract.startDate)} đến {formatDate(selectedContract.endDate)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thù lao cố định / Lương:</span>
                  <div style={{ fontWeight: 700, color: 'var(--gf-primary)', fontSize: '16px' }}>
                    {formatVND(selectedContract.salary)} / tháng
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phụ cấp trách nhiệm:</span>
                  <div>{formatVND(selectedContract.allowance)} / tháng</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chế độ công tác phí:</span>
                  <div>{formatVND(selectedContract.travelAllowance)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Địa bàn phụ trách:</span>
                  <div>{selectedContract.territoryDescription}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chỉ tiêu định mức & Trách nhiệm:</span>
                <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                  {selectedContract.targetDescription || 'Theo quy chế kinh doanh'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '16px 0' }}>
                <DriveLinkButton url={selectedContract.driveFolderUrl} label="Mở Thư Mục Hợp Đồng Trên Google Drive" />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPreviewModal(true)}
                >
                  👁️ Xem Bản Hợp Đồng Điền Tự Động (Template Preview)
                </button>
              </div>

              {/* Thao tác duyệt hợp đồng theo vai trò */}
              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Thao Tác Nghiệp Vụ Hợp Đồng:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Manager gửi duyệt */}
                  {role === 'MANAGER' && (selectedContract.status === 'DRAFT' || selectedContract.status === 'REVISION_REQUESTED') && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        updateContractStatus(selectedContract.id, 'DIRECTOR_REVIEW', 'Quản lý trình Giám Đốc phê duyệt');
                        setSelectedContract(null);
                      }}
                    >
                      🚀 Trình Ban Giám Đốc Phê Duyệt
                    </button>
                  )}

                  {/* Director phê duyệt / từ chối */}
                  {role === 'DIRECTOR' && (selectedContract.status === 'DIRECTOR_REVIEW' || selectedContract.status === 'SUBMITTED') && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          updateContractStatus(selectedContract.id, 'APPROVED', 'Tổng Giám Đốc đã ký duyệt điện tử');
                          setSelectedContract(null);
                        }}
                      >
                        ✓ Ký Duyệt Hợp Đồng (Approve)
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          updateContractStatus(selectedContract.id, 'REVISION_REQUESTED', 'Yêu cầu điều chỉnh mức phụ cấp');
                          setSelectedContract(null);
                        }}
                      >
                        Yêu Cầu Sửa Đổi
                      </button>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                          updateContractStatus(selectedContract.id, 'REJECTED', 'Không đồng ý');
                          setSelectedContract(null);
                        }}
                      >
                        Từ Chối
                      </button>
                    </>
                  )}

                  {/* Kích hoạt hợp đồng sau khi đã duyệt */}
                  {(role === 'DIRECTOR' || role === 'ADMIN') && selectedContract.status === 'APPROVED' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        updateContractStatus(selectedContract.id, 'ACTIVE', 'Hợp đồng bắt đầu có hiệu lực thực tế');
                        setSelectedContract(null);
                      }}
                    >
                      Chuyển Sang Trạng Thái Hiệu Lực (Active)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedContract(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Trước Văn Bản Hợp Đồng Điền Sẵn (Template Preview) */}
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                Xem Trước Văn Bản Hợp Đồng (Template Engine Preview)
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPreviewModal(false)}>
                <IconClose size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Hệ thống tự động biên dịch nội dung từ template và thay thế các biến <code>{`{{full_name}}`}</code>, <code>{`{{salary}}`}</code>, <code>{`{{territory}}`}</code>...
              </p>
              <pre style={{
                background: '#f8faf9',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {compiledContent}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Hợp Đồng Mới (cho Manager) */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Lập Hợp Đồng Nhân Sự Mới</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                <IconClose size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateContract}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Chọn Nhân Sự / CTV *</label>
                    <select
                      className="form-select"
                      value={personId}
                      onChange={(e) => setPersonId(e.target.value)}
                    >
                      {people.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.role} - {p.region})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mẫu Hợp Đồng (Template) *</label>
                    <select
                      className="form-select"
                      value={templateId}
                      onChange={(e) => {
                        setTemplateId(e.target.value);
                        const t = contractTemplates.find(tpl => tpl.id === e.target.value);
                        if (t && t.id.includes('CTV')) setContractType('CTV');
                        else setContractType('STAFF');
                      }}
                    >
                      {contractTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Thù Lao Cố Định / Lương (VNĐ/tháng) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      placeholder="VD: 8000000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phụ Cấp Trách Nhiệm (VNĐ/tháng)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="VD: 1500000"
                      value={allowance}
                      onChange={(e) => setAllowance(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày Bắt Đầu</label>
                    <input
                      type="date"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày Kết Thúc</label>
                    <input
                      type="date"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Địa Bàn Quản Lý & Phát Triển Thị Trường</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: Hà Nội (Khu vực Cầu Giấy, Nam Từ Liêm)"
                    value={territoryDescription}
                    onChange={(e) => setTerritoryDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chỉ Tiêu Định Mức & Hoa Hồng</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Chỉ tiêu phát triển nhà thuốc, tỷ lệ % hoa hồng..."
                    value={targetDescription}
                    onChange={(e) => setTargetDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Google Drive Folder URL Hợp Đồng</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu Bản Thảo Hợp Đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
