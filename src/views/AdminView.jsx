import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { IconExternal, IconPlus } from '../components/Icons.jsx';

export default function AdminView() {
  const {
    people,
    customers,
    contracts,
    requests,
    currentPerson,
    currentPersonId,
    setCurrentPersonId,
    isAdmin,
    invitePerson,
    deletePerson,
    togglePersonStatus,
    workflowTemplates,
    setWorkflowTemplates,
    appLinks,
    setAppLinks,
    resetToFactoryDefault,
    exportSystemBackupJson,
    importSystemBackupJson,
    getDataIntegrityStats
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('staff'); // 'staff' | 'workflows' | 'apps' | 'data-safety'
  const [selectedWf, setSelectedWf] = useState(workflowTemplates[0]);

  // States mời nhân sự mới
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState('STAFF');
  const [inviteRegion, setInviteRegion] = useState('Miền Bắc');
  const [invitePosition, setInvitePosition] = useState('Chuyên viên Kinh doanh');
  const [lastInvitedLink, setLastInvitedLink] = useState(null);

  // States thêm miniapp
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppIcon, setNewAppIcon] = useState('🔗');

  // States sao lưu & an toàn dữ liệu
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState('MERGE'); // 'MERGE' | 'OVERWRITE'
  const [importStatus, setImportStatus] = useState(null);
  const [integrityStats, setIntegrityStats] = useState(() => getDataIntegrityStats ? getDataIntegrityStats() : null);

  const handleRefreshStats = () => {
    if (getDataIntegrityStats) {
      setIntegrityStats(getDataIntegrityStats());
    }
  };

  const handleDownloadBackup = () => {
    if (exportSystemBackupJson) {
      exportSystemBackupJson();
      handleRefreshStats();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText(event.target.result);
      setImportStatus('✓ Đã tải file sao lưu thành công. Chọn chế độ và nhấn "Thực Hiện" bên dưới.');
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      alert('Vui lòng chọn file sao lưu hoặc dán nội dung JSON vào khung.');
      return;
    }
    if (importMode === 'OVERWRITE') {
      if (!window.confirm('⚠️ CẢNH BÁO: Chế độ GHI ĐÈ TOÀN BỘ sẽ thay thế dữ liệu hiện tại bằng nội dung file sao lưu. Bạn có chắc chắn muốn tiếp tục?')) {
        return;
      }
    }
    try {
      const res = importSystemBackupJson(importJsonText, importMode);
      if (res.mode === 'MERGE') {
        setImportStatus(`✓ Ghép nối thành công! Đã bổ sung thêm: ${res.added.addedCustomers} khách hàng, ${res.added.addedContracts} hợp đồng, ${res.added.addedRequests} đề xuất mới.`);
      } else {
        setImportStatus('✓ Đã phục hồi dữ liệu toàn hệ thống thành công từ file sao lưu!');
      }
      setImportJsonText('');
      handleRefreshStats();
    } catch (err) {
      alert(err.message);
    }
  };

  // Thao tác gửi thư mời nhân sự
  const handleCreateInvite = (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      const newPerson = invitePerson({
        fullName: inviteName,
        email: inviteEmail,
        phone: invitePhone,
        role: inviteRole,
        region: inviteRegion,
        position: invitePosition
      });

      setLastInvitedLink(newPerson.inviteLink);
      setInviteName('');
      setInviteEmail('');
      setInvitePhone('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopyLink = (link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      alert('✓ Đã sao chép link mời nhân sự vào clipboard:\n' + link);
    } else {
      prompt('Sao chép link mời:', link);
    }
  };

  const handleDeleteStaff = (person) => {
    if (person.id === currentPersonId) {
      alert('Không thể tự xóa tài khoản của bạn đang đăng nhập!');
      return;
    }
    if (window.confirm(`Xác nhận xóa tài khoản nhân sự: "${person.fullName}" (${person.email})?\nThao tác này không thể hoàn tác.`)) {
      try {
        deletePerson(person.id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Thao tác sửa Workflow Step
  const handleAddStep = (wfId) => {
    const stepName = prompt('Nhập tên bước duyệt mới (VD: Kiểm soát nội bộ):');
    if (!stepName) return;

    const roleName = prompt('Nhập vai trò phụ trách (VD: DIRECTOR / MANAGER / ACCOUNTING):', 'DIRECTOR');

    setWorkflowTemplates(prev => prev.map(wf => {
      if (wf.id !== wfId) return wf;
      const nextStepNum = (wf.steps.length) + 1;
      const newStep = {
        stepNumber: nextStepNum,
        name: stepName,
        role: roleName || 'DIRECTOR',
        actionRequired: 'Review / Approve'
      };
      const updatedSteps = [...wf.steps, newStep];
      const updatedWf = { ...wf, steps: updatedSteps };
      setSelectedWf(updatedWf);
      return updatedWf;
    }));
  };

  const handleAddAppLink = (e) => {
    e.preventDefault();
    if (!newAppName || !newAppUrl) return;

    const newApp = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      name: newAppName,
      description: newAppDesc,
      url: newAppUrl,
      icon: newAppIcon || '🔗',
      active: true
    };

    setAppLinks(prev => [...prev, newApp]);
    setNewAppName('');
    setNewAppDesc('');
    setNewAppUrl('');
  };

  const toggleAppActive = (id) => {
    setAppLinks(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Quản Trị Hệ Thống & Nhân Sự Nội Bộ</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Cổng quản trị nội bộ: Phân quyền đăng nhập, gửi thư mời nhân sự, cấu hình quy trình phê duyệt (Workflow) và an toàn dữ liệu.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handleDownloadBackup} title="Tải file sao lưu JSON an toàn">
              💾 Tải Sao Lưu JSON
            </button>
            <button className="btn btn-secondary btn-sm" onClick={resetToFactoryDefault} title="Khôi phục trạng thái xuất xưởng">
              🔄 Khôi Phục Dữ Liệu Mẫu
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', overflowX: 'auto' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('staff')}
          >
            👥 Quản Lý Nhân Sự & Thư Mời (Staff & Invites)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'workflows' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('workflows')}
          >
            ⚡ Cấu Hình Quy Trình Phê Duyệt (Workflow Engine)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'apps' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('apps')}
          >
            📱 Quản Lý Liên Kết Miniapp Ngoại (App Links)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'data-safety' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveSubTab('data-safety');
              handleRefreshStats();
            }}
          >
            💾 An Toàn Dữ Liệu & Sao Lưu (Data Safety & Backup)
          </button>
        </div>

        {/* 1. STAFF MANAGEMENT & INVITATIONS */}
        {activeSubTab === 'staff' && (
          <div>
            {/* Stat Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Tổng Nhân Sự Hệ Thống</span>
                <strong style={{ fontSize: '22px', color: 'var(--gf-ink)' }}>{people.length}</strong>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Đang Hoạt Động</span>
                <strong style={{ fontSize: '22px', color: '#16a34a' }}>
                  {people.filter(p => p.status !== 'INACTIVE').length}
                </strong>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Thư Mời / Token Đã Cấp</span>
                <strong style={{ fontSize: '22px', color: 'var(--gf-primary)' }}>
                  {people.filter(p => p.inviteCode).length}
                </strong>
              </div>
            </div>

            {/* Form mời nhân sự mới */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--gf-ink)' }}>
                    ✉️ Phát Hành Thư Mời & Cấp Quyền Cho Nhân Sự Mới
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Nhân sự được mời sẽ đăng nhập vào cổng thông tin, chỉ xem thông tin của mình nhưng có toàn quyền thực hiện các nghiệp vụ.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateInvite} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="VD: Trần Văn Bình"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Email công việc *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="binh.tv@genkifami.vn"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0912345678"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Vai trò đăng nhập
                  </label>
                  <select
                    className="form-input"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="STAFF">Chuyên viên Vận hành (Staff)</option>
                    <option value="CTV">Cộng tác viên Kinh doanh (CTV)</option>
                    <option value="PARTNER">Chuyên gia Đối tác (Partner)</option>
                    <option value="ACCOUNTING">Bộ phận Kế toán (Accounting)</option>
                    <option value="MANAGER">Quản lý Bộ phận (Manager)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Khu vực công tác
                  </label>
                  <select
                    className="form-input"
                    value={inviteRegion}
                    onChange={(e) => setInviteRegion(e.target.value)}
                  >
                    <option value="Miền Bắc">Miền Bắc (Hà Nội & lân cận)</option>
                    <option value="Miền Nam">Miền Nam (TP.HCM & lân cận)</option>
                    <option value="Miền Trung">Miền Trung (Đà Nẵng & miền Trung)</option>
                    <option value="Toàn quốc">Toàn quốc</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
                  <IconPlus size={14} />
                  <span>Cấp Thư Mời Mới</span>
                </button>
              </form>

              {lastInvitedLink && (
                <div style={{ marginTop: '14px', padding: '12px', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>
                    🎉 <strong>Đã sinh link mời thành công:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{lastInvitedLink}</span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleCopyLink(lastInvitedLink)}
                  >
                    📋 Sao Chép Link Mời
                  </button>
                </div>
              )}
            </div>

            {/* Bảng danh sách nhân sự */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Nhân Sự</th>
                    <th scope="col">Liên Hệ</th>
                    <th scope="col">Vai Trò & Chức Danh</th>
                    <th scope="col">Khu Vực</th>
                    <th scope="col">Trạng Thái</th>
                    <th scope="col">Mã Thư Mời</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map(person => {
                    const isSelf = person.id === currentPersonId;
                    const isActive = person.status !== 'INACTIVE';
                    return (
                      <tr key={person.id} style={{ background: isSelf ? '#f0fdf4' : 'transparent' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gf-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                              {person.fullName ? person.fullName.charAt(0) : 'U'}
                            </div>
                            <div>
                              <strong>{person.fullName}</strong>
                              {isSelf && (
                                <span style={{ marginLeft: '6px', fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  Bạn đang đăng nhập
                                </span>
                              )}
                              <small style={{ display: 'block', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {person.id}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px' }}>{person.email || '—'}</div>
                          <small style={{ color: 'var(--text-muted)' }}>{person.phone || '—'}</small>
                        </td>
                        <td>
                          <span className="badge badge-action" style={{ textTransform: 'uppercase' }}>
                            {person.role}
                          </span>
                          <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {person.position || 'Nhân sự'}
                          </small>
                        </td>
                        <td>{person.region || 'Toàn quốc'}</td>
                        <td>
                          <span className={`badge ${isActive ? 'badge-approved' : 'badge-draft'}`}>
                            {isActive ? 'Đang hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td>
                          {person.inviteCode ? (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px' }}>
                              {person.inviteCode}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Tài khoản gốc</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {person.inviteLink && (
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Sao chép link mời"
                                onClick={() => handleCopyLink(person.inviteLink)}
                              >
                                📋 Link
                              </button>
                            )}

                            {!isSelf && (
                              <>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  title="Chuyển sang đăng nhập tài khoản này"
                                  onClick={() => {
                                    setCurrentPersonId(person.id);
                                    alert(`Đã chuyển đổi ngữ cảnh đăng nhập sang: ${person.fullName} (${person.role})`);
                                  }}
                                >
                                  🎭 Thử nghiệm
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  title={isActive ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                                  onClick={() => togglePersonStatus(person.id)}
                                >
                                  {isActive ? '🔒 Khóa' : '🔓 Mở'}
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                                  title="Xóa nhân sự khỏi hệ thống"
                                  onClick={() => handleDeleteStaff(person)}
                                >
                                  🗑️
                                </button>
                              </>
                            )}
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

        {/* 1. WORKFLOW ENGINE CONFIGURATION */}
        {activeSubTab === 'workflows' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
            {/* Danh sách templates */}
            <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Danh Sách Quy Trình
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {workflowTemplates.map(wf => (
                  <button
                    key={wf.id}
                    className={`btn btn-sm ${selectedWf?.id === wf.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    onClick={() => setSelectedWf(wf)}
                  >
                    {wf.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chi tiết các bước của template đang chọn */}
            <div>
              {selectedWf && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gf-ink)' }}>
                        {selectedWf.name}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedWf.description}</p>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddStep(selectedWf.id)}
                    >
                      <IconPlus size={14} />
                      <span>Thêm Bước Duyệt</span>
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="data-table">
                      <caption className="visually-hidden">Các bước trong quy trình phê duyệt</caption>
                      <thead>
                        <tr>
                          <th scope="col">Thứ Tự</th>
                          <th scope="col">Tên Bước Quy Trình</th>
                          <th scope="col">Vai Trò Chịu Trách Nhiệm</th>
                          <th scope="col">Yêu Cầu Hành Động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWf.steps.map(step => (
                          <tr key={step.stepNumber}>
                            <td><strong>Bước {step.stepNumber}</strong></td>
                            <td>{step.name}</td>
                            <td>
                              <span className="badge badge-action">{step.role}</span>
                            </td>
                            <td>
                              <small style={{ color: 'var(--text-muted)' }}>{step.actionRequired}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    💡 <strong>Nguyên tắc Snapshot:</strong> Khi một đề nghị được submit, hệ thống chụp lại bản snapshot của workflow tại thời điểm đó để đảm bảo việc chỉnh sửa cấu hình quy trình sau này không làm ảnh hưởng đến các đề nghị đang xử lý dở dang.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. EXTERNAL MINIAPPS MANAGEMENT */}
        {activeSubTab === 'apps' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                Thêm Liên Kết Ứng Dụng Vệ Tinh Mới:
              </span>
              <form onSubmit={handleAddAppLink} style={{ display: 'grid', gridTemplateColumns: '60px 200px 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Icon"
                  value={newAppIcon}
                  onChange={(e) => setNewAppIcon(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Tên ứng dụng"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                />
                <input
                  type="url"
                  className="form-input"
                  required
                  placeholder="https://..."
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Mô tả chức năng"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Thêm App
                </button>
              </form>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <caption className="visually-hidden">Danh sách ứng dụng và miniapps vệ tinh</caption>
                <thead>
                  <tr>
                    <th scope="col">Ứng Dụng Vệ Tinh</th>
                    <th scope="col">Mô Tả Chức Năng</th>
                    <th scope="col">Đường Dẫn URL</th>
                    <th scope="col">Trạng Thái</th>
                    <th scope="col">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {appLinks.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{app.icon}</span>
                          <strong>{app.name}</strong>
                        </div>
                      </td>
                      <td>{app.description}</td>
                      <td>
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--gf-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{app.url}</span>
                          <IconExternal size={12} />
                        </a>
                      </td>
                      <td>
                        <span className={`badge ${app.active ? 'badge-approved' : 'badge-draft'}`}>
                          {app.active ? 'Đang kích hoạt' : 'Tắt'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleAppActive(app.id)}
                        >
                          {app.active ? 'Tắt' : 'Bật'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. DATA SAFETY, AUDIT & BACKUP */}
        {activeSubTab === 'data-safety' && (
          <div>
            {/* Live Data Integrity Status Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,105,100,0.06) 0%, rgba(81,191,157,0.12) 100%)',
              border: '1px solid var(--stitch-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-approved" style={{ fontSize: '13px', padding: '4px 10px' }}>
                  🟢 TRẠNG THÁI: BẢO TOÀN DỮ LIỆU ĐÃ NẠP (ZERO OVERWRITE)
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Khóa lưu trữ: <code>{integrityStats?.storageKey || 'genki_sales_portal_v1'}</code>
                </span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--gf-ink)' }}>
                🛡️ Hệ Thống Bảo Vệ & Giám Sát Tính Toàn Vẹn Của Dữ Liệu
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Tất cả dữ liệu bạn đã nạp vào từ trước (khách hàng, hợp đồng, đề xuất, nhân sự) được tự động bảo vệ trên bộ nhớ trình duyệt. Quá trình nâng cấp tính năng, bổ sung logic hay phân quyền tuyệt đối <strong>không bao giờ xóa hay ghi đè</strong> lên các dữ liệu hiện có của bạn.
              </p>
            </div>

            {/* 4 Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>🏢 Khách Hàng / Đối Tác</span>
                  <span className="badge badge-primary">Sống</span>
                </div>
                <strong style={{ fontSize: '24px', color: 'var(--gf-ink)', display: 'block', marginTop: '6px' }}>
                  {customers.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bản ghi khách hàng đang lưu</span>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>📜 Hợp Đồng Thương Mại</span>
                  <span className="badge badge-primary">Sống</span>
                </div>
                <strong style={{ fontSize: '24px', color: 'var(--gf-ink)', display: 'block', marginTop: '6px' }}>
                  {contracts.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hợp đồng & phụ lục</span>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>⚡ Đề Xuất & Tác Nghiệp</span>
                  <span className="badge badge-primary">Sống</span>
                </div>
                <strong style={{ fontSize: '24px', color: 'var(--gf-ink)', display: 'block', marginTop: '6px' }}>
                  {requests.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hồ sơ công tác / tạm ứng</span>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>👥 Nhân Sự Hệ Thống</span>
                  <span className="badge badge-primary">Sống</span>
                </div>
                <strong style={{ fontSize: '24px', color: 'var(--gf-ink)', display: 'block', marginTop: '6px' }}>
                  {people.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tài khoản nội bộ & CTV</span>
              </div>
            </div>

            {/* Main Action Grid: Backup vs Restore */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Box 1: 1-Click Backup Export */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📥</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--gf-ink)' }}>
                    Xuất Bản Sao Lưu Dự Phòng (Backup JSON)
                  </h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Tải ngay một file snapshot <code>.json</code> chứa toàn bộ dữ liệu của bạn về máy tính. Bạn có thể lưu vào Google Drive hoặc chuyển sang máy tính khác bất kỳ lúc nào.
                </p>

                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px', margin: '0 0 20px 0', lineHeight: 1.7 }}>
                  <li>✓ Lưu trọn vẹn danh bạ {customers.length} khách hàng và mã số thuế</li>
                  <li>✓ Lưu toàn bộ {contracts.length} hợp đồng cùng mẫu biểu tùy biến</li>
                  <li>✓ Lưu lịch sử {requests.length} đề xuất và timeline dấu số</li>
                  <li>✓ Dung lượng file gọn nhẹ (~{(integrityStats?.storageSizeKb || 25)} KB)</li>
                </ul>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDownloadBackup}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
                >
                  <span>💾 Tải Xuống Bản Sao Lưu Dự Phòng (JSON)</span>
                </button>
              </div>

              {/* Box 2: Smart Restore & Merge */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📤</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--gf-ink)' }}>
                    Phục Hồi Dữ Liệu Từ Bản Sao Lưu
                  </h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                  Chọn file sao lưu JSON đã tải về trước đó để phục hồi hoặc ghép nối vào hệ thống.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Chọn file JSON từ máy tính:
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Chế độ nạp dữ liệu:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="importMode"
                        value="MERGE"
                        checked={importMode === 'MERGE'}
                        onChange={() => setImportMode('MERGE')}
                      />
                      <span><strong>Ghép nối thông minh (Merge)</strong> — <em>Khuyến nghị</em>: Giữ nguyên dữ liệu hiện tại, chỉ bổ sung bản ghi mới.</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="importMode"
                        value="OVERWRITE"
                        checked={importMode === 'OVERWRITE'}
                        onChange={() => setImportMode('OVERWRITE')}
                      />
                      <span><strong>Đồng bộ toàn bộ (Overwrite)</strong>: Khôi phục chính xác theo file sao lưu.</span>
                    </label>
                  </div>
                </div>

                {importStatus && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: importStatus.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${importStatus.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                    color: importStatus.startsWith('✓') ? '#166534' : '#991b1b',
                    fontSize: '12px',
                    marginBottom: '14px'
                  }}>
                    {importStatus}
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!importJsonText}
                  onClick={handleExecuteImport}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}
                >
                  <span>⚡ Thực Hiện Nạp Dữ Liệu</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#9f1239' }}>
                  ⚠️ Vùng Nguy Hiểm: Khôi Phục Dữ Liệu Mẫu Xuất Xưởng
                </h5>
                <p style={{ fontSize: '12px', color: '#881337', margin: 0 }}>
                  Thao tác này chỉ dùng khi bạn muốn xóa toàn bộ dữ liệu tự nạp để kiểm thử lại từ đầu. Hệ thống yêu cầu gõ chữ <code>RESET</code> và tự động tạo một bản snapshot dự phòng trước khi thực hiện.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={resetToFactoryDefault}
                style={{ backgroundColor: '#e11d48', color: '#ffffff', border: 'none', fontWeight: 600 }}
              >
                🔄 Khôi Phục Dữ Liệu Mẫu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
