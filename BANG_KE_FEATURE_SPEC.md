# Tính năng Xuất Bảng Kê - Chi tiết Specification

## 🎯 Requirements Summary

### Templates (4 loại):
1. **Template 1**: Cơ bản - Tổng hợp + Danh sách chuyến đi
2. **Template 2**: Chi tiết - Đầy đủ thông tin + Lịch sử thanh toán
3. **Template 3**: Theo tuyến - Nhóm theo tuyến đường
4. **Template 4**: Rút gọn - Chỉ summary theo ngày

### Export Formats:
- **Excel** (.xlsx) - Chi tiết, có thể chỉnh sửa
- **PDF** (.pdf) - In ấn, có logo + chữ ký

### Filters:
1. **Khách hàng** - Dropdown select
2. **Loại tuyến** - Dropdown (HCM-HN, HCM-DN, etc.)
3. **Kỳ** - Date range picker (Từ ngày → Đến ngày)

### Workflow:
```
Chọn filters → Preview dữ liệu → Chọn template → Export (Excel/PDF)
```

---

## 🎨 UI Design - Màn hình Xuất Bảng Kê

### Full Screen Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  XUẤT BẢNG KÊ                                    [X Close]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BỘ LỌC                                             │   │
│  │                                                     │   │
│  │  Khách hàng: [Chọn khách hàng         ▼]          │   │
│  │                                                     │   │
│  │  Loại tuyến:  [Chọn tuyến (optional)  ▼]          │   │
│  │                                                     │   │
│  │  Kỳ bảng kê:  [01/01/2025] - [31/01/2025]  [📅]   │   │
│  │                                                     │   │
│  │               [🔍 Xem trước dữ liệu]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PREVIEW DỮ LIỆU                                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Thông tin khách hàng                               │   │
│  │  ───────────────────────────────────────────────    │   │
│  │  Tên: GHN Express                                   │   │
│  │  Mã: GHN_001                                        │   │
│  │  Kỳ: 01/01/2025 - 31/01/2025                        │   │
│  │                                                     │   │
│  │  Tổng hợp                                           │   │
│  │  ───────────────────────────────────────────────    │   │
│  │  • Số chuyến đi: 45 chuyến                          │   │
│  │  • Tổng doanh thu: 100,000,000 đ                   │   │
│  │  • Đã thanh toán: 80,000,000 đ                     │   │
│  │  • Còn nợ: 20,000,000 đ                            │   │
│  │                                                     │   │
│  │  Chi tiết (5 chuyến đầu)                           │   │
│  │  ───────────────────────────────────────────────    │   │
│  │  ┌──────┬──────┬─────────┬─────────┬─────────┐    │   │
│  │  │ Ngày │ Mã CD│ Tuyến   │ Doanh thu│ Còn nợ │    │   │
│  │  ├──────┼──────┼─────────┼─────────┼─────────┤    │   │
│  │  │01/01 │CD001 │ HCM-HN  │5,000,000│    0    │    │   │
│  │  │02/01 │CD002 │ HCM-DN  │3,000,000│1,000,000│    │   │
│  │  │03/01 │CD003 │ HCM-HN  │5,000,000│    0    │    │   │
│  │  │...   │...   │ ...     │...      │...      │    │   │
│  │  └──────┴──────┴─────────┴─────────┴─────────┘    │   │
│  │                                                     │   │
│  │  ... và 40 chuyến nữa (xem trong file xuất)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  XUẤT FILE                                                  │
│                                                             │
│  Chọn template:                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ [○] Template 1│  │ [○] Template 2│  │ [○] Template 3│     │
│  │  Cơ bản      │  │  Chi tiết    │  │  Theo tuyến  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐                                          │
│  │ [●] Template 4│  (Selected)                             │
│  │  Rút gọn     │                                          │
│  └──────────────┘                                          │
│                                                             │
│  [📥 Tải Excel]  [📄 Tải PDF]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Template Specifications

### Template 1: CƠ BẢN
**Mô tả**: Tổng hợp + Danh sách đơn giản

**Excel Structure**:
```
Sheet 1: TONG_HOP
┌─────────────────────────────────────────┐
│  BẢNG KÊ DOANH THU                      │
│  Khách hàng: GHN Express                │
│  Mã KH: GHN_001                         │
│  Kỳ: 01/01/2025 - 31/01/2025            │
│                                         │
│  ═══════════════════════════════════    │
│  TỔNG HỢP                               │
│  ═══════════════════════════════════    │
│  Số chuyến đi:        45 chuyến        │
│  Tổng doanh thu:      100,000,000 đ    │
│  Đã thanh toán:        80,000,000 đ    │
│  Còn nợ:               20,000,000 đ    │
└─────────────────────────────────────────┘

Sheet 2: DANH_SACH
┌──────┬─────────┬──────────┬────────────┬────────────┬────────────┐
│ STT  │ Ngày    │ Mã CD    │ Tuyến      │ Doanh thu  │ Còn nợ     │
├──────┼─────────┼──────────┼────────────┼────────────┼────────────┤
│  1   │ 01/01   │ CD001    │ HCM-HN     │ 5,000,000  │      0     │
│  2   │ 02/01   │ CD002    │ HCM-DN     │ 3,000,000  │ 1,000,000  │
│  3   │ 03/01   │ CD003    │ HCM-HN     │ 5,000,000  │      0     │
│ ...  │ ...     │ ...      │ ...        │ ...        │ ...        │
└──────┴─────────┴──────────┴────────────┴────────────┴────────────┘
```

**PDF Layout**: Simple 1-page summary + table

---

### Template 2: CHI TIẾT
**Mô tả**: Đầy đủ thông tin + Lịch sử thanh toán

**Excel Structure**:
```
Sheet 1: TONG_HOP (Same as Template 1)

Sheet 2: CHI_TIET
┌─────┬──────┬────────┬──────────┬─────────┬─────────┬────────┬───────────┐
│ STT │ Ngày │ Mã CD  │ Tuyến    │ Biển số │ Doanh thu│ Đã thu│ Còn nợ    │
├─────┼──────┼────────┼──────────┼─────────┼─────────┼────────┼───────────┤
│  1  │01/01 │ CD001  │ HCM-HN   │51A-12345│5,000,000│5,000,000│     0     │
│  2  │02/01 │ CD002  │ HCM-DN   │51B-67890│3,000,000│2,000,000│ 1,000,000 │
│ ... │ ...  │ ...    │ ...      │ ...     │ ...     │ ...    │ ...       │
└─────┴──────┴────────┴──────────┴─────────┴─────────┴────────┴───────────┘

Sheet 3: LICH_SU_THANH_TOAN (Optional - nếu có data từ table thanh_toan)
┌─────┬──────────┬──────────────┬────────────┬──────────────────┐
│ STT │ Mã CD    │ Ngày TT      │ Số tiền    │ Phương thức      │
├─────┼──────────┼──────────────┼────────────┼──────────────────┤
│  1  │ CD001    │ 03/01/2025   │ 5,000,000  │ Chuyển khoản     │
│  2  │ CD002    │ 05/01/2025   │ 2,000,000  │ Tiền mặt         │
│ ... │ ...      │ ...          │ ...        │ ...              │
└─────┴──────────┴──────────────┴────────────┴──────────────────┘
```

**PDF Layout**: Multi-page with detailed table

---

### Template 3: THEO TUYẾN
**Mô tả**: Nhóm theo từng tuyến đường

**Excel Structure**:
```
Sheet 1: TONG_HOP (Same as Template 1)

Sheet 2: THEO_TUYEN
┌─────────────────────────────────────────────────────────────┐
│  TUYẾN: HCM - HÀ NỘI                                        │
│  ═════════════════════════════════════════════════════      │
│  Số chuyến: 20 chuyến                                       │
│  Tổng doanh thu: 50,000,000 đ                              │
│  Đã thanh toán: 40,000,000 đ                               │
│  Còn nợ: 10,000,000 đ                                      │
│                                                             │
│  ┌─────┬──────┬────────┬──────────┬─────────┬────────┐    │
│  │ STT │ Ngày │ Mã CD  │ Biển số  │ Doanh thu│ Còn nợ│    │
│  ├─────┼──────┼────────┼──────────┼─────────┼────────┤    │
│  │  1  │01/01 │ CD001  │51A-12345 │5,000,000│    0   │    │
│  │ ... │ ...  │ ...    │ ...      │ ...     │ ...    │    │
│  └─────┴──────┴────────┴──────────┴─────────┴────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TUYẾN: HCM - ĐÀ NẴNG                                       │
│  ═════════════════════════════════════════════════════      │
│  Số chuyến: 15 chuyến                                       │
│  Tổng doanh thu: 30,000,000 đ                              │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘

... (repeat for each route)
```

**PDF Layout**: Grouped by route with subtotals

---

### Template 4: RÚT GỌN
**Mô tả**: Summary theo ngày, không có chi tiết từng chuyến

**Excel Structure**:
```
Sheet 1: TONG_HOP (Same as Template 1)

Sheet 2: THEO_NGAY
┌──────────────┬───────────┬──────────────┬──────────────┬──────────────┐
│ Ngày         │ Số chuyến │ Tổng doanh thu│ Đã thanh toán│ Còn nợ       │
├──────────────┼───────────┼──────────────┼──────────────┼──────────────┤
│ 01/01/2025   │     5     │  15,000,000  │  15,000,000  │      0       │
│ 02/01/2025   │     3     │  10,000,000  │   8,000,000  │  2,000,000   │
│ 03/01/2025   │     4     │  12,000,000  │  12,000,000  │      0       │
│ ...          │    ...    │     ...      │     ...      │     ...      │
├──────────────┼───────────┼──────────────┼──────────────┼──────────────┤
│ TỔNG         │    45     │ 100,000,000  │  80,000,000  │ 20,000,000   │
└──────────────┴───────────┴──────────────┴──────────────┴──────────────┘
```

**PDF Layout**: Single page summary table

---

## 🔌 BigQuery Queries

### Query 1: Get Customer List (for dropdown)
```sql
SELECT DISTINCT
  ma_khach_hang,
  ten_khach_hang
FROM khach_hang
WHERE trang_thai = 'HOAT_DONG'
ORDER BY ten_khach_hang;
```

### Query 2: Get Routes List (for dropdown)
```sql
SELECT DISTINCT
  tuyen_duong
FROM chuyen_di
WHERE tuyen_duong IS NOT NULL
ORDER BY tuyen_duong;
```

### Query 3: Preview Data & Template 1-2 (Basic/Detail)
```sql
-- Summary
SELECT
  COUNT(*) as so_chuyen_di,
  SUM(doanh_thu) as tong_doanh_thu,
  SUM(so_tien_da_thanh_toan) as tong_da_thanh_toan,
  SUM(so_tien_con_no) as tong_con_no
FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
  AND (@tuyen_duong IS NULL OR tuyen_duong = @tuyen_duong);

-- Details
SELECT
  DATE(ngay_tao) as ngay,
  id as ma_chuyen_di,
  tuyen_duong,
  bien_so_xe,
  doanh_thu,
  so_tien_da_thanh_toan,
  so_tien_con_no,
  tinh_trang_thanh_toan
FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
  AND (@tuyen_duong IS NULL OR tuyen_duong = @tuyen_duong)
ORDER BY ngay_tao ASC;
```

### Query 4: Template 3 (Grouped by Route)
```sql
-- Summary by route
SELECT
  tuyen_duong,
  COUNT(*) as so_chuyen_di,
  SUM(doanh_thu) as tong_doanh_thu,
  SUM(so_tien_da_thanh_toan) as tong_da_thanh_toan,
  SUM(so_tien_con_no) as tong_con_no
FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
  AND (@tuyen_duong IS NULL OR tuyen_duong = @tuyen_duong)
GROUP BY tuyen_duong
ORDER BY tuyen_duong;

-- Details per route
SELECT
  tuyen_duong,
  DATE(ngay_tao) as ngay,
  id as ma_chuyen_di,
  bien_so_xe,
  doanh_thu,
  so_tien_da_thanh_toan,
  so_tien_con_no
FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
  AND (@tuyen_duong IS NULL OR tuyen_duong = @tuyen_duong)
ORDER BY tuyen_duong, ngay_tao ASC;
```

### Query 5: Template 4 (Daily Summary)
```sql
SELECT
  DATE(ngay_tao) as ngay,
  COUNT(*) as so_chuyen_di,
  SUM(doanh_thu) as tong_doanh_thu,
  SUM(so_tien_da_thanh_toan) as tong_da_thanh_toan,
  SUM(so_tien_con_no) as tong_con_no
FROM chuyen_di
WHERE ma_khach_hang = @ma_khach_hang
  AND DATE(ngay_tao) BETWEEN @tu_ngay AND @den_ngay
  AND (@tuyen_duong IS NULL OR tuyen_duong = @tuyen_duong)
GROUP BY DATE(ngay_tao)
ORDER BY ngay ASC;
```

---

## 💻 Code Implementation

### UIComponents.html - renderBangKeForm()

```javascript
renderBangKeForm: function() {
  var html = '<div class="bang-ke-form">';

  // Header
  html += '<div class="form-header">';
  html += '<h2>Xuat bang ke</h2>';
  html += '<p>Chon bo loc va xem truoc du lieu truoc khi xuat</p>';
  html += '</div>';

  // Filters section
  html += '<div class="filter-section">';
  html += '<h3>Bo loc</h3>';

  html += '<div class="filter-row">';
  html += '<label>Khach hang:</label>';
  html += '<select id="filter-khach-hang" onchange="BangKeController.onFilterChange()">';
  html += '<option value="">-- Chon khach hang --</option>';
  html += '</select>';
  html += '</div>';

  html += '<div class="filter-row">';
  html += '<label>Loai tuyen (optional):</label>';
  html += '<select id="filter-tuyen" onchange="BangKeController.onFilterChange()">';
  html += '<option value="">-- Tat ca --</option>';
  html += '</select>';
  html += '</div>';

  html += '<div class="filter-row">';
  html += '<label>Ky bang ke:</label>';
  html += '<input type="date" id="filter-tu-ngay" onchange="BangKeController.onFilterChange()">';
  html += '<span> - </span>';
  html += '<input type="date" id="filter-den-ngay" onchange="BangKeController.onFilterChange()">';
  html += '</div>';

  html += '<button class="btn-preview" onclick="BangKeController.loadPreview()">Xem truoc du lieu</button>';
  html += '</div>';

  // Preview section
  html += '<div class="preview-section" id="preview-section" style="display:none;">';
  html += '<h3>Preview du lieu</h3>';
  html += '<div id="preview-content"></div>';
  html += '</div>';

  // Template selection
  html += '<div class="template-section" id="template-section" style="display:none;">';
  html += '<h3>Chon template</h3>';
  html += '<div class="template-cards">';

  var templates = [
    { id: 1, name: 'Co ban', desc: 'Tong hop + Danh sach chuyen di' },
    { id: 2, name: 'Chi tiet', desc: 'Day du thong tin + Lich su thanh toan' },
    { id: 3, name: 'Theo tuyen', desc: 'Nhom theo tuyen duong' },
    { id: 4, name: 'Rut gon', desc: 'Summary theo ngay' }
  ];

  for (var i = 0; i < templates.length; i++) {
    var t = templates[i];
    html += '<div class="template-card" onclick="BangKeController.selectTemplate(' + t.id + ')">';
    html += '<input type="radio" name="template" id="template-' + t.id + '" value="' + t.id + '">';
    html += '<label for="template-' + t.id + '">';
    html += '<h4>' + t.name + '</h4>';
    html += '<p>' + t.desc + '</p>';
    html += '</label>';
    html += '</div>';
  }

  html += '</div>';
  html += '</div>';

  // Export buttons
  html += '<div class="export-section" id="export-section" style="display:none;">';
  html += '<button class="btn-export btn-excel" onclick="BangKeController.exportExcel()">';
  html += '<i class="material-icons-outlined">download</i> Tai Excel';
  html += '</button>';
  html += '<button class="btn-export btn-pdf" onclick="BangKeController.exportPDF()">';
  html += '<i class="material-icons-outlined">picture_as_pdf</i> Tai PDF';
  html += '</button>';
  html += '</div>';

  html += '</div>';
  return html;
},

renderPreviewContent: function(data) {
  var html = '<div class="preview-card">';

  // Customer info
  html += '<div class="preview-header">';
  html += '<h4>Thong tin khach hang</h4>';
  html += '<p>Ten: ' + data.customer.ten_khach_hang + '</p>';
  html += '<p>Ma: ' + data.customer.ma_khach_hang + '</p>';
  html += '<p>Ky: ' + data.tu_ngay + ' - ' + data.den_ngay + '</p>';
  html += '</div>';

  // Summary
  html += '<div class="preview-summary">';
  html += '<h4>Tong hop</h4>';
  html += '<ul>';
  html += '<li>So chuyen di: ' + data.summary.so_chuyen_di + ' chuyen</li>';
  html += '<li>Tong doanh thu: ' + formatCurrency(data.summary.tong_doanh_thu) + '</li>';
  html += '<li>Da thanh toan: ' + formatCurrency(data.summary.tong_da_thanh_toan) + '</li>';
  html += '<li>Con no: ' + formatCurrency(data.summary.tong_con_no) + '</li>';
  html += '</ul>';
  html += '</div>';

  // Details (first 5 rows)
  html += '<div class="preview-details">';
  html += '<h4>Chi tiet (5 chuyen dau)</h4>';
  html += '<table class="preview-table">';
  html += '<thead><tr><th>Ngay</th><th>Ma CD</th><th>Tuyen</th><th>Doanh thu</th><th>Con no</th></tr></thead>';
  html += '<tbody>';

  var details = data.details.slice(0, 5);
  for (var i = 0; i < details.length; i++) {
    var row = details[i];
    html += '<tr>';
    html += '<td>' + row.ngay + '</td>';
    html += '<td>' + row.ma_chuyen_di + '</td>';
    html += '<td>' + row.tuyen_duong + '</td>';
    html += '<td>' + formatCurrency(row.doanh_thu) + '</td>';
    html += '<td>' + formatCurrency(row.so_tien_con_no) + '</td>';
    html += '</tr>';
  }

  html += '</tbody></table>';

  if (data.details.length > 5) {
    html += '<p class="more-info">... va ' + (data.details.length - 5) + ' chuyen nua (xem trong file xuat)</p>';
  }

  html += '</div>';
  html += '</div>';

  return html;
}
```

### BangKeController.html (New file)

```javascript
var BangKeController = {
  selectedTemplate: null,
  currentData: null,

  init: function() {
    this.loadCustomers();
    this.loadRoutes();
    this.setDefaultDates();
  },

  loadCustomers: function() {
    google.script.run
      .withSuccessHandler(function(customers) {
        var select = document.getElementById('filter-khach-hang');
        customers.forEach(function(c) {
          var option = document.createElement('option');
          option.value = c.ma_khach_hang;
          option.textContent = c.ten_khach_hang;
          select.appendChild(option);
        });
      })
      .getCustomerList();
  },

  loadRoutes: function() {
    google.script.run
      .withSuccessHandler(function(routes) {
        var select = document.getElementById('filter-tuyen');
        routes.forEach(function(r) {
          var option = document.createElement('option');
          option.value = r.tuyen_duong;
          option.textContent = r.tuyen_duong;
          select.appendChild(option);
        });
      })
      .getRouteList();
  },

  setDefaultDates: function() {
    var today = new Date();
    var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    document.getElementById('filter-tu-ngay').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filter-den-ngay').value = today.toISOString().split('T')[0];
  },

  onFilterChange: function() {
    // Hide preview and export sections when filter changes
    document.getElementById('preview-section').style.display = 'none';
    document.getElementById('template-section').style.display = 'none';
    document.getElementById('export-section').style.display = 'none';
  },

  loadPreview: function() {
    var filters = this.getFilters();

    if (!filters.ma_khach_hang) {
      alert('Vui long chon khach hang');
      return;
    }

    if (!filters.tu_ngay || !filters.den_ngay) {
      alert('Vui long chon ky bang ke');
      return;
    }

    PerformanceUtils.showProgress();

    google.script.run
      .withSuccessHandler(function(data) {
        BangKeController.currentData = data;
        BangKeController.showPreview(data);
        PerformanceUtils.hideProgress();
      })
      .withFailureHandler(function(error) {
        alert('Loi khi tai du lieu: ' + error);
        PerformanceUtils.hideProgress();
      })
      .getBangKePreview(filters);
  },

  getFilters: function() {
    return {
      ma_khach_hang: document.getElementById('filter-khach-hang').value,
      tuyen_duong: document.getElementById('filter-tuyen').value || null,
      tu_ngay: document.getElementById('filter-tu-ngay').value,
      den_ngay: document.getElementById('filter-den-ngay').value
    };
  },

  showPreview: function(data) {
    var previewContent = UIComponents.renderPreviewContent(data);
    document.getElementById('preview-content').innerHTML = previewContent;
    document.getElementById('preview-section').style.display = 'block';
    document.getElementById('template-section').style.display = 'block';
  },

  selectTemplate: function(templateId) {
    this.selectedTemplate = templateId;
    document.getElementById('template-' + templateId).checked = true;
    document.getElementById('export-section').style.display = 'block';
  },

  exportExcel: function() {
    if (!this.selectedTemplate) {
      alert('Vui long chon template');
      return;
    }

    PerformanceUtils.showProgress();

    google.script.run
      .withSuccessHandler(function(url) {
        window.open(url, '_blank');
        PerformanceUtils.hideProgress();
        alert('Xuat Excel thanh cong!');
      })
      .withFailureHandler(function(error) {
        alert('Loi khi xuat Excel: ' + error);
        PerformanceUtils.hideProgress();
      })
      .exportBangKeExcel(BangKeController.currentData, BangKeController.selectedTemplate);
  },

  exportPDF: function() {
    if (!this.selectedTemplate) {
      alert('Vui long chon template');
      return;
    }

    PerformanceUtils.showProgress();

    google.script.run
      .withSuccessHandler(function(url) {
        window.open(url, '_blank');
        PerformanceUtils.hideProgress();
        alert('Xuat PDF thanh cong!');
      })
      .withFailureHandler(function(error) {
        alert('Loi khi xuat PDF: ' + error);
        PerformanceUtils.hideProgress();
      })
      .exportBangKePDF(BangKeController.currentData, BangKeController.selectedTemplate);
  }
};

function formatCurrency(value) {
  return value.toLocaleString('vi-VN') + ' d';
}
```

---

## 📊 CSS Styles

```css
.bang-ke-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.form-header p {
  color: #6c757d;
  font-size: 14px;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.filter-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.filter-row label {
  font-weight: 500;
}

.filter-row select,
.filter-row input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
}

.btn-preview {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

.btn-preview:hover {
  background: #1976d2;
}

.preview-section,
.template-section,
.export-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
}

.preview-header,
.preview-summary,
.preview-details {
  margin-bottom: 24px;
}

.preview-header h4,
.preview-summary h4,
.preview-details h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.preview-summary ul {
  list-style: none;
  padding: 0;
}

.preview-summary li {
  padding: 4px 0;
  font-size: 14px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th {
  background: #f8f9fa;
  padding: 8px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
}

.preview-table td {
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
}

.more-info {
  font-size: 13px;
  color: #6c757d;
  font-style: italic;
  margin-top: 8px;
}

.template-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.template-card {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.template-card input[type="radio"] {
  margin-bottom: 8px;
}

.template-card h4 {
  font-size: 14px;
  margin-bottom: 4px;
}

.template-card p {
  font-size: 12px;
  color: #6c757d;
}

.export-section {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-excel {
  background: #4caf50;
  color: white;
}

.btn-excel:hover {
  background: #45a049;
}

.btn-pdf {
  background: #f44336;
  color: white;
}

.btn-pdf:hover {
  background: #da190b;
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .template-cards {
    grid-template-columns: 1fr;
  }

  .export-section {
    flex-direction: column;
  }
}
```

---

## 🎯 Implementation Checklist

### Week 1: Setup & Queries
- [ ] Create BigQuery service functions
- [ ] Test all 5 queries
- [ ] Create dropdown data endpoints

### Week 2: UI & Preview
- [ ] Build filter form UI
- [ ] Implement preview functionality
- [ ] Template selection UI

### Week 3: Excel Export (4 Templates)
- [ ] Template 1: Basic
- [ ] Template 2: Detail
- [ ] Template 3: By Route
- [ ] Template 4: Summary

### Week 4: PDF Export & Polish
- [ ] PDF generation (Google Docs template)
- [ ] Testing all templates
- [ ] Mobile responsive
- [ ] Error handling

---

**Status**: Detailed Spec Complete
**Next**: Start implementation Week 1
**Estimate**: 4 weeks
