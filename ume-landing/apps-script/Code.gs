/**
 * UME — Nhận đơn từ landing page, lưu vào Google Sheets
 * =====================================================
 * Dán toàn bộ file này vào Apps Script (Extensions → Apps Script
 * của Google Sheet bạn tạo). Chỉ cần sửa 2 dòng phần CẤU HÌNH.
 * Chi tiết từng bước: xem HUONG-DAN-GAS.md
 */

// ==== CẤU HÌNH — chỉ sửa 2 dòng dưới ====
const SPREADSHEET_ID = 'PASTE_ID_GOOGLE_SHEET_VÀO_ĐÂY'; // id trong URL của Google Sheet, đoạn giữa /d/.../edit
const EMAIL_TO = ''; // (không bắt buộc) email nhận thông báo đơn mới, ví dụ 'ume.shop@gmail.com'

// ==== GIÁ & MENU — đổi giá/menu ở đây khi quán thay đổi ====
const ITEM_PRICE = 49000;
const FULL_TOPPING_PRICE = 0; // đặt > 0 nếu quán tính phí Full Topping
const MENU_ITEMS = [
  'Trà sữa đậm vị',
  'Trà sữa trân châu đường đen',
  'Ô long sữa quế hoa',
  'Trà sữa thái xanh',
  'Ô long đào sữa',
  'Trà sữa hạt dẻ',
  'Trà đào cam sả',
  'Trà xoài chanh dây'
];
const ZONE_FEE = { '2km': 0, '10km': 10000 };

/** Chạy 1 lần từ editor để cấp quyền đọc/ghi Sheet và gửi email. */
function initAuth() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Kết nối được sheet: ' + ss.getName());
}

/** Landing page POST form-urlencoded: payload=<JSON đơn hàng> */
function doPost(e) {
  let result;
  try {
    const data = JSON.parse(e.parameter.payload);
    result = saveOrder(data);
  } catch (err) {
    result = { ok: false, message: 'Dữ liệu gửi lên không hợp lệ. Vui lòng thử lại.' };
  }
  const html =
    '<!doctype html><html><body><script>' +
    'parent.postMessage(' + JSON.stringify(JSON.stringify(result)) + ', "*");' +
    '</scr' + 'ipt></body></html>';
  return HtmlService.createHtmlOutput(html);
}

/** Kiểm tra + lưu đơn. Luôn tính lại tiền từ danh sách menu — không tin tiền do khách gửi. */
function saveOrder(data) {
  const name = String(data.name || '').trim();
  const phone = String(data.phone || '').replace(/[\s.\-]/g, '');
  const note = String(data.note || '').slice(0, 500);
  const deliveryMethod = data.delivery_method === 'pickup' ? 'pickup' : 'delivery';
  const zone = deliveryMethod === 'delivery' ? String(data.zone || '') : '';
  const address = deliveryMethod === 'delivery' ? String(data.address || '').trim() : '';
  const paymentMethod = data.payment_method === 'bank' ? 'bank' : 'cash';

  if (name.length < 2 || name.length > 100) {
    return { ok: false, message: 'Vui lòng điền tên khách (2–100 ký tự).' };
  }
  if (!/^0\d{8,10}$/.test(phone)) {
    return { ok: false, message: 'Số điện thoại không hợp lệ (VD: 0912345678).' };
  }

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const lines = [];
  let cups = 0, subtotal = 0;
  for (const it of rawItems) {
    const qty = parseInt(it.qty, 10);
    if (!MENU_ITEMS.includes(String(it.name)) || !(qty >= 1) || qty > 99) continue;
    const linePrice = (ITEM_PRICE + (it.full_topping ? FULL_TOPPING_PRICE : 0)) * qty;
    lines.push({
      name: String(it.name),
      qty: qty,
      fullTopping: !!it.full_topping,
      linePrice: linePrice
    });
    cups += qty;
    subtotal += linePrice;
  }
  if (lines.length === 0) {
    return { ok: false, message: 'Vui lòng chọn ít nhất một món.' };
  }
  if (lines.length > 30 || cups > 99) {
    return { ok: false, message: 'Đơn quá lớn. Vui lòng tách thành nhiều đơn hoặc gọi trực tiếp cho quán.' };
  }

  let deliveryFee = 0;
  if (deliveryMethod === 'delivery') {
    if (!(zone in ZONE_FEE)) return { ok: false, message: 'Vui lòng chọn khu vực giao hàng.' };
    if (address.length < 6) return { ok: false, message: 'Vui lòng điền địa chỉ giao hàng.' };
    deliveryFee = ZONE_FEE[zone];
  }

  const total = subtotal + deliveryFee;
  const now = new Date();
  const orderCode = 'UM-' + Utilities.formatDate(now, 'GMT+7', 'yyMMdd-HHmmss');

  const itemsText = lines
    .map((l) => l.qty + 'x ' + l.name + (l.fullTopping ? ' (Full Topping)' : ''))
    .join(', ');
  const deliveryText = deliveryMethod === 'pickup' ? 'Tự đến lấy' : 'Giao tận nơi';
  const zoneText = deliveryMethod === 'pickup' ? '' : (zone === '10km' ? 'Đến 10km' : 'Trong 2km');
  const payText = paymentMethod === 'bank' ? 'Chuyển khoản' : 'Tiền mặt';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Orders');
    if (!sheet) {
      sheet = ss.insertSheet('Orders');
      sheet.appendRow(['Thời gian', 'Mã đơn', 'Tên khách', 'SĐT', 'Món', 'Số ly',
        'Nhận hàng', 'Khu vực', 'Phí giao', 'Địa chỉ', 'Thanh toán', 'Ghi chú', 'Tạm tính', 'Tổng']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([now, orderCode, name, "'" + phone, itemsText, cups,
      deliveryText, zoneText, deliveryFee, address, payText, note, subtotal, total]);
  } finally {
    lock.releaseLock();
  }

  if (EMAIL_TO) {
    try {
      MailApp.sendEmail(EMAIL_TO, '[Ume] Đơn mới ' + orderCode + ' — ' + name,
        itemsText + '\nTổng: ' + total.toLocaleString('vi-VN') + 'đ' +
        '\nKhách: ' + name + ' · ' + phone +
        '\nNhận hàng: ' + deliveryText + (zoneText ? ' (' + zoneText + ')' : '') +
        '\nĐịa chỉ: ' + (address || '—') +
        '\nThanh toán: ' + payText +
        (note ? '\nGhi chú: ' + note : ''));
    } catch (err) {
      // Lỗi email không được làm mất đơn
    }
  }

  return { ok: true, order_code: orderCode, subtotal: subtotal, delivery_fee: deliveryFee, total: total, cups: cups };
}
