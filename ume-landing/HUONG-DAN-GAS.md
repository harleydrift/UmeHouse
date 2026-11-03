# Hướng dẫn nối landing page Ume với Google Sheets (15 phút)

Landing page có sẵn form đặt hàng. Việc còn lại: tạo 1 Google Sheet + 1 Apps Script
để nhận đơn. Làm 1 lần duy nhất, miễn phí, không cần server.

## Bước 1 — Tạo Google Sheet nhận đơn (2 phút)

1. Mở https://sheets.new (đăng nhập tài khoản Google của quán).
2. Đặt tên sheet, ví dụ: `Ume — Đơn khách hàng`.
3. Nhìn lên thanh địa chỉ, URL dạng:
   `https://docs.google.com/spreadsheets/d/1AbC...xYz/edit`
   → copy đoạn **giữa** `/d/` và `/edit` (đó là `SPREADSHEET_ID`).

## Bước 2 — Dán code Apps Script (3 phút)

1. Trong Google Sheet đó: menu **Extensions (Tiện ích mở rộng) → Apps Script**.
2. Xoá hết code mẫu, dán toàn bộ nội dung file `apps-script/Code.gs`.
3. Sửa 2 dòng cấu hình ở đầu file:
   - `SPREADSHEET_ID`: dán ID đã copy ở Bước 1.
   - `EMAIL_TO`: email muốn nhận thông báo đơn mới (để trống `''` nếu không cần).
4. Ở thanh trên chọn hàm **`initAuth` → Run**. Google hỏi quyền → **Allow**
   (cấp quyền cho script đọc/ghi Sheet và gửi email).
5. Sửa menu/giá sau này: sửa mảng `MENU_ITEMS` và `ITEM_PRICE` trong Code.gs
   (và dòng giá tương ứng trong `index.html`).

## Bước 3 — Xuất bản web app (3 phút)

1. Trong Apps Script: nút **Deploy (Triển khai) → New deployment**.
2. Bấm bánh răng ⚙ chọn loại **Web app**.
3. Đặt:
   - **Execute as**: **Me** (chạy bằng tài khoản của bạn)
   - **Who has access**: **Anyone** (ai cũng gửi được đơn — bắt buộc, vì khách không đăng nhập Google)
4. **Deploy** → copy **Web app URL** (dạng `https://script.google.com/macros/s/AKfycb.../exec`).

## Bước 4 — Gắn vào landing page (1 phút)

1. Mở `index.html`, tìm dòng:
   ```js
   const GAS_URL = "";
   ```
2. Dán URL vừa copy:
   ```js
   const GAS_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Xong! Mở trang, thử đặt 1 đơn → kiểm tra Google Sheet có dòng mới
   và email thông báo (nếu cấu hình).

## Bước 5 — Deploy landing page

Folder `ume-landing/` chỉ gồm file tĩnh, deploy nơi nào cũng được:
- **Netlify Drop**: vào https://app.netlify.com/drop, kéo thả cả folder `ume-landing` → có link ngay.
- **GitHub Pages**: đẩy folder lên repo, bật Pages.
- **Vercel**: cũng chạy được (file tĩnh).

## Câu hỏi thường gặp

**Đơn có vào được app "Nhập đơn" (trang admin) không?**
Không — app đó là script của người khác, Google không cho hệ thống ngoài đẩy đơn vào.
Đơn khách đặt sẽ nằm trong Google Sheet của bạn (tab `Orders`), nhìn thấy được
trực tiếp. Sau này nếu có quyền sửa script Nhập đơn, chỉ cần đổi `GAS_URL` là nối sang.

**Nếu khách bấm Gửi đơn mà mạng lỗi thì sao?**
Trang sẽ hiện nhắc "bấm Gửi đơn lần nữa — đơn sẽ không bị trùng". Về phía server,
mỗi đơn có mã riêng theo giây (UM-YYMMDD-GiờPhútGiây) nên không bị trùng nhau.

**Ai có thể xem đơn?**
Chỉ người có quyền mở Google Sheet đó. Landing page không lộ gì — khách chỉ gửi,
không đọc lại được dữ liệu của người khác.

**Giá/menu đổi?** Sửa `MENU_ITEMS` + `ITEM_PRICE` trong Code.gs và `MENU` + `ITEM_PRICE`
trong index.html (2 chỗ, giữ giống nhau).
