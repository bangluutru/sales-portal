import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageOrientation,
  Packer
} from 'docx';
import { formatVND, formatDate, numberToVietnameseWords } from './helpers.js';
import { TRAVEL_FORM_TYPES, TRAVEL_FORM_TEMPLATES } from './travelFormsConstants.js';

const FONT_FAMILY = 'Times New Roman';
const SIZE_BODY = 26; // 13pt
const SIZE_TITLE = 32; // 16pt
const SIZE_SUBTITLE = 24; // 12pt
const SIZE_TABLE = 22; // 11pt
const SIZE_HEADER = 24; // 12pt

const borderNone = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const bordersNone = { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone };
const borderSolid = { style: BorderStyle.SINGLE, size: 4, color: '333333' };
const bordersTable = { top: borderSolid, bottom: borderSolid, left: borderSolid, right: borderSolid };

/**
 * Tạo header Nghị định 30 bằng bảng 2 cột không viền trong Word
 */
function createDocxNd30Header(docCode = '', location = 'Hà Nội', docDate = '', docNumberLabel = 'Số:') {
  const d = docDate ? new Date(docDate) : new Date();
  const dayStr = isNaN(d.getDate()) ? '...' : String(d.getDate()).padStart(2, '0');
  const monthStr = isNaN(d.getMonth()) ? '...' : String(d.getMonth() + 1).padStart(2, '0');
  const yearStr = isNaN(d.getFullYear()) ? '2026' : String(d.getFullYear());

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: bordersNone,
    rows: [
      new TableRow({
        children: [
          // Cột trái: Đơn vị ban hành
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'CÔNG TY CP GENKI FAMI VIỆT NAM', bold: true, font: FONT_FAMILY, size: SIZE_HEADER })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'BỘ PHẬN KINH DOANH & VẬN HÀNH', font: FONT_FAMILY, size: 22 })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: '—————————', bold: true, font: FONT_FAMILY, size: 20 })
                ]
              }),
              ...(docCode ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: `${docNumberLabel} ${docCode}`, font: FONT_FAMILY, size: 22 })
                  ]
                })
              ] : [])
            ]
          }),
          // Cột phải: Quốc hiệu - Tiêu ngữ
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, font: FONT_FAMILY, size: SIZE_HEADER })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, font: FONT_FAMILY, size: 26 })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: '———————————————', bold: true, font: FONT_FAMILY, size: 22 })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${location}, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`, italics: true, font: FONT_FAMILY, size: SIZE_HEADER })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

/**
 * Tạo bảng chữ ký N cột cân đối không viền
 */
function createDocxSignaturesTable(columns) {
  const colWidthPct = Math.floor(100 / columns.length);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: bordersNone,
    rows: [
      new TableRow({
        children: columns.map(c => new TableCell({
          width: { size: colWidthPct, type: WidthType.PERCENTAGE },
          borders: bordersNone,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: c.title.toUpperCase(), bold: true, font: FONT_FAMILY, size: 24 })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: c.note || '(Ký, ghi rõ họ tên)', italics: true, font: FONT_FAMILY, size: 20 })
              ]
            }),
            // Khoảng trống ký
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: c.name || '', bold: true, font: FONT_FAMILY, size: 24 })
              ]
            })
          ]
        }))
      })
    ]
  });
}

/**
 * Xuất file Word (.docx) chuyên dụng cho 6 Biểu mẫu Công tác & Chi phí
 */
export async function exportTravelFormToDocx(templateId, data = {}, orientationOverride = null) {
  const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === templateId) || TRAVEL_FORM_TEMPLATES[0];
  const activeOrientation = orientationOverride || tpl.defaultOrientation;
  const isLandscape = activeOrientation === 'LANDSCAPE';
  const merged = { ...tpl.defaultData, ...data };

  let children = [];

  switch (templateId) {
    case TRAVEL_FORM_TYPES.FORM_CONG_TAC:
      children = buildFormCongTacDocx(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN:
      children = buildFormKeHoachTuanDocx(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_TAM_UNG:
      children = buildFormTamUngDocx(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG:
      children = buildFormGiayDiDuongDocx(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG:
      children = buildFormThanhToanTamUngDocx(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN:
      children = buildFormDeNghiThanhToanDocx(merged);
      break;
    default:
      children = buildFormCongTacDocx(merged);
  }

  // Khổ giấy A4 và margin chuẩn
  const pageProps = isLandscape ? {
    size: {
      orientation: PageOrientation.LANDSCAPE,
      width: 16838, // 297mm in twips
      height: 11906 // 210mm in twips
    },
    margin: {
      top: 1134, // 20mm
      bottom: 1134, // 20mm
      left: 1417, // 25mm
      right: 1134 // 20mm
    }
  } : {
    size: {
      orientation: PageOrientation.PORTRAIT,
      width: 11906, // 210mm in twips
      height: 16838 // 297mm in twips
    },
    margin: {
      top: 1134, // 20mm
      bottom: 1134, // 20mm
      left: 1701, // 30mm đóng gáy
      right: 1134 // 20mm
    }
  };

  const doc = new Document({
    sections: [{
      properties: { page: pageProps },
      children
    }]
  });

  const fileName = `${tpl.code}_${merged.requesterName || 'Genki'}_${activeOrientation.toLowerCase()}.docx`
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_');

  // Trong môi trường Node / Test, trả về đối tượng kết quả chuẩn
  if (typeof window === 'undefined') {
    return { success: true, fileName, orientation: activeOrientation, document: doc };
  }

  // Trên trình duyệt: tạo blob và kích hoạt download
  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, fileName, orientation: activeOrientation, document: doc };
}

// 1. Build DOCX Giấy Đề Nghị Đi Công Tác (Portrait)
function buildFormCongTacDocx(d) {
  const members = d.members || [];
  const costs = d.costEstimates || [];
  const totalCost = costs.reduce((s, c) => s + Number(c.amount || 0), 0);

  return [
    createDocxNd30Header(d.docCode, d.location, d.docDate),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'GIẤY ĐỀ NGHỊ ĐI CÔNG TÁC', bold: true, font: FONT_FAMILY, size: SIZE_TITLE })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '(V/v: Cử cán bộ thực hiện nhiệm vụ phát triển thị trường)', italics: true, font: FONT_FAMILY, size: SIZE_SUBTITLE })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Kính gửi: ', bold: true, italics: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: 'Ban Giám Đốc Công ty Cổ Phần Genki Fami Việt Nam', italics: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Họ và tên người đề nghị: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.requesterName, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Chức vụ / Bộ phận: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: `${d.position} — ${d.department}`, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Lý do / Mục đích: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.purpose, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Nơi đi công tác: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.destination, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Thời gian công tác: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: `Từ ngày ${formatDate(d.startDate)} đến ngày ${formatDate(d.endDate)} (${d.durationDays || 6} ngày)`, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Phương tiện di chuyển: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.transportation, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'I. DANH SÁCH CÁN BỘ ĐI CÔNG TÁC:', bold: true, font: FONT_FAMILY, size: 24 })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '* Trường hợp đi công tác dài ngày từ 2 ngày trở lên bắt buộc có chương trình / kế hoạch công tác kèm theo.', italics: true, font: FONT_FAMILY, size: 20 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['STT', 'Họ và Tên', 'Chức Vụ', 'Bộ Phận', 'Nhiệm Vụ'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 8 : i === 1 ? 30 : i === 2 ? 22 : i === 3 ? 20 : 20, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
          }))
        }),
        ...members.map((m, idx) => new TableRow({
          children: [
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(m.stt || idx + 1), font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: m.name, bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 22, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.position, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.department, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: m.role || 'Thành viên', font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }))
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'II. DỰ TOÁN KINH PHÍ CÔNG TÁC ĐƯỢC DUYỆT:', bold: true, font: FONT_FAMILY, size: 24 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['STT', 'Khoản Mục Chi Phí', 'Định Mức / Ngày', 'Số Lượng', 'Thành Tiền (VNĐ)', 'Ghi Chú'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 8 : i === 1 ? 32 : i === 2 ? 18 : i === 3 ? 12 : i === 4 ? 18 : 12, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
          }))
        }),
        ...costs.map((c, idx) => new TableRow({
          children: [
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(c.stt || idx + 1), font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 32, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: c.item, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: c.standardRate ? formatVND(c.standardRate) : '—', font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${c.quantity} ${c.unit || ''}`, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(c.amount), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: c.note || '', font: FONT_FAMILY, size: 20 })] })] })
          ]
        })),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 4,
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TỔNG CỘNG DỰ TOÁN:', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
            }),
            new TableCell({
              width: { size: 18, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(totalCost), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
            }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ text: '' })] })
          ]
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Số tiền viết bằng chữ: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: `${numberToVietnameseWords(totalCost)}.`, italics: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    createDocxSignaturesTable([
      { title: 'Người đề nghị', note: '(Ký, ghi rõ họ tên)', name: d.requesterName },
      { title: 'Quản lý bộ phận', note: '(Ký, ghi rõ họ tên)', name: d.managerName || 'Lê Trí Nam' },
      { title: 'Tổng Giám Đốc Phê Duyệt', note: '(Ký tên, đóng dấu)', name: d.directorName || 'Nguyễn Hữu Thi' }
    ])
  ];
}

// 2. Build DOCX Kế Hoạch & Báo Cáo Tuần (Landscape - 7 columns)
function buildFormKeHoachTuanDocx(d) {
  const rows = d.scheduleRows || [];
  const extra = d.extraWorks || [];
  const recs = d.recommendations || [];

  return [
    createDocxNd30Header(d.docCode || 'KH-BC/TUAN-37', d.location || 'Miền Nam', d.docDate),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'KẾ HOẠCH & BÁO CÁO CÔNG TÁC TUẦN', bold: true, font: FONT_FAMILY, size: SIZE_TITLE })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Thời gian: ${d.weekLabel || `Từ ngày ${formatDate(d.startDate)} đến ${formatDate(d.endDate)}`}`, italics: true, font: FONT_FAMILY, size: SIZE_SUBTITLE })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Người lập: ${d.requesterName} (${d.position})   |   Bộ phận: ${d.department}   |   Khu vực: ${d.region || 'Miền Nam'}`, bold: true, font: FONT_FAMILY, size: 24 })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'I. KẾ HOẠCH & BÁO CÁO CÔNG VIỆC TUẦN (7 CỘT CHI TIẾT):', bold: true, font: FONT_FAMILY, size: 24 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['STT', 'Thứ - Ngày', 'Nội dung kế hoạch chi tiết (Địa chỉ, khách hàng, nội dung)', 'Người phối hợp', 'Kết quả thực tế đạt được', 'Tỷ lệ %', 'Ghi chú'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 5 : i === 1 ? 12 : i === 2 ? 30 : i === 3 ? 14 : i === 4 ? 24 : i === 5 ? 7 : 8, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: 20 })] })]
          }))
        }),
        ...rows.map((r, idx) => new TableRow({
          children: [
            new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.stt || idx + 1), bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.day, bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: r.planContent, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.collaborator || '—', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: r.actualResult || '—', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 7, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.completionRate != null ? `${r.completionRate}%` : '—', bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: r.note || '', font: FONT_FAMILY, size: 18 })] })] })
          ]
        }))
      ]
    }),
    new Paragraph({ text: '' }),
    ...(extra.length > 0 ? [
      new Paragraph({
        children: [
          new TextRun({ text: 'II. CÔNG VIỆC BỔ SUNG / PHÁT SINH:', bold: true, font: FONT_FAMILY, size: 22 })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: bordersTable,
        rows: [
          new TableRow({
            children: ['STT', 'Nội dung công việc phát sinh', 'Kết quả xử lý', 'Ghi chú'].map((h, i) => new TableCell({
              width: { size: i === 0 ? 5 : i === 1 ? 50 : i === 2 ? 30 : 15, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: 20 })] })]
            }))
          }),
          ...extra.map((e, idx) => new TableRow({
            children: [
              new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(e.stt || idx + 1), font: FONT_FAMILY, size: 20 })] })] }),
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: e.content, font: FONT_FAMILY, size: 20 })] })] }),
              new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: e.result || 'Đã hoàn thành', font: FONT_FAMILY, size: 20 })] })] }),
              new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: e.note || '', font: FONT_FAMILY, size: 18 })] })] })
            ]
          }))
        ]
      }),
      new Paragraph({ text: '' })
    ] : []),
    new Paragraph({
      children: [
        new TextRun({ text: 'III. KIẾN NGHỊ - ĐỀ XUẤT & GIẢI PHÁP:', bold: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    ...recs.map((rec, idx) => new Paragraph({
      children: [
        new TextRun({ text: `${idx + 1}. `, bold: true, font: FONT_FAMILY, size: 22 }),
        new TextRun({ text: rec.content, font: FONT_FAMILY, size: 22 })
      ]
    })),
    new Paragraph({ text: '' }),
    createDocxSignaturesTable([
      { title: 'Người Lập Kế Hoạch - Báo Cáo', note: '(Ký, ghi rõ họ tên)', name: d.requesterName },
      { title: 'Giám Đốc Kinh Doanh (CCO)', note: '(Ký, ghi rõ họ tên)', name: d.managerName || 'Lê Trí Nam' },
      { title: 'Giám Đốc Điều Hành Phê Duyệt', note: '(Ký tên, đóng dấu)', name: d.directorName || 'Nguyễn Hữu Thi' }
    ])
  ];
}

// 3. Build DOCX Giấy Đề Nghị Tạm Ứng (Portrait)
function buildFormTamUngDocx(d) {
  const items = d.items || [];
  const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);

  return [
    createDocxNd30Header(d.requestCode, d.location, d.docDate, 'Mã đề nghị:'),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'GIẤY ĐỀ NGHỊ TẠM ỨNG', bold: true, font: FONT_FAMILY, size: SIZE_TITLE })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '(Kinh phí phục vụ công tác thị trường)', italics: true, font: FONT_FAMILY, size: SIZE_SUBTITLE })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Kính gửi: ', bold: true, italics: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: 'Ban Giám Đốc Công ty & Phòng Kế toán - Tài chính', italics: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Họ và tên người đề nghị: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.requesterName, bold: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Chức vụ / Bộ phận: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: `${d.position} — ${d.department}`, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Lý do / Nội dung tạm ứng: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.purpose, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'BẢNG KÊ CHI TIẾT KHOẢN TẠM ỨNG:', bold: true, font: FONT_FAMILY, size: 24 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['STT', 'Khoản Mục Tạm Ứng Chi Tiết', 'Số Tiền (VNĐ)', 'Căn Cứ / Ghi Chú'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 8 : i === 1 ? 47 : i === 2 ? 25 : 20, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
          }))
        }),
        ...items.map((item, idx) => new TableRow({
          children: [
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.stt || idx + 1), font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 47, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: item.title, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(item.amount), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: item.note || '', font: FONT_FAMILY, size: 20 })] })] })
          ]
        })),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TỔNG CỘNG TIỀN TẠM ỨNG:', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(total), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
            }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ text: '' })] })
          ]
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Số tiền viết bằng chữ: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: `${numberToVietnameseWords(total)}.`, italics: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Thời hạn thanh toán / hoàn ứng: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.settlementDeadline || 'Trong vòng 05 ngày làm việc sau chuyến đi.', font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    createDocxSignaturesTable([
      { title: 'Người đề nghị tạm ứng', note: '(Ký, ghi rõ họ tên)', name: d.requesterName },
      { title: 'Kế toán trưởng', note: '(Ký, ghi rõ họ tên)', name: d.accountantName || 'Đào Thị Hồng' },
      { title: 'Tổng Giám Đốc Duyệt', note: '(Ký tên, đóng dấu)', name: d.directorName || 'Nguyễn Hữu Thi' }
    ])
  ];
}

// 4. Build DOCX Giấy Đi Đường Lữ Hành (Landscape - 8 columns)
function buildFormGiayDiDuongDocx(d) {
  const logs = d.journeyLogs || [];
  const cost = d.costSummary || { travel: 0, lodging: 0, perDiem: 0, hospitality: 0, other: 0 };
  const totalCost = Number(cost.travel || 0) + Number(cost.lodging || 0) + Number(cost.perDiem || 0) + Number(cost.hospitality || 0) + Number(cost.other || 0);

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersNone,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: bordersNone,
              children: [
                new Paragraph({ children: [new TextRun({ text: 'CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM', bold: true, font: FONT_FAMILY, size: 24 })] }),
                new Paragraph({ children: [new TextRun({ text: `Bộ phận: ${d.department || 'Phòng Kinh Doanh'}`, font: FONT_FAMILY, size: 22 })] }),
                new Paragraph({ children: [new TextRun({ text: `Lệnh điều động: ${d.dispatchOrder || 'Theo kế hoạch công tác số 01/2026'}`, font: FONT_FAMILY, size: 20 })] })
              ]
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: bordersNone,
              children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Mẫu số: 06 - LĐTL', bold: true, font: FONT_FAMILY, size: 24 })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '(Ban hành theo TT 200/2014/TT-BTC & TT 133/2016/TT-BTC)', italics: true, font: FONT_FAMILY, size: 18 })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${d.location || 'Hà Nội'}, ngày ${formatDate(d.docDate)}`, italics: true, font: FONT_FAMILY, size: 22 })] })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'GIẤY ĐI ĐƯỜNG', bold: true, font: FONT_FAMILY, size: SIZE_TITLE })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `(Số: ${d.docCode || '06-LĐTL/2026'})`, italics: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Cấp cho Ông/Bà: ${d.officerName.toUpperCase()}   |   Chức vụ: ${d.position}   |   Nơi đến: ${d.destination}   |   Từ ${formatDate(d.startDate)} đến ${formatDate(d.endDate)}`, bold: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'I. LỊCH TRÌNH CÔNG TÁC & XÁC NHẬN NƠI ĐẾN (8 CỘT):', bold: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['Nơi đi và Nơi đến', 'Ngày Giờ', 'Phương Tiện', 'Cự Ly', 'Lưu Trú Đi', 'Lưu Trú Đến', 'Lý Do Lưu Trú', 'Xác Nhận Nơi Đến'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 18 : i === 1 ? 12 : i === 2 ? 12 : i === 3 ? 8 : i === 4 ? 10 : i === 5 ? 10 : i === 6 ? 16 : 14, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: 19 })] })]
          }))
        }),
        ...logs.map(log => new TableRow({
          children: [
            new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: log.fromTo.replace(/\n/g, ' - '), font: FONT_FAMILY, size: 19 })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: log.dateTime.replace(/\n/g, ' '), font: FONT_FAMILY, size: 18 })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: log.vehicle, font: FONT_FAMILY, size: 19 })] })] }),
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: log.distanceKm, bold: true, font: FONT_FAMILY, size: 19 })] })] }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: log.transitStay, font: FONT_FAMILY, size: 18 })] })] }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: log.destStay, font: FONT_FAMILY, size: 18 })] })] }),
            new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: log.reason, font: FONT_FAMILY, size: 19 })] })] }),
            new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: log.verification || 'Ký, đóng dấu', italics: true, font: FONT_FAMILY, size: 18 })] })] })
          ]
        }))
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'II. TỔNG HỢP CHI PHÍ CÔNG TÁC & DUYỆT THANH TOÁN:', bold: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: [
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '1. Chi phí đi lại (vé xe, tàu, xăng):', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(cost.travel), bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '- Tiền tạm ứng trước:', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(d.advanceTravelCost || 0), bold: true, font: FONT_FAMILY, size: 20 })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '2. Chi phí lưu trú khách sạn:', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(cost.lodging), bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '- Ngày lưu trú hưởng phụ cấp:', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${d.approvedStayDays || 5} ngày`, bold: true, font: FONT_FAMILY, size: 20 })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '3. Phụ cấp công tác / Tiền ăn:', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(cost.perDiem), bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: 'SỐ TIỀN DUYỆT THANH TOÁN:', bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(d.approvedAmount || totalCost), bold: true, font: FONT_FAMILY, size: 20 })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '4. Chi phí tiếp khách & khác:', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(Number(cost.hospitality || 0) + Number(cost.other || 0)), bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ columnSpan: 2, width: { size: 50, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: `Bằng chữ: ${numberToVietnameseWords(d.approvedAmount || totalCost)}.`, italics: true, font: FONT_FAMILY, size: 19 })] })] })
          ]
        })
      ]
    }),
    new Paragraph({ text: '' }),
    createDocxSignaturesTable([
      { title: 'Người đi công tác', note: '(Ký, ghi rõ họ tên)', name: d.officerName },
      { title: 'Trưởng bộ phận', note: '(Ký, ghi rõ họ tên)', name: d.departmentHeadName || 'Lê Trí Nam' },
      { title: 'Trưởng phòng kế toán', note: '(Ký, ghi rõ họ tên)', name: d.chiefAccountantName || 'Đào Thị Hồng' },
      { title: 'Thủ trưởng đơn vị duyệt', note: '(Ký tên, đóng dấu)', name: d.directorName || 'Nguyễn Hữu Thi' }
    ])
  ];
}

// 5. Build DOCX Giấy Thanh Toán Tạm Ứng (Portrait - Mẫu 04-TT)
function buildFormThanhToanTamUngDocx(d) {
  const advancePrev = Number(d.advancePrevious || 0);
  const advanceThis = Number(d.advanceThisPeriod || 0);
  const totalAdvance = advancePrev + advanceThis;

  const actualList = d.actualExpenses || [];
  const totalSpent = actualList.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const diffUnspent = Math.max(0, totalAdvance - totalSpent);
  const diffOverspent = Math.max(0, totalSpent - totalAdvance);

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersNone,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: bordersNone,
              children: [
                new Paragraph({ children: [new TextRun({ text: 'CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM', bold: true, font: FONT_FAMILY, size: 24 })] }),
                new Paragraph({ children: [new TextRun({ text: `Bộ phận: ${d.department}`, font: FONT_FAMILY, size: 22 })] })
              ]
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: bordersNone,
              children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Mẫu số: 04 - TT', bold: true, font: FONT_FAMILY, size: 24 })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '(Ban hành theo Thông tư 200/2014/TT-BTC của Bộ Tài Chính)', italics: true, font: FONT_FAMILY, size: 18 })] })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'GIẤY THANH TOÁN TẠM ỨNG', bold: true, font: FONT_FAMILY, size: SIZE_TITLE })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Ngày ${formatDate(d.docDate)} • Số: ${d.docCode || '04-TT/2026'}`, italics: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Họ và tên người thanh toán: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.requesterName, bold: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Bộ phận (hoặc địa chỉ): ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.department, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Số tiền tạm ứng được thanh toán theo bảng đối chiếu dưới đây:', font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['Diễn Giải Nội Dung Quyết Toán', 'Số Tiền (VNĐ)'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 70 : 30, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })]
          }))
        }),
        new TableRow({
          children: [
            new TableCell({ columnSpan: 2, width: { size: 100, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: 'I. SỐ TIỀN TẠM ỨNG:', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '1. Số tạm ứng các kỳ trước chưa chi hết:', font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(advancePrev), font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: `2. Số tạm ứng kỳ này (${d.paymentVoucherNumber || 'Phiếu chi công tác'}):`, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(advanceThis), font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'CỘNG SỐ TIỀN TẠM ỨNG (I):', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(totalAdvance), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ columnSpan: 2, width: { size: 100, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: 'II. SỐ TIỀN ĐÃ THỰC CHI THEO CHỨNG TỪ KÈM THEO:', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        ...actualList.map(item => new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: item.item, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(item.amount), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        })),
        new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'CỘNG SỐ TIỀN ĐÃ CHI (II):', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(totalSpent), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ columnSpan: 2, width: { size: 100, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: 'III. CHÊNH LỆCH THANH TOÁN:', bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '1. Số tạm ứng chi không hết (nộp lại quỹ công ty) [ I - II ]:', font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(diffUnspent), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: '2. Chi quá số tạm ứng (công ty chi bù cho người tạm ứng) [ II - I ]:', font: FONT_FAMILY, size: SIZE_TABLE })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(diffOverspent), bold: true, font: FONT_FAMILY, size: SIZE_TABLE })] })] })
          ]
        })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({
          text: diffUnspent > 0
            ? `Kết luận: Người tạm ứng phải nộp lại quỹ số tiền: ${formatVND(diffUnspent)} (${numberToVietnameseWords(diffUnspent)}).`
            : diffOverspent > 0
              ? `Kết luận: Công ty chi trả bổ sung số tiền: ${formatVND(diffOverspent)} (${numberToVietnameseWords(diffOverspent)}).`
              : 'Kết luận: Số tiền tạm ứng vừa vặn với số thực chi (Cân bằng quyết toán).',
          bold: true,
          font: FONT_FAMILY,
          size: SIZE_BODY
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `(Kèm theo ${d.attachmentCount || 7} chứng từ gốc và hóa đơn VAT hợp lệ).`, italics: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Paragraph({ text: '' }),
    createDocxSignaturesTable([
      { title: 'Người đề nghị', note: '(Ký, ghi rõ họ tên)', name: d.requesterName },
      { title: 'Kế toán thanh toán', note: '(Ký, ghi rõ họ tên)', name: d.paymentAccountantName || 'Nguyễn Thị Thùy' },
      { title: 'Kế toán trưởng', note: '(Ký, ghi rõ họ tên)', name: d.chiefAccountantName || 'Đào Thị Hồng' },
      { title: 'Thủ trưởng đơn vị', note: '(Ký tên, đóng dấu)', name: d.directorName || 'Nguyễn Hữu Thi' }
    ])
  ];
}

// 6. Build DOCX Giấy Đề Nghị Thanh Toán (Portrait)
function buildFormDeNghiThanhToanDocx(d) {
  const rows = d.expenseRows || [];
  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

  return [
    createDocxNd30Header(d.requestCode, d.location, d.docDate, 'Số phiếu:'),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'GIẤY ĐỀ NGHỊ THANH TOÁN', bold: true, font: FONT_FAMILY, size: SIZE_TITLE })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '(V/v: Thanh toán các khoản chi phí phát sinh phục vụ hoạt động công ty)', italics: true, font: FONT_FAMILY, size: SIZE_SUBTITLE })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Kính gửi: ', bold: true, italics: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: 'Ban Giám Đốc Công ty & Phòng Kế toán - Tài chính', italics: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Họ và tên người đề nghị: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.requesterName, bold: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Bộ phận (hoặc địa chỉ): ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.department, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Nội dung thanh toán: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: d.purpose, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'BẢNG KÊ HÓA ĐƠN & CHỨNG TỪ GỐC THANH TOÁN:', bold: true, font: FONT_FAMILY, size: 24 })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: bordersTable,
      rows: [
        new TableRow({
          children: ['STT', 'Ngày Tháng', 'Số Chứng Từ', 'Nội Dung Thanh Toán', 'Đơn Vị Xuất', 'Số Tiền (VNĐ)', 'Ghi Chú'].map((h, i) => new TableCell({
            width: { size: i === 0 ? 6 : i === 1 ? 12 : i === 2 ? 12 : i === 3 ? 30 : i === 4 ? 18 : i === 5 ? 12 : 10, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: FONT_FAMILY, size: 20 })] })]
          }))
        }),
        ...rows.map((r, idx) => new TableRow({
          children: [
            new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.stt || idx + 1), font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.date || '', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.voucherNo || '', font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: r.description, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: r.supplier || '', font: FONT_FAMILY, size: 18 })] })] }),
            new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(r.amount), bold: true, font: FONT_FAMILY, size: 20 })] })] }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ children: [new TextRun({ text: r.note || '', font: FONT_FAMILY, size: 18 })] })] })
          ]
        })),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 5,
              width: { size: 78, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TỔNG CỘNG TIỀN ĐỀ NGHỊ THANH TOÁN:', bold: true, font: FONT_FAMILY, size: 20 })] })]
            }),
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: bordersTable,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatVND(total), bold: true, font: FONT_FAMILY, size: 20 })] })]
            }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: bordersTable, children: [new Paragraph({ text: '' })] })
          ]
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Số tiền viết bằng chữ: ', bold: true, font: FONT_FAMILY, size: SIZE_BODY }),
        new TextRun({ text: `${numberToVietnameseWords(total)}.`, italics: true, font: FONT_FAMILY, size: SIZE_BODY })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `(Kèm theo ${d.attachmentCount || 6} hóa đơn, chứng từ gốc hợp lệ).`, italics: true, font: FONT_FAMILY, size: 22 })
      ]
    }),
    new Paragraph({ text: '' }),
    createDocxSignaturesTable([
      { title: 'Người đề nghị', note: '(Ký, ghi rõ họ tên)', name: d.requesterName },
      { title: 'Kế toán thanh toán', note: '(Ký, ghi rõ họ tên)', name: d.paymentAccountantName || 'Nguyễn Thị Thùy' },
      { title: 'Kế toán trưởng', note: '(Ký, ghi rõ họ tên)', name: d.chiefAccountantName || 'Đào Thị Hồng' },
      { title: 'Người duyệt (Giám Đốc)', note: '(Ký tên, đóng dấu)', name: d.directorName || 'Nguyễn Hữu Thi' }
    ])
  ];
}
