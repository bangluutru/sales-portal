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
  const isHdld = template?.id === 'TPL-HDLD' || contract.contractType === 'HDLD' || contract.templateId === 'TPL-HDLD';

  // HĐLĐ specific fields
  const baseSalary = Number(contract.salary || 7491370);
  const performanceBonus = Number(contract.performanceBonus || contract.allowance || 1278630);
  const mealAllowance = Number(contract.mealAllowance || 730000);
  const contractDuration = contract.contractDuration || '02 năm';
  const probationPeriod = contract.probationPeriod || `Từ ngày ${formatDate(contract.startDate)} đến ... (Hưởng 85% lương)`;
  const workLocation = contract.workLocation || 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh';
  const workHours = contract.workHours || '48 giờ/tuần';
  const weeklyRest = contract.weeklyRest || '1,5 ngày (Thứ 7, Chủ Nhật)';
  const jobTitle = contract.jobTitle || person?.position || 'Nhân viên Kho kiêm hỗ trợ kinh doanh';
  const department = contract.department || 'Kho vận & Vận hành';
  const reportTo = contract.reportTo || 'Phụ trách Kho vận & Ban Giám Đốc';
  const address = person?.address || '—';
  const identityNumber = person?.identityNumber || '—';
  const identityDate = person?.identityDate || '—';
  const identityPlace = person?.identityPlace || 'Cục Cảnh sát QLHC về TTXH';
  const phone = person?.phone || '—';
  const email = person?.email || '—';
  const position = contract.jobTitle || person?.position || 'Cán bộ - Công nhân viên';

  // Zoom Controls state (75%, 90%, 100%, 125%, 150%)
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const zoomLevels = [
    { value: 0.75, label: '75%' },
    { value: 0.9, label: '90%' },
    { value: 1.0, label: '100% (Chuẩn)' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' }
  ];

  const handleZoomIn = () => {
    const idx = zoomLevels.findIndex(z => z.value === zoomLevel);
    if (idx < zoomLevels.length - 1) setZoomLevel(zoomLevels[idx + 1].value);
  };

  const handleZoomOut = () => {
    const idx = zoomLevels.findIndex(z => z.value === zoomLevel);
    if (idx > 0) setZoomLevel(zoomLevels[idx - 1].value);
  };

  // Page Navigator state
  const [activePageTab, setActivePageTab] = useState('page1');
  const scrollToPage = (pageId) => {
    setActivePageTab(pageId);
    const target = pageId === 'page1' ? page1Ref.current : page2Ref.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Document live statistics
  const [docStats, setDocStats] = useState({ words: 0, chars: 0 });
  const updateDocStats = () => {
    if (docContainerRef.current) {
      const text = docContainerRef.current.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      setDocStats({ words, chars });
    }
  };

  // Active Formatting state for toolbar
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignJustify: false
  });

  const checkFormatting = () => {
    if (!isEditMode) return;
    try {
      setFormatState({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignJustify: document.queryCommandState('justifyFull')
      });
    } catch {
      // ignore
    }
  };

  // Find & Replace state & functions
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleFindNext = () => {
    if (!findText.trim()) return;
    if (window.find) {
      const found = window.find(findText, false, false, true, false, true, false);
      if (!found) {
        const wrapped = window.find(findText, false, false, true, false, false, false);
        if (!wrapped) {
          showFeedback(`Không tìm thấy từ khóa: "${findText}"`, true);
        }
      }
    }
  };

  const handleReplaceCurrent = () => {
    if (!isEditMode) {
      showFeedback('Vui lòng bật Chế Độ Chỉnh Sửa để thay thế văn bản', true);
      return;
    }
    const selection = window.getSelection();
    if (selection && selection.toString().toLowerCase() === findText.toLowerCase()) {
      executeCommand('insertText', replaceText);
      setIsDirty(true);
      updateDocStats();
      handleFindNext();
    } else {
      handleFindNext();
    }
  };

  const handleReplaceAll = () => {
    if (!isEditMode) {
      showFeedback('Vui lòng bật Chế Độ Chỉnh Sửa để thay thế văn bản', true);
      return;
    }
    if (!docContainerRef.current || !findText.trim()) return;
    const editables = docContainerRef.current.querySelectorAll('.editable-zone, .editable-cell');
    let count = 0;
    editables.forEach(el => {
      if (el.innerText.toLowerCase().includes(findText.toLowerCase())) {
        const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        el.innerHTML = el.innerHTML.replace(regex, replaceText);
        count++;
      }
    });
    if (count > 0) {
      setIsDirty(true);
      updateDocStats();
      showFeedback(`✓ Đã thay thế thành công ở ${count} vị trí`);
    } else {
      showFeedback(`Không tìm thấy "${findText}" trong các ô có thể chỉnh sửa`, true);
    }
  };

  // Executive formatting command helper
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    setIsDirty(true);
    updateDocStats();
    checkFormatting();
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

  // Add new row into JD table (HĐLĐ)
  const handleAddNewJdRow = () => {
    if (!page2Ref.current) return;
    const tableBody = page2Ref.current.querySelector('.cp-data-table tbody');
    if (tableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; vertical-align: top;">
          <div class="editable-zone" contenteditable="${isEditMode}">Nhiệm vụ bổ sung</div>
        </td>
        <td style="vertical-align: top;">
          <div class="editable-zone" contenteditable="${isEditMode}">• Mô tả chi tiết công việc và trách nhiệm bổ sung theo phân công...</div>
        </td>
      `;
      tableBody.appendChild(tr);
      setIsDirty(true);
      showFeedback('✓ Đã thêm nhiệm vụ mới vào Bảng JD');
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
          el.oninput = () => {
            setIsDirty(true);
            updateDocStats();
          };
        }
      });
    }
  }, [isEditMode]);

  // Initial stats calculation
  useEffect(() => {
    updateDocStats();
  }, [contract]);

  // Listen to selection changes for active toolbar formatting
  useEffect(() => {
    document.addEventListener('selectionchange', checkFormatting);
    return () => document.removeEventListener('selectionchange', checkFormatting);
  }, [isEditMode]);

  // Listen to keyboard shortcut Ctrl+F / Cmd+F for Find & Replace
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindReplace(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // IntersectionObserver to auto-highlight active page in navigator
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === page1Ref.current) setActivePageTab('page1');
            if (entry.target === page2Ref.current) setActivePageTab('page2');
          }
        });
      },
      { threshold: 0.3 }
    );

    if (page1Ref.current) observer.observe(page1Ref.current);
    if (page2Ref.current) observer.observe(page2Ref.current);

    return () => observer.disconnect();
  }, []);

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

        {/* SUB-BAR / CONTROL RAIL (Page Navigator, Find & Replace, Zoom Controls) */}
        <div className="mini-doc-subbar no-print">
          {/* Page Navigator */}
          <div className="mini-doc-page-nav">
            <span style={{ fontSize: '11px', color: '#71717a', marginRight: '2px', fontWeight: 600 }}>Trang:</span>
            <button
              className={`mini-doc-nav-pill ${activePageTab === 'page1' ? 'active' : ''}`}
              onClick={() => scrollToPage('page1')}
              title={isHdld ? "Cuộn nhanh đến Trang 1: HĐ Lao Động" : "Cuộn nhanh đến Trang 1: Hợp Đồng Chính"}
            >
              {isHdld ? '📄 Trang 1: HĐ Lao Động' : '📄 Trang 1: Hợp Đồng'}
            </button>
            <button
              className={`mini-doc-nav-pill ${activePageTab === 'page2' ? 'active' : ''}`}
              onClick={() => scrollToPage('page2')}
              title={isHdld ? "Cuộn nhanh đến Trang 2: Bảng Mô Tả Công Việc (JD)" : "Cuộn nhanh đến Trang 2: Phụ Lục 01 (Thưởng & KPI)"}
            >
              {isHdld ? '📋 Trang 2: Mô Tả Công Việc (JD)' : '📊 Trang 2: Phụ Lục 01'}
            </button>
          </div>

          {/* Quick Find & Replace Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className={`mini-doc-tool-btn ${showFindReplace ? 'active' : ''}`}
              onClick={() => setShowFindReplace(prev => !prev)}
              title="Tìm kiếm & Thay thế từ khóa (Ctrl+F hoặc Cmd+F)"
              style={{ height: '28px', fontSize: '12px' }}
            >
              🔍 Tìm & Thay Thế
            </button>
          </div>

          {/* Zoom Control Stepper */}
          <div className="mini-doc-zoom-ctrl">
            <button
              className="mini-doc-zoom-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              title="Thu nhỏ canvas (-)"
            >
              −
            </button>
            <select
              className="mini-doc-zoom-select"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              title="Tỷ lệ hiển thị A4"
            >
              {zoomLevels.map(z => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
            <button
              className="mini-doc-zoom-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 1.5}
              title="Phóng to canvas (+)"
            >
              +
            </button>
          </div>
        </div>

        {/* FIND & REPLACE FLOATING / DRAWER PANEL */}
        {showFindReplace && (
          <div className="mini-doc-find-replace no-print">
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gf-primary)' }}>
              🔍 Tìm & Thay thế:
            </span>
            <input
              type="text"
              className="mini-doc-search-input"
              placeholder="Từ khóa cần tìm..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFindNext(); }}
              autoFocus
            />
            <button
              className="mini-doc-tool-btn"
              onClick={handleFindNext}
              style={{ height: '28px' }}
              title="Tìm vị trí tiếp theo (Enter)"
            >
              Tìm tiếp
            </button>

            <span style={{ color: '#71717a' }}>→</span>

            <input
              type="text"
              className="mini-doc-search-input"
              placeholder="Thay thế bằng..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              disabled={!isEditMode}
              title={!isEditMode ? 'Bật Chế Độ Chỉnh Sửa để thay thế' : ''}
            />
            <button
              className="mini-doc-tool-btn"
              onClick={handleReplaceCurrent}
              disabled={!isEditMode}
              style={{ height: '28px', color: '#10b981' }}
              title="Thay thế vị trí đang chọn"
            >
              Thay thế
            </button>
            <button
              className="mini-doc-tool-btn"
              onClick={handleReplaceAll}
              disabled={!isEditMode}
              style={{ height: '28px', color: '#0284c7' }}
              title="Thay thế toàn bộ trong các vùng chỉnh sửa"
            >
              Thay thế tất cả
            </button>

            <button
              className="mini-doc-tool-btn"
              onClick={() => setShowFindReplace(false)}
              style={{ height: '28px', marginLeft: 'auto' }}
              title="Đóng hộp tìm kiếm"
            >
              ✕ Đóng
            </button>
          </div>
        )}

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
                className={`mini-doc-tool-btn ${formatState.bold ? 'active' : ''}`}
                onClick={() => executeCommand('bold')}
                title="In đậm (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                className={`mini-doc-tool-btn ${formatState.italic ? 'active' : ''}`}
                onClick={() => executeCommand('italic')}
                title="In nghiêng (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                className={`mini-doc-tool-btn ${formatState.underline ? 'active' : ''}`}
                onClick={() => executeCommand('underline')}
                title="Gạch chân (Ctrl+U)"
              >
                <u>U</u>
              </button>

              <div className="mini-doc-divider"></div>

              <button
                className={`mini-doc-tool-btn ${formatState.alignLeft ? 'active' : ''}`}
                onClick={() => executeCommand('justifyLeft')}
                title="Căn trái"
              >
                Trái
              </button>
              <button
                className={`mini-doc-tool-btn ${formatState.alignCenter ? 'active' : ''}`}
                onClick={() => executeCommand('justifyCenter')}
                title="Căn giữa"
              >
                Giữa
              </button>
              <button
                className={`mini-doc-tool-btn ${formatState.alignJustify ? 'active' : ''}`}
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
              {isHdld && (
                <button
                  className="mini-doc-tool-btn"
                  onClick={handleAddNewJdRow}
                  style={{ color: '#0284c7', borderColor: '#0284c7' }}
                  title="Thêm 1 nhiệm vụ mới vào Bảng Mô Tả Công Việc"
                >
                  + Thêm Nhiệm Vụ JD
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
        <div className="contract-paper-wrapper" style={{ flex: 1, backgroundColor: '#525659', overflow: 'auto' }}>
          <div 
            ref={docContainerRef} 
            style={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              marginBottom: zoomLevel > 1 ? `${(zoomLevel - 1) * 650}px` : '0px'
            }}
          >
            
            {/* TRANG 1: HỢP ĐỒNG KINH DOANH CHÍNH */}
            <div className="contract-paper" ref={page1Ref} id="contract-page-1">
              {/* Quốc hiệu & Tiêu ngữ */}
              <div className="cp-national-header">
                <div className="cp-country editable-zone">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="cp-motto editable-zone">Độc lập – Tự do – Hạnh phúc</div>
                <div className="cp-divider"></div>
              </div>

              {/* Tiêu đề & Mã Hợp đồng */}
              {isHdld ? (
                <>
                  <div className="cp-title-area">
                    <div className="cp-title editable-zone">HỢP ĐỒNG LAO ĐỘNG</div>
                    <div className="cp-code editable-zone">Số: {contract.contractCode}</div>
                  </div>

                  {/* Căn cứ pháp lý */}
                  <div className="cp-preamble editable-zone">
                    <div>- Căn cứ Bộ luật Lao động số 45/2019/QH14 được Quốc hội nước CHXHCN Việt Nam thông qua ngày 20/11/2019;</div>
                    <div>- Căn cứ nhu cầu sản xuất kinh doanh của Công ty và khả năng của người lao động.</div>
                  </div>

                  <div className="editable-zone" style={{ marginBottom: '14px' }}>
                    Hôm nay, ngày {formatDate(contract.startDate)}, tại Văn phòng Công ty Cổ phần Genki Fami Việt Nam, chúng tôi gồm có:
                  </div>

                  {/* Bên A */}
                  <div className="cp-party-section">
                    <div className="cp-party-title editable-zone">Người sử dụng lao động: CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM</div>
                    <div className="cp-party-field editable-zone">
                      <strong>Đại diện:</strong> Ông TRẦN HẢI BẰNG &nbsp;&nbsp;&nbsp;&nbsp; <strong>Chức vụ:</strong> Tổng Giám đốc
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Địa chỉ trụ sở:</strong> Số 107 ngõ 192 Lê Trọng Tấn, tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội.
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Mã số thuế:</strong> 0109405781 &nbsp;&nbsp;&nbsp;&nbsp; <strong>Điện thoại:</strong> 024.6291.6888
                    </div>
                  </div>

                  <div className="editable-zone" style={{ margin: '6px 0', fontStyle: 'italic', fontWeight: 600 }}>Và</div>

                  {/* Bên B */}
                  <div className="cp-party-section">
                    <div className="cp-party-title editable-zone">
                      Người lao động: {person?.genderTitle || 'ÔNG/BÀ'} {person?.fullName?.toUpperCase() || 'NGƯỜI LAO ĐỘNG'}
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Sinh ngày:</strong> {person?.dateOfBirth ? formatDate(person.dateOfBirth) : '—'} &nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Nghề nghiệp:</strong> {position}
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Địa chỉ thường trú:</strong> {address}
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Số CCCD:</strong> {identityNumber} &nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Ngày cấp:</strong> {identityDate} &nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Nơi cấp:</strong> {identityPlace}
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Điện thoại:</strong> {phone} &nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Email:</strong> {email}
                    </div>
                  </div>

                  <div className="editable-zone" style={{ marginBottom: '14px', fontStyle: 'italic' }}>
                    Thoả thuận ký kết Hợp đồng lao động và cam kết làm đúng những điều khoản sau đây:
                  </div>

                  {/* Điều khoản HĐLĐ */}
                  <div className="cp-articles-container">
                    <div className="cp-article-block">
                      <div className="cp-article-title editable-zone">ĐIỀU 1. THỜI HẠN VÀ ĐỊA ĐIỂM LÀM VIỆC</div>
                      <div className="cp-article-text editable-zone">
                        1. {person?.genderTitle || 'Ông/Bà'} {person?.fullName} làm việc theo loại Hợp đồng lao động thời hạn <strong>{contractDuration}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        2. Bắt đầu từ ngày: <strong>{formatDate(contract.startDate)}</strong> đến hết ngày <strong>{formatDate(contract.endDate)}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        3. Thời gian thử việc: <strong>{probationPeriod}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        4. Tại địa điểm: <strong>{workLocation}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        5. Chức danh chuyên môn: <strong>{jobTitle}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        6. Công việc phải làm: Theo bảng mô tả công việc (đính kèm tại Trang 2).
                      </div>
                    </div>

                    <div className="cp-article-block">
                      <div className="cp-article-title editable-zone">ĐIỀU 2. CHẾ ĐỘ LÀM VIỆC</div>
                      <div className="cp-article-text editable-zone">
                        - Thời giờ làm việc: <strong>{workHours}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Được cấp phát những dụng cụ: Cần thiết theo yêu cầu công việc.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Điều kiện an toàn và vệ sinh lao động tại nơi làm việc theo quy định hiện hành của Nhà nước.
                      </div>
                    </div>

                    <div className="cp-article-block">
                      <div className="cp-article-title editable-zone">ĐIỀU 3. NGHĨA VỤ VÀ QUYỀN LỢI CỦA NGƯỜI LAO ĐỘNG</div>
                      <div className="cp-article-text editable-zone" style={{ fontWeight: 700, marginTop: '4px' }}>
                        1. Quyền lợi:
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Phương tiện đi lại làm việc: Cá nhân tự túc.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - <strong>Lương chức danh (đóng BHXH):</strong> <span style={{ fontWeight: 700, color: '#006964' }}>{formatVND(baseSalary)} / tháng</span> <em>(Bằng chữ: {numberToVietnameseWords(baseSalary)})</em>
                      </div>
                      <div className="cp-article-text editable-zone">
                        - <strong>Thưởng hiệu suất:</strong> <span style={{ fontWeight: 700 }}>{formatVND(performanceBonus)} / tháng</span> (Theo chính sách công ty).
                      </div>
                      <div className="cp-article-text editable-zone">
                        - <strong>Phụ cấp ăn ca:</strong> <span style={{ fontWeight: 700, color: '#b45309' }}>{formatVND(mealAllowance)} / tháng</span> (Mức chuẩn 730.000 VNĐ theo Thông tư 26/2016/TT-BLĐTBXH miễn thuế TNCN).
                      </div>
                      <div className="cp-article-text editable-zone" style={{ fontStyle: 'italic', fontSize: '12.5px', color: '#4b5563' }}>
                        * Các phụ cấp, chi phí và thưởng đã bao gồm Thuế thu nhập cá nhân do người lao động chi trả.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Hình thức trả lương: Trả 01 lần vào ngày 05 hàng tháng hoặc theo quy định công ty từng thời kỳ.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Tiền thưởng & Chế độ nâng lương: Theo quy định và chính sách của Công ty.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Bảo hiểm xã hội, Bảo hiểm y tế, BHTN: Theo quy định của pháp luật hiện hành.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Nghỉ hàng tuần: <strong>{weeklyRest}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Chế độ đào tạo: Bồi dưỡng chuyên môn theo yêu cầu. Cam kết phục vụ lâu dài, hoàn trả 100% chi phí và chế độ đã nhận nếu nghỉ việc sau đào tạo.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Những thỏa thuận khác: Trong 15 ngày làm việc đầu tiên nếu chấm dứt HĐ không yêu cầu thanh toán chế độ; Báo trước 45 ngày khi muốn chấm dứt hợp đồng trước hạn.
                      </div>

                      <div className="cp-article-text editable-zone" style={{ fontWeight: 700, marginTop: '8px' }}>
                        2. Nghĩa vụ:
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Hoàn thành những nội dung đã cam kết và những công việc trong Hợp đồng; chấp hành nội quy lao động, an toàn và kỷ luật lao động.
                      </div>
                      <div className="cp-article-text editable-zone">
                        - Tuyệt đối không sử dụng khách hàng của công ty để trục lợi cá nhân; không kinh doanh mâu thuẫn lợi ích với Công ty.
                      </div>
                      <div className="cp-article-text editable-zone" style={{ fontWeight: 600, color: '#991b1b', background: 'rgba(239, 68, 68, 0.06)', padding: '6px 8px', borderRadius: '4px' }}>
                        - Cam kết bảo mật & Chống cạnh tranh: Trong thời gian hợp đồng và trong vòng 24 THÁNG kể từ khi nghỉ việc tại Công ty, người lao động tuyệt đối không cung cấp thông tin, tiết lộ bí mật kinh doanh ra ngoài; không hợp tác, sản xuất, kinh doanh, làm đại lý, tiết lộ thông tin khách hàng, mặt hàng sản phẩm tương tự của Genki Fami. Mọi vi phạm sẽ bị truy cứu trách nhiệm trước pháp luật.
                      </div>
                    </div>

                    <div className="cp-article-block">
                      <div className="cp-article-title editable-zone">ĐIỀU 4. NGHĨA VỤ VÀ QUYỀN HẠN CỦA NGƯỜI SỬ DỤNG LAO ĐỘNG</div>
                      <div className="cp-article-text editable-zone">
                        1. Nghĩa vụ: Bảo đảm việc làm; thanh toán đầy đủ các chế độ theo hợp đồng; bảo quản và hoàn trả văn bằng chứng chỉ gốc (nếu có).
                      </div>
                      <div className="cp-article-text editable-zone">
                        2. Quyền hạn: Điều hành người lao động hoàn thành công việc; tạm hoãn, chấm dứt hợp đồng lao động, kỷ luật lao động theo quy định pháp luật và nội quy công ty.
                      </div>
                    </div>

                    <div className="cp-article-block">
                      <div className="cp-article-title editable-zone">ĐIỀU 5. ĐIỀU KHOẢN THI HÀNH</div>
                      <div className="cp-article-text editable-zone">
                        1. Những vấn đề về lao động không ghi trong hợp đồng này áp dụng theo nội quy lao động và quy định của pháp luật lao động hiện hành.
                      </div>
                      <div className="cp-article-text editable-zone">
                        2. Hợp đồng lao động này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản và có hiệu lực từ ngày <strong>{formatDate(contract.startDate)}</strong>.
                      </div>
                      <div className="cp-article-text editable-zone">
                        Hợp đồng làm tại: Số 107 ngõ 192 Lê Trọng Tấn, tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội.
                      </div>
                    </div>
                  </div>

                  {/* Chữ ký Trang 1 HĐLĐ */}
                  <table className="cp-signatures-table no-break">
                    <tbody>
                      <tr>
                        <td>
                          <div className="cp-signature-role editable-zone">ĐẠI DIỆN NGƯỜI LAO ĐỘNG</div>
                          <div className="cp-signature-note editable-zone">(Ký và ghi rõ họ tên)</div>
                          <div className="cp-signature-name editable-zone">{person?.fullName?.toUpperCase() || 'NGƯỜI LAO ĐỘNG'}</div>
                        </td>
                        <td>
                          <div className="cp-signature-role editable-zone">ĐẠI DIỆN NGƯỜI SỬ DỤNG LAO ĐỘNG</div>
                          <div className="cp-signature-note editable-zone">(Ký, đóng dấu và ghi rõ họ tên)</div>
                          <div className="cp-signature-name editable-zone">TRẦN HẢI BẰNG</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* ĐƯỜNG PHÂN TRANG TRỰC QUAN GIỮA 2 TRANG A4 */}
            <div className="contract-paper-page-separator no-print">
              <span>{isHdld ? 'HẾT TRANG 1 — BẮT ĐẦU TRANG 2 (BẢNG MÔ TẢ CÔNG VIỆC - JD)' : 'HẾT TRANG 1 — BẮT ĐẦU TRANG 2 (PHỤ LỤC 01)'}</span>
            </div>

            {/* TRANG 2: BẢNG MÔ TẢ CÔNG VIỆC (JD) HOẶC PHỤ LỤC 01 */}
            <div className="contract-paper contract-paper-appendix" ref={page2Ref} id="contract-page-2">
              <div className="cp-national-header">
                <div className="cp-country editable-zone">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="cp-motto editable-zone">Độc lập – Tự do – Hạnh phúc</div>
                <div className="cp-divider"></div>
              </div>

              {isHdld ? (
                <>
                  <div className="cp-title-area">
                    <div className="cp-title editable-zone" style={{ fontSize: '17px' }}>
                      BẢNG MÔ TẢ CÔNG VIỆC (JOB DESCRIPTION)
                    </div>
                    <div className="cp-code editable-zone">
                      (Đính kèm theo Hợp đồng lao động số: {contract.contractCode})
                    </div>
                  </div>

                  <div className="cp-party-section" style={{ marginBottom: '16px' }}>
                    <div className="cp-party-field editable-zone">
                      <strong>Chức vụ:</strong> {jobTitle}
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Bộ phận:</strong> {department}
                    </div>
                    <div className="cp-party-field editable-zone">
                      <strong>Báo cáo cho:</strong> {reportTo}
                    </div>
                  </div>

                  <div className="editable-zone" style={{ marginBottom: '8px', fontWeight: 700 }}>
                    Trách nhiệm chính & Nhiệm vụ cụ thể:
                  </div>

                  {/* Bảng phân công 2 cột */}
                  <table className="cp-data-table no-break">
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Nhiệm vụ</th>
                        <th style={{ width: '70%' }}>Công việc cụ thể</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 700, verticalAlign: 'top' }}>
                          <div className="editable-zone">Điều phối hàng hoá và kho vận</div>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <div className="editable-zone">
                            <div style={{ marginBottom: '4px' }}>• Tuân thủ các quy định pháp luật, quy trình nội bộ về quản lý hàng hóa. Đảm bảo quy tắc PCCC, vệ sinh kho, bảo quản hàng hóa theo tiêu chuẩn.</div>
                            <div style={{ marginBottom: '4px' }}>• Lập sơ đồ kho, phân chia khu vực lưu trữ hàng hóa và sắp xếp khoa học, dễ tìm kiếm, kiểm kê.</div>
                            <div style={{ marginBottom: '4px' }}>• Tiếp nhận đơn đặt hàng từ phần mềm, soạn hàng, đóng gói, dán nhãn, chuẩn bị chứng từ liên quan.</div>
                            <div style={{ marginBottom: '4px' }}>• Thực hiện công việc giao nhận, luân chuyển, kiểm kê hàng hóa định kỳ và đối chiếu số liệu với Kế toán.</div>
                            <div>• Giám sát, tối ưu thời gian, chi phí cho hoạt động kho vận; đánh giá chất lượng dịch vụ đối tác vận chuyển.</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, verticalAlign: 'top' }}>
                          <div className="editable-zone">Hỗ trợ Kinh doanh</div>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <div className="editable-zone">
                            <div style={{ marginBottom: '4px' }}>• Học cách sử dụng thành thạo phần mềm quản lý bán hàng (AMIS-CRM). Đảm bảo cập nhật đầy đủ thông tin khách hàng, hàng hoá, chính sách giá, báo giá theo khách hàng.</div>
                            <div style={{ marginBottom: '4px' }}>• Hướng dẫn và hỗ trợ nhà phân phối, đại lý, cộng tác viên đặt đơn hàng qua cổng thông tin của phần mềm AMIS CRM.</div>
                            <div style={{ marginBottom: '4px' }}>• Tiếp nhận và cập nhật đơn hàng vào hệ thống - AMIS CRM, theo dõi tiến độ giao hàng và phối hợp đối soát công nợ với Kế toán.</div>
                            <div>• Phối hợp với Bộ phận Kinh doanh và Marketing trong xử lý Hợp đồng mua bán, thông báo thay đổi chính sách giá, chương trình khuyến mãi và xử lý khiếu nại khách hàng.</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, verticalAlign: 'top' }}>
                          <div className="editable-zone">Các công việc khác</div>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <div className="editable-zone">
                            <div style={{ marginBottom: '4px' }}>• Tham gia các khóa đào tạo, bồi dưỡng nâng cao trình độ khi được công ty tạo điều kiện.</div>
                            <div style={{ marginBottom: '4px' }}>• Làm các báo cáo công việc theo định kỳ, phát sinh.</div>
                            <div style={{ marginBottom: '4px' }}>• Tham gia đầy đủ các cuộc họp của bộ phận, báo cáo các thông tin phản hồi từ khách để có giải pháp xử lý kịp thời.</div>
                            <div>• Thực hiện các công việc chuyên môn khác theo phân công từ Ban Giám Đốc.</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="editable-zone" style={{ marginTop: '14px', marginBottom: '6px', fontWeight: 700 }}>
                    Yêu cầu năng lực:
                  </div>
                  <div className="editable-zone" style={{ marginBottom: '14px', fontSize: '13px', lineHeight: 1.6 }}>
                    <div>• Biết sử dụng các phần mềm tin học văn phòng (Google Sheet, Google Docs, CRM) và có khả năng học hỏi, ứng dụng phần mềm hỗ trợ công việc.</div>
                    <div>• Trung thực, sắp xếp công việc khoa học, tỉ mỉ và có trách nhiệm, chủ động trong công việc và ham học hỏi.</div>
                    <div>• Có sức khỏe tốt, có khả năng chịu được áp lực tiến độ công việc.</div>
                  </div>

                  <div className="editable-zone" style={{ marginTop: '16px', marginBottom: '16px', fontStyle: 'italic', fontWeight: 600, color: '#1f2937' }}>
                    "Tôi đã đọc và được trao đổi với quản lý trực tiếp và tôi hoàn toàn hiểu mô tả về vị trí công việc của tôi."
                  </div>

                  <table className="cp-signatures-table no-break" style={{ marginTop: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'left', width: '60%' }}>
                          <div className="editable-zone"><strong>Tên nhân viên:</strong> {person?.fullName?.toUpperCase() || 'NGƯỜI LAO ĐỘNG'}</div>
                          <div className="editable-zone" style={{ marginTop: '6px' }}><strong>Ngày nhận việc:</strong> {formatDate(contract.startDate)}</div>
                        </td>
                        <td style={{ textAlign: 'center', width: '40%' }}>
                          <div className="cp-signature-role editable-zone">Chữ ký nhân viên</div>
                          <div className="cp-signature-note editable-zone">(Ký và ghi rõ họ tên)</div>
                          <div className="cp-signature-name editable-zone" style={{ marginTop: '40px' }}>
                            {person?.fullName?.toUpperCase() || 'NGƯỜI LAO ĐỘNG'}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

          </div>
        </div>

        {/* LIVE DOCUMENT STATUS BAR (Footer) */}
        <div className="mini-doc-status-bar no-print">
          <div className="mini-doc-status-item">
            <span>📄 2 Trang A4</span>
            <span>•</span>
            <span>{docStats.words.toLocaleString()} từ</span>
            <span>•</span>
            <span>{docStats.chars.toLocaleString()} ký tự</span>
          </div>

          <div className="mini-doc-status-item" style={{ fontSize: '11px', color: '#71717a' }}>
            Quy chuẩn: A4 dọc (210 × 297 mm) • Lề: Trái 30mm, Phải 20mm (NĐ 30/2020/NĐ-CP)
          </div>

          <div className="mini-doc-status-item">
            <span className={`mini-doc-status-badge ${isDirty ? 'unsaved' : 'synced'}`}>
              {isDirty ? '● Có thay đổi chưa lưu' : '✓ Đã đồng bộ'}
            </span>
            <span style={{ fontSize: '11px', color: '#71717a', marginLeft: '6px' }}>
              Thu phóng: {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
