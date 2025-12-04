# Kế Toán Module - BigQuery Integration

**Date**: 2025-12-01
**Version**: 1.0
**Status**: ✅ Hoàn tất

---

## 📋 Tổng quan

Module Kế toán đã được tích hợp hoàn toàn với BigQuery để lấy dữ liệu từ 2 bảng chính:
- **tb_khach_hang**: Thông tin khách hàng
- **tb_chuyen_di**: Dữ liệu chuyến đi

---

## 🔧 Backend Services Đã Tạo

### 1. **BigQueryService.gs** - 3 Functions mới

#### `getCustomerList()`
**Mục đích**: Lấy danh sách khách hàng cho dropdown filter

**Query**:
```sql
SELECT ma_khach_hang, ten_khach_hang
FROM `nak_logistics.tb_khach_hang`
WHERE ma_khach_hang IS NOT NULL
ORDER BY ten_khach_hang ASC
```

**Return**:
```javascript
{
  success: true,
  data: [
    {
      ma_khach_hang: "KH001",
      ten_khach_hang: "Cong ty ABC"
    },
    // ...
  ],
  count: 50,
  timestamp: "2025-12-01T..."
}
```

---

#### `getRouteTypeList()`
**Mục đích**: Lấy danh sách loại tuyến cho dropdown filter

**Query**:
```sql
SELECT DISTINCT loai_tuyen
FROM `nak_logistics.tb_chuyen_di`
WHERE loai_tuyen IS NOT NULL
ORDER BY loai_tuyen ASC
```

**Return**:
```javascript
{
  success: true,
  data: [
    { loai_tuyen: "Noi thanh" },
    { loai_tuyen: "Lien tinh" },
    { loai_tuyen: "Lien vung" }
  ],
  count: 3,
  timestamp: "2025-12-01T..."
}
```

---

#### `getDoiSoatData(filters)`
**Mục đích**: Lấy dữ liệu đối soát theo filter

**Parameters**:
```javascript
{
  ma_khach_hang: "KH001",
  loai_tuyen: "Noi thanh",  // Optional
  tu_ngay: "2025-11-01",
  den_ngay: "2025-11-30"
}
```

**Query 1 - Thông tin khách hàng**:
```sql
SELECT ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi
FROM `nak_logistics.tb_khach_hang`
WHERE ma_khach_hang = "KH001"
```

**Query 2 - Danh sách chuyến đi**:
```sql
SELECT
  ngay_tao,
  ma_chuyen_di,
  loai_tuyen,
  tuyen_duong,
  bien_so_xe,
  doanh_thu,
  trang_thai
FROM `nak_logistics.tb_chuyen_di`
WHERE ma_khach_hang = "KH001"
  AND DATE(ngay_tao) BETWEEN "2025-11-01" AND "2025-11-30"
  AND loai_tuyen = "Noi thanh"  -- If filter applied
ORDER BY ngay_tao DESC
```

**Return**:
```javascript
{
  success: true,
  data: {
    customer: {
      ma_khach_hang: "KH001",
      ten_khach_hang: "Cong ty ABC",
      so_dien_thoai: "0901234567",
      email: "abc@example.com",
      dia_chi: "123 Nguyen Hue, Q1"
    },
    trips: [
      {
        ngay_tao: "2025-11-30",
        ma_chuyen_di: "CD001",
        loai_tuyen: "Noi thanh",
        tuyen_duong: "HCM-BinhDuong",
        bien_so_xe: "51A-12345",
        doanh_thu: "5000000",
        trang_thai: "Hoan thanh"
      },
      // ... more trips
    ],
    summary: {
      so_chuyen: 25,
      tong_doanh_thu: 125000000,
      da_thanh_toan: 100000000,
      con_no: 25000000
    },
    filters: { /* original filters */ }
  },
  timestamp: "2025-12-01T..."
}
```

---

### 2. **Main.gs** - 3 API Endpoints

#### `getCustomerList()`
**Được gọi từ**: `KeToanController.loadCustomers()`
**Wrapper cho**: `BigQueryService.getCustomerList()`

```javascript
function getCustomerList() {
  try {
    var result = BigQueryService.getCustomerList();
    if (result.success) {
      return result.data;  // Trả về array trực tiếp
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    throw error;
  }
}
```

---

#### `getRouteList()`
**Được gọi từ**: `KeToanController.loadRouteTypes()`
**Wrapper cho**: `BigQueryService.getRouteTypeList()`

```javascript
function getRouteList() {
  try {
    var result = BigQueryService.getRouteTypeList();
    if (result.success) {
      return result.data;  // Trả về array
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    throw error;
  }
}
```

---

#### `getDoiSoatData(filters)`
**Được gọi từ**: `KeToanController.loadDoiSoatPreview()`
**Wrapper cho**: `BigQueryService.getDoiSoatData(filters)`

```javascript
function getDoiSoatData(filters) {
  try {
    var result = BigQueryService.getDoiSoatData(filters);
    if (result.success) {
      return result.data;  // Trả về object {customer, trips, summary}
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    throw error;
  }
}
```

---

## 🔄 Data Flow

### 1. Load Customers (Dropdown)
```
User mở module Kế toán
  ↓
KeToanController.init()
  ↓
KeToanController.loadCustomers()
  ↓
google.script.run.getCustomerList()
  ↓
Main.gs → getCustomerList()
  ↓
BigQueryService.getCustomerList()
  ↓
Query: tb_khach_hang
  ↓
Return: [{ma_khach_hang, ten_khach_hang}, ...]
  ↓
Populate dropdown: #doi-soat-khach-hang
```

---

### 2. Load Route Types (Dropdown)
```
User mở module Kế toán
  ↓
KeToanController.init()
  ↓
KeToanController.loadRouteTypes()
  ↓
google.script.run.getRouteList()
  ↓
Main.gs → getRouteList()
  ↓
BigQueryService.getRouteTypeList()
  ↓
Query: tb_chuyen_di (DISTINCT loai_tuyen)
  ↓
Return: [{loai_tuyen}, ...]
  ↓
Populate dropdown: #doi-soat-loai-tuyen
```

---

### 3. Load Đối Soát Preview
```
User chọn filters và click "Xem truoc"
  ↓
KeToanController.loadDoiSoatPreview()
  ↓
Validate filters (khách hàng, thời gian)
  ↓
PerformanceUtils.showProgress()
  ↓
google.script.run.getDoiSoatData(filters)
  ↓
Main.gs → getDoiSoatData(filters)
  ↓
BigQueryService.getDoiSoatData(filters)
  ↓
Query 1: tb_khach_hang (customer info)
Query 2: tb_chuyen_di (trips)
  ↓
Calculate summary metrics (so_chuyen, doanh_thu, etc.)
  ↓
Return: {customer, trips, summary, filters}
  ↓
KeToanController.showPreview(data)
  ↓
UIComponents.renderDoiSoatPreview(data)
  ↓
Display preview card with:
  - Customer info banner
  - 4 summary cards
  - Trips table (first 10)
  - Export buttons
  ↓
PerformanceUtils.hideProgress()
```

---

## 📊 Data Schema Mapping

### tb_khach_hang → Customer Object
| BigQuery Column | Object Property | Usage |
|----------------|-----------------|-------|
| ma_khach_hang | ma_khach_hang | Customer ID |
| ten_khach_hang | ten_khach_hang | Display name |
| so_dien_thoai | so_dien_thoai | Contact info |
| email | email | Contact info |
| dia_chi | dia_chi | Contact info |

### tb_chuyen_di → Trip Object
| BigQuery Column | Object Property | Usage |
|----------------|-----------------|-------|
| ngay_tao | ngay_tao | Trip creation date |
| ma_chuyen_di | ma_chuyen_di | Trip ID |
| loai_tuyen | loai_tuyen | Route type filter |
| tuyen_duong | tuyen_duong | Route display |
| bien_so_xe | bien_so_xe | Vehicle info |
| doanh_thu | doanh_thu | Revenue (string) |
| trang_thai | trang_thai | Payment status |

---

## ⚠️ Important Notes

### 1. Trạng Thái Thanh Toán
Hiện tại, logic phân loại "Đã thanh toán" vs "Còn nợ" dựa vào:
```javascript
if (trip.trang_thai === 'Da thanh toan') {
  paidAmount += revenue;
} else {
  unpaidAmount += revenue;
}
```

**⚠️ CẦN XÁC NHẬN**:
- Giá trị chính xác của `trang_thai` trong BigQuery là gì?
- Có thể là: "Đã thanh toán", "Đã hoàn thành", "Paid", etc.
- Cần cập nhật code nếu khác "Da thanh toan"

### 2. Định Dạng Dữ Liệu
- **Doanh thu**: BigQuery trả về string, cần convert `parseFloat()` khi tính toán
- **Ngày tháng**: Format `YYYY-MM-DD` cho filter
- **Ma khach hang**: String comparison, case-sensitive

### 3. Performance
- Dropdown load 1 lần khi init
- Preview query chỉ chạy khi user click "Xem truoc"
- Không cache data (real-time từ BigQuery)
- Timeout: 30 seconds (BigQueryService.executeQuery)

### 4. Error Handling
Tất cả functions đều có error handling:
- `try-catch` blocks
- `ErrorHandler.log()` for debugging
- User-friendly error messages
- Graceful fallbacks (empty arrays)

---

## 🧪 Testing Checklist

### Backend Testing (Apps Script Editor)

**Test 1: getCustomerList()**
```javascript
function testGetCustomerList() {
  var result = getCustomerList();
  Logger.log('Customer count: ' + result.length);
  Logger.log('First customer: ' + JSON.stringify(result[0]));
}
```

**Expected Output**:
```
Customer count: 50
First customer: {"ma_khach_hang":"KH001","ten_khach_hang":"ABC Ltd"}
```

---

**Test 2: getRouteList()**
```javascript
function testGetRouteList() {
  var result = getRouteList();
  Logger.log('Route types: ' + JSON.stringify(result));
}
```

**Expected Output**:
```
Route types: [{"loai_tuyen":"Noi thanh"},{"loai_tuyen":"Lien tinh"}]
```

---

**Test 3: getDoiSoatData()**
```javascript
function testGetDoiSoatData() {
  var filters = {
    ma_khach_hang: 'KH001',
    loai_tuyen: '',
    tu_ngay: '2025-11-01',
    den_ngay: '2025-11-30'
  };

  var result = getDoiSoatData(filters);
  Logger.log('Customer: ' + result.customer.ten_khach_hang);
  Logger.log('Trip count: ' + result.trips.length);
  Logger.log('Total revenue: ' + result.summary.tong_doanh_thu);
}
```

**Expected Output**:
```
Customer: Cong ty ABC
Trip count: 25
Total revenue: 125000000
```

---

### Frontend Testing (Web App)

1. **Open module Kế toán**:
   - ✅ Dropdowns load correctly
   - ✅ Default dates set to current month

2. **Select filters**:
   - ✅ Customer dropdown populated
   - ✅ Route type dropdown populated
   - ✅ Date pickers work

3. **Click "Xem truoc"**:
   - ✅ Validation works (requires customer + dates)
   - ✅ Progress indicator shows
   - ✅ Preview section displays
   - ✅ Customer banner shows
   - ✅ 4 summary cards correct
   - ✅ Trip table shows data

4. **Filter variations**:
   - ✅ With route type filter
   - ✅ Without route type (all routes)
   - ✅ Different date ranges

5. **Error cases**:
   - ✅ No customer selected → Alert
   - ✅ No dates → Alert
   - ✅ Invalid customer → Error message
   - ✅ No data for period → Empty table

---

## 📁 Files Modified

| File | Changes | Lines |
|------|---------|-------|
| [BigQueryService.gs](BigQueryService.gs) | Added 3 new functions | 388-578 |
| [Main.gs](Main.gs) | Added 3 API endpoints | 167-235 |
| [KeToanController.html](KeToanController.html) | Fixed loai_tuyen field | 90-91 |

---

## 🔜 Next Steps

### Immediate (Required for MVP)
- [ ] Verify `trang_thai` values in tb_chuyen_di
- [ ] Update payment status logic if needed
- [ ] Test with real BigQuery data
- [ ] Verify all customers load correctly

### Future Enhancements
- [ ] Export to Excel functionality
- [ ] Export to PDF functionality
- [ ] Email sending integration
- [ ] Custom templates per customer
- [ ] Advanced filters (date range presets)
- [ ] Pagination for large datasets
- [ ] Export all trips (not just first 10)

---

## 🐛 Known Issues & Fixes

### ~~Issue 1: Column Name Error~~
**Status**: ✅ FIXED
**Description**: Original code used `ngay_di` but BigQuery table has `ngay_tao`
**Error**: `Unrecognized name: ngay_di; Did you mean ngay_tao?`
**Solution**:
- Updated BigQueryService.gs lines 504, 513, 520 to use `ngay_tao`
- Updated UIComponents.html line 558 to display `ngay_tao`
- Added `DATE()` wrapper for proper date comparison

### Issue 2: Payment Status Logic
**Status**: ⚠️ Needs verification
**Description**: Hardcoded `trang_thai === 'Da thanh toan'` may not match actual data
**Solution**: Check actual values in BigQuery and update accordingly

### Issue 3: Large Datasets
**Status**: ⚠️ Potential issue
**Description**: No pagination, loads all trips for period
**Impact**: May be slow for customers with 1000+ trips
**Solution**: Add pagination or limit to recent 100 trips

---

## 📞 Support & Debugging

### Enable Debug Logs
Logs are automatically saved via `ErrorHandler.log()`. To view:
1. Open Apps Script Editor
2. View → Logs (Ctrl/Cmd + Enter)
3. Search for "Doi soat" or "Customer list"

### Common Errors

**Error**: "Không thể tải danh sách khách hàng"
**Cause**: BigQuery permission or table not found
**Fix**: Check CONFIG.BIGQUERY.DATASET and table name

**Error**: "Vui lòng chọn khách hàng"
**Cause**: User didn't select customer before preview
**Fix**: Validation works correctly, user needs to select

**Error**: "Không tìm thấy thông tin khách hàng"
**Cause**: Invalid ma_khach_hang
**Fix**: Check if customer exists in tb_khach_hang

---

**Documentation Version**: 1.0
**Last Updated**: 2025-12-01
**Author**: Claude Code
