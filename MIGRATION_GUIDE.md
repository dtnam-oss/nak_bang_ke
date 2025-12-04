# 🔄 Hướng dẫn Migration: Google Apps Script → JavaScript thuần

## 📋 Tổng quan chuyển đổi

Hệ thống NAK Logistics Dashboard đã được chuyển đổi hoàn toàn từ **Google Apps Script (GAS)** sang **JavaScript thuần + Node.js**.

---

## 🎯 Mục tiêu đạt được

✅ **Loại bỏ phụ thuộc Google Apps Script**
✅ **Frontend 100% HTML/CSS/JavaScript thuần**
✅ **Backend API độc lập (Node.js + Express)**
✅ **Có thể nhúng vào bất kỳ website nào qua iframe**
✅ **Không giới hạn về performance và hosting**

---

## 📂 Cấu trúc mới

```
system_nak/
├── standalone/                 # ← Phiên bản mới (JavaScript thuần)
│   ├── index.html             # Frontend (single-file dashboard)
│   ├── server.js              # Backend API (Node.js + Express)
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── embed-example.html     # Ví dụ nhúng iframe
│   ├── README.md              # Tài liệu chi tiết
│   └── QUICKSTART.md          # Hướng dẫn nhanh 5 phút
│
├── [Original GAS files]       # ← Phiên bản cũ (giữ lại để tham khảo)
│   ├── Index.html
│   ├── Main.gs
│   ├── BigQueryService.gs
│   ├── Config.gs
│   ├── AppController.html
│   ├── ApiClient.html
│   └── ...
│
└── MIGRATION_GUIDE.md         # File này
```

---

## 🔍 So sánh Architecture

### **Trước đây (Google Apps Script)**

```
┌─────────────────────────────────────────┐
│        Google Apps Script Host          │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  Index.html  │───▶│   Main.gs    │  │
│  │  (Frontend)  │    │  (Backend)   │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
│         │                    ▼          │
│         │           ┌──────────────┐   │
│         │           │ BigQuerySvc  │   │
│         │           └──────────────┘   │
│         │                    │          │
└─────────┼────────────────────┼──────────┘
          │                    │
          │                    ▼
          │            ┌──────────────┐
          │            │   BigQuery   │
          └───────────▶│   Database   │
                       └──────────────┘

❌ Không thể nhúng iframe tự do
❌ Bị giới hạn quotas của Google
❌ Cold start chậm
```

### **Bây giờ (JavaScript thuần)**

```
┌─────────────────────────────────────────┐
│       Any Web Server / Hosting          │
│                                         │
│  ┌──────────────┐                      │
│  │  index.html  │  ← Single file       │
│  │  (Frontend)  │     100% JavaScript  │
│  └──────────────┘                      │
│         │                               │
│         │ HTTP/REST API                │
│         ▼                               │
│  ┌──────────────┐                      │
│  │  server.js   │  ← Node.js + Express │
│  │  (Backend)   │                      │
│  └──────────────┘                      │
│         │                               │
└─────────┼───────────────────────────────┘
          │
          │ BigQuery API
          ▼
  ┌──────────────┐
  │   BigQuery   │
  │   Database   │
  └──────────────┘

✅ Nhúng iframe tự do
✅ Không giới hạn performance
✅ Full control hosting
```

---

## 🔄 Các thay đổi chính

### 1. **Frontend: HTML Template → Single HTML File**

**Trước (GAS):**
```javascript
// Main.gs
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

```html
<!-- Index.html -->
<?!= include('Styles'); ?>
<?!= include('ApiClient'); ?>
<?!= include('AppController'); ?>
```

**Sau (Standalone):**
```html
<!-- index.html - All-in-one file -->
<!DOCTYPE html>
<html>
<head>
    <style>
        /* CSS inline */
    </style>
</head>
<body>
    <!-- HTML markup -->
    <script>
        // JavaScript inline
        const ApiClient = {...};
        const App = {...};
        // All logic in one file
    </script>
</body>
</html>
```

### 2. **API Calls: google.script.run → fetch()**

**Trước (GAS):**
```javascript
// ApiClient.html
const ApiClient = {
    getAllDashboardData: async function(filter) {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                .getAllDashboardData(filter);
        });
    }
};
```

**Sau (Standalone):**
```javascript
// index.html
const ApiClient = {
    async getAllDashboardData(filter) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/dashboard/all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter)
        });
        return response.json();
    }
};
```

### 3. **Backend: Apps Script Functions → Express API**

**Trước (GAS):**
```javascript
// Main.gs
function getAllDashboardData(filter) {
  return BigQueryService.getAllDashboardData(filter);
}

// BigQueryService.gs
var BigQueryService = {
  executeQuery: function(sql) {
    var queryResults = BigQuery.Jobs.query(request, PROJECT_ID);
    return queryResults;
  }
};
```

**Sau (Standalone):**
```javascript
// server.js
const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');

app.post('/api/dashboard/all', async (req, res) => {
    const filter = req.body;
    const data = await getAllDashboardData(filter);
    res.json({ success: true, data });
});

async function executeQuery(sql) {
    const [rows] = await bigquery.query(sql);
    return rows;
}
```

### 4. **Configuration: Config.gs → Environment Variables**

**Trước (GAS):**
```javascript
// Config.gs
var CONFIG = {
  BIGQUERY: {
    PROJECT_ID: 'nakvi-476804',
    DATASET: 'nak_logistics'
  }
};
```

**Sau (Standalone):**
```bash
# .env
BIGQUERY_PROJECT_ID=nakvi-476804
BIGQUERY_DATASET=nak_logistics
BIGQUERY_KEY_FILE=./service-account-key.json
```

```javascript
// server.js
require('dotenv').config();
const projectId = process.env.BIGQUERY_PROJECT_ID;
```

---

## 🚀 Hướng dẫn chuyển đổi

### **Option 1: Sử dụng phiên bản standalone đã tạo sẵn**

Đây là cách **KHUYÊN DÙNG** - đơn giản và nhanh nhất:

```bash
cd standalone
npm install
npm start
```

➡️ Xem [standalone/QUICKSTART.md](./standalone/QUICKSTART.md)

### **Option 2: Chạy song song cả 2 phiên bản**

- **Google Apps Script**: Giữ nguyên, dùng cho nội bộ Google Workspace
- **Standalone**: Deploy lên server riêng, dùng cho iframe embedding

### **Option 3: Migration hoàn toàn**

1. Test kỹ phiên bản standalone
2. Deploy lên production server
3. Cập nhật tất cả links sang domain mới
4. Ngừng sử dụng phiên bản GAS

---

## 📊 Demo Mode vs Production Mode

### **Demo Mode** (Không cần BigQuery)

Mặc định, dashboard chạy ở demo mode với dữ liệu mẫu:

```javascript
// index.html - ApiClient.getAllDashboardData()
async getAllDashboardData(filter) {
    // Demo mode - trả về dữ liệu mẫu
    return this._getDemoData();
}
```

✅ **Ưu điểm:**
- Chạy ngay, không cần setup
- Test UI/UX nhanh chóng
- Không tốn quota BigQuery

### **Production Mode** (Kết nối BigQuery thật)

Để chuyển sang production:

1. Setup BigQuery credentials
2. Cấu hình file `.env`
3. Sửa code trong `index.html`:

```javascript
async getAllDashboardData(filter) {
    // Production mode - gọi API thật
    return this._fetch('/dashboard/all', { method: 'POST', body: filter });
}
```

---

## 🔐 Bảo mật

### **Google Apps Script (Trước)**
- ✅ Tự động bảo mật bởi Google
- ✅ OAuth tích hợp sẵn
- ❌ Ít kiểm soát

### **Standalone (Sau)**
- ⚠️ Cần tự quản lý bảo mật:
  - HTTPS/SSL certificate
  - CORS configuration
  - Rate limiting
  - Input validation
  - Service account key protection

**Checklist bảo mật:**

```bash
✅ Không commit service-account-key.json
✅ Không commit .env
✅ Sử dụng HTTPS trong production
✅ Giới hạn CORS origins
✅ Implement rate limiting
✅ Validate tất cả input từ client
✅ Set proper file permissions (600 cho .env)
```

---

## 💰 Chi phí

### **Google Apps Script**
- ✅ Miễn phí (trong quotas)
- ❌ Bị giới hạn số requests, execution time
- ❌ Cold start chậm

### **Standalone**
- ⚠️ Chi phí hosting server:
  - VPS nhỏ: ~$5-10/tháng
  - Cloud Run: Pay-per-use (có free tier)
  - Vercel/Netlify: Miễn phí (cho frontend)
- ✅ Không giới hạn requests
- ✅ Performance tốt hơn

---

## 🎯 Kết luận

### **Khi nào dùng Google Apps Script?**
- ✅ Ứng dụng nội bộ Google Workspace
- ✅ Không cần nhúng iframe
- ✅ Traffic thấp
- ✅ Không muốn quản lý server

### **Khi nào dùng Standalone version?**
- ✅ Cần nhúng vào website bên ngoài
- ✅ Cần performance cao
- ✅ Traffic cao, cần scale
- ✅ Cần full control về UI/UX
- ✅ Muốn custom domain

---

## 📚 Tài liệu tham khảo

- [QUICKSTART.md](./standalone/QUICKSTART.md) - Chạy nhanh trong 5 phút
- [README.md](./standalone/README.md) - Tài liệu đầy đủ
- [embed-example.html](./standalone/embed-example.html) - Ví dụ iframe

---

## 🤝 Support

Nếu gặp vấn đề trong quá trình migration:

1. Kiểm tra [Troubleshooting](./standalone/README.md#-troubleshooting)
2. Xem server logs: `npm start` hoặc `pm2 logs`
3. Kiểm tra browser console (F12)

---

## ✅ Checklist Migration

- [ ] Đọc tài liệu QUICKSTART.md
- [ ] Test demo mode: `npm start`
- [ ] Test iframe embedding: `embed-example.html`
- [ ] Lấy BigQuery service account key
- [ ] Cấu hình .env file
- [ ] Chuyển sang production mode
- [ ] Test với dữ liệu thật
- [ ] Deploy lên server staging
- [ ] Setup SSL/HTTPS
- [ ] Cấu hình domain
- [ ] Test performance
- [ ] Deploy lên production
- [ ] Update tất cả iframe URLs
- [ ] Monitor logs và errors

---

**Happy Migration! 🚀**
