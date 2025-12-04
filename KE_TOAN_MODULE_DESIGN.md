# Module Kế Toán - Design Document

## 📋 Tổng quan

**Mục đích**: Quản lý doanh thu, công nợ, đối soát và tạo bảng kê cho khách hàng

**Scope**:
- Báo cáo doanh thu theo khách hàng
- Quản lý công nợ (receivables)
- Xuất dữ liệu đối soát
- Tạo bảng kê chi tiết

---

## 🗄️ Cấu trúc dữ liệu hiện tại

### Table: `chuyen_di`
```sql
-- Dữ liệu chuyến đi với thông tin thanh toán
CREATE TABLE chuyen_di (
  id STRING,
  ngay_tao TIMESTAMP,
  ma_khach_hang STRING,
  ten_khach_hang STRING,
  tuyen_duong STRING,
  bien_so_xe STRING,
  doanh_thu FLOAT64,

  -- Payment status
  tinh_trang_thanh_toan STRING,  -- 'da_thanh_toan', 'chua_thanh_toan', 'thanh_toan_mot_phan'
  so_tien_da_thanh_toan FLOAT64,
  so_tien_con_no FLOAT64,

  -- Timestamps
  ngay_thanh_toan TIMESTAMP,
  ngay_tao_hoa_don TIMESTAMP,

  -- Other fields...
);
```

### Table: `khach_hang`
```sql
-- Thông tin khách hàng và chính sách công nợ
CREATE TABLE khach_hang (
  ma_khach_hang STRING PRIMARY KEY,
  ten_khach_hang STRING,
  loai_khach_hang STRING,  -- 'VIP', 'REGULAR', 'NEW'

  -- Payment terms
  hinh_thuc_thanh_toan STRING,  -- 'TIEN_MAT', 'CHUYEN_KHOAN', 'CONG_NO'
  chu_ky_cong_no INT64,          -- Số ngày (7, 15, 30, 60)
  han_muc_cong_no FLOAT64,       -- Credit limit

  -- Contact info
  email STRING,
  so_dien_thoai STRING,
  dia_chi STRING,

  -- Status
  trang_thai STRING,  -- 'HOAT_DONG', 'TAM_NGUNG', 'KHOA'

  ngay_tao TIMESTAMP,
  ngay_cap_nhat TIMESTAMP
);
```

---

## 🎯 Đề xuất cấu trúc dữ liệu bổ sung

### 1. Table: `cong_no` (Receivables Tracking)

**Mục đích**: Theo dõi công nợ chi tiết từng giao dịch

```sql
CREATE TABLE cong_no (
  id STRING PRIMARY KEY,

  -- Reference
  ma_chuyen_di STRING,           -- FK to chuyen_di
  ma_khach_hang STRING,          -- FK to khach_hang

  -- Amount tracking
  tong_doanh_thu FLOAT64,        -- Total revenue
  da_thanh_toan FLOAT64,         -- Paid amount
  con_no FLOAT64,                -- Outstanding

  -- Due date calculation
  ngay_phat_sinh TIMESTAMP,      -- Invoice date
  so_ngay_cong_no INT64,         -- Payment terms (days)
  ngay_dao_han TIMESTAMP,        -- Due date

  -- Aging
  so_ngay_qua_han INT64,         -- Days overdue
  trang_thai STRING,             -- 'CHUA_DEN_HAN', 'DEN_HAN', 'QUA_HAN'

  -- Collections
  lan_nhac_no INT64,             -- Reminder count
  ngay_nhac_no_cuoi TIMESTAMP,   -- Last reminder date

  -- Notes
  ghi_chu STRING,

  ngay_tao TIMESTAMP,
  ngay_cap_nhat TIMESTAMP
);
```

### 2. Table: `thanh_toan` (Payment Transactions)

**Mục đích**: Ghi nhận từng lần thanh toán

```sql
CREATE TABLE thanh_toan (
  id STRING PRIMARY KEY,

  -- Reference
  ma_cong_no STRING,             -- FK to cong_no
  ma_chuyen_di STRING,           -- FK to chuyen_di
  ma_khach_hang STRING,          -- FK to khach_hang

  -- Payment details
  so_tien FLOAT64,               -- Payment amount
  phuong_thuc STRING,            -- 'TIEN_MAT', 'CHUYEN_KHOAN', 'THE'
  ma_giao_dich STRING,           -- Transaction reference

  -- Bank transfer details (if applicable)
  ngan_hang STRING,
  so_tai_khoan STRING,
  ngay_chuyen_khoan TIMESTAMP,

  -- Proof
  hinh_anh_chung_tu STRING,      -- Image URL

  -- Status
  trang_thai STRING,             -- 'CHO_XAC_NHAN', 'DA_XAC_NHAN', 'BI_TU_CHOI'
  nguoi_xac_nhan STRING,
  ngay_xac_nhan TIMESTAMP,

  ghi_chu STRING,
  ngay_tao TIMESTAMP
);
```

### 3. Table: `doi_soat` (Reconciliation Records)

**Mục đích**: Lưu trữ các lần đối soát với khách hàng

```sql
CREATE TABLE doi_soat (
  id STRING PRIMARY KEY,

  -- Reference
  ma_khach_hang STRING,
  ten_khach_hang STRING,

  -- Period
  tu_ngay DATE,
  den_ngay DATE,

  -- Summary
  tong_doanh_thu FLOAT64,
  tong_da_thanh_toan FLOAT64,
  tong_con_no FLOAT64,
  so_chuyen_di INT64,

  -- Reconciliation status
  trang_thai STRING,             -- 'DANG_LAP', 'DA_GUI', 'DA_XAC_NHAN', 'CO_SAI_LECH'
  ngay_gui TIMESTAMP,
  ngay_xac_nhan TIMESTAMP,

  -- Discrepancy
  sai_lech_doanh_thu FLOAT64,
  sai_lech_thanh_toan FLOAT64,
  ly_do_sai_lech STRING,

  -- Files
  file_doi_soat_url STRING,      -- PDF/Excel URL
  file_khach_hang_url STRING,    -- Customer's version

  -- Contact
  email_gui STRING,
  nguoi_lien_he STRING,

  ghi_chu STRING,
  ngay_tao TIMESTAMP,
  nguoi_tao STRING
);
```

### 4. Table: `bang_ke` (Statement Records)

**Mục đích**: Bảng kê chi tiết gửi khách hàng

```sql
CREATE TABLE bang_ke (
  id STRING PRIMARY KEY,

  -- Reference
  ma_khach_hang STRING,
  ma_doi_soat STRING,            -- Optional FK to doi_soat

  -- Period
  ky_bang_ke STRING,             -- 'T01/2025', 'Q1/2025'
  tu_ngay DATE,
  den_ngay DATE,

  -- Summary
  tong_doanh_thu FLOAT64,
  tong_da_thu FLOAT64,
  ton_dau_ky FLOAT64,
  ton_cuoi_ky FLOAT64,

  -- Details (JSON array of trips)
  chi_tiet_chuyen_di JSON,       -- Array of trip details

  -- Status
  trang_thai STRING,             -- 'DRAFT', 'SENT', 'CONFIRMED'
  ngay_gui TIMESTAMP,

  -- Files
  file_pdf_url STRING,
  file_excel_url STRING,

  -- Tracking
  da_xem BOOLEAN,
  ngay_xem TIMESTAMP,

  ghi_chu STRING,
  ngay_tao TIMESTAMP,
  nguoi_tao STRING
);
```

---

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│  khach_hang     │
│─────────────────│
│ ma_khach_hang PK│◄─────┐
│ ten_khach_hang  │      │
│ chu_ky_cong_no  │      │
│ han_muc_cong_no │      │
└─────────────────┘      │
                         │
                         │
┌─────────────────┐      │
│  chuyen_di      │      │
│─────────────────│      │
│ id PK           │      │
│ ma_khach_hang FK├──────┤
│ doanh_thu       │      │
│ tinh_trang_tt   │      │
└────────┬────────┘      │
         │               │
         │               │
         ▼               │
┌─────────────────┐      │
│  cong_no        │      │
│─────────────────│      │
│ id PK           │      │
│ ma_chuyen_di FK │      │
│ ma_khach_hang FK├──────┤
│ con_no          │      │
│ ngay_dao_han    │      │
└────────┬────────┘      │
         │               │
         │               │
         ▼               │
┌─────────────────┐      │
│  thanh_toan     │      │
│─────────────────│      │
│ id PK           │      │
│ ma_cong_no FK   │      │
│ so_tien         │      │
│ phuong_thuc     │      │
└─────────────────┘      │
                         │
                         │
┌─────────────────┐      │
│  doi_soat       │      │
│─────────────────│      │
│ id PK           │      │
│ ma_khach_hang FK├──────┘
│ tu_ngay         │
│ den_ngay        │
│ trang_thai      │
└────────┬────────┘
         │
         │
         ▼
┌─────────────────┐
│  bang_ke        │
│─────────────────│
│ id PK           │
│ ma_doi_soat FK  │
│ file_pdf_url    │
└─────────────────┘
```

---

## 🔄 Luồng nghiệp vụ (Business Flow)

### Flow 1: Phát sinh công nợ

```
1. Tạo chuyến đi mới
   ↓
2. Ghi nhận doanh thu
   ↓
3. Check hình thức thanh toán khách hàng
   ├─ TIEN_MAT → Yêu cầu thanh toán ngay
   ├─ CHUYEN_KHOAN → Tạo hóa đơn
   └─ CONG_NO → Tạo record công nợ
   ↓
4. Tạo record trong table `cong_no`
   - Tính ngày đáo hạn = ngay_phat_sinh + chu_ky_cong_no
   - Trạng thái = 'CHUA_DEN_HAN'
   ↓
5. Gửi hóa đơn cho khách hàng (email)
```

### Flow 2: Thanh toán

```
1. Khách hàng thanh toán
   ↓
2. Nhân viên ghi nhận thanh toán
   - Tạo record trong `thanh_toan`
   - Trạng thái = 'CHO_XAC_NHAN'
   ↓
3. Kế toán xác nhận
   - Upload chứng từ
   - Xác nhận thanh toán
   - Trạng thái → 'DA_XAC_NHAN'
   ↓
4. Cập nhật `cong_no`
   - da_thanh_toan += so_tien
   - con_no = tong_doanh_thu - da_thanh_toan
   - Nếu con_no = 0 → Trạng thái = 'DA_THANH_TOAN'
   ↓
5. Cập nhật `chuyen_di`
   - tinh_trang_thanh_toan
   - so_tien_da_thanh_toan
   - so_tien_con_no
```

### Flow 3: Nhắc nợ (Debt Collection)

```
Daily Job (cron):
1. Query công nợ sắp đến hạn (3 ngày trước)
   ↓
2. Gửi email nhắc nhở khách hàng
   ↓
3. Update lan_nhac_no, ngay_nhac_no_cuoi
   ↓
4. Nếu quá hạn:
   - Tính so_ngay_qua_han
   - Trạng thái → 'QUA_HAN'
   - Gửi email cảnh báo
   - Thông báo cho Sales team
   ↓
5. Nếu quá hạn > 30 ngày:
   - Đưa vào danh sách đen
   - Tạm dừng nhận đơn mới
```

### Flow 4: Đối soát

```
1. Kế toán chọn khách hàng + kỳ đối soát
   ↓
2. System tự động tổng hợp:
   - Lấy tất cả chuyến đi trong kỳ
   - Tính tổng doanh thu
   - Tính tổng đã thanh toán
   - Tính tổng còn nợ
   ↓
3. Tạo record trong `doi_soat`
   - Trạng thái = 'DANG_LAP'
   ↓
4. Kế toán review và điều chỉnh (nếu cần)
   ↓
5. Generate file đối soát (PDF/Excel)
   - Header: Thông tin công ty
   - Summary: Tổng hợp số liệu
   - Details: Chi tiết từng chuyến đi
   - Footer: Chữ ký, xác nhận
   ↓
6. Gửi email cho khách hàng
   - Trạng thái → 'DA_GUI'
   - Lưu ngay_gui
   ↓
7. Khách hàng xác nhận
   - Nếu đồng ý → Trạng thái = 'DA_XAC_NHAN'
   - Nếu có sai lệch → Trạng thái = 'CO_SAI_LECH'
     → Kế toán xử lý sai lệch
```

### Flow 5: Tạo bảng kê

```
1. Chọn khách hàng + kỳ bảng kê
   ↓
2. System tổng hợp:
   - Tồn đầu kỳ (từ kỳ trước)
   - Phát sinh trong kỳ
   - Đã thu trong kỳ
   - Tồn cuối kỳ = Tồn đầu + Phát sinh - Đã thu
   ↓
3. Chi tiết từng chuyến đi (JSON):
   [
     {
       ngay: '2025-01-15',
       ma_chuyen: 'CD001',
       tuyen: 'HCM-HN',
       bien_so: '51A-12345',
       doanh_thu: 5000000,
       da_thu: 3000000,
       con_no: 2000000
     },
     ...
   ]
   ↓
4. Generate files:
   - PDF: Định dạng in ấn, có logo, chữ ký
   - Excel: Dữ liệu chi tiết, có thể chỉnh sửa
   ↓
5. Lưu vào `bang_ke`
   - Trạng thái = 'DRAFT'
   ↓
6. Gửi cho khách hàng
   - Email với file đính kèm
   - Trạng thái → 'SENT'
   ↓
7. Track xem đã xem chưa (email tracking)
   - da_xem = true
   - ngay_xem = timestamp
```

---

## 🎨 UI/UX Design cho Module Kế Toán

### 1. Dashboard Overview

```
┌─────────────────────────────────────────────────────┐
│  KẾ TOÁN                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Tổng     │  │ Đã thu   │  │ Công nợ  │         │
│  │ doanh thu│  │          │  │          │         │
│  │ 500M đ   │  │ 350M đ   │  │ 150M đ   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Đến hạn  │  │ Quá hạn  │  │ Đối soát │         │
│  │ 3 ngày   │  │          │  │ tháng này│         │
│  │ 50M đ    │  │ 20M đ    │  │ 8 KH     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  BIỂU ĐỒ CÔNG NỢ                                   │
│  [Chart: Aging analysis - 0-30, 31-60, 60+ days]   │
│                                                     │
│  BIỂU ĐỒ DOANH THU/THU TIỀN                        │
│  [Chart: Monthly revenue vs collection]            │
└─────────────────────────────────────────────────────┘
```

### 2. Tabs Navigation

```
┌────────────────────────────────────────┐
│ [Tổng quan] [Công nợ] [Đối soát] [...]│
└────────────────────────────────────────┘
```

#### Tab 2.1: Công nợ

```
┌─────────────────────────────────────────────────────┐
│  QUẢN LÝ CÔNG NỢ                                    │
├─────────────────────────────────────────────────────┤
│  Filters:                                           │
│  [Khách hàng ▼] [Trạng thái ▼] [Từ ngày - Đến ngày]│
│  [🔍 Tìm kiếm]  [📥 Xuất Excel]                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Table:                                             │
│  ┌──────┬──────────┬─────────┬─────────┬─────────┐ │
│  │ KH   │ Doanh thu│ Đã thu  │ Còn nợ  │ Đáo hạn │ │
│  ├──────┼──────────┼─────────┼─────────┼─────────┤ │
│  │ GHN  │ 100M     │ 80M     │ 20M     │5 ngày   │ │
│  │ J&T  │ 80M      │ 60M     │ 20M [!] │Quá 2 ngày│ │
│  │ GHTK │ 50M      │ 50M     │ 0       │-        │ │
│  └──────┴──────────┴─────────┴─────────┴─────────┘ │
│                                                     │
│  Actions: [Nhắc nợ] [Ghi nhận thanh toán]          │
└─────────────────────────────────────────────────────┘
```

#### Tab 2.2: Đối soát

```
┌─────────────────────────────────────────────────────┐
│  ĐỐI SOÁT VỚI KHÁCH HÀNG                            │
├─────────────────────────────────────────────────────┤
│  [+ Tạo đối soát mới]  [📋 Lịch sử đối soát]        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Đối soát đang xử lý:                               │
│  ┌──────┬─────────┬────────┬──────────┬─────────┐  │
│  │ KH   │ Kỳ      │ Tổng DT│ Trạng thái│ Hành động│ │
│  ├──────┼─────────┼────────┼──────────┼─────────┤  │
│  │ GHN  │ T01/2025│ 100M   │ Đã gửi   │[Xem] [⋮]│  │
│  │ J&T  │ T01/2025│ 80M    │ Chờ xác  │[Xem] [⋮]│  │
│  │ GHTK │ T01/2025│ 50M    │ Draft    │[Sửa][⋮] │  │
│  └──────┴─────────┴────────┴──────────┴─────────┘  │
│                                                     │
│  Cảnh báo:                                          │
│  ⚠️  2 đối soát đang chờ xác nhận > 7 ngày          │
│  ⚠️  1 đối soát có sai lệch cần xử lý               │
└─────────────────────────────────────────────────────┘
```

#### Tab 2.3: Bảng kê

```
┌─────────────────────────────────────────────────────┐
│  BẢNG KÊ CHI TIẾT                                   │
├─────────────────────────────────────────────────────┤
│  [+ Tạo bảng kê]  [📊 Templates]                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Bảng kê gần đây:                                   │
│  ┌──────┬─────────┬────────┬──────────┬─────────┐  │
│  │ KH   │ Kỳ      │ File   │ Gửi lúc  │ Đã xem? │  │
│  ├──────┼─────────┼────────┼──────────┼─────────┤  │
│  │ GHN  │ T01/2025│[📄 PDF]│15/01 9AM │ ✓       │  │
│  │ J&T  │ T01/2025│[📄 PDF]│15/01 10AM│ ✗       │  │
│  │ GHTK │ T12/2024│[📄 PDF]│01/01 2PM │ ✓       │  │
│  └──────┴─────────┴────────┴──────────┴─────────┘  │
│                                                     │
│  Template bảng kê:                                  │
│  • Standard (Logo + Header + Details + Footer)     │
│  • Simplified (Chỉ summary + list)                 │
│  • Detailed (Full breakdown by route/vehicle)      │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 BigQuery Queries

### Query 1: Tổng hợp công nợ theo khách hàng

```sql
SELECT
  kh.ma_khach_hang,
  kh.ten_khach_hang,
  kh.chu_ky_cong_no,

  -- Summary
  COUNT(DISTINCT cd.id) as so_chuyen_di,
  SUM(cd.doanh_thu) as tong_doanh_thu,
  SUM(cd.so_tien_da_thanh_toan) as tong_da_thanh_toan,
  SUM(cd.so_tien_con_no) as tong_con_no,

  -- Aging
  SUM(CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(cd.ngay_tao), DAY) <= 30
    THEN cd.so_tien_con_no ELSE 0
  END) as no_0_30_ngay,

  SUM(CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(cd.ngay_tao), DAY) BETWEEN 31 AND 60
    THEN cd.so_tien_con_no ELSE 0
  END) as no_31_60_ngay,

  SUM(CASE
    WHEN DATE_DIFF(CURRENT_DATE(), DATE(cd.ngay_tao), DAY) > 60
    THEN cd.so_tien_con_no ELSE 0
  END) as no_tren_60_ngay

FROM khach_hang kh
LEFT JOIN chuyen_di cd ON kh.ma_khach_hang = cd.ma_khach_hang
WHERE cd.tinh_trang_thanh_toan != 'da_thanh_toan'
GROUP BY kh.ma_khach_hang, kh.ten_khach_hang, kh.chu_ky_cong_no
ORDER BY tong_con_no DESC;
```

### Query 2: Chi tiết đối soát theo kỳ

```sql
SELECT
  cd.id,
  cd.ngay_tao,
  cd.ma_khach_hang,
  cd.ten_khach_hang,
  cd.tuyen_duong,
  cd.bien_so_xe,
  cd.doanh_thu,
  cd.so_tien_da_thanh_toan,
  cd.so_tien_con_no,
  cd.tinh_trang_thanh_toan,

  -- Payment history
  ARRAY_AGG(
    STRUCT(
      tt.ngay_tao as ngay_thanh_toan,
      tt.so_tien,
      tt.phuong_thuc
    )
  ) as lich_su_thanh_toan

FROM chuyen_di cd
LEFT JOIN thanh_toan tt ON cd.id = tt.ma_chuyen_di
WHERE cd.ma_khach_hang = @ma_khach_hang
  AND DATE(cd.ngay_tao) BETWEEN @tu_ngay AND @den_ngay
GROUP BY cd.id, cd.ngay_tao, cd.ma_khach_hang, cd.ten_khach_hang,
         cd.tuyen_duong, cd.bien_so_xe, cd.doanh_thu,
         cd.so_tien_da_thanh_toan, cd.so_tien_con_no,
         cd.tinh_trang_thanh_toan
ORDER BY cd.ngay_tao ASC;
```

### Query 3: Báo cáo công nợ sắp đến hạn

```sql
WITH cong_no_sap_den_han AS (
  SELECT
    cn.id,
    cn.ma_khach_hang,
    kh.ten_khach_hang,
    kh.email,
    cn.tong_doanh_thu,
    cn.con_no,
    cn.ngay_dao_han,
    DATE_DIFF(cn.ngay_dao_han, CURRENT_DATE(), DAY) as so_ngay_con_lai
  FROM cong_no cn
  JOIN khach_hang kh ON cn.ma_khach_hang = kh.ma_khach_hang
  WHERE cn.trang_thai = 'CHUA_DEN_HAN'
    AND DATE_DIFF(cn.ngay_dao_han, CURRENT_DATE(), DAY) <= 3
    AND cn.con_no > 0
)

SELECT
  ma_khach_hang,
  ten_khach_hang,
  email,
  COUNT(*) as so_hoa_don,
  SUM(con_no) as tong_con_no,
  MIN(so_ngay_con_lai) as ngay_gan_nhat
FROM cong_no_sap_den_han
GROUP BY ma_khach_hang, ten_khach_hang, email
ORDER BY ngay_gan_nhat ASC;
```

---

## 🚀 Implementation Plan

### Phase 1: Database Setup (Week 1)
- [ ] Create `cong_no` table
- [ ] Create `thanh_toan` table
- [ ] Create `doi_soat` table
- [ ] Create `bang_ke` table
- [ ] Setup indexes
- [ ] Write test data

### Phase 2: Backend APIs (Week 2-3)
- [ ] API: Get receivables summary
- [ ] API: Get receivables by customer
- [ ] API: Record payment
- [ ] API: Generate reconciliation
- [ ] API: Generate statement
- [ ] API: Send email notifications

### Phase 3: Frontend UI (Week 4-5)
- [ ] Dashboard overview
- [ ] Receivables management tab
- [ ] Reconciliation tab
- [ ] Statement generation tab
- [ ] Payment recording form
- [ ] Email preview/send

### Phase 4: Reports & Export (Week 6)
- [ ] PDF generation (reconciliation)
- [ ] PDF generation (statement)
- [ ] Excel export
- [ ] Email templates
- [ ] Print layouts

### Phase 5: Automation (Week 7)
- [ ] Daily debt reminder job
- [ ] Automatic aging calculation
- [ ] Overdue notifications
- [ ] Monthly reconciliation trigger

---

## 📊 Metrics & KPIs

### Financial KPIs:
- **DSO** (Days Sales Outstanding): Số ngày trung bình thu tiền
- **Collection Rate**: % thu tiền trong tháng
- **Aging Analysis**: Phân bố nợ theo độ tuổi
- **Overdue Rate**: % nợ quá hạn

### Operational KPIs:
- **Reconciliation Completion**: % đối soát hoàn thành đúng hạn
- **Statement Delivery**: % bảng kê gửi đúng thời gian
- **Payment Processing Time**: Thời gian xử lý thanh toán
- **Email Open Rate**: % email đối soát được mở

---

## 🔐 Security & Permissions

### Roles:
1. **Accountant (Kế toán)**: Full access
2. **Finance Manager (Quản lý tài chính)**: View + Approve
3. **Sales (Kinh doanh)**: View own customers only
4. **Admin**: Full access + System config

### Permissions Matrix:
| Feature | Accountant | Finance Manager | Sales | Admin |
|---------|-----------|----------------|-------|-------|
| View receivables | ✓ | ✓ | Own customers | ✓ |
| Record payment | ✓ | ✓ | ✗ | ✓ |
| Approve payment | ✗ | ✓ | ✗ | ✓ |
| Generate reconciliation | ✓ | ✓ | ✗ | ✓ |
| Send reconciliation | ✓ | ✓ | ✗ | ✓ |
| Generate statement | ✓ | ✓ | Own customers | ✓ |
| View aging report | ✓ | ✓ | ✗ | ✓ |
| Modify customer terms | ✗ | ✓ | ✗ | ✓ |

---

**Status**: Design Complete - Ready for Review
**Next Steps**: Stakeholder review → Database implementation
**Version**: 1.0
**Date**: 2025-11-29
