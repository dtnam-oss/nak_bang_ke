# Hướng dẫn sử dụng Webhook Automation với AppSheet

## Tổng quan

Hệ thống webhook cho phép AppSheet tự động cập nhật dữ liệu phương tiện trong Google Sheets thông qua HTTP POST request.

**Có 2 loại webhook:**
1. **Webhook 1**: Cập nhật trạng thái phương tiện (sheet: `phuong_tien`)
2. **Webhook 2**: Cập nhật tình trạng hoạt động phương tiện (sheet: `doi_xe`)

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

## Webhook 2: Cập nhật tình trạng hoạt động phương tiện

### Mục đích

Cập nhật cột `tinh_trang_hoat_dong` trong sheet `doi_xe` với số lượng chuyến đi theo ngày.

### Cấu hình AppSheet

**Body Template:**
```json
{
  "action": "updateActivity",
  "bien_kiem_soat": <<[bien_kiem_soat]>>,
  "ngay_tao": <<[ngay_tao]>>,
  "so_luong_chuyen": <<COUNT(SELECT(chi_tiet_chuyen_di[ma_chuyen_di],[ma_chuyen_di]=[_THISROW].[ma_chuyen_di]))>>
}
```

### Request Format

**POST URL:** `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "action": "updateActivity",
  "bien_kiem_soat": "51C-123.45",
  "ngay_tao": "10/12/2025",
  "so_luong_chuyen": 5
}
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Updated vehicle activity successfully",
  "bien_kiem_soat": "51C-123.45",
  "ngay_tao": "10/12/2025",
  "so_luong_chuyen": 5,
  "row": 3
}
```

**Error:**
```json
{
  "success": false,
  "message": "Vehicle with bien_kiem_soat \"51C-999.99\" not found"
}
```

### Cách hoạt động

1. **AppSheet** kích hoạt automation khi có sự kiện (VD: tạo/cập nhật chuyến đi)
2. AppSheet gửi **POST request** với:
   - `bien_kiem_soat`: Biển kiểm soát xe
   - `ngay_tao`: Ngày tạo (DD/MM/YYYY hoặc YYYY-MM-DD)
   - `so_luong_chuyen`: Số lượng chuyến đi trong ngày
3. Script tìm kiếm trong sheet `doi_xe`:
   - Lookup dòng có `bien_kiem_soat` tương ứng
   - Parse JSON hiện tại từ cột `tinh_trang_hoat_dong`
   - Cập nhật hoặc thêm mới key = `ngay_tao`, value = `{so_luong_chuyen: ...}`
   - Ghi JSON string mới vào cột `tinh_trang_hoat_dong`
4. Trả về kết quả cho AppSheet

### Ví dụ Logic

**Input:**
```json
{
  "action": "updateActivity",
  "bien_kiem_soat": "51C-123.45",
  "ngay_tao": "10/12/2025",
  "so_luong_chuyen": 3
}
```

**Dữ liệu hiện tại trong sheet `doi_xe`:**

| bien_kiem_soat | tinh_trang_hoat_dong |
|---------------|---------------------|
| 51C-123.45    | `{"09/12/2025": {"so_luong_chuyen": 5}}` |

**Sau khi cập nhật:**

| bien_kiem_soat | tinh_trang_hoat_dong |
|---------------|---------------------|
| 51C-123.45    | `{"09/12/2025": {"so_luong_chuyen": 5}, "10/12/2025": {"so_luong_chuyen": 3}}` |

### Test Function

```javascript
function testUpdateVehicleActivity() {
  var result = updateVehicleActivity('51C-123.45', '10/12/2025', 5);
  Logger.log(JSON.stringify(result));
  return result;
}
```

## Logs

Xem logs trong Google Apps Script:
1. Mở Apps Script Editor
2. Click **Executions** (biểu tượng đồng hồ)
3. Xem chi tiết mỗi lần chạy
