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

  // HDLD specific parameters
  const [performanceBonus, setPerformanceBonus] = useState('1278630');
  const [mealAllowance, setMealAllowance] = useState('730000');
  const [contractDuration, setContractDuration] = useState('02 năm');
  const [probationPeriod, setProbationPeriod] = useState('02 tháng (Hưởng 85% tổng lương chức danh)');
  const [workLocation, setWorkLocation] = useState('Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh');
  const [workHours, setWorkHours] = useState('48 giờ/tuần (Thứ 2 đến Thứ 7: 8h00 - 17h00)');
  const [jobTitle, setJobTitle] = useState('Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh');
  const [department, setDepartment] = useState('Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh');
  const [reportTo, setReportTo] = useState('Trưởng phòng Vận hành / Ban Giám đốc');

  // HDNT specific parameters
  const [discountRate, setDiscountRate] = useState(18);
  const [firstOrderDebt, setFirstOrderDebt] = useState('12021200');
  const [creditLimit, setCreditLimit] = useState('12021200');
  const [partyBType, setPartyBType] = useState('ENTERPRISE');
  const [partyBCompany, setPartyBCompany] = useState('');
  const [partyBTax, setPartyBTax] = useState('');
  const [partyBRepresentative, setPartyBRepresentative] = useState('');
  const [partyBPosition, setPartyBPosition] = useState('Giám đốc');
  const [partyBAddress, setPartyBAddress] = useState('');

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
    if (tplId.includes('HDNT')) {
      setContractType('HDNT');
      setDiscountRate(18);
      setFirstOrderDebt('12021200');
      setCreditLimit('12021200');
      setPartyBType('ENTERPRISE');
      setPartyBPosition('Giám đốc');
      setTerritoryDescription('Hệ thống đại lý & phân phối');
      setAdditionalTerms('Bảo vệ giá bán lẻ niêm yết, không bán phá giá trên sàn TMĐT; gối đầu công nợ đơn hàng đầu tiên.');
    } else if (tplId.includes('HDLD')) {
      setContractType('HDLD');
      setSalary('7491370');
      setPerformanceBonus('1278630');
      setMealAllowance('730000');
      setContractDuration('02 năm');
      setProbationPeriod('02 tháng (Hưởng 85% tổng lương chức danh)');
      setWorkLocation('Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh');
      setWorkHours('48 giờ/tuần (Thứ 2 đến Thứ 7: 8h00 - 17h00)');
      setJobTitle('Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh');
      setDepartment('Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh');
      setReportTo('Trưởng phòng Vận hành / Ban Giám đốc');
      setTerritoryDescription('Kho vận TP. Hồ Chí Minh & Hệ thống phân phối miền Nam');
    } else if (tplId.includes('HTKD')) {
      setContractType('HTKD');
      setSalary('8000000');
      setAllowance('7000000');
      setKpiTargetRevenue('100000000');
      setTerritoryDescription('Hà Nội và các tỉnh phía Bắc');
    } else if (tplId.includes('CTV')) {
      setContractType('CTV');
      setSalary('8000000');
      setAllowance('1500000');
      setTerritoryDescription('Kênh đại lý & nhà thuốc khu vực');
    } else {
      setContractType('STAFF');
      setSalary('15000000');
      setAllowance('3000000');
      setTerritoryDescription('Văn phòng Tổng công ty');
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
      performanceBonus: Number(performanceBonus) || 0,
      mealAllowance: Number(mealAllowance) || 730000,
      contractDuration: contractDuration || '02 năm',
      probationPeriod: probationPeriod || '02 tháng (Hưởng 85% tổng lương chức danh)',
      workLocation: workLocation || 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh',
      workHours: workHours || '48 giờ/tuần (Thứ 2 đến Thứ 7: 8h00 - 17h00)',
      jobTitle: jobTitle || 'Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh',
      department: department || 'Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh',
      reportTo: reportTo || 'Trưởng phòng Vận hành / Ban Giám đốc',
      travelAllowance: Number(travelAllowance) || 0,
      kpiTargetRevenue: Number(kpiTargetRevenue) || 100000000,
      probationMonths: Number(probationMonths) || 3,
      quarterBonusRate: Number(quarterBonusRate) || 0.5,
      yearBonusRate: Number(yearBonusRate) || 0.2,
      bonusTiers: DEFAULT_BONUS_TIERS,
      // HĐNT specific
      discountRate: Number(discountRate) || 18,
      firstOrderDebt: Number(firstOrderDebt) || 12021200,
      creditLimit: Number(creditLimit) || Number(firstOrderDebt) || 12021200,
      partyBType,
      partyBCompany: partyBCompany || (partyBType === 'ENTERPRISE' ? selectedPersonForForm?.fullName : ''),
      partyBTax: partyBTax || selectedPersonForForm?.taxNumber || '',
      partyBRepresentative: partyBRepresentative || selectedPersonForForm?.fullName || '',
      partyBPosition: partyBPosition || 'Giám đốc',
      partyBAddress: partyBAddress || selectedPersonForForm?.address || '',
      orderProducts: [
        { sku: 'GF-SKM-01', name: 'Thực phẩm bảo vệ sức khỏe Sukoyama M1 (Hộp 120 viên)', unit: 'Hộp', price: 990000, quantity: 4 },
        { sku: 'GF-TSY-01', name: 'Thực phẩm bảo vệ sức khỏe Tsuyoiko (Hộp 90 viên)', unit: 'Hộp', price: 1250000, quantity: 4 },
        { sku: 'GF-ONY-01', name: 'Thực phẩm bảo vệ sức khỏe Onaka Ni Yasashii (Hộp 60 viên)', unit: 'Hộp', price: 790000, quantity: 4 }
      ],
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
                    const isHdld = c.templateId === 'TPL-HDLD' || c.contractType === 'HDLD';
                    const isHdnt = c.templateId === 'TPL-HDNT' || c.contractType === 'HDNT';

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
                              backgroundColor: isHdnt ? 'rgba(99, 102, 241, 0.15)' : isHdld ? 'rgba(16, 185, 129, 0.15)' : isHtkd ? 'rgba(0, 105, 100, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                              color: isHdnt ? '#4f46e5' : isHdld ? '#059669' : isHtkd ? 'var(--gf-primary)' : '#0284c7',
                              fontWeight: 700
                            }}>
                              {c.contractType}
                            </span>
                          </div>
                          <small style={{ color: 'var(--text-secondary)' }}>
                            {isHdnt ? (c.partyBCompany || 'Hệ thống đại lý & phân phối') : isHdld ? (c.jobTitle || 'Kho vận & Bán hàng') : c.territoryDescription}
                          </small>
                        </td>
                        <td>
                          <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
                          {isHdnt ? (
                            <small style={{ color: 'var(--text-muted)' }}>HĐ đại lý 01 năm</small>
                          ) : isHdld ? (
                            <small style={{ color: 'var(--text-muted)' }}>Thời hạn: {c.contractDuration || '02 năm'}</small>
                          ) : c.probationMonths ? (
                            <small style={{ color: 'var(--text-muted)' }}>Thử việc: {c.probationMonths} tháng</small>
                          ) : null}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {isHdnt ? (
                            <>
                              <div>CK: {c.discountRate || 18}%</div>
                              <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                                Gối đầu: {formatVND(c.firstOrderDebt || 12021200)}
                              </small>
                              <small style={{ display: 'block', color: '#4f46e5', fontSize: '11px' }}>
                                Tất toán khi thanh lý
                              </small>
                            </>
                          ) : isHdld ? (
                            <>
                              <div>Lương CD: {formatVND(c.salary)}</div>
                              <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                                Thưởng HS: {formatVND(c.performanceBonus || 1278630)}
                              </small>
                              <small style={{ display: 'block', color: '#059669', fontSize: '11px' }}>
                                Ăn ca: {formatVND(c.mealAllowance || 730000)}
                              </small>
                            </>
                          ) : (
                            <>
                              <div>PCB: {formatVND(c.salary)}</div>
                              {c.allowance > 0 && (
                                <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                                  PKT: {formatVND(c.allowance)}
                                </small>
                              )}
                            </>
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
                        {tpl.id === 'TPL-HDNT' ? (
                          <>
                            <code style={{ fontSize: '11px' }}>{`{{party_b_name}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{party_b_tax_or_cccd}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{party_b_representative}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{discount_rate}} (18%)`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{first_order_debt}} (Gối đầu)`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{credit_limit}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`16 Điều khoản & Phụ lục 01`}</code>
                          </>
                        ) : tpl.id === 'TPL-HDLD' ? (
                          <>
                            <code style={{ fontSize: '11px' }}>{`{{full_name}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{identity_number}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{base_salary}} (BHXH)`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{performance_bonus}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{meal_allowance}} (730k)`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{contract_duration}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{work_location}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{job_title}} & JD`}</code>
                          </>
                        ) : (
                          <>
                            <code style={{ fontSize: '11px' }}>{`{{full_name}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{identity_number}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{salary}} (PCB)`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{allowance}} (PKT)`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{kpi_target}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{bonus_tiers_text}}`}</code>
                            <code style={{ fontSize: '11px' }}>{`{{quarter_bonus_rate}}`}</code>
                          </>
                        )}
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
                {selectedContract.contractType === 'HDNT' || selectedContract.templateId === 'TPL-HDNT' ? (
                  <>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chiết khấu thương mại cơ bản:</span>
                      <div style={{ fontWeight: 700, color: 'var(--gf-primary)', fontSize: '16px' }}>
                        {selectedContract.discountRate || 18}% trực tiếp trên hóa đơn
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>Tính theo Bảng giá bán lẻ niêm yết Genki Fami</small>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hạn mức công nợ gối đầu:</span>
                      <div style={{ fontWeight: 700, color: '#b45309', fontSize: '16px' }}>
                        {formatVND(selectedContract.firstOrderDebt || 12021200)}
                      </div>
                      <small style={{ color: '#b45309' }}>Tất toán dứt điểm khi thanh lý HĐ</small>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hình thức bên nhận phân phối:</span>
                      <div style={{ fontWeight: 600 }}>
                        {selectedContract.partyBType === 'ENTERPRISE' ? 'Doanh Nghiệp / Công ty' : 'Cá Nhân / Đại Lý'}
                      </div>
                      <small style={{ color: 'var(--text-secondary)' }}>
                        {selectedContract.partyBCompany || selectedContract.partyBRepresentative || targetPerson?.fullName}
                      </small>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phương thức đặt hàng & CRM:</span>
                      <div style={{ fontWeight: 600 }}>Cổng MISA AMIS CRM</div>
                      <small style={{ color: 'var(--text-secondary)' }}>Đơn tiếp theo trả trước / COD</small>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chính sách bảo vệ thị trường:</span>
                      <div style={{ fontSize: '13px', marginTop: '2px', color: '#991b1b', fontWeight: 600 }}>
                        🛡️ Bán đúng giá niêm yết, chống bán phá giá trên TMĐT • Chế tài rò rỉ bí mật: 100.000.000 đ
                      </div>
                    </div>
                  </>
                ) : selectedContract.contractType === 'HDLD' || selectedContract.templateId === 'TPL-HDLD' ? (
                  <>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lương chức danh (BHXH):</span>
                      <div style={{ fontWeight: 700, color: 'var(--gf-primary)', fontSize: '16px' }}>
                        {formatVND(selectedContract.salary)} / tháng
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>({numberToVietnameseWords(selectedContract.salary)})</small>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thưởng hiệu suất CV:</span>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px' }}>
                        {formatVND(selectedContract.performanceBonus || 1278630)} / tháng
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>Theo đánh giá KPI hàng tháng</small>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phụ cấp ăn ca cố định:</span>
                      <div style={{ fontWeight: 700, color: '#059669', fontSize: '16px' }}>
                        {formatVND(selectedContract.mealAllowance || 730000)} / tháng
                      </div>
                      <small style={{ color: '#059669' }}>Miễn thuế TNCN (TT 26/2016/TT-BLĐTBXH)</small>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vị trí & Bộ phận JD:</span>
                      <div style={{ fontWeight: 600 }}>{selectedContract.jobTitle || 'Nhân viên'}</div>
                      <small style={{ color: 'var(--text-secondary)' }}>{selectedContract.department || 'Vận hành'}</small>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Địa điểm & Thời giờ làm việc:</span>
                      <div style={{ fontSize: '13px', marginTop: '2px' }}>
                        📍 {selectedContract.workLocation || 'Kho Tân Phú, TP.HCM'} • ⏱️ {selectedContract.workHours || '48 giờ/tuần'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                        if (val.includes('HDNT')) {
                          setContractType('HDNT');
                          setDiscountRate(18);
                          setFirstOrderDebt('12021200');
                          setCreditLimit('12021200');
                          setPartyBType('ENTERPRISE');
                          setPartyBPosition('Giám đốc');
                          setTerritoryDescription('Hệ thống đại lý & phân phối');
                          setAdditionalTerms('Bảo vệ giá bán lẻ niêm yết, không bán phá giá trên sàn TMĐT; gối đầu công nợ đơn hàng đầu tiên.');
                        } else if (val.includes('HDLD')) {
                          setContractType('HDLD');
                          setSalary('7491370');
                          setPerformanceBonus('1278630');
                          setMealAllowance('730000');
                          setContractDuration('02 năm');
                          setProbationPeriod('02 tháng (Hưởng 85% tổng lương chức danh)');
                          setWorkLocation('Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh');
                          setWorkHours('48 giờ/tuần (Thứ 2 đến Thứ 7: 8h00 - 17h00)');
                          setJobTitle('Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh');
                          setDepartment('Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh');
                          setReportTo('Trưởng phòng Vận hành / Ban Giám đốc');
                          setTerritoryDescription('Kho vận TP. Hồ Chí Minh & Hệ thống phân phối miền Nam');
                        } else if (val.includes('HTKD')) {
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
                          {t.name} {t.id === 'TPL-HTKD' || t.id === 'TPL-HDLD' || t.id === 'TPL-HDNT' ? '⭐' : ''}
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

                {/* Phân nhánh Form: HĐNT vs HĐLĐ vs HTKD/CTV/STAFF */}
                {templateId === 'TPL-HDNT' ? (
                  <>
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontWeight: 700, color: '#4f46e5', marginBottom: '4px', fontSize: '13px' }}>
                        📦 Hợp Đồng Nguyên Tắc Mua Bán & Phân Phối Sản Phẩm Genki Fami Nhật Bản (Luật Thương mại 2005)
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Chiết khấu thương mại cơ bản 18% trừ trực tiếp hóa đơn + Hạn mức gối đầu thanh toán đơn hàng đầu tiên (tất toán khi thanh lý HĐ) + Đặt hàng qua Cổng MISA AMIS CRM + Cam kết chống bán phá giá và bảo mật đối tác.
                      </div>
                    </div>

                    {/* Party B Type Toggle: ENTERPRISE vs INDIVIDUAL */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Loại Hình Đối Tác / Điểm Bán (Bên B) *</label>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="partyBType"
                            value="ENTERPRISE"
                            checked={partyBType === 'ENTERPRISE'}
                            onChange={(e) => setPartyBType(e.target.value)}
                          />
                          <span style={{ fontWeight: 600 }}>Doanh Nghiệp / Công Ty (Pháp nhân)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="partyBType"
                            value="INDIVIDUAL"
                            checked={partyBType === 'INDIVIDUAL'}
                            onChange={(e) => setPartyBType(e.target.value)}
                          />
                          <span style={{ fontWeight: 600 }}>Cá Nhân / Đại Lý Bán Lẻ (Thể nhân)</span>
                        </label>
                      </div>
                    </div>

                    {partyBType === 'ENTERPRISE' ? (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Tên Doanh Nghiệp / Công Ty Đối Tác *</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="VD: CÔNG TY TNHH TM&DV QUANG MINH DL"
                              value={partyBCompany}
                              onChange={(e) => setPartyBCompany(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Mã Số Thuế Doanh Nghiệp *</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="VD: 5801452296"
                              value={partyBTax}
                              onChange={(e) => setPartyBTax(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Người Đại Diện Theo Pháp Luật *</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="VD: Bà Hồ Thị Quế"
                              value={partyBRepresentative}
                              onChange={(e) => setPartyBRepresentative(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Chức Vụ Người Đại Diện *</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="VD: Giám đốc"
                              value={partyBPosition}
                              onChange={(e) => setPartyBPosition(e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Họ Tên Đại Lý / Chủ Điểm Bán *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={partyBRepresentative || selectedPersonForForm?.fullName || ''}
                            onChange={(e) => setPartyBRepresentative(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Chức Danh / Vị Trí</label>
                          <input
                            type="text"
                            className="form-input"
                            value={partyBPosition}
                            onChange={(e) => setPartyBPosition(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Tỷ Lệ Chiết Khấu Cơ Bản Trực Tiếp (%) *</label>
                        <input
                          type="number"
                          step="0.5"
                          className="form-input"
                          required
                          value={discountRate}
                          onChange={(e) => setDiscountRate(e.target.value)}
                        />
                        <small style={{ color: '#4f46e5', fontSize: '11px' }}>
                          ✓ Trừ trực tiếp trên hóa đơn theo Bảng giá bán lẻ niêm yết Genki Fami
                        </small>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hạn Mức Gối Đầu Đơn Đầu Tiên (VNĐ) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          placeholder="12021200"
                          value={firstOrderDebt}
                          onChange={(e) => {
                            setFirstOrderDebt(e.target.value);
                            setCreditLimit(e.target.value);
                          }}
                        />
                        {firstOrderDebt > 0 && (
                          <small style={{ color: 'var(--text-muted)' }}>
                            Bằng chữ: {numberToVietnameseWords(Number(firstOrderDebt))} (Tất toán khi thanh lý HĐ)
                          </small>
                        )}
                      </div>
                    </div>
                  </>
                ) : templateId === 'TPL-HDLD' ? (
                  <>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontWeight: 700, color: '#059669', marginBottom: '4px', fontSize: '13px' }}>
                        ⚖️ Cơ Chế 3 Tầng Thu Nhập Hợp Đồng Lao Động Chuẩn (Bộ luật Lao động 2019)
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Lương chức danh đóng BHXH bắt buộc + Thưởng đánh giá hoàn thành công việc + Phụ cấp ăn ca cố định (miễn thuế TNCN theo TT 26/2016/TT-BLĐTBXH). Kèm Bảng mô tả công việc (JD) Phụ lục Trang 2.
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Lương Chức Danh / Cơ Bản (Đóng BHXH) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          placeholder="VD: 7491370"
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
                        <label className="form-label">Thưởng Hiệu Suất / Đánh Giá Hoàn Thành CV *</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="VD: 1278630"
                          value={performanceBonus}
                          onChange={(e) => setPerformanceBonus(e.target.value)}
                        />
                        {performanceBonus > 0 && (
                          <small style={{ color: 'var(--text-muted)' }}>
                            Bằng chữ: {numberToVietnameseWords(Number(performanceBonus))}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phụ Cấp Ăn Ca Cố Định (VNĐ/tháng) *</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="730000"
                          value={mealAllowance}
                          onChange={(e) => setMealAllowance(e.target.value)}
                        />
                        <small style={{ color: '#059669', fontSize: '11px' }}>
                          ✓ Cố định 730.000đ/tháng miễn thuế TNCN (TT 26/2016/TT-BLĐTBXH)
                        </small>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tổng Thu Nhập Hàng Tháng Dự Kiến</label>
                        <div style={{
                          padding: '8px 12px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '15px',
                          color: '#059669'
                        }}>
                          {formatVND((Number(salary) || 0) + (Number(performanceBonus) || 0) + (Number(mealAllowance) || 0))}
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Thời Hạn Hợp Đồng Lao Động *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: 02 năm"
                          value={contractDuration}
                          onChange={(e) => setContractDuration(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Thời Gian & Mức Lương Thử Việc</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="VD: 02 tháng (Hưởng 85% tổng lương chức danh)"
                          value={probationPeriod}
                          onChange={(e) => setProbationPeriod(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Chức Danh Chuyên Môn (Theo JD Trang 2) *</label>
                        <input
                          type="text"
                          className="form-input"
                          required
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phòng Ban / Bộ Phận</label>
                        <input
                          type="text"
                          className="form-input"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Cấp Quản Lý Trực Tiếp Báo Cáo</label>
                        <input
                          type="text"
                          className="form-input"
                          value={reportTo}
                          onChange={(e) => setReportTo(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Thời Giờ Làm Việc Tiêu Chuẩn</label>
                        <input
                          type="text"
                          className="form-input"
                          value={workHours}
                          onChange={(e) => setWorkHours(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Địa Điểm Làm Việc Thực Tế</label>
                      <input
                        type="text"
                        className="form-input"
                        value={workLocation}
                        onChange={(e) => setWorkLocation(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mức thù lao & Phụ cấp cho HTKD / CTV / STAFF */}
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
