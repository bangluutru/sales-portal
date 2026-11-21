# CLAUDE.md — Genki Sales Portal (sales-portal)

Thư mục dự án hiện tại: `xtools/sales-portal` (đường dẫn `xtools/genki-sales-portal` trong `README.md` đã cũ).

## 1. Mục tiêu & người dùng
- Cổng vận hành nội bộ của **Genki Fami** cho nhân viên kinh doanh, cộng tác viên (CTV), đại lý/đối tác, quản lý, kế toán, tổng giám đốc, admin (7 persona, có thanh Role Switcher demo).
- Chức năng: hồ sơ nhân sự/CTV/đối tác; danh bạ khách hàng có người phụ trách (chống trùng); metadata + phê duyệt hợp đồng (soạn mẫu, xuất DOCX/PDF); 5 loại đề nghị (Công tác, Tạm ứng, Thanh toán, Quyết toán hoàn ứng, Xuất mẫu); Workflow Engine phê duyệt; hộp My Tasks.
- 5 thực thể lõi: PERSON, CONTRACT, CUSTOMER, REQUEST, WORKFLOW (xem `README.md`).

## 2. Stack & cấu trúc
- React 18 + Vite 6, JavaScript (JSX, không TypeScript); `docx`, `html2pdf.js`. Node >= 22 (`.node-version`: 22).
- Không có backend: dữ liệu lưu `localStorage` (khoá `genki_sales_portal_v1_*`, `src/utils/storageHelpers.js`) với dữ liệu mẫu.
- Deploy: Cloudflare Pages (`wrangler.toml`: `pages_build_output_dir = "dist"`), `public/_redirects` (SPA) và `public/_headers` (header bảo mật, cache assets).
- `src/views/` — Dashboard, Operations, Contracts, Customers, People, MyTasks, Admin. `src/components/` — Header, Sidebar, WorkflowTimeline, trình soạn hợp đồng/đơn công tác, …
- `src/context/AppContext.jsx` — state toàn app. `src/utils/` — `settlementCalc.js` (tính chênh lệch quyết toán), `contractDocxGenerator.js`, `contractPrintEngine.js`, `travelDocxGenerator.js`, `constants.js`, `helpers.js`.
- `tests/*.test.js` — `node:test` (CRUD, toàn vẹn dữ liệu, phân quyền, quyết toán, mẫu hợp đồng HĐLĐ/HĐNT/HTKD, editor).
- `artifacts/` — tài liệu quy trình Vibecode (TIP, blueprint, completion report, `audit-trail.csv`); `docs/UI_ADAPTATION_REPORT.md`.

## 3. Lệnh
Chạy `npm install` trước (chưa có `node_modules`; lockfile `package-lock.json`).
```bash
npm run dev       # vite, http://localhost:5173
npm test          # node --test tests/*.test.js
npm run build     # vite build -> dist/
npm run preview   # xem bản build
```
Không có lint, typecheck hay script deploy. TODO (người dùng xác nhận): Pages deploy qua Git integration hay `wrangler pages deploy dist`.

## 4. Điều bất biến
- Phạm vi cứng: **không** quản lý doanh thu, đơn hàng, tồn kho, sản phẩm, commission, P&L, sổ cái, CRM pipeline; **không** lưu file hợp đồng/ảnh hóa đơn/OCR — chỉ metadata, trạng thái, quan hệ, URL Google Drive và link miniapp ngoài.
- Dữ liệu người dùng trong `localStorage`: đổi cấu trúc phải giữ tương thích (đọc khoá cũ qua `safeLoad`), không ghi đè dữ liệu khi nâng phiên bản.
- Logic tính quyết toán (`settlementCalc.js`) và phân quyền theo vai trò có test — sửa thì cập nhật test tương ứng.
- Không có xác thực thật (Role Switcher là demo). TODO (người dùng xác nhận): app có đang dùng với dữ liệu thật không và có cần chặn truy cập (vd. Cloudflare Access).

## 5. Cách kiểm chứng
- `npm test` và `npm run build` phải qua.
- Thủ công (`npm run dev`): đổi persona bằng Role Switcher; chạy chuỗi Công tác → Tạm ứng → Quyết toán (chi thực tế 4.300.000đ với tạm ứng 5.000.000đ phải ra hoàn ứng 700.000đ; chi 6.000.000đ ra công ty trả thêm 1.000.000đ); soạn và xuất hợp đồng DOCX/in PDF; kiểm tra dữ liệu còn sau khi tải lại.
