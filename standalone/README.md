# NAK Logistics Dashboard - Standalone Version

> Phiên bản độc lập sử dụng **JavaScript thuần + HTML + Node.js**, có thể nhúng vào bất kỳ website nào qua **iframe**.

## 📋 Tổng quan

Đây là phiên bản chuyển đổi hoàn toàn từ **Google Apps Script** sang **pure JavaScript/HTML** với backend **Node.js + Express**.

### ✨ Tính năng chính

- ✅ **100% JavaScript thuần** - Không phụ thuộc Google Apps Script
- ✅ **Backend API riêng** - Node.js + Express + BigQuery
- ✅ **Có thể nhúng iframe** - Hoạt động độc lập hoàn toàn
- ✅ **Responsive Design** - Tương thích mobile/tablet/desktop
- ✅ **Real-time Charts** - Sử dụng Apache ECharts
- ✅ **Demo Mode** - Chạy được ngay mà không cần BigQuery

---

## 🚀 Cài đặt nhanh

### 1. Cài đặt dependencies

```bash
cd standalone
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=3000
BIGQUERY_PROJECT_ID=nakvi-476804
BIGQUERY_DATASET=nak_logistics
BIGQUERY_KEY_FILE=./service-account-key.json
```

### 3. Lấy BigQuery Service Account Key

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project `nakvi-476804`
3. Vào **IAM & Admin** → **Service Accounts**
4. Tạo hoặc chọn service account có quyền truy cập BigQuery
5. Tạo key (JSON format)
6. Download và lưu vào thư mục `standalone/` với tên `service-account-key.json`

### 4. Chạy server

```bash
npm start
```

Hoặc chạy ở chế độ development (auto-reload):

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 📂 Cấu trúc thư mục

```
standalone/
├── index.html              # Frontend - Dashboard UI (single file)
├── server.js               # Backend API server (Node.js + Express)
├── package.json            # Node.js dependencies
├── .env.example            # Environment variables template
├── .env                    # Environment variables (tạo từ .env.example)
├── .gitignore              # Git ignore file
├── embed-example.html      # Ví dụ nhúng dashboard qua iframe
├── service-account-key.json # BigQuery credentials (không commit)
└── README.md               # Tài liệu này
```

---

## 🎯 Demo Mode (không cần BigQuery)

Dashboard có sẵn **demo mode** với dữ liệu mẫu. Bạn có thể test ngay mà không cần kết nối BigQuery:

1. Mở file [index.html](./index.html)
2. Tìm đến phần `ApiClient._getDemoData()` (dòng ~235)
3. Đoạn code này sẽ trả về dữ liệu mẫu

Để chuyển sang **production mode** (dùng BigQuery thật):

```javascript
// Trong ApiClient.getAllDashboardData()
// Comment dòng demo:
// return this._getDemoData();

// Uncomment dòng production:
return this._fetch('/dashboard/all', { method: 'POST', body: filter });
```

---

## 🖼️ Nhúng vào website (iframe)

### Cách 1: Nhúng trực tiếp

```html
<iframe
    src="http://localhost:3000/index.html"
    width="100%"
    height="800px"
    frameborder="0"
    style="border: none; border-radius: 8px;"
    allow="fullscreen"
></iframe>
```

### Cách 2: Responsive iframe

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe
        src="http://localhost:3000/index.html"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
        allow="fullscreen"
    ></iframe>
</div>
```

### Ví dụ đầy đủ

Xem file [embed-example.html](./embed-example.html) để có ví dụ hoàn chỉnh về cách nhúng dashboard.

Mở trực tiếp trong browser:

```bash
open embed-example.html
# hoặc
http://localhost:3000/embed-example.html
```

---

## 🔧 Tùy chỉnh

### Thay đổi API endpoint

Mở file `index.html`, tìm phần `CONFIG`:

```javascript
const CONFIG = {
    // Thay đổi URL này để trỏ đến backend của bạn
    API_BASE_URL: 'http://localhost:3000/api',

    // Hoặc production URL
    // API_BASE_URL: 'https://your-domain.com/api',

    menuItems: [...],
    ui: {...}
};
```

### Thay đổi theme/màu sắc

Trong file `index.html`, tìm phần CSS variables:

```css
:root {
    --primary-color: #2962ff;      /* Màu chủ đạo */
    --secondary-color: #00bfa5;    /* Màu phụ */
    --danger-color: #e53935;       /* Màu nguy hiểm */
    --warning-color: #ff6f00;      /* Màu cảnh báo */
    --success-color: #43a047;      /* Màu thành công */
    /* ... */
}
```

### Thêm/xóa menu items

Trong `CONFIG.menuItems`:

```javascript
menuItems: [
    { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { id: 'system', label: 'Hệ thống', icon: 'settings' },
    { id: 'accounting', label: 'Kế toán', icon: 'account_balance' },
    { id: 'reports', label: 'Báo cáo', icon: 'assessment' },
    // Thêm menu mới:
    { id: 'analytics', label: 'Phân tích', icon: 'analytics' }
]
```

---

## 🔌 API Endpoints

Backend cung cấp các endpoint sau:

### Health Check
```
GET /api/health
```

### Dashboard Data
```
POST /api/dashboard/all
Body: { "type": "day|week|month|year", "date": "YYYY-MM-DD" }
```

### Kế toán Module

**Lấy danh sách khách hàng:**
```
GET /api/ke-toan/customers
```

**Lấy danh sách loại tuyến:**
```
GET /api/ke-toan/route-types
```

**Lấy dữ liệu đối soát:**
```
POST /api/ke-toan/doi-soat
Body: {
    "ma_khach_hang": "KH001",
    "loai_tuyen": "Nội tỉnh",
    "tu_ngay": "2024-01-01",
    "den_ngay": "2024-01-31"
}
```

---

## 🛠️ Troubleshooting

### Lỗi: "Cannot find module 'express'"

```bash
npm install
```

### Lỗi: "BIGQUERY_PROJECT_ID is not defined"

Kiểm tra file `.env` đã được tạo và có đầy đủ thông tin chưa.

### Lỗi: "Permission denied" khi truy cập BigQuery

1. Kiểm tra service account có quyền `BigQuery Data Viewer` và `BigQuery Job User`
2. Kiểm tra file `service-account-key.json` đã đúng chưa
3. Kiểm tra project ID trong `.env` có khớp với project trong BigQuery không

### Dashboard không load dữ liệu

1. Mở DevTools (F12) → Console để xem log
2. Kiểm tra server đã chạy chưa: `http://localhost:3000/api/health`
3. Kiểm tra CORS settings trong `server.js`

### Iframe bị chặn

Một số browser hoặc website có thể chặn iframe. Kiểm tra:

1. **CSP (Content Security Policy)** của website cha
2. **X-Frame-Options** header
3. Thử mở trực tiếp URL của dashboard

---

## 🚢 Deploy lên Production

### Option 1: Deploy lên VPS/Cloud Server

1. **Upload code** lên server (via Git, FTP, etc.)
2. **Cài đặt Node.js** trên server
3. **Cài đặt dependencies**: `npm install --production`
4. **Setup môi trường**: Tạo file `.env` với thông tin production
5. **Chạy với PM2** (để auto-restart):

```bash
npm install -g pm2
pm2 start server.js --name nak-dashboard
pm2 save
pm2 startup
```

6. **Setup Nginx** làm reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Deploy lên Cloud Platform

**Google Cloud Run:**
```bash
gcloud run deploy nak-dashboard \
    --source . \
    --platform managed \
    --region asia-southeast1 \
    --allow-unauthenticated
```

**Heroku:**
```bash
heroku create nak-dashboard
git push heroku main
```

**AWS EC2, Azure, DigitalOcean:** Tương tự như VPS

---

## 📊 So sánh với Google Apps Script

| Tính năng | Google Apps Script | Standalone Version |
|-----------|-------------------|-------------------|
| **Hosting** | Google miễn phí | Tự host (VPS/Cloud) |
| **Iframe** | Có giới hạn | Không giới hạn |
| **Performance** | Chậm (cold start) | Nhanh hơn |
| **Tùy chỉnh** | Hạn chế | Không giới hạn |
| **Cost** | Miễn phí | Chi phí server |
| **Scalability** | Giới hạn quotas | Tùy thuộc server |

---

## 🔐 Bảo mật

### Quan trọng:

1. **Không commit** file `service-account-key.json` lên Git
2. **Không commit** file `.env` lên Git
3. **Sử dụng HTTPS** trong production
4. **Giới hạn CORS** chỉ cho domain được phép
5. **Rate limiting** cho API endpoints
6. **Validate input** từ client

### Cấu hình CORS cho production

Trong `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'https://yourdomain.com',
        'https://www.yourdomain.com'
    ],
    credentials: true
}));
```

---

## 📝 License

MIT License - Tự do sử dụng cho mục đích thương mại và phi thương mại.

---

## 🤝 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi:

1. Kiểm tra phần [Troubleshooting](#-troubleshooting)
2. Xem log trong Console (F12)
3. Kiểm tra server logs: `pm2 logs nak-dashboard`

---

## 🎉 Hoàn thành!

Dashboard của bạn đã sẵn sàng để:

- ✅ Chạy độc lập không cần Google Apps Script
- ✅ Nhúng vào bất kỳ website nào qua iframe
- ✅ Deploy lên production server
- ✅ Tùy chỉnh giao diện và chức năng

**Happy coding! 🚀**
