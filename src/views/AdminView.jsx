import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { IconExternal, IconPlus } from '../components/Icons.jsx';

export default function AdminView() {
  const {
    workflowTemplates,
    setWorkflowTemplates,
    appLinks,
    setAppLinks,
    resetToFactoryDefault
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('workflows'); // 'workflows' | 'apps'
  const [selectedWf, setSelectedWf] = useState(workflowTemplates[0]);

  // States thêm miniapp
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppIcon, setNewAppIcon] = useState('🔗');

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
            <h3 className="card-title">Quản Trị Hệ Thống (System Administration)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Cấu hình bộ máy quy trình (Workflow Engine), danh mục ứng dụng vệ tinh (Miniapps) và quản trị dữ liệu.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={resetToFactoryDefault}>
            🔄 Khôi Phục Dữ Liệu Mẫu
          </button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
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
        </div>

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
                      <thead>
                        <tr>
                          <th>Thứ Tự</th>
                          <th>Tên Bước Quy Trình</th>
                          <th>Vai Trò Chịu Trách Nhiệm</th>
                          <th>Yêu Cầu Hành Động</th>
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
                <thead>
                  <tr>
                    <th>Ứng Dụng Vệ Tinh</th>
                    <th>Mô Tả Chức Năng</th>
                    <th>Đường Dẫn URL</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
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
      </div>
    </div>
  );
}
