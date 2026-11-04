# Ume — Landing page đặt trà sữa (làng Yên Nội, Ba Vì, Hà Nội)

Trang giới thiệu thương mại + đặt hàng online cho quán Ume. Khách xem menu, chọn món
vào giỏ, điền thông tin và gửi đơn — đơn chảy **thẳng vào hệ thống "Nhập đơn" của quán**
(Google Sheets + Apps Script), cùng tab Đơn hàng với đơn nhập tay, nguồn "landing".
Menu, giá, phí ship theo xã, khung giờ giao **tự tải live từ hệ thống** — đổi trong Sheet
là trang tự cập nhật. Miễn phí 100%, không server, không database riêng.

## Cấu trúc trang (7 phần)

1. **Hero** — ảnh đồ uống lớn, tên thương hiệu, slogan "Vị trà thơm, thưởng trà thanh", nút "Khám phá menu" + "Mua ngay"
2. **Giới thiệu** — câu chuyện quán ở làng Yên Nội
3. **Món nổi bật** — 3 món đầu từ menu hệ thống
4. **Thực đơn** — toàn bộ món, thêm vào giỏ
5. **Vì sao chọn Ume** — 4 điểm chân thực
6. **Khu vực giao hàng** — bảng phí ship theo từng xã (từ hệ thống) + tự đến lấy
7. **Footer** — địa chỉ, khung giờ, liên hệ

Giỏ hàng là drawer bên phải: chọn số lượng + topping, điền tên/SĐT/xã/địa chỉ,
chọn **khung giờ giao** (hệ thống bắt buộc — chỉ hiện khung còn nhận trong ngày,
tự ẩn khung sắp hết giờ theo cấu hình "số phút chuẩn bị" trong Sheet), xem tạm tính
tiền hàng + phí ship (miễn phí theo số phần như hệ thống quy định) rồi gửi.
Đơn gửi qua kênh `landing` có sẵn của script — **không sửa script, không tạo gì mới**.

## Các file trong gói

| File | Là gì |
|------|-------|
| `index.html` | **Toàn bộ website** (7 phần + giỏ hàng + checkout) — 1 file |
| `tra_sua.jpeg` | Ảnh sản phẩm dùng chung (thay ảnh riêng từng món qua `IMG_BY_ID` trong `index.html`) |
| `logo.png`, `logo-600.png`, `favicon.png` | Logo Ume — đi kèm trang, đừng xoá |
| `apps-script/Code.gs` | **Bản chụp script thật của quán** — chỉ để tra cứu hợp đồng API, KHÔNG dán đi đâu |
| `DEPLOY-RA-NGOAI.md` | **Checklist đưa trang ra ngoài** 👉 đọc file này đầu tiên |

File phục vụ phát triển (không đóng gói): `api-test.html`, `index-test.html`, `demo/mock-gas.py`
(giả lập hệ thống để test cục bộ ở `localhost:8788`).

## Thứ tự làm khi về nhà (tổng ~15')

1. Copy cả folder sang máy nhà (hoặc dùng `ume-landing.zip`)
2. Mở **`DEPLOY-RA-NGOAI.md`** → Phần A: Netlify Drop / GitHub Pages → có link công khai
3. Phần B: đặt đơn thử → kiểm tra đơn vào tab Đơn hàng của app Nhập đơn

## Lưu ý bảo mật

- Giá/tên món/phí ship khách tự do sửa cũng vô ích — hệ thống tính lại toàn bộ theo Sheet
- Mỗi đơn có `submission_id` riêng → gửi lại do lỗi mạng không bị lưu trùng
- Chỉ dùng hệ thống Google có sẵn của quán, không có key dịch vụ nào khác
