# Checklist đưa landing page Ume ra ngoài (làm tại nhà, ~15 phút, miễn phí 100%)

**Phương án đã chọn: đồng bộ với script "Nhập đơn" có sẵn của quán** — khách đặt trên
landing page, đơn chảy thẳng vào cùng Google Sheet và hiện trong tab "Danh sách" của
app Nhập đơn như đơn nhập tay. Menu trên trang **tự tải live từ hệ thống** (đổi giá
trong Sheet là trang tự cập nhật).

`index.html` đã trỏ sẵn `GAS_URL` về link hệ thống Nhập đơn — **không cần điền gì thêm**.

---

## PHẦN A — Mở cổng API trong script "Nhập đơn" (10' — bạn tự làm, đã có quyền sửa)

Mở script: https://script.google.com/u/0/home/projects/1lvwd2mMMZUQalx2RnalqDBSEqkDnS1K45JvbBrZX1Rmx0pHgPZaUjlKB/edit

1. Copy toàn bộ nội dung file **`apps-script/tich-hop-script-nhap-don.gs`** → dán vào
   **cuối file Code.gs** (hoặc tạo file mới trong project: ➕ → Script, đặt tên `WebOrder`)
2. Tìm hàm **`doGet(e)`** có sẵn → thêm vào **ngay dòng đầu** đúng 1 dòng:
   `if (webRequest_(e)) return webResponse_(e);`

   Không cần đụng vào doPost hay bất kỳ code cũ nào — file tích hợp **gọi thẳng
   `staffUiConfig()` (lấy menu) và `staffSubmit()` (lưu đơn)** vốn có của script,
   đơn web chảy vào cùng tab "Đơn hàng" như đơn nhập tay.
3. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**
   (sửa deployment CŨ để giữ nguyên link staff — đừng tạo deployment mới)
4. Mở landing page → menu phải tự hiện. Nếu báo "Không tải được thực đơn":
   Apps Script → **Executions** xem lỗi đỏ đầu tiên — thường do hàm cấu hình
   không tên `staffUiConfig`; tìm hàm trả menu trong Logic.gs rồi đổi tên trong
   `webMenuData_()` (file ghi chú sẵn).

Chi tiết xử lý lỗi thường gặp nằm ngay đầu file `tich-hop-script-nhap-don.gs`.

## PHẦN B — Đưa landing page lên mạng (10')

Folder toàn file tĩnh — không build, không cài gì. Đẩy `ume-landing/` lên:

### Cách 1 — Netlify Drop (dễ nhất, 5')
1. Vào **https://app.netlify.com/drop** → đăng ký/đăng nhập miễn phí
2. **Kéo thả cả folder `ume-landing`** vào ô
3. Có link ngay, ví dụ `https://ume-trasua.netlify.app`
4. Đổi tên link: Site settings → Change site name

### Cách 2 — GitHub Pages (5', ổn định lâu dài)
1. Tạo repo public, upload các file trong `ume-landing/` (để `index.html` ở gốc)
2. Settings → Pages → Branch: `main` → Save
3. Link: `https://<tên-user>.github.io/<tên-repo>`

> ⚠️ Landing page chạy được phải có HTTPS — Netlify/GitHub Pages/Vercel đều tự có.

## PHẦN C — Kiểm tra sau khi live (5')

1. Mở link công khai → thực đơn hiện đủ 8 món + giá
2. Đặt 1 đơn thử (tên/SĐT thật) → trang hiện "🎉 Đã nhận đơn + mã UM-..."
3. Mở app Nhập đơn → tab **Danh sách** → thấy đơn khách vừa đặt
4. Thử đổi giá 1 món trong tab Món của Sheet → tải lại landing page → giá mới hiện ra

---

## CONFIG — chỉ 1 chỗ, đã điền sẵn

| Config | Ở đâu | Giá trị |
|--------|-------|---------|
| `GAS_URL` + `KEY` | `index.html` đầu phần `<script>` | Đã trỏ sẵn về link Nhập đơn của quán — không cần sửa |

### Nếu quán đổi menu/giá
Sửa trong **tab Món của Google Sheet** (app admin) → landing page tự cập nhật,
không phải sửa code. (Chỉ khi thêm khu vực giao mới mới cần đổi phần chip trong `index.html`.)

## Phương án dự phòng (nếu bạn kia không mở được API)

Tạo hệ thống nhận đơn riêng của bạn theo `HUONG-DAN-GAS.md` (Google Sheet +
Apps Script riêng, 15'), rồi đổi `GAS_URL` trong `index.html` sang link của bạn.
Form gửi đúng kiểu dữ liệu đơn giản hơn (tên món thay vì product_id) — file
`apps-script/Code.gs` kèm sẵn cho phương án này.

## Câu hỏi thường gặp

**Đơn khách có trùng với đơn admin nhập không?** Không — mỗi đơn có `submission_id`
riêng và mã đơn do hệ thống sinh, admin thấy trong Danh sách với nguồn khách đặt.

**Nếu khách bấm Gửi đơn mà mạng lỗi?** Trang nhắc bấm lại — mỗi lần gửi có
`submission_id` riêng nên hệ thống không lưu trùng.

**Ai xem được đơn?** Ai đang có quyền dùng app Nhập đơn (key + sheet của quán).
