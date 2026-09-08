import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { IconPlus, IconExternal, IconClose } from '../components/Icons.jsx';

export default function CustomersView() {
  const { customers, people, currentPerson, addCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states thêm khách hàng
  const [name, setName] = useState('');
  const [customerType, setCustomerType] = useState('Nhà thuốc tư nhân');
  const [region, setRegion] = useState(currentPerson.region || 'Miền Bắc');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ownerId, setOwnerId] = useState(currentPerson.id);
  const [notes, setNotes] = useState('');
  const [externalSalesAppUrl, setExternalSalesAppUrl] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'ALL' || c.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    addCustomer({
      name,
      customerType,
      region,
      address,
      contactPerson,
      phone,
      email,
      ownerId,
      status: 'ACTIVE',
      notes,
      externalSalesAppUrl: externalSalesAppUrl || `https://sales.genkifami.vn/customers/new`
    });
    setShowAddModal(false);
    // Reset
    setName('');
    setAddress('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Danh Bạ Khách Hàng Toàn Team</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Quản lý danh bạ, phân định quyền phụ trách (Owner) để tránh tiếp cận trùng lặp. Không quản lý doanh thu/đơn hàng.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <IconPlus size={15} />
            <span>Thêm Khách Hàng Mới</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '320px' }}
            placeholder="Tìm theo tên nhà thuốc, địa chỉ, người liên hệ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: '180px' }}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="ALL">Tất cả khu vực</option>
            <option value="Miền Bắc">Miền Bắc</option>
            <option value="Miền Trung">Miền Trung</option>
            <option value="Miền Nam">Miền Nam</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <caption className="visually-hidden">Danh bạ khách hàng toàn hệ thống</caption>
            <thead>
              <tr>
                <th scope="col">Tên Khách Hàng / Đối Tác</th>
                <th scope="col">Khu Vực & Địa Chỉ</th>
                <th scope="col">Người Phụ Trách (Owner)</th>
                <th scope="col">Người Liên Hệ</th>
                <th scope="col">Ghi Chú Tiếp Cận</th>
                <th scope="col">Liên Kết Ngoại</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => {
                const owner = people.find(p => p.id === c.ownerId);
                const isMyCustomer = c.ownerId === currentPerson.id;

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gf-ink)' }}>{c.name}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{c.customerType}</small>
                    </td>
                    <td>
                      <div><strong>{c.region}</strong></div>
                      <small style={{ color: 'var(--text-secondary)' }}>{c.address}</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: isMyCustomer ? 'var(--gf-primary)' : 'inherit' }}>
                        {owner?.fullName || 'Chưa phân công'} {isMyCustomer && '★ (Tôi)'}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>{owner?.position}</small>
                    </td>
                    <td>
                      <div>{c.contactPerson}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{c.phone}</small>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {c.notes || '—'}
                      </span>
                    </td>
                    <td>
                      {c.externalSalesAppUrl && (
                        <a
                          href={c.externalSalesAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>Mở App Bán Hàng</span>
                          <IconExternal size={12} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                <div className="form-group">
                  <label className="form-label">Tên Nhà Thuốc / Phòng Khám / Đối Tác *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="VD: Nhà thuốc Long Châu CN 150"
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
                  <label className="form-label">Địa Chỉ Chi Tiết *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
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

                <div className="form-group">
                  <label className="form-label">Nhân Sự Phụ Trách (Owner) *</label>
                  <select
                    className="form-select"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.role} - {p.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">URL Ứng Dụng Bán Hàng Bên Ngoài (Sales App)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://sales.genkifami.vn/..."
                    value={externalSalesAppUrl}
                    onChange={(e) => setExternalSalesAppUrl(e.target.value)}
                  />
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
