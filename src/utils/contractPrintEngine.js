/**
 * Contract High-Fidelity Print & PDF Generation Engine
 * Solves browser modal overflow and absolute positioning clipping bugs.
 */

/**
 * In tài liệu hợp đồng qua Hidden Iframe biệt lập
 * Đảm bảo 100% không bị ảnh hưởng bởi CSS của Modal / Single Page App
 * Chuẩn khổ giấy A4, lề chuẩn hành chính Việt Nam, ngắt trang hoàn hảo.
 */
export function printContractViaIframe(contentHtml, documentTitle = 'Hợp Đồng Kinh Doanh', orientation = 'portrait') {
  return new Promise((resolve) => {
    // 1. Tạo iframe ẩn
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    // 2. Viết tài liệu độc lập với CSS paged media chuẩn A4
    const doc = iframe.contentWindow.document;
    doc.open();
    const pageMargin = orientation === 'landscape' ? '15mm 15mm 15mm 20mm' : '20mm 15mm 20mm 25mm';
    doc.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>${documentTitle}</title>
          <style>
            @page {
              size: A4 ${orientation};
              margin: ${pageMargin}; /* Khổ dọc: Trái 25mm đóng gáy; Khổ ngang: Cân đối 15-20mm */
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: "Times New Roman", Times, Georgia, serif;
              font-size: 13pt;
              line-height: 1.45;
              color: #000000;
              background: #ffffff;
            }
            .contract-page {
              width: 100%;
              margin: 0;
              padding: 0;
              background: transparent;
            }
            .page-break {
              page-break-before: always !important;
              break-before: page !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            .no-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin: 12px 0;
            }
            th, td {
              border: 1px solid #555555;
              padding: 6px 10px;
              font-size: 12pt;
            }
            th {
              background-color: #f2f2f2 !important;
              font-weight: bold;
              text-align: center;
            }
            .signatures-table {
              width: 100%;
              margin-top: 30px;
              border-collapse: collapse;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .signatures-table td {
              border: none !important;
              text-align: center;
              vertical-align: top;
              width: 50%;
            }
            .cp-national-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .cp-country {
              font-size: 13pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .cp-motto {
              font-size: 13pt;
              font-weight: bold;
              margin-top: 2px;
            }
            .cp-divider {
              width: 130px;
              height: 1px;
              background-color: #000000;
              margin: 4px auto 0;
            }
            .cp-title-area {
              text-align: center;
              margin: 20px 0 16px;
            }
            .cp-title {
              font-size: 16pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .cp-code {
              font-size: 12pt;
              font-style: italic;
              color: #333333;
            }
            .cp-preamble {
              font-style: italic;
              margin-bottom: 14px;
            }
            .cp-party-section {
              margin-bottom: 14px;
            }
            .cp-party-title {
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .cp-party-field {
              margin-bottom: 2px;
            }
            .cp-article-title {
              font-weight: bold;
              margin-top: 14px;
              margin-bottom: 4px;
            }
            .cp-article-text {
              text-indent: 1.2cm;
              margin-bottom: 4px;
              text-align: justify;
            }
            .cp-signature-role {
              font-weight: bold;
              text-transform: uppercase;
            }
            .cp-signature-note {
              font-size: 11pt;
              font-style: italic;
              color: #555555;
              margin-bottom: 60px;
            }
            .cp-signature-name {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `);
    doc.close();

    // 3. Chờ tài nguyên tải xong rồi gọi print
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve();
      }, 1000);
    }, 300);
  });
}

/**
 * Tải trực tiếp file .pdf về máy client dùng html2pdf.js
 * Hoạt động độc lập không cần mở hộp thoại in của trình duyệt
 */
export async function downloadContractAsPdf(element, filename = 'hop_dong.pdf', orientation = 'portrait') {
  const html2pdf = (await import('html2pdf.js')).default;
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const opt = {
    margin: orientation === 'landscape' ? [15, 15, 15, 15] : [15, 12, 15, 20], // Khổ ngang cân đối, khổ dọc lề trái 20mm
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: orientation
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      before: '.page-break'
    }
  };

  return html2pdf().set(opt).from(element).save();
}
