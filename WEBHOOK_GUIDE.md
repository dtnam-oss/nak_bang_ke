# Hướng dẫn sử dụng Webhook Automation với AppSheet

## Tổng quan

Hệ thống webhook cho phép AppSheet tự động cập nhật trạng thái phương tiện trong Google Sheets thông qua HTTP POST request.

## Cấu hình

### 1. Google Sheets Setup

**Spreadsheet ID:** `1fzepYrS-o5zc01h7nQFzJSOwagoTvOgoiDQHrTLB12E`
**Sheet Name:** `phuong_tien`

**Các cột bắt buộc:**
- `tai_xe_theo_xe`: Chứa mã tài xế (VD: "LX216", "LX215")
- `trang_thai`: Trạng thái chuyến đi (sẽ được cập nhật)

### 2. Deploy Google Apps Script

1. Mở Google Apps Script Editor
2. Copy code từ file `Code.gs`
3. Deploy webapp:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy **Web app URL** (dạng: `https://script.google.com/macros/s/.../exec`)

### 3. AppSheet Webhook Configuration

#### Trong AppSheet Automation:

1. Tạo Bot mới hoặc chỉnh sửa Bot hiện có
2. Thêm Process → **Call a webhook**
3. Cấu hình:

**URL:** (Web app URL từ bước 2)

**HTTP Method:** `POST`

**HTTP Headers:**
```
Content-Type: application/json
```

**Body Template:**
```json
{
  "ma_tai_xe": [<<[ma_tai_xe]>>],
  "trang_thai_chuyen_di": "Đang giao hàng"
}
```

## Cách sử dụng

### Request Format

**POST URL:** `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "ma_tai_xe": "LX216",
  "trang_thai_chuyen_di": "Đang giao hàng"
}
```

hoặc với nhiều tài xế:

```json
{
  "ma_tai_xe": ["LX216", "LX215"],
  "trang_thai_chuyen_di": "Đang giao hàng"
}
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Updated 2 row(s)",
  "updatedCount": 2,
  "updatedRows": [3, 5],
  "ma_tai_xe": ["LX216", "LX215"],
  "trang_thai_chuyen_di": "Đang giao hàng"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Cách hoạt động

1. **AppSheet** kích hoạt automation khi có sự kiện (VD: trạng thái chuyến đi thay đổi)
2. AppSheet gửi **POST request** đến Google Apps Script Web App
3. Web App nhận data với:
   - `ma_tai_xe`: Mã tài xế (string hoặc array)
   - `trang_thai_chuyen_di`: Trạng thái mới
4. Script tìm kiếm trong sheet `phuong_tien`:
   - Tìm các dòng mà cột `tai_xe_theo_xe` **chứa** mã tài xế
   - Cập nhật cột `trang_thai` với giá trị mới
5. Trả về kết quả cho AppSheet

## Ví dụ Logic

### Input:
```json
{
  "ma_tai_xe": ["LX216", "LX215"],
  "trang_thai_chuyen_di": "Đang giao hàng"
}
```

### Trong Sheet `phuong_tien`:

| tai_xe_theo_xe | trang_thai | ... |
|---------------|-----------|-----|
| LX216         | Sẵn sàng  | ... |
| LX215, LX220  | Sẵn sàng  | ... |
| LX230         | Sẵn sàng  | ... |

### Sau khi cập nhật:

| tai_xe_theo_xe | trang_thai      | ... |
|---------------|----------------|-----|
| LX216         | Đang giao hàng | ... |
| LX215, LX220  | Đang giao hàng | ... |
| LX230         | Sẵn sàng       | ... |

## Test Function

Trong Google Apps Script Editor, có sẵn function để test:

```javascript
function testUpdateVehicleStatus() {
  var result = updateVehicleStatus(['LX216', 'LX215'], 'Đang giao hàng');
  Logger.log(JSON.stringify(result));
  return result;
}
```

Chạy function này để kiểm tra xem automation có hoạt động không.

## Troubleshooting

### 1. Error: "Missing required parameters"
- Kiểm tra JSON body có đúng format không
- Đảm bảo có đủ 2 fields: `ma_tai_xe` và `trang_thai_chuyen_di`

### 2. Error: "Sheet 'phuong_tien' not found"
- Kiểm tra tên sheet trong Google Sheets
- Đảm bảo Spreadsheet ID đúng

### 3. Error: "Required columns not found"
- Kiểm tra tên cột trong sheet
- Cần có cột: `tai_xe_theo_xe` và `trang_thai`

### 4. Không có dòng nào được cập nhật (updatedCount = 0)
- Kiểm tra giá trị `ma_tai_xe` có tồn tại trong cột `tai_xe_theo_xe` không
- So sánh sử dụng `indexOf` nên chỉ cần chứa, không cần khớp hoàn toàn

## Security Notes

- Web app được deploy với "Execute as: Me" nên chạy với quyền của người deploy
- "Who has access: Anyone" cho phép AppSheet call webhook không cần authentication
- Nên thêm API key hoặc secret token để bảo mật nếu cần

## Logs

Xem logs trong Google Apps Script:
1. Mở Apps Script Editor
2. Click **Executions** (biểu tượng đồng hồ)
3. Xem chi tiết mỗi lần chạy
