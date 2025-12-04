# AppSheet Integration Guide

## 🎯 Mục đích

Hướng dẫn cách kết nối các module trong System Landing Page với AppSheet apps/views.

---

## 📋 Bước 1: Lấy URL từ AppSheet

### Cách 1: Lấy Direct App URL (Khuyên dùng)

1. **Truy cập AppSheet.com** và đăng nhập
2. **Mở app của bạn** trong AppSheet Editor
3. **Click vào "Share" hoặc "Users"** ở menu bên trái
4. **Copy "App URL"** - Sẽ có dạng:

```
https://www.appsheet.com/start/abc123def456
```

hoặc

```
https://www.appsheet.com/start/abc123def456-789012
```

### Cách 2: Lấy Specific View URL

Nếu bạn muốn mở trực tiếp một view cụ thể:

1. **Trong AppSheet Editor**, click **"Behavior"** → **"App views"**
2. **Chọn view** (ví dụ: "Trips", "Pricing", "Vehicles")
3. **Click "Copy link to this view"**
4. URL sẽ có dạng:

```
https://www.appsheet.com/start/abc123def456#view=Trips
```

hoặc

```
https://www.appsheet.com/start/abc123def456#appName=MyApp&page=view&table=Trips
```

### Cách 3: Lấy từ Mobile App

1. **Mở AppSheet app** trên điện thoại
2. **Mở view** bạn muốn share
3. **Click menu (⋮)** → **"Share this view"**
4. **Copy URL**

---

## 🔧 Bước 2: Cấu hình URL trong Code

### File: UIComponents.html

Tìm function `renderSystemLandingPage()` (dòng ~287) và **thay thế placeholder URLs**.

### Module 1: Chuyến đi (Trips)

**Tìm dòng này** (dòng ~287):
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/xxxxx\')">';
```

**Thay bằng**:
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/YOUR-TRIPS-APP-ID\')">';
```

**Ví dụ cụ thể**:
```javascript
// Nếu Trips App URL là: https://www.appsheet.com/start/abc123-trips
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/abc123-trips\')">';
```

### Module 2: Bảng giá (Pricing)

**Tìm dòng** (~300):
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/xxxxx\')">';
```

**Thay bằng**:
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/YOUR-PRICING-APP-ID\')">';
```

### Module 3: Kế hoạch (Planning)

**Dòng** (~313):
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/YOUR-PLANNING-APP-ID\')">';
```

### Module 4: Phương tiện (Vehicles)

**Dòng** (~326):
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/YOUR-VEHICLES-APP-ID\')">';
```

### Module 5: Nhân viên (Staff)

**Dòng** (~339):
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/YOUR-STAFF-APP-ID\')">';
```

### Module 6: Vendor

**Dòng** (~352):
```javascript
html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/YOUR-VENDOR-APP-ID\')">';
```

---

## 📝 Ví dụ đầy đủ

### Scenario: Bạn có các AppSheet apps sau

```
Trips App:    https://www.appsheet.com/start/abc123-trips
Pricing App:  https://www.appsheet.com/start/abc123-pricing
Planning:     https://docs.google.com/spreadsheets/d/xyz789/edit (Google Sheets)
Vehicles App: https://www.appsheet.com/start/abc123-vehicles
Staff App:    https://www.appsheet.com/start/abc123-staff
Vendor App:   https://www.appsheet.com/start/abc123-vendor
```

### Code sau khi cấu hình:

```javascript
renderSystemLandingPage: function() {
  var html = '<div class="system-landing-page">';
  html += '<div class="landing-header">';
  html += '<h1>He thong</h1>';
  html += '<p>Chon module de bat dau quan ly</p>';
  html += '</div>';
  html += '<div class="system-modules-grid">';

  // Module 1: Trips
  html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/abc123-trips\')">';
  html += '<div class="module-icon" style="background: #2196f3;">';
  html += '<i class="material-icons-outlined">local_shipping</i>';
  html += '</div>';
  html += '<div class="module-content">';
  html += '<h3 class="module-title">Chuyen di</h3>';
  html += '<p class="module-description">Quan ly va theo doi cac chuyen di</p>';
  html += '</div>';
  html += '<div class="module-action">';
  html += '<i class="material-icons-outlined">arrow_forward</i>';
  html += '</div>';
  html += '</div>';

  // Module 2: Pricing
  html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/abc123-pricing\')">';
  html += '<div class="module-icon" style="background: #4caf50;">';
  html += '<i class="material-icons-outlined">payments</i>';
  html += '</div>';
  html += '<div class="module-content">';
  html += '<h3 class="module-title">Bang gia</h3>';
  html += '<p class="module-description">Quan ly bang gia dich vu</p>';
  html += '</div>';
  html += '<div class="module-action">';
  html += '<i class="material-icons-outlined">arrow_forward</i>';
  html += '</div>';
  html += '</div>';

  // Module 3: Planning (Google Sheets)
  html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'https://docs.google.com/spreadsheets/d/xyz789/edit\')">';
  html += '<div class="module-icon" style="background: #ff9800;">';
  html += '<i class="material-icons-outlined">event_note</i>';
  html += '</div>';
  html += '<div class="module-content">';
  html += '<h3 class="module-title">Ke hoach</h3>';
  html += '<p class="module-description">Lap va quan ly ke hoach van hanh</p>';
  html += '</div>';
  html += '<div class="module-action">';
  html += '<i class="material-icons-outlined">arrow_forward</i>';
  html += '</div>';
  html += '</div>';

  // ... remaining modules
}
```

---

## 🔍 Các loại URL được hỗ trợ

### 1. AppSheet Direct URL
```javascript
'https://www.appsheet.com/start/abc123-def456'
```
✅ Mở app chính, trang home

### 2. AppSheet View URL
```javascript
'https://www.appsheet.com/start/abc123-def456#view=Trips'
```
✅ Mở trực tiếp view "Trips"

### 3. AppSheet with Page Parameter
```javascript
'https://www.appsheet.com/start/abc123#appName=MyApp&page=view&table=Trips'
```
✅ Mở view với parameters

### 4. Google Sheets
```javascript
'https://docs.google.com/spreadsheets/d/YOUR-SHEET-ID/edit'
```
✅ Mở Google Sheets trực tiếp

### 5. Google Apps Script Web App
```javascript
'https://script.google.com/macros/s/YOUR-SCRIPT-ID/exec'
```
✅ Mở Apps Script web app

### 6. External Web App
```javascript
'https://your-custom-app.com/trips'
```
✅ Mở bất kỳ URL nào

---

## 🧪 Testing

### Test 1: Verify URL hoạt động

**Trước khi cấu hình**, test URL trong browser:
1. Copy URL AppSheet
2. Paste vào browser mới
3. Verify: App mở đúng

### Test 2: Test trong Dashboard

1. **Cấu hình URL** trong UIComponents.html
2. **Deploy** lên Google Apps Script
3. **Refresh** dashboard
4. **Click "Hệ thống"** trong menu
5. **Click module card** (ví dụ: "Chuyen di")
6. **Verify**: Tab mới mở với AppSheet app

---

## ⚠️ Common Issues

### Issue 1: Alert "URL chua duoc cau hinh"

**Nguyên nhân**: URL vẫn là placeholder `https://www.appsheet.com/start/xxxxx`

**Giải pháp**: Thay `xxxxx` bằng App ID thực tế

---

### Issue 2: AppSheet yêu cầu login

**Nguyên nhân**: App chưa được share public hoặc user chưa có quyền

**Giải pháp**:
1. Trong AppSheet Editor → **Users** → **Share settings**
2. Chọn **"Anyone with the link"** hoặc **"Specific users"**
3. Save và test lại

---

### Issue 3: Pop-up bị chặn

**Nguyên nhân**: Browser chặn pop-up

**Giải pháp**:
1. Click icon khóa/chặn ở address bar
2. Allow pop-ups từ domain của bạn
3. Refresh page và thử lại

---

### Issue 4: URL có dấu `'` hoặc `"` đặc biệt

**Nguyên nhân**: URL có ký tự đặc biệt chưa được escape

**Giải pháp**:
```javascript
// Wrong
onclick="UIComponents.navigateToModule('url-with-'special-chars')"

// Correct - escape single quotes
onclick="UIComponents.navigateToModule(\'url-without-special-chars\')"
```

---

## 🎨 Customization

### Đổi tên module

**Tìm dòng**:
```javascript
html += '<h3 class="module-title">Chuyen di</h3>';
```

**Đổi thành**:
```javascript
html += '<h3 class="module-title">Trips Management</h3>';
```

### Đổi description

**Tìm dòng**:
```javascript
html += '<p class="module-description">Quan ly va theo doi cac chuyen di</p>';
```

**Đổi thành**:
```javascript
html += '<p class="module-description">View and manage all trips</p>';
```

### Đổi icon

**Tìm dòng**:
```javascript
html += '<i class="material-icons-outlined">local_shipping</i>';
```

**Đổi thành**:
```javascript
html += '<i class="material-icons-outlined">flight</i>';
```

Icon list: https://fonts.google.com/icons

### Đổi màu

**Tìm dòng**:
```javascript
html += '<div class="module-icon" style="background: #2196f3;">';
```

**Đổi thành**:
```javascript
html += '<div class="module-icon" style="background: #1976d2;">';
```

---

## 📚 Best Practices

### 1. Tổ chức URLs

Tạo một object lưu tất cả URLs ở đầu function:

```javascript
renderSystemLandingPage: function() {
  // Configuration
  var URLS = {
    trips: 'https://www.appsheet.com/start/abc123-trips',
    pricing: 'https://www.appsheet.com/start/abc123-pricing',
    planning: 'https://docs.google.com/spreadsheets/d/xyz789/edit',
    vehicles: 'https://www.appsheet.com/start/abc123-vehicles',
    staff: 'https://www.appsheet.com/start/abc123-staff',
    vendor: 'https://www.appsheet.com/start/abc123-vendor'
  };

  var html = '<div class="system-landing-page">';
  // ... rest of code

  // Use URLs
  html += '<div class="system-module-card" onclick="UIComponents.navigateToModule(\'' + URLS.trips + '\')">';
  // ...
}
```

### 2. Version Control

Comment URLs cũ khi thay đổi:

```javascript
// OLD: 'https://www.appsheet.com/start/old-app-id'
// NEW: 'https://www.appsheet.com/start/new-app-id'
html += '<div onclick="UIComponents.navigateToModule(\'https://www.appsheet.com/start/new-app-id\')">';
```

### 3. Testing URLs

Tạo test URLs cho development:

```javascript
var IS_PRODUCTION = true; // Set to false for testing

var URLS = {
  trips: IS_PRODUCTION
    ? 'https://www.appsheet.com/start/production-trips'
    : 'https://www.appsheet.com/start/test-trips'
};
```

---

## 🚀 Deployment Checklist

- [ ] Lấy tất cả AppSheet URLs
- [ ] Test từng URL trong browser
- [ ] Cấu hình URLs vào UIComponents.html (6 modules)
- [ ] Deploy lên Google Apps Script
- [ ] Test từng module trong dashboard
- [ ] Verify pop-ups không bị chặn
- [ ] Document URLs cho team

---

## 📞 Support

### Cần thêm hỗ trợ?

1. **AppSheet Help**: https://help.appsheet.com
2. **Material Icons**: https://fonts.google.com/icons
3. **Code Location**: [UIComponents.html](UIComponents.html) line 287

---

## 📋 Quick Reference

### Cấu trúc URL cần thay:

```javascript
// Line ~287 - Trips
onclick="UIComponents.navigateToModule(\'YOUR-TRIPS-URL\')"

// Line ~300 - Pricing
onclick="UIComponents.navigateToModule(\'YOUR-PRICING-URL\')"

// Line ~313 - Planning
onclick="UIComponents.navigateToModule(\'YOUR-PLANNING-URL\')"

// Line ~326 - Vehicles
onclick="UIComponents.navigateToModule(\'YOUR-VEHICLES-URL\')"

// Line ~339 - Staff
onclick="UIComponents.navigateToModule(\'YOUR-STAFF-URL\')"

// Line ~352 - Vendor
onclick="UIComponents.navigateToModule(\'YOUR-VENDOR-URL\')"
```

### Escape characters:

- Single quote trong URL: `\'`
- Example: `navigateToModule(\'https://example.com\')`

---

**Last Updated**: 2025-11-29
**Version**: 1.0
