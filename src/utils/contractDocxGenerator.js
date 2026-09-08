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
  const isHdld = contract?.contractType === 'HDLD' || template?.id === 'TPL-HDLD' || contract?.templateId === 'TPL-HDLD';
  if (isHdld) {
    return generateHdldDocx(contract, person, template);
  }

  const isHdnt = contract?.contractType === 'HDNT' || template?.id === 'TPL-HDNT' || contract?.templateId === 'TPL-HDNT';
  if (isHdnt) {
    return generateHdntDocx(contract, person, template);
  }

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

/**
 * Xuất file Hợp Đồng Lao Động (.DOCX) chuẩn 2 trang:
 * Trang 1: HĐ Lao Động 5 Điều khoản pháp lý chuẩn Bộ luật Lao Động
 * Trang 2: Bảng mô tả công việc (Job Description - JD) chi tiết kèm cam đoan nhận việc
 */
export async function generateHdldDocx(contract, person, template) {
  const contractCode = contract.contractCode || '100325/HĐLĐ-GENKI';
  const personName = person?.fullName?.toUpperCase() || contract.fullName?.toUpperCase() || 'NGƯỜI LAO ĐỘNG';
  const genderTitle = person?.genderTitle || (person?.fullName?.includes('Thị') ? 'BÀ' : 'ÔNG');

  const startDate = contract.startDate ? new Date(contract.startDate) : new Date();
  const day = String(startDate.getDate()).padStart(2, '0');
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const year = String(startDate.getFullYear());
  const startDateStr = `${day}/${month}/${year}`;

  const endDate = contract.endDate ? new Date(contract.endDate) : new Date(startDate.getTime() + 2 * 365 * 86400000);
  const endDay = String(endDate.getDate()).padStart(2, '0');
  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
  const endYear = String(endDate.getFullYear());
  const endDateStr = `${endDay}/${endMonth}/${endYear}`;

  const dateOfBirth = person?.dateOfBirth ? formatDate(person.dateOfBirth) : '—';
  const position = contract.jobTitle || person?.position || 'Cán bộ - Công nhân viên';
  const address = person?.address || '—';
  const identityNumber = person?.identityNumber || '—';
  const identityDate = person?.identityDate || '—';
  const identityPlace = person?.identityPlace || 'Cục Cảnh sát QLHC về TTXH';
  const phone = person?.phone || '—';
  const email = person?.email || '—';

  const contractDuration = contract.contractDuration || '02 năm';
  const probationPeriod = contract.probationPeriod || `Từ ngày ${startDateStr} đến ... (Hưởng 85% lương)`;
  const workLocation = contract.workLocation || 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh';
  const workHours = contract.workHours || '48 giờ/tuần';
  const weeklyRest = contract.weeklyRest || '1,5 ngày (Thứ 7, Chủ Nhật)';

  const baseSalary = Number(contract.salary || 7491370);
  const performanceBonus = Number(contract.performanceBonus || contract.allowance || 1278630);
  const mealAllowance = Number(contract.mealAllowance || 730000);

  const jobTitle = contract.jobTitle || 'Nhân viên Kho kiêm hỗ trợ kinh doanh';
  const department = contract.department || 'Kho vận & Vận hành';
  const reportTo = contract.reportTo || 'Phụ trách Kho vận & Ban Giám Đốc';

  // Typography & sizes
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
              top: 1134, // ~20mm
              bottom: 1134, // ~20mm
              left: 1701, // ~30mm lề đóng gáy
              right: 1134 // ~20mm
            }
          }
        },
        children: [
          // TRANG 1: HỢP ĐỒNG LAO ĐỘNG
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
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '----------o0o----------',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          // Tiêu đề & Mã HĐ
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: 'HỢP ĐỒNG LAO ĐỘNG',
                font: FONT_FAMILY,
                size: SIZE_TITLE,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Số: ${contractCode}`,
                font: FONT_FAMILY,
                size: SIZE_HEADER,
                italics: true
              })
            ]
          }),

          // Bên A
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: 'Chúng tôi, một bên là Ông: ', font: FONT_FAMILY, size: SIZE_BODY }),
              new TextRun({ text: 'TRẦN HẢI BẰNG', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Chức vụ: ', font: FONT_FAMILY, size: SIZE_BODY }),
              new TextRun({ text: 'Tổng Giám đốc', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Đại diện cho: ', font: FONT_FAMILY, size: SIZE_BODY }),
              new TextRun({ text: 'Công ty CP Genki Fami Việt Nam', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'Địa chỉ: Số 107 ngõ 192 Lê Trọng Tấn, tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Và', font: FONT_FAMILY, size: SIZE_BODY, bold: true, italics: true })
            ]
          }),

          // Bên B
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `Một bên là ${genderTitle}: `, font: FONT_FAMILY, size: SIZE_BODY }),
              new TextRun({ text: personName, font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `Sinh ngày: ${dateOfBirth}`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `Nghề nghiệp: ${position}`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `Địa chỉ thường trú: ${address}`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: `CCCD: ${identityNumber} do ${identityPlace} cấp ngày ${identityDate}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'Thoả thuận ký kết Hợp đồng lao động và cam kết làm đúng những điều khoản sau đây:', font: FONT_FAMILY, size: SIZE_BODY, italics: true })
            ]
          }),

          // Điều 1
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'Điều 1: ', font: FONT_FAMILY, size: SIZE_BODY, bold: true }),
              new TextRun({ text: `${genderTitle} ${personName} làm việc theo loại Hợp đồng lao động thời hạn ${contractDuration}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Bắt đầu từ ngày: ${startDateStr} đến hết ngày ${endDateStr}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Thời gian thử việc: ${probationPeriod}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Tại địa điểm: ${workLocation}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Chức danh chuyên môn: ${jobTitle}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Công việc phải làm: Theo bảng mô tả công việc (đính kèm tại Trang 2).', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          // Điều 2
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'Điều 2: Chế độ làm việc:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Thời giờ làm việc: ${workHours}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Được cấp phát những dụng cụ: Cần thiết theo yêu cầu công việc.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Điều kiện an toàn và vệ sinh lao động tại nơi làm việc theo quy định hiện hành của Nhà nước.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          // Điều 3
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'Điều 3: Nghĩa vụ và các quyền lợi của người lao động:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 180 },
            children: [
              new TextRun({ text: '1. Quyền lợi:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Phương tiện đi lại làm việc: Cá nhân tự túc;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Lương chức danh: ${formatVND(baseSalary)} (Bằng chữ: ${numberToVietnameseWords(baseSalary)})`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Thưởng hiệu suất: ${formatVND(performanceBonus)} (Theo chính sách công ty)`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Phụ cấp ăn ca: ${formatVND(mealAllowance)} (Mức chuẩn theo Thông tư 26/2016/TT-BLĐTBXH miễn thuế TNCN)`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'Các phụ cấp, chi phí và thưởng đã bao gồm Thuế thu nhập cá nhân do người lao động chi trả.', font: FONT_FAMILY, size: SIZE_BODY, italics: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Hình thức trả lương: Trả 01 lần vào ngày 05 hàng tháng hoặc theo quy định công ty từng thời kỳ.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Các phụ cấp, chi phí và thưởng gộp khác: Theo chính sách của Công ty.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Tiền thưởng & Chế độ nâng lương: Theo quy định và chính sách của Công ty.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp: Theo quy định của pháp luật hiện hành.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Nghỉ hàng tuần: ${weeklyRest}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Chế độ đào tạo: Theo quy định của Công ty và yêu cầu công việc. Trong trường hợp NV được cử đi đào tạo thì NV phải hoàn thành khoá học đúng thời hạn, cam kết phục vụ lâu dài và được hưởng nguyên lương. Nếu không tiếp tục hợp tác với Công ty sau đào tạo, nhân viên phải hoàn trả lại 100% phí đào tạo và các khoản chế độ đã nhận.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Những thoả thuận khác:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 540 },
            children: [
              new TextRun({ text: '+ Trong vòng 15 ngày (làm việc) kể từ ngày ký kết hợp đồng này, vì bất cứ lý do gì mà người lao động không tiếp tục cộng tác với công ty (kể cả trong trường hợp công ty thông báo chấm dứt hợp đồng lao động trước thời hạn) thì người lao động cam kết sẽ không yêu cầu công ty phải thanh toán bất cứ chế độ và quyền lợi nào của người lao động trong thời gian nêu trên.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 540 },
            children: [
              new TextRun({ text: '+ Trong trường hợp 1 trong 2 bên muốn chấm dứt hợp đồng trước thời hạn thì phải báo trước cho bên còn lại trước 45 ngày kể từ khi có thông báo.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 180 },
            children: [
              new TextRun({ text: '2. Nghĩa vụ:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Hoàn thành những nội dung đã cam kết và những công việc trong Hợp đồng;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Chấp hành nội quy lao động, an toàn lao động, kỷ luật lao động;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Tuyệt đối không sử dụng khách hàng của công ty để trục lợi cá nhân;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Trong quá trình làm việc cho Công ty, người lao động không được phép kinh doanh hoặc làm bất cứ công việc gì mâu thuẫn với quyền lợi và lợi ích của Công ty;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Người lao động phải chấp hành sự phân công, điều động thực hiện những công việc không trái với pháp luật từ người sử dụng lao động;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Trong thời gian hiệu lực hợp đồng và trong vòng 24 tháng kể từ khi nghỉ việc tại Công ty, nhân viên không được phép: Cung cấp thông tin, tiết lộ bí mật kinh doanh của công ty ra ngoài; không được phép hợp tác, sản xuất, kinh doanh, làm đại lý sử dụng, tiết lộ thông tin về khách hàng, mặt hàng, sản phẩm tương tự của Công ty cho bất kỳ tổ chức cá nhân nào nhằm phục vụ công việc riêng cho mình mà chưa được sự đồng ý bằng văn bản từ phía công ty. Trường hợp bị phát hiện – Cá nhân đó sẽ bị khởi tố trước pháp luật.', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),

          // Điều 4
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'Điều 4: Nghĩa vụ và quyền hạn của người sử dụng lao động:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 180 },
            children: [
              new TextRun({ text: '1. Nghĩa vụ: Bảo đảm việc làm và thực hiện đầy đủ những điều khoản trong hợp đồng; thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người lao động; bảo quản và hoàn trả lại văn bằng, chứng chỉ gốc (nếu có) sau khi nhân viên hoàn thành các nghĩa vụ cam kết.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 180 },
            children: [
              new TextRun({ text: '2. Quyền hạn: Điều hành người lao động hoàn thành công việc theo Hợp đồng (bố trí, điều chuyển, tạm ngừng việc); tạm hoãn, chấm dứt hợp đồng lao động, kỷ luật người lao động theo quy định của pháp luật và nội quy lao động của Công ty.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          // Điều 5
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'Điều 5: Điều khoản thi hành:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Những vấn đề về lao động không ghi trong hợp đồng lao động này thì áp dụng theo quy định của nội quy lao động và pháp luật lao động;', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `- Hợp đồng lao động này được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản và có hiệu lực kể từ ngày ${startDateStr}.`, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'Hợp đồng làm tại: Số 107 ngõ 192 Lê Trọng Tấn, tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          // Chữ ký Trang 1
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
                        children: [new TextRun({ text: 'ĐẠI DIỆN NGƯỜI LAO ĐỘNG', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 800 },
                        children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: personName, font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ĐẠI DIỆN NGƯỜI SỬ DỤNG LAO ĐỘNG', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 800 },
                        children: [new TextRun({ text: '(Ký, đóng dấu và ghi rõ họ tên)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'TRẦN HẢI BẰNG', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // NGẮT TRANG SANG TRANG 2 (BẢNG MÔ TẢ CÔNG VIỆC)
          new Paragraph({
            children: [new PageBreak()]
          }),

          // TRANG 2: BẢNG MÔ TẢ CÔNG VIỆC (JD)
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
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '----------o0o----------',
                font: FONT_FAMILY,
                size: SIZE_BODY
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: 'BẢNG MÔ TẢ CÔNG VIỆC',
                font: FONT_FAMILY,
                size: SIZE_TITLE,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `(Đính kèm Hợp đồng lao động số: ${contractCode})`,
                font: FONT_FAMILY,
                size: SIZE_HEADER,
                italics: true
              })
            ]
          }),

          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Chức vụ: ', font: FONT_FAMILY, size: SIZE_BODY, bold: true }),
              new TextRun({ text: jobTitle, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Bộ phận: ', font: FONT_FAMILY, size: SIZE_BODY, bold: true }),
              new TextRun({ text: department, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: 'Báo cáo cho: ', font: FONT_FAMILY, size: SIZE_BODY, bold: true }),
              new TextRun({ text: reportTo, font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: 'Trách nhiệm chính & Nhiệm vụ cụ thể:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),

          // Bảng phân công nhiệm vụ
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'E2E8F0' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Nhiệm vụ', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    shading: { fill: 'E2E8F0' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Công việc cụ thể', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Điều phối hàng hoá và kho vận', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Tuân thủ các quy định pháp luật, quy trình nội bộ về quản lý hàng hóa. Đảm bảo quy tắc PCCC, vệ sinh kho, bảo quản hàng hóa theo tiêu chuẩn.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Lập sơ đồ kho, phân chia khu vực lưu trữ hàng hóa và sắp xếp khoa học, dễ tìm kiếm, kiểm kê.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Tiếp nhận đơn đặt hàng từ phần mềm, soạn hàng, đóng gói, dán nhãn, chuẩn bị chứng từ liên quan.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Thực hiện công việc giao nhận, luân chuyển, kiểm kê hàng hóa định kỳ và đối chiếu số liệu với Kế toán.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Giám sát, tối ưu thời gian, chi phí cho hoạt động kho vận; đánh giá chất lượng dịch vụ đối tác vận chuyển.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Hỗ trợ Kinh doanh', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Sử dụng thành thạo phần mềm AMIS-CRM: cập nhật thông tin khách hàng, chính sách giá, báo giá.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Hướng dẫn và hỗ trợ nhà phân phối, đại lý, CTV đặt đơn hàng qua cổng thông tin AMIS CRM.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Tiếp nhận, xử lý đơn hàng, theo dõi tiến độ giao hàng và phối hợp đối soát công nợ với Kế toán.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Phối hợp với Bộ phận Kinh doanh và Marketing trong xử lý Hợp đồng mua bán, thông báo chính sách giá, khiếu nại khách hàng.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Các công việc khác', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Tham gia các khóa đào tạo, bồi dưỡng nâng cao trình độ do Công ty tổ chức.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Thực hiện báo cáo định kỳ/phát sinh và tham gia đầy đủ các cuộc họp nội bộ bộ phận.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [new TextRun({ text: '• Thực hiện các nhiệm vụ chuyên môn khác theo yêu cầu điều hành từ Ban Giám Đốc.', font: FONT_FAMILY, size: SIZE_HEADER })]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Yêu cầu công việc
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'Yêu cầu năng lực:', font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '• Thành thạo các phần mềm tin học văn phòng (Google Sheets, Docs, CRM); có khả năng học hỏi và ứng dụng công nghệ tốt.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '• Trung thực, tỉ mỉ, ngăn nắp, có tinh thần trách nhiệm cao, chủ động trong công việc và có tinh thần đồng đội.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '• Sức khỏe tốt, có khả năng chịu được áp lực tiến độ công việc.', font: FONT_FAMILY, size: SIZE_BODY })
            ]
          }),

          // Cam đoan nhận việc
          new Paragraph({
            spacing: { before: 80, after: 120 },
            children: [
              new TextRun({ text: 'Tôi đã đọc và được trao đổi với quản lý trực tiếp và tôi hoàn toàn hiểu mô tả về vị trí công việc của tôi.', font: FONT_FAMILY, size: SIZE_BODY, italics: true, bold: true })
            ]
          }),

          // Bảng chữ ký nhận việc
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
                        spacing: { after: 60 },
                        children: [
                          new TextRun({ text: 'Tên nhân viên: ', font: FONT_FAMILY, size: SIZE_BODY, bold: true }),
                          new TextRun({ text: personName, font: FONT_FAMILY, size: SIZE_BODY })
                        ]
                      }),
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({ text: 'Ngày nhận việc: ', font: FONT_FAMILY, size: SIZE_BODY, bold: true }),
                          new TextRun({ text: startDateStr, font: FONT_FAMILY, size: SIZE_BODY })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Chữ ký nhân viên', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 700 },
                        children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })]
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
  const cleanCode = contractCode.replace(/Đ/g, 'D').replace(/đ/g, 'd').replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9.-]/g, '_');
  const cleanName = personName.replace(/[^a-zA-Z0-9À-ỹ\s]/g, '').trim().replace(/\s+/g, '_');
  const fileName = `${cleanCode}_${cleanName}.docx`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.createElement) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { success: true, fileName };
}

/**
 * Xuất Hợp Đồng Nguyên Tắc Mua Bán Hàng Hóa (HĐNT) sang tệp Word (.DOCX) chuẩn văn bản hành chính Việt Nam
 * Phân trang gồm 2 phần:
 * Section 1: Toàn văn 16 điều khoản Hợp đồng nguyên tắc mua bán hàng hóa (Quốc hiệu, Tiêu ngữ, Căn cứ pháp lý, Bên A & Bên B, Điều 0 - Điều 16, Khối chữ ký)
 * Section 2: Phụ lục 01: Chính sách chiết khấu thương mại (18%) & Bảng sản phẩm đơn hàng mẫu, chính sách công nợ gối đầu & Ký duyệt
 */
export async function generateHdntDocx(contract, person, template) {
  const contractCode = contract.contractCode || 'HĐMB-2026-01/GENKI-QUANGMINHDL';

  // Bên B có thể là Pháp nhân hoặc Cá nhân
  const isEnterprise = contract.partyBType === 'ENTERPRISE' || Boolean(contract.partyBCompany);
  const partyBName = (contract.partyBCompany || person?.company || person?.fullName || contract.fullName || 'ĐẠI LÝ PHÂN PHỐI').toUpperCase();
  const partyBAddress = contract.partyBAddress || person?.address || '—';
  const partyBPhone = contract.partyBPhone || person?.phone || '—';
  const partyBTax = contract.partyBTax || person?.taxNumber || person?.identityNumber || '—';
  const partyBRep = contract.partyBRepresentative || person?.fullName || '—';
  const partyBPos = contract.partyBPosition || (isEnterprise ? 'Giám Đốc' : 'Đại diện / CTV');
  const partyBBankAccount = contract.partyBBankAccount || person?.bankAccount || '—';
  const partyBBankName = contract.partyBBankName || person?.bankName || 'Vietcombank';

  // Bên A (Genki Fami)
  const partyACompany = contract.partyACompany || 'CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM';
  const partyAAddress = contract.partyAAddress || 'Số 107 ngõ 192 Lê Trọng Tấn, Tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội';
  const partyAPhone = contract.partyAPhone || '070-333-6633 / 024 6292 8668';
  const partyATax = '0109006313';
  const partyABankAccount = '0851000041236 tại Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank) - CN Hà Thành';
  const partyARep = contract.partyARepresentative || 'LÊ TRÍ NAM';
  const partyAPos = contract.partyAPosition || 'Giám Đốc Kinh Doanh';

  // Điều kiện thương mại
  const discountRate = contract.discountRate !== undefined ? contract.discountRate : 18;
  const firstOrderDebt = Number(contract.firstOrderDebt || 12021200);
  const firstOrderDebtWords = numberToVietnameseWords(firstOrderDebt);

  const startDate = contract.startDate ? new Date(contract.startDate) : new Date();
  const day = String(startDate.getDate()).padStart(2, '0');
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const year = String(startDate.getFullYear());

  // Bảng sản phẩm mẫu Phụ lục 01
  const products = contract.orderProducts && contract.orderProducts.length > 0 ? contract.orderProducts : [
    { id: 1, name: 'Sữa dinh dưỡng SUKOYAMA M1 (0 - 12 Tháng)', spec: 'Lon 800g', quantity: 8, unit: 'LON', price: 595000, amount: 4760000, discountAmount: 856800 },
    { id: 2, name: 'Sữa dinh dưỡng TSUYOIKO (9 – 36 Tháng)', spec: 'Lon 800g', quantity: 8, unit: 'LON', price: 495000, amount: 3960000, discountAmount: 712800 },
    { id: 3, name: 'Sữa dinh dưỡng ONAKA NI YASASHII', spec: 'Lon 800g', quantity: 12, unit: 'LON', price: 495000, amount: 5940000, discountAmount: 1069200 }
  ];

  const totalListPrice = products.reduce((acc, p) => acc + (p.amount || (p.quantity * p.price)), 0);
  const totalDiscount = Math.round(totalListPrice * (discountRate / 100));
  const finalPayAmount = firstOrderDebt || (totalListPrice - totalDiscount);

  // Typography & styles
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

  // Helper hàm tạo đoạn văn thụt lề
  const createP = (text, options = {}) => {
    return new Paragraph({
      alignment: options.alignment || AlignmentType.JUSTIFIED,
      spacing: options.spacing || { before: 50, after: 50 },
      indent: options.indent !== undefined ? options.indent : { firstLine: 720 },
      children: [
        new TextRun({
          text,
          font: FONT_FAMILY,
          size: options.size || SIZE_BODY,
          bold: Boolean(options.bold),
          italics: Boolean(options.italics)
        })
      ]
    });
  };

  const createH = (title) => {
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: title,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          bold: true
        })
      ]
    });
  };

  // Xây dựng các hàng cho bảng sản phẩm Phụ lục 01
  const productRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ width: { size: 600, type: WidthType.DXA }, children: [createP('STT', { alignment: AlignmentType.CENTER, bold: true, indent: 0 })] }),
        new TableCell({ width: { size: 3600, type: WidthType.DXA }, children: [createP('TÊN SẢN PHẨM', { alignment: AlignmentType.CENTER, bold: true, indent: 0 })] }),
        new TableCell({ width: { size: 1100, type: WidthType.DXA }, children: [createP('QUY CÁCH', { alignment: AlignmentType.CENTER, bold: true, indent: 0 })] }),
        new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [createP('SL', { alignment: AlignmentType.CENTER, bold: true, indent: 0 })] }),
        new TableCell({ width: { size: 1400, type: WidthType.DXA }, children: [createP('ĐƠN GIÁ', { alignment: AlignmentType.RIGHT, bold: true, indent: 0 })] }),
        new TableCell({ width: { size: 1600, type: WidthType.DXA }, children: [createP('THÀNH TIỀN', { alignment: AlignmentType.RIGHT, bold: true, indent: 0 })] }),
        new TableCell({ width: { size: 1500, type: WidthType.DXA }, children: [createP(`CK ${discountRate}%`, { alignment: AlignmentType.RIGHT, bold: true, indent: 0 })] })
      ]
    }),
    ...products.map((p, idx) => {
      const lineAmount = p.amount || (p.quantity * p.price);
      const lineDiscount = p.discountAmount || Math.round(lineAmount * (discountRate / 100));
      return new TableRow({
        children: [
          new TableCell({ children: [createP(String(idx + 1), { alignment: AlignmentType.CENTER, indent: 0 })] }),
          new TableCell({ children: [createP(p.name, { indent: 0, bold: true })] }),
          new TableCell({ children: [createP(p.spec || 'Lon 800g', { alignment: AlignmentType.CENTER, indent: 0 })] }),
          new TableCell({ children: [createP(`${p.quantity} ${p.unit || 'LON'}`, { alignment: AlignmentType.CENTER, indent: 0 })] }),
          new TableCell({ children: [createP(formatVND(p.price), { alignment: AlignmentType.RIGHT, indent: 0 })] }),
          new TableCell({ children: [createP(formatVND(lineAmount), { alignment: AlignmentType.RIGHT, indent: 0 })] }),
          new TableCell({ children: [createP(formatVND(lineDiscount), { alignment: AlignmentType.RIGHT, indent: 0 })] })
        ]
      });
    }),
    // Hàng tổng cộng niêm yết
    new TableRow({
      children: [
        new TableCell({ columnSpan: 5, children: [createP('TỔNG CỘNG TIỀN HÀNG (GIÁ NIÊM YẾT):', { bold: true, indent: 0, alignment: AlignmentType.RIGHT })] }),
        new TableCell({ children: [createP(formatVND(totalListPrice), { bold: true, indent: 0, alignment: AlignmentType.RIGHT })] }),
        new TableCell({ children: [createP(formatVND(totalDiscount), { bold: true, indent: 0, alignment: AlignmentType.RIGHT })] })
      ]
    }),
    // Hàng thành tiền phải thanh toán
    new TableRow({
      children: [
        new TableCell({ columnSpan: 5, children: [createP('TỔNG TIỀN PHẢI THANH TOÁN (GỐI ĐẦU ĐƠN ĐẦU TIÊN):', { bold: true, indent: 0, alignment: AlignmentType.RIGHT })] }),
        new TableCell({ columnSpan: 2, children: [createP(`${formatVND(finalPayAmount)} VNĐ`, { bold: true, indent: 0, alignment: AlignmentType.RIGHT })] })
      ]
    })
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 }
          }
        },
        children: [
          // QUỐC HIỆU - TIÊU NGỮ
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 30 },
            children: [
              new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', font: FONT_FAMILY, size: SIZE_HEADER, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({ text: '----------o0o----------', font: FONT_FAMILY, size: SIZE_HEADER })
            ]
          }),

          // TIÊU ĐỀ HỢP ĐỒNG
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({ text: 'HỢP ĐỒNG NGUYÊN TẮC MUA BÁN HÀNG HÓA', font: FONT_FAMILY, size: SIZE_TITLE, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({ text: '(V/v: Mua Bán Thực Phẩm Chức Năng & Sữa Dinh Dưỡng Nhật Bản Genki Fami)', font: FONT_FAMILY, size: SIZE_BODY, italics: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({ text: `Số: ${contractCode}`, font: FONT_FAMILY, size: SIZE_BODY, bold: true })
            ]
          }),

          // CĂN CỨ PHÁP LÝ
          createP('● Căn cứ Bộ Luật Dân Sự số 91/2015/QH13;', { indent: 360, italics: true }),
          createP('● Căn cứ Luật Thương mại số 36/2005/QH11;', { indent: 360, italics: true }),
          createP('● Căn cứ vào nhu cầu và khả năng thực tế của hai bên.', { indent: 360, italics: true }),
          createP(`Hôm nay, ngày ${day} tháng ${month} năm ${year}, tại văn phòng Công ty CP Genki Fami Việt Nam, chúng tôi gồm có:`, { indent: 0, spacing: { before: 100, after: 80 } }),

          // BÊN BÁN (BÊN A)
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [new TextRun({ text: 'BÊN BÁN (BÊN A): CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM', font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
          }),
          createP(`- Địa chỉ: ${partyAAddress}`, { indent: 360 }),
          createP(`- Điện thoại: ${partyAPhone}        Mã số thuế: ${partyATax}`, { indent: 360 }),
          createP(`- Tài khoản ngân hàng: ${partyABankAccount}`, { indent: 360 }),
          createP(`- Đại diện: Ông ${partyARep}        Chức vụ: ${partyAPos}`, { indent: 360, bold: true }),
          createP('(Sau đây gọi tắt là “Bên A”)', { indent: 360, italics: true }),

          // BÊN MUA (BÊN B)
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [new TextRun({ text: `BÊN MUA (BÊN B): ${partyBName}`, font: FONT_FAMILY, size: SIZE_BODY, bold: true })]
          }),
          createP(`- Địa chỉ: ${partyBAddress}`, { indent: 360 }),
          createP(`- Điện thoại: ${partyBPhone}        Mã số thuế / Số CCCD: ${partyBTax}`, { indent: 360 }),
          createP(`- Tài khoản ngân hàng: ${partyBBankAccount} tại ${partyBBankName}`, { indent: 360 }),
          createP(`- Đại diện: ${partyBRep}        Chức vụ: ${partyBPos}`, { indent: 360, bold: true }),
          createP('(Sau đây gọi tắt là “Bên B”)', { indent: 360, italics: true }),

          createP('Bên A và Bên B (sau đây gọi chung là “Hai Bên”) cùng thống nhất ký kết Hợp đồng nguyên tắc với các điều khoản như sau:', { indent: 0, spacing: { before: 100, after: 80 } }),

          // 16 ĐIỀU KHOẢN HỢP ĐỒNG
          createH('ĐIỀU 0: KHÁI NIỆM VÀ ĐỊNH NGHĨA'),
          createP('Trong Hợp đồng này: “Ngày làm việc” là các ngày không bao gồm thứ 7, chủ nhật và ngày nghỉ lễ theo quy định; “Giá bán lẻ” là giá bán trực tiếp cho người tiêu dùng cuối cùng theo bảng giá niêm yết của Bên A; “Giá bán tối thiểu” là mức giá thấp nhất Bên B được phép phân phối ra thị trường; “Sản phẩm tương tự / cạnh tranh” là sản phẩm có công dụng, thành phần giống hoặc tương tự sản phẩm của Bên A.'),

          createH('ĐIỀU 1: CHỦNG LOẠI, CHẤT LƯỢNG VÀ QUY CÁCH SẢN PHẨM'),
          createP('1.1. Chủng loại: Các dòng thực phẩm bảo vệ sức khỏe và sữa dinh dưỡng nhập khẩu chính ngạch từ Nhật Bản theo danh mục đính kèm trong Phụ lục hợp đồng.'),
          createP('1.2. Tiêu chuẩn & Nguồn gốc: Xuất xứ Nhật Bản, có đầy đủ công bố lưu hành của Cục An toàn thực phẩm - Bộ Y tế, tem nhãn phụ tiếng Việt và hóa đơn giá trị gia tăng hợp lệ.'),
          createP('1.3. Hạn sử dụng: Hàng hóa giao cho Bên B còn hạn sử dụng tối thiểu 18 tháng tính từ ngày sản xuất (đối với sản phẩm có date 3 năm) hoặc tối thiểu 12 tháng (đối với sản phẩm có date 2 năm).'),

          createH('ĐIỀU 2: GIÁ SẢN PHẨM, MỨC CHIẾT KHẤU VÀ BẢO HỘ GIÁ'),
          createP('2.1. Giá bán cụ thể của từng sản phẩm được quy định tại Phụ lục đính kèm hợp đồng này.'),
          createP(`2.2. Chiết khấu thương mại: Bên A áp dụng mức chiết khấu thương mại cơ bản ${discountRate}% trực tiếp trên hóa đơn tính theo giá bán lẻ niêm yết của Bên A.`),
          createP('2.3. Điều chỉnh giá: Trong trường hợp giá bán lẻ niêm yết có thay đổi, Bên A thông báo bằng văn bản cho Bên B trước ít nhất 30 ngày làm việc.'),
          createP('2.4. Cam kết giá bán lẻ: Bên B cam kết bán lẻ theo bảng giá niêm yết của Bên A. Tuyệt đối không được bán dưới mức giá tối thiểu. Trường hợp Bên B bán phá giá, Bên A có quyền đơn phương chấm dứt hợp đồng ngay lập tức và yêu cầu bồi thường thiệt hại.'),

          createH('ĐIỀU 3: PHƯƠNG THỨC, QUY TRÌNH ĐẶT HÀNG VÀ GIAO NHẬN'),
          createP('3.1. Đặt hàng qua AMIS CRM: Bên B thực hiện đặt hàng chính thức thông qua Cổng Đại lý/Hệ thống AMIS CRM do Bên A cung cấp. Dữ liệu ghi nhận trên AMIS CRM là căn cứ đối chiếu chính thức. Trường hợp lỗi hệ thống, đơn đặt hàng được gửi qua email chỉ định.'),
          createP('3.2. Trong thời hạn 02 ngày làm việc kể từ khi nhận đơn hàng, Bên A có trách nhiệm xác nhận hoặc điều chỉnh qua AMIS CRM hoặc email.'),
          createP('3.3. Giao hàng: Bên A giao hàng trong vòng 03 ngày làm việc đến kho của Bên B kể từ khi chấp nhận đơn hàng. Bên A chịu phí vận chuyển đến 01 địa điểm giao hàng đầu tiên do Bên B chỉ định.'),
          createP('3.4. Kiểm tra hàng hóa: Bên B kiểm tra số lượng, quy cách và tình trạng bao bì khi nhận hàng. Phản hồi sai lệch trong vòng 24 giờ kể từ khi nhận hàng.'),

          createH('ĐIỀU 4: PHƯƠNG THỨC THANH TOÁN VÀ CÔNG NỢ ĐƠN HÀNG ĐẦU TIÊN'),
          createP('4.1. Đồng tiền thanh toán: Việt Nam đồng (VNĐ).'),
          createP(`4.2. Chính sách công nợ đơn hàng đầu tiên: Bên A cấp hạn mức gối đầu cho Bên B nợ số tiền hàng của đơn hàng đầu tiên là: ${formatVND(finalPayAmount)} VNĐ (Bằng chữ: ${numberToVietnameseWords(finalPayAmount)}). Bên B có trách nhiệm thanh toán số tiền này cho Bên A ngay khi kết thúc hoặc thanh lý hợp đồng.`),
          createP('4.3. Các đơn hàng tiếp theo: Bên B thực hiện thanh toán ngay khi nhận hàng (Hình thức giao hàng nhận tiền ngay - COD) hoặc chuyển khoản trước khi xuất kho.'),
          createP('4.4. Phạt chậm trả: Trường hợp quá hạn thanh toán, Bên B chịu lãi chậm trả 0.1%/ngày trên số tiền chậm trả.'),

          createH('ĐIỀU 5: ĐỔI TRẢ HÀNG'),
          createP('Bên A chấp nhận đổi hàng trong vòng 07 ngày làm việc kể từ khi nhận thông báo đối với các sản phẩm bao bì móp méo, vỡ hỏng do vận chuyển hoặc lỗi sản xuất, với điều kiện có biên bản giao nhận và hình ảnh/video mở kiện hàng còn nguyên tem niêm phong.'),

          createH('ĐIỀU 6: THÔNG BÁO VÀ KÊNH THÔNG TIN CHÍNH THỨC'),
          createP('Hai bên thống nhất sử dụng Cổng Đại lý AMIS CRM và Thư điện tử (Email) chính thức để trao đổi đơn hàng, bảng đối chiếu công nợ, báo giá và xác nhận thanh toán. Mọi văn bản gửi qua email đã đăng ký có giá trị pháp lý ràng buộc.'),

          createH('ĐIỀU 7 & 8: QUYỀN VÀ TRÁCH NHIỆM CỦA CÁC BÊN'),
          createP('Bên A bảo đảm cung cấp hàng hóa đúng chất lượng, xuất hóa đơn GTGT hợp lệ, hỗ trợ tài liệu đào tạo sản phẩm và tư liệu truyền thông. Bên B bảo quản hàng hóa đúng chuẩn, trưng bày tại điểm bán, bán đúng giá niêm yết, không tẩy xóa nhãn phụ/mã vạch và thanh toán công nợ đúng hạn.'),

          createH('ĐIỀU 9: SỰ KIỆN BẤT KHẢ KHÁNG'),
          createP('Thực hiện theo Luật Thương mại và Bộ luật Dân sự Việt Nam (thiên tai, dịch bệnh, chiến tranh, chính sách nhà nước thay đổi). Bên bị ảnh hưởng thông báo kịp thời trong vòng 03 ngày làm việc.'),

          createH('ĐIỀU 10: ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG'),
          createP('Mỗi bên có quyền chấm dứt hợp đồng trước hạn bằng văn bản báo trước ít nhất 60 ngày. Bên B có nghĩa vụ thanh toán toàn bộ công nợ tồn đọng trước khi ký biên bản thanh lý hợp đồng.'),

          createH('ĐIỀU 11: PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI'),
          createP('11.1. Phạt vi phạm hợp đồng mức 8% giá trị phần nghĩa vụ bị vi phạm theo Điều 301 Luật Thương mại 2005.'),
          createP('11.2. Vi phạm bảo mật & Giá: Trường hợp Bên B tiết lộ bí mật kinh doanh hoặc bán phá giá, Bên B chịu mức phạt 100.000.000 VNĐ (Một trăm triệu đồng) đối với mỗi hành vi vi phạm và bồi thường toàn bộ thiệt hại thực tế phát sinh.'),

          createH('ĐIỀU 12: XỬ LÝ SỰ CỐ VÀ GIẢI QUYẾT TRANH CHẤP'),
          createP('Mọi tranh chấp phát sinh sẽ được giải quyết bằng thương lượng. Trường hợp không thỏa thuận được, tranh chấp sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền tại TP. Hà Nội. Bên thua kiện chịu toàn bộ án phí.'),

          createH('ĐIỀU 13: QUYỀN SỞ HỮU TRÍ TUỆ VÀ BẢO MẬT'),
          createP('Mọi nhãn hiệu, kiểu dáng, công thức sản phẩm Genki Fami thuộc quyền sở hữu độc quyền của Bên A. Bên B có nghĩa vụ giữ bí mật tuyệt đối về chính sách giá, danh sách khách hàng trong thời gian hợp đồng và sau khi chấm dứt hợp đồng.'),

          createH('ĐIỀU 14, 15 & 16: THỜI HẠN VÀ ĐIỀU KHOẢN THI HÀNH'),
          createP('14.1. Hợp đồng có hiệu lực 12 tháng (01 năm) kể từ ngày ký. Khi hết hạn, hợp đồng tự động gia hạn thêm ba (03) tháng nếu hai bên chưa kịp lập hợp đồng mới.'),
          createP('14.2. Hợp đồng được lập thành 04 bản có giá trị pháp lý như nhau, mỗi bên giữ 02 bản.'),

          // KHỐI CHỮ KÝ TRANG 1
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN BÊN A', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên và đóng dấu)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })] }),
                      new Paragraph({ spacing: { after: 700 }, children: [new TextRun({ text: '', font: FONT_FAMILY })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `KT. TỔNG GIÁM ĐỐC\n${partyAPos.toUpperCase()}`, font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: partyARep, font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN BÊN B', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên và đóng dấu)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })] }),
                      new Paragraph({ spacing: { after: 700 }, children: [new TextRun({ text: '', font: FONT_FAMILY })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: partyBPos.toUpperCase(), font: FONT_FAMILY, size: SIZE_HEADER, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: partyBRep, font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })
                    ]
                  })
                ]
              })
            ]
          }),

          // NGẮT TRANG SANG PHỤ LỤC 01
          new Paragraph({ children: [new PageBreak()] }),

          // TRANG 2: PHỤ LỤC 01
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({ text: 'PHỤ LỤC 01: CHÍNH SÁCH CHIẾT KHẤU & ĐƠN HÀNG NGUYÊN TẮC MẪU', font: FONT_FAMILY, size: SIZE_TITLE, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({ text: `(Kèm theo Hợp đồng nguyên tắc số: ${contractCode})`, font: FONT_FAMILY, size: SIZE_BODY, italics: true })
            ]
          }),

          createH('1. CHÍNH SÁCH CHIẾT KHẤU THƯƠNG MẠI:'),
          createP(`- Loại chiết khấu: Chiết khấu thương mại cơ bản trực tiếp trên hóa đơn theo giá bán lẻ niêm yết của Genki Fami.`),
          createP(`- Tỷ lệ chiết khấu: ${discountRate}%.`),
          createP(`- Hạn mức nợ gối đầu đơn hàng đầu tiên: ${formatVND(finalPayAmount)} VNĐ (Thanh toán khi thanh lý/kết thúc hợp đồng).`),
          createP('- Kênh tiếp nhận đơn hàng: Cổng Đại lý hệ thống MISA AMIS CRM của Bên A.'),

          createH('2. DANH MỤC SẢN PHẨM VÀ ĐƠN HÀNG MẪU:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersTable,
            rows: productRows
          }),

          createP(`Bằng chữ: ${numberToVietnameseWords(finalPayAmount)}.`, { italics: true, spacing: { before: 80, after: 120 } }),
          createP('Phụ lục này là bộ phận không thể tách rời của Hợp đồng nguyên tắc số ' + contractCode + ', được lập thành 04 bản có giá trị pháp lý như nhau.', { indent: 0, italics: true }),

          // KHỐI CHỮ KÝ PHỤ LỤC 01
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: bordersNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN BÊN A', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên và đóng dấu)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })] }),
                      new Paragraph({ spacing: { after: 700 }, children: [new TextRun({ text: '', font: FONT_FAMILY })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: partyARep, font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN BÊN B', font: FONT_FAMILY, size: SIZE_BODY, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên và đóng dấu)', font: FONT_FAMILY, size: SIZE_HEADER, italics: true })] }),
                      new Paragraph({ spacing: { after: 700 }, children: [new TextRun({ text: '', font: FONT_FAMILY })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: partyBRep, font: FONT_FAMILY, size: SIZE_BODY, bold: true })] })
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
  const cleanCode = contractCode.replace(/Đ/g, 'D').replace(/đ/g, 'd').replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9.-]/g, '_');
  const cleanName = partyBName.replace(/[^a-zA-Z0-9À-ỹ\s]/g, '').trim().replace(/\s+/g, '_');
  const fileName = `${cleanCode}_${cleanName}.docx`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.createElement) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { success: true, fileName };
}

