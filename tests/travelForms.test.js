import { test } from 'node:test';
import assert from 'node:assert';
import {
  TRAVEL_FORM_TYPES,
  TRAVEL_FORM_TEMPLATES,
  renderDecree30Header,
  compileTravelFormHtml
} from '../src/utils/travelFormsConstants.js';
import { exportTravelFormToDocx } from '../src/utils/travelDocxGenerator.js';

test('TRAVEL_FORM_TEMPLATES: Đầy đủ 6 biểu mẫu chuẩn công tác nhân sự', () => {
  assert.strictEqual(TRAVEL_FORM_TEMPLATES.length, 6, 'Phải có đúng 6 biểu mẫu chuẩn hóa');

  const expectedIds = [
    TRAVEL_FORM_TYPES.FORM_CONG_TAC,
    TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN,
    TRAVEL_FORM_TYPES.FORM_TAM_UNG,
    TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG,
    TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG,
    TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN
  ];

  expectedIds.forEach(id => {
    const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === id);
    assert.ok(tpl, `Thiếu biểu mẫu: ${id}`);
    assert.ok(tpl.name && tpl.name.length > 0, `Biểu mẫu ${id} thiếu tên`);
    assert.ok(tpl.code && tpl.code.length > 0, `Biểu mẫu ${id} thiếu mã code`);
    assert.ok(tpl.legalBasis && tpl.legalBasis.length > 0, `Biểu mẫu ${id} thiếu căn cứ pháp lý`);
    assert.ok(tpl.defaultData, `Biểu mẫu ${id} thiếu defaultData`);
  });
});

test('Orientation Distribution: Sắp xếp trang ngang và dọc chuẩn xác theo độ rộng bảng biểu', () => {
  const formCongTac = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_CONG_TAC);
  const formKeHoachTuan = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN);
  const formTamUng = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_TAM_UNG);
  const formGiayDiDuong = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG);
  const formThanhToan = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG);
  const formDeNghiThanhToan = TRAVEL_FORM_TEMPLATES.find(t => t.id === TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN);

  // Bảng rộng 7-8 cột bắt buộc Khổ Ngang (Landscape A4: 297 x 210 mm)
  assert.strictEqual(formKeHoachTuan.defaultOrientation, 'LANDSCAPE', 'Kế hoạch tuần 7 cột phải là Khổ Ngang (Landscape)');
  assert.strictEqual(formGiayDiDuong.defaultOrientation, 'LANDSCAPE', 'Giấy đi đường 8 cột phải là Khổ Ngang (Landscape)');

  // Bảng hẹp & văn bản đề nghị là Khổ Dọc (Portrait A4: 210 x 297 mm)
  assert.strictEqual(formCongTac.defaultOrientation, 'PORTRAIT', 'Giấy đề nghị đi công tác phải là Khổ Dọc (Portrait)');
  assert.strictEqual(formTamUng.defaultOrientation, 'PORTRAIT', 'Giấy đề nghị tạm ứng phải là Khổ Dọc (Portrait)');
  assert.strictEqual(formThanhToan.defaultOrientation, 'PORTRAIT', 'Giấy thanh toán tạm ứng phải là Khổ Dọc (Portrait)');
  assert.strictEqual(formDeNghiThanhToan.defaultOrientation, 'PORTRAIT', 'Giấy đề nghị thanh toán phải là Khổ Dọc (Portrait)');
});

test('Decree 30 Typography: Tiêu đề Quốc hiệu, Tiêu ngữ và Tên cơ quan đúng thể thức NĐ 30/2020/NĐ-CP', () => {
  const headerHtml = renderDecree30Header('01/2026/ĐN-CT', 'Hà Nội', '2026-09-07');
  
  assert.ok(headerHtml.includes('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'), 'Phải chứa Quốc hiệu in hoa');
  assert.ok(headerHtml.includes('Độc lập - Tự do - Hạnh phúc'), 'Phải chứa Tiêu ngữ chuẩn');
  assert.ok(headerHtml.includes('CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM'), 'Phải chứa tên công ty ban hành');
  assert.ok(headerHtml.includes('Hà Nội, ngày 07 tháng 09 năm 2026'), 'Phải định dạng địa danh ngày tháng năm in nghiêng');
  assert.ok(headerHtml.includes('01/2026/ĐN-CT'), 'Phải hiển thị số hiệu văn bản');
});

test('compileTravelFormHtml: Biên dịch HTML đầy đủ cho cả 6 biểu mẫu', () => {
  TRAVEL_FORM_TEMPLATES.forEach(tpl => {
    const html = compileTravelFormHtml(tpl.id, tpl.defaultData);
    assert.ok(html.includes('travel-form-container'), `Form ${tpl.id} phải có wrapper travel-form-container`);
    assert.ok(html.includes('<table'), `Form ${tpl.id} phải chứa bảng dữ liệu`);

    // Kiểm tra class orientation tương ứng
    if (tpl.defaultOrientation === 'LANDSCAPE') {
      assert.ok(html.includes('landscape'), `Form ${tpl.id} phải có class landscape`);
    } else {
      assert.ok(html.includes('portrait'), `Form ${tpl.id} phải có class portrait`);
    }
  });
});

test('exportTravelFormToDocx: Xuất file Word (.docx) thành công cho cả Khổ Ngang và Khổ Dọc', async () => {
  // Test xuất khổ dọc
  const resPortrait = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_CONG_TAC, {});
  assert.ok(resPortrait.success, 'Tạo Document docx Portrait thành công');
  assert.strictEqual(resPortrait.orientation, 'PORTRAIT');
  assert.ok(resPortrait.fileName.includes('.docx'));
  assert.ok(resPortrait.document);

  // Test xuất khổ ngang
  const resLandscape = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN, {});
  assert.ok(resLandscape.success, 'Tạo Document docx Landscape thành công');
  assert.strictEqual(resLandscape.orientation, 'LANDSCAPE');
  assert.ok(resLandscape.fileName.includes('.docx'));

  // Test xuất giấy đi đường khổ ngang 8 cột
  const resGdd = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG, {});
  assert.ok(resGdd.success, 'Tạo Document docx Giấy đi đường thành công');
  assert.strictEqual(resGdd.orientation, 'LANDSCAPE');

  // Test xuất form tạm ứng
  const resTu = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_TAM_UNG, {});
  assert.ok(resTu.success, 'Tạo Document docx Tạm ứng thành công');
  assert.strictEqual(resTu.orientation, 'PORTRAIT');

  // Test xuất form thanh toán tạm ứng (Mẫu 04-TT)
  const resTttu = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG, {});
  assert.ok(resTttu.success, 'Tạo Document docx Thanh toán tạm ứng thành công');

  // Test xuất form đề nghị thanh toán
  const resDntt = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN, {});
  assert.ok(resDntt.success, 'Tạo Document docx Đề nghị thanh toán thành công');

  // Test đổi chiều giấy linh hoạt (override)
  const resOverride = await exportTravelFormToDocx(TRAVEL_FORM_TYPES.FORM_CONG_TAC, {}, 'LANDSCAPE');
  assert.strictEqual(resOverride.orientation, 'LANDSCAPE', 'Cho phép chuyển đổi chiều giấy tùy chọn');
});

test('Financial Compliance: Xử lý đối soát thanh toán tạm ứng 3 phần (Mẫu 04-TT)', () => {
  // Trường hợp 1: Tạm ứng 5.000.000, chi 4.030.000 -> Hoàn nộp lại quỹ 970.000
  const html1 = compileTravelFormHtml(TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG, {
    advanceThisPeriod: 5000000,
    actualExpenses: [
      { item: 'Vé xe', amount: 2000000 },
      { item: 'Khách sạn', amount: 2030000 }
    ]
  });
  assert.ok(html1.includes('970.000'), 'Phải tính chênh lệch thừa 970.000đ');
  assert.ok(html1.includes('nộp lại quỹ'), 'Phải có kết luận nộp lại quỹ');

  // Trường hợp 2: Tạm ứng 3.000.000, chi 3.500.000 -> Công ty chi trả bổ sung 500.000
  const html2 = compileTravelFormHtml(TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG, {
    advanceThisPeriod: 3000000,
    actualExpenses: [
      { item: 'Chi phí công tác thực tế', amount: 3500000 }
    ]
  });
  assert.ok(html2.includes('500.000'), 'Phải tính chi quá số tạm ứng 500.000đ');
  assert.ok(html2.includes('chi trả bổ sung'), 'Phải có kết luận chi trả bổ sung');
});
