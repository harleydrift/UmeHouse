# Ume — Landing page đặt trà sữa (làng Yên Nội, Ba Vì, Hà Nội)

Trang giới thiệu thương mại + đặt hàng online cho quán Ume. Khách xem menu, chọn món
vào giỏ, điền thông tin và gửi đơn — đơn chảy **thẳng vào hệ thống "Nhập đơn" của quán**
(Google Sheets + Apps Script), cùng tab Đơn hàng với đơn nhập tay, nguồn "landing".
Menu, giá, phí ship theo xã, khung giờ giao **tự tải live từ hệ thống** — đổi trong Sheet
là trang tự cập nhật. Miễn phí 100%, không server, không database riêng.

## Cấu trúc trang (7 phần)

1. **Hero** — ảnh đồ uống lớn, tên thương hiệu, slogan "Vị trà thơm, thưởng trà thanh", nút "Khám phá menu" + "Mua ngay", thẻ **"Ghé quán tại Yên Nội"** mở Google Maps
2. **Giới thiệu** — câu chuyện quán ở làng Yên Nội
3. **Món nổi bật** — 3 món đầu từ menu hệ thống
4. **Thực đơn** — toàn bộ món, thêm vào giỏ
5. **Vì sao chọn Ume** — 4 điểm chân thực
6. **Khu vực giao hàng** — bảng phí ship theo từng xã (từ hệ thống) + hộp tự đến lấy kèm nút "Xem đường đến quán"
7. **Footer** — địa chỉ + nút bản đồ, khung giờ, liên hệ

Địa chỉ quán và Google Maps (link chính thức của quán) xuất hiện ở 5 chỗ: menu trên
(điện thoại lẫn máy tính), thẻ trong hero, phần giao hàng, footer và panel "Tự đến quán
lấy" trong giỏ — bấm là mở tab mới tới Google Maps chỉ đường.

Giỏ hàng là drawer bên phải: chọn số lượng + topping, điền tên/SĐT, chọn **phương thức
nhận hàng dạng thẻ có mô tả**:
- **Giao hàng tận nơi** — chọn xã + địa chỉ + khung giờ (hệ thống bắt buộc — chỉ hiện
  khung còn nhận trong ngày, tự ẩn khung sắp hết giờ theo cấu hình "số phút chuẩn bị"
  trong Sheet); phí ship theo xã, miễn phí theo số phần như hệ thống quy định.
- **Tự đến quán lấy** — ẩn phần địa chỉ giao, phí giao hiển thị 0đ, tổng chỉ còn tiền
  hàng; hiện địa chỉ quán + nút **"Xem đường đến quán"** mở Google Maps, và ô ghi
  "dự kiến đến lấy" (ghép vào ghi chú đơn).

Xem tạm tính tiền hàng + phí ship rồi gửi. Đơn gửi qua kênh `landing` có sẵn của
script — **không sửa script, không tạo gì mới**.

## Các file trong gói

| File | Là gì |
|------|-------|
| `index.html` | **Toàn bộ website** (7 phần + giỏ hàng + checkout) — 1 file, tối ưu điện thoại trước |
| `anh_quan.png`, `cac_coc.jpg` | Ảnh hero / ảnh giới thiệu của quán — đi kèm trang, đừng xoá |
| `tra_sua.jpeg` | Ảnh dự phòng khi món chưa có "Link ảnh" trong Sheet |
| `logo.png`, `logo-600.png`, `favicon.png` | Logo Ume — đi kèm trang, đừng xoá |
| `apps-script/Code.gs` | **Bản chụp script thật của quán** — chỉ để tra cứu hợp đồng API, KHÔNG dán đi đâu |
| `DEPLOY-RA-NGOAI.md` | **Checklist đưa trang ra ngoài** 👉 đọc file này đầu tiên |

File phục vụ phát triển (không đóng gói): `api-test.html`, `index-test.html`,
`mobile-check.html` (soi layout 360/390/430px), `demo/mock-gas.py`
(giả lập hệ thống để test cục bộ ở `localhost:8788`).

## Về ảnh sản phẩm và cột "Link ảnh" trong Sheet

Bản script Nhập đơn mới (2026-11-05, xem `apps-script/Code.gs`) đã đọc cột "Link ảnh"
trong tab Món và trả trường `image_url` cho mỗi món. Website ưu tiên ảnh này, theo
thứ tự: `image_url` từ Sheet → `IMG_BY_ID` trong `index.html` → ảnh mặc định `tra_sua.jpeg`.
Ảnh lỗi hoặc trống tự fallback về ảnh mặc định, nên món nào chưa có ảnh vẫn hiển thị đẹp.

Cách dán "Link ảnh" trong tab Món (dòng nào cũng được, web tự xử lý):

- **Nên nhất:** dán link ảnh trực tiếp, VD `https://i.ibb.co/R4NC2hvN/tra-sua.jpg`
  (imgbb gọi là **Direct link** / "Link trực tiếp", hoặc nút phải ảnh → Sao chép địa chỉ ảnh).
- Dán cả **đoạn HTML nhúng** `<a href=...><img src="https://i.ibb.co/..."></a>` vẫn chạy:
  web tự lôi link ảnh trong `src` ra.
- Link Google Drive dạng xem (`drive.google.com/file/d/...`) tự đổi sang dạng nhúng được.
- Đừng dán link **trang xem ảnh** (VD `https://ibb.co/...` hay `https://imgbb.com/`) —
  đó không phải file ảnh, món sẽ về ảnh mặc định.
- Ảnh Drive phải chia sẻ "Bất kỳ ai có đường liên kết".

Sau khi sửa Sheet, khách tải lại trang là thấy ảnh mới (không đụng vào code).

## Tối ưu điện thoại

Trang được làm mobile-first và đã kiểm tra ở bề rộng 360 / 390 / 430px:

- Thực đơn **lưới 2 cột** trên điện thoại, ảnh tỷ lệ đồng nhất (4:3, không méo)
- **Không có thanh cuộn ngang** ở mọi kích thước màn hình
- Nút mua/thêm giỏ cao ~42px, nút bấm thao tác ≥44px — dễ bấm bằng ngón tay
- Menu điều hướng dạng **hamburger** trên màn hình nhỏ
- Ô nhập dùng chữ 16px trên điện thoại (tránh iOS tự phóng màn hình khi bấm)
- Ảnh món tải trễ (lazy), nút giỏ hàng cố định cuối màn hình không che nội dung footer
- Tôn trọng "giảm chuyển động" của hệ điều hành (người dùng bật giảm động thì trang tắt hiệu ứng)

## Thứ tự làm khi về nhà (tổng ~15')

1. Copy cả folder sang máy nhà (hoặc dùng `ume-landing.zip`)
2. Mở **`DEPLOY-RA-NGOAI.md`** → Phần A: Netlify Drop / GitHub Pages → có link công khai
3. Phần B: đặt đơn thử → kiểm tra đơn vào tab Đơn hàng của app Nhập đơn

## Lưu ý bảo mật

- Giá/tên món/phí ship khách tự do sửa cũng vô ích — hệ thống tính lại toàn bộ theo Sheet
- Mỗi đơn có `submission_id` riêng → gửi lại do lỗi mạng không bị lưu trùng
- Chỉ dùng hệ thống Google có sẵn của quán, không có key dịch vụ nào khác
