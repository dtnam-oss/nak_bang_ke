# Module Kế Toán - Web App (Simplified)

## 🎯 Scope Web App

**Chức năng chính**:
1. ✅ **Xuất bảng kê** - Generate & Download statements
2. ✅ **Báo cáo** - Analytics & Reports

**Chức năng do AppSheet xử lý** (không cần trên Web):
- ❌ Ghi nhận thanh toán
- ❌ Xác nhận thanh toán
- ❌ Nhắc nở
- ❌ Tạo đối soát
- ❌ Workflow approval

---

## 🗄️ Cấu trúc dữ liệu cần thiết

### Tables cần đọc từ BigQuery:

#### 1. `chuyen_di` (Existing)
```sql
SELECT
  id,
  ngay_tao,
  ma_khach_hang,
  ten_khach_hang,
  tuyen_duong,
  bien_so_xe,
  doanh_thu,
  so_tien_da_thanh_toan,
  so_tien_con_no,
  tinh_trang_thanh_toan
FROM chuyen_di
WHERE ...
```

#### 2. `khach_hang` (Existing)
```sql
SELECT
  ma_khach_hang,
  ten_khach_hang,
  email,
  hinh_thuc_thanh_toan,
  chu_ky_cong_no
FROM khach_hang
```

#### 3. `thanh_toan` (Cần thêm - do AppSheet quản lý)
```sql
-- AppSheet sẽ ghi vào table này
-- Web app chỉ đọc để tạo báo cáo
SELECT
  id,
  ma_chuyen_di,
  ma_khach_hang,
  so_tien,
  phuong_thuc,
  ngay_tao,
  trang_thai
FROM thanh_toan
WHERE trang_thai = 'DA_XAC_NHAN'
```

---

## 🎨 UI Design cho Web App

### Layout Module Kế Toán:

```
┌─────────────────────────────────────────────────────┐
│  KẾ TOÁN                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────┐  ┌────────────────┐           │
│  │  📊 BÁO CÁO    │  │  📄 BẢNG KÊ    │           │
│  │                │  │                │           │
│  │  Xem báo cáo   │  │  Xuất bảng kê  │           │
│  │  doanh thu,    │  │  theo khách    │           │
│  │  công nợ       │  │  hàng          │           │
│  │                │  │                │           │
│  │  [Xem →]       │  │  [Tạo →]       │           │
│  └────────────────┘  └────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Chức năng 1: BÁO CÁO

### Tab: Báo cáo

```
┌─────────────────────────────────────────────────────┐
│  BÁO CÁO KẾ TOÁN                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Filters:                                           │
│  [Từ ngày] [Đến ngày] [Khách hàng ▼] [Áp dụng]    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  TỔNG QUAN                                          │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Tổng DT  │  │ Đã thu   │  │ Công nợ  │         │
│  │ 500M     │  │ 350M     │  │ 150M     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  BIỂU ĐỒ DOANH THU THEO THỜI GIAN                  │
│  [Line Chart: Revenue trend]                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  BIỂU ĐỒ CÔNG NỢ THEO KHÁCH HÀNG                   │
│  [Bar Chart: Top 10 receivables by customer]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  AGING ANALYSIS (Phân tích độ tuổi nợ)             │
│  [Pie Chart: 0-30 days, 31-60 days, 60+ days]     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  CHI TIẾT CÔNG NỢ THEO KHÁCH HÀNG                  │
│                                                     │
│  ┌─────────┬─────────┬─────────┬─────────┬───────┐│
│  │ Khách   │ Tổng DT │ Đã thu  │ Còn nợ  │ Tuổi  ││
│  │ hàng    │         │         │         │ nợ TB ││
│  ├─────────┼─────────┼─────────┼─────────┼───────┤│
│  │ GHN     │ 100M    │ 80M     │ 20M     │ 15d   ││
│  │ J&T     │ 80M     │ 50M     │ 30M [!] │ 45d   ││
│  │ GHTK    │ 60M     │ 60M     │ 0       │ 0d    ││
│  └─────────┴─────────┴─────────┴─────────┴───────┘│
│                                                     │
│  [📥 Xuất Excel]  [🖨️ In báo cáo]                  │
└─────────────────────────────────────────────────────┘
```

### Queries cho Báo cáo:

#### Query 1: Tổng hợp overview
```sql
WITH summary AS (
  SELECT
    SUM(doanh_thu) as tong_doanh_thu,
    SUM(so_tien_da_thanh_toan) as tong_da_thu,
    SUM(so_tien_con_no) as tong_con_no,
    COUNT(DISTINCT ma_khach_hang) as so_khach_hang,
    COUNT(*) as so_chuyen_di
  FROM chuyen_di
  WHERE DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
    AND (@ma_khach_hang IS NULL OR ma_khach_hang = @ma_khach_hang)
)
SELECT * FROM summary;
```

#### Query 2: Doanh thu theo thời gian (Line chart)
```sql
SELECT
  DATE(ngay_tao) as ngay,
  SUM(doanh_thu) as doanh_thu,
  SUM(so_tien_da_thanh_toan) as da_thu,
  SUM(so_tien_con_no) as con_no
FROM chuyen_di
WHERE DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
GROUP BY DATE(ngay_tao)
ORDER BY ngay ASC;
```

#### Query 3: Công nợ theo khách hàng (Bar chart)
```sql
SELECT
  ten_khach_hang,
  SUM(doanh_thu) as tong_doanh_thu,
  SUM(so_tien_da_thanh_toan) as da_thu,
  SUM(so_tien_con_no) as con_no,

  -- Tuổi nợ trung bình
  AVG(DATE_DIFF(CURRENT_DATE(), DATE(ngay_tao), DAY)) as tuoi_no_tb

FROM chuyen_di
WHERE so_tien_con_no > 0
GROUP BY ten_khach_hang
ORDER BY con_no DESC
LIMIT 10;
```

#### Query 4: Aging analysis (Pie chart)
```sql
SELECT
  CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(ngay_tao), DAY) <= 30
      THEN '0-30 ngay'
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(ngay_tao), DAY) BETWEEN 31 AND 60
      THEN '31-60 ngay'
    ELSE 'Tren 60 ngay'
  END as nhom_tuoi_no,

  SUM(so_tien_con_no) as tong_con_no

FROM chuyen_di
WHERE so_tien_con_no > 0
GROUP BY nhom_tuoi_no;
```

---

## 📄 Chức năng 2: XUẤT BẢNG KÊ

### UI: Tạo bảng kê

```
┌─────────────────────────────────────────────────────┐
│  TẠO BẢNG KÊ                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Bước 1: Chọn thông tin                             │
│                                                     │
│  Khách hàng: [Chọn khách hàng ▼]                   │
│                                                     │
│  Kỳ bảng kê: [○ Tháng] [○ Quý] [○ Tùy chọn]       │
│                                                     │
│  Từ ngày: [01/01/2025]  Đến ngày: [31/01/2025]     │
│                                                     │
│  Template:                                          │
│  [○ Cơ bản]    - Tổng hợp + Danh sách chuyến đi   │
│  [●  Chi tiết]  - Đầy đủ thông tin + Thanh toán    │
│  [○ Rút gọn]   - Chỉ summary                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Bước 2: Preview                                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  BẢNG KÊ DOANH THU                            │ │
│  │  Khách hàng: GHN Express                      │ │
│  │  Kỳ: Tháng 01/2025                            │ │
│  │                                                │ │
│  │  TỔNG HỢP:                                     │ │
│  │  - Tổng doanh thu:      100,000,000 đ        │ │
│  │  - Đã thanh toán:        80,000,000 đ        │ │
│  │  - Còn nợ:               20,000,000 đ        │ │
│  │                                                │ │
│  │  CHI TIẾT:                                     │ │
│  │  [Table: Ngày, Mã CD, Tuyến, Biển số, DT...] │ │
│  │  ...                                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [◄ Quay lại]  [📥 Tải Excel]  [📄 Tải PDF]       │
└─────────────────────────────────────────────────────┘
```

### Query cho Bảng kê:

```sql
-- Header info
SELECT
  kh.ma_khach_hang,
  kh.ten_khach_hang,
  kh.email,
  kh.so_dien_thoai,
  kh.dia_chi
FROM khach_hang kh
WHERE kh.ma_khach_hang = @ma_khach_hang;

-- Summary
SELECT
  COUNT(*) as so_chuyen_di,
  SUM(doanh_thu) as tong_doanh_thu,
  SUM(so_tien_da_thanh_toan) as tong_da_thanh_toan,
  SUM(so_tien_con_no) as tong_con_no
FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay;

-- Details
SELECT
  DATE(ngay_tao) as ngay,
  id as ma_chuyen_di,
  tuyen_duong,
  bien_so_xe,
  doanh_thu,
  so_tien_da_thanh_toan,
  so_tien_con_no,
  tinh_trang_thanh_toan,

  -- Payment history (nếu cần chi tiết)
  (
    SELECT ARRAY_AGG(
      STRUCT(
        DATE(tt.ngay_tao) as ngay_thanh_toan,
        tt.so_tien,
        tt.phuong_thuc
      )
    )
    FROM thanh_toan tt
    WHERE tt.ma_chuyen_di = chuyen_di.id
      AND tt.trang_thai = 'DA_XAC_NHAN'
  ) as lich_su_thanh_toan

FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
ORDER BY ngay_tao ASC;
```

---

## 📥 Export Formats

### 1. Excel Export

**Structure**:
```
Sheet 1: TONG_HOP
┌────────────────┬──────────────┐
│ Thông tin KH   │ Giá trị      │
├────────────────┼──────────────┤
│ Mã KH          │ GHN_001      │
│ Tên KH         │ GHN Express  │
│ Kỳ             │ T01/2025     │
│ Từ ngày        │ 01/01/2025   │
│ Đến ngày       │ 31/01/2025   │
└────────────────┴──────────────┘

┌────────────────┬──────────────┐
│ Chỉ tiêu       │ Số tiền      │
├────────────────┼──────────────┤
│ Tổng doanh thu │ 100,000,000  │
│ Đã thanh toán  │  80,000,000  │
│ Còn nợ         │  20,000,000  │
└────────────────┴──────────────┘

Sheet 2: CHI_TIET
┌──────┬──────┬───────┬────────┬─────────┬────────┬────────┐
│ Ngày │ Mã CD│ Tuyến │ Biển số│ Doanh thu│ Đã thu │ Còn nợ │
├──────┼──────┼───────┼────────┼─────────┼────────┼────────┤
│01/01 │CD001 │HCM-HN │51A-123 │5,000,000│5,000,000│    0   │
│02/01 │CD002 │HCM-DN │51B-456 │3,000,000│2,000,000│1,000,000│
│...   │...   │...    │...     │...      │...     │...     │
└──────┴──────┴───────┴────────┴─────────┴────────┴────────┘

Sheet 3: THANH_TOAN (Optional - nếu template chi tiết)
┌──────┬──────┬───────────┬──────────┬────────┐
│ Ngày │ Mã CD│ Ngày TT   │ Số tiền  │ PT     │
├──────┼──────┼───────────┼──────────┼────────┤
│01/01 │CD001 │03/01/2025 │5,000,000│Chuyển khoản│
│...   │...   │...        │...       │...     │
└──────┴──────┴───────────┴──────────┴────────┘
```

**Code mẫu (Google Apps Script)**:
```javascript
function exportToExcel(data) {
  var ss = SpreadsheetApp.create('Bang_ke_' + data.ma_khach_hang + '_' + data.ky);

  // Sheet 1: Summary
  var sheet1 = ss.getSheets()[0];
  sheet1.setName('TONG_HOP');
  sheet1.getRange('A1:B10').setValues([
    ['BẢNG KÊ DOANH THU', ''],
    ['Khách hàng', data.ten_khach_hang],
    ['Kỳ', data.ky],
    ['Từ ngày', data.tu_ngay],
    ['Đến ngày', data.den_ngay],
    ['', ''],
    ['Tổng doanh thu', data.tong_doanh_thu],
    ['Đã thanh toán', data.tong_da_thanh_toan],
    ['Còn nợ', data.tong_con_no]
  ]);

  // Sheet 2: Details
  var sheet2 = ss.insertSheet('CHI_TIET');
  var headers = [['Ngày', 'Mã chuyến', 'Tuyến', 'Biển số', 'Doanh thu', 'Đã thu', 'Còn nợ']];
  sheet2.getRange(1, 1, 1, 7).setValues(headers);
  sheet2.getRange(2, 1, data.chi_tiet.length, 7).setValues(data.chi_tiet);

  // Format
  sheet1.getRange('A1:B1').setFontWeight('bold').setFontSize(14);
  sheet2.getRange('1:1').setFontWeight('bold');

  return ss.getUrl();
}
```

### 2. PDF Export

**Template cấu trúc**:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [LOGO CÔNG TY]     NAK LOGISTICS               │
│                                                 │
│         BẢNG KÊ CHI TIẾT DOANH THU             │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Khách hàng: GHN EXPRESS                        │
│  Mã KH: GHN_001                                 │
│  Kỳ báo cáo: Tháng 01/2025                      │
│  Từ ngày: 01/01/2025 - Đến ngày: 31/01/2025     │
│                                                 │
├─────────────────────────────────────────────────┤
│  TỔNG HỢP                                       │
│                                                 │
│  Tổng doanh thu:        100,000,000 đ          │
│  Đã thanh toán:          80,000,000 đ          │
│  Còn nợ:                 20,000,000 đ          │
│                                                 │
├─────────────────────────────────────────────────┤
│  CHI TIẾT CÁC CHUYẾN ĐI                         │
│                                                 │
│  [Table with borders]                           │
│  ┌────┬─────┬──────┬───────┬────────┬────────┐ │
│  │Ngày│Mã CD│Tuyến │Biển số│Doanh thu│Còn nợ │ │
│  ├────┼─────┼──────┼───────┼────────┼────────┤ │
│  │... │...  │...   │...    │...     │...     │ │
│  └────┴─────┴──────┴───────┴────────┴────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Ngày lập: [Auto date]                          │
│  Người lập: [User name]                         │
│                                                 │
│  _______________          _______________       │
│  Kế toán                  Khách hàng xác nhận   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Note**: Google Apps Script có giới hạn trong việc generate PDF phức tạp. Có 2 options:
1. **Sử dụng Google Docs template** → Fill data → Export as PDF
2. **Sử dụng HTML → PDF** (simpler but limited styling)

---

## 🔌 Backend Services (Google Apps Script)

### Service 1: `getBaoCaoData(filter)`

```javascript
function getBaoCaoData(filter) {
  var query = `
    SELECT
      ten_khach_hang,
      SUM(doanh_thu) as tong_doanh_thu,
      SUM(so_tien_da_thanh_toan) as da_thu,
      SUM(so_tien_con_no) as con_no,
      AVG(DATE_DIFF(CURRENT_DATE(), DATE(ngay_tao), DAY)) as tuoi_no_tb
    FROM chuyen_di
    WHERE DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
      AND (@ma_khach_hang IS NULL OR ma_khach_hang = @ma_khach_hang)
      AND so_tien_con_no > 0
    GROUP BY ten_khach_hang
    ORDER BY con_no DESC
    LIMIT 10
  `;

  var params = {
    tu_ngay: filter.tu_ngay,
    den_ngay: filter.den_ngay,
    ma_khach_hang: filter.ma_khach_hang || null
  };

  return BigQueryService.runQuery(query, params);
}
```

### Service 2: `generateBangKe(params)`

```javascript
function generateBangKe(params) {
  // 1. Get customer info
  var customerQuery = `
    SELECT * FROM khach_hang WHERE ma_khach_hang = @ma_khach_hang
  `;
  var customer = BigQueryService.runQuery(customerQuery, {
    ma_khach_hang: params.ma_khach_hang
  })[0];

  // 2. Get summary
  var summaryQuery = `
    SELECT
      COUNT(*) as so_chuyen_di,
      SUM(doanh_thu) as tong_doanh_thu,
      SUM(so_tien_da_thanh_toan) as tong_da_thanh_toan,
      SUM(so_tien_con_no) as tong_con_no
    FROM chuyen_di
    WHERE ma_khach_hang = @ma_khach_hang
      AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
  `;
  var summary = BigQueryService.runQuery(summaryQuery, params)[0];

  // 3. Get details
  var detailsQuery = `
    SELECT
      DATE(ngay_tao) as ngay,
      id as ma_chuyen_di,
      tuyen_duong,
      bien_so_xe,
      doanh_thu,
      so_tien_da_thanh_toan,
      so_tien_con_no
    FROM chuyen_di
    WHERE ma_khach_hang = @ma_khach_hang
      AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
    ORDER BY ngay_tao ASC
  `;
  var details = BigQueryService.runQuery(detailsQuery, params);

  // 4. Return combined data
  return {
    customer: customer,
    summary: summary,
    details: details,
    ky: params.ky,
    tu_ngay: params.tu_ngay,
    den_ngay: params.den_ngay
  };
}
```

### Service 3: `exportBangKeToExcel(data)`

```javascript
function exportBangKeToExcel(data) {
  var filename = 'BangKe_' + data.customer.ma_khach_hang + '_' +
                 data.ky.replace(/\//g, '-');

  var ss = SpreadsheetApp.create(filename);

  // Sheet 1: Summary
  var summarySheet = ss.getSheets()[0];
  summarySheet.setName('TONG_HOP');

  var summaryData = [
    ['BẢNG KÊ DOANH THU'],
    ['Khách hàng', data.customer.ten_khach_hang],
    ['Mã KH', data.customer.ma_khach_hang],
    ['Kỳ', data.ky],
    ['Từ ngày', data.tu_ngay],
    ['Đến ngày', data.den_ngay],
    [''],
    ['Số chuyến đi', data.summary.so_chuyen_di],
    ['Tổng doanh thu', formatCurrency(data.summary.tong_doanh_thu)],
    ['Đã thanh toán', formatCurrency(data.summary.tong_da_thanh_toan)],
    ['Còn nợ', formatCurrency(data.summary.tong_con_no)]
  ];

  summarySheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  summarySheet.getRange('A1:B1').merge().setFontSize(14).setFontWeight('bold');

  // Sheet 2: Details
  var detailsSheet = ss.insertSheet('CHI_TIET');

  var headers = [['Ngày', 'Mã chuyến', 'Tuyến', 'Biển số', 'Doanh thu', 'Đã thu', 'Còn nợ']];
  detailsSheet.getRange(1, 1, 1, 7).setValues(headers);
  detailsSheet.getRange('1:1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');

  var detailRows = data.details.map(function(row) {
    return [
      row.ngay,
      row.ma_chuyen_di,
      row.tuyen_duong,
      row.bien_so_xe,
      formatCurrency(row.doanh_thu),
      formatCurrency(row.so_tien_da_thanh_toan),
      formatCurrency(row.so_tien_con_no)
    ];
  });

  detailsSheet.getRange(2, 1, detailRows.length, 7).setValues(detailRows);

  // Auto-resize columns
  detailsSheet.autoResizeColumns(1, 7);

  // Return spreadsheet URL
  return ss.getUrl();
}

function formatCurrency(value) {
  return value.toLocaleString('vi-VN') + ' đ';
}
```

---

## 🎨 UI Components Code

### UIComponents.html - Add Kế Toán Tab

```javascript
renderKeToanPage: function() {
  var html = '<div class="ke-toan-page">';

  // Header
  html += '<div class="page-header">';
  html += '<h1>Ke Toan</h1>';
  html += '<p>Bao cao doanh thu va xuat bang ke</p>';
  html += '</div>';

  // Main content
  html += '<div class="ke-toan-content">';

  // Module cards
  html += '<div class="module-cards">';

  // Card 1: Báo cáo
  html += '<div class="module-card" onclick="App.navigate(\'ke-toan-bao-cao\')">';
  html += '<div class="card-icon" style="background: #2196f3;">';
  html += '<i class="material-icons-outlined">analytics</i>';
  html += '</div>';
  html += '<div class="card-content">';
  html += '<h3>Bao cao</h3>';
  html += '<p>Xem bao cao doanh thu, cong no theo khach hang</p>';
  html += '</div>';
  html += '<i class="material-icons-outlined">arrow_forward</i>';
  html += '</div>';

  // Card 2: Bảng kê
  html += '<div class="module-card" onclick="App.navigate(\'ke-toan-bang-ke\')">';
  html += '<div class="card-icon" style="background: #4caf50;">';
  html += '<i class="material-icons-outlined">description</i>';
  html += '</div>';
  html += '<div class="card-content">';
  html += '<h3>Bang ke</h3>';
  html += '<p>Tao va xuat bang ke chi tiet theo khach hang</p>';
  html += '</div>';
  html += '<i class="material-icons-outlined">arrow_forward</i>';
  html += '</div>';

  html += '</div>'; // module-cards
  html += '</div>'; // ke-toan-content
  html += '</div>'; // ke-toan-page

  return html;
}
```

---

## 📱 Responsive Design

### CSS for Kế Toán Module

```css
.ke-toan-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 8px;
}

.page-header p {
  color: #6c757d;
  font-size: 14px;
}

.module-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 800px;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.module-card:hover {
  border-color: #2196f3;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 24px;
  color: white;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.card-content p {
  font-size: 13px;
  color: #6c757d;
}

.module-card > i {
  color: #6c757d;
  transition: all 0.3s;
}

.module-card:hover > i {
  color: #2196f3;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .module-cards {
    grid-template-columns: 1fr;
  }
}
```

---

## 🚀 Implementation Plan (Simplified)

### Week 1: Setup & Queries
- [ ] Design BigQuery queries for reports
- [ ] Test queries with sample data
- [ ] Create API services in Apps Script

### Week 2: Báo cáo Module
- [ ] Build báo cáo UI (filters, charts, table)
- [ ] Integrate with BigQuery
- [ ] Excel export functionality

### Week 3: Bảng kê Module
- [ ] Build bảng kê form UI
- [ ] Preview functionality
- [ ] Excel export
- [ ] PDF export (if time permits)

### Week 4: Polish & Testing
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Testing with real data
- [ ] Documentation

---

## ✅ Summary

**Web App chỉ làm 2 việc**:

1. **📊 Báo cáo**:
   - Overview cards (Tổng DT, Đã thu, Công nợ)
   - Line chart (Revenue trend)
   - Bar chart (Top receivables)
   - Pie chart (Aging analysis)
   - Table (Chi tiết theo khách hàng)
   - Export Excel

2. **📄 Bảng kê**:
   - Form chọn KH + kỳ + template
   - Preview bảng kê
   - Export Excel
   - Export PDF (optional)

**AppSheet xử lý**:
- Ghi nhận thanh toán
- Xác nhận thanh toán
- Nhắc nợ
- Workflow approval

**Database cần**:
- `chuyen_di` (existing)
- `khach_hang` (existing)
- `thanh_toan` (AppSheet quản lý, Web app chỉ đọc)

---

**Status**: Simplified Design Complete
**Next**: Implement báo cáo module first
**Estimate**: 3-4 weeks
