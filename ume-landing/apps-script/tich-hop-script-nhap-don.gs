/**
 * ============================================================
 * TÍCH HỢP LANDING PAGE VÀO SCRIPT "NHẬP ĐƠN" — bản tối giản
 * ============================================================
 * Web landing page gọi THẲNG các hàm có sẵn của script này:
 *   - staffUiConfig()  → lấy thực đơn (tab Món/Topping) cho web
 *   - staffSubmit()    → lưu đơn web vào tab "Đơn hàng", tự kiểm tra
 *                        tên/SĐT/món/khu vực, tự sinh order_code
 * Code cũ KHÔNG bị sửa. Chỉ cần làm 3 bước:
 *
 * BƯỚC 1: Copy toàn bộ file này, dán vào CUỐI file Code.gs
 *         (hoặc tạo file .gs mới, đặt tên WebOrder.gs).
 *
 * BƯỚC 2: Tìm hàm doGet(e) có sẵn trong project, thêm đúng 1 dòng
 *         vào NGAY ĐẦU hàm (trước mọi dòng khác):
 *
 *             if (webRequest_(e)) return webResponse_(e);
 *
 *         Không cần đụng vào doPost hay bất kỳ hàm nào khác —
 *         web gửi cả menu lẫn đơn qua doGet, nhánh này chỉ kích
 *         hoạt khi request đến từ landing page.
 *
 * BƯỚC 3: Deploy → Manage deployments (Quản lý triển khai) → ✏️ Edit
 *         → Version: New version → Deploy.
 *         QUAN TRỌNG: sửa deployment CŨ để giữ nguyên link, đừng tạo
 *         deployment mới nếu không muốn link staff hiện tại bị đổi.
 *
 * Sau đó mở landing page → menu tự tải live từ tab Món/Topping của
 * Sheet, khách đặt → đơn chảy vào tab "Đơn hàng" như đơn nhập tay
 * (source = "web" để phân biệt).
 *
 * LỖI THƯỜNG GẶP:
 * - Trang hiện "Không tải được thực đơn": mở Apps Script → Executions
 *   xem lỗi. Khả năng hàm cấu hình trong project không tên staffUiConfig
 *   — mở Logic.gs tìm hàm trả về {products, toppings, shipping_fees}
 *   rồi đổi tên trong webMenuData_() dưới đây. Nếu staffUiConfig cần
 *   tham số key thì đổi thành staffUiConfig(webKey_()).
 * - Đơn không lưu: xem Executions, thường do trường items khác định dạng.
 * ============================================================
 */

/** Key của trang staff — lấy từ Script Properties, dự phòng bằng key web. */
var WEB_ORDER_KEY_FALLBACK = '7e941cc59e3151ce73da9c59ee2d72f90d0fc5b82c226153';

/** Đơn từ landing page đánh dấu nguồn để phân biệt với đơn nhập tay. */
var WEB_ORDER_SOURCE = 'web';

function webKey_() {
  return PropertiesService.getScriptProperties().getProperty(PROP_STAFF_KEY) || WEB_ORDER_KEY_FALLBACK;
}

/** Bộ điều phối duy nhất đặt ở đầu doGet: chỉ bắt request của landing page. */
function webRequest_(e) {
  if (!e || !e.parameter) return false;
  if (e.parameter.page === 'menu') return String(e.parameter.key || '') === String(webKey_());
  return e.parameter.payload != null; // đơn từ landing page
}

function webResponse_(e) {
  if (e.parameter.page === 'menu') return webMenuResponse_(e);
  return webOrderResponse_(String(e.parameter.payload));
}

/** doGet?page=menu&key=...&callback=... — landing page tải menu live qua JSONP. */
function webMenuResponse_(e) {
  var data;
  try {
    data = webMenuData_();
  } catch (err) {
    data = { ok: false, message: String(err && err.message ? err.message : err) };
  }
  var cb = String(e.parameter.callback || 'umeMenuCb').replace(/[^A-Za-z0-9_]/g, '');
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(data) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/** Gom menu từ cấu hình có sẵn của script. Nếu project dùng tên hàm khác, chỉ đổi chỗ này. */
function webMenuData_() {
  var cfg = staffUiConfig(); // nếu cần tham số key thì: staffUiConfig(webKey_())
  var products = (cfg && cfg.products ? cfg.products : []).map(function (p) {
    return {
      id: String(p.id != null ? p.id : p.product_id),
      name: String(p.name != null ? p.name : ''),
      price: Number(p.price != null ? p.price : (p.base_price != null ? p.base_price : 0)),
      available: p.available !== false && !p.off
    };
  });
  var toppings = (cfg && cfg.toppings ? cfg.toppings : []).map(function (t) {
    return { id: String(t.id != null ? t.id : ''), name: String(t.name != null ? t.name : ''), price: Number(t.price != null ? t.price : 0) };
  });
  var fees = (cfg && cfg.shipping_fees) || {};
  return {
    ok: true,
    products: products,
    toppings: toppings,
    shipping_fees: {
      trong_2km: Number(fees.trong_2km != null ? fees.trong_2km : 0),
      den_10km: Number(fees.den_10km != null ? fees.den_10km : 0)
    }
  };
}

/** Đơn từ landing page: parse payload rồi gọi staffSubmit có sẵn (tự validate, tự tính tiền). */
function webOrderResponse_(payloadText) {
  var result;
  try {
    var data = JSON.parse(payloadText);
    result = staffSubmit(data, webKey_());
    if (result && result.ok) result.source = WEB_ORDER_SOURCE;
  } catch (err) {
    result = { ok: false, message: 'Dữ liệu gửi lên không hợp lệ. Vui lòng thử lại.' };
  }
  var html =
    '<!doctype html><html><body><script>' +
    'parent.postMessage(' + JSON.stringify(JSON.stringify(result)) + ', "*");' +
    '</scr' + 'ipt></body></html>';
  return HtmlService.createHtmlOutput(html);
}
