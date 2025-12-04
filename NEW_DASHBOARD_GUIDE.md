# 📊 Hướng Dẫn Dashboard Mới - Báo Cáo Chi Tiết

## ✅ HOÀN THÀNH

### Backend (Server-side)

#### 1. [Config.gs](Config.gs:22-178) - SQL Queries ✅
Đã thêm 6 queries mới:
- `buildDateFilter()` - Helper function build WHERE clause theo ngày/tuần/tháng/năm
- `OVERVIEW_METRICS()` - 4 chỉ số tổng quan
- `TOP_CUSTOMERS_BY_REVENUE()` - Top 10 khách hàng
- `TOP_ROUTES_BY_REVENUE()` - Top 10 tuyến
- `REVENUE_BY_ROUTE_TYPE()` - Doanh thu theo loại tuyến
- `TOP_VEHICLES_BY_REVENUE()` - Top 10 xe cao nhất
- `BOTTOM_VEHICLES_BY_REVENUE()` - Top 10 xe thấp nhất

#### 2. [BigQueryService.gs](BigQueryService.gs:110-317) - Service Methods ✅
Đã thêm 8 methods mới:
- `parseRows()` - Parse nhiều rows thành array
- `getOverviewMetrics(filter)` - Lấy 4 chỉ số tổng quan
- `getTopCustomers(filter)` - Lấy top khách hàng
- `getTopRoutes(filter)` - Lấy top tuyến
- `getRevenueByRouteType(filter)` - Doanh thu theo loại tuyến
- `getTopVehicles(filter)` - Top xe cao
- `getBottomVehicles(filter)` - Top xe thấp
- `getAllDashboardData(filter)` - Lấy tất cả cùng lúc (optimize!)

#### 3. [Main.gs](Main.gs:51-127) - API Endpoints ✅
Đã thêm 8 API endpoints:
- `getAllDashboardData(filter)` - **RECOMMENDED** - 1 call duy nhất
- `getOverviewMetrics(filter)`
- `getTopCustomers(filter)`
- `getTopRoutes(filter)`
- `getRevenueByRouteType(filter)`
- `getTopVehicles(filter)`
- `getBottomVehicles(filter)`
- `getDashboardStats()` - Legacy (backward compatible)

---

## 🚧 CÒN LẠI CẦN LÀM

### Frontend (Client-side) - CẦN BẠN HOÀN THÀNH

Tôi đã xây dựng xong toàn bộ Backend. Bây giờ bạn cần update Frontend để hiển thị dữ liệu.

### BƯỚC 1: Update ApiClient.html

Thêm methods để gọi API mới:

```html
<!-- File: ApiClient.html -->
<script>
const ApiClient = {

  // ... existing methods ...

  /**
   * Lấy TẤT CẢ dữ liệu dashboard (RECOMMENDED - 1 call duy nhất!)
   * @param {Object} filter - { type: 'day'|'week'|'month'|'year', date: 'YYYY-MM-DD' }
   */
  getAllDashboardData: async function(filter) {
    try {
      console.log('[API] Fetching all dashboard data...', filter);
      const result = await this._callServerFunction('getAllDashboardData', filter);

      if (result.error || !result.success) {
        throw new Error(result.message || 'Unknown error');
      }

      return result.data;
    } catch (error) {
      console.error('[API] Error:', error);
      throw error;
    }
  },

  /**
   * Lấy chỉ số tổng quan (4 cards)
   */
  getOverviewMetrics: async function(filter) {
    try {
      const result = await this._callServerFunction('getOverviewMetrics', filter);
      return result.data;
    } catch (error) {
      console.error('[API] Error getting overview:', error);
      throw error;
    }
  },

  /**
   * Lấy top khách hàng
   */
  getTopCustomers: async function(filter) {
    try {
      const result = await this._callServerFunction('getTopCustomers', filter);
      return result.data;
    } catch (error) {
      console.error('[API] Error getting customers:', error);
      throw error;
    }
  },

  /**
   * Lấy top tuyến
   */
  getTopRoutes: async function(filter) {
    try {
      const result = await this._callServerFunction('getTopRoutes', filter);
      return result.data;
    } catch (error) {
      console.error('[API] Error getting routes:', error);
      throw error;
    }
  },

  /**
   * Lấy doanh thu theo loại tuyến
   */
  getRevenueByRouteType: async function(filter) {
    try {
      const result = await this._callServerFunction('getRevenueByRouteType', filter);
      return result.data;
    } catch (error) {
      console.error('[API] Error getting revenue by route type:', error);
      throw error;
    }
  },

  /**
   * Lấy top xe cao
   */
  getTopVehicles: async function(filter) {
    try {
      const result = await this._callServerFunction('getTopVehicles', filter);
      return result.data;
    } catch (error) {
      console.error('[API] Error getting top vehicles:', error);
      throw error;
    }
  },

  /**
   * Lấy top xe thấp
   */
  getBottomVehicles: async function(filter) {
    try {
      const result = await this._callServerFunction('getBottomVehicles', filter);
      return result.data;
    } catch (error) {
      console.error('[API] Error getting bottom vehicles:', error);
      throw error;
    }
  }
};
</script>
```

---

### BƯỚC 2: Update UIComponents.html

Thêm UI rendering cho dashboard mới:

```html
<!-- File: UIComponents.html -->
<script>
const UIComponents = {

  // ... existing code ...

  /**
   * Render BỘ LỌC NGÀY/TUẦN/THÁNG/NĂM
   */
  renderDateFilter: function() {
    const today = new Date().toISOString().split('T')[0];

    return `
      <div class="date-filter-container" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="display: flex; gap: 8px;">
            <button class="filter-btn active" data-type="day" onclick="App.changeFilterType('day')">Ngày</button>
            <button class="filter-btn" data-type="week" onclick="App.changeFilterType('week')">Tuần</button>
            <button class="filter-btn" data-type="month" onclick="App.changeFilterType('month')">Tháng</button>
            <button class="filter-btn" data-type="year" onclick="App.changeFilterType('year')">Năm</button>
          </div>

          <input type="date" id="filterDate" value="${today}" onchange="App.applyDateFilter()"
                 style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">

          <button onclick="App.resetFilter()"
                  style="padding: 8px 16px; background: #f5f5f5; border: none; border-radius: 6px; cursor: pointer;">
            Reset
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render 4 CARDS TỔNG QUAN
   */
  renderOverviewCards: function(data) {
    return `
      <div class="stats-container">
        <!-- Card 1: Số chuyến đi -->
        <div class="stat-card">
          <div class="stat-info">
            <h3 id="metric-trips">${data.soChuyen.toLocaleString('vi-VN')}</h3>
            <span>Số lượng chuyến đi</span>
          </div>
          <div class="stat-icon" style="background: #e3f2fd; color: #2962ff;">
            <i class="material-icons-outlined">local_shipping</i>
          </div>
        </div>

        <!-- Card 2: Số xe sử dụng -->
        <div class="stat-card">
          <div class="stat-info">
            <h3 id="metric-vehicles">${data.soXe.toLocaleString('vi-VN')}</h3>
            <span>Số lượng xe sử dụng</span>
          </div>
          <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;">
            <i class="material-icons-outlined">directions_car</i>
          </div>
        </div>

        <!-- Card 3: Doanh thu -->
        <div class="stat-card">
          <div class="stat-info">
            <h3 id="metric-revenue">${data.doanhThu.toLocaleString('vi-VN')} VNĐ</h3>
            <span>Tổng doanh thu</span>
          </div>
          <div class="stat-icon" style="background: #fff3e0; color: #ef6c00;">
            <i class="material-icons-outlined">attach_money</i>
          </div>
        </div>

        <!-- Card 4: Khách hàng -->
        <div class="stat-card">
          <div class="stat-info">
            <h3 id="metric-customers">${data.soKhachHang.toLocaleString('vi-VN')}</h3>
            <span>Số khách hàng phục vụ</span>
          </div>
          <div class="stat-icon" style="background: #fce4ec; color: #c2185b;">
            <i class="material-icons-outlined">people</i>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render BẢNG TOP KHÁCH HÀNG
   */
  renderTopCustomersTable: function(customers) {
    if (!customers || customers.length === 0) {
      return '<p>Không có dữ liệu</p>';
    }

    const rows = customers.map((c, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${c.ten_khach_hang || c.ma_khach_hang}</strong></td>
        <td>${parseInt(c.so_chuyen).toLocaleString('vi-VN')}</td>
        <td><strong>${parseInt(c.tong_doanh_thu).toLocaleString('vi-VN')} VNĐ</strong></td>
      </tr>
    `).join('');

    return `
      <table class="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Khách hàng</th>
            <th>Số chuyến</th>
            <th>Doanh thu</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  /**
   * Render BẢNG TOP TUYẾN
   */
  renderTopRoutesTable: function(routes) {
    if (!routes || routes.length === 0) {
      return '<p>Không có dữ liệu</p>';
    }

    const rows = routes.map((r, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${r.tuyen}</strong></td>
        <td>${parseInt(r.so_chuyen).toLocaleString('vi-VN')}</td>
        <td><strong>${parseInt(r.tong_doanh_thu).toLocaleString('vi-VN')} VNĐ</strong></td>
      </tr>
    `).join('');

    return `
      <table class="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tuyến</th>
            <th>Số chuyến</th>
            <th>Doanh thu</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  /**
   * Render BẢNG TOP XE
   */
  renderTopVehiclesTable: function(vehicles, title) {
    if (!vehicles || vehicles.length === 0) {
      return '<p>Không có dữ liệu</p>';
    }

    const rows = vehicles.map((v, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${v.bien_kiem_soat}</strong></td>
        <td>${parseInt(v.so_chuyen).toLocaleString('vi-VN')}</td>
        <td><strong>${parseInt(v.tong_doanh_thu).toLocaleString('vi-VN')} VNĐ</strong></td>
        <td>${parseInt(v.doanh_thu_trung_binh).toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    `).join('');

    return `
      <table class="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Biển kiểm soát</th>
            <th>Số chuyến</th>
            <th>Tổng doanh thu</th>
            <th>Trung bình/chuyến</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  /**
   * Render TOÀN BỘ DASHBOARD MỚI
   */
  renderNewDashboard: function() {
    return `
      ${this.renderDateFilter()}

      <div id="overview-cards">
        <div class="loading">Đang tải...</div>
      </div>

      <h2 style="margin: 32px 0 16px;">📊 Báo cáo Khách hàng</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
        <div class="report-card">
          <h3>🏆 Top 10 Khách hàng</h3>
          <div id="top-customers">Đang tải...</div>
        </div>
        <div class="report-card">
          <h3>🛣️ Top 10 Tuyến</h3>
          <div id="top-routes">Đang tải...</div>
        </div>
      </div>

      <h2 style="margin: 32px 0 16px;">🚗 Báo cáo Xe</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="report-card">
          <h3>⬆️ Top 10 Xe doanh thu cao nhất</h3>
          <div id="top-vehicles">Đang tải...</div>
        </div>
        <div class="report-card">
          <h3>⬇️ Top 10 Xe doanh thu thấp nhất</h3>
          <div id="bottom-vehicles">Đang tải...</div>
        </div>
      </div>
    `;
  }
};
</script>
```

---

### BƯỚC 3: Update Styles.html

Thêm CSS cho các components mới:

```css
/* File: Styles.html - Thêm vào cuối file */

/* Date Filter */
.date-filter-container {
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Report Cards */
.report-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.report-card h3 {
  margin-bottom: 16px;
  font-size: 1.1rem;
  color: var(--text-dark);
}

/* Report Tables */
.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table thead {
  background: var(--bg-color);
}

.report-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-dark);
  border-bottom: 2px solid var(--border-color);
}

.report-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.report-table tr:hover {
  background: var(--bg-color);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
}
```

---

### BƯỚC 4: Update AppController.html

Thêm logic load dữ liệu mới:

```html
<!-- File: AppController.html -->
<script>
const App = {

  // Current filter state
  currentFilter: {
    type: 'day',  // 'day' | 'week' | 'month' | 'year'
    date: new Date().toISOString().split('T')[0]
  },

  // ... existing init() ...

  /**
   * Load Dashboard page MỚI
   */
  _loadDashboardPage: async function() {
    // Render UI skeleton
    UIComponents.elements.mainContent.innerHTML = UIComponents.renderNewDashboard();

    // Load data
    await this.loadAllDashboardData();
  },

  /**
   * Load TẤT CẢ dữ liệu dashboard
   */
  loadAllDashboardData: async function() {
    try {
      console.log('[App] Loading dashboard with filter:', this.currentFilter);

      // Fetch all data trong 1 call
      const allData = await ApiClient.getAllDashboardData(this.currentFilter);

      // Update từng phần
      this.updateOverviewCards(allData.overview);
      this.updateCustomersReport(allData.topCustomers);
      this.updateRoutesReport(allData.topRoutes);
      this.updateVehiclesReport(allData.topVehicles, allData.bottomVehicles);

      console.log('[App] Dashboard loaded successfully');

    } catch (error) {
      console.error('[App] Error loading dashboard:', error);
      alert('Không thể tải dữ liệu. Vui lòng thử lại.');
    }
  },

  /**
   * Update 4 cards tổng quan
   */
  updateOverviewCards: function(data) {
    const container = document.getElementById('overview-cards');
    if (container) {
      container.innerHTML = UIComponents.renderOverviewCards(data);
    }
  },

  /**
   * Update báo cáo khách hàng
   */
  updateCustomersReport: function(customers) {
    const container = document.getElementById('top-customers');
    if (container) {
      container.innerHTML = UIComponents.renderTopCustomersTable(customers);
    }
  },

  /**
   * Update báo cáo tuyến
   */
  updateRoutesReport: function(routes) {
    const container = document.getElementById('top-routes');
    if (container) {
      container.innerHTML = UIComponents.renderTopRoutesTable(routes);
    }
  },

  /**
   * Update báo cáo xe
   */
  updateVehiclesReport: function(topVehicles, bottomVehicles) {
    const topContainer = document.getElementById('top-vehicles');
    const bottomContainer = document.getElementById('bottom-vehicles');

    if (topContainer) {
      topContainer.innerHTML = UIComponents.renderTopVehiclesTable(topVehicles);
    }

    if (bottomContainer) {
      bottomContainer.innerHTML = UIComponents.renderTopVehiclesTable(bottomVehicles);
    }
  },

  /**
   * Thay đổi loại filter (day/week/month/year)
   */
  changeFilterType: function(type) {
    this.currentFilter.type = type;

    // Update UI active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.type === type) {
        btn.classList.add('active');
      }
    });

    // Reload data
    this.loadAllDashboardData();
  },

  /**
   * Apply date filter
   */
  applyDateFilter: function() {
    const dateInput = document.getElementById('filterDate');
    if (dateInput) {
      this.currentFilter.date = dateInput.value;
      this.loadAllDashboardData();
    }
  },

  /**
   * Reset filter về hôm nay
   */
  resetFilter: function() {
    this.currentFilter = {
      type: 'day',
      date: new Date().toISOString().split('T')[0]
    };

    // Update UI
    const dateInput = document.getElementById('filterDate');
    if (dateInput) {
      dateInput.value = this.currentFilter.date;
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.type === 'day') {
        btn.classList.add('active');
      }
    });

    // Reload
    this.loadAllDashboardData();
  }
};
</script>
```

---

## 🧪 TESTING

### Test Backend (Apps Script Editor)

```javascript
// Test lấy tất cả data
function testGetAllDashboardData() {
  var filter = {
    type: 'day',
    date: '2025-01-01'
  };

  var result = getAllDashboardData(filter);
  Logger.log(JSON.stringify(result, null, 2));
}

// Test từng API
function testOverviewMetrics() {
  var result = getOverviewMetrics({ type: 'month', date: '2025-01-15' });
  Logger.log(JSON.stringify(result, null, 2));
}

function testTopCustomers() {
  var result = getTopCustomers({ type: 'year', date: '2025-01-01' });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

## 📝 DATA STRUCTURE

### Filter Object
```javascript
{
  type: 'day' | 'week' | 'month' | 'year',
  date: 'YYYY-MM-DD'
}
```

### Response từ getAllDashboardData()
```javascript
{
  success: true,
  data: {
    overview: {
      soChuyen: 1234,
      soXe: 56,
      doanhThu: 123456789,
      soKhachHang: 78
    },
    topCustomers: [
      {
        ma_khach_hang: "KH001",
        ten_khach_hang: "Công ty ABC",
        so_chuyen: "100",
        tong_doanh_thu: "50000000"
      },
      ...
    ],
    topRoutes: [...],
    revenueByRouteType: [...],
    topVehicles: [...],
    bottomVehicles: [...]
  },
  timestamp: "2025-01-01T00:00:00.000Z"
}
```

---

## 🚀 DEPLOYMENT

1. **Push code:**
   ```bash
   clasp push
   ```

2. **Test trong Apps Script Editor:**
   - Run `testGetAllDashboardData()`
   - Check logs

3. **Deploy web app:**
   ```bash
   clasp deploy --description "New dashboard with reports"
   ```

4. **Test trong browser:**
   - Mở web app URL
   - Check console (F12)
   - Verify data loading

---

## ✅ CHECKLIST

- [x] Config.gs - SQL queries
- [x] BigQueryService.gs - Service methods
- [x] Main.gs - API endpoints
- [ ] ApiClient.html - Client API methods
- [ ] UIComponents.html - UI rendering
- [ ] Styles.html - CSS styling
- [ ] AppController.html - App logic
- [ ] Test backend
- [ ] Test frontend
- [ ] Deploy

---

**Last Updated:** 2025-11-28
**Status:** Backend complete, Frontend in progress
