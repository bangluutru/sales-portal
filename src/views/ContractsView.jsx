import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatVND, formatDate, numberToVietnameseWords } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import { IconPlus, IconClose, IconContracts } from '../components/Icons.jsx';
import { exportContractToDocx } from '../utils/contractDocxGenerator.js';
import { DEFAULT_BONUS_TIERS } from '../utils/constants.js';
import ContractMiniDocEditor from '../components/ContractMiniDocEditor.jsx';
import '../styles/contractPrint.css';

export default function ContractsView() {
  const {
    contracts,
    people,
    contractTemplates,
    currentPerson,
    addContract,
    updateContract,
    updateContractStatus
  } = useApp();

  // Tab navigation: 'list' | 'templates'
  const [activeContractTab, setActiveContractTab] = useState('list');

  // Modals & Editor states
  const [selectedContract, setSelectedContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Loading & export feedback state
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);

  // Form states tạo hợp đồng
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [templateId, setTemplateId] = useState(contractTemplates[0]?.id || 'TPL-HTKD');
  const [contractType, setContractType] = useState('HTKD');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
  
  // Financial parameters (HTKD specific + general)
  const [salary, setSalary] = useState('8000000'); // PCB
  const [allowance, setAllowance] = useState('7000000'); // PKT
  const [travelAllowance, setTravelAllowance] = useState('');
  const [kpiTargetRevenue, setKpiTargetRevenue] = useState('100000000');
  const [probationMonths, setProbationMonths] = useState(3);
  const [quarterBonusRate, setQuarterBonusRate] = useState(0.5);
  const [yearBonusRate, setYearBonusRate] = useState(0.2);
  const [commissionDescription, setCommissionDescription] = useState('Thưởng bậc thang tháng 1.0% - 4.0% + Thưởng Quý 0.5% + Thưởng Năm 0.2%');
  const [targetDescription, setTargetDescription] = useState('Doanh số tháng tối thiểu 100.000.000đ; mở mới tối thiểu 5 điểm bán dược phẩm/tháng');
  const [territoryDescription, setTerritoryDescription] = useState('Hà Nội và các tỉnh phía Bắc');
  const [additionalTerms, setAdditionalTerms] = useState('Tuân thủ quy chuẩn hình ảnh thương hiệu và bảng giá niêm yết của Genki Fami.');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');

  const role = currentPerson.role;

  // Lọc hợp đồng theo phân quyền:
  // - CTV / Staff: CHỈ xem hợp đồng của chính mình
  // - Manager: Xem hợp đồng của nhân sự do mình quản lý
  // - Director / Admin / Accounting: Xem tất cả
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

  // Selected person details for form
  const selectedPersonForForm = people.find(p => p.id === personId);

  // Mở modal tạo từ template cụ thể
  const handleOpenCreateWithTemplate = (tplId) => {
    setTemplateId(tplId);
    if (tplId.includes('HTKD')) {
      setContractType('HTKD');
      setSalary('8000000');
      setAllowance('7000000');
      setKpiTargetRevenue('100000000');
    } else if (tplId.includes('CTV')) {
      setContractType('CTV');
      setSalary('8000000');
      setAllowance('1500000');
    } else {
      setContractType('STAFF');
      setSalary('15000000');
      setAllowance('3000000');
    }
    setShowCreateModal(true);
  };

  const handleCreateContract = (e) => {
    e.preventDefault();
    const newContractData = {
      personId,
      contractType,
      templateId,
      startDate,
      endDate,
      salary: Number(salary) || 0,
      allowance: Number(allowance) || 0,
      travelAllowance: Number(travelAllowance) || 0,
      kpiTargetRevenue: Number(kpiTargetRevenue) || 100000000,
      probationMonths: Number(probationMonths) || 3,
      quarterBonusRate: Number(quarterBonusRate) || 0.5,
      yearBonusRate: Number(yearBonusRate) || 0.2,
      bonusTiers: DEFAULT_BONUS_TIERS,
      commissionDescription,
      targetDescription,
      territoryDescription,
      additionalTerms,
      driveFolderUrl: driveFolderUrl || 'https://drive.google.com/drive/folders/genki-contract-new'
    };
    addContract(newContractData);
    setShowCreateModal(false);
  };

  // Helper xuất DOCX nhanh
  const handleExportDocx = async (contractToExport) => {
    if (!contractToExport) return;
    try {
      setIsExportingDocx(true);
      setExportFeedback('Đang kết xuất tệp tin Microsoft Word (.docx)...');
      const person = people.find(p => p.id === contractToExport.personId);
      const template = contractTemplates.find(t => t.id === contractToExport.templateId);
      await exportContractToDocx(contractToExport, person, template);
      setExportFeedback('✓ Đã xuất và tải về file Word thành công!');
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err) {
      console.error('Lỗi xuất DOCX:', err);
      setExportFeedback('❌ Đã xảy ra lỗi khi tạo tệp Word: ' + err.message);
      setTimeout(() => setExportFeedback(null), 5000);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const targetPerson = selectedContract ? people.find(p => p.id === selectedContract.personId) : people[0];

  return (
    <div className="page-container">
      {/* Top Header Card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <IconContracts size={22} />
              <h2 className="card-title" style={{ fontSize: '20px' }}>
                Quản Lý Hợp Đồng & Thư Viện Mẫu Chuẩn
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Hệ thống chuẩn hóa hợp đồng đối tác, chuyên gia & cộng tác viên theo Bộ luật Dân sự. Tích hợp Mini Doc Editor chỉnh sửa trực quan, tự động tính toán PCB - PKT, xuất file Word (.docx) và PDF A4 chuẩn vector.
            </p>
          </div>

          {(role === 'MANAGER' || role === 'DIRECTOR' || role === 'ADMIN') && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenCreateWithTemplate('TPL-HTKD')}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPlus size={15} />
              <span>+ Soạn Hợp Đồng Mới</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="contracts-tabs">
          <button
            className={`contract-tab-btn ${activeContractTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveContractTab('list')}
          >
            📋 Danh Sách Hợp Đồng ({visibleContracts.length})
          </button>
          <button
            className={`contract-tab-btn ${activeContractTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveContractTab('templates')}
          >
            📑 Thư Viện Hợp Đồng Mẫu ({contractTemplates.length})
          </button>
        </div>
      </div>

      {/* TAB 1: DANH SÁCH HỢP ĐỒNG */}
      {activeContractTab === 'list' && (
        <div className="card">
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
                    <th scope="col">Đối Tác / Nhân Sự</th>
                    <th scope="col">Mẫu & Loại HĐ</th>
                    <th scope="col">Thời Hạn Hiệu Lực</th>
                    <th scope="col">Thù Lao (PCB / PKT)</th>
                    <th scope="col">Trạng Thái</th>
                    <th scope="col">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleContracts.map(c => {
                    const person = people.find(p => p.id === c.personId);
                    const isHtkd = c.templateId === 'TPL-HTKD' || c.contractType === 'HTKD';

                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.contractCode}</strong>
                          {c.hasCustomEdits && (
                            <div>
                              <span style={{ fontSize: '10.5px', color: '#d97706', fontWeight: 600 }}>
                                ✏️ Đã sửa tùy biến
                              </span>
                            </div>
                          )}
                          <div><small style={{ color: 'var(--text-muted)' }}>Tạo bởi: {c.createdBy}</small></div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{person?.fullName}</div>
                          <small style={{ color: 'var(--text-muted)' }}>
                            {person?.genderTitle || 'Ông/Bà'} • {person?.position}
                          </small>
                        </td>
                        <td>
                          <div>
                            <span className="badge" style={{
                              backgroundColor: isHtkd ? 'rgba(0, 105, 100, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                              color: isHtkd ? 'var(--gf-primary)' : '#0284c7',
                              fontWeight: 700
                            }}>
                              {c.contractType}
                            </span>
                          </div>
                          <small style={{ color: 'var(--text-secondary)' }}>{c.territoryDescription}</small>
                        </td>
                        <td>
                          <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
                          {c.probationMonths && (
                            <small style={{ color: 'var(--text-muted)' }}>Thử việc: {c.probationMonths} tháng</small>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          <div>PCB: {formatVND(c.salary)}</div>
                          {c.allowance > 0 && (
                            <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                              PKT: {formatVND(c.allowance)}
                            </small>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedContract(c)}
                              title="Xem chi tiết phê duyệt"
                            >
                              Chi Tiết
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setEditingContract(c)}
                              title="Mở Mini Doc Editor: Xem, chỉnh sửa từng điều khoản và xuất file DOCX/PDF chuẩn"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span>✏️ Soạn Thảo & In A4</span>
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
      )}

      {/* TAB 2: THƯ VIỆN HỢP ĐỒNG MẪU */}
      {activeContractTab === 'templates' && (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ padding: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                Thư Viện Hợp Đồng Mẫu Tiêu Chuẩn (Standard Legal Templates)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Các mẫu hợp đồng được xây dựng căn cứ theo Bộ luật Dân sự 2015, phù hợp đặc thù phân phối thực phẩm chăm sóc sức khỏe Genki Fami Nhật Bản. Khi tạo hợp đồng, hệ thống sẽ tự động tổng hợp CCCD, mã số thuế, số tài khoản, cơ chế thù lao và sinh văn bản ngay lập tức.
              </p>
            </div>
          </div>

          <div className="template-grid">
            {contractTemplates.map((tpl) => {
              const isRecommended = tpl.id === 'TPL-HTKD';

              return (
                <div key={tpl.id} className="template-card" style={{
                  border: isRecommended ? '2px solid var(--gf-primary)' : '1px solid var(--border-color)',
                  position: 'relative'
                }}>
                  {isRecommended && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '16px',
                      background: 'var(--gf-primary)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 6px rgba(0, 105, 100, 0.3)'
                    }}>
                      ⭐ Chuẩn Genki Fami Khuyên Dùng
                    </div>
                  )}

                  <div>
                    <div className="template-card-header">
                      <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {tpl.name}
                      </h4>
                      <span className="template-badge">
                        {tpl.category || 'Mẫu Chuẩn'}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {tpl.description}
                    </p>

                    <div style={{
                      background: 'var(--bg-subtle)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        Các trường dữ liệu tự động thay thế:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        <code style={{ fontSize: '11px' }}>{`{{full_name}}`}</code>
                        <code style={{ fontSize: '11px' }}>{`{{identity_number}}`}</code>
                        <code style={{ fontSize: '11px' }}>{`{{salary}} (PCB)`}</code>
                        <code style={{ fontSize: '11px' }}>{`{{allowance}} (PKT)`}</code>
                        <code style={{ fontSize: '11px' }}>{`{{kpi_target}}`}</code>
                        <code style={{ fontSize: '11px' }}>{`{{bonus_tiers_text}}`}</code>
                        <code style={{ fontSize: '11px' }}>{`{{quarter_bonus_rate}}`}</code>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {(role === 'MANAGER' || role === 'DIRECTOR' || role === 'ADMIN') && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleOpenCreateWithTemplate(tpl.id)}
                      >
                        + Soạn Hợp Đồng Từ Mẫu
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewTemplate(tpl)}
                    >
                      👁️ Xem Mẫu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT HỢP ĐỒNG (Nghiệp vụ + Phê duyệt) */}
      {selectedContract && !editingContract && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '800px' }}>
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
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Đối tác / Nhân sự thụ hưởng:</span>
                  <div style={{ fontWeight: 600 }}>{targetPerson?.fullName} ({targetPerson?.phone})</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    CCCD: {targetPerson?.identityNumber} • Cấp ngày: {targetPerson?.identityDate}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thời hạn hợp đồng:</span>
                  <div>{formatDate(selectedContract.startDate)} đến {formatDate(selectedContract.endDate)}</div>
                  {selectedContract.probationMonths && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Thời gian thử thách năng lực: {selectedContract.probationMonths} tháng
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phí dịch vụ cơ bản (PCB):</span>
                  <div style={{ fontWeight: 700, color: 'var(--gf-primary)', fontSize: '16px' }}>
                    {formatVND(selectedContract.salary)} / tháng
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>({numberToVietnameseWords(selectedContract.salary)})</small>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phí hỗ trợ khai thác (PKT):</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px' }}>
                    {formatVND(selectedContract.allowance)} / tháng
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>({numberToVietnameseWords(selectedContract.allowance)})</small>
                </div>
                {selectedContract.kpiTargetRevenue && (
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chỉ tiêu KPI Doanh Thu Tháng:</span>
                    <div style={{ fontWeight: 600, color: '#b45309' }}>
                      {formatVND(selectedContract.kpiTargetRevenue)} / tháng
                    </div>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Địa bàn phụ trách:</span>
                  <div>{selectedContract.territoryDescription}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chỉ tiêu định mức & Cơ chế hoa hồng:</span>
                <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                  {selectedContract.commissionDescription || selectedContract.targetDescription || 'Theo quy chế kinh doanh'}
                </div>
              </div>

              {/* Action bar xuất file nhanh */}
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                margin: '16px 0',
                padding: '12px',
                background: 'rgba(0, 105, 100, 0.05)',
                border: '1px solid rgba(0, 105, 100, 0.2)',
                borderRadius: 'var(--radius-md)'
              }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const c = selectedContract;
                    setSelectedContract(null);
                    setEditingContract(c);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>✏️ Mở Mini Doc Editor & Xuất File A4</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleExportDocx(selectedContract)}
                  disabled={isExportingDocx}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📥 {isExportingDocx ? 'Đang tạo Word...' : 'Tải File Word (.docx)'}</span>
                </button>
                <DriveLinkButton url={selectedContract.driveFolderUrl} label="Thư Mục Drive Hợp Đồng" />
              </div>

              {exportFeedback && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  background: exportFeedback.includes('✓') ? '#dcfce7' : '#fef3c7',
                  color: exportFeedback.includes('✓') ? '#166534' : '#92400e',
                  marginBottom: '12px'
                }}>
                  {exportFeedback}
                </div>
              )}

              {/* Thao tác duyệt hợp đồng theo vai trò */}
              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Quy Trình Phê Duyệt Nghiệp Vụ:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

      {/* MINI DOC EDITOR MODAL (WYSIWYG A4 Canvas, Editing Toolbar, Isolated Print & PDF Download) */}
      {editingContract && (
        <ContractMiniDocEditor
          contract={editingContract}
          person={people.find(p => p.id === editingContract.personId) || people[0]}
          template={contractTemplates.find(t => t.id === editingContract.templateId) || contractTemplates[0]}
          onClose={() => setEditingContract(null)}
          onSave={(contractId, updates) => {
            updateContract(contractId, updates);
            setEditingContract(prev => prev ? { ...prev, ...updates } : null);
          }}
        />
      )}

      {/* MODAL XEM MẪU TEMPLATE (Text Preview) */}
      {previewTemplate && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Cấu Trúc Hợp Đồng Mẫu: {previewTemplate.name}
                </h3>
                <small style={{ color: 'var(--text-muted)' }}>Mã template: {previewTemplate.id}</small>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreviewTemplate(null)}>
                <IconClose size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge" style={{ backgroundColor: 'var(--gf-primary-light)', color: 'var(--gf-primary)', fontWeight: 600 }}>
                  {previewTemplate.category || 'Mẫu Chuẩn'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {previewTemplate.description}
                </span>
              </div>
              <pre style={{
                background: '#f8faf9',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                maxHeight: '440px',
                overflowY: 'auto'
              }}>
                {previewTemplate.templateContent}
              </pre>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const tplId = previewTemplate.id;
                  setPreviewTemplate(null);
                  handleOpenCreateWithTemplate(tplId);
                }}
              >
                + Soạn Thảo Hợp Đồng Từ Mẫu Này
              </button>
              <button className="btn btn-secondary" onClick={() => setPreviewTemplate(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO HỢP ĐỒNG MỚI */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Soạn Thảo Hợp Đồng Nhân Sự / Đối Tác</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                <IconClose size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateContract}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Chọn Đối Tác / Nhân Sự Thụ Hưởng *</label>
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
                    <label className="form-label">Mẫu Hợp Đồng Áp Dụng *</label>
                    <select
                      className="form-select"
                      value={templateId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTemplateId(val);
                        if (val.includes('HTKD')) {
                          setContractType('HTKD');
                          setSalary('8000000');
                          setAllowance('7000000');
                        } else if (val.includes('CTV')) {
                          setContractType('CTV');
                          setSalary('8000000');
                          setAllowance('1500000');
                        } else {
                          setContractType('STAFF');
                          setSalary('15000000');
                          setAllowance('3000000');
                        }
                      }}
                    >
                      {contractTemplates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.id === 'TPL-HTKD' ? '⭐' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Thông tin nhân thân tự động điền */}
                {selectedPersonForForm && (
                  <div style={{
                    background: 'rgba(0, 105, 100, 0.04)',
                    border: '1px solid rgba(0, 105, 100, 0.15)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    fontSize: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--gf-primary)' }}>CCCD:</strong>{' '}
                      {selectedPersonForForm.identityNumber || 'Chưa cập nhật'} (Cấp {selectedPersonForForm.identityDate || '—'})
                    </div>
                    <div>
                      <strong style={{ color: 'var(--gf-primary)' }}>Ngân hàng:</strong>{' '}
                      {selectedPersonForForm.bankAccount} - {selectedPersonForForm.bankName}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--gf-primary)' }}>Địa chỉ thường trú:</strong>{' '}
                      {selectedPersonForForm.address}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--gf-primary)' }}>Nơi ở hiện tại:</strong>{' '}
                      {selectedPersonForForm.currentAddress || selectedPersonForForm.address}
                    </div>
                  </div>
                )}

                {/* Mức thù lao & Phụ cấp */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {templateId === 'TPL-HTKD' ? 'Phí Dịch Vụ Cơ Bản - PCB (VNĐ/tháng) *' : 'Mức Lương / Thù Lao Cơ Bản *'}
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      placeholder="VD: 8000000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                    {salary > 0 && (
                      <small style={{ color: 'var(--text-muted)' }}>
                        Bằng chữ: {numberToVietnameseWords(Number(salary))}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {templateId === 'TPL-HTKD' ? 'Phí Hỗ Trợ Khai Thác - PKT (VNĐ/tháng) *' : 'Phụ Cấp Trách Nhiệm (VNĐ/tháng)'}
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="VD: 7000000"
                      value={allowance}
                      onChange={(e) => setAllowance(e.target.value)}
                    />
                    {allowance > 0 && (
                      <small style={{ color: 'var(--text-muted)' }}>
                        Bằng chữ: {numberToVietnameseWords(Number(allowance))}
                      </small>
                    )}
                  </div>
                </div>

                {/* HTKD specific fields: KPI, Thời hạn thử thách, Thưởng quý/năm */}
                {templateId === 'TPL-HTKD' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Chỉ Tiêu KPI Doanh Thu Tối Thiểu (VNĐ/tháng) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={kpiTargetRevenue}
                          onChange={(e) => setKpiTargetRevenue(e.target.value)}
                        />
                        {kpiTargetRevenue > 0 && (
                          <small style={{ color: 'var(--text-muted)' }}>
                            Bằng chữ: {numberToVietnameseWords(Number(kpiTargetRevenue))}
                          </small>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Thời Gian Thử Thách Năng Lực (Tháng)</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          max="12"
                          value={probationMonths}
                          onChange={(e) => setProbationMonths(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Tỷ Lệ Thưởng Quý (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-input"
                          value={quarterBonusRate}
                          onChange={(e) => setQuarterBonusRate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tỷ Lệ Thưởng Năm (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-input"
                          value={yearBonusRate}
                          onChange={(e) => setYearBonusRate(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày Bắt Đầu Hiệu Lực *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày Kết Thúc *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Địa Bàn Phụ Trách & Phát Triển Thị Trường</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: Thị trường Hà Nội và các tỉnh Đồng Bằng Sông Hồng"
                    value={territoryDescription}
                    onChange={(e) => setTerritoryDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Google Drive Folder Lưu Hồ Sơ Kèm Theo</label>
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
                  Lưu & Khởi Tạo Hợp Đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
