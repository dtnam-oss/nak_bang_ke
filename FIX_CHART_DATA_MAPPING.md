# FIX: Chart Data Mapping Issues

## Vấn đề
User báo số liệu trên chart không khớp với dữ liệu thực tế trong BigQuery.

## Root Cause Analysis

### Nguyên nhân có thể:
1. ❌ **parseInt() cho revenue** - Mất phần thập phân (nếu có)
2. ❌ **Schema mapping sai** - `queryResults.schema` vs `queryResults.schema.fields`
3. ❌ **parseRows fails silently** - Không có error logging
4. ❌ **Field names không khớp** - Backend trả về khác frontend expect

## Fixes Applied

### 1. ✅ Changed parseInt() to parseFloat() cho tất cả revenue fields

**File:** `ChartUtils.html`

**Before:**
```javascript
const revenues = data.map(c => parseInt(c.tong_doanh_thu) || 0);
```

**After:**
```javascript
const revenues = data.map(c => parseFloat(c.tong_doanh_thu) || 0);
```

**Impact:** Đảm bảo không mất precision cho số lớn và số thập phân.

---

### 2. ✅ Added Extensive Logging

**File:** `ChartUtils.html` - All render functions

**Added:**
```javascript
// DEBUG: Log dữ liệu nhận được
console.log('[ChartUtils] Top Customers Data:', data);
console.log('[ChartUtils] First item structure:', data[0]);

// Prepare data
const names = data.map(c => c.ten_khach_hang || c.ma_khach_hang || 'N/A');
const revenues = data.map(c => parseFloat(c.tong_doanh_thu) || 0);

console.log('[ChartUtils] Chart data prepared:', { names, revenues });
```

**Impact:** Developer có thể debug chính xác data flow từ backend → frontend.

---

### 3. ✅ Enhanced parseRows with Defensive Checks

**File:** `BigQueryService.gs`

**Added:**
```javascript
// DEFENSIVE: Check if schema exists
if (!schema || !Array.isArray(schema)) {
  ErrorHandler.log('parseRows: schema is missing or invalid!', null, {
    schemaType: typeof schema,
    schemaValue: schema,
    rowCount: rows.length
  });
  return [];
}

// Log field names being used
ErrorHandler.log('parseRows: Parsing data', null, {
  fieldNames: fieldNames,
  rowCount: rows.length,
  firstRow: rows[0] ? JSON.stringify(rows[0]) : null
});

// Log parsed result
ErrorHandler.log('parseRows: Parsed successfully', null, {
  resultCount: parsed.length,
  firstItem: parsed[0] ? JSON.stringify(parsed[0]) : null
});
```

**Impact:**
- Catch schema errors sớm
- Log chi tiết mỗi bước parse
- Easier to trace where data mapping breaks

---

## Testing Instructions

### Step 1: Deploy Updated Code
Upload files to Apps Script:
- ✅ `ChartUtils.html`
- ✅ `BigQueryService.gs`

### Step 2: Open Dashboard with DevTools
1. Open dashboard URL
2. Press `F12` to open Chrome DevTools
3. Go to **Console** tab
4. Reload page

### Step 3: Check Logs

Look for these log entries:

#### A. Backend Logs (Apps Script Execution Log)
```
[parseRows] Parsing data
  fieldNames: ["ma_khach_hang", "ten_khach_hang", "so_chuyen", "tong_doanh_thu"]
  rowCount: 3
  firstRow: {"f":[{"v":"KH002"},{"v":"GHN"},{"v":"60"},{"v":"204988493"}]}

[parseRows] Parsed successfully
  resultCount: 3
  firstItem: {"ma_khach_hang":"KH002","ten_khach_hang":"GHN","so_chuyen":"60","tong_doanh_thu":"204988493"}
```

#### B. Frontend Logs (Browser Console)
```
[App] Loading dashboard data with filter: {type: "day", date: "2025-11-28"}

[App] ===== RAW API RESPONSE =====
Overview: {soChuyen: 89, soXe: 15, doanhThu: 268067065, soKhachHang: 3}
Top Customers: (3) [{…}, {…}, {…}]

[ChartUtils] Top Customers Data: (3) [{…}, {…}, {…}]
[ChartUtils] First item structure: {ma_khach_hang: "KH002", ten_khach_hang: "GHN", so_chuyen: "60", tong_doanh_thu: "204988493"}
[ChartUtils] Chart data prepared: {names: ["GHN", "J&T", "GHTK"], revenues: [204988493, 61428572, 1650000], trips: [60, 28, 1]}
```

### Step 4: Verify Chart Display

**Expected behavior:**
- Bar chart shows GHN at ~205M (highest)
- Hover tooltip shows "GHN: 60 chuyến, 204,988,493 ₫"
- Order: GHN > J&T > GHTK

### Step 5: Compare with BigQuery

Run query in BigQuery console:
```sql
SELECT
  ma_khach_hang,
  ten_khach_hang,
  COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
  ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
FROM `nakvi-476804.nak_logistics.tb_chuyen_di`
WHERE DATE(ngay_tao) = '2025-11-28'  -- or your test date
GROUP BY ma_khach_hang, ten_khach_hang
ORDER BY tong_doanh_thu DESC
LIMIT 10
```

Compare result with chart!

---

## Common Issues & Solutions

### Issue 1: Console shows "schema is missing or invalid"
**Cause:** `queryResults.schema` is undefined
**Fix:** Check if BigQuery response structure changed

### Issue 2: Chart data prepared shows all zeros
**Cause:** Field names don't match
**Fix:** Check `console.log('[ChartUtils] First item structure')` to see actual field names

### Issue 3: Chart shows correct data but wrong order
**Cause:** SQL ORDER BY not working
**Fix:** Check filter date - might be querying wrong date range

### Issue 4: Tooltip shows "NaN" or "0"
**Cause:** Data type conversion failed
**Fix:** Check if values are strings, use `parseFloat()` or `Number()`

---

## Rollback Plan

If issues persist:

1. **Disable logging:**
   ```javascript
   // Comment out console.log lines
   // console.log('[ChartUtils] Top Customers Data:', data);
   ```

2. **Test with hardcoded data:**
   ```javascript
   // Override data for testing
   data = [
     { ma_khach_hang: 'KH002', ten_khach_hang: 'GHN', so_chuyen: 60, tong_doanh_thu: 204988493 },
     { ma_khach_hang: 'KH001', ten_khach_hang: 'J&T', so_chuyen: 28, tong_doanh_thu: 61428572 },
     { ma_khach_hang: 'KH024', ten_khach_hang: 'GHTK', so_chuyen: 1, tong_doanh_thu: 1650000 }
   ];
   ```

3. **Check BigQuery API response structure:**
   - Log `queryResults` before parseRows
   - Verify `schema.fields` exists
   - Check if BigQuery updated API format

---

## Files Changed

1. ✅ **ChartUtils.html**
   - Changed `parseInt` → `parseFloat` for revenues
   - Added console.log debugging
   - Logged data structure at each step

2. ✅ **BigQueryService.gs**
   - Added defensive schema check in parseRows
   - Added extensive ErrorHandler.log calls
   - Log field names, row counts, parsed results

3. ✅ **DEBUG_CHART_DATA.md** (new)
   - Documentation about the issue
   - Debug steps
   - Expected vs actual comparison

4. ✅ **FIX_CHART_DATA_MAPPING.md** (this file)
   - Summary of fixes
   - Testing instructions
   - Troubleshooting guide

---

## Success Criteria

✅ Chart hiển thị đúng số liệu như BigQuery
✅ Console logs show correct data flow
✅ Tooltip hiển thị đúng format và giá trị
✅ Order của items khớp với SQL ORDER BY
✅ Không có errors trong console

---

## Next Actions

1. Deploy updated code
2. Test with real data
3. Screenshot console logs + chart
4. Compare with BigQuery results
5. Report findings

Nếu vẫn có issues → Share console logs để debug tiếp! 🔍
