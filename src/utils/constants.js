export const ROLES = {
  STAFF: { id: 'STAFF', label: 'Nhân viên', description: 'Nhân viên kinh doanh chính thức' },
  CTV: { id: 'CTV', label: 'Cộng tác viên', description: 'Cộng tác viên bán hàng' },
  PARTNER: { id: 'PARTNER', label: 'Đối tác', description: 'Đối tác kinh doanh / đại lý' },
  MANAGER: { id: 'MANAGER', label: 'Quản lý vùng (Manager)', description: 'Sales Manager quản lý đội ngũ' },
  ACCOUNTING: { id: 'ACCOUNTING', label: 'Kế toán', description: 'Xử lý chi tạm ứng & thanh toán' },
  DIRECTOR: { id: 'DIRECTOR', label: 'Ban giám đốc', description: 'Phê duyệt hợp đồng & đề nghị lớn' },
  ADMIN: { id: 'ADMIN', label: 'Quản trị hệ thống', description: 'Cấu hình workflow & người dùng' }
};

export const PERSON_TYPES = {
  EMPLOYEE: 'Nhân viên chính thức',
  CTV: 'Cộng tác viên bán hàng',
  BUSINESS_PARTNER: 'Đối tác kinh doanh'
};

export const PERSON_STATUS = {
  ONBOARDING: 'Đang tiếp nhận',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm ngưng',
  ENDED: 'Đã kết thúc'
};

export const REQUEST_TYPES = {
  BUSINESS_TRIP: { id: 'BUSINESS_TRIP', label: 'Đề nghị công tác', icon: '✈️', color: 'var(--gf-primary)' },
  ADVANCE: { id: 'ADVANCE', label: 'Đề nghị tạm ứng', icon: '💰', color: '#0284c7' },
  PAYMENT: { id: 'PAYMENT', label: 'Đề nghị thanh toán', icon: '🧾', color: '#7c3aed' },
  SETTLEMENT: { id: 'SETTLEMENT', label: 'Hoàn ứng / Quyết toán', icon: '⚖️', color: '#d97706' },
  SAMPLE: { id: 'SAMPLE', label: 'Đề nghị xuất mẫu', icon: '📦', color: '#059669' }
};

export const DEFAULT_BONUS_TIERS = [
  { level: 'Mức 1', revenueMin: 120000000, revenueMax: 200000000, allowance: 1000000, bonusPercent: 1.0 },
  { level: 'Mức 2', revenueMin: 201000000, revenueMax: 300000000, allowance: 2000000, bonusPercent: 1.5 },
  { level: 'Mức 3', revenueMin: 301000000, revenueMax: 500000000, allowance: 3000000, bonusPercent: 2.0 },
  { level: 'Mức 4', revenueMin: 501000000, revenueMax: 0, allowance: 5000000, bonusPercent: 4.0 }
];

export const INITIAL_PEOPLE = [
  {
    id: 'P-001',
    genderTitle: 'Ông',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@genkifami.vn',
    dateOfBirth: '1995-04-12',
    address: '124 Hoàng Hoa Thám, Ba Đình, Hà Nội',
    currentAddress: 'Số 18 Ngõ 68 Đội Cấn, Ba Đình, Hà Nội',
    identityNumber: '001095012345',
    identityDate: '15/06/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8012345678',
    bankName: 'Vietcombank',
    bankBranch: 'Chi nhánh Ba Đình - Hà Nội',
    bankAccount: '001100456789',
    bankAccountName: 'NGUYEN VAN AN',
    personType: 'CTV',
    role: 'CTV',
    managerId: 'P-003',
    region: 'Miền Bắc',
    position: 'Cộng tác viên Dược - Nhà thuốc',
    startDate: '2025-01-15',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-ctv-an-nguyen'
  },
  {
    id: 'P-002',
    genderTitle: 'Bà',
    fullName: 'Trần Thị Bích',
    phone: '0912345678',
    email: 'bich.tran@genkifami.vn',
    dateOfBirth: '1993-08-20',
    address: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    currentAddress: 'Chung cư Masteri Thảo Điền, Quận 2, TP. Thủ Đức, TP. HCM',
    identityNumber: '079093012999',
    identityDate: '20/09/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8098765432',
    bankName: 'Techcombank',
    bankBranch: 'Chi nhánh Sài Gòn',
    bankAccount: '19034567890123',
    bankAccountName: 'TRAN THI BICH',
    personType: 'EMPLOYEE',
    role: 'STAFF',
    managerId: 'P-003',
    region: 'Miền Nam',
    position: 'Chuyên viên Phát triển Thị trường',
    startDate: '2024-03-01',
    endDate: '2027-03-01',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-staff-bich-tran'
  },
  {
    id: 'P-003',
    genderTitle: 'Ông',
    fullName: 'Lê Văn Cường',
    phone: '0987654321',
    email: 'cuong.le@genkifami.vn',
    dateOfBirth: '1988-11-05',
    address: '78 Nguyễn Thị Minh Khai, Hải Châu, Đà Nẵng',
    currentAddress: '78 Nguyễn Thị Minh Khai, Hải Châu, Đà Nẵng',
    identityNumber: '048088001122',
    identityDate: '10/03/2022',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8123456789',
    bankName: 'BIDV',
    bankBranch: 'Chi nhánh Hải Châu - Đà Nẵng',
    bankAccount: '56110001234567',
    bankAccountName: 'LE VAN CUONG',
    personType: 'EMPLOYEE',
    role: 'MANAGER',
    managerId: 'P-005',
    region: 'Toàn quốc',
    position: 'Giám đốc Kinh doanh Vùng (Sales Manager)',
    startDate: '2023-01-01',
    endDate: '2028-01-01',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-mgr-cuong-le'
  },
  {
    id: 'P-004',
    genderTitle: 'Bà',
    fullName: 'Phạm Thị Dung',
    phone: '0934567890',
    email: 'dung.pham@genkifami.vn',
    dateOfBirth: '1990-02-18',
    address: '15 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    currentAddress: '15 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    identityNumber: '001090003344',
    identityDate: '12/12/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8234567890',
    bankName: 'MB Bank',
    bankBranch: 'Chi nhánh Trần Hưng Đạo',
    bankAccount: '0680101234567',
    bankAccountName: 'PHAM THI DUNG',
    personType: 'EMPLOYEE',
    role: 'ACCOUNTING',
    managerId: 'P-005',
    region: 'Trụ sở chính',
    position: 'Kế toán Thanh toán & Tạm ứng',
    startDate: '2023-06-01',
    endDate: '2028-06-01',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-acc-dung-pham'
  },
  {
    id: 'P-005',
    genderTitle: 'Ông',
    fullName: 'Hoàng Văn Em',
    phone: '0909998888',
    email: 'em.hoang@genkifami.vn',
    dateOfBirth: '1982-05-10',
    address: '88 Nam Kỳ Khởi Nghĩa, Quận 3, TP. Hồ Chí Minh',
    currentAddress: '88 Nam Kỳ Khởi Nghĩa, Quận 3, TP. Hồ Chí Minh',
    identityNumber: '079082005566',
    identityDate: '05/01/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8345678901',
    bankName: 'Vietcombank',
    bankBranch: 'Chi nhánh TP. HCM',
    bankAccount: '007100999888',
    bankAccountName: 'HOANG VAN EM',
    personType: 'EMPLOYEE',
    role: 'DIRECTOR',
    managerId: null,
    region: 'Toàn quốc',
    position: 'Tổng Giám Đốc (Director)',
    startDate: '2022-01-01',
    endDate: '2030-01-01',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-director-board'
  },
  {
    id: 'P-006',
    genderTitle: 'Công ty',
    fullName: 'Công Ty Dược Phẩm An Khang (Đại Lý)',
    phone: '02838383838',
    email: 'lienhe@ankhangpharma.com',
    dateOfBirth: '',
    address: '256 Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh',
    currentAddress: '256 Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh',
    identityNumber: '',
    identityDate: '',
    identityPlace: '',
    taxNumber: '0301234567',
    bankName: 'ACB',
    bankBranch: 'Chi nhánh Chợ Lớn',
    bankAccount: '8888999912',
    bankAccountName: 'CTY CP DUOC PHAM AN KHANG',
    personType: 'BUSINESS_PARTNER',
    role: 'PARTNER',
    managerId: 'P-003',
    region: 'Miền Nam',
    position: 'Đại lý phân phối cấp 1',
    startDate: '2024-06-01',
    endDate: '2026-06-01',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-partner-ankhang'
  },
  {
    id: 'P-007',
    genderTitle: 'Ông',
    fullName: 'Quản Trị Viên Hệ Thống',
    phone: '0900000000',
    email: 'admin@genkifami.vn',
    dateOfBirth: '1990-01-01',
    address: 'Trụ sở Genki Fami',
    currentAddress: 'Trụ sở Genki Fami',
    identityNumber: '001090000001',
    identityDate: '01/01/2021',
    identityPlace: 'Cục Cảnh sát QLHC về TTXH',
    taxNumber: '8000000001',
    bankName: 'Vietcombank',
    bankBranch: 'Hà Nội',
    bankAccount: '001100000001',
    bankAccountName: 'ADMIN GENKI',
    personType: 'EMPLOYEE',
    role: 'ADMIN',
    managerId: null,
    region: 'Hệ thống',
    position: 'System Administrator',
    startDate: '2022-01-01',
    endDate: '2030-01-01',
    status: 'ACTIVE',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-admin-system'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'Hệ Thống Nhà Thuốc Long Châu - CN 124 Ba Đình',
    customerType: 'Nhà thuốc chuỗi',
    region: 'Miền Bắc',
    address: '124 Đội Cấn, Ba Đình, Hà Nội',
    contactPerson: 'Dược sĩ Nguyễn Thị Mai',
    phone: '0981112233',
    email: 'lc.ba_dinh@fpt.com.vn',
    ownerId: 'P-001', // An phụ trách
    createdBy: 'P-001',
    status: 'ACTIVE',
    notes: 'Đã nhập mẫu thử Fucoidan & Viên uống bổ não Genki Fami',
    externalSalesAppUrl: 'https://sales.genkifami.vn/customers/CUST-001'
  },
  {
    id: 'CUST-002',
    name: 'Nhà Thuốc PharmaCity - CN Hai Bà Trưng',
    customerType: 'Nhà thuốc chuỗi',
    region: 'Miền Bắc',
    address: '89 Phố Huế, Hai Bà Trưng, Hà Nội',
    contactPerson: 'Dược sĩ Lê Tuấn',
    phone: '0972223344',
    email: 'pmc.phohue@pharmacity.vn',
    ownerId: 'P-001',
    createdBy: 'P-001',
    status: 'ACTIVE',
    notes: 'Khách hàng trọng điểm khu vực trung tâm',
    externalSalesAppUrl: 'https://sales.genkifami.vn/customers/CUST-002'
  },
  {
    id: 'CUST-003',
    name: 'Phòng Khám Đa Khoa Quốc Tế Sài Gòn',
    customerType: 'Phòng khám & Bệnh viện',
    region: 'Miền Nam',
    address: '9 Trịnh Văn Cấn, Cầu Ông Lãnh, Quận 1, TP. HCM',
    contactPerson: 'Bác sĩ Trần Hữu Phước',
    phone: '0918889900',
    email: 'dr.phuoc@saigonclinic.vn',
    ownerId: 'P-002', // Bích phụ trách
    createdBy: 'P-002',
    status: 'ACTIVE',
    notes: 'Đang đề xuất hợp tác gói dinh dưỡng người cao tuổi',
    externalSalesAppUrl: 'https://sales.genkifami.vn/customers/CUST-003'
  },
  {
    id: 'CUST-004',
    name: 'Nhà Thuốc Minh Châu - Bình Thạnh',
    customerType: 'Nhà thuốc tư nhân',
    region: 'Miền Nam',
    address: '412 Bạch Đằng, Phường 14, Bình Thạnh, TP. HCM',
    contactPerson: 'DS. Hoàng Minh Châu',
    phone: '0903334455',
    email: 'nhathuocminhchau@gmail.com',
    ownerId: 'P-002',
    createdBy: 'P-002',
    status: 'ACTIVE',
    notes: 'Ký hợp đồng đối tác bán lẻ thường xuyên',
    externalSalesAppUrl: 'https://sales.genkifami.vn/customers/CUST-004'
  },
  {
    id: 'CUST-005',
    name: 'Trung Tâm Chăm Sóc Sức Khỏe Sen Vàng',
    customerType: 'Spa & Wellness Center',
    region: 'Miền Trung',
    address: '34 Bạch Đằng, Hải Châu, Đà Nẵng',
    contactPerson: 'Chị Đặng Thu Hà',
    phone: '0935556677',
    email: 'senvang.danang@gmail.com',
    ownerId: 'P-003', // Cường phụ trách
    createdBy: 'P-003',
    status: 'ACTIVE',
    notes: 'Đối tác phân phối sản phẩm collagen cao cấp Genki',
    externalSalesAppUrl: 'https://sales.genkifami.vn/customers/CUST-005'
  }
];

export const INITIAL_TEMPLATES = [
  {
    id: 'TPL-HTKD',
    name: 'Hợp Đồng Hợp Tác Kinh Doanh (Chuẩn Genki Fami)',
    description: 'Mẫu chuẩn trích xuất từ hợp đồng thực tế Genki Fami: Cơ chế PCB + PKT, KPI tháng, Thưởng lũy tiến %, Thưởng Quý, Thưởng Năm.',
    category: 'Hợp Tác Kinh Doanh',
    active: true,
    templateContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG HỢP TÁC KINH DOANH
Số: {{contract_code}}

- Căn cứ Bộ luật Dân sự số 91/2015/QH13 đã được Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam thông qua ngày 24/11/2015 và có hiệu lực từ ngày 01/01/2017;
- Căn cứ nhu cầu và khả năng của hai bên.

Hôm nay, ngày {{contract_sign_day}} tháng {{contract_sign_month}} năm {{contract_sign_year}}, tại Văn phòng Công ty Cổ phần Genki Fami Việt Nam, chúng tôi gồm có:

BÊN A (Khách hàng): CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM
- Đại diện: Ông LÊ TRÍ NAM - Chức vụ: Giám đốc Kinh Doanh
- Địa chỉ: Tầng 4, Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Mỹ Đình 2, Nam Từ Liêm, Hà Nội
- Mã số thuế: 0109405781
- Điện thoại: 024.6291.6888

BÊN B (Chuyên gia/Đối tác): {{gender_title}} {{full_name}}
- Ngày sinh: {{date_of_birth}}
- CCCD số: {{identity_number}}   Ngày cấp: {{identity_date}}   Nơi cấp: {{identity_place}}
- Địa chỉ thường trú: {{address}}
- Nơi ở hiện tại: {{current_address}}
- Điện thoại: {{phone}}   Email: {{email}}
- Mã số thuế: {{tax_number}}
- Số tài khoản: {{bank_account}}   Tại Ngân hàng: {{bank_name}} - Chi nhánh {{bank_branch}}

Hai bên cùng thỏa thuận và nhất trí ký kết Hợp đồng Hợp tác Kinh doanh với các điều khoản sau:

ĐIỀU 1. NỘI DUNG VÀ PHẠM VI CÔNG VIỆC
1. Bên A đồng ý hợp tác và Bên B đồng ý nhận thực hiện công việc tư vấn, phát triển thị trường, kết nối đối tác phân phối sản phẩm thực phẩm bảo vệ sức khỏe và dinh dưỡng cao cấp thương hiệu Genki Fami Nhật Bản.
2. Địa bàn phát triển kinh doanh: {{territory}}
3. Mục tiêu công việc: Xây dựng mạng lưới nhà thuốc, đại lý và khách hàng chiến lược; đạt chỉ tiêu KPI theo thỏa thuận.

ĐIỀU 2. THỜI HẠN HỢP ĐỒNG
1. Hợp đồng có hiệu lực từ ngày {{start_date}} đến hết ngày {{end_date}}.
2. Thời gian thử thách năng lực thực tế: {{probation_months}} tháng kể từ ngày bắt đầu có hiệu lực.
3. Hết thời hạn hợp đồng, nếu hai bên có nhu cầu tiếp tục hợp tác sẽ tiến hành gia hạn bằng phụ lục hoặc hợp đồng mới.

ĐIỀU 3. QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
1. Quyền và nghĩa vụ của Bên A:
- Cung cấp đầy đủ thông tin, hồ sơ công bố chất lượng sản phẩm, hóa đơn và chính sách bán hàng.
- Thanh toán đầy đủ thù lao và các khoản thưởng kinh doanh cho Bên B theo đúng quy định tại Phụ Lục 01.
- Khấu trừ thuế Thu nhập cá nhân (TNCN) theo quy định của pháp luật trước khi chi trả.
2. Quyền và nghĩa vụ của Bên B:
- Thực hiện công việc đúng cam kết, giữ gìn uy tín và hình ảnh thương hiệu Genki Fami.
- Tuân thủ bảng giá niêm yết và chính sách chiết khấu của Công ty, không bán phá giá dưới mọi hình thức.
- Báo cáo kết quả tiếp cận thị trường và danh sách khách hàng định kỳ cho Quản lý vùng.

ĐIỀU 4. THÙ LAO VÀ PHƯƠNG THỨC THANH TOÁN
1. Cơ chế chi trả thù lao cố định (PCB), phí hỗ trợ khai thác (PKT), chỉ tiêu doanh thu KPI tháng, thang thưởng bậc thang doanh số, thưởng Quý và thưởng Năm được quy định chi tiết tại Phụ Lục 01 đính kèm.
2. Phương thức thanh toán: Chuyển khoản ngân hàng vào tài khoản của Bên B vào ngày 10-15 hàng tháng.
3. Hợp đồng này là hợp đồng dịch vụ theo Bộ luật Dân sự, không cấu thành quan hệ lao động giữa hai bên.

ĐIỀU 5. ĐIỀU KHOẢN THI HÀNH
1. Hợp đồng có hiệu lực kể từ ngày ký. Mọi sửa đổi, bổ sung phải được lập thành văn bản (Phụ lục hợp đồng).
2. Trường hợp phát sinh tranh chấp, hai bên ưu tiên thương lượng giải quyết trên tinh thần hợp tác. Nếu không tự giải quyết được, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại Hà Nội.
3. Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.

----------------------------------------------------------------------------------------------------
PHỤ LỤC 01: CƠ CHẾ CHI TRẢ THÙ LAO VÀ THƯỞNG KINH DOANH
(Ban hành kèm theo Hợp đồng số: {{contract_code}})

1. Phí dịch vụ cơ bản (PCB): {{salary}} VNĐ/tháng
   (Bằng chữ: {{salary_in_words}})
2. Phí hỗ trợ khai thác thị trường (PKT): {{allowance}} VNĐ/tháng
   (Bằng chữ: {{allowance_in_words}})
3. Chỉ tiêu doanh thu KPI tối thiểu: {{kpi_target}} VNĐ/tháng
   (Bằng chữ: {{kpi_target_in_words}})
4. Cơ chế thưởng theo bậc doanh thu đạt chuẩn tháng:
{{bonus_tiers_text}}
5. Cơ chế thưởng Quý: Bên B được thưởng {{quarter_bonus_rate}}% trên tổng doanh thu thực tế của cả quý khi doanh số quý đạt tối thiểu 500.000.000 VNĐ.
6. Cơ chế thưởng Năm: Bên B được thưởng {{year_bonus_rate}}% trên tổng doanh số lũy kế cả năm khi hoàn thành xuất sắc chỉ tiêu và có thời gian công tác từ 6 tháng trở lên trong năm tài chính.

          ĐẠI DIỆN BÊN A                                         ĐẠI DIỆN BÊN B
   (Ký, ghi rõ họ tên và đóng dấu)                           (Ký và ghi rõ họ tên)



             LÊ TRÍ NAM                                          {{full_name}}`
  },
  {
    id: 'TPL-HDLD',
    name: 'Hợp Đồng Lao Động Chuẩn (Genki Fami)',
    description: 'Mẫu chuẩn trích xuất từ hồ sơ HĐLĐ thực tế Genki Fami: Lương chức danh BHXH + Thưởng hiệu suất + Phụ cấp ăn ca 730k + Cam kết bảo mật 24 tháng + Bảng mô tả công việc (JD).',
    category: 'Hợp Đồng Lao Động',
    active: true,
    templateContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
----------o0o----------

HỢP ĐỒNG LAO ĐỘNG
Số: {{contract_code}}
(Căn cứ Bộ luật Lao động số 45/2019/QH14 và Thông tư số 26/2016/TT-BLĐTBXH)

Chúng tôi, một bên là: Ông TRẦN HẢI BẰNG
Chức vụ: Tổng Giám đốc
Đại diện cho: Công ty CP Genki Fami Việt Nam
Địa chỉ: Số 107 ngõ 192 Lê Trọng Tấn, tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội.

Và một bên là: {{gender_title}} {{full_name}}
Sinh ngày: {{date_of_birth}}
Nghề nghiệp: {{position}}
Địa chỉ thường trú: {{address}}
CCCD số: {{identity_number}} do {{identity_place}} cấp ngày {{identity_date}}
Điện thoại: {{phone}}   Email: {{email}}

Thoả thuận ký kết Hợp đồng lao động và cam kết làm đúng những điều khoản sau đây:

Điều 1: {{gender_title}} {{full_name}} làm việc theo loại Hợp đồng lao động thời hạn {{contract_duration}}.
- Bắt đầu từ ngày: {{start_date}} đến hết ngày: {{end_date}}.
- Thời gian thử việc: {{probation_period}} (Hưởng 85% lương).
- Tại địa điểm: {{work_location}}.
- Chức danh chuyên môn: {{job_title}}.
- Công việc phải làm: Theo bảng mô tả công việc đính kèm tại Trang 2.

Điều 2: Chế độ làm việc:
- Thời giờ làm việc: {{work_hours}}.
- Được cấp phát những dụng cụ: Cần thiết theo yêu cầu công việc.
- Điều kiện an toàn và vệ sinh lao động tại nơi làm việc theo quy định hiện hành của Nhà nước.

Điều 3: Nghĩa vụ và các quyền lợi của người lao động:
1. Quyền lợi:
- Phương tiện đi lại làm việc: Cá nhân tự túc;
- Lương chức danh: {{base_salary}} VNĐ/tháng (Bằng chữ: {{base_salary_in_words}})
- Thưởng hiệu suất: {{performance_bonus}} VNĐ/tháng (Theo chính sách công ty)
- Phụ cấp ăn ca: {{meal_allowance}} VNĐ/tháng (Mức chuẩn 730.000 VNĐ theo Thông tư 26/2016/TT-BLĐTBXH miễn thuế TNCN)
Các phụ cấp, chi phí và thưởng đã bao gồm Thuế thu nhập cá nhân do người lao động chi trả.
- Hình thức trả lương: Trả 01 lần vào ngày 05 hàng tháng hoặc theo quy định công ty từng thời kỳ.
- Các phụ cấp, chi phí và thưởng gộp khác: Theo chính sách của Công ty.
- Tiền thưởng: Theo quy định của Công ty.
- Chế độ nâng lương: Theo chính sách của Công ty.
- Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp: Theo quy định của pháp luật hiện hành.
- Nghỉ hàng tuần: {{weekly_rest}}.
- Chế độ đào tạo: Theo quy định của Công ty và yêu cầu công việc. Trong trường hợp NV được cử đi đào tạo thì NV phải hoàn thành khoá học đúng thời hạn, phải cam kết sẽ phục vụ lâu dài cho Công ty sau khi kết thúc khoá học và được hưởng nguyên lương; các quyền lợi khác như người đi làm. Nếu sau khi kết thúc khóa đào tạo mà nhân viên không tiếp tục hợp tác với Công ty thì nhân viên phải hoàn trả lại 100% phí đào tạo và các khoản chế độ đã được nhận trong thời gian đào tạo.
- Những thoả thuận khác:
+ Trong vòng 15 ngày (làm việc) kể từ ngày ký kết hợp đồng này, vì bất cứ lý do gì mà người lao động không tiếp tục cộng tác với công ty (kể cả trong trường hợp công ty thông báo chấm dứt hợp đồng lao động trước thời hạn) thì người lao động cam kết sẽ không yêu cầu công ty phải thanh toán bất cứ chế độ và quyền lợi nào của người lao động trong thời gian nêu trên.
+ Trong trường hợp 1 trong 2 bên muốn chấm dứt hợp đồng trước thời hạn thì phải báo trước cho bên còn lại trước 45 ngày kể từ khi có thông báo.

2. Nghĩa vụ:
- Hoàn thành những nội dung đã cam kết và những công việc trong Hợp đồng;
- Chấp hành nội quy lao động, an toàn lao động, kỷ luật lao động;
- Tuyệt đối không sử dụng khách hàng của công ty để trục lợi cá nhân;
- Trong quá trình làm việc cho Công ty, người lao động không được phép kinh doanh hoặc làm bất cứ công việc gì mâu thuẫn với quyền lợi và lợi ích của Công ty;
- Người lao động phải chấp hành sự phân công, điều động thực hiện những công việc không trái với pháp luật từ người sử dụng lao động;
- Trong thời gian hiệu lực hợp đồng và trong vòng 24 tháng kể từ khi nghỉ việc tại Công ty nhân viên không được phép: Cung cấp thông tin, tiết lộ bí mật kinh doanh của công ty ra ngoài, không được phép hợp tác, sản xuất, kinh doanh, làm đại lý sử dụng, tiết lộ thông tin về khách hàng, mặt hàng, sản phẩm tương tự của Công ty cho bất kỳ tổ chức cá nhân nào nhằm phục vụ công việc riêng cho mình mà chưa được sự đồng ý bằng văn bản từ phía công ty. Trường hợp bị phát hiện – Cá nhân đó sẽ bị khởi tố trước pháp luật.

Điều 4: Nghĩa vụ và quyền hạn của người sử dụng lao động:
1. Nghĩa vụ:
- Bảo đảm việc làm và thực hiện đầy đủ những điều khoản trong hợp đồng;
- Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người lao động theo hợp đồng này;
- Bảo quản văn bằng, chứng chỉ gốc (nếu có) cho nhân viên trong thời gian hiệu lực hợp đồng;
- Hoàn trả lại văn bằng, chứng chỉ gốc (nếu có) cho nhân viên sau khi nhân viên đã hoàn thành các nghĩa vụ đã cam kết tại hợp đồng lao động này.
2. Quyền hạn:
- Điều hành người lao động hoàn thành công việc theo Hợp đồng (bố trí, điều chuyển, tạm ngừng việc);
- Tạm hoãn, chấm dứt hợp đồng lao động, kỷ luật người lao động theo quy định của pháp luật, và nội quy lao động của Công ty.

Điều 5: Điều khoản thi hành:
- Những vấn đề về lao động không ghi trong hợp đồng lao động này thì áp dụng theo quy định của nội quy lao động và pháp luật lao động;
- Hợp đồng lao động này được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản và có hiệu lực kể từ ngày {{start_date}}.
- Hợp đồng làm tại: Số 107 ngõ 192 Lê Trọng Tấn, tổ 1, P. Định Công, Q. Hoàng Mai, TP. Hà Nội.

          ĐẠI DIỆN NGƯỜI LAO ĐỘNG                              ĐẠI DIỆN NGƯỜI SỬ DỤNG LAO ĐỘNG
           (Ký và ghi rõ họ tên)                               (Ký, ghi rõ họ tên và đóng dấu)



               {{full_name}}                                            TRẦN HẢI BẰNG

----------------------------------------------------------------------------------------------------
TRANG 2: BẢNG MÔ TẢ CÔNG VIỆC (JOB DESCRIPTION)
(Đính kèm theo Hợp đồng lao động số: {{contract_code}})

Chức vụ: {{job_title}}
Bộ phận: {{department}}
Báo cáo cho: {{report_to}}

Trách nhiệm chính & Nhiệm vụ cụ thể:
{{jd_tasks}}

Yêu cầu năng lực:
{{jd_requirements}}

Cam đoan nhận việc:
"Tôi đã đọc và được trao đổi với quản lý trực tiếp và tôi hoàn toàn hiểu mô tả về vị trí công việc của tôi."

Tên nhân viên: {{full_name}}
Ngày nhận việc: {{start_date}}
Chữ ký: .......................................`
  },
  {
    id: 'TPL-CTV',
    name: 'Hợp Đồng Hợp Tác Bán Hàng (CTV)',
    description: 'Áp dụng cho cộng tác viên phát triển mạng lưới nhà thuốc',
    category: 'Cộng Tác Viên',
    active: true,
    templateContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG CỘNG TÁC VIÊN BÁN HÀNG
Số: {{contract_code}}

Hôm nay, ngày ký hợp đồng, tại văn phòng CÔNG TY GENKI FAMI VIỆT NAM:
BÊN A (CÔNG TY): CÔNG TY TNHH GENKI FAMI VIỆT NAM
- Đại diện: Ông HOÀNG VĂN EM — Chức vụ: Tổng Giám Đốc

BÊN B (CỘNG TÁC VIÊN):
- Họ và tên: {{full_name}}
- Địa chỉ: {{address}}
- Điện thoại: {{phone}}
- Số CCCD/CMND: {{identity_number}}
- Mã số thuế: {{tax_number}}
- Tài khoản ngân hàng: {{bank_account}}

HAI BÊN THỎA THUẬN CÁC ĐIỀU KHOẢN SAU:
Điều 1. Phạm vi công việc: Bên B làm Cộng tác viên bán hàng và chăm sóc mạng lưới nhà thuốc/đối tác tại địa bàn: {{territory}}.
Điều 2. Thù lao & Phụ cấp:
- Mức thù lao cố định hỗ trợ: {{salary}} / tháng.
- Phụ cấp trách nhiệm: {{allowance}} / tháng.
- Phụ cấp công tác & di chuyển: {{travel_allowance}} / tháng.
- Thưởng hoa hồng: {{commission_desc}}.
Điều 3. Chỉ tiêu định mức (KPIs):
- {{target}}
Điều 4. Thời hạn hợp đồng:
- Từ ngày {{start_date}} đến hết ngày {{end_date}}.

Đại diện Bên A                                    Đại diện Bên B
(Đã ký duyệt trên hệ thống)                       {{full_name}}`
  },
  {
    id: 'TPL-STAFF',
    name: 'Hợp Đồng Lao Động Nhân Viên Kinh Doanh',
    description: 'Hợp đồng lao động chính thức cho Sales Staff',
    category: 'Lao Động Chính Thức',
    active: true,
    templateContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG LAO ĐỘNG KINH DOANH CHÍNH THỨC
Số: {{contract_code}}

Người sử dụng lao động: CÔNG TY TNHH GENKI FAMI VIỆT NAM
Người lao động: {{full_name}} (CCCD: {{identity_number}})
Địa chỉ thường trú: {{address}}

1. Chức danh công việc: Chuyên viên Kinh doanh Vùng ({{territory}}).
2. Lương căn bản: {{salary}} / tháng.
3. Phụ cấp xăng xe & điện thoại: {{allowance}} / tháng.
4. Chế độ công tác phí: {{travel_allowance}}.
5. Thời hạn: Từ {{start_date}} đến {{end_date}}.`
  }
];

export const INITIAL_CONTRACTS = [
  {
    id: 'CTR-2025-HDLD-001',
    contractCode: '100325/HĐLĐ-GENKI',
    personId: 'P-002',
    contractType: 'HDLD',
    templateId: 'TPL-HDLD',
    partyARepresentative: 'Ông Trần Hải Bằng',
    partyAPosition: 'Tổng Giám đốc',
    partyACompany: 'CÔNG TY CỔ PHẦN GENKI FAMI VIỆT NAM',
    startDate: '2025-03-10',
    endDate: '2027-03-09',
    salary: 7491370,
    performanceBonus: 1278630,
    allowance: 1278630,
    mealAllowance: 730000,
    travelAllowance: 0,
    contractDuration: '02 năm',
    probationPeriod: 'Từ ngày 10/03/2025 đến 01/05/2025 (Hưởng 85% lương)',
    workLocation: 'Số 19/48 Nguyễn Cửu Đàm, P Tân Sơn Nhì, Q. Tân Phú, TP Hồ Chí Minh',
    workHours: '48 giờ/tuần',
    weeklyRest: '1,5 ngày (Thứ 7, Chủ Nhật)',
    jobTitle: 'Nhân viên Kho kiêm hỗ trợ kinh doanh',
    department: 'Kho vận & Vận hành',
    reportTo: 'Phụ trách Kho vận & Ban Giám Đốc',
    additionalTerms: 'Cam kết bảo mật thông tin và chống cạnh tranh trong vòng 24 tháng sau khi nghỉ việc.',
    jdTasks: [
      { id: 1, group: '1. Điều phối kho vận & Hàng hóa', desc: 'Kiểm đếm, đóng gói, xuất nhập tồn hàng hóa kho Tân Phú, kiểm soát date sản phẩm Genki Fami, lập biên bản giao nhận.' },
      { id: 2, group: '2. Hỗ trợ kinh doanh & AMIS CRM', desc: 'Tiếp nhận đơn hàng, tạo đề nghị xuất kho trên hệ thống MISA AMIS CRM, phối hợp đơn vị vận chuyển giao hàng đúng hẹn.' },
      { id: 3, group: '3. Công việc khác', desc: 'Báo cáo tồn kho định kỳ hàng tuần/tháng cho Quản lý kho và Ban Giám đốc; tham gia kiểm kê thực tế theo quý.' }
    ],
    status: 'ACTIVE',
    createdBy: 'P-003',
    approvedBy: 'P-005',
    approvedAt: '2025-03-08T09:00:00.000Z',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-contract-hdld-001'
  },
  {
    id: 'CTR-2026-HTKD-001',
    contractCode: '20260601_HĐHT - Nguyễn Văn An_HN',
    personId: 'P-001',
    contractType: 'HTKD',
    templateId: 'TPL-HTKD',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    salary: 8000000,
    allowance: 7000000,
    travelAllowance: 0,
    kpiTargetRevenue: 100000000,
    probationMonths: 3,
    quarterBonusRate: 0.5,
    yearBonusRate: 0.2,
    bonusTiers: DEFAULT_BONUS_TIERS,
    commissionDescription: 'Thưởng bậc thang tháng 1.0% - 4.0% + Thưởng Quý 0.5% + Thưởng Năm 0.2%',
    targetDescription: 'Doanh số tháng tối thiểu 100.000.000đ; mở mới tối thiểu 5 điểm bán dược phẩm/tháng',
    territoryDescription: 'Thị trường Hà Nội và các tỉnh Đồng Bằng Sông Hồng',
    additionalTerms: 'Tuân thủ quy chuẩn hình ảnh thương hiệu và bảng giá niêm yết của Genki Fami.',
    status: 'ACTIVE',
    createdBy: 'P-003',
    approvedBy: 'P-005',
    approvedAt: '2026-05-28T10:00:00.000Z',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-contract-p001'
  },
  {
    id: 'CTR-2026-0001',
    contractCode: 'CTR-2026-0001',
    personId: 'P-001',
    contractType: 'CTV',
    templateId: 'TPL-CTV',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    salary: 8000000,
    allowance: 1500000,
    travelAllowance: 2000000,
    commissionDescription: '3% - 5% trên giá trị xuất hàng thực tế cho nhà thuốc',
    targetDescription: 'Phát triển tối thiểu 15 nhà thuốc hoạt động/tháng tại Ba Đình - Cầu Giấy',
    territoryDescription: 'Hà Nội (Khu vực Ba Đình, Cầu Giấy, Đống Đa)',
    additionalTerms: 'Tuân thủ quy chuẩn hình ảnh thương hiệu và bảng giá niêm yết của Genki Fami.',
    status: 'ACTIVE',
    createdBy: 'P-003',
    approvedBy: 'P-005',
    approvedAt: '2025-12-28T10:00:00.000Z',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-contract-p001'
  },
  {
    id: 'CTR-2026-0002',
    contractCode: 'CTR-2026-0002',
    personId: 'P-002',
    contractType: 'STAFF',
    templateId: 'TPL-STAFF',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    salary: 15000000,
    allowance: 3000000,
    travelAllowance: 4000000,
    commissionDescription: 'Thưởng quý theo % doanh số vùng phụ trách',
    targetDescription: 'Doanh số vùng Miền Nam đạt kế hoạch được giao từng quý',
    territoryDescription: 'Khu vực Miền Nam (TP. HCM, Đồng Nai, Bình Dương)',
    additionalTerms: 'Bảo mật thông tin khách hàng và bí mật kinh doanh.',
    status: 'ACTIVE',
    createdBy: 'P-003',
    approvedBy: 'P-005',
    approvedAt: '2025-12-29T14:30:00.000Z',
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-contract-p002'
  }
];

export const INITIAL_REQUESTS = [
  {
    id: 'REQ-001',
    requestCode: 'TRIP-2026-0001',
    requestType: 'BUSINESS_TRIP',
    requesterId: 'P-001',
    managerId: 'P-003',
    status: 'COMPLETED',
    title: 'Công tác mở rộng thị trường nhà thuốc Hải Phòng & Quảng Ninh',
    description: 'Gặp gỡ 12 nhà thuốc trọng điểm và ký thỏa thuận mẫu thử sản phẩm mới.',
    amount: 5000000,
    customerId: 'CUST-001',
    parentRequestId: null,
    rootRequestId: 'REQ-001',
    payload: {
      destination: 'Hải Phòng & Hạ Long (Quảng Ninh)',
      purpose: 'Tiếp cận chuỗi nhà thuốc tư nhân và thẩm định đối tác phân phối',
      startDate: '2026-09-01',
      endDate: '2026-09-04',
      estimatedCost: 5000000,
      notes: 'Đã hoàn thành chuyến đi và có đầy đủ chứng từ hóa đơn đỏ'
    },
    workflowTemplateId: 'WF-TRIP',
    workflowInstanceId: 'WFI-001',
    currentWorkflowStep: 4,
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-trip-2026-0001-docs',
    externalAppUrl: 'https://scanner.genkifami.vn/trip/TRIP-2026-0001',
    submittedAt: '2026-08-25T08:30:00.000Z',
    completedAt: '2026-08-28T16:00:00.000Z',
    createdAt: '2026-08-25T08:00:00.000Z',
    timeline: [
      { actor: 'Nguyễn Văn An (CTV)', action: 'Tạo đề nghị công tác', timestamp: '2026-08-25T08:00:00.000Z', comment: 'Đề xuất chuyến đi 4 ngày tại Hải Phòng - Quảng Ninh' },
      { actor: 'Nguyễn Văn An (CTV)', action: 'Gửi phê duyệt (Submit)', timestamp: '2026-08-25T08:30:00.000Z', comment: '' },
      { actor: 'Lê Văn Cường (Manager)', action: 'Phê duyệt (Approve)', timestamp: '2026-08-26T10:15:00.000Z', comment: 'Đồng ý kế hoạch tiếp cận 12 nhà thuốc mục tiêu' },
      { actor: 'Hoàng Văn Em (Director)', action: 'Phê duyệt cấp Giám Đốc', timestamp: '2026-08-27T09:00:00.000Z', comment: 'Duyệt kinh phí ước tính 5.000.000đ' },
      { actor: 'Phạm Thị Dung (Kế toán)', action: 'Xác nhận xử lý (Processed)', timestamp: '2026-08-28T16:00:00.000Z', comment: 'Đã sẵn sàng cấp tạm ứng theo quy định' }
    ]
  },
  {
    id: 'REQ-002',
    requestCode: 'ADV-2026-0001',
    requestType: 'ADVANCE',
    requesterId: 'P-001',
    managerId: 'P-003',
    status: 'PAID',
    title: 'Tạm ứng chi phí công tác Hải Phòng - Quảng Ninh (theo TRIP-2026-0001)',
    description: 'Tạm ứng tiền xăng xe, khách sạn và chi phí tiếp khách',
    amount: 5000000,
    customerId: 'CUST-001',
    parentRequestId: 'REQ-001',
    rootRequestId: 'REQ-001',
    payload: {
      relatedTripCode: 'TRIP-2026-0001',
      purpose: 'Tạm ứng vé tàu xe và lưu trú',
      requiredDate: '2026-08-30',
      bankInfo: 'Vietcombank 001100456789 - NGUYEN VAN AN',
      notes: 'Đã nhận chuyển khoản ngày 30/08'
    },
    workflowTemplateId: 'WF-ADVANCE',
    workflowInstanceId: 'WFI-002',
    currentWorkflowStep: 4,
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-adv-2026-0001-docs',
    externalAppUrl: 'https://banking.genkifami.vn/trans/ADV-2026-0001',
    submittedAt: '2026-08-28T16:30:00.000Z',
    completedAt: '2026-08-30T10:00:00.000Z',
    createdAt: '2026-08-28T16:15:00.000Z',
    timeline: [
      { actor: 'Nguyễn Văn An (CTV)', action: 'Tạo đề nghị tạm ứng', timestamp: '2026-08-28T16:15:00.000Z', comment: 'Tạo từ chuyến đi TRIP-2026-0001' },
      { actor: 'Lê Văn Cường (Manager)', action: 'Phê duyệt', timestamp: '2026-08-29T08:00:00.000Z', comment: 'Duyệt tạm ứng 5.000.000đ' },
      { actor: 'Hoàng Văn Em (Director)', action: 'Phê duyệt', timestamp: '2026-08-29T11:00:00.000Z', comment: 'Duyệt chi tạm ứng' },
      { actor: 'Phạm Thị Dung (Kế toán)', action: 'Đã giải ngân (Paid)', timestamp: '2026-08-30T10:00:00.000Z', comment: 'Đã chuyển khoản 5.000.000đ qua VCB' }
    ]
  },
  {
    id: 'REQ-003',
    requestCode: 'SET-2026-0001',
    requestType: 'SETTLEMENT',
    requesterId: 'P-001',
    managerId: 'P-003',
    status: 'MANAGER_REVIEW',
    title: 'Quyết toán hoàn ứng chuyến công tác Hải Phòng (TRIP-2026-0001)',
    description: 'Thực chi thực tế 4.300.000đ, hoàn trả lại công ty 700.000đ',
    amount: 4300000,
    customerId: 'CUST-001',
    parentRequestId: 'REQ-001',
    rootRequestId: 'REQ-001',
    payload: {
      relatedTripCode: 'TRIP-2026-0001',
      advanceAmount: 5000000,
      actualExpense: 4300000,
      difference: -700000,
      companyReimbursement: 0,
      refundAmount: 700000,
      expenseDescription: 'Tiền xe khách 600k, Khách sạn 3 đêm 2.100k, Tiếp khách nhà thuốc 1.600k. Tổng 4.300k',
      notes: 'Đã nộp giấy nộp tiền 700.000đ hoàn ứng vào tài khoản công ty'
    },
    workflowTemplateId: 'WF-SETTLEMENT',
    workflowInstanceId: 'WFI-003',
    currentWorkflowStep: 2,
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-settle-0001-receipts',
    externalAppUrl: 'https://ocr.genkifami.vn/view/SET-2026-0001',
    submittedAt: '2026-09-05T09:00:00.000Z',
    completedAt: null,
    createdAt: '2026-09-05T08:30:00.000Z',
    timeline: [
      { actor: 'Nguyễn Văn An (CTV)', action: 'Tạo đề nghị quyết toán', timestamp: '2026-09-05T08:30:00.000Z', comment: 'Hệ thống tự tính hoàn ứng về công ty: 700.000đ' },
      { actor: 'Nguyễn Văn An (CTV)', action: 'Gửi duyệt (Submit)', timestamp: '2026-09-05T09:00:00.000Z', comment: 'Đính kèm link Drive chứa toàn bộ hóa đơn đỏ' }
    ]
  },
  {
    id: 'REQ-004',
    requestCode: 'PAY-2026-0001',
    requestType: 'PAYMENT',
    requesterId: 'P-002',
    managerId: 'P-003',
    status: 'ACCOUNTING_REVIEW',
    title: 'Thanh toán chi phí in ấn tài liệu giới thiệu Fucoidan Genki',
    description: 'Thanh toán trực tiếp cho xưởng in Đông Đô theo hóa đơn VAT',
    amount: 3200000,
    customerId: 'CUST-003',
    parentRequestId: null,
    rootRequestId: 'REQ-004',
    payload: {
      paymentPurpose: 'In ấn 1.000 tờ rơi và cẩm nang sản phẩm Fucoidan cho hội thảo',
      paymentRecipient: 'Công Ty TNHH In Ấn & Quảng Cáo Đông Đô',
      bankInfo: 'Techcombank 190288889999 - CTY IN DONG DO',
      dueDate: '2026-09-15',
      notes: 'Hóa đơn điện tử đính kèm trên Google Drive'
    },
    workflowTemplateId: 'WF-PAYMENT',
    workflowInstanceId: 'WFI-004',
    currentWorkflowStep: 2,
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-pay-dongdo-invoice',
    externalAppUrl: 'https://invoicing.genkifami.vn/vat/PAY-2026-0001',
    submittedAt: '2026-09-06T14:00:00.000Z',
    completedAt: null,
    createdAt: '2026-09-06T13:45:00.000Z',
    timeline: [
      { actor: 'Trần Thị Bích (Staff)', action: 'Tạo đề nghị thanh toán', timestamp: '2026-09-06T13:45:00.000Z', comment: 'Chi phí phục vụ hội thảo nhà thuốc Quận 1' },
      { actor: 'Trần Thị Bích (Staff)', action: 'Gửi Kế toán xử lý', timestamp: '2026-09-06T14:00:00.000Z', comment: '' }
    ]
  },
  {
    id: 'REQ-005',
    requestCode: 'SAM-2026-0001',
    requestType: 'SAMPLE',
    requesterId: 'P-001',
    managerId: 'P-003',
    status: 'DIRECTOR_REVIEW',
    title: 'Đề nghị xuất 5 hộp mẫu thử Genki Fami Fucoidan cho Long Châu Ba Đình',
    description: 'Gửi mẫu để Dược sĩ và quản lý chuỗi dùng thử trước khi nhập lô lớn',
    amount: 0,
    customerId: 'CUST-001',
    parentRequestId: null,
    rootRequestId: 'REQ-005',
    payload: {
      sampleDescription: 'Viên uống tảo nâu Fucoidan Extract Genki Fami (Lọ 60 viên)',
      quantity: '5 Hộp',
      purpose: 'Dược sĩ trưởng dùng thử và kiểm định chất lượng bao bì chuẩn Nhật',
      requiredDate: '2026-09-12',
      shippingAddress: 'Nhà thuốc Long Châu, 124 Đội Cấn, Ba Đình, Hà Nội',
      recipient: 'DS. Nguyễn Thị Mai - 0981112233',
      notes: 'Không trừ tồn kho trong app này; đơn vị vận chuyển Viettel Post'
    },
    workflowTemplateId: 'WF-SAMPLE',
    workflowInstanceId: 'WFI-005',
    currentWorkflowStep: 3,
    driveFolderUrl: 'https://drive.google.com/drive/folders/genki-sample-cust-001',
    externalAppUrl: null,
    submittedAt: '2026-09-07T09:30:00.000Z',
    completedAt: null,
    createdAt: '2026-09-07T09:00:00.000Z',
    timeline: [
      { actor: 'Nguyễn Văn An (CTV)', action: 'Tạo đề nghị xuất mẫu', timestamp: '2026-09-07T09:00:00.000Z', comment: 'Đề xuất xuất 5 hộp mẫu' },
      { actor: 'Nguyễn Văn An (CTV)', action: 'Gửi phê duyệt', timestamp: '2026-09-07T09:30:00.000Z', comment: '' },
      { actor: 'Lê Văn Cường (Manager)', action: 'Phê duyệt cấp Vùng', timestamp: '2026-09-07T15:00:00.000Z', comment: 'Đồng ý cấp mẫu cho khách hàng tiềm năng lớn' }
    ]
  }
];

export const INITIAL_WORKFLOW_TEMPLATES = [
  {
    id: 'WF-TRIP',
    name: 'Quy trình Phê duyệt Công tác (Business Trip)',
    requestType: 'BUSINESS_TRIP',
    description: 'Quy trình chuẩn: Nhân sự -> Quản lý vùng -> Ban Giám Đốc -> Kế toán xác nhận',
    steps: [
      { stepNumber: 1, name: 'Khởi tạo đề nghị', role: 'REQUESTER', actionRequired: 'Submit' },
      { stepNumber: 2, name: 'Quản lý vùng duyệt', role: 'MANAGER', actionRequired: 'Approve / Reject / Revision' },
      { stepNumber: 3, name: 'Ban Giám Đốc duyệt', role: 'DIRECTOR', actionRequired: 'Approve / Reject' },
      { stepNumber: 4, name: 'Kế toán tiếp nhận', role: 'ACCOUNTING', actionRequired: 'Acknowledge / Ready' }
    ]
  },
  {
    id: 'WF-ADVANCE',
    name: 'Quy trình Tạm ứng (Advance)',
    requestType: 'ADVANCE',
    description: 'Quy trình: Nhân sự -> Quản lý -> Giám Đốc -> Kế toán giải ngân',
    steps: [
      { stepNumber: 1, name: 'Khởi tạo tạm ứng', role: 'REQUESTER', actionRequired: 'Submit' },
      { stepNumber: 2, name: 'Quản lý duyệt', role: 'MANAGER', actionRequired: 'Approve' },
      { stepNumber: 3, name: 'Giám Đốc duyệt chi', role: 'DIRECTOR', actionRequired: 'Approve' },
      { stepNumber: 4, name: 'Kế toán chi tiền', role: 'ACCOUNTING', actionRequired: 'Mark as Paid' }
    ]
  },
  {
    id: 'WF-PAYMENT',
    name: 'Quy trình Thanh toán trực tiếp (Payment)',
    requestType: 'PAYMENT',
    description: 'Quy trình kế toán trực tiếp: Nhân sự -> Kế toán thẩm tra -> Chi trả',
    steps: [
      { stepNumber: 1, name: 'Nộp hồ sơ thanh toán', role: 'REQUESTER', actionRequired: 'Submit' },
      { stepNumber: 2, name: 'Kế toán thẩm định', role: 'ACCOUNTING', actionRequired: 'Review / Need Info / Ready' },
      { stepNumber: 3, name: 'Kế toán chi tiền', role: 'ACCOUNTING', actionRequired: 'Mark as Paid' }
    ]
  },
  {
    id: 'WF-SETTLEMENT',
    name: 'Quy trình Hoàn ứng & Quyết toán (Settlement)',
    requestType: 'SETTLEMENT',
    description: 'Quy trình: Nhân sự tính toán chênh lệch -> Quản lý xác thực -> Kế toán đối chiếu & tất toán',
    steps: [
      { stepNumber: 1, name: 'Lập bảng quyết toán', role: 'REQUESTER', actionRequired: 'Submit' },
      { stepNumber: 2, name: 'Quản lý xác nhận chứng từ', role: 'MANAGER', actionRequired: 'Approve' },
      { stepNumber: 3, name: 'Kế toán đối soát & tất toán', role: 'ACCOUNTING', actionRequired: 'Settle / Complete' }
    ]
  },
  {
    id: 'WF-SAMPLE',
    name: 'Quy trình Đề nghị Xuất mẫu (Sample)',
    requestType: 'SAMPLE',
    description: 'Quy trình: Nhân sự -> Quản lý duyệt -> Giám Đốc phê duyệt -> Xử lý gửi mẫu',
    steps: [
      { stepNumber: 1, name: 'Tạo đề nghị mẫu', role: 'REQUESTER', actionRequired: 'Submit' },
      { stepNumber: 2, name: 'Quản lý vùng duyệt', role: 'MANAGER', actionRequired: 'Approve' },
      { stepNumber: 3, name: 'Ban Giám Đốc duyệt', role: 'DIRECTOR', actionRequired: 'Approve' },
      { stepNumber: 4, name: 'Bộ phận xử lý gửi mẫu', role: 'ACCOUNTING', actionRequired: 'Process Shipment' }
    ]
  }
];

export const INITIAL_APP_LINKS = [
  {
    id: 'APP-01',
    name: 'Invoice Scanner & OCR',
    description: 'Công cụ quét hóa đơn và trích xuất dữ liệu VAT tự động',
    url: 'https://ocr.genkifami.vn',
    icon: '📷',
    active: true
  },
  {
    id: 'APP-02',
    name: 'Genki Sales Miniapp',
    description: 'Ứng dụng ghi nhận doanh số và đặt hàng dành cho CTV',
    url: 'https://sales.genkifami.vn',
    icon: '📱',
    active: true
  },
  {
    id: 'APP-03',
    name: 'Payment Slip Generator',
    description: 'Hệ thống tự tạo phiếu chi điện tử cho kế toán',
    url: 'https://accounting.genkifami.vn/slips',
    icon: '🧾',
    active: true
  },
  {
    id: 'APP-04',
    name: 'Contract Document Studio',
    description: 'Công cụ soạn thảo và lưu kho lưu trữ hợp đồng ký kết',
    url: 'https://docstudio.genkifami.vn',
    icon: '📑',
    active: true
  }
];
