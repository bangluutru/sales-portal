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
  PageBreak,
  Packer
} from 'docx';
import { formatVND, formatDate, numberToVietnameseWords } from './helpers.js';

/**
 * Xuất file hợp đồng sang định dạng Word (.DOCX) chuẩn văn bản hành chính Việt Nam
 */
export async function exportContractToDocx(contract, person, template) {
  const contractCode = contract.contractCode || 'HĐHT-GENKI/01092026';
  const personName = person?.fullName?.toUpperCase() || contract.fullName?.toUpperCase() || 'ĐỐI TÁC';
  const partyARep = contract.partyARepresentative || 'LÊ TRÍ NAM';
  const partyAPos = contract.partyAPosition || 'Giám đốc Kinh Doanh';
  const partyBTitle = contract.partyBTitle || 'Đối tác Kinh doanh';
  const genderTitle = person?.genderTitle || (person?.fullName?.includes('Thị') ? 'BÀ' : 'ÔNG');

  const startDate = contract.startDate ? new Date(contract.startDate) : new Date();
  const day = String(startDate.getDate()).padStart(2, '0');
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const year = String(startDate.getFullYear());

  const pcb = Number(contract.salary || contract.pcbAmount || 8000000);
  const pkt = Number(contract.allowance || contract.pktAmount || 7000000);
  const kpi = Number(contract.kpiTargetRevenue || contract.kpiTargetAmount || 100000000);
  const kpiWords = numberToVietnameseWords(kpi);

  const territory = contract.territoryDescription || person?.region || 'Khu vực được phân công';
  const duration = contract.contractDuration || '03 tháng (hoặc cho đến khi kết thúc dự án)';

  // Style constants for Times New Roman font (13pt = 26 half-points, 14pt = 28 half-points)
  const FONT_FAMILY = 'Times New Roman';
  const SIZE_BODY = 26; // 13pt
  const SIZE_TITLE = 30; // 15pt
  const SIZE_HEADER = 24; // 12pt

  const bordersNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' }
  };

  const bordersTable = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2cm
              bottom: 1134, // ~2cm
              left: 1701, // ~3cm (lề chuẩn đóng gáy)
              right: 1134 // ~2cm
            }
          }
        },
        children: [
          // 1. Quốc hiệu & Tiêu ngữ
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'Độc Lập – Tự do – Hạnh Phúc',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: '———o0o———',
                font: FONT_FAMILY,
                size: SIZE_HEADER
              })
            ]
          }),

          // 2. Tiêu đề Hợp đồng
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'HỢP ĐỒNG HỢP TÁC KINH DOANH',
                font: FONT_FAMILY,
                size: SIZE_TITLE,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Số: ${contractCode}`,
                font: FONT_FAMILY,
                size: SIZE_HEADER,
                italics: true
              })
            ]
          }),

          // 3. Căn cứ pháp lý
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '- Căn cứ quy định tại Bộ Luật Dân Sự.',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: '- Căn cứ vào nhu cầu và khả năng của mỗi bên.',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                italics: true
              })
            ]
          }),

          // 4. Ngày tháng & Chủ thể
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `Hôm nay, ngày ${day} tháng ${month} năm ${year} tại: Văn phòng Công ty Cổ phần Genki Fami Việt Nam, hai bên gồm:`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // BÊN A
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'BÊN A (BÊN KHÁCH HÀNG / DOANH NGHIỆP):',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Địa chỉ: Số 107 ngõ 192 Lê Trọng Tấn, Tổ 1, P. Phương Liệt, TP. Hà Nội, Việt Nam.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Điện thoại: (+84) 438.53.9696',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `Đại diện: Ông ${partyARep}              Chức vụ: ${partyAPos}`,
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),

          // BÊN B
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'BÊN B (BÊN CHUYÊN GIA / ĐỐI TÁC):',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${genderTitle}: ${personName}`,
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ngày sinh: ${person?.dateOfBirth ? formatDate(person.dateOfBirth) : '—'}`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Địa chỉ thường trú: ${person?.address || '—'}`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Chỗ ở hiện nay: ${person?.currentAddress || person?.address || '—'}`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Số CCCD: ${person?.identityNumber || '—'}; Cấp ngày: ${person?.identityDate ? formatDate(person.identityDate) : '01/01/2023'} tại: ${person?.identityPlace || 'Cục Cảnh sát QLHC về TTXH'}`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Điện thoại: ${person?.phone || '—'}    |    Email: ${person?.email || '—'}`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `Số tài khoản: ${person?.bankAccount || '—'} tại ngân hàng: ${person?.bankName || '—'} (${person?.bankAccountName || personName})`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // Lời mở đầu (Xét rằng)
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'Xét rằng:',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: '- Bên A là một doanh nghiệp chuyên kinh doanh thực phẩm bảo vệ sức khỏe, đang triển khai kế hoạch phát triển khách hàng (sau đây gọi là “Dự án”), đang có nhu cầu thuê một chuyên gia có năng lực và chuyên môn phù hợp với nhu cầu để thực hiện Dự án.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: '- Bên B là người cam kết có đủ năng lực chuyên môn phù hợp và mong muốn được thực hiện các công việc phù hợp với chuyên môn của mình.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: 'Theo đó, sau khi trao đổi, thỏa thuận, hai bên thống nhất ký hợp đồng này với các điều khoản như sau:',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                italics: true
              })
            ]
          }),

          // ĐIỀU 1
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'ĐIỀU 1: NỘI DUNG HỢP ĐỒNG',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '1.1. Bên A yêu cầu và Bên B đồng ý hợp tác để thực hiện các công việc được nêu trong phụ lục đính kèm hợp đồng này với tư cách là một “đối tác” trong Dự án của Bên A.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: `1.2. Theo đó, Bên B sẽ làm việc dưới sự chỉ đạo trực tiếp của Ban Giám đốc Bên A và có chức danh là “${partyBTitle}”. Địa bàn phụ trách và quản lý: ${territory}.`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `1.3. Thời gian hợp đồng: ${duration} (kể từ ngày ${formatDate(contract.startDate)} đến hết ngày ${formatDate(contract.endDate)}). Khi kết thúc hợp đồng, tùy theo tình hình thực tế và nhu cầu của các bên, hợp đồng này có thể được xem xét gia hạn hoặc chuyển đổi hình thức thành hợp đồng lao động.`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // ĐIỀU 2
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'ĐIỀU 2: THÙ LAO VÀ CÁC HỖ TRỢ KHÁC',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '2.1. Thù lao: Thù lao mà Bên A sẽ thanh toán cho Bên B để thực hiện các công việc được nêu trong phụ lục đính kèm hợp đồng này trong đó đã bao gồm thuế thu nhập cá nhân mà Bên B phải trả theo quy định của pháp luật. Các khoản thuế này sẽ được Bên A khấu trừ trên thù lao thanh toán hàng tháng và Bên A sẽ thay mặt Bên B nộp khoản thuế này cho cơ quan thuế theo quy định hiện hành của pháp luật. Bên B tự chịu trách nhiệm kê khai và nộp thuế Thu nhập cá nhân (thuế từ tiền công, tiền lương hoặc kinh doanh) theo quy định của pháp luật.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '2.2. Phúc lợi: Theo quy định chung của công ty.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: '2.3. Chiết khấu/hoa hồng: Thu nhập từ hoa hồng và các khoản thưởng hiệu quả được nêu chi tiết trong phụ lục đính kèm hợp đồng này, bao gồm các đối tượng sau nhưng không giới hạn phạm vi (địa lý/vật lý và trực tuyến): đại lý, nhà phân phối, nhà bán lẻ.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // ĐIỀU 3
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '3.1. Quyền và nghĩa vụ của Bên A:',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '- Tạo điều kiện cần thiết, hỗ trợ phương tiện, nơi làm việc để Bên B hoàn thành công việc của mình.\n- Thanh toán đầy đủ thù lao cho Bên B theo đúng thỏa thuận.\n- Có quyền đơn phương chấm dứt hợp đồng nếu hiệu quả công việc do Bên B thực hiện không tốt hoặc xét thấy rõ ràng Bên B không có đủ năng lực, khả năng như đã cam kết.\n- Các quyền và nghĩa vụ khác của bên thuê dịch vụ theo quy định tại Bộ luật Dân sự.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60 },
            children: [
              new TextRun({
                text: '3.2. Quyền và nghĩa vụ của Bên B:',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: '- Hoàn thành công việc do mình đảm nhận với chất lượng cao nhất. Chịu trách nhiệm về công việc do mình thực hiện.\n- Bảo quản phương tiện làm việc, đảm bảo các tiêu chuẩn vận hành theo thỏa thuận.\n- Tự chịu trách nhiệm về các khoản thuế, bảo hiểm theo quy định của pháp luật Việt Nam.\n- Cam kết việc ký kết hợp đồng này không tạo ra bất kỳ sự mâu thuẫn về quyền lợi đối với Bên thứ ba nào khác và hoàn toàn chịu trách nhiệm về việc này.\n- Các quyền và nghĩa vụ khác của bên cung cấp dịch vụ theo quy định tại Bộ luật Dân sự.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // ĐIỀU 4
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'ĐIỀU 4: CÁC THỎA THUẬN KHÁC',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '4.1. Hai bên hiểu và thừa nhận rằng hợp đồng này không phải là một hợp đồng lao động. Quan hệ giữa hai bên không làm phát sinh các quan hệ về pháp luật lao động. Bên B sẽ tự mua/đóng các loại bảo hiểm căn cứ vào nhu cầu của bản thân và Bên A sẽ không chi trả các chi phí bảo hiểm này của Bên B.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '4.2. Tất cả thông tin, tài liệu hoặc bất cứ kết quả, sản phẩm giao nộp nào do Bên B tạo nên và/hoặc biết được khi thực hiện các trách nhiệm của mình trong hợp đồng sẽ thuộc sở hữu duy nhất của Bên A. Bên B cam kết không lưu giữ và sử dụng những tài liệu và thông tin nêu trên trong bất cứ trường hợp nào ngoài phạm vi và thời hạn của Hợp đồng.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '4.3. Hai bên cam kết bảo mật mọi thông tin liên quan đến hợp đồng này, trừ trường hợp được cơ quan có thẩm quyền của Nhà nước yêu cầu.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: '4.4. Trong những trường hợp có lý do chính đáng, hai bên có thể thỏa thuận tạm ngừng hoặc chấm dứt hợp đồng trước thời hạn. Khi đó, bên muốn chấm dứt/tạm ngừng phải thông báo cho bên kia bằng văn bản chậm nhất là 01 tháng trước ngày dự kiến chấm dứt hay tạm ngưng.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // ĐIỀU 5
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'ĐIỀU 5: ĐIỀU KHOẢN CHUNG',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '5.1. Hai bên cam kết hoàn toàn tự nguyện khi ký kết và thực hiện nghiêm túc hợp đồng này. Mọi sự thay đổi, bổ sung chỉ có giá trị khi được sự đồng ý bằng văn bản của cả hai bên.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '5.2. Trong quá trình thực hiện, nếu có gì vướng mắc, hai bên sẽ gặp gỡ để trao đổi cùng giải quyết trên tinh thần thương lượng, hợp tác. Nếu không tự giải quyết được sẽ đưa ra Tòa án có thẩm quyền tại Việt Nam giải quyết. Quyết định của Tòa án là quyết định cuối cùng, có giá trị ràng buộc các bên.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: '5.3. Hai bên thừa nhận rằng luật áp dụng của hợp đồng này là luật Việt Nam. Hợp đồng này có hiệu lực kể từ ngày ký, được lập thành hai (02) bản bằng tiếng Việt có giá trị pháp lý như nhau, mỗi bên giữ một (01) bản.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // BẢNG CHỮ KÝ HỢP ĐỒNG
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐẠI DIỆN BÊN A', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1200 },
                        children: [new TextRun({ text: '(Ký, ghi rõ họ tên và đóng dấu)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: partyARep, font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐẠI DIỆN BÊN B', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1200 },
                        children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: personName, font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // ==================== PHỤ LỤC 01 ====================
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'PHỤ LỤC 01',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CƠ CHẾ CHI TRẢ THÙ LAO & CHÍNH SÁCH THƯỞNG',
                font: FONT_FAMILY,
                size: SIZE_TITLE,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Kèm theo Hợp đồng số: ${contractCode}`,
                font: FONT_FAMILY,
                size: SIZE_HEADER,
                italics: true
              })
            ]
          }),

          // A. Thu nhập
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'A. THU NHẬP HÀNG THÁNG',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Tổng thu nhập hàng tháng của Bên B bao gồm các phần sau:',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            indent: { firstLine: 360 },
            children: [
              new TextRun({
                text: `1. Phí dịch vụ cơ bản (PCB): ${formatVND(pcb)}/tháng.`,
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            children: [
              new TextRun({
                text: '- Điều kiện nhận: Đảm bảo các tiêu chuẩn vận hành theo thỏa thuận, phối hợp triển khai công việc đúng tiến độ và hoàn thành các báo cáo định kỳ theo cam kết tại Hợp đồng (Yêu cầu đạt từ 50% chỉ tiêu doanh thu tối thiểu).',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            indent: { firstLine: 360 },
            children: [
              new TextRun({
                text: `2. Phí hỗ trợ khai thác thị trường (PKT): ${formatVND(pkt)}/tháng.`,
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: '- Cơ chế điều chỉnh khi chưa đạt chỉ tiêu: Trường hợp đạt dưới 50% chỉ tiêu Doanh thu tối thiểu: Thu nhập nhận được = PCB.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // B. Chỉ tiêu
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'B. CHỈ TIÊU KHAI THÁC DOANH SỐ (KPI)',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `- Chỉ tiêu doanh thu tối thiểu: ${formatVND(kpi)}/tháng (Bằng chữ: ${kpiWords}).`,
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `- Thời gian áp dụng thử thách: 03 tháng đầu kể từ ngày hợp đồng có hiệu lực.`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `- Địa bàn triển khai dự án: ${territory}.`,
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // C. Chính sách thưởng
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: 'C. CHÍNH SÁCH THƯỞNG DOANH SỐ & HIỆU QUẢ',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: '1. Thưởng Doanh Thu Hàng Tháng:',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              })
            ]
          }),

          // Bảng thưởng tháng
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F3F4F6' },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] })]
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F3F4F6' },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức Thưởng', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] })]
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F3F4F6' },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Doanh Thu Đạt', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] })]
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F3F4F6' },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phụ Cấp', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] })]
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F3F4F6' },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Thưởng % DS', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 1', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '120 triệu ~ 200 triệu', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '1.000.000 đ', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1,0% Tổng DS', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '2', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 2', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '201 triệu ~ 300 triệu', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '2.000.000 đ', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1,5% Tổng DS', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '3', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 3', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '301 triệu ~ 500 triệu', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '3.000.000 đ', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '2,0% Tổng DS', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '4', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 4', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Trên 500 triệu', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '5.000.000 đ', font: FONT_FAMILY, size: SIZE_BODY })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '4,0% Tổng DS', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })] })
                ]
              })
            ]
          }),

          // Thưởng Quý & Thưởng Năm
          new Paragraph({
            spacing: { before: 120 },
            children: [
              new TextRun({
                text: '2. Thưởng Quý: ',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              }),
              new TextRun({
                text: '0,5% Tổng doanh số 03 tháng khi đạt từ 500.000.000 VNĐ (Năm trăm triệu đồng) trở lên.',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '3. Thưởng Năm: ',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                bold: true
              }),
              new TextRun({
                text: '0,2% Tổng doanh thu tính từ thời điểm công tác đến hết năm (áp dụng khi công tác trên 06 tháng).',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: '4. Các khoản thưởng khác: Theo chính sách khen thưởng đột xuất của Ban Giám Đốc cho các chiến dịch kinh doanh.',
                font: FONT_FAMILY,
                size: SIZE_BODY,
                italics: true
              })
            ]
          }),

          // Ký tên Phụ lục
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐẠI DIỆN BÊN A', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 900 },
                        children: [new TextRun({ text: '(Ký, đóng dấu)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: partyARep, font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐẠI DIỆN BÊN B', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 900 },
                        children: [new TextRun({ text: '(Ký, họ tên)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: personName, font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  // Xuất file sang Blob và trigger tải xuống
  const blob = await Packer.toBlob(doc);
  const cleanCode = contractCode.replace(/[^a-zA-Z0-9.-]/g, '_');
  const cleanName = personName.replace(/[^a-zA-Z0-9À-ỹ\s]/g, '').trim().replace(/\s+/g, '_');
  const fileName = `${cleanCode}_${cleanName}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, fileName };
}
