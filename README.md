# Logistics Dashboard - Google Apps Script

Web application quản lý logistics dashboard kết nối với BigQuery, được xây dựng trên Google Apps Script.

## 📁 Cấu trúc dự án (Refactored)

```
system_nak/
├── appsscript.json          # Apps Script configuration
├── .clasp.json              # CLASP deployment config
│
├── Server-side (.gs files)  # Backend - Google Apps Script
│   ├── Main.gs              # Entry points (doGet, API endpoints)
│   ├── Config.gs            # Configuration & constants
│   ├── BigQueryService.gs   # BigQuery service layer
│   └── ErrorHandler.gs      # Error handling & logging
│
└── Client-side (.html files) # Frontend
    ├── Index.html           # Main HTML structure
    ├── Styles.html          # CSS stylesheet
    ├── ClientConfig.html    # Client-side config & constants
    ├── ApiClient.html       # API communication layer
    ├── UIComponents.html    # UI rendering components
    └── AppController.html   # Main app controller
```

## 🏗️ Kiến trúc

### Backend (Server-side)

**Main.gs** - Entry points
- `doGet()`: Web app entry point
- `include()`: Helper để load CSS/JS files
- `getDashboardStats()`: API endpoint cho dashboard
- `testBigQueryConnection()`: Utility test function

**Config.gs** - Configuration
- BigQuery credentials & connection info
- SQL queries
- Feature flags
- Error messages

**BigQueryService.gs** - Service Layer
- `executeQuery()`: Execute BigQuery queries
- `getDashboardStats()`: Get dashboard statistics
- `parseRow()`: Parse BigQuery results
- Error handling cho BigQuery operations

**ErrorHandler.gs** - Error Management
- `log()`: Centralized logging
- `createErrorResponse()`: Standardized error responses
- `wrapFunction()`: Function wrapper với error handling

### Frontend (Client-side)

**Index.html** - Main Structure
- HTML skeleton
- Include các module khác qua `<?!= include() ?>`

**Styles.html** - Stylesheet
- CSS variables & theming
- Responsive design
- Component styles

**ClientConfig.html** - Configuration
- Menu items configuration
- UI settings
- Messages & constants

**ApiClient.html** - API Layer
- `getDashboardStats()`: Fetch dashboard data
- `_callServerFunction()`: Promise wrapper cho google.script.run
- Error handling cho API calls

**UIComponents.html** - UI Components
- `renderMenu()`: Render sidebar menu
- `renderDashboard()`: Render dashboard page
- `updateDashboardStats()`: Update số liệu
- `_animateValue()`: Animate số

**AppController.html** - Main Controller
- `init()`: Initialize app
- `navigate()`: Navigation logic
- `toggleSidebar()`: Sidebar control
- `handleCreateOrder()`: Handle create order

## 🚀 Deployment

### 1. Sử dụng CLASP (Command Line)

```bash
# Login vào Google Account
clasp login

# Push code lên Apps Script
clasp push

# Deploy web app
clasp deploy
```

### 2. Sử dụng Apps Script Editor

1. Mở https://script.google.com
2. Tạo project mới hoặc mở project hiện tại
3. Copy/paste nội dung từng file vào editor
4. Deploy → New deployment → Web app

## ⚙️ Configuration

### Cấu hình BigQuery

Mở file **Config.gs** và cập nhật:

```javascript
BIGQUERY: {
  PROJECT_ID: 'your-project-id',      // Thay bằng Project ID của bạn
  DATASET: 'your-dataset',            // Thay bằng Dataset name
  TABLE_TRIPS: 'your-table-name'      // Thay bằng Table name
}
```

### Cấu hình Menu

Mở file **ClientConfig.html** để chỉnh sửa menu:

```javascript
menuItems: [
  { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  // Thêm menu items khác...
]
```

## 🧪 Testing

### Test BigQuery Connection

Trong Apps Script Editor, chạy function:

```javascript
testBigQueryConnection()
```

Kiểm tra logs để xem kết quả.

### Debug Client-side

Mở browser console (F12) khi chạy web app để xem logs:
- `[App]` - Application logs
- `[API]` - API call logs
- `[UI]` - UI component logs

## 📊 Features

✅ **Đã hoàn thành:**
- Dashboard tổng quan với stats từ BigQuery
- Responsive design (mobile + desktop)
- Collapsible sidebar
- Modular architecture
- Error handling & logging

🚧 **Đang phát triển:**
- Hệ thống quản lý
- Báo cáo chi tiết
- Quản lý đội xe
- Module kế toán
- Tạo đơn hàng

## 🔧 Maintenance

### Thêm API Endpoint mới

1. **Server-side**: Thêm function vào **Main.gs**
```javascript
function getNewData(params) {
  return NewService.getData(params);
}
```

2. **Client-side**: Thêm method vào **ApiClient.html**
```javascript
getNewData: async function(params) {
  return await this._callServerFunction('getNewData', params);
}
```

### Thêm Page mới

1. **Config**: Thêm menu item vào **ClientConfig.html**
2. **UI**: Thêm render function vào **UIComponents.html**
3. **Controller**: Update navigate logic trong **AppController.html**

## 🐛 Troubleshooting

**Lỗi: "Script function not found"**
- Kiểm tra tên function trong Main.gs
- Đảm bảo đã save và deploy lại

**Lỗi: "BigQuery access denied"**
- Kiểm tra OAuth scopes trong appsscript.json
- Re-authorize ứng dụng

**UI không load:**
- Kiểm tra browser console
- Verify include() syntax trong Index.html

## 📝 Best Practices

1. **Separation of Concerns**: Mỗi file có trách nhiệm riêng
2. **Error Handling**: Luôn wrap API calls trong try-catch
3. **Logging**: Sử dụng console.log với prefix [Module]
4. **Configuration**: Đặt constants trong Config files
5. **Comments**: Document tất cả public functions

## 🔐 Security

- ⚠️ Không commit `.clasp.json` có credentials
- ⚠️ Không hardcode sensitive data trong code
- ✅ Sử dụng Config.gs cho settings
- ✅ Validate user input
- ✅ Use proper OAuth scopes

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Apps Script execution logs
2. Browser console logs
3. BigQuery query logs
4. Error messages trong ErrorHandler

---

**Version:** 1.0.0
**Last Updated:** 2025
**Tech Stack:** Google Apps Script, BigQuery, HTML/CSS/JavaScript
