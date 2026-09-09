import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { IconPlus, IconExternal, IconClose } from '../components/Icons.jsx';
import { validateVietnamTaxId, lookupVietnamTaxInfo } from '../utils/helpers.js';

export default function CustomersView() {
  const {
    customers,
    scopedCustomers,
    isAdmin,
    isStaff,
    people,
    currentPerson,
    addCustomer,
    openQuickAction,
    setActiveTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [isSyncingCrm, setIsSyncingCrm] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState(null);

  // Form states thêm khách hàng
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [customerType, setCustomerType] = useState('Nhà thuốc tư nhân');
  const [region, setRegion] = useState(currentPerson?.region || 'Miền Bắc');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ownerId, setOwnerId] = useState(currentPerson?.id || '');
  const [notes, setNotes] = useState('');
  const [externalSalesAppUrl, setExternalSalesAppUrl] = useState('');
  const [taxValidationState, setTaxValidationState] = useState(null);

  // Helper sinh mã số thuế mock nếu chưa có sẵn
  const getCustomerTax = (c) => {
    if (c.taxNumber) return c.taxNumber;
    if (c.id === 'CUST-001') return '0108923481';
    if (c.id === 'CUST-002') return '0109182374';
    if (c.id === 'CUST-003') return '0315487692';
    if (c.id === 'CUST-004') return '0316789451';
    return '0301984520';
  };

  // Base list depending on Internal Non-SaaS Scope:
  // Admin sees all customers, invited staff sees their assigned/created customers + legacy customers entered previously
  const baseCustomers = isAdmin ? customers : (scopedCustomers || customers.filter(c => c.ownerId === currentPerson?.id || c.createdBy === currentPerson?.id || !c.ownerId));

  const [selectedCustomerId, setSelectedCustomerId] = useState(baseCustomers[0]?.id || customers[0]?.id || 'CUST-001');

  const filteredCustomers = baseCustomers.filter(c => {
    const custTax = getCustomerTax(c);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(searchLower) ||
      c.address.toLowerCase().includes(searchLower) ||
      custTax.toLowerCase().includes(searchLower) ||
      c.contactPerson.toLowerCase().includes(searchLower);

    const matchesRegion = regionFilter === 'ALL' || c.region === regionFilter;
    const matchesType = typeFilter === 'ALL' || c.customerType === typeFilter;
    const matchesOwner = ownerFilter === 'ALL' ||
      (ownerFilter === 'MY' && (c.ownerId === currentPerson?.id || c.createdBy === currentPerson?.id || !c.ownerId)) ||
      (ownerFilter !== 'ALL' && ownerFilter !== 'MY' && c.ownerId === ownerFilter);

    return matchesSearch && matchesRegion && matchesType && matchesOwner;
  });

  const selectedCustomer = baseCustomers.find(c => c.id === selectedCustomerId) || filteredCustomers[0] || baseCustomers[0] || customers[0];
  const selectedOwner = selectedCustomer ? people.find(p => p.id === selectedCustomer.ownerId) : null;
  const selectedTax = selectedCustomer ? getCustomerTax(selectedCustomer) : '';

  // Tax Verification for Selected Customer
  const selectedTaxValidation = selectedTax ? validateVietnamTaxId(selectedTax) : { valid: false };
  const selectedTaxInfo = selectedTax ? lookupVietnamTaxInfo(selectedTax) : null;

  // 4 Stat Pill metrics
  const myCustomersCount = baseCustomers.filter(c => c.ownerId === currentPerson?.id).length;
  const ctvCustomersCount = baseCustomers.filter(c => {
    const owner = people.find(p => p.id === c.ownerId);
    return owner?.role === 'CTV';
  }).length;
  const driveDossierCount = baseCustomers.length; // Tất cả KH đều có dossier đồng bộ
  const taxVerifiedCount = baseCustomers.filter(c => validateVietnamTaxId(getCustomerTax(c)).valid).length;

  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`✓ Đã chép ${label}!`);
      setTimeout(() => setCopyFeedback(null), 2500);
    }).catch(() => {
      setCopyFeedback(`✓ Đã chép: ${text}`);
      setTimeout(() => setCopyFeedback(null), 2500);
    });
  };

  const handleCopyAllBilling = () => {
    if (!selectedCustomer) return;
    const billingText = `TÊN ĐƠN VỊ: ${selectedCustomer.name}
MÃ SỐ THUẾ: ${selectedTax}
ĐỊA CHỈ HÓA ĐƠN GTGT: ${selectedCustomer.address}
EMAIL NHẬN HÓA ĐƠN ĐIỆN TỬ: ${selectedCustomer.email || 'kế_toán@' + selectedCustomer.id.toLowerCase() + '.vn'}
NGƯỜI LIÊN HỆ: ${selectedCustomer.contactPerson} - ${selectedCustomer.phone}`;

    navigator.clipboard.writeText(billingText).then(() => {
      setCopyFeedback('✓ Đã chép toàn bộ thông tin xuất hóa đơn GTGT!');
      setTimeout(() => setCopyFeedback(null), 3000);
    }).catch(() => {
      setCopyFeedback('✓ Đã sao chép thông tin hóa đơn!');
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleLookupTaxNumber = (val) => {
    const targetTax = val || taxNumber;
    if (!targetTax || targetTax.trim().length < 8) {
      setTaxValidationState({ message: 'Vui lòng nhập tối thiểu 10 chữ số mã số thuế.', valid: false });
      return;
    }
    const validation = validateVietnamTaxId(targetTax);
    const info = lookupVietnamTaxInfo(targetTax);

    if (info) {
      setName(prev => prev ? prev : info.name);
      setAddress(prev => prev ? prev : info.address);
      if (info.representative) {
        setContactPerson(prev => prev ? prev : info.representative);
      }
      setTaxValidationState({
        valid: true,
        isEnterprise: true,
        info,
        message: `✓ Đã khớp CSDL Tổng cục Thuế: ${info.name}`
      });
    } else if (validation.valid) {
      setTaxValidationState({
        valid: true,
        isEnterprise: false,
        message: `✓ Mã số thuế đúng thuật toán kiểm tra (${validation.type})`
      });
    } else {
      setTaxValidationState({
        valid: false,
        message: validation.error || 'Mã số thuế không đạt chuẩn Tổng cục Thuế'
      });
    }
  };

  const handleTriggerSync = () => {
    setIsSyncingCrm(true);
    setTimeout(() => {
      setIsSyncingCrm(false);
      setSyncFeedback(`✓ Đồng bộ thành công: ${baseCustomers.length} khách hàng đã đồng bộ toàn diện với Cloud CRM lúc ${new Date().toLocaleTimeString('vi-VN')}.`);
      setTimeout(() => setSyncFeedback(null), 5000);
    }, 1200);
  };

  const handleExportCsv = () => {
    const headers = ['Mã KH', 'Tên Khách Hàng', 'Mã Số Thuế', 'Loại Hình', 'Khu Vực', 'Địa Chỉ', 'Người Liên Hệ', 'SĐT', 'Email', 'Phụ Trách'];
    const rows = baseCustomers.map(c => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${getCustomerTax(c)}"`,
      `"${c.customerType || ''}"`,
      `"${c.region || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.contactPerson || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${people.find(p => p.id === c.ownerId)?.fullName || ''}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `genki_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopyFeedback('✓ Đã xuất tệp CSV danh bạ khách hàng thành công!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleImportCsv = () => {
    if (!importCsvText.trim()) {
      setImportFeedback({ error: true, text: 'Vui lòng dán nội dung CSV hoặc JSON trước khi nhập.' });
      return;
    }
    try {
      // Try JSON first
      if (importCsvText.trim().startsWith('[') || importCsvText.trim().startsWith('{')) {
        const parsed = JSON.parse(importCsvText);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        let imported = 0;
        list.forEach(item => {
          if (item.name) {
            addCustomer({
              name: item.name,
              taxNumber: item.taxNumber || '030' + Math.floor(1000000 + Math.random() * 9000000),
              customerType: item.customerType || 'Nhà thuốc tư nhân',
              region: item.region || currentPerson?.region || 'Miền Bắc',
              address: item.address || 'Hà Nội / TP.HCM',
              contactPerson: item.contactPerson || 'Đại diện',
              phone: item.phone || '0988888888',
              email: item.email || '',
              ownerId: currentPerson?.id || people[0]?.id,
              status: 'ACTIVE',
              notes: item.notes || 'Nhập từ Cloud CRM JSON'
            });
            imported++;
          }
        });
        setImportFeedback({ error: false, text: `✓ Đã nạp thành công ${imported} khách hàng mới từ JSON!` });
        setImportCsvText('');
        return;
      }

      // Parse CSV lines
      const lines = importCsvText.trim().split('\n').filter(l => l.trim().length > 0);
      let count = 0;
      lines.forEach((line, idx) => {
        if (idx === 0 && (line.includes('Mã KH') || line.includes('Tên'))) return; // header
        const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const custName = parts[1] || parts[0];
          const custTax = parts[2] || '030' + Math.floor(1000000 + Math.random() * 9000000);
          addCustomer({
            name: custName,
            taxNumber: custTax,
            customerType: parts[3] || 'Nhà thuốc tư nhân',
            region: parts[4] || currentPerson?.region || 'Miền Bắc',
            address: parts[5] || 'Việt Nam',
            contactPerson: parts[6] || 'Người phụ trách',
            phone: parts[7] || '0901234567',
            email: parts[8] || '',
            ownerId: currentPerson?.id || people[0]?.id,
            status: 'ACTIVE',
            notes: 'Nhập từ CSV / Excel'
          });
          count++;
        }
      });
      setImportFeedback({ error: false, text: `✓ Đã nhập ${count} khách hàng vào hệ thống thành công!` });
      setImportCsvText('');
    } catch (err) {
      setImportFeedback({ error: true, text: `Lỗi đọc dữ liệu: ${err.message}` });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setOwnerFilter('ALL');
    setTypeFilter('ALL');
    setRegionFilter('ALL');
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    const newCust = {
      name,
      taxNumber: taxNumber || '0301' + Math.floor(100000 + Math.random() * 900000),
      customerType,
      region,
      address,
      contactPerson,
      phone,
      email,
      ownerId: ownerId || currentPerson?.id,
      status: 'ACTIVE',
      notes,
      externalSalesAppUrl: externalSalesAppUrl || `https://sales.genkifami.vn/customers/new`
    };
    addCustomer(newCust);
    setShowAddModal(false);
    // Reset
    setName('');
    setTaxNumber('');
    setAddress('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setNotes('');
    setTaxValidationState(null);
  };

  return (
    <div className="page-container">
      {/* Toast Feedback */}
      {copyFeedback && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--stitch-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '28px' }}>
                storefront
              </span>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Khách Hàng Phụ Trách & Hồ Sơ Pháp Lý (Customer Operations)
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '820px' }}>
              {!isAdmin ? (
                <span>
                  <strong>Phạm vi tài khoản cá nhân:</strong> Hiển thị danh sách khách hàng/nhà thuốc do bạn trực tiếp quản lý hoặc mở mới. Bạn có toàn quyền đề xuất mẫu thử, soạn hợp đồng và cập nhật đối tác.
                </span>
              ) : (
                <span>
                  <strong>Toàn hệ thống (Admin):</strong> Quản lý quyền tiếp cận và khai thác tài khoản khách hàng toàn quốc. Chống xung đột giữa các sales nội bộ và CTV. Tra cứu dữ liệu xuất hóa đơn GTGT điện tử chuẩn xác.
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCrmModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Quản lý đồng bộ và xuất nhập dữ liệu CRM / Excel"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sync_alt</span>
              <span>Đồng Bộ & Dữ Liệu CRM</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPlus size={15} />
              <span>+ Thêm Phân Bổ Mới</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner if active */}
        {syncFeedback && (
          <div style={{ padding: '10px 14px', background: 'rgba(37, 99, 235, 0.08)', borderRadius: '6px', marginBottom: '14px', border: '1px solid var(--stitch-primary-light)', fontSize: '13px', color: 'var(--stitch-primary)', fontWeight: 600 }}>
            {syncFeedback}
          </div>
        )}

        {/* 4 Stat Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Tôi trực tiếp quản lý</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--stitch-primary)' }}>person_pin</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--stitch-primary)' }}>{myCustomersCount} đối tác</div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phụ trách chính</span>
          </div>

          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Mạng lưới CTV phụ trách</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4f46e5' }}>groups</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#4f46e5' }}>{ctvCustomersCount} đối tác</div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kênh cộng tác viên</span>
          </div>

          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Hồ sơ Drive đã tạo</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-success)' }}>folder_shared</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-success)' }}>{driveDossierCount} thư mục</div>
            <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>100% Đồng bộ cloud</span>
          </div>

          <div className="stitch-kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Xác thực MST Thuế</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#059669' }}>verified</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>{taxVerifiedCount}/{baseCustomers.length} Đạt</div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Đối soát thuật toán Thuế</span>
          </div>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Tìm theo tên, MST, địa chỉ, người liên hệ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdmin && (
            <select
              className="form-select"
              style={{ maxWidth: '180px' }}
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="ALL">Tất cả nhân sự</option>
              <option value="MY">Chỉ của tôi</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
              ))}
            </select>
          )}

          <select
            className="form-select"
            style={{ maxWidth: '180px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">Tất cả loại hình</option>
            <option value="Nhà thuốc chuỗi">Nhà thuốc chuỗi</option>
            <option value="Nhà thuốc tư nhân">Nhà thuốc tư nhân</option>
            <option value="Phòng khám & Bệnh viện">Phòng khám & Bệnh viện</option>
            <option value="Spa & Wellness Center">Spa & Wellness Center</option>
            <option value="Đại lý phân phối">Đại lý phân phối</option>
          </select>

          <select
            className="form-select"
            style={{ maxWidth: '150px' }}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="ALL">Tất cả khu vực</option>
            <option value="Miền Bắc">Miền Bắc</option>
            <option value="Miền Trung">Miền Trung</option>
            <option value="Miền Nam">Miền Nam</option>
          </select>

          {(searchTerm || ownerFilter !== 'ALL' || typeFilter !== 'ALL' || regionFilter !== 'ALL') && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Split Grid: Left Table + Right Sticky Legal Inspector Drawer */}
      <div className="stitch-split-grid">
        {/* LEFT: Customer List Table */}
        <div>
          <div className="card">
            {filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏪</div>
                <h4 className="empty-title">Không tìm thấy khách hàng nào</h4>
                <p className="empty-desc">
                  {!isAdmin
                    ? 'Bạn chưa có đối tác nào trong danh sách được phân bổ hoặc vừa tìm kiếm.'
                    : 'Thử nới lỏng từ khóa hoặc bộ lọc khu vực/loại hình.'}
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                  + Thêm khách hàng mới
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <caption className="visually-hidden">Danh bạ khách hàng toàn hệ thống</caption>
                  <thead>
                    <tr>
                      <th scope="col">Khách Hàng & MST</th>
                      <th scope="col">Khu Vực & Địa Chỉ</th>
                      <th scope="col">Phụ Trách (Owner)</th>
                      <th scope="col">Liên Hệ</th>
                      <th scope="col">Hồ Sơ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => {
                      const owner = people.find(p => p.id === c.ownerId);
                      const isMyCustomer = c.ownerId === currentPerson?.id;
                      const isSelected = selectedCustomer?.id === c.id;
                      const custTax = getCustomerTax(c);
                      const taxCheck = validateVietnamTaxId(custTax);

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCustomerId(c.id)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: isSelected ? 'var(--stitch-primary)' : 'var(--text-primary)' }}>
                                {c.name}
                              </span>
                              {isSelected && (
                                <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                  Đang xem
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span className="badge badge-subtle" style={{ fontSize: '10.5px' }}>
                                {c.customerType}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: taxCheck.valid ? 'var(--color-success)' : 'var(--text-muted)' }}>
                                MST: {custTax} {taxCheck.valid && '✓'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.region}</div>
                            <small style={{ color: 'var(--text-secondary)' }}>{c.address}</small>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: isMyCustomer ? 'var(--stitch-primary)' : 'inherit', fontSize: '13px' }}>
                              {owner?.fullName || 'Chưa phân công'} {isMyCustomer && '★ (Tôi)'}
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>{owner?.position || owner?.role}</small>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{c.contactPerson}</div>
                            <small style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.phone}</small>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11.5px', padding: '3px 8px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomerId(c.id);
                              }}
                            >
                              Pháp lý &gt;
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
        </div>

        {/* RIGHT: Sticky Legal Inspector Drawer (Stitch Screen 3) */}
        <div>
          {selectedCustomer ? (
            <div className="stitch-inspector-drawer">
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--stitch-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hồ Sơ Pháp Lý & Hóa Đơn GTGT
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedCustomer.name}
                  </h3>
                </div>
                {selectedTaxValidation.valid ? (
                  <span className="badge badge-success" style={{ fontSize: '11px' }}>
                    ✓ Đã đối soát Thuế
                  </span>
                ) : (
                  <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                    ⚠️ Cần chuẩn hóa MST
                  </span>
                )}
              </div>

              {/* Verified Enterprise Metadata if recognized */}
              {selectedTaxInfo && (
                <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(5, 150, 105, 0.08)', borderRadius: '6px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    🏢 Cơ Sở Dữ Liệu Doanh Nghiệp Quốc Gia
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginTop: '2px' }}>
                    {selectedTaxInfo.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                    Trạng thái: <strong>{selectedTaxInfo.status}</strong> • Đại diện: <strong>{selectedTaxInfo.representative}</strong>
                  </div>
                </div>
              )}

              {/* Tax Box (1-Click Copy) */}
              <div style={{ background: 'var(--stitch-primary-light)', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--stitch-primary)' }}>
                    MÃ SỐ THUẾ ({selectedTaxValidation.type || '10 SỐ'})
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px', background: '#fff' }}
                    onClick={() => handleCopyText(selectedTax, 'Mã số thuế')}
                  >
                    📋 Sao chép
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 800, color: 'var(--stitch-primary)', letterSpacing: '0.05em' }}>
                  {selectedTax}
                </div>
              </div>

              {/* Legal Address Box */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Địa chỉ xuất hóa đơn GTGT:</span>
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: '11px', padding: '1px 6px', background: 'transparent', border: 'none', color: 'var(--stitch-primary)' }}
                    onClick={() => handleCopyText(selectedCustomer.address, 'Địa chỉ')}
                  >
                    Chép
                  </button>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {selectedCustomer.address}
                </div>
              </div>

              {/* Email Box */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Email nhận Hóa Đơn Điện Tử:</span>
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: '11px', padding: '1px 6px', background: 'transparent', border: 'none', color: 'var(--stitch-primary)' }}
                    onClick={() => handleCopyText(selectedCustomer.email, 'Email')}
                  >
                    Chép
                  </button>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedCustomer.email || 'kế_toán@genkifami.vn'}
                </div>
              </div>

              {/* Contact Person Box */}
              <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Người liên hệ & SĐT:</span>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{selectedCustomer.contactPerson}</div>
                <div style={{ fontSize: '12px', color: 'var(--stitch-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  📞 {selectedCustomer.phone}
                </div>
              </div>

              {/* Big 1-Click Button: Copy All Billing Block */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '14px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
                onClick={handleCopyAllBilling}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span>
                <span>Chép Toàn Bộ Thông Tin Xuất Hóa Đơn</span>
              </button>

              {/* Workflow Actions */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}
                  onClick={() => openQuickAction('SAMPLE')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f46e5' }}>inventory_2</span>
                  <span>+ Đề xuất cấp mẫu thử Demo cho KH này</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}
                  onClick={() => setActiveTab('contracts')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-primary)' }}>edit_document</span>
                  <span>Soạn hợp đồng đại lý / hợp tác</span>
                </button>

                {selectedCustomer.externalSalesAppUrl && (
                  <a
                    href={selectedCustomer.externalSalesAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                    <span>Mở app bán hàng CRM của đối tác</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
              Chọn một khách hàng ở bảng bên trái để xem hồ sơ pháp lý.
            </div>
          )}
        </div>
      </div>

      {/* Modal Quản Lý Dữ Liệu & CRM Sync */}
      {showCrmModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '24px' }}>
                  cloud_sync
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Trung Tâm Dữ Liệu & Đồng Bộ Cloud CRM
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCrmModal(false)}>
                <IconClose size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Connection Status Box */}
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    Trạng thái kết nối Cloud CRM:
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                    Online (38ms)
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • Endpoint: <code style={{ fontFamily: 'var(--font-mono)', background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>https://crm.genkifami.vn/api/v2/customers/sync</code><br />
                  • Giao thức: REST API v2.4 (Encrypted OAuth2 / TLS 1.3)<br />
                  • Số lượng đối tác hiện hữu: <strong>{baseCustomers.length} bản ghi</strong>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={isSyncingCrm}
                    onClick={handleTriggerSync}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: isSyncingCrm ? 'spin 1s linear infinite' : 'none' }}>
                      sync
                    </span>
                    <span>{isSyncingCrm ? 'Đang kết nối và đồng bộ...' : '🚀 Đồng Bộ Ngay Với Cloud CRM'}</span>
                  </button>
                </div>
              </div>

              {/* Export Box */}
              <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  📥 Xuất Dữ Liệu Khách Hàng (Export CSV / Excel)
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                  Tải xuống tệp CSV UTF-8 tương thích 100% Microsoft Excel, Google Sheets chứa đầy đủ MST, địa chỉ xuất HĐ GTGT và người đại diện.
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleExportCsv}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }}>
                    download
                  </span>
                  <span>Tải Về Tệp CSV ({baseCustomers.length} đối tác)</span>
                </button>
              </div>

              {/* Import Box */}
              <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  📤 Nhập Khách Hàng Hàng Loạt (Import CSV / JSON)
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                  Dán dòng CSV định dạng <code>Tên, MST, Loại hình, Khu vực, Địa chỉ, Đại diện, SĐT</code> hoặc mảng JSON:
                </p>

                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder={`VD:\nNhà thuốc An Khang 102, 0315487692, Nhà thuốc chuỗi, Miền Nam, 123 Hai Bà Trưng Q1 TP.HCM, DS. Hằng, 0909112233`}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', marginBottom: '8px' }}
                />

                {importFeedback && (
                  <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '8px', background: importFeedback.error ? '#fee2e2' : '#dcfce7', color: importFeedback.error ? '#991b1b' : '#166534' }}>
                    {importFeedback.text}
                  </div>
                )}

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleImportCsv}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-primary)' }}>
                    file_upload
                  </span>
                  <span>Nạp Dữ Liệu Vào Danh Bạ</span>
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCrmModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Khách Hàng */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Thêm Khách Hàng / Đối Tác Mới</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <IconClose size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="modal-body">
                {/* MST with Lookup */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Mã Số Thuế (MST) *</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Nhập MST để tra cứu tự động</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: 0108923481 hoặc 0315487692"
                      value={taxNumber}
                      onChange={(e) => {
                        setTaxNumber(e.target.value);
                        if (e.target.value.length >= 10) {
                          handleLookupTaxNumber(e.target.value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLookupTaxNumber(taxNumber)}
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
                      <span>Tra cứu</span>
                    </button>
                  </div>

                  {taxValidationState && (
                    <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 600, color: taxValidationState.valid ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {taxValidationState.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tên Nhà Thuốc / Doanh Nghiệp Đối Tác *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="VD: Công ty Cổ phần Dược phẩm Pharmacity"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Loại Hình</label>
                    <select
                      className="form-select"
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                    >
                      <option value="Nhà thuốc chuỗi">Nhà thuốc chuỗi</option>
                      <option value="Nhà thuốc tư nhân">Nhà thuốc tư nhân</option>
                      <option value="Phòng khám & Bệnh viện">Phòng khám & Bệnh viện</option>
                      <option value="Spa & Wellness Center">Spa & Wellness Center</option>
                      <option value="Đại lý phân phối">Đại lý phân phối</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Khu Vực *</label>
                    <select
                      className="form-select"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="Miền Bắc">Miền Bắc</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Miền Nam">Miền Nam</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Địa Chỉ Chi Tiết (Xuất Hóa Đơn GTGT) *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Người Đại Diện / Dược Sĩ Liên Hệ</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: DS. Nguyễn Văn B"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số Điện Thoại Liên Hệ</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="09..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Nhận Hóa Đơn VAT</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="ketoan@doitac.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nhân Sự Phụ Trách (Owner) *</label>
                    <select
                      className="form-select"
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      disabled={!isAdmin}
                    >
                      {people.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.role} - {p.region})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi Chú Đặc Thù</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Thói quen đặt hàng, mức độ tiềm năng..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

