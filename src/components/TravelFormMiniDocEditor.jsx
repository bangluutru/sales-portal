import React, { useState, useRef, useEffect } from 'react';
import { formatVND, formatDate, numberToVietnameseWords } from '../utils/helpers.js';
import { printContractViaIframe, downloadContractAsPdf } from '../utils/contractPrintEngine.js';
import { exportTravelFormToDocx } from '../utils/travelDocxGenerator.js';
import { compileTravelFormHtml, TRAVEL_FORM_TEMPLATES } from '../utils/travelFormsConstants.js';
import { IconClose } from './Icons.jsx';

export default function TravelFormMiniDocEditor({
  template,
  initialData = null,
  onClose,
  onSave
}) {
  const tpl = template || TRAVEL_FORM_TEMPLATES[0];
  const [formData, setFormData] = useState(initialData || tpl.defaultData || {});
  const [orientation, setOrientation] = useState(tpl.defaultOrientation || 'PORTRAIT');

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // References
  const docContainerRef = useRef(null);
  const docPageRef = useRef(null);

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

  // Find & Replace state & functions
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Statistics
  const [docStats, setDocStats] = useState({ words: 0, chars: 0 });
  const updateDocStats = () => {
    if (docPageRef.current) {
      const text = docPageRef.current.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      setDocStats({ words, chars });
    }
  };

  useEffect(() => {
    updateDocStats();
  }, [formData, orientation, isEditMode]);

  const showFeedback = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Switch Orientation
  const handleToggleOrientation = () => {
    const newOri = orientation === 'PORTRAIT' ? 'LANDSCAPE' : 'PORTRAIT';
    setOrientation(newOri);
    showFeedback(`Đã chuyển sang ${newOri === 'LANDSCAPE' ? 'Khổ Ngang (297×210 mm)' : 'Khổ Dọc (210×297 mm)'}`);
  };

  // Find next occurrence in browser
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

  // Replace current selection
  const handleReplaceCurrent = () => {
    if (!isEditMode) {
      showFeedback('Vui lòng bật Chế Độ Chỉnh Sửa để thay thế văn bản', true);
      return;
    }
    const selection = window.getSelection();
    if (selection && selection.toString().toLowerCase() === findText.toLowerCase()) {
      document.execCommand('insertText', false, replaceText);
      setIsDirty(true);
      showFeedback('Đã thay thế từ khóa thành công');
      handleFindNext();
    } else {
      handleFindNext();
    }
  };

  // Replace all occurrences
  const handleReplaceAll = () => {
    if (!isEditMode) {
      showFeedback('Vui lòng bật Chế Độ Chỉnh Sửa để thay thế văn bản', true);
      return;
    }
    if (!findText.trim() || !docPageRef.current) return;

    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let replacedCount = 0;

      const walkTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (regex.test(node.nodeValue)) {
            const matches = node.nodeValue.match(regex);
            replacedCount += matches ? matches.length : 0;
            node.nodeValue = node.nodeValue.replace(regex, replaceText);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.childNodes.forEach(child => walkTextNodes(child));
        }
      };

      walkTextNodes(docPageRef.current);
      setIsDirty(true);
      updateDocStats();
      showFeedback(`Đã thay thế thành công ${replacedCount} vị trí`);
    } catch {
      showFeedback('Lỗi xử lý thay thế văn bản', true);
    }
  };

  // Export DOCX
  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      showFeedback('Đang tạo file Word (.docx) chuẩn Nghị định 30...');
      await exportTravelFormToDocx(tpl.id, formData, orientation);
      showFeedback('Đã tải xuống file Word (.docx) thành công!');
    } catch (err) {
      console.error('DOCX Export error:', err);
      showFeedback('Lỗi xuất file Word: ' + err.message, true);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Print via isolated iframe
  const handlePrint = async () => {
    if (!docPageRef.current) return;
    try {
      showFeedback('Đang chuẩn bị trang in chuẩn A4...');
      await printContractViaIframe(docPageRef.current.innerHTML, tpl.name, orientation.toLowerCase());
      showFeedback('Đã gửi lệnh in tài liệu thành công!');
    } catch (err) {
      console.error('Print error:', err);
      showFeedback('Lỗi in ấn tài liệu: ' + err.message, true);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!docPageRef.current) return;
    try {
      setIsExportingPdf(true);
      showFeedback('Đang render PDF vector chất lượng cao...');
      const fileName = `${tpl.code}_${formData.requesterName || 'BieuMau'}_${orientation.toLowerCase()}.pdf`;
      await downloadContractAsPdf(docPageRef.current, fileName, orientation.toLowerCase());
      showFeedback('Đã tải xuống file PDF thành công!');
    } catch (err) {
      console.error('PDF Download error:', err);
      showFeedback('Lỗi xuất PDF: ' + err.message, true);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Save draft
  const handleSave = () => {
    if (onSave) {
      const currentHtml = docPageRef.current ? docPageRef.current.innerHTML : '';
      onSave(tpl.id, { ...formData, customContentHtml: currentHtml, orientation });
      setIsDirty(false);
      showFeedback('Đã lưu bản thảo biểu mẫu thành công!');
    } else {
      setIsDirty(false);
      showFeedback('Đã lưu trạng thái chỉnh sửa biểu mẫu!');
    }
  };

  const initialHtml = compileTravelFormHtml(tpl.id, formData, orientation);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '96vw', width: '1380px', height: '94vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER TOOLBAR */}
        <div className="modal-header" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tpl.name}
                </h3>
                <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 600 }}>
                  {tpl.code}
                </span>
                <span className="badge badge-subtle" style={{ fontSize: '11px' }}>
                  {tpl.category}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Quy chuẩn: <strong>{tpl.legalBasis}</strong> • Nghị định 30/2020/NĐ-CP
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback && (
              <div style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: feedback.isError ? '#fee2e2' : '#dcfce7',
                color: feedback.isError ? '#991b1b' : '#166534',
                fontWeight: 500
              }}>
                {feedback.msg}
              </div>
            )}

            <button className="btn btn-secondary btn-sm" onClick={onClose} title="Đóng trình soạn thảo">
              <IconClose size={16} />
            </button>
          </div>
        </div>

        {/* SECONDARY ACTION & FORMATTING TOOLBAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {/* Nhóm điều hướng khổ giấy & Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Nút chuyển đổi Khổ Ngang / Khổ Dọc */}
            <button
              className={`btn btn-sm ${orientation === 'LANDSCAPE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleToggleOrientation}
              title="Chuyển đổi giữa Khổ Dọc (Portrait) và Khổ Ngang (Landscape)"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{orientation === 'LANDSCAPE' ? '📑 Khổ Ngang (A4)' : '📄 Khổ Dọc (A4)'}</span>
              <span style={{ fontSize: '10px', opacity: 0.85, padding: '1px 5px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
                {orientation === 'LANDSCAPE' ? '297 × 210 mm' : '210 × 297 mm'}
              </span>
            </button>

            <div style={{ height: '18px', width: '1px', background: 'var(--border-color)' }}></div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-card)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.75}
                title="Thu nhỏ"
                style={{ padding: '2px 8px', height: '26px' }}
              >
                －
              </button>
              <span style={{ fontSize: '12px', minWidth: '45px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 1.5}
                title="Phóng to"
                style={{ padding: '2px 8px', height: '26px' }}
              >
                ＋
              </button>
            </div>

            <div style={{ height: '18px', width: '1px', background: 'var(--border-color)' }}></div>

            {/* Chế độ Chỉnh sửa WYSIWYG */}
            <button
              className={`btn btn-sm ${isEditMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                const nextMode = !isEditMode;
                setIsEditMode(nextMode);
                showFeedback(nextMode ? 'Đã bật chế độ chỉnh sửa trực tiếp trên văn bản' : 'Đã chuyển về chế độ xem');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{isEditMode ? '✏️ Đang Chỉnh Sửa' : '👁️ Chế Độ Xem'}</span>
            </button>

            {/* Tìm & Thay Thế */}
            <button
              className={`btn btn-sm ${showFindReplace ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFindReplace(!showFindReplace)}
              title="Tìm & Thay thế từ khóa"
            >
              🔍 Tìm & Sửa
            </button>
          </div>

          {/* Nhóm Xuất file & Lưu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginRight: '6px' }}>
              {docStats.words} từ • {docStats.chars} ký tự
            </span>

            {isDirty && (
              <button className="btn btn-sm btn-success" onClick={handleSave} style={{ fontWeight: 600 }}>
                💾 Lưu Bản Thảo
              </button>
            )}

            <button
              className="btn btn-sm btn-secondary"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              title="Tải file Word (.docx) chuẩn theo đúng khổ giấy"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>📥 Xuất Word</span>
              {isExportingDocx && <span className="spinner-sm"></span>}
            </button>

            <button
              className="btn btn-sm btn-secondary"
              onClick={handlePrint}
              title="In văn bản qua Isolated Iframe"
              style={{ fontWeight: 600 }}
            >
              🖨️ In Ấn
            </button>

            <button
              className="btn btn-sm btn-primary"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              title="Xuất file PDF vector chuẩn A4"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>📄 Tải PDF</span>
              {isExportingPdf && <span className="spinner-sm"></span>}
            </button>
          </div>
        </div>

        {/* FIND & REPLACE FLOATING BAR */}
        {showFindReplace && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Từ khóa cần tìm..."
              className="form-input"
              value={findText}
              onChange={e => setFindText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleFindNext(); }}
              style={{ width: '180px', padding: '4px 8px', fontSize: '12px' }}
            />
            <button className="btn btn-sm btn-secondary" onClick={handleFindNext} disabled={!findText.trim()}>
              Tìm tiếp
            </button>

            <input
              type="text"
              placeholder="Từ khóa thay thế..."
              className="form-input"
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              disabled={!isEditMode}
              style={{ width: '180px', padding: '4px 8px', fontSize: '12px' }}
            />
            <button className="btn btn-sm btn-secondary" onClick={handleReplaceCurrent} disabled={!isEditMode || !findText.trim()}>
              Thay thế
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleReplaceAll} disabled={!isEditMode || !findText.trim()}>
              Thay thế tất cả
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {!isEditMode && '(Bật "Chế Độ Chỉnh Sửa" để thay thế)'}
            </span>
          </div>
        )}

        {/* DOCUMENT CANVAS CONTAINER (A4 Paper WYSIWYG) */}
        <div
          ref={docContainerRef}
          className="contract-paper-wrapper"
          style={{
            flex: 1,
            padding: '24px 16px',
            overflowY: 'auto',
            background: '#4a4d50',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            ref={docPageRef}
            className={`contract-paper ${orientation === 'LANDSCAPE' ? 'landscape' : ''}`}
            contentEditable={isEditMode}
            suppressContentEditableWarning={true}
            onInput={() => {
              setIsDirty(true);
              updateDocStats();
            }}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              outline: isEditMode ? '2px dashed #006964' : 'none',
              cursor: isEditMode ? 'text' : 'default',
              marginBottom: zoomLevel > 1.0 ? `${(zoomLevel - 1.0) * 800}px` : '24px'
            }}
            dangerouslySetInnerHTML={{ __html: initialHtml }}
          />
        </div>

        {/* FOOTER STATUS BAR */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            Biểu mẫu: <strong>{tpl.name}</strong> • Định dạng: <strong>{orientation === 'LANDSCAPE' ? 'Khổ Ngang (Landscape A4)' : 'Khổ Dọc (Portrait A4)'}</strong>
          </div>
          <div>
            Công Ty Cổ Phần Genki Fami Việt Nam • Chuẩn Thể Thức Nghị Định 30/2020/NĐ-CP
          </div>
        </div>

      </div>
    </div>
  );
}
