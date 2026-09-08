import React, { useState, useRef, useEffect } from 'react';
import { formatVND, formatDate, numberToVietnameseWords } from '../utils/helpers.js';
import { printContractViaIframe, downloadContractAsPdf } from '../utils/contractPrintEngine.js';
import { exportContractToDocx } from '../utils/contractDocxGenerator.js';
import { IconClose } from './Icons.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function ContractMiniDocEditor({
  contract,
  person,
  template,
  onClose,
  onSave
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // References to document pages for direct HTML reading & export
  const docContainerRef = useRef(null);
  const page1Ref = useRef(null);
  const page2Ref = useRef(null);

  // Initial financial values
  const pcb = Number(contract.salary || 8000000);
  const pkt = Number(contract.allowance || 7000000);
  const kpi = Number(contract.kpiTargetRevenue || contract.kpiTargetAmount || 100000000);
  const probationMonths = contract.probationMonths || 3;
  const quarterBonusRate = contract.quarterBonusRate ?? 0.5;
  const yearBonusRate = contract.yearBonusRate ?? 0.2;

  const isHtkd = template?.id === 'TPL-HTKD' || contract.contractType === 'HTKD';

  // Executive formatting command helper
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    setIsDirty(true);
  };

  // Add new article dynamically into Page 1
  const handleAddNewArticle = () => {
    if (!page1Ref.current) return;
    const articlesContainer = page1Ref.current.querySelector('.cp-articles-container');
    if (articlesContainer) {
      const existingArticles = articlesContainer.querySelectorAll('.cp-article-block');
      const nextArticleNum = existingArticles.length + 1;
      const newArticleDiv = document.createElement('div');
      newArticleDiv.className = 'cp-article-block';
      newArticleDiv.innerHTML = `
        <div class="cp-article-title editable-zone" contenteditable="${isEditMode}">
          ĐIỀU ${nextArticleNum}. ĐIỀU KHOẢN BỔ SUNG
        </div>
        <div class="cp-article-text editable-zone" contenteditable="${isEditMode}">
          1. Hai bên thống nhất bổ sung điều khoản cam kết đặc biệt theo thỏa thuận hợp tác cụ thể...
        </div>
      `;
      articlesContainer.appendChild(newArticleDiv);
      setIsDirty(true);
      showFeedback('✓ Đã thêm Điều khoản mới vào văn bản');
    }
  };

  // Add new row into Phụ lục 01 bonus table
  const handleAddNewBonusRow = () => {
    if (!page2Ref.current) return;
    const tableBody = page2Ref.current.querySelector('.cp-data-table tbody');
    if (tableBody) {
      const rows = tableBody.querySelectorAll('tr');
      const nextIndex = rows.length + 1;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;">${nextIndex}</td>
        <td class="editable-cell" contenteditable="${isEditMode}"><strong>Mức ${nextIndex}</strong></td>
        <td class="editable-cell" contenteditable="${isEditMode}">Theo chỉ tiêu bổ sung</td>
        <td style="text-align: right;" class="editable-cell" contenteditable="${isEditMode}">1.000.000 đ</td>
        <td style="text-align: right;" class="editable-cell" contenteditable="${isEditMode}"><strong>5,0%</strong> Tổng Doanh Thu</td>
      `;
      tableBody.appendChild(tr);
      setIsDirty(true);
      showFeedback('✓ Đã thêm 1 bậc thưởng mới vào bảng Phụ Lục 01');
    }
  };

  const showFeedback = (msg, isErr = false) => {
    setFeedback({ msg, isErr });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Save changes back to AppContext
  const handleSaveEdits = () => {
    if (!docContainerRef.current) return;
    const customHtml = docContainerRef.current.innerHTML;
    if (onSave) {
      onSave(contract.id, {
        customContentHtml: customHtml,
        hasCustomEdits: true
      });
    }
    setIsDirty(false);
    setIsEditMode(false);
    showFeedback('✓ Đã lưu toàn bộ nội dung chỉnh sửa vào hợp đồng thành công!');
  };

  // Reset to original template
  const handleResetToTemplate = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục văn bản về mẫu ban đầu? Toàn bộ chỉnh sửa tùy biến sẽ bị xóa.')) {
      if (onSave) {
        onSave(contract.id, {
          customContentHtml: null,
          hasCustomEdits: false
        });
      }
      setIsDirty(false);
      setIsEditMode(false);
      showFeedback('✓ Đã khôi phục về mẫu ban đầu');
      window.location.reload(); // Simple reload to refresh cleanly
    }
  };

  // Export to Word (.docx)
  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      showFeedback('Đang tạo tệp Microsoft Word (.docx)...');
      await exportContractToDocx(contract, person, template);
      showFeedback('✓ Đã xuất và tải về file Word thành công!');
    } catch (err) {
      console.error(err);
      showFeedback('❌ Lỗi tạo file Word: ' + err.message, true);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Print to PDF via Isolated Hidden Iframe
  const handlePrintPdf = async () => {
    if (!docContainerRef.current) return;
    try {
      showFeedback('Đang chuẩn bị trang in A4 chuẩn...');
      const cleanContentHtml = `
        <div class="contract-page">
          ${page1Ref.current ? page1Ref.current.innerHTML : ''}
        </div>
        <div class="page-break"></div>
        <div class="contract-page" style="padding-top: 10px;">
          ${page2Ref.current ? page2Ref.current.innerHTML : ''}
        </div>
      `;
      await printContractViaIframe(cleanContentHtml, contract.contractCode);
      showFeedback('✓ Đã gửi lệnh in / xuất PDF');
    } catch (err) {
      console.error(err);
      showFeedback('❌ Lỗi khi in ấn: ' + err.message, true);
    }
  };

  // Direct download PDF using html2pdf.js
  const handleDownloadDirectPdf = async () => {
    if (!docContainerRef.current) return;
    try {
      setIsExportingPdf(true);
      showFeedback('Đang kết xuất tệp PDF vector chuẩn A4 (vui lòng chờ vài giây)...');
      await downloadContractAsPdf(docContainerRef.current, `${contract.contractCode}.pdf`);
      showFeedback('✓ Đã tải file PDF trực tiếp thành công!');
    } catch (err) {
      console.error(err);
      showFeedback('❌ Lỗi xuất PDF: ' + err.message, true);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Auto-set contenteditable on all editable zones when mode changes
  useEffect(() => {
    if (docContainerRef.current) {
      const editables = docContainerRef.current.querySelectorAll('.editable-zone, .editable-cell');
      editables.forEach(el => {
        el.setAttribute('contenteditable', isEditMode ? 'true' : 'false');
        if (isEditMode) {
          el.oninput = () => setIsDirty(true);
        }
      });
    }
  }, [isEditMode]);

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{
        maxWidth: '1050px',
        maxHeight: '96vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        backgroundColor: '#27272a'
      }}>
        {/* TOP BAR */}
        <div className="modal-header no-print" style={{
          backgroundColor: '#18181b',
          color: '#ffffff',
          borderBottom: '1px solid #3f3f46',
          padding: '12px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  Mini Doc Editor: {contract.contractCode}
                </h3>
                <StatusBadge status={contract.status} />
                {contract.hasCustomEdits && (
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                    Đã có chỉnh sửa tùy biến
                  </span>
                )}
              </div>
              <small style={{ color: '#a1a1aa' }}>
                Đối tác: <strong>{person?.fullName}</strong> ({person?.position}) • Mẫu: {template?.name}
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Mode Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: '#27272a',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              border: '1px solid #3f3f46'
            }}>
              <button
                className={`mini-doc-tool-btn ${!isEditMode ? 'active' : ''}`}
                onClick={() => setIsEditMode(false)}
                style={{ color: !isEditMode ? '#ffffff' : '#a1a1aa', border: 'none' }}
              >
                👁️ Xem Bản In
              </button>
              <button
                className={`mini-doc-tool-btn ${isEditMode ? 'active' : ''}`}
                onClick={() => setIsEditMode(true)}
                style={{ color: isEditMode ? '#ffffff' : '#a1a1aa', border: 'none' }}
              >
                ✏️ Chế Độ Chỉnh Sửa
              </button>
            </div>

            {/* Save button if dirty */}
            {isEditMode && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveEdits}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#059669' }}
              >
                💾 <span>Lưu Thay Đổi</span>
              </button>
            )}

            {/* Export buttons */}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              title="Xuất file Word Microsoft Word (.docx)"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              📥 <span>{isExportingDocx ? 'Đang tạo...' : 'File Word (.docx)'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrintPdf}
              title="In hoặc Lưu PDF Vector chuẩn A4 qua trình duyệt (không bị trắng trang hay mất chữ)"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#3f3f46', color: '#fff', border: 'none' }}
            >
              🖨️ <span>In / PDF A4</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadDirectPdf}
              disabled={isExportingPdf}
              title="Tải trực tiếp file .pdf về máy tính"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#3f3f46', color: '#fff', border: 'none' }}
            >
              📥 <span>{isExportingPdf ? 'Đang tải...' : 'Tải .PDF'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ backgroundColor: '#3f3f46', color: '#fff', border: 'none' }}
            >
              <IconClose size={16} />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div style={{
            padding: '8px 16px',
            backgroundColor: feedback.isErr ? '#ef4444' : '#10b981',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {feedback.msg}
          </div>
        )}

        {/* EDITING TOOLBAR (Shown when isEditMode is true) */}
        {isEditMode && (
          <div className="mini-doc-toolbar no-print">
            <div className="mini-doc-tool-group">
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gf-primary)', marginRight: '6px' }}>
                Định dạng:
              </span>
              <button
                className="mini-doc-tool-btn"
                onClick={() => executeCommand('bold')}
                title="In đậm (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                className="mini-doc-tool-btn"
                onClick={() => executeCommand('italic')}
                title="In nghiêng (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                className="mini-doc-tool-btn"
                onClick={() => executeCommand('underline')}
                title="Gạch chân (Ctrl+U)"
              >
                <u>U</u>
              </button>

              <div className="mini-doc-divider"></div>

              <button
                className="mini-doc-tool-btn"
                onClick={() => executeCommand('justifyLeft')}
                title="Căn trái"
              >
                Trái
              </button>
              <button
                className="mini-doc-tool-btn"
                onClick={() => executeCommand('justifyCenter')}
                title="Căn giữa"
              >
                Giữa
              </button>
              <button
                className="mini-doc-tool-btn"
                onClick={() => executeCommand('justifyFull')}
                title="Căn đều 2 bên"
              >
                Căn đều
              </button>

              <div className="mini-doc-divider"></div>

              <button
                className="mini-doc-tool-btn"
                onClick={handleAddNewArticle}
                style={{ color: 'var(--gf-primary)', borderColor: 'var(--gf-primary)' }}
                title="Thêm một điều khoản mới vào hợp đồng"
              >
                + Thêm Điều Khoản Mới
              </button>

              {isHtkd && (
                <button
                  className="mini-doc-tool-btn"
                  onClick={handleAddNewBonusRow}
                  style={{ color: '#0284c7', borderColor: '#0284c7' }}
                  title="Thêm 1 hàng bậc thưởng mới vào Phụ lục 01"
                >
                  + Thêm Hàng Thưởng
                </button>
              )}
            </div>

            <div className="mini-doc-tool-group">
              <button
                className="mini-doc-tool-btn"
                onClick={handleResetToTemplate}
                style={{ color: '#ef4444' }}
                title="Khôi phục văn bản về mẫu ban đầu"
              >
                🔄 Khôi Phục Mẫu Gốc
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveEdits}
                style={{ backgroundColor: '#059669' }}
              >
                💾 Lưu Bản Thảo
              </button>
            </div>
          </div>
        )}

        {/* DOCUMENT WORKSPACE (A4 Canvas Wrapper) */}
        <div className="contract-paper-wrapper" style={{ flex: 1, backgroundColor: '#525659' }}>
          <div ref={docContainerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* TRANG 1: HỢP ĐỒNG KINH DOANH CHÍNH */}
            <div className="contract-paper" ref={page1Ref} id="contract-page-1">
              {/* Quốc hiệu & Tiêu ngữ */}
              <div className="cp-national-header">
                <div className="cp-country editable-zone">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="cp-motto editable-zone">Độc lập – Tự do – Hạnh phúc</div>
                <div className="cp-divider"></div>
              </div>

              {/* Tiêu đề & Mã Hợp đồng */}
              <div className="cp-title-area">
                <div className="cp-title editable-zone">
                  {isHtkd ? 'HỢP ĐỒNG HỢP TÁC KINH DOANH' : template?.name?.toUpperCase() || 'HỢP ĐỒNG DỊCH VỤ'}
                </div>
                <div className="cp-code editable-zone">Số: {contract.contractCode}</div>
              </div>

              {/* Căn cứ pháp lý */}
              <div className="cp-preamble editable-zone">
                <div>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 đã được Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam thông qua ngày 24/11/2015 và có hiệu lực từ ngày 01/01/2017;</div>
                <div>- Căn cứ nhu cầu và năng lực thực tế của hai bên.</div>
              </div>

              <div className="editable-zone" style={{ marginBottom: '14px' }}>
                Hôm nay, ngày {formatDate(contract.startDate)}, tại Văn phòng Công ty Cổ phần Genki Fami Việt Nam, chúng tôi gồm có:
              </div>

              {/* Bên A */}
              <div className="cp-party-section">
                <div className="cp-party-title editable-zone">BÊN A (Khách hàng): CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM</div>
                <div className="cp-party-field editable-zone">
                  <strong>Đại diện:</strong> Ông LÊ TRÍ NAM &nbsp;&nbsp;&nbsp;&nbsp; <strong>Chức vụ:</strong> Giám đốc Kinh Doanh
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Địa chỉ:</strong> Tầng 4, Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Mỹ Đình 2, Nam Từ Liêm, Hà Nội
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Mã số thuế:</strong> 0109405781 &nbsp;&nbsp;&nbsp;&nbsp; <strong>Điện thoại:</strong> 024.6291.6888
                </div>
              </div>

              {/* Bên B */}
              <div className="cp-party-section">
                <div className="cp-party-title editable-zone">
                  BÊN B (Chuyên gia/Đối tác): {person?.genderTitle || 'ÔNG/BÀ'} {person?.fullName?.toUpperCase() || 'ĐỐI TÁC'}
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Ngày sinh:</strong> {person?.dateOfBirth ? formatDate(person.dateOfBirth) : '—'}
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Số CCCD:</strong> {person?.identityNumber || '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Ngày cấp:</strong> {person?.identityDate || '15/06/2021'} &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Nơi cấp:</strong> {person?.identityPlace || 'Cục Cảnh sát QLHC về TTXH'}
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Địa chỉ thường trú:</strong> {person?.address || '—'}
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Nơi ở hiện tại:</strong> {person?.currentAddress || person?.address || '—'}
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Điện thoại:</strong> {person?.phone || '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Email:</strong> {person?.email || '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Mã số thuế:</strong> {person?.taxNumber || '—'}
                </div>
                <div className="cp-party-field editable-zone">
                  <strong>Tài khoản ngân hàng:</strong> {person?.bankAccount} tại {person?.bankName} ({person?.bankBranch || 'Chi nhánh Hà Nội'})
                </div>
              </div>

              <div className="editable-zone" style={{ marginBottom: '14px', fontStyle: 'italic' }}>
                Hai bên cùng thỏa thuận và nhất trí ký kết Hợp đồng với các điều khoản sau:
              </div>

              {/* Danh sách điều khoản */}
              <div className="cp-articles-container">
                <div className="cp-article-block">
                  <div className="cp-article-title editable-zone">ĐIỀU 1. NỘI DUNG VÀ PHẠM VI CÔNG VIỆC</div>
                  <div className="cp-article-text editable-zone">
                    1. Bên A đồng ý hợp tác và Bên B đồng ý nhận thực hiện công việc tư vấn, phát triển thị trường, kết nối đối tác phân phối sản phẩm thực phẩm bảo vệ sức khỏe và dinh dưỡng cao cấp thương hiệu Genki Fami Nhật Bản.
                  </div>
                  <div className="cp-article-text editable-zone">
                    2. Địa bàn phát triển kinh doanh: <strong>{contract.territoryDescription || 'Toàn quốc'}</strong>.
                  </div>
                  <div className="cp-article-text editable-zone">
                    3. Mục tiêu công việc: Xây dựng mạng lưới nhà thuốc, đại lý và khách hàng chiến lược; đạt chỉ tiêu KPI theo thỏa thuận.
                  </div>
                </div>

                <div className="cp-article-block">
                  <div className="cp-article-title editable-zone">ĐIỀU 2. THỜI HẠN HỢP ĐỒNG</div>
                  <div className="cp-article-text editable-zone">
                    1. Hợp đồng có hiệu lực từ ngày <strong>{formatDate(contract.startDate)}</strong> đến hết ngày <strong>{formatDate(contract.endDate)}</strong>.
                  </div>
                  <div className="cp-article-text editable-zone">
                    2. Thời gian thử thách năng lực thực tế: <strong>{probationMonths} tháng</strong> kể từ ngày bắt đầu có hiệu lực.
                  </div>
                  <div className="cp-article-text editable-zone">
                    3. Hết thời hạn hợp đồng, nếu hai bên có nhu cầu tiếp tục hợp tác sẽ tiến hành gia hạn bằng phụ lục hoặc hợp đồng mới.
                  </div>
                </div>

                <div className="cp-article-block">
                  <div className="cp-article-title editable-zone">ĐIỀU 3. QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN</div>
                  <div className="cp-article-text editable-zone">
                    1. Quyền và nghĩa vụ của Bên A: Cung cấp đầy đủ hồ sơ pháp lý sản phẩm, tài liệu chuyên môn, hóa đơn bán hàng; thanh toán thù lao và các khoản thưởng kinh doanh đúng hạn; thực hiện nghĩa vụ khấu trừ thuế TNCN theo quy định pháp luật.
                  </div>
                  <div className="cp-article-text editable-zone">
                    2. Quyền và nghĩa vụ của Bên B: Tận tâm thực hiện công việc, bảo vệ hình ảnh thương hiệu Genki Fami; tuân thủ bảng giá niêm yết và chính sách bán lẻ, tuyệt đối không bán phá giá; báo cáo định kỳ kết quả tiếp cận thị trường cho Quản lý vùng.
                  </div>
                </div>

                <div className="cp-article-block">
                  <div className="cp-article-title editable-zone">ĐIỀU 4. THÙ LAO VÀ PHƯƠNG THỨC THANH TOÁN</div>
                  <div className="cp-article-text editable-zone">
                    1. Cơ chế chi trả thù lao cố định (PCB), phí hỗ trợ khai thác (PKT), chỉ tiêu doanh thu KPI tháng, thang thưởng bậc thang doanh số, thưởng Quý và thưởng Năm được quy định chi tiết tại Phụ Lục 01 đính kèm - là bộ phận cấu thành không thể tách rời của Hợp đồng này.
                  </div>
                  <div className="cp-article-text editable-zone">
                    2. Phương thức thanh toán: Chuyển khoản qua tài khoản ngân hàng của Bên B từ ngày 10 đến ngày 15 hàng tháng.
                  </div>
                  <div className="cp-article-text editable-zone">
                    3. Hợp đồng này là hợp đồng dịch vụ dân sự, không cấu thành quan hệ lao động theo Bộ luật Lao động.
                  </div>
                </div>

                <div className="cp-article-block">
                  <div className="cp-article-title editable-zone">ĐIỀU 5. ĐIỀU KHOẢN THI HÀNH</div>
                  <div className="cp-article-text editable-zone">
                    1. Hợp đồng có hiệu lực kể từ ngày ký. Mọi sửa đổi, bổ sung phải được lập thành văn bản (Phụ lục hợp đồng).
                  </div>
                  <div className="cp-article-text editable-zone">
                    2. Hợp đồng được lập thành 02 (hai) bản bằng tiếng Việt, có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.
                  </div>
                </div>
              </div>

              {/* Chữ ký Trang 1 */}
              <table className="cp-signatures-table no-break">
                <tbody>
                  <tr>
                    <td>
                      <div className="cp-signature-role editable-zone">ĐẠI DIỆN BÊN A</div>
                      <div className="cp-signature-note editable-zone">(Ký, ghi rõ họ tên và đóng dấu)</div>
                      <div className="cp-signature-name editable-zone">LÊ TRÍ NAM</div>
                    </td>
                    <td>
                      <div className="cp-signature-role editable-zone">ĐẠI DIỆN BÊN B</div>
                      <div className="cp-signature-note editable-zone">(Ký và ghi rõ họ tên)</div>
                      <div className="cp-signature-name editable-zone">{person?.fullName?.toUpperCase()}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ĐƯỜNG PHÂN TRANG TRỰC QUAN GIỮA 2 TRANG A4 */}
            <div className="contract-paper-page-separator no-print">
              <span>HẾT TRANG 1 &mdash; BẮT ĐẦU TRANG 2 (PHỤ LỤC 01)</span>
            </div>

            {/* TRANG 2: PHỤ LỤC 01 (CƠ CHẾ THÙ LAO & THƯỞNG KINH DOANH) */}
            <div className="contract-paper contract-paper-appendix" ref={page2Ref} id="contract-page-2">
              <div className="cp-national-header">
                <div className="cp-country editable-zone">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="cp-motto editable-zone">Độc lập – Tự do – Hạnh phúc</div>
                <div className="cp-divider"></div>
              </div>

              <div className="cp-title-area">
                <div className="cp-title editable-zone" style={{ fontSize: '16px' }}>
                  PHỤ LỤC 01: CƠ CHẾ CHI TRẢ THÙ LAO VÀ THƯỞNG KINH DOANH
                </div>
                <div className="cp-code editable-zone">
                  (Ban hành kèm theo Hợp đồng số: {contract.contractCode})
                </div>
              </div>

              <div className="editable-zone" style={{ marginBottom: '14px', fontStyle: 'italic' }}>
                Căn cứ thỏa thuận tại Điều 4 của Hợp đồng Hợp tác Kinh doanh, hai bên thống nhất chi tiết mức thù lao, chỉ tiêu KPI và thang thưởng như sau:
              </div>

              <div className="editable-zone" style={{ marginBottom: '10px' }}>
                <strong>1. Phí dịch vụ cơ bản (PCB):</strong>{' '}
                <span style={{ fontWeight: 700, color: '#006964' }}>{formatVND(pcb)} / tháng</span>
                <br />
                <em>(Bằng chữ: {numberToVietnameseWords(pcb)})</em>
              </div>

              <div className="editable-zone" style={{ marginBottom: '10px' }}>
                <strong>2. Phí hỗ trợ khai thác thị trường (PKT):</strong>{' '}
                <span style={{ fontWeight: 700 }}>{formatVND(pkt)} / tháng</span>
                <br />
                <em>(Bằng chữ: {numberToVietnameseWords(pkt)})</em>
              </div>

              <div className="editable-zone" style={{ marginBottom: '14px' }}>
                <strong>3. Chỉ tiêu doanh thu KPI tối thiểu:</strong>{' '}
                <span style={{ fontWeight: 700, color: '#b45309' }}>{formatVND(kpi)} / tháng</span>
                <br />
                <em>(Bằng chữ: {numberToVietnameseWords(kpi)})</em>
                <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>
                  * Trường hợp đạt dưới 50% chỉ tiêu Doanh thu tối thiểu: Thu nhập nhận được = PCB.
                </div>
              </div>

              <div className="editable-zone" style={{ marginBottom: '8px', fontWeight: 700 }}>
                4. Cơ chế thưởng theo bậc doanh thu đạt chuẩn tháng:
              </div>

              {/* Bảng bậc thang thưởng tháng */}
              <table className="cp-data-table no-break">
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
                    <td className="editable-cell"><strong>Mức 1</strong></td>
                    <td className="editable-cell">120.000.000 đ ~ 200.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell">1.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell"><strong>1,0%</strong> Tổng Doanh Thu</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>2</td>
                    <td className="editable-cell"><strong>Mức 2</strong></td>
                    <td className="editable-cell">201.000.000 đ ~ 300.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell">2.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell"><strong>1,5%</strong> Tổng Doanh Thu</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>3</td>
                    <td className="editable-cell"><strong>Mức 3</strong></td>
                    <td className="editable-cell">301.000.000 đ ~ 500.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell">3.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell"><strong>2,0%</strong> Tổng Doanh Thu</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>4</td>
                    <td className="editable-cell"><strong>Mức 4</strong></td>
                    <td className="editable-cell">Trên 500.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell">5.000.000 đ</td>
                    <td style={{ textAlign: 'right' }} className="editable-cell"><strong>4,0%</strong> Tổng Doanh Thu</td>
                  </tr>
                </tbody>
              </table>

              <div className="editable-zone" style={{ marginTop: '14px', marginBottom: '8px' }}>
                <strong>5. Cơ chế thưởng Quý:</strong> Bên B được thưởng <strong>{quarterBonusRate}%</strong> trên tổng doanh thu thực tế của cả quý khi doanh số quý đạt tối thiểu 500.000.000 VNĐ.
              </div>

              <div className="editable-zone" style={{ marginBottom: '18px' }}>
                <strong>6. Cơ chế thưởng Năm:</strong> Bên B được thưởng <strong>{yearBonusRate}%</strong> trên tổng doanh số lũy kế cả năm khi hoàn thành xuất sắc chỉ tiêu và có thời gian công tác từ 6 tháng trở lên trong năm tài chính.
              </div>

              {/* Chữ ký Phụ Lục 01 */}
              <table className="cp-signatures-table no-break" style={{ marginTop: '40px' }}>
                <tbody>
                  <tr>
                    <td>
                      <div className="cp-signature-role editable-zone">ĐẠI DIỆN BÊN A</div>
                      <div className="cp-signature-note editable-zone">(Ký, ghi rõ họ tên và đóng dấu)</div>
                      <div className="cp-signature-name editable-zone">LÊ TRÍ NAM</div>
                    </td>
                    <td>
                      <div className="cp-signature-role editable-zone">ĐẠI DIỆN BÊN B</div>
                      <div className="cp-signature-note editable-zone">(Ký và ghi rõ họ tên)</div>
                      <div className="cp-signature-name editable-zone">{person?.fullName?.toUpperCase()}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
