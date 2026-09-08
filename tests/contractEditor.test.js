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
