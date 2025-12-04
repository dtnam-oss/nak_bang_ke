# Bảng Kê Đối Soát - Reconciliation Statement Webapp

Web application để quản lý và hiển thị bảng kê đối soát, có thể nhúng vào website khác thông qua iframe.

## 📋 Tính năng

- ✅ Header: "Bảng kê đối soát" với thiết kế gradient đẹp mắt
- ✅ Bộ lọc dữ liệu:
  - Dropdown chọn tên khách hàng
  - Bộ lọc theo khoảng thời gian (Từ ngày - Đến ngày)
- ✅ Bảng dữ liệu hiển thị:
  - STT
  - Tên khách hàng
  - Ngày giao dịch
  - Mã đơn hàng
  - Số tiền (VNĐ)
  - Trạng thái (Đã thanh toán, Chờ xử lý, Đã hủy)
  - Ghi chú
- ✅ Tự động tính tổng số tiền các đơn hàng đã thanh toán
- ✅ Responsive design - tương thích mobile
- ✅ Hỗ trợ nhúng iframe vào website khác

## 🎨 Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling với gradient, animation, responsive design
- **JavaScript**: Xử lý logic, filter, render dữ liệu
- **Google Apps Script**: Deploy và embed với iframe

## 📁 Cấu trúc thư mục

```
nak_bang_ke/
├── index.html          # Trang chính
├── styles.css          # File CSS styling
├── script.js           # JavaScript logic
├── Code.gs             # Google Apps Script (cho iframe)
└── README.md           # Tài liệu hướng dẫn
```

## 🚀 Cách sử dụng

### 1. Chạy trực tiếp trên máy local

```bash
# Clone repository
git clone https://github.com/your-username/nak_bang_ke.git

# Di chuyển vào thư mục
cd nak_bang_ke

# Mở file index.html bằng trình duyệt
open index.html
# hoặc
start index.html  # Windows
xdg-open index.html  # Linux
```

### 2. Deploy lên GitHub Pages

#### Bước 1: Push code lên GitHub

```bash
# Khởi tạo git repository (nếu chưa có)
git init

# Thêm remote repository
git remote add origin https://github.com/your-username/nak_bang_ke.git

# Add files
git add .

# Commit
git commit -m "Initial commit: Bảng kê đối soát webapp"

# Push lên GitHub
git push -u origin main
```

#### Bước 2: Kích hoạt GitHub Pages

1. Vào repository trên GitHub
2. Click vào **Settings** (Cài đặt)
3. Tìm mục **Pages** ở sidebar bên trái
4. Trong **Source**, chọn **main** branch và thư mục **/ (root)**
5. Click **Save**
6. Đợi vài phút, website sẽ được deploy tại: `https://your-username.github.io/nak_bang_ke/`

### 3. Deploy lên Google Apps Script (để sử dụng iframe)

#### Bước 1: Tạo Google Apps Script Project

1. Truy cập: https://script.google.com/
2. Click **New Project**
3. Đổi tên project thành "Bảng Kê Đối Soát"

#### Bước 2: Thêm files

**File Code.gs:**
- Paste nội dung từ file `Code.gs`

**File Index.html:**
- Click **+** bên cạnh Files
- Chọn **HTML**
- Đặt tên: `Index`
- Paste nội dung từ file `index.html`
- **Chỉnh sửa**: Thay thế link CSS và JS:
  ```html
  <style>
    <?!= include('Styles'); ?>
  </style>
  ```
  và
  ```html
  <script>
    <?!= include('Script'); ?>
  </script>
  ```

**File Styles.html:**
- Tạo HTML file mới tên `Styles`
- Paste toàn bộ CSS từ `styles.css` vào trong thẻ `<style>`

**File Script.html:**
- Tạo HTML file mới tên `Script`
- Paste toàn bộ JS từ `script.js` vào trong thẻ `<script>`

#### Bước 3: Deploy

1. Click **Deploy** > **New deployment**
2. Chọn type: **Web app**
3. Cấu hình:
   - **Description**: Bảng Kê Đối Soát v1.0
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy **Web app URL**

#### Bước 4: Nhúng vào website khác

```html
<iframe 
  src="YOUR_WEB_APP_URL_HERE" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border: none;">
</iframe>
```

## 🎯 Tùy chỉnh dữ liệu

### Sửa dữ liệu mẫu trong file `script.js`:

```javascript
const sampleData = [
    {
        id: 1,
        customerName: 'Nguyễn Văn A',
        customerId: 'customer1',
        date: '2024-12-01',
        orderId: 'DH001',
        amount: 5000000,
        status: 'paid', // 'paid', 'pending', 'cancelled'
        note: 'Đã thanh toán đầy đủ'
    },
    // Thêm dữ liệu khác tại đây...
];
```

### Kết nối với Google Sheets:

Uncomment và cấu hình hàm `getDataFromSheet()` trong `Code.gs` để lấy dữ liệu từ Google Sheets.

## 🎨 Tùy chỉnh giao diện

### Thay đổi màu sắc gradient:

Trong file `styles.css`, tìm và sửa:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Thay `#667eea` và `#764ba2` bằng mã màu bạn muốn.

## 📱 Responsive Design

Website tự động điều chỉnh giao diện cho các thiết bị:
- Desktop (> 768px)
- Tablet (768px)
- Mobile (< 768px)

## 🔒 Bảo mật

- Tất cả dữ liệu mẫu chỉ lưu trên client-side
- Không có kết nối database mặc định
- Có thể tích hợp với Google Sheets để lưu trữ dữ liệu

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.

## 📄 License

MIT License - Free to use and modify.

## 👨‍💻 Tác giả

Created with ❤️ by GitHub Copilot

---

**Lưu ý**: Đây là phiên bản demo với dữ liệu mẫu. Để sử dụng thực tế, cần kết nối với database hoặc Google Sheets.
