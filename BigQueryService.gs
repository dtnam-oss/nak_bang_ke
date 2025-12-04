/**
 * BIGQUERY_SERVICE.GS
 * Service layer để tương tác với BigQuery
 * Tách biệt logic query khỏi controller
 */

var BigQueryService = {

  /**
   * Execute một query BigQuery
   * @param {string} sqlQuery - SQL query cần thực thi
   * @return {Object} Query results
   * @throws {Error} Nếu query thất bại
   */
  executeQuery: function(sqlQuery) {
    try {
      var request = {
        query: sqlQuery,
        useLegacySql: false,
        timeoutMs: 30000 // 30 seconds timeout
      };

      ErrorHandler.log('Executing BigQuery', null, {
        query: sqlQuery.substring(0, 200) + '...'
      });

      var queryResults = BigQuery.Jobs.query(request, CONFIG.BIGQUERY.PROJECT_ID);

      // FIXED: Don't throw error when rows is undefined/null
      // Some queries legitimately return 0 rows (e.g., no data for selected date)
      // Just ensure queryResults object exists
      if (!queryResults) {
        throw new Error(CONFIG.ERRORS.NO_DATA_RETURNED);
      }

      // If no rows, set to empty array so parseRows works correctly
      if (!queryResults.rows) {
        queryResults.rows = [];
      }

      return queryResults;

    } catch (error) {
      ErrorHandler.log(CONFIG.ERRORS.BIGQUERY_QUERY_FAILED, error, {
        query: sqlQuery
      });
      throw error;
    }
  },

  /**
   * Parse kết quả BigQuery row thành object dễ đọc
   * @param {Array} row - BigQuery row object (f array)
   * @param {Array} fields - Tên các field
   * @return {Object} Parsed object
   */
  parseRow: function(row, fields) {
    if (!row || !row.f) {
      return null;
    }

    var result = {};
    for (var i = 0; i < fields.length && i < row.f.length; i++) {
      result[fields[i]] = row.f[i].v;
    }
    return result;
  },

  /**
   * Lấy thống kê dashboard từ BigQuery
   * @return {Object} Dashboard statistics
   */
  getDashboardStats: function() {
    try {
      var sql = CONFIG.QUERIES.DASHBOARD_STATS();
      var queryResults = this.executeQuery(sql);
      var rows = queryResults.rows;

      if (rows && rows.length > 0) {
        var row = rows[0];

        // Parse dữ liệu an toàn
        var stats = {
          total: parseInt(row.f[0].v) || 0,
          byRoute: parseInt(row.f[1].v) || 0,
          ghn: parseInt(row.f[2].v) || 0
        };

        return {
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        };
      }

      // Trường hợp không có data
      return {
        success: true,
        data: { total: 0, byRoute: 0, ghn: 0 },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting dashboard stats', error);
      return ErrorHandler.createErrorResponse(
        'Không thể tải thống kê dashboard',
        error
      );
    }
  },

  /**
   * Parse nhiều rows thành array of objects
   * @param {Array} rows - BigQuery rows
   * @param {Array} schema - Query schema fields
   * @return {Array} Array of objects
   */
  parseRows: function(rows, schema) {
    if (!rows || rows.length === 0) {
      return [];
    }

    if (!schema || !Array.isArray(schema)) {
      ErrorHandler.log('parseRows: schema is missing or invalid!', null, {
        schemaType: typeof schema,
        rowCount: rows.length
      });
      return [];
    }

    var fieldNames = schema.map(function(field) {
      return field.name;
    });

    return rows.map(function(row) {
      var obj = {};
      for (var i = 0; i < fieldNames.length && i < row.f.length; i++) {
        obj[fieldNames[i]] = row.f[i].v;
      }
      return obj;
    });
  },

  /**
   * 1. LẤY OVERVIEW METRICS (4 cards tổng quan)
   * @param {Object} filter - { type: 'day'|'week'|'month'|'year', date: 'YYYY-MM-DD' }
   * @return {Object} Metrics data
   */
  getOverviewMetrics: function(filter) {
    try {
      var sql = CONFIG.QUERIES.OVERVIEW_METRICS(filter);
      var queryResults = this.executeQuery(sql);

      if (queryResults.rows && queryResults.rows.length > 0) {
        var row = queryResults.rows[0];

        var data = {
          soChuyen: parseInt(row.f[0].v) || 0,
          soXe: parseInt(row.f[1].v) || 0,
          doanhThu: parseFloat(row.f[2].v) || 0,
          soKhachHang: parseInt(row.f[3].v) || 0
        };

        return {
          success: true,
          data: data,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: { soChuyen: 0, soXe: 0, doanhThu: 0, soKhachHang: 0 },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting overview metrics', error);
      return ErrorHandler.createErrorResponse('Không thể tải chỉ số tổng quan', error);
    }
  },

  /**
   * 2. LẤY TOP 10 KHÁCH HÀNG
   * @param {Object} filter - Date filter
   * @return {Object} Top customers data
   */
  getTopCustomers: function(filter) {
    try {
      var sql = CONFIG.QUERIES.TOP_CUSTOMERS_BY_REVENUE(filter);
      ErrorHandler.log('TOP_CUSTOMERS Query', null, { sql: sql });

      var queryResults = this.executeQuery(sql);
      ErrorHandler.log('TOP_CUSTOMERS Raw Results', null, {
        hasRows: !!queryResults.rows,
        rowCount: queryResults.rows ? queryResults.rows.length : 0
      });

      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);
      ErrorHandler.log('TOP_CUSTOMERS Parsed Data', null, {
        dataLength: data.length,
        sample: data.length > 0 ? data[0] : null
      });

      // Đảm bảo luôn trả về mảng rỗng nếu không có dữ liệu
      if (!Array.isArray(data)) data = [];

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting top customers', error);
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * 3. LẤY TOP 10 TUYẾN
   * @param {Object} filter - Date filter
   * @return {Object} Top routes data
   */
  getTopRoutes: function(filter) {
    try {
      var sql = CONFIG.QUERIES.TOP_ROUTES_BY_REVENUE(filter);
      ErrorHandler.log('TOP_ROUTES Query', null, { sql: sql });

      var queryResults = this.executeQuery(sql);
      ErrorHandler.log('TOP_ROUTES Raw Results', null, {
        hasRows: !!queryResults.rows,
        rowCount: queryResults.rows ? queryResults.rows.length : 0
      });

      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);
      ErrorHandler.log('TOP_ROUTES Parsed Data', null, {
        dataLength: data.length,
        sample: data.length > 0 ? data[0] : null
      });

      if (!Array.isArray(data)) data = [];

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting top routes', error);
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * 4. LẤY DOANH THU THEO LOẠI TUYẾN
   * @param {Object} filter - Date filter
   * @return {Object} Revenue by route type
   */
  getRevenueByRouteType: function(filter) {
    try {
      var sql = CONFIG.QUERIES.REVENUE_BY_ROUTE_TYPE(filter);
      var queryResults = this.executeQuery(sql);

      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);
      if (!Array.isArray(data)) data = [];

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting revenue by route type', error);
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * 5. LẤY TOP 10 XE DOANH THU CAO
   * @param {Object} filter - Date filter
   * @return {Object} Top vehicles data
   */
  getTopVehicles: function(filter) {
    try {
      var sql = CONFIG.QUERIES.TOP_VEHICLES_BY_REVENUE(filter);
      var queryResults = this.executeQuery(sql);

      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);
      if (!Array.isArray(data)) data = [];

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting top vehicles', error);
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * 6. LẤY TOP 10 XE DOANH THU THẤP
   * @param {Object} filter - Date filter
   * @return {Object} Bottom vehicles data
   */
  getBottomVehicles: function(filter) {
    try {
      var sql = CONFIG.QUERIES.BOTTOM_VEHICLES_BY_REVENUE(filter);
      var queryResults = this.executeQuery(sql);

      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);
      if (!Array.isArray(data)) data = [];

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting bottom vehicles', error);
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * LẤY TẤT CẢ DỮ LIỆU DASHBOARD (combined)
   * Gọi tất cả queries cùng lúc để optimize
   * @param {Object} filter - Date filter
   * @return {Object} All dashboard data
   */
  getAllDashboardData: function(filter) {
    try {
      return {
        success: true,
        data: {
          overview: this.getOverviewMetrics(filter).data,
          topCustomers: this.getTopCustomers(filter).data,
          topRoutes: this.getTopRoutes(filter).data,
          revenueByRouteType: this.getRevenueByRouteType(filter).data,
          topVehicles: this.getTopVehicles(filter).data,
          bottomVehicles: this.getBottomVehicles(filter).data
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting all dashboard data', error);
      return ErrorHandler.createErrorResponse('Không thể tải dữ liệu dashboard', error);
    }
  },

  /* ===================================================================
     KẾ TOÁN MODULE - ĐỐI SOÁT FUNCTIONS
     =================================================================== */

  /**
   * LẤY DANH SÁCH KHÁCH HÀNG (cho dropdown filter)
   * @return {Array} Danh sách khách hàng [{ma_khach_hang, ten_khach_hang}, ...]
   */
  getCustomerList: function() {
    try {
      var sql = 'SELECT ma_khach_hang, ten_khach_hang ' +
                'FROM `' + CONFIG.BIGQUERY.DATASET + '.tb_khach_hang` ' +
                'WHERE ma_khach_hang IS NOT NULL ' +
                'ORDER BY ten_khach_hang ASC';

      ErrorHandler.log('Getting customer list', null, { sql: sql });

      var queryResults = this.executeQuery(sql);
      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);

      if (!Array.isArray(data)) data = [];

      ErrorHandler.log('Customer list retrieved', null, { count: data.length });

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting customer list', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * LẤY DANH SÁCH LOẠI TUYẾN (cho dropdown filter)
   * Query từ tb_chuyen_di để lấy distinct loai_tuyen
   * @return {Array} Danh sách loại tuyến [{loai_tuyen}, ...]
   */
  getRouteTypeList: function() {
    try {
      var sql = 'SELECT DISTINCT loai_tuyen ' +
                'FROM `' + CONFIG.BIGQUERY.DATASET + '.tb_chuyen_di` ' +
                'WHERE loai_tuyen IS NOT NULL ' +
                'ORDER BY loai_tuyen ASC';

      ErrorHandler.log('Getting route type list', null, { sql: sql });

      var queryResults = this.executeQuery(sql);
      var data = this.parseRows(queryResults.rows, queryResults.schema.fields);

      if (!Array.isArray(data)) data = [];

      ErrorHandler.log('Route type list retrieved', null, { count: data.length });

      return {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting route type list', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * LẤY DỮ LIỆU ĐỐI SOÁT
   * @param {Object} filters - {ma_khach_hang, loai_tuyen, tu_ngay, den_ngay}
   * @return {Object} Dữ liệu đối soát với thông tin khách hàng và danh sách chuyến
   */
  getDoiSoatData: function(filters) {
    try {
      ErrorHandler.log('Getting doi soat data', null, { filters: filters });

      // Validate filters
      if (!filters.ma_khach_hang) {
        throw new Error('Vui lòng chọn khách hàng');
      }
      if (!filters.tu_ngay || !filters.den_ngay) {
        throw new Error('Vui lòng chọn thời gian');
      }

      // 1. Lấy thông tin khách hàng
      var customerSql = 'SELECT ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi ' +
                        'FROM `' + CONFIG.BIGQUERY.DATASET + '.tb_khach_hang` ' +
                        'WHERE ma_khach_hang = "' + filters.ma_khach_hang + '"';

      var customerResults = this.executeQuery(customerSql);
      var customerData = this.parseRows(customerResults.rows, customerResults.schema.fields);

      if (!customerData || customerData.length === 0) {
        throw new Error('Không tìm thấy thông tin khách hàng');
      }

      var customer = customerData[0];

      // 2. Build query cho danh sách chuyến đi
      var tripsSql = 'SELECT ' +
                     '  ngay_tao, ' +
                     '  ma_chuyen_di, ' +
                     '  loai_tuyen, ' +
                     '  tuyen_duong, ' +
                     '  bien_so_xe, ' +
                     '  doanh_thu, ' +
                     '  trang_thai ' +
                     'FROM `' + CONFIG.BIGQUERY.DATASET + '.tb_chuyen_di` ' +
                     'WHERE ma_khach_hang = "' + filters.ma_khach_hang + '" ' +
                     '  AND DATE(ngay_tao) BETWEEN "' + filters.tu_ngay + '" AND "' + filters.den_ngay + '"';

      // Thêm filter loại tuyến nếu có
      if (filters.loai_tuyen) {
        tripsSql += ' AND loai_tuyen = "' + filters.loai_tuyen + '"';
      }

      tripsSql += ' ORDER BY ngay_tao DESC';

      var tripsResults = this.executeQuery(tripsSql);
      var trips = this.parseRows(tripsResults.rows, tripsResults.schema.fields);

      if (!Array.isArray(trips)) trips = [];

      // 3. Tính toán summary metrics
      var totalRevenue = 0;
      var paidAmount = 0;
      var unpaidAmount = 0;

      trips.forEach(function(trip) {
        var revenue = parseFloat(trip.doanh_thu) || 0;
        totalRevenue += revenue;

        // Giả sử: trang_thai = "Da thanh toan" hoặc logic khác
        // Bạn cần điều chỉnh theo logic thực tế của bảng
        if (trip.trang_thai === 'Da thanh toan') {
          paidAmount += revenue;
        } else {
          unpaidAmount += revenue;
        }
      });

      var summary = {
        so_chuyen: trips.length,
        tong_doanh_thu: totalRevenue,
        da_thanh_toan: paidAmount,
        con_no: unpaidAmount
      };

      ErrorHandler.log('Doi soat data retrieved', null, {
        customer: customer.ten_khach_hang,
        tripCount: trips.length,
        totalRevenue: totalRevenue
      });

      return {
        success: true,
        data: {
          customer: customer,
          trips: trips,
          summary: summary,
          filters: filters
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      ErrorHandler.log('Error getting doi soat data', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};
