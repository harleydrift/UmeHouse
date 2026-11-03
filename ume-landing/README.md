# Ume — Landing page đặt trà sữa (làng Yên Nội, Ba Vì, Hà Nội)

Trang web cho khách đặt trà sữa online: khách tạo đơn ngay trên trang, đơn chảy
**thẳng vào hệ thống "Nhập đơn" của quán** (Google Sheets + Apps Script) — cùng
sheet, cùng logic với đơn admin nhập. Menu tự tải live từ hệ thống. **Miễn phí
100%, không cần server, không cần đăng ký dịch vụ trả phí.**

## Các file trong gói này

| File | Là gì | Khi nào dùng |
|------|-------|--------------|
| `index.html` | **Toàn bộ website** (giao diện + form đặt hàng) — 1 file duy nhất | Deploy lên mạng |
| `logo.png`, `logo-600.png`, `favicon.png` | Logo Ume (crop từ thiết kế gốc) | Đi kèm trang, đừng xoá |
| `apps-script/tich-hop-script-nhap-don.gs` | **2 nhánh API dán vào script "Nhập đơn"** (bạn đã có quyền sửa) | Phần A của hướng dẫn |
| `apps-script/Code.gs` | (Dự phòng) backend nhận đơn riêng nếu không nhờ được người kia | Chỉ dùng phương án dự phòng |
| `DEPLOY-RA-NGOAI.md` | **Checklist đưa trang ra ngoài** | 👉 Đọc file này đầu tiên |
| `HUONG-DAN-GAS.md` | Hướng dẫn phương án dự phòng (Sheet + Apps Script riêng) | Chỉ khi không nhờ được |

## Thứ tự làm khi về nhà (tổng ~15')

1. Copy cả folder này sang máy nhà (hoặc dùng luôn `ume-landing.zip`)
2. Mở **`DEPLOY-RA-NGOAI.md`** → Phần A: bạn tự dán 2 nhánh API vào script "Nhập đơn" (đã có quyền sửa)
3. Phần B: Netlify Drop / GitHub Pages → có link công khai
4. Phần C: đặt đơn thử → kiểm tra đơn vào app Nhập đơn

## Lưu ý bảo mật

- Đơn gửi theo đúng định dạng `staffSubmit` của hệ thống — hệ thống tự kiểm tra và tính tiền lại, khách không thể sửa giá
- Menu/đơn nằm trong Google Sheet của quán — chỉ người có quyền mới xem được
- Không có key/API nào của dịch vụ khác — chỉ dùng hệ thống Google có sẵn của quán
