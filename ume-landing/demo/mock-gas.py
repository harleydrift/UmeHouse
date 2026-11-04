"""Giả lập endpoint Google Apps Script kênh "landing" để demo landing page cục bộ.
Chạy: python3 mock-gas.py  (cổng 8788)
Đúng hợp đồng script thật (apps-script/Code.gs, phần webRequest_/webResponse_):
  GET  /exec  → publicConfig_(): menu, topping, xã + phí ship, khung giờ
  POST /exec  → createOrder_(body, 'landing'): body JSON, cần source:"landing"
Chỉ dùng để test — KHÔNG deploy, đơn chỉ ghi vào /tmp/ume-orders.jsonl
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import json, re, uuid

PRODUCTS = [
    {'product_id': 'TS01', 'name': 'Trà sữa đậm vị', 'price': 49000},
    {'product_id': 'TS02', 'name': 'Trà sữa trân châu đường đen', 'price': 49000},
    {'product_id': 'TS03', 'name': 'Ô long sữa quế hoa', 'price': 49000},
    {'product_id': 'TS04', 'name': 'Trà sữa thái xanh', 'price': 49000},
    {'product_id': 'TS05', 'name': 'Ô long đào sữa', 'price': 49000},
    {'product_id': 'TS06', 'name': 'Trà sữa hạt dẻ', 'price': 49000},
    {'product_id': 'TS07', 'name': 'Trà đào cam sả', 'price': 49000},
    {'product_id': 'TS08', 'name': 'Trà xoài chanh dây', 'price': 49000},
]
TOPPINGS = [
    {'topping_id': 'tran-chau-den', 'name': 'Trân châu đen', 'price': 0},
    {'topping_id': 'thach-pho-mai', 'name': 'Thạch phô mai', 'price': 5000},
]
COMMUNES = [
    {'name': 'Đồng Quang', 'fee': 10000, 'free_from_cups': 2},
    {'name': 'Cộng Hòa', 'fee': 15000, 'free_from_cups': 0},
    {'name': 'Yên Bài', 'fee': 20000, 'free_from_cups': 0},
    {'name': 'Tuyết Nghĩa', 'fee': 25000, 'free_from_cups': 0},
    {'name': 'Đông Yên', 'fee': 30000, 'free_from_cups': 0},
]
CONFIG = {
    'ok': True,
    'orders_open': True,
    'transfer_enabled': False,
    'products': PRODUCTS,
    'toppings': TOPPINGS,
    'shipping_fees': {'tu_lay': 0},
    'communes': COMMUNES,
    'delivery_slots': [
        {'start': 9, 'end': 11},
        {'start': 15, 'end': 17},
        {'start': 20, 'end': 22},
    ],
    'slot_lead_minutes': 60,
}
SEEN_SUBMISSIONS = set()  # giả lập chống trùng theo submission_id như script thật

PRODUCT_BY_ID = {p['product_id']: p for p in PRODUCTS}
TOPPING_BY_ID = {t['topping_id']: t for t in TOPPINGS}
COMMUNE_BY_NAME = {c['name']: c for c in COMMUNES}


def cors(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')


class H(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        cors(self)
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        cors(self)
        self.end_headers()
        self.wfile.write(json.dumps(CONFIG, ensure_ascii=False).encode('utf-8'))

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length).decode('utf-8')
        result = self.handle_order(raw)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        cors(self)
        self.end_headers()
        self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))

    def handle_order(self, raw):
        try:
            data = json.loads(raw)
            assert data.get('source') == 'landing', 'Nguồn đơn không hợp lệ'
            assert data.get('submission_id'), 'missing submission_id'
            if data['submission_id'] in SEEN_SUBMISSIONS:
                return {'ok': True, 'order_code': 'UM-DEMO-DUP', 'total': 0, 'shipping_fee': 0,
                        'message': 'Đơn đã được ghi nhận trước đó (chống trùng).'}
            assert data.get('name') and data.get('phone'), 'missing name/phone'
            assert isinstance(data.get('items'), list) and data['items'], 'missing items'
            assert data.get('delivery_method') in ('giao', 'tu_lay'), 'bad delivery_method'
            assert data.get('payment_method') in ('cod', 'chuyen_khoan'), 'bad payment_method'

            cups, subtotal = 0, 0
            for it in data['items']:
                p = PRODUCT_BY_ID.get(it.get('product_id'))
                assert p, 'sai product_id'
                qty = int(it.get('quantity', 0))
                assert qty > 0, 'quantity phải > 0'
                cups += qty
                subtotal += qty * p['price']
                for tid in (it.get('toppings') or []):
                    t = TOPPING_BY_ID.get(tid)
                    assert t, 'sai topping_id'
                    subtotal += qty * t['price']

            fee = 0
            slot = str(data.get('delivery_slot') or '')
            if data['delivery_method'] == 'giao':
                c = COMMUNE_BY_NAME.get(data.get('zone'))
                assert c, 'sai zone (tên xã)'
                assert len(data.get('address', '')) >= 6, 'thiếu địa chỉ'
                # đúng định dạng hệ thống thật: "2026-11-04 20–22h" (gạch ngang en dash)
                m = re.fullmatch(r'(\d{4}-\d{2}-\d{2}) (\d+)–(\d+)h', slot)
                assert m, 'Khung giờ giao đã hết hoặc chưa chọn (cần dạng "YYYY-MM-DD H–Hh")'
                pair = (int(m.group(2)), int(m.group(3)))
                assert any((s['start'], s['end']) == pair for s in CONFIG['delivery_slots']), 'khung giờ không tồn tại'
                fee = 0 if (c['free_from_cups'] and cups >= c['free_from_cups']) else c['fee']
            else:
                assert not slot, 'đơn tự lấy để trống khung giờ'

            code = 'UM-DEMO-' + uuid.uuid4().hex[:4].upper()
            SEEN_SUBMISSIONS.add(data['submission_id'])
            with open('/tmp/ume-orders.jsonl', 'a', encoding='utf-8') as f:
                f.write(json.dumps({'order_code': code, 'total': subtotal + fee,
                                    'shipping_fee': fee, **data}, ensure_ascii=False) + '\n')
            return {'ok': True, 'order_code': code, 'total': subtotal + fee,
                    'shipping_fee': fee,
                    'delivery_slot': '%s %s' % (slot.split(' ')[1].replace('-', '–'), slot.split(' ')[0][8:]) if slot else '',
                    'message': 'Đã nhận đơn (demo)'}
        except AssertionError as ex:
            return {'ok': False, 'message': 'Dữ liệu không hợp lệ: %s' % ex}
        except Exception as ex:
            return {'ok': False, 'message': 'Lỗi: %s' % ex}

    def log_message(self, *a):
        pass


HTTPServer(('127.0.0.1', 8788), H).serve_forever()
