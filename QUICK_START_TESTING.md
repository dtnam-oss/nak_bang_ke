# Quick Start Testing Guide

Hướng dẫn nhanh để test dashboard sau khi deploy v2.0

---

## 🚀 Test trong 5 phút

### Test 1: Charts hiển thị đúng (2 phút)

1. **Mở dashboard**
   ```
   - Truy cập URL web app
   - Chờ data load (3-5 giây lần đầu)
   ```

2. **Kiểm tra 4 charts**

   **Top 10 Khách hàng** (Bar Chart)
   - ✅ Hiển thị bar chart ngang
   - ✅ GHN = màu cam (#ff9800)
   - ✅ J&T = màu đỏ (#f44336)
   - ✅ GHTK = màu xanh lá (#4caf50)
   - ✅ Tooltip hiển thị đúng định dạng tiền

   **Top 10 Tuyến** (Pie Chart)
   - ✅ Hiển thị pie chart
   - ✅ Legend bên phải
   - ✅ Hover hiển thị %
   - ✅ Màu sắc phân biệt rõ ràng

   **Top 10 Xe cao** (Bar + Line)
   - ✅ Bar chart màu xanh lá
   - ✅ Line chart màu cam
   - ✅ 2 trục Y hoạt động
   - ✅ Tooltip hiển thị cả 2 metrics

   **Top 10 Xe thấp** (Grouped Bar)
   - ✅ Bar chart màu đỏ + cam
   - ✅ 2 bars cho mỗi xe
   - ✅ Labels xoay 45°
   - ✅ Tooltip định dạng đúng

**✅ PASS nếu**: Tất cả 4 charts hiển thị đúng màu sắc và data
**❌ FAIL nếu**: Bất kỳ chart nào không hiển thị hoặc sai màu

---

### Test 2: Caching hoạt động (1 phút)

1. **Lần load đầu tiên**
   ```
   - Mở DevTools Console (F12)
   - Reload page (Ctrl+R / Cmd+R)
   - Quan sát thời gian load: ~3-5 giây
   ```

2. **Lần load thứ hai**
   ```
   - Reload page lần nữa
   - Quan sát thời gian load: ~50ms (instant)
   - Data hiển thị ngay lập tức
   ```

3. **Kiểm tra LocalStorage**
   ```
   - DevTools > Application > Local Storage
   - Tìm key: dashboard_cache_v1
   - Verify: có dữ liệu JSON
   ```

**✅ PASS nếu**: Lần 2 load nhanh hơn nhiều (< 200ms)
**❌ FAIL nếu**: Lần 2 vẫn chậm như lần 1

---

### Test 3: Filter hoạt động (1 phút)

1. **Đổi filter type**
   ```
   - Click button "Tuần"
   - Quan sát: data update
   - Click button "Tháng"
   - Quan sát: data update
   ```

2. **Đổi ngày**
   ```
   - Click date picker
   - Chọn ngày hôm qua
   - Click "Áp dụng"
   - Quan sát: data update
   ```

3. **Test prefetch**
   ```
   - Chọn filter "Ngày" với ngày hôm nay
   - Đợi 3 giây (prefetch chạy background)
   - Đổi sang ngày mai
   - Quan sát: load instant (đã prefetch)
   ```

**✅ PASS nếu**: Filters update nhanh, prefetch hoạt động
**❌ FAIL nếu**: Filters không update hoặc lỗi

---

### Test 4: Console không có lỗi (30 giây)

```
- Mở DevTools Console (F12)
- Reload page
- Kiểm tra: KHÔNG có errors màu đỏ
- Chỉ có logs bình thường (nếu có)
```

**✅ PASS nếu**: Console sạch, không errors
**❌ FAIL nếu**: Có errors màu đỏ

---

### Test 5: Mobile responsive (30 giây)

```
- DevTools > Toggle device toolbar (Ctrl+Shift+M)
- Chọn iPhone 12 Pro
- Kiểm tra:
  - Sidebar collapse
  - Charts hiển thị đúng
  - Filters hoạt động
  - Không bị lỗi layout
```

**✅ PASS nếu**: Mobile layout hoạt động tốt
**❌ FAIL nếu**: Layout bị vỡ hoặc charts không hiển thị

---

## 🧪 Test chi tiết (15 phút)

### A. Cache Statistics

**Mở Console và chạy:**
```javascript
PerformanceUtils.getCacheStats()
```

**Expected Output:**
```javascript
{
  totalEntries: 1-20,          // Số cache entries
  totalHits: 0+,               // Số lần cache hit
  oldestEntry: <timestamp>,    // Timestamp của entry cũ nhất
  newestEntry: <timestamp>,    // Timestamp của entry mới nhất
  cacheSize: <bytes>           // Size của cache (bytes)
}
```

**✅ PASS**: Returns valid object với các fields trên
**❌ FAIL**: Returns error hoặc undefined

---

### B. Cache Expiry Test

1. **Set cache**
   ```javascript
   PerformanceUtils.setCache('test_key', { data: 'test' })
   ```

2. **Get immediately**
   ```javascript
   PerformanceUtils.getCache('test_key')
   // Should return: { data: 'test' }
   ```

3. **Wait 11 minutes** (hoặc hack timestamp)
   ```javascript
   // Hack: Set old timestamp
   PerformanceUtils.cache['test_key'].timestamp = Date.now() - (11 * 60 * 1000)
   ```

4. **Get again**
   ```javascript
   PerformanceUtils.getCache('test_key')
   // Should return: null (expired)
   ```

**✅ PASS**: Cache expires sau 10 phút
**❌ FAIL**: Cache không expire hoặc lỗi

---

### C. LRU Eviction Test

```javascript
// Add 21 entries (max is 20)
for (let i = 0; i < 21; i++) {
  PerformanceUtils.setCache(`key_${i}`, { data: i })
}

// Check cache size
const stats = PerformanceUtils.getCacheStats()
console.log(stats.totalEntries)
// Should be exactly 20
```

**✅ PASS**: totalEntries = 20 (oldest removed)
**❌ FAIL**: totalEntries > 20 (eviction failed)

---

### D. Prefetch Test

1. **Load dashboard với filter = "day" hôm nay**
   ```
   - Wait for initial load
   - Wait 3 seconds (prefetch running)
   ```

2. **Check cache**
   ```javascript
   const stats = PerformanceUtils.getCacheStats()
   console.log(stats.totalEntries)
   // Should be > 1 (initial + prefetched)
   ```

3. **Switch to tomorrow**
   ```
   - Change date to tomorrow
   - Click Apply
   - Should load INSTANT (< 200ms)
   ```

**✅ PASS**: Tomorrow's data loads instantly
**❌ FAIL**: Tomorrow's data takes 3-5s (not prefetched)

---

### E. Customer Color Test

**Test all variations:**

```javascript
// Test GHN
const getCustomerColor = ChartUtils.getCustomerColor ||
  function(name) {
    const n = name.toUpperCase()
    if (n.includes('GHN')) return '#ff9800'
    if (n.includes('J&T') || n.includes('JT') || n.includes('J T')) return '#f44336'
    if (n.includes('GHTK')) return '#4caf50'
    return '#2196f3'
  }

// Test cases
console.log(getCustomerColor('GHN'))          // #ff9800
console.log(getCustomerColor('ghn express'))  // #ff9800
console.log(getCustomerColor('J&T'))          // #f44336
console.log(getCustomerColor('JT'))           // #f44336
console.log(getCustomerColor('j t'))          // #f44336
console.log(getCustomerColor('GHTK'))         // #4caf50
console.log(getCustomerColor('Kerry'))        // #2196f3
```

**✅ PASS**: All colors match expected values
**❌ FAIL**: Any color mismatch

---

## 🔍 Common Issues & Solutions

### Issue 1: Charts không hiển thị

**Symptoms**: Empty white boxes thay vì charts

**Causes**:
- ECharts CDN failed to load
- Data format incorrect
- Chart container not found

**Solutions**:
```javascript
// Check ECharts loaded
console.log(typeof echarts)
// Should be: "object"

// Check data format
console.log(allData)
// Should have: topCustomers, topRoutes, etc.

// Check container exists
console.log(document.getElementById('chart-top-customers'))
// Should be: <div> element
```

---

### Issue 2: Cache không work

**Symptoms**: Lần 2 load vẫn chậm

**Causes**:
- LocalStorage disabled
- Cache key mismatch
- Cache expired

**Solutions**:
```javascript
// Check LocalStorage available
console.log(typeof localStorage)
// Should be: "object"

// Check cache exists
console.log(localStorage.getItem('dashboard_cache_v1'))
// Should be: JSON string

// Check cache valid
const cache = JSON.parse(localStorage.getItem('dashboard_cache_v1'))
console.log(cache)
// Should be: object with keys
```

---

### Issue 3: Colors sai

**Symptoms**: All bars cùng màu xanh dương

**Causes**:
- Customer color function not called
- Name matching failed
- Function not defined

**Solutions**:
```javascript
// Check function exists
console.log(typeof getCustomerColor)
// Should be: "function"

// Test with actual customer name
const testData = [
  { ten_khach_hang: 'GHN' },
  { ten_khach_hang: 'J&T' },
  { ten_khach_hang: 'GHTK' }
]

testData.forEach(c => {
  console.log(c.ten_khach_hang, '→', getCustomerColor(c.ten_khach_hang))
})
// Should show: GHN → #ff9800, J&T → #f44336, etc.
```

---

### Issue 4: Prefetch không work

**Symptoms**: Filter change vẫn chậm

**Causes**:
- Prefetch function not called
- Prefetch candidates empty
- Network error

**Solutions**:
```javascript
// Check prefetch called
// (Add temporary log in prefetchLikelyFilters)

// Check candidates generated
const filter = { type: 'day', date: '2025-11-29' }
const candidates = PerformanceUtils.getPrefetchCandidates(filter)
console.log(candidates)
// Should have 3 items: tomorrow, yesterday, week

// Check network requests
// DevTools > Network tab
// Should see background requests after 1s, 2s, 3s
```

---

## 📊 Performance Benchmarks

### Target Performance

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Initial load (cold) | < 3s | < 5s | > 5s |
| Repeat load (warm) | < 100ms | < 200ms | > 500ms |
| Filter change (cached) | < 100ms | < 200ms | > 500ms |
| Filter change (uncached) | < 3s | < 5s | > 5s |
| Cache hit rate | > 80% | > 60% | < 50% |

### How to Measure

**1. Initial Load Time**
```javascript
// In Console:
performance.timing.loadEventEnd - performance.timing.navigationStart
// Returns milliseconds
```

**2. Repeat Load Time**
```javascript
// Clear network cache but keep LocalStorage
// Reload page
// Measure again with performance.timing
```

**3. Cache Hit Rate**
```javascript
// After using dashboard for 10+ filter changes:
const stats = PerformanceUtils.getCacheStats()
const hitRate = (stats.totalHits / stats.totalEntries) * 100
console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`)
```

---

## ✅ Final Checklist

### Before Deployment
- [ ] All tests pass locally
- [ ] No console errors
- [ ] Charts display correctly
- [ ] Caching works
- [ ] Prefetch works
- [ ] Mobile responsive
- [ ] Browser compatibility verified

### After Deployment
- [ ] Production URL accessible
- [ ] All tests pass in production
- [ ] Cache statistics look good
- [ ] No errors in Apps Script logs
- [ ] User feedback positive

---

## 🎯 Success Criteria

**Deployment is SUCCESSFUL if:**

✅ All 5 quick tests PASS (< 5 minutes)
✅ No console errors in any browser
✅ Cache hit rate > 60% after 10 filter changes
✅ Filter changes < 200ms for cached data
✅ Charts display with correct colors
✅ Mobile layout works properly

**Deployment needs REVIEW if:**

⚠️ 1-2 quick tests FAIL but others PASS
⚠️ Cache hit rate 40-60%
⚠️ Minor UI glitches
⚠️ Performance acceptable but not optimal

**Deployment should ROLLBACK if:**

❌ 3+ quick tests FAIL
❌ Critical console errors
❌ Charts don't display at all
❌ Cache completely broken
❌ Data displays incorrectly
❌ App unusable on mobile

---

## 📞 Need Help?

**If tests fail:**
1. Check [Common Issues](#common-issues--solutions) section above
2. Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Check browser Console for errors
4. Review Apps Script logs
5. Contact development team

**Support Resources:**
- Documentation: See ADVANCED_CACHING.md
- Issues: [GitHub/Issue Tracker]
- Email: [Support Email]

---

**Happy Testing!** 🚀

*Last updated: 2025-11-29*
