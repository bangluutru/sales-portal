import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { REQUEST_TYPES } from '../utils/constants.js';
import { generateRequestCode, formatVND } from '../utils/helpers.js';
import { calculateSettlement } from '../utils/settlementCalc.js';
import { IconClose } from './Icons.jsx';

export default function QuickActionsModal() {
  const {
    quickActionModalOpen,
    setQuickActionModalOpen,
    quickActionInitialType,
    customers,
    requests,
    currentPerson,
    addRequest
  } = useApp();

  const [requestType, setRequestType] = useState(quickActionInitialType);

  // Form states chung
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Form states đặc thù
  // 1. Business Trip
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 2. Advance & Settlement
  const [relatedTripId, setRelatedTripId] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [actualExpense, setActualExpense] = useState('');

  // 3. Payment
  const [paymentRecipient, setPaymentRecipient] = useState('');
  const [dueDate, setDueDate] = useState('');

  // 4. Sample
  const [sampleDescription, setSampleDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [recipient, setRecipient] = useState('');

  // Lắng nghe sự kiện bàn phím Escape để đóng modal chuẩn Modern Web Guidance
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && quickActionModalOpen) {
        setQuickActionModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickActionModalOpen, setQuickActionModalOpen]);

  // Cập nhật loại đề nghị khi mở modal
  useEffect(() => {
    if (quickActionModalOpen) {
      setRequestType(quickActionInitialType);
      resetForm();
    }
  }, [quickActionModalOpen, quickActionInitialType]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCustomerId(customers[0]?.id || '');
    setAmount('');
    setDriveFolderUrl('');
    setNotes('');
    setDestination('');
    setPurpose('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
    setRelatedTripId('');
    setRequiredDate(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
    setBankInfo(currentPerson ? `${currentPerson.bankName || 'VCB'} ${currentPerson.bankAccount || ''} - ${currentPerson.bankAccountName || currentPerson.fullName}` : '');
    setAdvanceAmount('');
    setActualExpense('');
    setPaymentRecipient('');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setSampleDescription('');
    setQuantity('1 Hộp');
    setShippingAddress('');
    setRecipient('');
  };

  // Tự động điền số tiền tạm ứng khi chọn chuyến công tác liên kết
  const handleSelectRelatedTrip = (tripId) => {
    setRelatedTripId(tripId);
    if (!tripId) return;

    const trip = requests.find(r => r.id === tripId);
    if (trip) {
      // Tìm xem chuyến này đã có tạm ứng chưa
      const adv = requests.find(r => r.parentRequestId === trip.id && r.requestType === 'ADVANCE');
      if (adv) {
        setAdvanceAmount(adv.amount || trip.amount || 0);
      } else {
        setAdvanceAmount(trip.amount || 0);
      }
      setCustomerId(trip.customerId || '');
    }
  };

  if (!quickActionModalOpen) return null;

  // Tính toán hoàn ứng thời gian thực cho Settlement
  const settlementCalc = requestType === 'SETTLEMENT' 
    ? calculateSettlement(actualExpense, advanceAmount) 
    : null;

  // Lọc các chuyến công tác để liên kết
  const availableTrips = requests.filter(r => r.requestType === 'BUSINESS_TRIP');

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingOfType = requests.filter(r => r.requestType === requestType).length;
    const requestCode = generateRequestCode(requestType, existingOfType);

    let finalAmount = Number(amount) || 0;
    let payload = { notes };

    if (requestType === 'BUSINESS_TRIP') {
      finalAmount = Number(amount) || 0;
      payload = {
        destination,
        purpose,
        startDate,
        endDate,
        estimatedCost: finalAmount,
        notes
      };
    } else if (requestType === 'ADVANCE') {
      finalAmount = Number(amount) || 0;
      const relatedTrip = requests.find(r => r.id === relatedTripId);
      payload = {
        relatedTripId,
        relatedTripCode: relatedTrip ? relatedTrip.requestCode : '',
        purpose,
        requiredDate,
        bankInfo,
        notes
      };
    } else if (requestType === 'SETTLEMENT') {
      finalAmount = Number(actualExpense) || 0;
      const relatedTrip = requests.find(r => r.id === relatedTripId);
      payload = {
        relatedTripId,
        relatedTripCode: relatedTrip ? relatedTrip.requestCode : '',
        advanceAmount: Number(advanceAmount) || 0,
        actualExpense: Number(actualExpense) || 0,
        difference: settlementCalc.difference,
        companyReimbursement: settlementCalc.companyReimbursement,
        refundAmount: settlementCalc.refundToCompany,
        statusType: settlementCalc.statusType,
        expenseDescription: description,
        notes
      };
    } else if (requestType === 'PAYMENT') {
      finalAmount = Number(amount) || 0;
      payload = {
        paymentPurpose: purpose || description,
        paymentRecipient,
        bankInfo,
        dueDate,
        notes
      };
    } else if (requestType === 'SAMPLE') {
      finalAmount = 0;
      payload = {
        sampleDescription,
        quantity,
        purpose,
        requiredDate,
        shippingAddress,
        recipient,
        notes
      };
    }

    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      requestCode,
      requestType,
      title: title || `${REQUEST_TYPES[requestType]?.label} - ${requestCode}`,
      description,
      amount: finalAmount,
      customerId,
      parentRequestId: relatedTripId || null,
      rootRequestId: relatedTripId || null,
      status: requestType === 'PAYMENT' ? 'ACCOUNTING_REVIEW' : 'MANAGER_REVIEW',
      currentWorkflowStep: 2,
      workflowTemplateId: `WF-${requestType}`,
      workflowInstanceId: `WFI-${Date.now()}`,
      driveFolderUrl: driveFolderUrl || 'https://drive.google.com/drive/folders/genki-demo-docs',
      payload
    };

    addRequest(newRequest);
    setQuickActionModalOpen(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => setQuickActionModalOpen(false)}
      role="presentation"
    >
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-request-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }} aria-hidden="true">{REQUEST_TYPES[requestType]?.icon}</span>
            <h3 id="modal-request-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gf-ink)' }}>
              Tạo Đề Nghị Mới
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setQuickActionModalOpen(false)}
            aria-label="Đóng cửa sổ đề nghị"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Tab chuyển đổi 5 loại đề nghị */}
        <div
          role="tablist"
          aria-label="Chọn loại đề nghị tác nghiệp"
          style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}
        >
          {Object.entries(REQUEST_TYPES).map(([typeKey, cfg]) => {
            const isSelected = requestType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                role="tab"
                id={`tab-${typeKey}`}
                aria-selected={isSelected}
                aria-controls="qa-form-content"
                onClick={() => setRequestType(typeKey)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  border: 'none',
                  background: isSelected ? 'var(--bg-surface)' : 'transparent',
                  color: isSelected ? 'var(--gf-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '12px',
                  borderBottom: isSelected ? '2px solid var(--gf-primary)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span aria-hidden="true">{cfg.icon}</span>
                <span>{cfg.label.replace('Đề nghị ', '')}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} id="qa-form-content" role="tabpanel" aria-labelledby={`tab-${requestType}`}>
          <div className="modal-body">
            {/* Tiêu đề chung */}
            <div className="form-group">
              <label className="form-label" htmlFor="qa-title">
                Tiêu Đề Đề Nghị <span aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="qa-title"
                className="form-input"
                required
                aria-required="true"
                placeholder="VD: Công tác Hải Phòng / Tạm ứng vé xe..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Khách hàng liên quan */}
            <div className="form-group">
              <label className="form-label" htmlFor="qa-customer">
                Khách Hàng / Đối Tác Liên Quan
              </label>
              <select
                id="qa-customer"
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">-- Không chỉ định / Nội bộ --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            {/* FORM 1: CÔNG TÁC (BUSINESS TRIP) */}
            {requestType === 'BUSINESS_TRIP' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-destination">
                      Địa Điểm Đến <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="qa-destination"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: Hải Phòng & Quảng Ninh"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-amount">
                      Kinh Phí Dự Kiến (VNĐ) <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="qa-amount"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: 5000000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-start-date">Ngày Bắt Đầu</label>
                    <input
                      type="date"
                      id="qa-start-date"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-end-date">Ngày Kết Thúc</label>
                    <input
                      type="date"
                      id="qa-end-date"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="qa-purpose">
                    Mục Đích Công Tác <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="qa-purpose"
                    className="form-textarea"
                    rows={2}
                    required
                    aria-required="true"
                    placeholder="Mục tiêu gặp khách hàng, mở rộng nhà thuốc..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* FORM 2: TẠM ỨNG (ADVANCE) */}
            {requestType === 'ADVANCE' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="qa-related-trip">
                    Liên Kết Chuyến Công Tác (Nếu Có)
                  </label>
                  <select
                    id="qa-related-trip"
                    className="form-select"
                    value={relatedTripId}
                    onChange={(e) => handleSelectRelatedTrip(e.target.value)}
                  >
                    <option value="">-- Tạm ứng độc lập (không theo chuyến) --</option>
                    {availableTrips.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.requestCode}] {t.title} ({formatVND(t.amount)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-advance-amount">
                      Số Tiền Đề Nghị Tạm Ứng (VNĐ) <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="qa-advance-amount"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: 5000000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-required-date">Ngày Cần Nhận Tiền</label>
                    <input
                      type="date"
                      id="qa-required-date"
                      className="form-input"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="qa-bank-info">
                    Thông Tin Tài Khoản Nhận Tạm Ứng <span aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="qa-bank-info"
                    className="form-input"
                    required
                    aria-required="true"
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* FORM 3: THANH TOÁN (PAYMENT) */}
            {requestType === 'PAYMENT' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-pay-amount">
                      Số Tiền Thanh Toán (VNĐ) <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="qa-pay-amount"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: 3200000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-due-date">Hạn Thanh Toán</label>
                    <input
                      type="date"
                      id="qa-due-date"
                      className="form-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="qa-pay-recipient">
                    Đơn Vị / Người Nhận Thanh Toán <span aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="qa-pay-recipient"
                    className="form-input"
                    required
                    aria-required="true"
                    placeholder="VD: Công ty TNHH In ấn Đông Đô"
                    value={paymentRecipient}
                    onChange={(e) => setPaymentRecipient(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="qa-pay-bank">
                    Số Tài Khoản & Ngân Hàng Thụ Hưởng <span aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="qa-pay-bank"
                    className="form-input"
                    required
                    aria-required="true"
                    placeholder="VD: Techcombank 190288889999 - CTY IN DONG DO"
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* FORM 4: HOÀN ỨNG / QUYẾT TOÁN (SETTLEMENT) */}
            {requestType === 'SETTLEMENT' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="qa-settle-trip">
                    Liên Kết Chuyến Công Tác Cần Quyết Toán <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="qa-settle-trip"
                    className="form-select"
                    required
                    aria-required="true"
                    value={relatedTripId}
                    onChange={(e) => handleSelectRelatedTrip(e.target.value)}
                  >
                    <option value="">-- Chọn chuyến công tác đã đi --</option>
                    {availableTrips.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.requestCode}] {t.title} (Dự kiến: {formatVND(t.amount)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-settle-advance">
                      Số Tiền Đã Tạm Ứng (VNĐ) <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="qa-settle-advance"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: 5000000"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-settle-actual">
                      Chi Phí Thực Tế Đã Chi (VNĐ) <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="qa-settle-actual"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: 4300000"
                      value={actualExpense}
                      onChange={(e) => setActualExpense(e.target.value)}
                    />
                  </div>
                </div>

                {/* Hộp tự động tính toán quyết toán */}
                {settlementCalc && (
                  <div className="calc-box" role="status" aria-live="polite">
                    <div className="calc-row">
                      <span>Số tiền tạm ứng:</span>
                      <strong>{formatVND(advanceAmount)}</strong>
                    </div>
                    <div className="calc-row">
                      <span>Chi phí thực tế:</span>
                      <strong>{formatVND(actualExpense)}</strong>
                    </div>
                    <div className="calc-result">
                      💡 Kết quả: {settlementCalc.summaryText}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* FORM 5: XUẤT MẪU (SAMPLE) */}
            {requestType === 'SAMPLE' && (
              <>
                <div
                  role="note"
                  style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', color: '#065f46' }}
                >
                  ℹ️ <strong>Lưu ý:</strong> Ứng dụng ghi nhận đề xuất cấp mẫu cho đối tác / nhà thuốc; không quản lý hay trừ kho sản phẩm.
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-sample-name">
                      Tên Sản Phẩm Mẫu <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="qa-sample-name"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: Viên uống tảo nâu Fucoidan Genki Fami"
                      value={sampleDescription}
                      onChange={(e) => setSampleDescription(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-sample-qty">
                      Số Lượng Mẫu <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="qa-sample-qty"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: 5 Lọ / 10 Gói"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-sample-address">
                      Địa Chỉ Giao Mẫu <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="qa-sample-address"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="Địa chỉ nhà thuốc / phòng khám"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qa-sample-recipient">
                      Người Nhận & Số Điện Thoại <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="qa-sample-recipient"
                      className="form-input"
                      required
                      aria-required="true"
                      placeholder="VD: DS. Nguyễn Thị Mai - 0981112233"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Google Drive URL & Ghi chú chung */}
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label" htmlFor="qa-drive-url">
                Google Drive Folder URL (Chứng Từ / Ảnh)
              </label>
              <input
                type="url"
                id="qa-drive-url"
                className="form-input"
                aria-describedby="qa-drive-help"
                placeholder="https://drive.google.com/drive/folders/..."
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
              />
              <small id="qa-drive-help" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Hệ thống chỉ lưu liên kết Google Drive, không lưu file nặng trực tiếp vào cơ sở dữ liệu.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="qa-notes">
                Mô Tả / Ghi Chú Chi Tiết
              </label>
              <textarea
                id="qa-notes"
                className="form-textarea"
                rows={2}
                placeholder="Thông tin bổ sung cho người duyệt..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setQuickActionModalOpen(false)}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Gửi Đề Nghị Lên Hệ Thống
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
