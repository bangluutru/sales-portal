# Genki Sales Portal — Partner & Staff Operations Portal

Cổng vận hành nội bộ thống nhất dành cho nhân viên kinh doanh, cộng tác viên (CTV), đối tác và ban lãnh đạo **Genki Fami**.

Được phát triển theo phương pháp luận **Vibecode v6** (skill `tao-apps` của Skill Lab / Antigravity).

---

## 1. Mục Tiêu & Ranh Giới Phạm Vi

Ứng dụng là một **Partner / Staff Operations Portal**, tập trung giải quyết:
* Quản lý hồ sơ nhân viên, cộng tác viên bán hàng và đối tác kinh doanh;
* Danh bạ khách hàng toàn team, phân định rõ người phụ trách (Owner) chống trùng lặp;
* Quản lý nội dung, metadata và quy trình phê duyệt hợp đồng;
* Trung tâm 5 loại đề nghị tác nghiệp: Công tác, Tạm ứng, Thanh toán, Quyết toán hoàn ứng và Xuất mẫu;
* Bộ máy quy trình phê duyệt (Workflow Engine) linh hoạt;
* Hộp việc cần làm (My Tasks) tập trung cho từng vai trò.

### ⚠️ Ranh giới nghiêm ngặt (Out of Scope):
- **KHÔNG** quản lý doanh thu, đơn hàng, tồn kho, sản phẩm, tính commission, P&L, kế toán sổ cái, CRM pipeline.
- **KHÔNG** lưu file hợp đồng, ảnh hóa đơn, OCR trong hệ thống core.
- **CHỈ** lưu metadata, trạng thái, quan hệ dữ liệu, Google Drive URLs và liên kết Miniapps bên ngoài.

---

## 2. Kiến Trúc 5 Thực Thể Cốt Lõi (5 Core Objects)

```
PERSON ──┬── CONTRACT (Quản lý metadata, template preview, duyệt đa cấp)
         ├── CUSTOMER (Danh bạ khách hàng, owner, link app bán hàng)
         └── REQUEST  (Công tác ──► Tạm ứng ──► Quyết toán tự tính chênh lệch; Thanh toán; Xuất mẫu)
                  └── WORKFLOW (Quy trình phê duyệt tùy biến & snapshot lịch sử)
```

---

## 3. Hướng Dẫn Cài Đặt & Khởi Chạy

### Khởi chạy môi trường phát triển (Dev Server):
```bash
cd /Users/tranhaibang/.gemini/antigravity-ide/scratch/xtools/genki-sales-portal
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:5173`

### Chạy kiểm thử tự động (Unit Tests):
```bash
npm test
```

### Xuất bản bundle sản phẩm (Build):
```bash
npm run build
```

---

## 4. Hướng Dẫn Sử Dụng & Trải Nghiệm (Demo Guide)

### 🎭 Thanh Demo Role Switcher:
Trên đầu trang luôn có thanh chuyển đổi vai trò nhanh giữa 7 personas:
1. **Nguyễn Văn An (CTV):** Xem hợp đồng cá nhân, khách hàng phụ trách tại Hà Nội, nộp đề nghị công tác & tạm ứng.
2. **Trần Thị Bích (Staff):** Nhân viên kinh doanh chính thức Miền Nam, nộp đề nghị thanh toán in ấn tờ rơi.
3. **Lê Văn Cường (Manager):** Sales Manager, duyệt các đề nghị của team trong hộp *Needs My Action*, lập hợp đồng mới.
4. **Phạm Thị Dung (Kế toán):** Xem hàng đợi thanh toán tài chính, xác nhận *Sẵn sàng chi* hoặc *Đã thanh toán (Paid)*, kiểm tra quyết toán hoàn ứng.
5. **Hoàng Văn Em (Tổng Giám Đốc):** Phê duyệt hợp đồng CTV/Nhân sự mới, phê duyệt các khoản chi & xuất mẫu lớn.
6. **Công Ty Dược An Khang (Đại Lý / Đối tác):** Xem danh sách khách hàng và đề nghị của đại lý.
7. **Quản Trị Viên (Admin):** Cấu hình các bước trong Workflow Engine, thêm bớt Miniapp links, khôi phục dữ liệu mẫu.

### 💡 Trải nghiệm chuỗi Công tác ➔ Tạm ứng ➔ Quyết toán:
- Bước 1: CTV tạo đề nghị Công tác `TRIP-2026-0001` (dự kiến 5.000.000đ).
- Bước 2: Manager & Giám Đốc duyệt ➔ Kế toán giải ngân Tạm ứng `ADV-2026-0001` (5.000.000đ).
- Bước 3: Sau chuyến đi, CTV tạo Quyết toán `SET-2026-0001`:
  - Nhập chi phí thực tế: `4.300.000đ`.
  - Hệ thống tự động tính toán: `Nhân sự hoàn ứng về công ty: 700.000đ`!
  - Hoặc nếu chi `6.000.000đ`: Hệ thống tự động tính `Công ty hoàn trả thêm cho nhân sự: 1.000.000đ`.

---

## 5. Bản Quyền & Thiết Kế

Được thiết kế riêng cho **Genki Fami** theo chuẩn nhận diện thương hiệu:
- Màu sắc: `#006964` (Primary Teal), `#51BF9D` (Secondary Mint), `#A71D45` (Accent Magenta).
- Typography: Inter, Space Grotesk, JetBrains Mono.
