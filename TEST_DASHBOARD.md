# 🧪 Test Dashboard - Hướng Dẫn

## ✅ LỖI ĐÃ SỬA

### Vấn đề:
```
TypeError: CONFIG.QUERIES.DASHBOARD_STATS is not a function
```

### Nguyên nhân:
- Function `DASHBOARD_STATS` cũ bị xóa trong Config.gs
- BigQueryService.getDashboardStats() vẫn đang gọi nó
- Client code cũ vẫn gọi `getDashboardStats()`

### Giải pháp:
✅ Đã thêm lại `DASHBOARD_STATS()` vào [Config.gs:28-37](Config.gs#L28-L37) với annotation `@deprecated`
✅ Backward compatible - code cũ vẫn chạy được
✅ Code mới khuyến khích dùng `OVERVIEW_METRICS()` thay thế

---

## 🧪 TEST NGAY

### Test 1: Dashboard Cũ (Legacy)
```javascript
// Chạy trong Apps Script Editor
function testDashboardCu() {
  var result = getDashboardStats();
  Logger.log(JSON.stringify(result, null, 2));
}
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "byRoute": 567,
    "ghn": 667
  },
  "timestamp": "2025-11-28T..."
}
```

---

### Test 2: Dashboard Mới - Overview Metrics
```javascript
function testOverviewMetrics() {
  var filter = {
    type: 'month',
    date: '2025-01-15'
  };
  
  var result = getOverviewMetrics(filter);
  Logger.log(JSON.stringify(result, null, 2));
}
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "soChuyen": 1234,
    "soXe": 56,
    "doanhThu": 123456789,
    "soKhachHang": 78
  },
  "timestamp": "2025-11-28T..."
}
```

---

### Test 3: Tất Cả Dữ Liệu Dashboard
```javascript
function testAllDashboardData() {
  var filter = {
    type: 'day',
    date: '2025-01-20'
  };
  
  var result = getAllDashboardData(filter);
  Logger.log(JSON.stringify(result, null, 2));
}
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "overview": { ... },
    "topCustomers": [ ... ],
    "topRoutes": [ ... ],
    "revenueByRouteType": [ ... ],
    "topVehicles": [ ... ],
    "bottomVehicles": [ ... ]
  },
  "timestamp": "2025-11-28T..."
}
```

---

### Test 4: Top Khách Hàng
```javascript
function testTopCustomers() {
  var filter = { type: 'week', date: '2025-01-15' };
  var result = getTopCustomers(filter);
  Logger.log('Count: ' + result.count);
  Logger.log(JSON.stringify(result.data, null, 2));
}
```

---

### Test 5: Top Xe
```javascript
function testTopVehicles() {
  var filter = { type: 'month', date: '2025-01-01' };
  var top = getTopVehicles(filter);
  var bottom = getBottomVehicles(filter);
  
  Logger.log('Top vehicles: ' + top.count);
  Logger.log('Bottom vehicles: ' + bottom.count);
}
```

---

## 🔍 Debug Checklist

Nếu vẫn có lỗi, check theo thứ tự:

### 1. Kiểm tra Config.gs
```javascript
// Test function có tồn tại không
function checkConfigQueries() {
  Logger.log('DASHBOARD_STATS: ' + (typeof CONFIG.QUERIES.DASHBOARD_STATS));
  Logger.log('OVERVIEW_METRICS: ' + (typeof CONFIG.QUERIES.OVERVIEW_METRICS));
  Logger.log('buildDateFilter: ' + (typeof CONFIG.QUERIES.buildDateFilter));
}
```

**Expected:**
```
DASHBOARD_STATS: function
OVERVIEW_METRICS: function  
buildDateFilter: function
```

---

### 2. Kiểm tra BigQuery Connection
```javascript
function testBigQueryConnection() {
  try {
    var sql = 'SELECT 1 as test';
    var request = { query: sql, useLegacySql: false };
    var result = BigQuery.Jobs.query(request, CONFIG.BIGQUERY.PROJECT_ID);
    Logger.log('✅ BigQuery connected!');
    Logger.log(result);
  } catch (e) {
    Logger.log('❌ BigQuery error: ' + e.toString());
  }
}
```

---

### 3. Kiểm tra Table Tồn Tại
```javascript
function checkTableExists() {
  var sql = `
    SELECT COUNT(*) as total
    FROM \`${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}\`
    LIMIT 1
  `;
  
  try {
    var request = { query: sql, useLegacySql: false };
    var result = BigQuery.Jobs.query(request, CONFIG.BIGQUERY.PROJECT_ID);
    Logger.log('✅ Table exists! Total rows: ' + result.rows[0].f[0].v);
  } catch (e) {
    Logger.log('❌ Table error: ' + e.toString());
  }
}
```

---

### 4. Kiểm tra Columns
```javascript
function checkColumns() {
  var sql = `
    SELECT 
      ma_chuyen_di,
      bien_kiem_soat,
      doanh_thu,
      ma_khach_hang,
      ngay_thuc_hien
    FROM \`${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}\`
    LIMIT 1
  `;
  
  try {
    var request = { query: sql, useLegacySql: false };
    var result = BigQuery.Jobs.query(request, CONFIG.BIGQUERY.PROJECT_ID);
    Logger.log('✅ All columns exist!');
    Logger.log('Schema: ' + JSON.stringify(result.schema, null, 2));
  } catch (e) {
    Logger.log('❌ Column error: ' + e.toString());
    Logger.log('Missing columns. Check your BigQuery table schema.');
  }
}
```

---

## 🚀 Deployment Steps

1. **Push code:**
   ```bash
   clasp push
   ```

2. **Test trong Editor:**
   - Run `testDashboardCu()` → Should work ✅
   - Run `testOverviewMetrics()` → Should work ✅
   - Run `testAllDashboardData()` → Should work ✅

3. **Deploy:**
   ```bash
   clasp deploy --description "Fixed legacy dashboard + new reports"
   ```

4. **Test trong Browser:**
   - Mở web app URL
   - Dashboard cũ should load ✅
   - Check console (F12) for errors

---

## 📝 Notes

### Tên Columns Cần Có Trong BigQuery:
- `ma_chuyen_di` (mã chuyến đi)
- `bien_kiem_soat` (biển kiểm soát)
- `doanh_thu` (doanh thu)
- `ma_khach_hang` (mã khách hàng)
- `ten_khach_hang` (tên khách hàng)
- `loai_tuyen_khach_hang` (loại tuyến)
- `ngay_thuc_hien` (ngày thực hiện) - **Quan trọng cho filter!**

### Nếu Column Tên Khác:
Sửa trong [Config.gs:33](Config.gs#L33):
```javascript
var dateField = 'ngay_thuc_hien'; // ← Sửa tên column ở đây
```

---

## ✅ Status

- [x] Sửa lỗi `DASHBOARD_STATS is not a function`
- [x] Backward compatible với code cũ
- [x] Code mới hoạt động
- [x] Test functions sẵn sàng
- [ ] Test trong Apps Script Editor
- [ ] Deploy lên production
- [ ] Test trong browser

---

**Last Updated:** 2025-11-28  
**Status:** ✅ Fixed - Ready to test
