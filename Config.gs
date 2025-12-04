/**
 * CONFIG.GS
 * Quản lý tất cả cấu hình cho ứng dụng
 * Tách biệt config khỏi logic code để dễ bảo trì
 */

var CONFIG = {
  // BigQuery Configuration
  BIGQUERY: {
    PROJECT_ID: 'nakvi-476804',
    DATASET: 'nak_logistics',
    TABLE_TRIPS: 'tb_chuyen_di'
  },

  // Application Settings
  APP: {
    TITLE: 'Logistics Dashboard',
    TIMEZONE: 'Asia/Ho_Chi_Minh',
    VERSION: '1.0.0'
  },

  // Query Configuration
  QUERIES: {
    /**
     * LEGACY: Query đơn giản cho dashboard cũ (backward compatible)
     * @deprecated Use OVERVIEW_METRICS instead
     */
    DASHBOARD_STATS: function() {
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;
      return `
        SELECT
          COUNT(*) as tong_chuyen,
          COUNTIF(loai_chuyen = 'Theo tuyến') as theo_tuyen,
          COUNTIF(loai_chuyen = 'GHN') as ghn
        FROM \`${table}\`
      `;
    },

    /**
     * Helper function để build WHERE clause cho filter ngày
     * @param {Object} filter - { type: 'day'|'week'|'month'|'year', date: 'YYYY-MM-DD' }
     */
    buildDateFilter: function(filter) {
      // DEBUG: Log input filter
      Logger.log('buildDateFilter called with: ' + JSON.stringify(filter));

      if (!filter || !filter.date) {
        Logger.log('buildDateFilter: No filter or no date, returning 1=1');
        return '1=1'; // No filter - show all data
      }

      var dateField = 'ngay_tao'; // Trường ngày trong BigQuery table
      var date = filter.date;
      var type = filter.type;

      Logger.log('buildDateFilter: type=' + type + ', date=' + date);

      var result;
      switch(type) {
        case 'day':
          result = `DATE(${dateField}) = DATE('${date}')`;
          break;

        case 'week':
          result = `DATE_TRUNC(DATE(${dateField}), WEEK) = DATE_TRUNC(DATE('${date}'), WEEK)`;
          break;

        case 'month':
          result = `DATE_TRUNC(DATE(${dateField}), MONTH) = DATE_TRUNC(DATE('${date}'), MONTH)`;
          break;

        case 'year':
          result = `DATE_TRUNC(DATE(${dateField}), YEAR) = DATE_TRUNC(DATE('${date}'), YEAR)`;
          break;

        default:
          Logger.log('buildDateFilter: Unknown type "' + type + '", returning 1=1');
          result = '1=1';
      }

      Logger.log('buildDateFilter result: ' + result);
      return result;
    },

    /**
     * 1. OVERVIEW CARDS - Các chỉ số tổng quan
     */
    OVERVIEW_METRICS: function(filter) {
      var whereClause = this.buildDateFilter(filter);
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;

      return `
        SELECT
          COUNT(DISTINCT ma_chuyen_di) as so_chuyen_di,
          COUNT(DISTINCT bien_kiem_soat) as so_xe_su_dung,
          ROUND(SUM(doanh_thu), 0) as tong_doanh_thu,
          COUNT(DISTINCT ma_khach_hang) as so_khach_hang
        FROM \`${table}\`
        WHERE ${whereClause}
      `;
    },

    /**
     * 2. TOP 10 KHÁCH HÀNG THEO DOANH THU
     */
    TOP_CUSTOMERS_BY_REVENUE: function(filter) {
      var whereClause = this.buildDateFilter(filter);
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;

      return `
        SELECT
          ma_khach_hang,
          ten_khach_hang,
          COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
          ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
        FROM \`${table}\`
        WHERE ${whereClause}
        GROUP BY ma_khach_hang, ten_khach_hang
        ORDER BY tong_doanh_thu DESC
        LIMIT 10
      `;
    },

    /**
     * 3. TOP 10 TUYẾN THEO DOANH THU
     */
    TOP_ROUTES_BY_REVENUE: function(filter) {
      var whereClause = this.buildDateFilter(filter);
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;

      return `
        SELECT
          loai_tuyen_khach_hang as tuyen,
          COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
          ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
        FROM \`${table}\`
        WHERE ${whereClause}
          AND loai_tuyen_khach_hang IS NOT NULL
        GROUP BY loai_tuyen_khach_hang
        ORDER BY tong_doanh_thu DESC
        LIMIT 10
      `;
    },

    /**
     * 4. DOANH THU THEO LOẠI TUYẾN
     */
    REVENUE_BY_ROUTE_TYPE: function(filter) {
      var whereClause = this.buildDateFilter(filter);
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;

      return `
        SELECT
          loai_tuyen_khach_hang,
          COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
          ROUND(SUM(doanh_thu), 0) as tong_doanh_thu,
          ROUND(AVG(doanh_thu), 0) as doanh_thu_trung_binh
        FROM \`${table}\`
        WHERE ${whereClause}
          AND loai_tuyen_khach_hang IS NOT NULL
        GROUP BY loai_tuyen_khach_hang
        ORDER BY tong_doanh_thu DESC
      `;
    },

    /**
     * 5. TOP 10 XE DOANH THU CAO NHẤT
     */
    TOP_VEHICLES_BY_REVENUE: function(filter) {
      var whereClause = this.buildDateFilter(filter);
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;

      return `
        SELECT
          bien_kiem_soat,
          COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
          ROUND(SUM(doanh_thu), 0) as tong_doanh_thu,
          ROUND(AVG(doanh_thu), 0) as doanh_thu_trung_binh
        FROM \`${table}\`
        WHERE ${whereClause}
          AND bien_kiem_soat IS NOT NULL
        GROUP BY bien_kiem_soat
        ORDER BY tong_doanh_thu DESC
        LIMIT 10
      `;
    },

    /**
     * 6. TOP 10 XE DOANH THU THẤP NHẤT
     */
    BOTTOM_VEHICLES_BY_REVENUE: function(filter) {
      var whereClause = this.buildDateFilter(filter);
      var table = `${CONFIG.BIGQUERY.PROJECT_ID}.${CONFIG.BIGQUERY.DATASET}.${CONFIG.BIGQUERY.TABLE_TRIPS}`;

      return `
        SELECT
          bien_kiem_soat,
          COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
          ROUND(SUM(doanh_thu), 0) as tong_doanh_thu,
          ROUND(AVG(doanh_thu), 0) as doanh_thu_trung_binh
        FROM \`${table}\`
        WHERE ${whereClause}
          AND bien_kiem_soat IS NOT NULL
        GROUP BY bien_kiem_soat
        ORDER BY tong_doanh_thu ASC
        LIMIT 10
      `;
    }
  },

  // Error Messages
  ERRORS: {
    BIGQUERY_QUERY_FAILED: 'Không thể thực thi query BigQuery',
    NO_DATA_RETURNED: 'Không có dữ liệu trả về từ BigQuery',
    INVALID_RESPONSE: 'Dữ liệu trả về không hợp lệ'
  },

  // Feature Flags (để bật/tắt tính năng)
  FEATURES: {
    ENABLE_LOGGING: true,
    ENABLE_CACHE: false,
    CACHE_DURATION: 300 // seconds
  }
};
