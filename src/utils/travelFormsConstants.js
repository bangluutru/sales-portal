import { formatVND, formatDate, numberToVietnameseWords } from './helpers.js';

export const TRAVEL_FORM_TYPES = {
  FORM_CONG_TAC: 'FORM-CONG-TAC',
  FORM_KE_HOACH_TUAN: 'FORM-KE-HOACH-TUAN',
  FORM_TAM_UNG: 'FORM-TAM-UNG',
  FORM_GIAY_DI_DUONG: 'FORM-GIAY-DI-DUONG',
  FORM_THANH_TOAN_TAM_UNG: 'FORM-THANH-TOAN-TAM-UNG',
  FORM_DE_NGHI_THANH_TOAN: 'FORM-DE-NGHI-THANH-TOAN'
};

export const TRAVEL_FORM_TEMPLATES = [
  {
    id: TRAVEL_FORM_TYPES.FORM_CONG_TAC,
    code: 'BM-01/CT-GF',
    name: 'Giấy Đề Nghị Đi Công Tác',
    title: 'GIẤY ĐỀ NGHỊ ĐI CÔNG TÁC',
    defaultOrientation: 'PORTRAIT',
    description: 'Đề xuất cử nhân sự đi công tác, phê duyệt lịch trình và bảng dự toán định mức chi phí lưu trú, đi lại, phụ cấp.',
    legalBasis: 'Quy chế tài chính & công tác phí nội bộ Công ty CP Genki Fami Việt Nam',
    category: 'Kế hoạch & Phê duyệt',
    defaultData: {
      docCode: '01/2026/ĐN-CT',
      location: 'Hà Nội',
      docDate: '2026-09-07',
      requesterName: 'Nguyễn Thành Vương',
      position: 'Cán bộ Kinh doanh cấp cao',
      department: 'Phòng Kinh Doanh',
      destination: 'Khu vực Tây Nguyên (Gia Lai, Kon Tum, Đắk Lắk)',
      purpose: 'Mở rộng thị trường đại lý mới, tiếp xúc khách hàng tiềm năng và chăm sóc hệ thống phân phối',
      startDate: '2026-09-07',
      endDate: '2026-09-12',
      durationDays: 6,
      transportation: 'Xe khách liên tỉnh, máy bay, taxi công tác',
      members: [
        { stt: 1, name: 'Nguyễn Thành Vương', position: 'Cán bộ Kinh doanh', department: 'Phòng Kinh Doanh', role: 'Trưởng đoàn công tác' },
        { stt: 2, name: 'Trần Văn Cường', position: 'Chuyên viên Thị trường', department: 'Phòng Kinh Doanh', role: 'Thành viên hỗ trợ' }
      ],
      costEstimates: [
        { stt: 1, item: 'Tiền phòng khách sạn / lưu trú', standardRate: 300000, quantity: 5, unit: 'Đêm', amount: 1500000, note: 'Định mức 300.000đ/người/đêm' },
        { stt: 2, item: 'Tiền ăn / Phụ cấp lưu trú', standardRate: 200000, quantity: 5, unit: 'Ngày', amount: 1000000, note: 'Định mức 200.000đ/người/ngày' },
        { stt: 3, item: 'Tiền vé di chuyển liên tỉnh (Xe/Vé)', standardRate: 1000000, quantity: 1, unit: 'Chuyến', amount: 1000000, note: 'Theo hóa đơn vé thực tế' },
        { stt: 4, item: 'Chi phí tiếp khách / đối tác mới', standardRate: 1000000, quantity: 1, unit: 'Gói', amount: 1000000, note: 'Gặp gỡ 3 chủ đại lý lớn' }
      ],
      managerName: 'Lê Trí Nam',
      managerTitle: 'Giám Đốc Kinh Doanh',
      directorName: 'Nguyễn Hữu Thi',
      directorTitle: 'Tổng Giám Đốc'
    }
  },
  {
    id: TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN,
    code: 'BM-02/KH-GF',
    name: 'Kế Hoạch & Báo Cáo Công Tác Tuần',
    title: 'KẾ HOẠCH & BÁO CÁO CÔNG VIỆC TUẦN',
    defaultOrientation: 'LANDSCAPE',
    description: 'Bảng kế hoạch chi tiết 7 cột khổ ngang từ Thứ 2 đến Thứ 7, theo dõi nội dung làm việc, địa chỉ khách hàng, người phối hợp, kết quả và tỷ lệ hoàn thành.',
    legalBasis: 'Mẫu Kế hoạch - Báo cáo kinh doanh tuần Genki Fami',
    category: 'Lịch trình & Giám sát',
    defaultData: {
      location: 'Miền Nam',
      docDate: '2026-09-07',
      weekLabel: 'Tuần 37 (Từ 07/09/2026 đến 12/09/2026)',
      startDate: '2026-09-07',
      endDate: '2026-09-12',
      requesterName: 'Nguyễn Thành Vương',
      position: 'Cán bộ Kinh doanh',
      department: 'Phòng Kinh Doanh',
      region: 'Miền Nam & Tây Nguyên',
      scheduleRows: [
        {
          stt: 1,
          day: 'Thứ 2 (07/09)',
          planContent: 'Khởi hành từ TP.HCM đi Phan Thiết. Làm việc với Đại lý An Sinh tại 45 Trần Hưng Đạo, Phan Thiết về chương trình phân phối Sukoyama M1. Chiều tối di chuyển đi Kon Tum.',
          collaborator: 'Mr. Cường, Ms. Lan (Đại lý An Sinh)',
          actualResult: 'Đã ký thỏa thuận cung ứng ban đầu 40 hộp Sukoyama. Đã di chuyển đến TP. Kon Tum an toàn lúc 21h30.',
          completionRate: 100,
          note: 'Đạt tiến độ kế hoạch'
        },
        {
          stt: 2,
          day: 'Thứ 3 (08/09)',
          planContent: 'Mở mới khách hàng tại Kon Tum: Thăm và giới thiệu sản phẩm tại Nhà thuốc Khang Minh (12 Lê Lợi) và Chuỗi quầy thuốc Tân Dược Kon Tum.',
          collaborator: 'Dược sĩ Minh (Chủ quầy)',
          actualResult: 'Nhà thuốc Khang Minh đồng ý nhận mẫu thử và catalog; hẹn đặt đơn đợt 1 vào ngày 15/09.',
          completionRate: 90,
          note: 'Cần gửi thêm mẫu Tsuyoiko'
        },
        {
          stt: 3,
          day: 'Thứ 4 (09/09)',
          planContent: 'Di chuyển sang Pleiku - Gia Lai. Tiếp xúc Phòng Khám Đa Khoa Tây Nguyên và Đại lý Dược phẩm Gia Lai.',
          collaborator: 'Mr. Cường, Bác sĩ Tuấn',
          actualResult: 'Đã tiếp cận Trưởng khoa Dược phòng khám, thống nhất gửi bảng giá chiết khấu và hợp đồng nguyên tắc.',
          completionRate: 95,
          note: 'Tiềm năng doanh số cao'
        },
        {
          stt: 4,
          day: 'Thứ 5 (10/09)',
          planContent: 'Làm việc tiếp tại Gia Lai buổi sáng, chiều di chuyển đi Buôn Ma Thuột - Đắk Lắk. Khảo sát thị trường bán lẻ sản phẩm mẹ & bé.',
          collaborator: 'Mr. Cường',
          actualResult: 'Hoàn tất khảo sát 6 điểm bán lẻ trọng yếu tại TP. Buôn Ma Thuột. Nhận phản hồi tốt về viên Onaka Ni Yasashii.',
          completionRate: 100,
          note: 'Chuẩn bị danh sách tiếp cận'
        },
        {
          stt: 5,
          day: 'Thứ 6 (11/09)',
          planContent: 'Mở mới khách hàng tại Buôn Ma Thuột (Đắk Lắk): Gặp gỡ Ban Giám Đốc Công ty Dược & Vật tư Y tế Đắk Lắk.',
          collaborator: 'Bà Hoàng Anh (GĐ Kinh doanh)',
          actualResult: 'Ký kết Biên bản ghi nhớ hợp tác phát triển thị trường thực phẩm bảo vệ sức khỏe Nhật Bản tại Đắk Lắk.',
          completionRate: 100,
          note: 'Thắng lợi lớn của đợt công tác'
        },
        {
          stt: 6,
          day: 'Thứ 7 (12/09)',
          planContent: 'Gặp gỡ 2 điểm bán bổ sung tại Buôn Ma Thuột, chốt danh sách đối tác đợt 1 và di chuyển xe về lại TP. Hồ Chí Minh.',
          collaborator: 'Mr. Cường',
          actualResult: 'Thu thập đầy đủ thông tin pháp lý của 3 đại lý mới. Lên xe khởi hành về TP.HCM.',
          completionRate: 100,
          note: 'Hoàn thành chuyến công tác'
        }
      ],
      extraWorks: [
        { stt: 1, content: 'Hỗ trợ giải quyết thắc mắc tồn kho cho đại lý cũ tại Bình Phước qua điện thoại', result: 'Đã giải quyết xong', note: 'Phát sinh tối 09/09' },
        { stt: 2, content: 'Thu thập bảng giá sản phẩm đối thủ tại các nhà thuốc Tây Nguyên', result: 'Đã tổng hợp file báo cáo so sánh giá', note: 'Phát sinh ngày 11/09' }
      ],
      recommendations: [
        { stt: 1, content: 'Đề xuất công ty hỗ trợ thêm tài liệu POSM (standee, tờ rơi tiếng Việt) và kệ trưng bày nhỏ cho các quầy thuốc Tây Nguyên.' },
        { stt: 2, content: 'Đề xuất phòng Marketing tăng cường chạy quảng cáo nhận diện thương hiệu Genki Fami khu vực Gia Lai - Đắk Lắk.' }
      ],
      managerName: 'Lê Trí Nam',
      managerTitle: 'Giám Đốc Kinh Doanh',
      directorName: 'Nguyễn Hữu Thi',
      directorTitle: 'Tổng Giám Đốc'
    }
  },
  {
    id: TRAVEL_FORM_TYPES.FORM_TAM_UNG,
    code: 'BM-03/TU-GF',
    name: 'Giấy Đề Nghị Tạm Ứng Công Tác',
    title: 'GIẤY ĐỀ NGHỊ TẠM ỨNG',
    defaultOrientation: 'PORTRAIT',
    description: 'Mẫu đề nghị tạm ứng kinh phí công tác (ăn uống, lưu trú, xăng xe di chuyển, tiếp khách) chuẩn CCO Nam & Kế toán.',
    legalBasis: 'Quy chế tài chính Công ty CP Genki Fami Việt Nam',
    category: 'Tài chính - Tạm ứng',
    defaultData: {
      location: 'Hà Nội',
      docDate: '2026-08-18',
      requestCode: 'TU-2026-08-012',
      requesterName: 'LÊ TRÍ NAM',
      position: 'Giám Đốc Kinh Doanh (CCO)',
      department: 'Phòng Kinh Doanh',
      purpose: 'Tạm ứng công tác phí thị trường Tây Nguyên & Nam Trung Bộ Tháng 08/2026',
      items: [
        { stt: 1, title: 'Tiền ăn uống / Phụ cấp lưu trú', amount: 2000000, note: '5 ngày x 400.000đ/ngày' },
        { stt: 2, title: 'Tiền lưu trú / Khách sạn', amount: 3000000, note: '5 đêm x 600.000đ/đêm' },
        { stt: 3, title: 'Tiền di chuyển (Vé máy bay, xăng xe, taxi)', amount: 2000000, note: 'Vé máy bay khứ hồi và taxi địa phương' },
        { stt: 4, title: 'Chi phí tiếp khách & đối tác trọng điểm', amount: 3000000, note: 'Tiếp đón 4 đại lý phân phối cấp 1' }
      ],
      settlementDeadline: 'Trong vòng 05 ngày làm việc sau khi kết thúc chuyến công tác',
      accountantName: 'Đào Thị Hồng',
      accountantTitle: 'Kế Toán Trưởng',
      directorName: 'Nguyễn Hữu Thi',
      directorTitle: 'Tổng Giám Đốc'
    }
  },
  {
    id: TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG,
    code: 'BM-04/GDD-GF',
    name: 'Giấy Đi Đường Lữ Hành',
    title: 'GIẤY ĐI ĐƯỜNG',
    defaultOrientation: 'LANDSCAPE',
    description: 'Mẫu số 06-LĐTL quy chuẩn Bộ Tài Chính: Bảng lịch trình 8 cột khổ ngang kèm xác nhận ký tên, đóng dấu của cơ quan/khách hàng nơi đến.',
    legalBasis: 'Mẫu số 06-LĐTL (Thông tư 200/2014/TT-BTC & TT 133/2016/TT-BTC)',
    category: 'Chứng từ lữ hành',
    defaultData: {
      location: 'Hà Nội',
      docDate: '2026-09-07',
      docCode: '06-LĐTL/2026-09',
      officerName: 'Nguyễn Thành Vương',
      position: 'Cán bộ Kinh doanh',
      department: 'Phòng Kinh Doanh',
      destination: 'Tỉnh Bình Thuận, Kon Tum, Gia Lai, Đắk Lắk',
      dispatchOrder: 'Số 18/QĐ-GF ngày 05/09/2026 của Tổng Giám Đốc',
      startDate: '2026-09-07',
      endDate: '2026-09-12',
      advanceSalary: 0,
      advanceTravelCost: 4500000,
      journeyLogs: [
        {
          stt: 1,
          fromTo: 'Nơi đi: TP. Hồ Chí Minh\nNơi đến: Phan Thiết (Bình Thuận)',
          dateTime: '07h00 - 11h30\n07/09/2026',
          vehicle: 'Xe khách chất lượng cao',
          distanceKm: '190 km',
          transitStay: '0.5 ngày',
          destStay: '0.5 ngày',
          reason: 'Làm việc với Đại lý An Sinh',
          verification: 'Đã ký & xác nhận đối tác'
        },
        {
          stt: 2,
          fromTo: 'Nơi đi: Phan Thiết\nNơi đến: TP. Kon Tum',
          dateTime: '18h00 ngày 07/09 -\n06h30 ngày 08/09/2026',
          vehicle: 'Xe giường nằm liên tỉnh',
          distanceKm: '520 km',
          transitStay: '1 đêm trên đường',
          destStay: '1 ngày',
          reason: 'Khảo sát Nhà thuốc Khang Minh',
          verification: 'Đã ký & xác nhận'
        },
        {
          stt: 3,
          fromTo: 'Nơi đi: TP. Kon Tum\nNơi đến: TP. Pleiku (Gia Lai)',
          dateTime: '07h30 - 09h00\n09/09/2026',
          vehicle: 'Xe buýt / Xe khách',
          distanceKm: '50 km',
          transitStay: '0 ngày',
          destStay: '1.5 ngày',
          reason: 'Làm việc Phòng khám Tây Nguyên',
          verification: 'Đã ký & xác nhận'
        },
        {
          stt: 4,
          fromTo: 'Nơi đi: Pleiku (Gia Lai)\nNơi đến: Buôn Ma Thuột (Đắk Lắk)',
          dateTime: '13h30 - 17h30\n10/09/2026',
          vehicle: 'Xe khách liên tỉnh',
          distanceKm: '180 km',
          transitStay: '0.5 ngày',
          destStay: '1.5 ngày',
          reason: 'Ký kết MOU Công ty Dược Đắk Lắk',
          verification: 'Đã ký & xác nhận'
        },
        {
          stt: 5,
          fromTo: 'Nơi đi: TP. Buôn Ma Thuột\nNơi đến: TP. Hồ Chí Minh',
          dateTime: '13h00 - 21h30\n12/09/2026',
          vehicle: 'Xe khách giường nằm',
          distanceKm: '350 km',
          transitStay: '0.5 ngày',
          destStay: '0 ngày',
          reason: 'Kết thúc đợt công tác, về trụ sở',
          verification: 'Về tới trụ sở cty'
        }
      ],
      costSummary: {
        travel: 1200000,
        lodging: 1500000,
        perDiem: 1000000,
        hospitality: 800000,
        other: 0
      },
      approvedStayDays: 5,
      approvedAmount: 4500000,
      departmentHeadName: 'Lê Trí Nam',
      departmentHeadTitle: 'Trưởng Bộ Phận',
      chiefAccountantName: 'Đào Thị Hồng',
      chiefAccountantTitle: 'Trưởng Phòng Kế Toán',
      directorName: 'Nguyễn Hữu Thi',
      directorTitle: 'Thủ Trưởng Đơn Vị Duyệt'
    }
  },
  {
    id: TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG,
    code: 'BM-05/TTTU-GF',
    name: 'Giấy Thanh Toán Tạm Ứng',
    title: 'GIẤY THANH TOÁN TẠM ỨNG',
    defaultOrientation: 'PORTRAIT',
    description: 'Mẫu số 04-TT chuẩn Bộ Tài Chính: Bảng đối chiếu 3 phần chi tiết (I - Số tiền tạm ứng, II - Số tiền thực chi theo hóa đơn, III - Chênh lệch hoàn ứng hoặc chi bổ sung).',
    legalBasis: 'Mẫu số 04-TT (Ban hành theo Thông tư 200/2014/TT-BTC & TT 133/2016/TT-BTC)',
    category: 'Quyết toán & Hoàn ứng',
    defaultData: {
      location: 'Hà Nội',
      docDate: '2026-09-14',
      docCode: '04-TT/2026-09-08',
      requesterName: 'Nguyễn Thành Vương',
      position: 'Cán bộ Kinh doanh',
      department: 'Phòng Kinh Doanh',
      advancePrevious: 0,
      advanceThisPeriod: 4500000,
      paymentVoucherNumber: 'PC-2026-09-045 ngày 06/09/2026',
      actualExpenses: [
        { stt: 1, item: '1. Tiền vé xe khách / di chuyển liên tỉnh (4 chặng)', amount: 1180000, voucherCode: 'Vé xe 0012, 0054, 0098, 0112' },
        { stt: 2, item: '2. Tiền phòng lưu trú khách sạn (5 đêm)', amount: 1500000, voucherCode: 'HĐ VAT số 0004523 Ks Kon Tum & Đắk Lắk' },
        { stt: 3, item: '3. Tiền ăn uống / Phụ cấp lưu trú công tác', amount: 1000000, voucherCode: 'Bảng kê phụ cấp duyệt theo ngày' },
        { stt: 4, item: '4. Tiền taxi & xe ôm di chuyển nội tỉnh', amount: 350000, voucherCode: 'Hóa đơn Grab / Biên nhận taxi' },
        { stt: 5, item: '5. Tiền tiếp khách đại lý tại Phan Thiết & Đắk Lắk', amount: 920000, voucherCode: 'Hóa đơn tiếp khách số 002148' }
      ],
      attachmentCount: 7,
      paymentAccountantName: 'Nguyễn Thị Thùy',
      paymentAccountantTitle: 'Kế Toán Thanh Toán',
      chiefAccountantName: 'Đào Thị Hồng',
      chiefAccountantTitle: 'Kế Toán Trưởng',
      directorName: 'Nguyễn Hữu Thi',
      directorTitle: 'Thủ Trưởng Đơn Vị Duyệt'
    }
  },
  {
    id: TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN,
    code: 'BM-06/DNTT-GF',
    name: 'Giấy Đề Nghị Thanh Toán Chi Phí',
    title: 'GIẤY ĐỀ NGHỊ THANH TOÁN',
    defaultOrientation: 'PORTRAIT',
    description: 'Bảng kê chứng từ gốc thanh toán chi phí công tác hoặc chi phí tác nghiệp phát sinh kèm hóa đơn VAT.',
    legalBasis: 'Quy chuẩn chứng từ kế toán theo Luật Kế toán 2015 & Nghị định 30/2020/NĐ-CP',
    category: 'Thanh toán trực tiếp',
    defaultData: {
      location: 'Hà Nội',
      docDate: '2026-09-14',
      requestCode: 'DNTT-2026-09-009',
      requesterName: 'Nguyễn Thành Vương',
      position: 'Cán bộ Kinh doanh',
      department: 'Phòng Kinh Doanh',
      purpose: 'Thanh toán các khoản chi phí phát sinh trong chuyến công tác thị trường Tây Nguyên từ 07/09 đến 12/09/2026',
      expenseRows: [
        { stt: 1, date: '07/09/2026', voucherNo: 'HD-00129', description: 'Vé xe khách TP.HCM - Phan Thiết (Nhà xe Phương Trang)', supplier: 'CTCP Xe Khách Phương Trang', amount: 180000, note: 'Kèm vé xe gốc' },
        { stt: 2, date: '08/09/2026', voucherNo: 'HD-00541', description: 'Vé xe giường nằm Phan Thiết - Kon Tum', supplier: 'Hợp tác xã Vận tải Kon Tum', amount: 350000, note: 'Kèm vé xe gốc' },
        { stt: 3, date: '09/09/2026', voucherNo: 'VAT-4521', description: 'Tiền phòng khách sạn Hưng Phát (Kon Tum, 2 đêm)', supplier: 'DNTN Khách Sạn Hưng Phát', amount: 600000, note: 'Hóa đơn điện tử VAT' },
        { stt: 4, date: '11/09/2026', voucherNo: 'VAT-8842', description: 'Tiền phòng khách sạn Bạch Mã (Buôn Ma Thuột, 2 đêm)', supplier: 'CTCP Du Lịch Đắk Lắk', amount: 900000, note: 'Hóa đơn điện tử VAT' },
        { stt: 5, date: '11/09/2026', voucherNo: 'VAT-3329', description: 'Tiếp khách ký kết thỏa thuận đại lý Dược Đắk Lắk', supplier: 'Nhà Hàng Cà Phê Trung Nguyên BMT', amount: 920000, note: 'Hóa đơn điện tử VAT' },
        { stt: 6, date: '12/09/2026', voucherNo: 'HD-00984', description: 'Vé xe khách Buôn Ma Thuột về TP. Hồ Chí Minh', supplier: 'CTCP Xe Khách Tiến Oanh', amount: 350000, note: 'Kèm vé xe gốc' }
      ],
      attachmentCount: 6,
      paymentAccountantName: 'Nguyễn Thị Thùy',
      paymentAccountantTitle: 'Kế Toán Thanh Toán',
      chiefAccountantName: 'Đào Thị Hồng',
      chiefAccountantTitle: 'Kế Toán Trưởng',
      directorName: 'Nguyễn Hữu Thi',
      directorTitle: 'Giám Đốc Duyệt'
    }
  }
];

/**
 * Tạo header quy chuẩn Nghị định 30/2020/NĐ-CP
 * Quốc hiệu: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (in hoa, đậm)
 * Tiêu ngữ: Độc lập - Tự do - Hạnh phúc (in thường, đậm, gạch chân nét liền)
 * Đơn vị ban hành: CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM (in hoa, đậm)
 */
export function renderDecree30Header(docCode = '', location = 'Hà Nội', docDate = '', docNumberLabel = 'Số:') {
  const d = docDate ? new Date(docDate) : new Date();
  const dayStr = isNaN(d.getDate()) ? '...' : String(d.getDate()).padStart(2, '0');
  const monthStr = isNaN(d.getMonth()) ? '...' : String(d.getMonth() + 1).padStart(2, '0');
  const yearStr = isNaN(d.getFullYear()) ? '2026' : String(d.getFullYear());

  return `
    <div class="nd30-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; font-family: 'Times New Roman', Times, serif; color: #000000;">
      <!-- Khối Cơ Quan Ban Hành (Trái) -->
      <div style="text-align: center; width: 45%;">
        <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; line-height: 1.3;">
          CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM
        </div>
        <div style="font-size: 11pt; color: #111; margin-top: 2px;">
          BỘ PHẬN KINH DOANH & VẬN HÀNH
        </div>
        <div style="width: 100px; height: 1px; background-color: #000; margin: 4px auto 6px auto;"></div>
        ${docCode ? `<div style="font-size: 11pt; font-style: normal; color: #222;">${docNumberLabel} ${docCode}</div>` : ''}
      </div>

      <!-- Khối Quốc Hiệu - Tiêu Ngữ (Phải) -->
      <div style="text-align: center; width: 50%;">
        <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; line-height: 1.3;">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </div>
        <div style="font-size: 12.5pt; font-weight: bold; margin-top: 2px; line-height: 1.3;">
          Độc lập - Tự do - Hạnh phúc
        </div>
        <div style="width: 150px; height: 1.5px; background-color: #000; margin: 4px auto 8px auto;"></div>
        <div style="font-size: 12pt; font-style: italic; color: #222;">
          ${location}, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}
        </div>
      </div>
    </div>
  `;
}

/**
 * Biên dịch nội dung HTML của từng loại biểu mẫu chuẩn Nghị định 30
 */
export function compileTravelFormHtml(templateId, data = {}, orientation = null) {
  const tpl = TRAVEL_FORM_TEMPLATES.find(t => t.id === templateId) || TRAVEL_FORM_TEMPLATES[0];
  const activeOrientation = orientation || tpl.defaultOrientation;
  const merged = { ...tpl.defaultData, ...data };

  let bodyHtml = '';

  switch (templateId) {
    case TRAVEL_FORM_TYPES.FORM_CONG_TAC:
      bodyHtml = generateFormCongTacHtml(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_KE_HOACH_TUAN:
      bodyHtml = generateFormKeHoachTuanHtml(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_TAM_UNG:
      bodyHtml = generateFormTamUngHtml(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_GIAY_DI_DUONG:
      bodyHtml = generateFormGiayDiDuongHtml(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_THANH_TOAN_TAM_UNG:
      bodyHtml = generateFormThanhToanTamUngHtml(merged);
      break;
    case TRAVEL_FORM_TYPES.FORM_DE_NGHI_THANH_TOAN:
      bodyHtml = generateFormDeNghiThanhToanHtml(merged);
      break;
    default:
      bodyHtml = generateFormCongTacHtml(merged);
  }

  return `
    <div class="travel-form-container ${activeOrientation.toLowerCase()}" style="font-family: 'Times New Roman', Times, serif; color: #000000; line-height: 1.45; font-size: 13pt;">
      ${bodyHtml}
    </div>
  `;
}

// 1. Giấy Đề Nghị Đi Công Tác (Portrait)
function generateFormCongTacHtml(d) {
  const members = d.members || [];
  const costEstimates = d.costEstimates || [];
  const totalAmount = costEstimates.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const membersRowsHtml = members.map((m, idx) => `
    <tr>
      <td style="text-align: center; width: 45px;">${m.stt || idx + 1}</td>
      <td style="font-weight: bold; padding-left: 8px;">${m.name}</td>
      <td style="text-align: center;">${m.position}</td>
      <td style="text-align: center;">${m.department}</td>
      <td style="text-align: left; padding-left: 8px;">${m.role || 'Thành viên'}</td>
    </tr>
  `).join('');

  const costRowsHtml = costEstimates.map((c, idx) => `
    <tr>
      <td style="text-align: center; width: 45px;">${c.stt || idx + 1}</td>
      <td style="font-weight: 500; padding-left: 8px;">${c.item}</td>
      <td style="text-align: right; padding-right: 8px;">${c.standardRate ? formatVND(c.standardRate) : '—'}</td>
      <td style="text-align: center;">${c.quantity} ${c.unit || ''}</td>
      <td style="text-align: right; font-weight: bold; padding-right: 8px;">${formatVND(c.amount)}</td>
      <td style="font-size: 11pt; padding-left: 6px;">${c.note || ''}</td>
    </tr>
  `).join('');

  return `
    ${renderDecree30Header(d.docCode, d.location, d.docDate)}

    <div style="text-align: center; margin: 20px 0 16px 0;">
      <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">GIẤY ĐỀ NGHỊ ĐI CÔNG TÁC</div>
      <div style="font-size: 12pt; font-style: italic; margin-top: 4px;">(V/v: Cử cán bộ thực hiện nhiệm vụ phát triển thị trường)</div>
    </div>

    <div style="margin-bottom: 16px; font-style: italic; text-align: center;">
      <strong>Kính gửi:</strong> Ban Giám Đốc Công ty Cổ Phần Genki Fami Việt Nam
    </div>

    <div style="margin-bottom: 14px;">
      <div style="margin-bottom: 6px;"><strong>Họ và tên người đề nghị:</strong> ${d.requesterName}</div>
      <div style="margin-bottom: 6px;"><strong>Chức vụ / Bộ phận:</strong> ${d.position} — ${d.department}</div>
      <div style="margin-bottom: 6px;"><strong>Lý do / Mục đích công tác:</strong> ${d.purpose}</div>
      <div style="margin-bottom: 6px;"><strong>Nơi đi công tác:</strong> ${d.destination}</div>
      <div style="margin-bottom: 6px;"><strong>Thời gian công tác:</strong> Từ ngày ${formatDate(d.startDate)} đến ngày ${formatDate(d.endDate)} (${d.durationDays || 6} ngày)</div>
      <div style="margin-bottom: 6px;"><strong>Phương tiện di chuyển:</strong> ${d.transportation}</div>
    </div>

    <div style="margin-top: 14px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; font-size: 12.5pt;">
      I. Danh Sách Cán Bộ Đi Công Tác:
    </div>
    <div style="font-size: 11.5pt; font-style: italic; margin-bottom: 8px; color: #333;">
      * Trường hợp đi công tác từ 2 ngày trở lên bắt buộc có chương trình / kế hoạch công tác kèm theo.
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f3f4f6; font-weight: bold; text-align: center; font-size: 12pt;">
          <th style="width: 45px;">STT</th>
          <th>Họ và Tên</th>
          <th style="width: 150px;">Chức Vụ</th>
          <th style="width: 150px;">Bộ Phận</th>
          <th style="width: 160px;">Nhiệm Vụ / Vai Trò</th>
        </tr>
      </thead>
      <tbody>
        ${membersRowsHtml}
      </tbody>
    </table>

    <div style="margin-top: 14px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; font-size: 12.5pt;">
      II. Dự Toán Kinh Phí Công Tác Được Duyệt:
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f3f4f6; font-weight: bold; text-align: center; font-size: 12pt;">
          <th style="width: 45px;">STT</th>
          <th>Khoản Mục Chi Phí</th>
          <th style="width: 120px;">Định Mức / Ngày</th>
          <th style="width: 85px;">Số Lượng</th>
          <th style="width: 125px;">Thành Tiền (VNĐ)</th>
          <th style="width: 160px;">Ghi Chú</th>
        </tr>
      </thead>
      <tbody>
        ${costRowsHtml}
        <tr style="font-weight: bold; background-color: #fafafa;">
          <td colspan="4" style="text-align: right; padding-right: 12px; text-transform: uppercase;">Tổng cộng dự toán:</td>
          <td style="text-align: right; padding-right: 8px; font-size: 13pt; color: #000;">${formatVND(totalAmount)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-bottom: 24px; font-style: italic;">
      <strong>Số tiền viết bằng chữ:</strong> ${numberToVietnameseWords(totalAmount)}.
    </div>

    <!-- Khối 3 Chữ Ký Cân Đối Chuẩn NĐ 30 -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 24px; page-break-inside: avoid;" border="0">
      <tr>
        <td style="width: 33%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">NGƯỜI ĐỀ NGHỊ</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 65px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.requesterName}</div>
        </td>
        <td style="width: 34%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">QUẢN LÝ BỘ PHẬN</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 65px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.managerName || 'Lê Trí Nam'}</div>
        </td>
        <td style="width: 33%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">TỔNG GIÁM ĐỐC PHÊ DUYỆT</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký tên, đóng dấu)</div>
          <div style="height: 65px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.directorName || 'Nguyễn Hữu Thi'}</div>
        </td>
      </tr>
    </table>
  `;
}

// 2. Kế Hoạch & Báo Cáo Công Tác Tuần (Landscape - 7 columns)
function generateFormKeHoachTuanHtml(d) {
  const scheduleRows = d.scheduleRows || [];
  const extraWorks = d.extraWorks || [];
  const recommendations = d.recommendations || [];

  const rowsHtml = scheduleRows.map((r, idx) => `
    <tr>
      <td style="text-align: center; width: 40px; font-weight: bold;">${r.stt || idx + 1}</td>
      <td style="text-align: center; width: 110px; font-weight: bold; background-color: #fafafa;">${r.day}</td>
      <td style="text-align: left; padding: 6px 8px; vertical-align: top;">${r.planContent.replace(/\n/g, '<br>')}</td>
      <td style="text-align: center; width: 140px; vertical-align: top; padding: 6px;">${r.collaborator || '—'}</td>
      <td style="text-align: left; padding: 6px 8px; vertical-align: top; color: #111;">${r.actualResult ? r.actualResult.replace(/\n/g, '<br>') : '—'}</td>
      <td style="text-align: center; width: 85px; font-weight: bold; color: #006964;">${r.completionRate != null ? r.completionRate + '%' : '—'}</td>
      <td style="text-align: left; width: 140px; font-size: 11pt; padding: 6px 8px; vertical-align: top;">${r.note || ''}</td>
    </tr>
  `).join('');

  const extraRowsHtml = extraWorks.map((e, idx) => `
    <tr>
      <td style="text-align: center; width: 40px;">${e.stt || idx + 1}</td>
      <td colspan="3" style="text-align: left; padding: 6px 8px;">${e.content}</td>
      <td colspan="2" style="text-align: left; padding: 6px 8px;">${e.result || 'Đã hoàn thành'}</td>
      <td style="text-align: left; font-size: 11pt; padding: 6px 8px;">${e.note || ''}</td>
    </tr>
  `).join('');

  const recHtml = recommendations.map((rec, idx) => `
    <div style="margin-bottom: 6px; padding-left: 8px;">
      <strong>${idx + 1}.</strong> ${rec.content}
    </div>
  `).join('');

  return `
    ${renderDecree30Header(d.docCode || 'KH-BC/TUAN-37', d.location || 'Miền Nam', d.docDate)}

    <div style="text-align: center; margin: 16px 0 14px 0;">
      <div style="font-size: 17pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">KẾ HOẠCH & BÁO CÁO CÔNG TÁC TUẦN</div>
      <div style="font-size: 12pt; font-style: italic; margin-top: 4px;">Thời gian: ${d.weekLabel || `Từ ngày ${formatDate(d.startDate)} đến ${formatDate(d.endDate)}`}</div>
    </div>

    <!-- Metadata hàng ngang tối ưu khổ ngang -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; background-color: #f8fafc; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 4px;">
      <div><strong>Người lập:</strong> ${d.requesterName} (${d.position})</div>
      <div><strong>Bộ phận:</strong> ${d.department}</div>
      <div><strong>Khu vực phụ trách:</strong> ${d.region || 'Miền Nam'}</div>
    </div>

    <div style="margin-top: 10px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 12pt;">
      I. Kế Hoạch & Kết Quả Thực Hiện Công Việc Tuần:
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center; font-size: 11.5pt;">
          <th rowspan="2" style="width: 40px;">STT</th>
          <th rowspan="2" style="width: 110px;">Thứ - Ngày</th>
          <th colspan="2" style="background-color: #e2e8f0;">KẾ HOẠCH CÔNG VIỆC DỰ KIẾN</th>
          <th colspan="3" style="background-color: #e2e8f0;">BÁO CÁO KẾT QUẢ THỰC TẾ</th>
        </tr>
        <tr style="background-color: #f8fafc; font-weight: bold; text-align: center; font-size: 11pt;">
          <th>Nội dung kế hoạch chi tiết (Địa chỉ, khách hàng, công việc cụ thể)</th>
          <th style="width: 140px;">Người phối hợp</th>
          <th>Kết quả thực tế đạt được</th>
          <th style="width: 85px;">Đánh giá (%)</th>
          <th style="width: 140px;">Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${extraWorks.length > 0 ? `
      <div style="margin-top: 10px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 12pt;">
        II. Công Việc Bổ Sung / Phát Sinh Ngoài Kế Hoạch:
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;" border="1" cellpadding="5">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center; font-size: 11pt;">
            <th style="width: 40px;">STT</th>
            <th colspan="3">Nội dung công việc bổ sung / xử lý khẩn cấp</th>
            <th colspan="2">Kết quả xử lý</th>
            <th style="width: 140px;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${extraRowsHtml}
        </tbody>
      </table>
    ` : ''}

    <div style="margin-top: 10px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 12pt;">
      III. Kiến Nghị - Đề Xuất & Giải Pháp:
    </div>
    <div style="background-color: #ffffff; border: 1px solid #d1d5db; padding: 8px 12px; margin-bottom: 20px;">
      ${recHtml.length > 0 ? recHtml : '<div style="font-style: italic; color: #666;">Không có kiến nghị phát sinh.</div>'}
    </div>

    <!-- Khối Chữ Ký Khổ Ngang Cân Đối 3 Cột Rộng -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; page-break-inside: avoid;" border="0">
      <tr>
        <td style="width: 33%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">NGƯỜI LẬP KẾ HOẠCH - BÁO CÁO</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.requesterName}</div>
        </td>
        <td style="width: 34%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">GIÁM ĐỐC KINH DOANH (CCO)</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.managerName || 'Lê Trí Nam'}</div>
        </td>
        <td style="width: 33%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">GIÁM ĐỐC ĐIỀU HÀNH PHÊ DUYỆT</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký tên, đóng dấu)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.directorName || 'Nguyễn Hữu Thi'}</div>
        </td>
      </tr>
    </table>
  `;
}

// 3. Giấy Đề Nghị Tạm Ứng Công Tác (Portrait)
function generateFormTamUngHtml(d) {
  const items = d.items || [];
  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const itemsRowsHtml = items.map((item, idx) => `
    <tr>
      <td style="text-align: center; width: 45px;">${item.stt || idx + 1}</td>
      <td style="font-weight: 500; padding-left: 8px;">${item.title}</td>
      <td style="text-align: right; font-weight: bold; padding-right: 12px; width: 150px;">${formatVND(item.amount)}</td>
      <td style="font-size: 11.5pt; padding-left: 8px;">${item.note || ''}</td>
    </tr>
  `).join('');

  return `
    ${renderDecree30Header(d.requestCode, d.location, d.docDate, 'Mã đề nghị:')}

    <div style="text-align: center; margin: 24px 0 20px 0;">
      <div style="font-size: 17pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">GIẤY ĐỀ NGHỊ TẠM ỨNG</div>
      <div style="font-size: 12pt; font-style: italic; margin-top: 4px;">(Kinh phí phục vụ công tác thị trường)</div>
    </div>

    <div style="margin-bottom: 18px; font-style: italic; text-align: center;">
      <strong>Kính gửi:</strong> Ban Giám Đốc Công ty & Phòng Kế toán - Tài chính
    </div>

    <div style="margin-bottom: 16px;">
      <div style="margin-bottom: 8px;"><strong>Họ và tên người đề nghị:</strong> <span style="text-transform: uppercase; font-weight: bold;">${d.requesterName}</span></div>
      <div style="margin-bottom: 8px;"><strong>Chức vụ / Bộ phận:</strong> ${d.position} — ${d.department}</div>
      <div style="margin-bottom: 8px;"><strong>Lý do / Nội dung tạm ứng:</strong> ${d.purpose}</div>
    </div>

    <div style="margin-top: 14px; margin-bottom: 8px; font-weight: bold; font-size: 12.5pt;">
      Bảng Chi Tiết Khoản Tiền Đề Nghị Tạm Ứng:
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;" border="1" cellpadding="7">
      <thead>
        <tr style="background-color: #f3f4f6; font-weight: bold; text-align: center; font-size: 12pt;">
          <th style="width: 45px;">STT</th>
          <th>Khoản Mục Tạm Ứng Chi Tiết</th>
          <th style="width: 150px;">Số Tiền (VNĐ)</th>
          <th style="width: 180px;">Căn Cứ / Ghi Chú</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
        <tr style="font-weight: bold; background-color: #fafafa; font-size: 13pt;">
          <td colspan="2" style="text-align: right; padding-right: 12px; text-transform: uppercase;">Tổng cộng tiền tạm ứng:</td>
          <td style="text-align: right; padding-right: 12px; color: #000;">${formatVND(totalAmount)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-bottom: 10px;">
      <strong>Số tiền viết bằng chữ:</strong> <span style="font-style: italic; font-weight: bold;">${numberToVietnameseWords(totalAmount)}</span>.
    </div>

    <div style="margin-bottom: 24px; font-size: 12pt; color: #333;">
      <strong>Thời hạn thanh toán / hoàn ứng:</strong> ${d.settlementDeadline || 'Trong vòng 05 ngày làm việc kể từ khi kết thúc đợt công tác'}.
    </div>

    <!-- Khối Chữ Ký Chuẩn 3 Bên -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 30px; page-break-inside: avoid;" border="0">
      <tr>
        <td style="width: 33%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">NGƯỜI ĐỀ NGHỊ TẠM ỨNG</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 65px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.requesterName}</div>
        </td>
        <td style="width: 34%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">KẾ TOÁN TRƯỞNG</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 65px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.accountantName || 'Đào Thị Hồng'}</div>
        </td>
        <td style="width: 33%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt;">TỔNG GIÁM ĐỐC DUYỆT</div>
          <div style="font-style: italic; font-size: 11pt; margin-top: 2px;">(Ký tên, đóng dấu)</div>
          <div style="height: 65px;"></div>
          <div style="font-weight: bold; font-size: 12pt;">${d.directorName || 'Nguyễn Hữu Thi'}</div>
        </td>
      </tr>
    </table>
  `;
}

// 4. Giấy Đi Đường Lữ Hành (Landscape - 8 columns)
function generateFormGiayDiDuongHtml(d) {
  const logs = d.journeyLogs || [];
  const cost = d.costSummary || { travel: 0, lodging: 0, perDiem: 0, hospitality: 0, other: 0 };
  const totalCost = Number(cost.travel || 0) + Number(cost.lodging || 0) + Number(cost.perDiem || 0) + Number(cost.hospitality || 0) + Number(cost.other || 0);

  const logsRowsHtml = logs.map((log, idx) => `
    <tr>
      <td style="text-align: left; padding: 6px 8px; vertical-align: middle; font-weight: 500;">${log.fromTo.replace(/\n/g, '<br>')}</td>
      <td style="text-align: center; padding: 6px; vertical-align: middle; width: 115px; font-size: 11pt;">${log.dateTime.replace(/\n/g, '<br>')}</td>
      <td style="text-align: center; padding: 6px; vertical-align: middle; width: 120px;">${log.vehicle}</td>
      <td style="text-align: center; padding: 6px; vertical-align: middle; width: 75px; font-weight: bold;">${log.distanceKm}</td>
      <td style="text-align: center; padding: 6px; vertical-align: middle; width: 90px;">${log.transitStay}</td>
      <td style="text-align: center; padding: 6px; vertical-align: middle; width: 90px;">${log.destStay}</td>
      <td style="text-align: left; padding: 6px 8px; vertical-align: middle;">${log.reason}</td>
      <td style="text-align: center; padding: 6px; vertical-align: middle; width: 140px; font-size: 11pt; background-color: #fafafa;">
        <div style="font-style: italic; color: #555;">${log.verification || 'Ký, đóng dấu'}</div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
      <!-- Khối Đơn Vị Ban Hành (Trái) -->
      <div style="text-align: left; width: 50%;">
        <div style="font-weight: bold; font-size: 12pt; text-transform: uppercase;">CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM</div>
        <div style="font-size: 11pt;">Bộ phận: ${d.department || 'Phòng Kinh Doanh'}</div>
        <div style="font-size: 11pt; margin-top: 2px;">Lệnh điều động: ${d.dispatchOrder || 'Theo kế hoạch công tác số 01/2026'}</div>
      </div>

      <!-- Khối Quy Chuẩn Mẫu Kế Toán (Phải) -->
      <div style="text-align: right; width: 45%;">
        <div style="font-weight: bold; font-size: 12pt;">Mẫu số: 06 - LĐTL</div>
        <div style="font-size: 10.5pt; font-style: italic; color: #444;">
          (Ban hành theo Thông tư số 200/2014/TT-BTC & TT 133/2016/TT-BTC của Bộ Tài Chính)
        </div>
        <div style="font-size: 11pt; margin-top: 4px; font-style: italic;">
          ${d.location || 'Hà Nội'}, ngày ${formatDate(d.docDate)}
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 14px 0 16px 0;">
      <div style="font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">GIẤY ĐI ĐƯỜNG</div>
      <div style="font-size: 11.5pt; font-style: italic;">(Số: ${d.docCode || '06-LĐTL/2026'})</div>
    </div>

    <!-- Thông tin nhân sự cấp giấy -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; background-color: #f8fafc; padding: 6px 12px; border: 1px solid #e2e8f0;">
      <div><strong>Cấp cho Ông/Bà:</strong> <span style="text-transform: uppercase; font-weight: bold;">${d.officerName}</span></div>
      <div><strong>Chức vụ:</strong> ${d.position}</div>
      <div><strong>Được cử đi công tác tại:</strong> ${d.destination}</div>
      <div><strong>Thời gian:</strong> Từ ${formatDate(d.startDate)} đến ${formatDate(d.endDate)}</div>
    </div>

    <div style="margin-top: 8px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">
      I. Lịch Trình Công Tác & Xác Nhận Nơi Đến:
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;" border="1" cellpadding="5">
      <thead>
        <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center; font-size: 11pt;">
          <th rowspan="2">Nơi Đi và Nơi Đến</th>
          <th rowspan="2" style="width: 115px;">Ngày Giờ<br>Đi / Đến</th>
          <th rowspan="2" style="width: 120px;">Phương Tiện<br>Sử Dụng</th>
          <th rowspan="2" style="width: 75px;">Độ Dài<br>(km)</th>
          <th colspan="2" style="background-color: #e2e8f0;">Thời Gian Lưu Trú</th>
          <th rowspan="2">Lý Do Lưu Trú / Mục Đích</th>
          <th rowspan="2" style="width: 140px;">Xác Nhận Nơi Đến<br><span style="font-size: 9.5pt; font-weight: normal;">(Ký tên, đóng dấu)</span></th>
        </tr>
        <tr style="background-color: #f8fafc; font-weight: bold; text-align: center; font-size: 10.5pt;">
          <th style="width: 90px;">Trên đường</th>
          <th style="width: 90px;">Ở nơi đến</th>
        </tr>
      </thead>
      <tbody>
        ${logsRowsHtml}
      </tbody>
    </table>

    <!-- Bảng tổng hợp chi phí công tác (Khổ ngang 2 bảng song song) -->
    <div style="display: flex; gap: 16px; margin-bottom: 14px;">
      <div style="flex: 1;">
        <table style="width: 100%; border-collapse: collapse;" border="1" cellpadding="5">
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <th colspan="2" style="text-align: left; font-size: 11pt;">II. TỔNG HỢP CHI PHÍ CÔNG TÁC THỰC TẾ</th>
          </tr>
          <tr>
            <td style="padding-left: 8px;">1. Chi phí đi lại (Vé tàu xe, xăng xe):</td>
            <td style="text-align: right; font-weight: bold; padding-right: 8px; width: 120px;">${formatVND(cost.travel)}</td>
          </tr>
          <tr>
            <td style="padding-left: 8px;">2. Chi phí lưu trú khách sạn:</td>
            <td style="text-align: right; font-weight: bold; padding-right: 8px;">${formatVND(cost.lodging)}</td>
          </tr>
          <tr>
            <td style="padding-left: 8px;">3. Phụ cấp công tác / Tiền ăn:</td>
            <td style="text-align: right; font-weight: bold; padding-right: 8px;">${formatVND(cost.perDiem)}</td>
          </tr>
          <tr>
            <td style="padding-left: 8px;">4. Chi phí tiếp khách & đối tác:</td>
            <td style="text-align: right; font-weight: bold; padding-right: 8px;">${formatVND(cost.hospitality)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #fafafa;">
            <td style="padding-left: 8px; text-transform: uppercase;">Tổng cộng chi phí:</td>
            <td style="text-align: right; padding-right: 8px; font-size: 11.5pt;">${formatVND(totalCost)}</td>
          </tr>
        </table>
      </div>

      <div style="flex: 1;">
        <table style="width: 100%; border-collapse: collapse; height: 100%;" border="1" cellpadding="5">
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <th colspan="2" style="text-align: left; font-size: 11pt;">III. PHẦN DUYỆT THANH TOÁN CỦA CÔNG TY</th>
          </tr>
          <tr>
            <td style="padding-left: 8px;">- Tiền tạm ứng trước chuyến đi:</td>
            <td style="text-align: right; font-weight: bold; padding-right: 8px; width: 120px;">${formatVND(d.advanceTravelCost || 0)}</td>
          </tr>
          <tr>
            <td style="padding-left: 8px;">- Số ngày lưu trú được hưởng phụ cấp:</td>
            <td style="text-align: right; font-weight: bold; padding-right: 8px;">${d.approvedStayDays || 5} ngày</td>
          </tr>
          <tr style="font-weight: bold; background-color: #e6fffa;">
            <td style="padding-left: 8px; color: #006964; text-transform: uppercase;">Số tiền thực thanh toán:</td>
            <td style="text-align: right; padding-right: 8px; font-size: 12pt; color: #006964;">${formatVND(d.approvedAmount || totalCost)}</td>
          </tr>
          <tr>
            <td colspan="2" style="font-size: 10.5pt; font-style: italic; padding: 6px 8px;">
              Bằng chữ: ${numberToVietnameseWords(d.approvedAmount || totalCost)}.
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Khối 4 Chữ Ký Khổ Ngang Cân Đối -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; page-break-inside: avoid;" border="0">
      <tr>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">NGƯỜI ĐI CÔNG TÁC</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 55px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.officerName}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">TRƯỞNG BỘ PHẬN</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 55px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.departmentHeadName || 'Lê Trí Nam'}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">TRƯỞNG PHÒNG KẾ TOÁN</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 55px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.chiefAccountantName || 'Đào Thị Hồng'}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">THỦ TRƯỞNG ĐƠN VỊ DUYỆT</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký tên, đóng dấu)</div>
          <div style="height: 55px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.directorName || 'Nguyễn Hữu Thi'}</div>
        </td>
      </tr>
    </table>
  `;
}

// 5. Giấy Thanh Toán Tạm Ứng (Portrait - Mẫu 04-TT)
function generateFormThanhToanTamUngHtml(d) {
  const advancePrev = Number(d.advancePrevious || 0);
  const advanceThis = Number(d.advanceThisPeriod || 0);
  const totalAdvance = advancePrev + advanceThis;

  const actualList = d.actualExpenses || [];
  const totalSpent = actualList.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const diffUnspent = Math.max(0, totalAdvance - totalSpent);
  const diffOverspent = Math.max(0, totalSpent - totalAdvance);

  const actualRowsHtml = actualList.map((item, idx) => `
    <tr>
      <td style="padding-left: 20px;">${item.item}</td>
      <td style="text-align: right; font-weight: bold; padding-right: 12px; width: 150px;">${formatVND(item.amount)}</td>
    </tr>
  `).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
      <div style="text-align: left; width: 50%;">
        <div style="font-weight: bold; font-size: 12pt; text-transform: uppercase;">CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM</div>
        <div style="font-size: 11pt;">Bộ phận: ${d.department}</div>
      </div>

      <div style="text-align: right; width: 45%;">
        <div style="font-weight: bold; font-size: 12pt;">Mẫu số: 04 - TT</div>
        <div style="font-size: 10.5pt; font-style: italic; color: #444;">
          (Ban hành theo Thông tư số 200/2014/TT-BTC của Bộ Tài Chính)
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 20px 0 16px 0;">
      <div style="font-size: 17pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">GIẤY THANH TOÁN TẠM ỨNG</div>
      <div style="font-size: 12pt; font-style: italic; margin-top: 4px;">
        Ngày ${formatDate(d.docDate)} • Số: ${d.docCode || '04-TT/2026'}
      </div>
    </div>

    <div style="margin-bottom: 14px;">
      <div style="margin-bottom: 6px;"><strong>Họ và tên người thanh toán:</strong> <span style="font-weight: bold; text-transform: uppercase;">${d.requesterName}</span></div>
      <div style="margin-bottom: 6px;"><strong>Bộ phận (hoặc địa chỉ):</strong> ${d.department}</div>
      <div style="margin-bottom: 6px;"><strong>Số tiền tạm ứng được thanh toán theo bảng đối chiếu dưới đây:</strong></div>
    </div>

    <!-- Bảng 3 Phần Chuẩn Kế Toán -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f3f4f6; font-weight: bold; text-align: center; font-size: 12pt;">
          <th>Diễn Giải Nội Dung Quyết Toán</th>
          <th style="width: 160px;">Số Tiền (VNĐ)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #f9fafb; font-weight: bold;">
          <td colspan="2">I. SỐ TIỀN TẠM ỨNG:</td>
        </tr>
        <tr>
          <td style="padding-left: 20px;">1. Số tạm ứng các kỳ trước chưa chi hết:</td>
          <td style="text-align: right; padding-right: 12px;">${formatVND(advancePrev)}</td>
        </tr>
        <tr>
          <td style="padding-left: 20px;">2. Số tạm ứng kỳ này (${d.paymentVoucherNumber || 'Phiếu chi công tác'}):</td>
          <td style="text-align: right; padding-right: 12px;">${formatVND(advanceThis)}</td>
        </tr>
        <tr style="font-weight: bold; background-color: #f3f4f6;">
          <td style="text-align: right; padding-right: 12px;">CỘNG SỐ TIỀN TẠM ỨNG (I):</td>
          <td style="text-align: right; padding-right: 12px; color: #000;">${formatVND(totalAdvance)}</td>
        </tr>

        <tr style="background-color: #f9fafb; font-weight: bold;">
          <td colspan="2">II. SỐ TIỀN ĐÃ THỰC CHI THEO CHỨNG TỪ KÈM THEO:</td>
        </tr>
        ${actualRowsHtml}
        <tr style="font-weight: bold; background-color: #f3f4f6;">
          <td style="text-align: right; padding-right: 12px;">CỘNG SỐ TIỀN ĐÃ CHI (II):</td>
          <td style="text-align: right; padding-right: 12px; color: #000;">${formatVND(totalSpent)}</td>
        </tr>

        <tr style="background-color: #f9fafb; font-weight: bold;">
          <td colspan="2">III. CHÊNH LỆCH THANH TOÁN:</td>
        </tr>
        <tr>
          <td style="padding-left: 20px; font-weight: ${diffUnspent > 0 ? 'bold' : 'normal'}; color: ${diffUnspent > 0 ? '#b91c1c' : '#111'};">
            1. Số tạm ứng chi không hết (nộp lại quỹ công ty) [ I - II ]:
          </td>
          <td style="text-align: right; padding-right: 12px; font-weight: bold;">${formatVND(diffUnspent)}</td>
        </tr>
        <tr>
          <td style="padding-left: 20px; font-weight: ${diffOverspent > 0 ? 'bold' : 'normal'}; color: ${diffOverspent > 0 ? '#006964' : '#111'};">
            2. Chi quá số tạm ứng (công ty hoàn trả thêm cho người tạm ứng) [ II - I ]:
          </td>
          <td style="text-align: right; padding-right: 12px; font-weight: bold;">${formatVND(diffOverspent)}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-bottom: 8px;">
      <strong>Kết luận thanh toán:</strong> ${diffUnspent > 0 
        ? `Người tạm ứng phải nộp lại quỹ số tiền: <strong>${formatVND(diffUnspent)}</strong> (${numberToVietnameseWords(diffUnspent)}).`
        : diffOverspent > 0 
          ? `Công ty chi trả bổ sung cho người tạm ứng số tiền: <strong>${formatVND(diffOverspent)}</strong> (${numberToVietnameseWords(diffOverspent)}).`
          : 'Số tiền tạm ứng vừa vặn với số thực chi (Cân bằng quyết toán).'
      }
    </div>

    <div style="margin-bottom: 24px; font-style: italic; font-size: 11.5pt;">
      (Kèm theo ${d.attachmentCount || 7} chứng từ gốc và hóa đơn VAT hợp lệ).
    </div>

    <!-- Khối 4 Chữ Ký Chuẩn Mẫu 04-TT -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 24px; page-break-inside: avoid;" border="0">
      <tr>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">NGƯỜI ĐỀ NGHỊ</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.requesterName}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">KẾ TOÁN THANH TOÁN</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.paymentAccountantName || 'Nguyễn Thị Thùy'}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">KẾ TOÁN TRƯỞNG</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.chiefAccountantName || 'Đào Thị Hồng'}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">THỦ TRƯỞNG ĐƠN VỊ</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký tên, đóng dấu)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.directorName || 'Nguyễn Hữu Thi'}</div>
        </td>
      </tr>
    </table>
  `;
}

// 6. Giấy Đề Nghị Thanh Toán Chi Phí (Portrait)
function generateFormDeNghiThanhToanHtml(d) {
  const rows = d.expenseRows || [];
  const totalAmount = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const rowsHtml = rows.map((r, idx) => `
    <tr>
      <td style="text-align: center; width: 40px;">${r.stt || idx + 1}</td>
      <td style="text-align: center; width: 95px;">${r.date || ''}</td>
      <td style="text-align: center; width: 90px; font-weight: 500;">${r.voucherNo || ''}</td>
      <td style="text-align: left; padding-left: 8px;">${r.description}</td>
      <td style="text-align: left; padding-left: 8px; width: 170px; font-size: 11pt;">${r.supplier || ''}</td>
      <td style="text-align: right; font-weight: bold; padding-right: 8px; width: 120px;">${formatVND(r.amount)}</td>
      <td style="font-size: 10.5pt; padding-left: 6px; width: 110px;">${r.note || ''}</td>
    </tr>
  `).join('');

  return `
    ${renderDecree30Header(d.requestCode, d.location, d.docDate, 'Số phiếu:')}

    <div style="text-align: center; margin: 20px 0 16px 0;">
      <div style="font-size: 17pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">GIẤY ĐỀ NGHỊ THANH TOÁN</div>
      <div style="font-size: 12pt; font-style: italic; margin-top: 4px;">(V/v: Thanh toán các khoản chi phí phát sinh phục vụ hoạt động công ty)</div>
    </div>

    <div style="margin-bottom: 16px; font-style: italic; text-align: center;">
      <strong>Kính gửi:</strong> Ban Giám Đốc Công ty & Phòng Kế toán - Tài chính
    </div>

    <div style="margin-bottom: 14px;">
      <div style="margin-bottom: 6px;"><strong>Họ và tên người đề nghị thanh toán:</strong> <span style="font-weight: bold; text-transform: uppercase;">${d.requesterName}</span></div>
      <div style="margin-bottom: 6px;"><strong>Bộ phận (hoặc địa chỉ):</strong> ${d.department}</div>
      <div style="margin-bottom: 6px;"><strong>Nội dung thanh toán:</strong> ${d.purpose}</div>
    </div>

    <div style="margin-top: 14px; margin-bottom: 8px; font-weight: bold; font-size: 12.5pt;">
      Bảng Kê Hóa Đơn & Chứng Từ Gốc Thanh Toán:
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;" border="1" cellpadding="6">
      <thead>
        <tr style="background-color: #f3f4f6; font-weight: bold; text-align: center; font-size: 11.5pt;">
          <th style="width: 40px;">STT</th>
          <th style="width: 95px;">Ngày Tháng</th>
          <th style="width: 90px;">Số Chứng Từ</th>
          <th>Nội Dung Thanh Toán</th>
          <th style="width: 170px;">Đơn Vị Bán Hàng</th>
          <th style="width: 120px;">Số Tiền (VNĐ)</th>
          <th style="width: 110px;">Ghi Chú</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="font-weight: bold; background-color: #fafafa; font-size: 12.5pt;">
          <td colspan="5" style="text-align: right; padding-right: 12px; text-transform: uppercase;">Tổng cộng tiền đề nghị thanh toán:</td>
          <td style="text-align: right; padding-right: 8px; color: #000;">${formatVND(totalAmount)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-bottom: 8px;">
      <strong>Số tiền viết bằng chữ:</strong> <span style="font-style: italic; font-weight: bold;">${numberToVietnameseWords(totalAmount)}</span>.
    </div>

    <div style="margin-bottom: 24px; font-style: italic; font-size: 11.5pt;">
      (Kèm theo ${d.attachmentCount || 6} hóa đơn, chứng từ gốc hợp lệ).
    </div>

    <!-- Khối 4 Chữ Ký Cân Đối -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 24px; page-break-inside: avoid;" border="0">
      <tr>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">NGƯỜI ĐỀ NGHỊ</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.requesterName}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">KẾ TOÁN THANH TOÁN</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.paymentAccountantName || 'Nguyễn Thị Thùy'}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">KẾ TOÁN TRƯỞNG</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.chiefAccountantName || 'Đào Thị Hồng'}</div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">NGƯỜI DUYỆT (GIÁM ĐỐC)</div>
          <div style="font-style: italic; font-size: 10.5pt; margin-top: 2px;">(Ký tên, đóng dấu)</div>
          <div style="height: 60px;"></div>
          <div style="font-weight: bold; font-size: 11.5pt;">${d.directorName || 'Nguyễn Hữu Thi'}</div>
        </td>
      </tr>
    </table>
  `;
}
