# 🚀 Hướng dẫn chạy nhanh - 5 phút

## Bước 1: Cài đặt dependencies (1 phút)

```bash
cd standalone
npm install
```

## Bước 2: Tạo file môi trường (30 giây)

```bash
cp .env.example .env
```

## Bước 3: Chạy ở chế độ DEMO (không cần BigQuery)

```bash
npm start
```

✅ Server chạy tại: **http://localhost:3000**

Dashboard sẽ hiển thị dữ liệu mẫu (demo mode).

---

## Test iframe embedding

Mở file này trong browser:

```bash
open embed-example.html
```

hoặc truy cập: **http://localhost:3000/embed-example.html**

---

## Chuyển sang Production Mode (với BigQuery thật)

### 1. Lấy BigQuery credentials

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project `nakvi-476804`
3. IAM & Admin → Service Accounts
4. Tạo key (JSON) cho service account có quyền BigQuery
5. Download và đặt vào thư mục `standalone/` với tên `service-account-key.json`

### 2. Cấu hình .env

Mở file `.env` và điền:

```env
PORT=3000
BIGQUERY_PROJECT_ID=nakvi-476804
BIGQUERY_DATASET=nak_logistics
BIGQUERY_KEY_FILE=./service-account-key.json
```

### 3. Bật Production Mode

Mở file `index.html`, tìm dòng ~235 trong `ApiClient.getAllDashboardData()`:

```javascript
// DEMO MODE (comment dòng này):
// return this._getDemoData();

// PRODUCTION MODE (uncomment dòng này):
return this._fetch('/dashboard/all', { method: 'POST', body: filter });
```

### 4. Restart server

```bash
npm start
```

---

## ✅ Xong!

Dashboard của bạn đã sẵn sàng:

- 📊 Dashboard: http://localhost:3000
- 🔗 Health check: http://localhost:3000/api/health
- 🖼️ Iframe example: http://localhost:3000/embed-example.html

---

## Nhúng vào website khác

```html
<iframe
    src="http://localhost:3000/index.html"
    width="100%"
    height="800px"
    frameborder="0"
    style="border: none;"
></iframe>
```

Thay `localhost:3000` bằng domain thật khi deploy production.

---

## Lỗi thường gặp

**"Module not found"** → Chạy `npm install`

**"Port 3000 already in use"** → Đổi PORT trong `.env` hoặc kill process:
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dashboard không load** → Kiểm tra Console (F12) và server logs

---

Xem thêm chi tiết trong [README.md](./README.md)
