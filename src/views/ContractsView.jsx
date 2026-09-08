import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatVND, formatDate, compileContractTemplate, numberToVietnameseWords } from '../utils/helpers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import DriveLinkButton from '../components/DriveLinkButton.jsx';
import { IconPlus, IconClose, IconContracts } from '../components/Icons.jsx';
import { exportContractToDocx } from '../utils/contractDocxGenerator.js';
import { DEFAULT_BONUS_TIERS } from '../utils/constants.js';
import '../styles/contractPrint.css';

export default function ContractsView() {
  const {
    contracts,
    people,
    contractTemplates,
    currentPerson,
    addContract,
    updateContractStatus
  } = useApp();

  // Tab navigation: 'list' | 'templates'
  const [activeContractTab, setActiveContractTab] = useState('list');

  // Modals
  const [selectedContract, setSelectedContract] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaperPreviewModal, setShowPaperPreviewModal] = useState(false);
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

  // Helper xuất DOCX
  const handleExportDocx = async (contractToExport) => {
    if (!contractToExport) return;
    try {
      setIsExportingDocx(true);
      setExportFeedback('Đang kết xuất tệp tin Microsoft Word (.docx) chuẩn văn bản...');
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

  // Helper in ấn PDF qua browser
  const handlePrintPdf = () => {
    window.print();
  };

  // Xem trước hợp đồng
  const activeContractForPreview = selectedContract || {
    contractCode: '20260601_HĐHT - DRAFT',
    personId,
    templateId,
    startDate,
    endDate,
    salary: Number(salary) || 8000000,
    allowance: Number(allowance) || 7000000,
    travelAllowance: Number(travelAllowance) || 0,
    kpiTargetRevenue: Number(kpiTargetRevenue) || 100000000,
    probationMonths: Number(probationMonths) || 3,
    quarterBonusRate: Number(quarterBonusRate) || 0.5,
    yearBonusRate: Number(yearBonusRate) || 0.2,
    bonusTiers: DEFAULT_BONUS_TIERS,
    territoryDescription: territoryDescription || 'Hà Nội và các tỉnh phía Bắc',
    targetDescription,
    commissionDescription
  };

  const activeTemplate = contractTemplates.find(t => t.id === activeContractForPreview.templateId) || contractTemplates[0];
  const targetPerson = people.find(p => p.id === activeContractForPreview.personId) || people[0];

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
              Hệ thống chuẩn hóa hợp đồng đối tác, chuyên gia & cộng tác viên theo Bộ luật Dân sự. Tự động điền dữ liệu, tính toán phụ cấp PCB - PKT, xuất file Word (.docx) và in ấn PDF A4.
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
                              title="Xem chi tiết và thao tác phê duyệt"
                            >
                              Chi Tiết
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedContract(c);
                                setShowPaperPreviewModal(true);
                              }}
                              title="Xem bản in A4 và xuất file DOCX/PDF"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span>📄 In / DOCX</span>
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

      {/* Modal Chi Tiết Hợp Đồng (Nghiệp vụ + Trình duyệt) */}
      {selectedContract && !showPaperPreviewModal && (
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
                  onClick={() => setShowPaperPreviewModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📄 Mở Bản In Chuẩn A4 & Xuất File</span>
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

      {/* Modal Xem Bản In A4 & Xuất File Chuẩn (Paper Preview Modal) */}
      {showPaperPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '980px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header no-print">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Văn Bản Hợp Đồng (Xem Trước Chuẩn Khổ Giấy A4)
                </h3>
                <small style={{ color: 'var(--text-muted)' }}>
                  Mã: {activeContractForPreview.contractCode} • Đối tác: {targetPerson?.fullName}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleExportDocx(activeContractForPreview)}
                  disabled={isExportingDocx}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📥 {isExportingDocx ? 'Đang tạo Word...' : 'Xuất File Word (.docx)'}</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrintPdf}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🖨️ In / Xuất PDF (A4)</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowPaperPreviewModal(false)}>
                  <IconClose size={16} />
                </button>
              </div>
            </div>

            {exportFeedback && (
              <div className="no-print" style={{
                padding: '8px 16px',
                background: exportFeedback.includes('✓') ? '#dcfce7' : '#fef3c7',
                color: exportFeedback.includes('✓') ? '#166534' : '#92400e',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {exportFeedback}
              </div>
            )}

            {/* Wrapper cuộn trang giấy A4 */}
            <div className="contract-paper-wrapper">
              {/* TRANG 1: HỢP ĐỒNG CHÍNH */}
              <div className="contract-paper" id="contract-paper-content">
                {/* 1. Quốc hiệu */}
                <div className="cp-national-header">
                  <div className="cp-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="cp-motto">Độc lập – Tự do – Hạnh phúc</div>
                  <div className="cp-divider"></div>
                </div>

                {/* 2. Tiêu đề hợp đồng */}
                <div className="cp-title-area">
                  <div className="cp-title">
                    {activeTemplate?.id === 'TPL-HTKD' ? 'HỢP ĐỒNG HỢP TÁC KINH DOANH' : activeTemplate?.name?.toUpperCase()}
                  </div>
                  <div className="cp-code">Số: {activeContractForPreview.contractCode}</div>
                </div>

                {/* 3. Căn cứ pháp lý */}
                <div className="cp-preamble">
                  <div>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 đã được Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam thông qua ngày 24/11/2015 và có hiệu lực từ ngày 01/01/2017;</div>
                  <div>- Căn cứ nhu cầu và năng lực thực tế của hai bên.</div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  Hôm nay, ngày {formatDate(activeContractForPreview.startDate)}, tại Văn phòng Công ty Cổ phần Genki Fami Việt Nam, chúng tôi gồm có:
                </div>

                {/* Bên A */}
                <div className="cp-party-section">
                  <div className="cp-party-title">BÊN A (Khách hàng): CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM</div>
                  <div className="cp-party-field"><strong>Đại diện:</strong> Ông LÊ TRÍ NAM &nbsp;&nbsp;&nbsp;&nbsp; <strong>Chức vụ:</strong> Giám đốc Kinh Doanh</div>
                  <div className="cp-party-field"><strong>Địa chỉ:</strong> Tầng 4, Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Mỹ Đình 2, Nam Từ Liêm, Hà Nội</div>
                  <div className="cp-party-field"><strong>Mã số thuế:</strong> 0109405781 &nbsp;&nbsp;&nbsp;&nbsp; <strong>Điện thoại:</strong> 024.6291.6888</div>
                </div>

                {/* Bên B */}
                <div className="cp-party-section">
                  <div className="cp-party-title">
                    BÊN B (Chuyên gia/Đối tác): {targetPerson?.genderTitle || 'ÔNG/BÀ'} {targetPerson?.fullName?.toUpperCase()}
                  </div>
                  <div className="cp-party-field"><strong>Ngày sinh:</strong> {targetPerson?.dateOfBirth ? formatDate(targetPerson.dateOfBirth) : '—'}</div>
                  <div className="cp-party-field">
                    <strong>Số CCCD:</strong> {targetPerson?.identityNumber || '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Ngày cấp:</strong> {targetPerson?.identityDate || '15/06/2021'} &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Nơi cấp:</strong> {targetPerson?.identityPlace || 'Cục Cảnh sát QLHC về TTXH'}
                  </div>
                  <div className="cp-party-field"><strong>Địa chỉ thường trú:</strong> {targetPerson?.address || '—'}</div>
                  <div className="cp-party-field"><strong>Nơi ở hiện tại:</strong> {targetPerson?.currentAddress || targetPerson?.address || '—'}</div>
                  <div className="cp-party-field">
                    <strong>Điện thoại:</strong> {targetPerson?.phone || '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Email:</strong> {targetPerson?.email || '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Mã số thuế:</strong> {targetPerson?.taxNumber || '—'}
                  </div>
                  <div className="cp-party-field">
                    <strong>Tài khoản ngân hàng:</strong> {targetPerson?.bankAccount} tại {targetPerson?.bankName} ({targetPerson?.bankBranch || 'Hà Nội'})
                  </div>
                </div>

                <div style={{ marginBottom: '14px', fontStyle: 'italic' }}>
                  Hai bên cùng thỏa thuận và nhất trí ký kết Hợp đồng với các điều khoản sau:
                </div>

                {/* Điều 1 */}
                <div className="cp-article-title">ĐIỀU 1. NỘI DUNG VÀ PHẠM VI CÔNG VIỆC</div>
                <div className="cp-article-text">
                  1. Bên A đồng ý hợp tác và Bên B đồng ý nhận thực hiện công việc tư vấn, phát triển thị trường, kết nối đối tác phân phối sản phẩm thực phẩm bảo vệ sức khỏe và dinh dưỡng cao cấp thương hiệu Genki Fami Nhật Bản.
                </div>
                <div className="cp-article-text">
                  2. Địa bàn phát triển kinh doanh: <strong>{activeContractForPreview.territoryDescription || 'Toàn quốc'}</strong>.
                </div>
                <div className="cp-article-text">
                  3. Mục tiêu công việc: Xây dựng mạng lưới nhà thuốc, đại lý và khách hàng chiến lược; đạt chỉ tiêu KPI theo thỏa thuận.
                </div>

                {/* Điều 2 */}
                <div className="cp-article-title">ĐIỀU 2. THỜI HẠN HỢP ĐỒNG</div>
                <div className="cp-article-text">
                  1. Hợp đồng có hiệu lực từ ngày <strong>{formatDate(activeContractForPreview.startDate)}</strong> đến hết ngày <strong>{formatDate(activeContractForPreview.endDate)}</strong>.
                </div>
                <div className="cp-article-text">
                  2. Thời gian thử thách năng lực thực tế: <strong>{activeContractForPreview.probationMonths || 3} tháng</strong> kể từ ngày bắt đầu có hiệu lực.
                </div>
                <div className="cp-article-text">
                  3. Hết thời hạn hợp đồng, nếu hai bên có nhu cầu tiếp tục hợp tác sẽ tiến hành gia hạn bằng phụ lục hoặc hợp đồng mới.
                </div>

                {/* Điều 3 */}
                <div className="cp-article-title">ĐIỀU 3. QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN</div>
                <div className="cp-article-text">
                  1. Quyền và nghĩa vụ của Bên A: Cung cấp đầy đủ hồ sơ pháp lý sản phẩm, tài liệu chuyên môn, hóa đơn bán hàng; thanh toán thù lao và các khoản thưởng kinh doanh đúng hạn; thực hiện nghĩa vụ khấu trừ thuế TNCN theo quy định pháp luật.
                </div>
                <div className="cp-article-text">
                  2. Quyền và nghĩa vụ của Bên B: Tận tâm thực hiện công việc, bảo vệ hình ảnh thương hiệu Genki Fami; tuân thủ bảng giá niêm yết và chính sách bán lẻ, tuyệt đối không bán phá giá; báo cáo định kỳ kết quả tiếp cận thị trường cho Quản lý vùng.
                </div>

                {/* Điều 4 */}
                <div className="cp-article-title">ĐIỀU 4. THÙ LAO VÀ PHƯƠNG THỨC THANH TOÁN</div>
                <div className="cp-article-text">
                  1. Cơ chế chi trả thù lao cố định (PCB), phí hỗ trợ khai thác (PKT), chỉ tiêu doanh thu KPI tháng, thang thưởng bậc thang doanh số, thưởng Quý và thưởng Năm được quy định chi tiết tại Phụ Lục 01 đính kèm - là bộ phận cấu thành không thể tách rời của Hợp đồng này.
                </div>
                <div className="cp-article-text">
                  2. Phương thức thanh toán: Chuyển khoản qua tài khoản ngân hàng của Bên B từ ngày 10 đến ngày 15 hàng tháng.
                </div>
                <div className="cp-article-text">
                  3. Hợp đồng này là hợp đồng dịch vụ dân sự, không cấu thành quan hệ lao động theo Bộ luật Lao động.
                </div>

                {/* Điều 5 */}
                <div className="cp-article-title">ĐIỀU 5. ĐIỀU KHOẢN THI HÀNH</div>
                <div className="cp-article-text">
                  1. Hợp đồng có hiệu lực kể từ ngày ký. Mọi sửa đổi, bổ sung phải được lập thành văn bản (Phụ lục hợp đồng).
                </div>
                <div className="cp-article-text">
                  2. Hợp đồng được lập thành 02 (hai) bản bằng tiếng Việt, có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.
                </div>

                {/* Chữ ký Hợp đồng chính */}
                <table className="cp-signatures-table">
                  <tbody>
                    <tr>
                      <td>
                        <div className="cp-signature-role">ĐẠI DIỆN BÊN A</div>
                        <div className="cp-signature-note">(Ký, ghi rõ họ tên và đóng dấu)</div>
                        <div className="cp-signature-name">LÊ TRÍ NAM</div>
                      </td>
                      <td>
                        <div className="cp-signature-role">ĐẠI DIỆN BÊN B</div>
                        <div className="cp-signature-note">(Ký và ghi rõ họ tên)</div>
                        <div className="cp-signature-name">{targetPerson?.fullName?.toUpperCase()}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TRANG 2: PHỤ LỤC 01 (CƠ CHẾ THÙ LAO & THƯỞNG) */}
              <div className="contract-paper contract-paper-appendix">
                <div className="cp-national-header">
                  <div className="cp-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="cp-motto">Độc lập – Tự do – Hạnh phúc</div>
                  <div className="cp-divider"></div>
                </div>

                <div className="cp-title-area">
                  <div className="cp-title" style={{ fontSize: '16px' }}>
                    PHỤ LỤC 01: CƠ CHẾ CHI TRẢ THÙ LAO VÀ THƯỞNG KINH DOANH
                  </div>
                  <div className="cp-code">
                    (Ban hành kèm theo Hợp đồng số: {activeContractForPreview.contractCode})
                  </div>
                </div>

                <div style={{ marginBottom: '14px', fontStyle: 'italic' }}>
                  Căn cứ thỏa thuận tại Điều 4 của Hợp đồng Hợp tác Kinh doanh, hai bên thống nhất chi tiết mức thù lao, chỉ tiêu KPI và thang thưởng như sau:
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>1. Phí dịch vụ cơ bản (PCB):</strong>{' '}
                  <span style={{ fontWeight: 700, color: '#006964' }}>{formatVND(activeContractForPreview.salary)} / tháng</span>
                  <br />
                  <em>(Bằng chữ: {numberToVietnameseWords(activeContractForPreview.salary)})</em>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>2. Phí hỗ trợ khai thác thị trường (PKT):</strong>{' '}
                  <span style={{ fontWeight: 700 }}>{formatVND(activeContractForPreview.allowance)} / tháng</span>
                  <br />
                  <em>(Bằng chữ: {numberToVietnameseWords(activeContractForPreview.allowance)})</em>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <strong>3. Chỉ tiêu doanh thu KPI tối thiểu:</strong>{' '}
                  <span style={{ fontWeight: 700, color: '#b45309' }}>{formatVND(activeContractForPreview.kpiTargetRevenue || 100000000)} / tháng</span>
                  <br />
                  <em>(Bằng chữ: {numberToVietnameseWords(activeContractForPreview.kpiTargetRevenue || 100000000)})</em>
                  <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>
                    * Trường hợp đạt dưới 50% chỉ tiêu Doanh thu tối thiểu: Thu nhập nhận được = PCB.
                  </div>
                </div>

                <div style={{ marginBottom: '8px', fontWeight: 700 }}>
                  4. Cơ chế thưởng theo bậc doanh thu đạt chuẩn tháng:
                </div>

                {/* Bảng bậc thang thưởng tháng */}
                <table className="cp-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>STT</th>
                      <th style={{ width: '18%' }}>Mức Thưởng</th>
                      <th>Doanh Số Mục Tiêu</th>
                      <th style={{ width: '22%' }}>Phụ Cấp</th>
                      <th style={{ width: '28%' }}>Thưởng Doanh Thu Thực Tế</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td><strong>Mức 1</strong></td>
                      <td>120.000.000 đ ~ 200.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}>1.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}><strong>1,0%</strong> Tổng Doanh Thu</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>2</td>
                      <td><strong>Mức 2</strong></td>
                      <td>201.000.000 đ ~ 300.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}>2.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}><strong>1,5%</strong> Tổng Doanh Thu</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>3</td>
                      <td><strong>Mức 3</strong></td>
                      <td>301.000.000 đ ~ 500.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}>3.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}><strong>2,0%</strong> Tổng Doanh Thu</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>4</td>
                      <td><strong>Mức 4</strong></td>
                      <td>Trên 500.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}>5.000.000 đ</td>
                      <td style={{ textAlign: 'right' }}><strong>4,0%</strong> Tổng Doanh Thu</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ marginTop: '14px', marginBottom: '8px' }}>
                  <strong>5. Cơ chế thưởng Quý:</strong> Bên B được thưởng <strong>{activeContractForPreview.quarterBonusRate || 0.5}%</strong> trên tổng doanh thu thực tế của cả quý khi doanh số quý đạt tối thiểu 500.000.000 VNĐ.
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <strong>6. Cơ chế thưởng Năm:</strong> Bên B được thưởng <strong>{activeContractForPreview.yearBonusRate || 0.2}%</strong> trên tổng doanh số lũy kế cả năm khi hoàn thành xuất sắc chỉ tiêu và có thời gian công tác từ 6 tháng trở lên trong năm tài chính.
                </div>

                {/* Chữ ký Phụ lục 01 */}
                <table className="cp-signatures-table" style={{ marginTop: '40px' }}>
                  <tbody>
                    <tr>
                      <td>
                        <div className="cp-signature-role">ĐẠI DIỆN BÊN A</div>
                        <div className="cp-signature-note">(Ký, ghi rõ họ tên và đóng dấu)</div>
                        <div className="cp-signature-name">LÊ TRÍ NAM</div>
                      </td>
                      <td>
                        <div className="cp-signature-role">ĐẠI DIỆN BÊN B</div>
                        <div className="cp-signature-note">(Ký và ghi rõ họ tên)</div>
                        <div className="cp-signature-name">{targetPerson?.fullName?.toUpperCase()}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer no-print">
              <button className="btn btn-secondary" onClick={() => setShowPaperPreviewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Mẫu Template (Text Preview) */}
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

      {/* Modal Tạo Hợp Đồng Mới */}
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
