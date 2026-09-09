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

  const STITCH_CONTRACT_TEMPLATES = [
    {
      id: 'TPL-HTKD',
      type: 'HTKD',
      name: 'HĐ Hợp Tác Kinh Doanh & Chuyên Gia 2025',
      category: 'Cộng tác viên & Chuyên gia',
      tag: 'Phổ biến nhất',
      tagColor: 'badge-primary',
      icon: 'handshake',
      description: 'Dành cho CTV, dược sĩ & chuyên gia tư vấn. Tự động tính thù lao PCB (cứng) + PKT (kinh tế) & thưởng doanh số bậc thang.',
      docsUrl: 'https://docs.google.com/document/d/genki-template-htkd-2025',
      defaultSalary: '8000000',
      defaultAllowance: '7000000',
      defaultTerritory: 'Hà Nội và các tỉnh phía Bắc'
    },
    {
      id: 'TPL-HDNT',
      type: 'HDNT',
      name: 'HĐ Đại Lý Phân Phối & Nhà Thuốc (HĐNT)',
      category: 'Đại lý & Nhà thuốc',
      tag: 'Thương mại B2B',
      tagColor: 'badge-accent',
      icon: 'store',
      description: 'Dành cho nhà thuốc, phòng khám & spa phân phối TPCN Genki Fami. Điều khoản chiết khấu, hạn mức công nợ gối đầu & chống bán phá giá.',
      docsUrl: 'https://docs.google.com/document/d/genki-template-hdnt-master',
      defaultDiscount: 18,
      defaultCreditLimit: '12021200',
      defaultTerritory: 'Hệ thống nhà thuốc & phòng khám khu vực'
    },
    {
      id: 'TPL-HDLD',
      type: 'HDLD',
      name: 'HĐ Lao Động Toàn Thời Gian (HĐLĐ 2025)',
      category: 'Nhân sự chính thức',
      tag: 'Nội bộ công ty',
      tagColor: 'badge-success',
      icon: 'badge',
      description: 'Hợp đồng lao động xác định thời hạn theo Bộ luật Lao động 2019. Chức danh, lương đóng BHXH, thưởng hiệu suất, ăn trưa & bảo mật sản phẩm.',
      docsUrl: 'https://docs.google.com/document/d/genki-template-hdld-2025',
      defaultSalary: '7491370',
      defaultAllowance: '1278630',
      defaultTerritory: 'Văn phòng & Chi nhánh Genki Fami'
    },
    {
      id: 'TPL-APPENDIX',
      type: 'HTKD',
      name: 'Phụ Lục Gia Hạn & Bổ Sung Hạn Mức',
      category: 'Tái ký & Bổ sung',
      tag: 'Phụ lục sửa đổi',
      tagColor: 'badge-subtle',
      icon: 'post_add',
      description: 'Áp dụng khi gia hạn thời hạn hợp đồng, nâng hạn mức công nợ gối đầu hoặc bổ sung danh mục sản phẩm mới.',
      docsUrl: 'https://docs.google.com/document/d/genki-template-appendix-2025',
      defaultSalary: '10000000',
      defaultAllowance: '5000000',
      defaultTerritory: 'Mở rộng thị trường toàn quốc'
    },
    {
      id: 'TPL-NDA',
      type: 'STAFF',
      name: 'Thỏa Thuận Bảo Mật Thông Tin & Độc Quyền (NDA)',
      category: 'Pháp lý bảo mật',
      tag: 'Bảo mật tuyệt đối',
      tagColor: 'badge-action',
      icon: 'verified_user',
      description: 'Cam kết bảo mật công thức sản phẩm độc quyền Genki Fami Nhật Bản, danh sách nhà thuốc và bảng giá chiết khấu.',
      docsUrl: 'https://docs.google.com/document/d/genki-template-nda-2025',
      defaultSalary: '0',
      defaultAllowance: '0',
      defaultTerritory: 'Bảo mật thương mại toàn cầu'
    }
  ];

  // Tab navigation: 'generator' | 'list' | 'templates'
  const [activeContractTab, setActiveContractTab] = useState('generator');

  // Modals & Editor states
  const [selectedContract, setSelectedContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Loading & export feedback state
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);
  const [previewMode, setPreviewMode] = useState('FULL_12_ARTICLES'); // 'SUMMARY' | 'FULL_12_ARTICLES'

  // Form states tạo hợp đồng
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [templateId, setTemplateId] = useState('TPL-HTKD');
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
  // - CTV / Staff: CHỈ xem hợp đồng của chính mình hoặc do mình tạo/đại diện
  // - Manager: Xem hợp đồng của nhân sự do mình quản lý hoặc do mình tạo
  // - Director / Admin / Accounting: Xem tất cả
  const visibleContracts = contracts.filter(c => {
    if (role === 'DIRECTOR' || role === 'ADMIN' || role === 'ACCOUNTING') {
      return true;
    }
    if (role === 'MANAGER') {
      const person = people.find(p => p.id === c.personId);
      return (person && (person.managerId === currentPerson?.id || person.id === currentPerson?.id)) ||
        c.createdBy === currentPerson?.id || c.personId === currentPerson?.id;
    }
    return c.personId === currentPerson?.id || c.createdBy === currentPerson?.id || c.partyBName === currentPerson?.fullName;
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
            className={`contract-tab-btn ${activeContractTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveContractTab('generator')}
          >
            📑 Trình Tạo Hợp Đồng Mẫu
          </button>
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
            📚 Thư Viện Biểu Mẫu Chuẩn ({contractTemplates.length})
          </button>
        </div>
      </div>

      {/* TAB: TRÌNH TẠO HỢP ĐỒNG MẪU (STITCH SCREEN 4) */}
      {activeContractTab === 'generator' && (
        <div>
          {/* Section 1: Chọn Mẫu Hợp Đồng Chuẩn */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                  BƯỚC 1: CHỌN MẪU HỢP ĐỒNG PHÁP LÝ CHUẨN
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '17px', fontWeight: 800 }}>
                  Thư Viện 5 Mẫu Hợp Đồng Chuẩn Doanh Nghiệp (Stitch Core)
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Đã duyệt bởi Ban Pháp chế & Tổng Giám Đốc
              </span>
            </div>

            {/* 5 Template Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {STITCH_CONTRACT_TEMPLATES.map(tpl => {
                const isSelected = templateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setTemplateId(tpl.id);
                      setContractType(tpl.type);
                      if (tpl.id === 'TPL-HTKD') {
                        setSalary('8000000');
                        setAllowance('7000000');
                        setKpiTargetRevenue('100000000');
                        setTerritoryDescription('Hà Nội và các tỉnh phía Bắc');
                      } else if (tpl.id === 'TPL-HDNT') {
                        setDiscountRate(18);
                        setFirstOrderDebt('12021200');
                        setCreditLimit('12021200');
                        setPartyBType('ENTERPRISE');
                        setPartyBPosition('Giám đốc');
                        setTerritoryDescription('Hệ thống nhà thuốc & phòng khám khu vực');
                      } else if (tpl.id === 'TPL-HDLD') {
                        setSalary('7491370');
                        setPerformanceBonus('1278630');
                        setMealAllowance('730000');
                        setContractDuration('02 năm');
                        setJobTitle('Nhân viên Điều phối Kho vận & Hỗ trợ Kinh doanh');
                        setDepartment('Phòng Quản lý Kho vận & Hỗ trợ Kinh doanh');
                        setTerritoryDescription('Văn phòng Tổng công ty & Chi nhánh');
                      } else if (tpl.id === 'TPL-APPENDIX') {
                        setSalary('10000000');
                        setAllowance('5000000');
                        setTerritoryDescription('Mở rộng thị trường toàn quốc');
                      } else if (tpl.id === 'TPL-NDA') {
                        setSalary('0');
                        setAllowance('0');
                        setTerritoryDescription('Bảo mật công nghệ và chính sách giá');
                      }
                    }}
                    style={{
                      border: isSelected ? '2px solid var(--stitch-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#fff',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className={`badge ${tpl.tagColor}`} style={{ fontSize: '10.5px', fontWeight: 700 }}>
                          {tpl.tag}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '20px' }}>
                            check_circle
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {tpl.name}
                      </h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {tpl.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, fontSize: '11.5px', fontWeight: 600 }}
                      >
                        {isSelected ? '✓ Đang Soạn Mẫu Này' : 'Chọn Mẫu Này'}
                      </button>
                      <a
                        href={tpl.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
                        title="Xem văn bản mẫu trên Google Docs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Điền Thông Tin & Soát Trước Hợp Đồng (Split Grid) */}
          <div className="stitch-split-grid">
            {/* LEFT: Form Intake */}
            <div>
              <div className="card">
                <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span className="badge badge-accent" style={{ fontSize: '11px', fontWeight: 700 }}>
                    BƯỚC 2: ĐIỀN THÔNG TIN ĐỐI SOÁT
                  </span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: 800 }}>
                    Dữ Liệu Hợp Đồng & Thông Số Tài Chính
                  </h3>
                </div>

                <form onSubmit={handleCreateContract}>
                  {/* Fast Fill Selector */}
                  <div className="form-group" style={{ background: 'var(--stitch-primary-light)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                    <label className="form-label" style={{ color: 'var(--stitch-primary)', fontWeight: 700 }}>
                      ⚡ Điền Nhanh Dữ Liệu Đối Tác / Nhân Sự:
                    </label>
                    <select
                      className="form-select"
                      value={personId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setPersonId(pid);
                        const p = people.find(item => item.id === pid);
                        if (p) {
                          setPartyBCompany(p.fullName);
                          setPartyBRepresentative(p.fullName);
                          setPartyBTax(p.taxNumber || p.identityCard || '');
                          setPartyBAddress(p.address || '');
                        }
                      }}
                    >
                      {people.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.role} - {p.region})
                        </option>
                      ))}
                    </select>
                    <small style={{ color: 'var(--stitch-primary)', display: 'block', marginTop: '4px' }}>
                      Tự động nạp thông tin pháp nhân/cá nhân vào các điều khoản hợp đồng.
                    </small>
                  </div>

                  {/* Dates Row */}
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
                      <label className="form-label">Ngày Kết Thúc Hiệu Lực *</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Template Specific Financial Specs */}
                  {templateId === 'TPL-HTKD' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phụ Cấp Cứng (PCB) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>{formatVND(salary)} / tháng</small>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phụ Cấp Kinh Tế (PKT) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={allowance}
                          onChange={(e) => setAllowance(e.target.value)}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>{formatVND(allowance)} / tháng</small>
                      </div>
                    </div>
                  )}

                  {templateId === 'TPL-HDNT' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Chiết Khấu Đại Lý (%) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={discountRate}
                          onChange={(e) => setDiscountRate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hạn Mức Công Nợ Gối Đầu (VNĐ) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={firstOrderDebt}
                          onChange={(e) => {
                            setFirstOrderDebt(e.target.value);
                            setCreditLimit(e.target.value);
                          }}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>{formatVND(firstOrderDebt)}</small>
                      </div>
                    </div>
                  )}

                  {templateId === 'TPL-HDLD' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Lương Chức Danh Đóng BHXH *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>{formatVND(salary)} / tháng</small>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Thưởng Hiệu Suất (Performance) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={performanceBonus}
                          onChange={(e) => setPerformanceBonus(e.target.value)}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>{formatVND(performanceBonus)}</small>
                      </div>
                    </div>
                  )}

                  {/* Territory & Scope */}
                  <div className="form-group">
                    <label className="form-label">Địa Bàn / Phạm Vi Phụ Trách *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={territoryDescription}
                      onChange={(e) => setTerritoryDescription(e.target.value)}
                    />
                  </div>

                  {/* Additional Terms */}
                  <div className="form-group">
                    <label className="form-label">Điều Khoản Riêng / Ghi Chú Pháp Lý</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={additionalTerms}
                      onChange={(e) => setAdditionalTerms(e.target.value)}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
                    <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                      ✓ Lưu Hợp Đồng Vào Hệ Thống
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        const tpl = contractTemplates.find(t => t.id === templateId) || contractTemplates[0];
                        const person = people.find(p => p.id === personId) || people[0];
                        setEditingContract({
                          id: 'DRAFT-' + Date.now(),
                          contractCode: `CTR-2026-${contractType}-DRAFT`,
                          personId,
                          templateId,
                          contractType,
                          startDate,
                          endDate,
                          salary: Number(salary) || 0,
                          allowance: Number(allowance) || 0,
                          performanceBonus: Number(performanceBonus) || 0,
                          mealAllowance: Number(mealAllowance) || 730000,
                          contractDuration: contractDuration || '02 năm',
                          discountRate: Number(discountRate) || 18,
                          firstOrderDebt: Number(firstOrderDebt) || 12021200,
                          creditLimit: Number(creditLimit) || 12021200,
                          territoryDescription,
                          additionalTerms,
                          partyBCompany: partyBCompany || person.fullName,
                          partyBTax: partyBTax || person.taxNumber || person.identityCard || '',
                          partyBAddress: partyBAddress || person.address || '',
                          partyBRepresentative: partyBRepresentative || person.fullName
                        });
                      }}
                    >
                      ✏️ Mở Mini Doc Editor
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        const dummy = {
                          personId,
                          templateId,
                          contractType,
                          contractCode: `CTR-2026-${contractType}-PREVIEW`,
                          startDate,
                          endDate,
                          salary: Number(salary) || 0,
                          allowance: Number(allowance) || 0,
                          discountRate: Number(discountRate) || 18,
                          firstOrderDebt: Number(firstOrderDebt) || 12021200,
                          creditLimit: Number(creditLimit) || 12021200,
                          territoryDescription,
                          additionalTerms
                        };
                        handleExportDocx(dummy);
                      }}
                    >
                      📥 Tải Word (.docx)
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT: Live Pre-flight A4 Preview Sheet */}
            <div>
              <div className="card" style={{ padding: '0', overflow: 'hidden', background: '#e2e8f0' }}>
                <div style={{ padding: '12px 16px', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38bdf8' }}>visibility</span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Soát Trước Hợp Đồng (Live A4 Preview)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: previewMode === 'SUMMARY' ? 'var(--stitch-primary)' : 'transparent',
                          color: '#fff',
                          fontWeight: previewMode === 'SUMMARY' ? 700 : 500
                        }}
                        onClick={() => setPreviewMode('SUMMARY')}
                      >
                        Tóm tắt cốt lõi
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: previewMode === 'FULL_12_ARTICLES' ? 'var(--stitch-primary)' : 'transparent',
                          color: '#fff',
                          fontWeight: previewMode === 'FULL_12_ARTICLES' ? 700 : 500
                        }}
                        onClick={() => setPreviewMode('FULL_12_ARTICLES')}
                      >
                        Toàn văn 12 điều khoản
                      </button>
                    </div>
                    <span className="badge badge-accent" style={{ fontSize: '11px' }}>
                      Khổ A4 Dọc
                    </span>
                  </div>
                </div>

                {/* Simulated A4 Paper Sheet */}
                <div style={{ margin: '16px auto', width: '92%', maxWidth: '580px', minHeight: '680px', background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.12)', padding: '28px 24px', fontFamily: '"Times New Roman", Times, serif', color: '#111827', lineHeight: 1.5, fontSize: '12px' }}>
                  {/* Header Quốc hiệu */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '11px' }}>
                      Độc lập - Tự do - Hạnh phúc
                    </div>
                    <div style={{ width: '120px', height: '1px', background: '#374151', margin: '4px auto 14px auto' }} />
                    <div style={{ fontWeight: 800, fontSize: '14.5px', textTransform: 'uppercase', color: '#0f172a' }}>
                      {STITCH_CONTRACT_TEMPLATES.find(t => t.id === templateId)?.name || 'HỢP ĐỒNG KINH DOANH'}
                    </div>
                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#64748b' }}>
                      Số: CTR-2026-{contractType}-... / GF-VN
                    </div>
                  </div>

                  {/* Parties Block */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700 }}>BÊN A: CÔNG TY TNHH DƯỢC PHẨM GENKI FAMI VIỆT NAM</div>
                    <div style={{ fontSize: '11px', color: '#4b5563' }}>Địa chỉ: Tầng 6, Số 19/48 Nguyễn Cửu Đàm, P. Tân Sơn Nhì, Q. Tân Phú, TP. HCM</div>
                    <div style={{ fontSize: '11px', color: '#4b5563' }}>Đại diện: Ban Giám Đốc • Hotline: 028.7300.6868 • MST: 0315487692</div>
                  </div>

                  <div style={{ marginBottom: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                    <div style={{ fontWeight: 700 }}>BÊN B: {selectedPersonForForm?.fullName?.toUpperCase() || 'ĐỐI TÁC / NHÂN SỰ'}</div>
                    <div style={{ fontSize: '11px', color: '#4b5563' }}>
                      Mã số thuế / CCCD: <strong>{partyBTax || selectedPersonForForm?.taxNumber || selectedPersonForForm?.identityCard || '0108923481'}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4b5563' }}>
                      Địa chỉ: {partyBAddress || selectedPersonForForm?.address || 'Hà Nội / TP. Hồ Chí Minh'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4b5563' }}>
                      Điện thoại: {selectedPersonForForm?.phone || '098...'} • Email: {selectedPersonForForm?.email || 'doitac@genkifami.vn'}
                    </div>
                  </div>

                  {/* Key Articles: Either Summary or Full 12 Articles */}
                  {previewMode === 'SUMMARY' ? (
                    <div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontWeight: 700 }}>Điều 1: Mục đích & Phạm vi hợp tác</div>
                        <p style={{ margin: '2px 0 4px 0', fontSize: '11.5px', color: '#374151' }}>
                          Bên B đồng ý tiếp nhận nhiệm vụ phát triển thị trường và phân phối các dòng sản phẩm chăm sóc sức khỏe Genki Fami tại địa bàn <strong>{territoryDescription}</strong>.
                        </p>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontWeight: 700 }}>Điều 2: Chế độ tài chính & Thù lao</div>
                        {templateId === 'TPL-HTKD' ? (
                          <p style={{ margin: '2px 0 4px 0', fontSize: '11.5px', color: '#374151' }}>
                            - Phụ cấp cứng chức danh (PCB): <strong>{formatVND(salary)}/tháng</strong>.<br />
                            - Phụ cấp kinh tế phát triển thị trường (PKT): <strong>{formatVND(allowance)}/tháng</strong>.<br />
                            - Tổng thu nhập cố định định kỳ: <strong>{formatVND(Number(salary) + Number(allowance))}/tháng</strong>.
                          </p>
                        ) : templateId === 'TPL-HDNT' ? (
                          <p style={{ margin: '2px 0 4px 0', fontSize: '11.5px', color: '#374151' }}>
                            - Mức chiết khấu thương mại đại lý: <strong>{discountRate}%</strong> trên bảng giá niêm yết.<br />
                            - Hạn mức nợ gối đầu đơn đầu tiên: <strong>{formatVND(firstOrderDebt)}</strong> (Tất toán khi thanh lý HĐ).<br />
                            - Cam kết bảo vệ giá niêm yết, không bán phá giá trên các sàn TMĐT.
                          </p>
                        ) : (
                          <p style={{ margin: '2px 0 4px 0', fontSize: '11.5px', color: '#374151' }}>
                            - Lương chức danh đóng BHXH: <strong>{formatVND(salary)}/tháng</strong>.<br />
                            - Phụ cấp hiệu suất: <strong>{formatVND(performanceBonus)}/tháng</strong>.<br />
                            - Tiền ăn trưa hỗ trợ: <strong>{formatVND(mealAllowance)}/tháng</strong>.
                          </p>
                        )}
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 700 }}>Điều 3: Thời hạn hợp đồng</div>
                        <p style={{ margin: '2px 0 4px 0', fontSize: '11.5px', color: '#374151' }}>
                          Hiệu lực từ ngày <strong>{formatDate(startDate)}</strong> đến hết ngày <strong>{formatDate(endDate)}</strong>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#374151' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 1: Mục đích & Phạm vi hợp tác</div>
                        <p style={{ margin: '2px 0' }}>Bên B đảm nhiệm phát triển kinh doanh và phân phối các sản phẩm TPCN tiêu chuẩn Nhật Bản của Genki Fami tại địa bàn <strong>{territoryDescription}</strong>.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 2: Tiêu chuẩn sản phẩm & Nguồn gốc xuất xứ Nhật Bản</div>
                        <p style={{ margin: '2px 0' }}>100% sản phẩm do Bên A cung ứng được nhập khẩu chính ngạch từ Nhật Bản, sản xuất tại nhà máy chuẩn GMP-JAPAN và có Giấy tiếp nhận đăng ký bản công bố sản phẩm của Cục An toàn Thực phẩm - Bộ Y Tế.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 3: Chế độ tài chính, Thù lao & Hạn mức công nợ</div>
                        <p style={{ margin: '2px 0' }}>
                          {templateId === 'TPL-HTKD' && `Thù lao cố định PCB: ${formatVND(salary)}/tháng; Phụ cấp phát triển thị trường PKT: ${formatVND(allowance)}/tháng. Tổng thu nhập định kỳ: ${formatVND(Number(salary) + Number(allowance))}/tháng.`}
                          {templateId === 'TPL-HDNT' && `Mức chiết khấu đại lý: ${discountRate}%. Hạn mức nợ gối đầu: ${formatVND(firstOrderDebt)} thanh toán xoay vòng theo chu kỳ đặt hàng.`}
                          {templateId === 'TPL-HDLD' && `Lương cơ bản đóng BHXH: ${formatVND(salary)}/tháng; Phụ cấp hiệu suất: ${formatVND(performanceBonus)}/tháng; Ăn trưa: ${formatVND(mealAllowance)}/tháng.`}
                          {!['TPL-HTKD', 'TPL-HDNT', 'TPL-HDLD'].includes(templateId) && `Chế độ tài chính thực hiện theo quy chế thù lao và hạn mức được duyệt.`}
                        </p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 4: Cơ chế thưởng doanh số bậc thang & Quản lý KPI</div>
                        <p style={{ margin: '2px 0' }}>Chỉ tiêu doanh số định mức: <strong>{formatVND(kpiTargetRevenue)}/tháng</strong>. Thưởng bậc thang hàng tháng 1.0% - 4.0%; Thưởng đánh giá Quý <strong>{quarterBonusRate}%</strong> và Thưởng tổng kết Năm <strong>{yearBonusRate}%</strong> khi đạt & vượt định ngạch.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 5: Thời hạn hợp đồng & Quy trình gia hạn</div>
                        <p style={{ margin: '2px 0' }}>Hợp đồng có hiệu lực từ ngày <strong>{formatDate(startDate)}</strong> đến hết ngày <strong>{formatDate(endDate)}</strong>. Trước khi hết hạn 30 ngày, hai bên sẽ tiến hành đánh giá để ký Phụ lục gia hạn hợp đồng.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 6: Quyền và nghĩa vụ của Bên A (Genki Fami)</div>
                        <p style={{ margin: '2px 0' }}>Cung ứng đầy đủ hàng hóa đạt chuẩn, cung cấp tài liệu đào tạo chuyên sâu dược lý, hồ sơ pháp lý công bố và thanh toán thù lao/chiết khấu đúng kỳ thỏa thuận.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 7: Quyền và nghĩa vụ của Bên B (Đối tác/Nhân sự)</div>
                        <p style={{ margin: '2px 0' }}>Tư vấn đúng kiến thức sản phẩm, không thần thánh hóa công dụng TPCN, tuân thủ tiêu chuẩn bảo quản dược phẩm GSP và chủ động mở rộng mạng lưới phân phối.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 8: Bảo mật thông tin & Sở hữu trí tuệ (NDA)</div>
                        <p style={{ margin: '2px 0' }}>Bên B cam kết giữ bí mật tuyệt đối về cơ cấu giá, công thức sản phẩm, danh sách khách hàng và chiến lược kinh doanh của Genki Fami. Nghĩa vụ bảo mật kéo dài tối thiểu 02 năm sau khi thanh lý hợp đồng.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 9: Chống bán phá giá & Bảo vệ hệ thống đại lý</div>
                        <p style={{ margin: '2px 0' }}>Nghiêm cấm hành vi bán dưới giá bán lẻ niêm yết do Genki Fami ban hành trên bất kỳ kênh phân phối trực tiếp hoặc sàn TMĐT (Shopee, TikTok Shop, Lazada). Vi phạm sẽ bị cắt thù lao và thanh lý hợp đồng ngay lập tức.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 10: Chấm dứt hợp đồng & Xử lý vi phạm</div>
                        <p style={{ margin: '2px 0' }}>Hợp đồng chấm dứt khi hết thời hạn mà không gia hạn, hoặc do hai bên thỏa thuận. Bên đơn phương chấm dứt phải gửi thông báo trước 30 ngày và hoàn tất nghĩa vụ công nợ tồn đọng.</p>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 11: Sự kiện bất khả kháng & Giải quyết tranh chấp</div>
                        <p style={{ margin: '2px 0' }}>Mọi tranh chấp phát sinh được ưu tiên thương lượng hòa giải trên tinh thần hợp tác. Trường hợp không hòa giải được sẽ đưa ra Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh giải quyết.</p>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Điều 12: Điều khoản thi hành & Hiệu lực pháp lý</div>
                        <p style={{ margin: '2px 0' }}>Hợp đồng này được lập thành 02 (hai) bản có giá trị pháp lý tương đương, mỗi bên giữ 01 (một) bản để thực hiện. Hợp đồng có hiệu lực kể từ ngày ký.</p>
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '10px' }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                      <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>ĐẠI DIỆN BÊN A</div>
                      <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#64748b' }}>(Ký, ghi rõ họ tên và đóng dấu)</div>
                      <div style={{ marginTop: '40px', fontWeight: 600, color: 'var(--stitch-primary)' }}>Tổng Giám Đốc</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                      <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>ĐẠI DIỆN BÊN B</div>
                      <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#64748b' }}>(Ký và ghi rõ họ tên)</div>
                      <div style={{ marginTop: '40px', fontWeight: 600 }}>{selectedPersonForForm?.fullName || 'Người đại diện'}</div>
                    </div>
                  </div>
                </div>

                {/* Pre-flight bottom bar */}
                <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    📄 Ước tính văn bản: 3 trang A4 chuẩn pháp lý
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => window.print()}
                  >
                    🖨️ In Thử / Xuất PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
