# DEBUG: Chart Data Mapping Issue

## Vấn đề phát hiện

Từ screenshot BigQuery mà user cung cấp:
- **KH002 (GHN)**: 60 chuyến, 204,988,493 VNĐ
- **KH001 (J&T)**: 28 chuyến, 61,428,572 VNĐ
- **KH024 (GHTK)**: 1 chuyến, 1,650,000 VNĐ

Nếu chart hiển thị sai → có thể do:

## 1. Field names không khớp

### Query trả về:
```sql
SELECT
  ma_khach_hang,
  ten_khach_hang,
  COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
  ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
```

### Chart đang map:
```javascript
const names = data.map(c => c.ten_khach_hang || c.ma_khach_hang || 'N/A');
const revenues = data.map(c => parseFloat(c.tong_doanh_thu) || 0);
const trips = data.map(c => parseInt(c.so_chuyen) || 0);
```

## 2. Cách debug

### Bước 1: Kiểm tra console logs
Sau khi deploy, mở Chrome DevTools Console và xem:
```
[ChartUtils] Top Customers Data: [...]
[ChartUtils] First item structure: {...}
[ChartUtils] Chart data prepared: {...}
```

### Bước 2: Xác nhận structure
Data từ BigQuery có thể trả về theo 1 trong 2 formats:

**Format 1 - Direct object:**
```javascript
{
  ma_khach_hang: "KH002",
  ten_khach_hang: "GHN",
  so_chuyen: "60",
  tong_doanh_thu: "204988493"
}
```

**Format 2 - BigQuery raw format:**
```javascript
{
  f: [
    { v: "KH002" },
    { v: "GHN" },
    { v: "60" },
    { v: "204988493" }
  ]
}
```

## 3. Nguyên nhân có thể

### A. parseRows() không hoạt động đúng
Trong `BigQueryService.gs:182`:
```javascript
var data = this.parseRows(queryResults.rows, queryResults.schema.fields);
```

Nếu `queryResults.schema.fields` bị undefined → parseRows fail → data structure sai

### B. Data type conversion
- `tong_doanh_thu` từ BigQuery là STRING không phải NUMBER
- Cần `parseFloat()` thay vì `parseInt()`

### C. Filter date không đúng
- User đang xem date khác với filter trên dashboard
- Chart render data của ngày khác

## 4. Fix đã áp dụng

✅ **Thay `parseInt()` thành `parseFloat()`** cho tất cả revenue fields
✅ **Thêm extensive logging** để debug data flow
✅ **Console.log structure** của data item đầu tiên

## 5. Steps để verify

1. **Deploy code mới** lên Apps Script
2. **Mở dashboard** trong browser
3. **Mở DevTools Console** (F12)
4. **Reload page** và xem logs
5. **Check logs:**
   ```
   [App] Loading dashboard data with filter: {type: "day", date: "2025-11-28"}
   [App] ===== RAW API RESPONSE =====
   [ChartUtils] Top Customers Data: [...]
   ```

6. **So sánh:**
   - Data trong console
   - Data hiển thị trên chart
   - Data thực tế trong BigQuery

## 6. Expected behavior

Với data từ screenshot:
- **Bar chart** phải show GHN cao nhất (~205M)
- **Tooltip** hover vào GHN phải show: "60 chuyến, 204,988,493 ₫"
- **Order** từ trên xuống: GHN → J&T → GHTK

## 7. Nếu vẫn sai

### Option A: Hardcode test data
Thêm vào ChartUtils:
```javascript
// TEST: Override with known good data
if (window.location.search.includes('debug')) {
  data = [
    { ma_khach_hang: 'KH002', ten_khach_hang: 'GHN', so_chuyen: 60, tong_doanh_thu: 204988493 },
    { ma_khach_hang: 'KH001', ten_khach_hang: 'J&T', so_chuyen: 28, tong_doanh_thu: 61428572 },
    { ma_khach_hang: 'KH024', ten_khach_hang: 'GHTK', so_chuyen: 1, tong_doanh_thu: 1650000 }
  ];
}
```

### Option B: Log full response chain
Thêm logging ở mọi bước:
1. `BigQueryService.executeQuery()` - raw BigQuery response
2. `BigQueryService.parseRows()` - parsed data
3. `ApiClient.getAllDashboardData()` - API response
4. `ChartUtils.renderTopCustomersChart()` - chart input

## 8. Quick test query

Run trong BigQuery console:
```sql
SELECT
  ma_khach_hang,
  ten_khach_hang,
  COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
  ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
FROM `nakvi-476804.nak_logistics.tb_chuyen_di`
WHERE DATE(ngay_tao) = '2025-11-28'
GROUP BY ma_khach_hang, ten_khach_hang
ORDER BY tong_doanh_thu DESC
LIMIT 10
```

Compare kết quả với chart!

---

## Next Steps for User

1. ✅ Deploy code đã update
2. ✅ Open dashboard + DevTools Console
3. ✅ Screenshot console logs
4. ✅ Screenshot chart hiển thị
5. ✅ So sánh với BigQuery data
6. ✅ Report findings

Nếu data vẫn sai sau khi check logs → gửi screenshot console để debug tiếp!
