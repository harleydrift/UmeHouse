# Checklist đưa landing page Ume ra ngoài (làm tại nhà, ~10 phút, miễn phí 100%)

**Tin tốt: không phải đụng vào script "Nhập đơn" nữa.** Bản script hiện tại của quán
đã có sẵn cổng API cho website (kênh `landing`): website tự lấy menu/giá/xã giao/khung
giờ từ hệ thống, và đơn khách chảy thẳng vào tab **Đơn hàng** của Sheet, có cột
"Nguồn" = landing — đúng như đơn nhập tay. **Không sửa script, không tạo script mới,
không tạo Sheet mới.**

`index.html` đã trỏ sẵn `GAS_URL` về link hệ thống Nhập đơn — **không cần điền gì thêm**.

---

## PHẦN A — Đưa landing page lên mạng (10')

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
> (Nếu trước đó đã deploy bản cũ: chỉ cần kéo thả folder mới đè lên là xong.)

## PHẦN B — Kiểm tra sau khi live (5')

1. Mở link công khai → trang hiện đủ 7 phần: Hero, Giới thiệu, Món nổi bật,
   Thực đơn, Vì sao chọn Ume, Khu vực giao hàng, Footer
2. Thực đơn hiện **8 món TS01–TS08 + giá 49.000đ** (tự tải từ hệ thống)
3. Thêm món vào giỏ → bấm giỏ hàng → chọn số lượng + topping
4. Điền tên/SĐT → chọn xã giao (phí ship hiện theo bảng trong Sheet), chọn
   **khung giờ giao** (chỉ hiện các khung còn nhận trong ngày) hoặc "Tự đến lấy"
   → gửi đơn → trang hiện "🎉 Đã nhận đơn + mã TS-..."
5. Mở app Nhập đơn → tab **Đơn hàng** → thấy đơn khách vừa đặt, nguồn "landing"

## CONFIG — chỉ 1 chỗ, đã điền sẵn

| Config | Ở đâu | Giá trị |
|--------|-------|---------|
| `GAS_URL` | `index.html` đầu phần `<script>` | Đã trỏ sẵn về link Nhập đơn của quán — không cần sửa |

### Nếu quán đổi menu/giá/phí ship
Sửa trong **Google Sheet của quán** (tab Món / Phí ship) → landing page tự cập nhật,
không phải sửa code.

### Thay ảnh sản phẩm
Mặc định mọi món dùng ảnh `tra_sua.jpeg`. Khi có ảnh riêng từng món:
1. Đặt file ảnh vào cùng folder (VD `ts01.jpg`)
2. Mở `index.html`, tìm dòng `const IMG_BY_ID = {};` → sửa thành
   `const IMG_BY_ID = { "TS01": "ts01.jpg" };`

## Câu hỏi thường gặp

**Đơn khách có trùng với đơn admin nhập không?** Không — mỗi đơn có `submission_id`
riêng, hệ thống tự chống trùng; mã đơn do hệ thống sinh, admin thấy trong tab Đơn hàng.

**Nếu khách bấm Gửi đơn mà mạng lỗi?** Trang nhắc bấm lại — vì giữ nguyên
`submission_id` cho tới khi gửi thành công nên hệ thống không lưu trùng.

**Quán đóng nhận đơn thì sao?** Trang tự hiện banner "tạm đóng nhận đơn" khi
bạn tắt nhận đơn trong hệ thống — khách vẫn xem menu nhưng không gửi được.

**Chuyển khoản?** Trang chỉ hiện tuỳ chọn chuyển khoản khi hệ thống bật
(`transfer_enabled`) — hiện đang tắt, khách thấy duy nhất "Tiền mặt khi nhận".
