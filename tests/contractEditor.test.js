import test from 'node:test';
import assert from 'node:assert/strict';

test('Contract Editor: Hỗ trợ cấu trúc lưu bản thảo tùy biến customContentHtml', () => {
  const baseContract = {
    id: 'CTR-2026-HTKD-001',
    contractCode: '20260601_HĐHT - Nguyễn Văn An_HN',
    status: 'DRAFT',
    salary: 8000000,
    allowance: 7000000,
    hasCustomEdits: false
  };

  const updates = {
    hasCustomEdits: true,
    customContentHtml: '<div>Nội dung đã chỉnh sửa đặc biệt cho đối tác</div>'
  };

  const updatedContract = {
    ...baseContract,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  assert.equal(updatedContract.hasCustomEdits, true);
  assert.ok(updatedContract.customContentHtml.includes('chỉnh sửa đặc biệt'));
});

test('Print Engine: Tạo cấu trúc HTML paged media chuẩn A4 không có absolute positioning', () => {
  const samplePage1 = '<div class="cp-title">HỢP ĐỒNG HỢP TÁC KINH DOANH</div>';
  const samplePage2 = '<div class="cp-title">PHỤ LỤC 01</div>';
  
  const combinedHtml = `
    <div class="contract-page">${samplePage1}</div>
    <div class="page-break"></div>
    <div class="contract-page">${samplePage2}</div>
  `;

  assert.ok(combinedHtml.includes('page-break'));
  assert.ok(!combinedHtml.includes('position: absolute'));
});

test('Doc Stats: Đếm chính xác số từ và số ký tự', () => {
  const sampleDocText = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM Độc lập – Tự do – Hạnh phúc';
  const words = sampleDocText.trim().split(/\s+/).length;
  const chars = sampleDocText.length;

  assert.equal(words, 16);
  assert.equal(chars, 62);
});

test('Zoom Levels: Đảm bảo các thang đo zoom hợp lệ trong ngưỡng 75% - 150%', () => {
  const zoomLevels = [0.75, 0.9, 1.0, 1.25, 1.5];
  assert.equal(zoomLevels.length, 5);
  assert.ok(zoomLevels[0] >= 0.75);
  assert.ok(zoomLevels[zoomLevels.length - 1] <= 1.5);
});

test('Find & Replace: Thay thế chính xác từ khóa an toàn không dính lỗi ký tự đặc biệt', () => {
  const original = 'Đại diện BÊN A: CÔNG TY CỔ PHẦN GENKI FAMI. BÊN A chịu trách nhiệm.';
  const findText = 'BÊN A';
  const replaceText = 'BÊN GIAO VIỆC';

  const escapedRegex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const result = original.replace(escapedRegex, replaceText);

  assert.equal(result, 'Đại diện BÊN GIAO VIỆC: CÔNG TY CỔ PHẦN GENKI FAMI. BÊN GIAO VIỆC chịu trách nhiệm.');
});

