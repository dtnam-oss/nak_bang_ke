# System Module Configuration Guide

## Tổng quan

Module **Hệ thống** là một landing page điều hướng đến các ứng dụng quản lý cụ thể (AppSheet hoặc các tools khác). Module này bao gồm 6 mục chính:

1. **Chuyến đi** - Quản lý và theo dõi các chuyến đi
2. **Bảng giá** - Quản lý bảng giá dịch vụ
3. **Kế hoạch** - Lập và quản lý kế hoạch vận hành
4. **Phương tiện** - Quản lý danh sách phương tiện
5. **Nhân viên** - Quản lý thông tin nhân viên
6. **Vendor** - Quản lý nhà cung cấp và đối tác

---

## Cấu hình URL

### File: [UIComponents.html](UIComponents.html)

Tìm function `renderSystemLandingPage()` (dòng ~282) và cập nhật URL cho từng module:

```javascript
renderSystemLandingPage: function() {
  const modules = [
    {
      id: 'trips',
      title: 'Chuyến đi',
      icon: 'local_shipping',
      description: 'Quản lý và theo dõi các chuyến đi',
      color: '#2196f3',
      url: 'https://www.appsheet.com/start/xxxxx', // ⬅️ THAY ĐỔI URL Ở ĐÂY
      badge: null
    },
    // ... các modules khác
  ];
}
```

### Các trường cần cấu hình

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| `id` | ID duy nhất của module | `'trips'` |
| `title` | Tiêu đề hiển thị | `'Chuyến đi'` |
| `icon` | Material Icon name | `'local_shipping'` |
| `description` | Mô tả ngắn gọn | `'Quản lý và theo dõi các chuyến đi'` |
| `color` | Màu sắc icon (hex) | `'#2196f3'` |
| `url` | **URL điều hướng** | `'https://www.appsheet.com/start/abc123'` |
| `badge` | Badge hiển thị (optional) | `'NEW'`, `'BETA'`, hoặc `null` |

---

## Ví dụ cấu hình đầy đủ

```javascript
const modules = [
  {
    id: 'trips',
    title: 'Chuyến đi',
    icon: 'local_shipping',
    description: 'Quản lý và theo dõi các chuyến đi',
    color: '#2196f3',
    url: 'https://www.appsheet.com/start/trip-management-app',
    badge: null
  },
  {
    id: 'pricing',
    title: 'Bảng giá',
    icon: 'payments',
    description: 'Quản lý bảng giá dịch vụ',
    color: '#4caf50',
    url: 'https://www.appsheet.com/start/pricing-app',
    badge: 'NEW' // ⬅️ Hiển thị badge "NEW"
  },
  {
    id: 'planning',
    title: 'Kế hoạch',
    icon: 'event_note',
    description: 'Lập và quản lý kế hoạch vận hành',
    color: '#ff9800',
    url: 'https://docs.google.com/spreadsheets/d/xxxxx/edit',
    badge: null
  },
  {
    id: 'vehicles',
    title: 'Phương tiện',
    icon: 'directions_car',
    description: 'Quản lý danh sách phương tiện',
    color: '#9c27b0',
    url: 'https://www.appsheet.com/start/vehicle-app',
    badge: 'BETA'
  },
  {
    id: 'staff',
    title: 'Nhân viên',
    icon: 'people',
    description: 'Quản lý thông tin nhân viên',
    color: '#f44336',
    url: 'https://www.appsheet.com/start/staff-app',
    badge: null
  },
  {
    id: 'vendors',
    title: 'Vendor',
    icon: 'business',
    description: 'Quản lý nhà cung cấp và đối tác',
    color: '#00bcd4',
    url: 'https://www.appsheet.com/start/vendor-app',
    badge: null
  }
];
```

---

## Material Icons Available

Danh sách icons phổ biến có thể sử dụng:

| Icon Name | Visual | Use Case |
|-----------|--------|----------|
| `local_shipping` | 🚚 | Chuyến đi, vận chuyển |
| `payments` | 💰 | Bảng giá, thanh toán |
| `event_note` | 📅 | Kế hoạch, lịch trình |
| `directions_car` | 🚗 | Phương tiện, xe |
| `people` | 👥 | Nhân viên, người dùng |
| `business` | 🏢 | Vendor, công ty |
| `inventory` | 📦 | Kho hàng |
| `analytics` | 📊 | Báo cáo |
| `settings` | ⚙️ | Cài đặt |
| `map` | 🗺️ | Bản đồ |

Xem full list tại: https://fonts.google.com/icons

---

## Color Scheme Recommendations

### Màu sắc theo chức năng

| Module | Màu | Hex Code | Ý nghĩa |
|--------|-----|----------|---------|
| Chuyến đi | Blue | `#2196f3` | Vận chuyển, di chuyển |
| Bảng giá | Green | `#4caf50` | Tiền, tài chính |
| Kế hoạch | Orange | `#ff9800` | Cảnh báo, lịch trình |
| Phương tiện | Purple | `#9c27b0` | Đặc biệt, cao cấp |
| Nhân viên | Red | `#f44336` | Con người, quan trọng |
| Vendor | Cyan | `#00bcd4` | Đối tác, hợp tác |

### Màu khác có thể dùng

- **Indigo**: `#3f51b5`
- **Teal**: `#009688`
- **Amber**: `#ffc107`
- **Deep Orange**: `#ff5722`
- **Pink**: `#e91e63`
- **Lime**: `#cddc39`

---

## Badge Configuration

### Hiển thị Badge

```javascript
{
  title: 'Chuyến đi',
  badge: 'NEW'  // Hiển thị badge màu cam
}
```

### Không hiển thị Badge

```javascript
{
  title: 'Chuyến đi',
  badge: null   // Không hiển thị badge
}
```

### Custom Badge Text

```javascript
badge: 'NEW'      // Badge màu cam với text "NEW"
badge: 'BETA'     // Badge màu cam với text "BETA"
badge: 'HOT'      // Badge màu cam với text "HOT"
badge: 'SOON'     // Badge màu cam với text "SOON"
```

---

## URL Types Supported

### 1. AppSheet URLs

```javascript
url: 'https://www.appsheet.com/start/abc123-def456'
```

### 2. Google Sheets URLs

```javascript
url: 'https://docs.google.com/spreadsheets/d/xxxxx/edit'
```

### 3. Google Apps Script Web Apps

```javascript
url: 'https://script.google.com/macros/s/xxxxx/exec'
```

### 4. External Web Apps

```javascript
url: 'https://your-app.com/dashboard'
```

### 5. Same-domain URLs (relative)

```javascript
url: '/internal-page'  // NOT recommended, use full URLs
```

---

## Behavior

### Click Action

Khi user click vào module card:
- URL hợp lệ → Mở tab mới (`window.open(url, '_blank')`)
- URL chưa cấu hình (placeholder) → Hiển thị alert

### Alert Message

Nếu URL chưa được cấu hình (vẫn là placeholder `https://www.appsheet.com/start/xxxxx`):

```
URL chưa được cấu hình.
Vui lòng cập nhật URL trong UIComponents.renderSystemLandingPage()
```

---

## Testing

### Test từng module

1. **Mở dashboard**
   ```
   Navigate to "Hệ thống" menu
   ```

2. **Click vào từng module card**
   ```
   - Chuyến đi → Kiểm tra URL đúng
   - Bảng giá → Kiểm tra URL đúng
   - Kế hoạch → Kiểm tra URL đúng
   - Phương tiện → Kiểm tra URL đúng
   - Nhân viên → Kiểm tra URL đúng
   - Vendor → Kiểm tra URL đúng
   ```

3. **Kiểm tra pop-up blocker**
   ```
   - Ensure browser allows pop-ups from your domain
   - Test on Chrome, Firefox, Safari
   ```

### Test responsive

```
- Desktop: 2-3 columns
- Tablet: 2 columns
- Mobile: 1 column
```

---

## Troubleshooting

### Issue 1: Module không mở tab mới

**Cause**: Pop-up blocker đang chặn

**Solution**:
- Cho phép pop-ups từ domain của bạn
- Hoặc user phải click "Allow" khi browser hỏi

### Issue 2: Alert "URL chưa được cấu hình"

**Cause**: URL vẫn là placeholder `https://www.appsheet.com/start/xxxxx`

**Solution**:
- Cập nhật URL thực tế trong `UIComponents.html`
- Deploy lại app

### Issue 3: Icon không hiển thị

**Cause**: Icon name sai hoặc Material Icons chưa load

**Solution**:
- Check icon name tại https://fonts.google.com/icons
- Verify Material Icons CSS đã được include trong Index.html

### Issue 4: Colors không hiển thị

**Cause**: Hex code sai format

**Solution**:
- Sử dụng format `#RRGGBB` (6 digits)
- Ví dụ: `#2196f3`, `#ff9800`

---

## Advanced Customization

### 1. Thêm module mới

```javascript
const modules = [
  // ... existing modules
  {
    id: 'reports',
    title: 'Báo cáo',
    icon: 'analytics',
    description: 'Xem và tải báo cáo',
    color: '#673ab7',
    url: 'https://your-reports-url.com',
    badge: 'NEW'
  }
];
```

### 2. Thay đổi thứ tự modules

Chỉ cần đổi thứ tự trong array:

```javascript
const modules = [
  // Module 1
  { id: 'pricing', ... },
  // Module 2
  { id: 'trips', ... },
  // ...
];
```

### 3. Ẩn module tạm thời

Comment out module:

```javascript
const modules = [
  { id: 'trips', ... },
  // { id: 'pricing', ... },  // ⬅️ Ẩn module này
  { id: 'planning', ... },
];
```

### 4. Conditional rendering (dynamic)

```javascript
const modules = [
  { id: 'trips', ... },
  { id: 'pricing', ... },
];

// Only show "Planning" for admin users
if (userRole === 'admin') {
  modules.push({ id: 'planning', ... });
}
```

---

## Visual Preview

### Desktop Layout (3 columns)
```
┌──────────────────────────────────────────────────┐
│              Hệ thống                            │
│     Chọn module để bắt đầu quản lý              │
├──────────────┬──────────────┬──────────────────┤
│ 🚚 Chuyến đi │ 💰 Bảng giá  │ 📅 Kế hoạch     │
│ Quản lý...   │ Quản lý...   │ Lập và quản lý...│
├──────────────┼──────────────┼──────────────────┤
│ 🚗 Phương    │ 👥 Nhân viên │ 🏢 Vendor       │
│ tiện         │              │                  │
└──────────────┴──────────────┴──────────────────┘
```

### Mobile Layout (1 column)
```
┌─────────────────────┐
│    Hệ thống        │
│ Chọn module...     │
├────────────────────┤
│ 🚚 Chuyến đi       │
│ Quản lý...         │
├────────────────────┤
│ 💰 Bảng giá        │
│ Quản lý...         │
├────────────────────┤
│ ...                │
└────────────────────┘
```

---

## Deployment Checklist

- [ ] Cập nhật URL cho tất cả 6 modules
- [ ] Test URLs hoạt động (mở được tab mới)
- [ ] Kiểm tra icons hiển thị đúng
- [ ] Kiểm tra colors hiển thị đúng
- [ ] Test trên desktop
- [ ] Test trên mobile
- [ ] Test pop-up blocker
- [ ] Deploy to production

---

## Related Files

- [UIComponents.html](UIComponents.html) - Module configuration (line ~282)
- [AppController.html](AppController.html) - Navigation logic (line ~68)
- [Styles.html](Styles.html) - CSS styling (line ~898)

---

## Support

Nếu cần hỗ trợ:
- Check [UIComponents.html](UIComponents.html) line 282
- Check browser console for errors
- Verify Material Icons CSS loaded
- Test URLs manually in new tab

---

**Last Updated**: 2025-11-29
**Version**: 1.0
