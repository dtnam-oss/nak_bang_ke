/**
 * MAIN.GS
 * Entry points và controllers chính của ứng dụng
 * Đây là nơi Apps Script gọi đầu tiên
 */

/**
 * Hàm doGet - Entry point khi user truy cập Web App
 * @param {Object} e - Event object từ Apps Script
 * @return {HtmlOutput} HTML page
 */
function doGet(e) {
  try {
    // Sử dụng template HTML include để load các file riêng biệt
    var template = HtmlService.createTemplateFromFile('Index');

    // Có thể truyền data vào template nếu cần
    template.appTitle = CONFIG.APP.TITLE;
    template.appVersion = CONFIG.APP.VERSION;

    return template.evaluate()
      .setTitle(CONFIG.APP.TITLE)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  } catch (error) {
    ErrorHandler.log('Error in doGet', error);

    // Trả về error page
    return HtmlService.createHtmlOutput(
      '<h1>Lỗi</h1><p>Không thể tải ứng dụng. Vui lòng thử lại sau.</p>'
    );
  }
}

/**
 * Include helper - Để load CSS/JS từ file riêng vào HTML
 * Sử dụng: <?!= include('Styles') ?>
 * @param {string} filename - Tên file (không có extension)
 * @return {string} File content
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    ErrorHandler.log('Error including file: ' + filename, error);
    return '<!-- Error loading ' + filename + ' -->';
  }
}

/**
 * ===================================================================
 * API ENDPOINTS - Được gọi từ client qua google.script.run
 * ===================================================================
 */

/**
 * API: Lấy TẤT CẢ dữ liệu dashboard (optimize - 1 call duy nhất)
 * @param {Object} filter - { type: 'day'|'week'|'month'|'year', date: 'YYYY-MM-DD' }
 * @return {Object} All dashboard data
 */
function getAllDashboardData(filter) {
  // DEBUG: Log filter nhận được từ client
  ErrorHandler.log('getAllDashboardData called with filter', null, {
    filter: JSON.stringify(filter),
    filterType: typeof filter,
    filterKeys: filter ? Object.keys(filter) : null
  });

  return BigQueryService.getAllDashboardData(filter);
}

/**
 * API: Lấy chỉ số tổng quan (4 cards)
 * @param {Object} filter - Date filter
 * @return {Object} Overview metrics
 */
function getOverviewMetrics(filter) {
  return BigQueryService.getOverviewMetrics(filter);
}

/**
 * API: Lấy top 10 khách hàng theo doanh thu
 * @param {Object} filter - Date filter
 * @return {Object} Top customers
 */
function getTopCustomers(filter) {
  return BigQueryService.getTopCustomers(filter);
}

/**
 * API: Lấy top 10 tuyến theo doanh thu
 * @param {Object} filter - Date filter
 * @return {Object} Top routes
 */
function getTopRoutes(filter) {
  return BigQueryService.getTopRoutes(filter);
}

/**
 * API: Lấy doanh thu theo loại tuyến
 * @param {Object} filter - Date filter
 * @return {Object} Revenue by route type
 */
function getRevenueByRouteType(filter) {
  return BigQueryService.getRevenueByRouteType(filter);
}

/**
 * API: Lấy top 10 xe doanh thu cao nhất
 * @param {Object} filter - Date filter
 * @return {Object} Top vehicles
 */
function getTopVehicles(filter) {
  return BigQueryService.getTopVehicles(filter);
}

/**
 * API: Lấy top 10 xe doanh thu thấp nhất
 * @param {Object} filter - Date filter
 * @return {Object} Bottom vehicles
 */
function getBottomVehicles(filter) {
  return BigQueryService.getBottomVehicles(filter);
}

/**
 * API (Legacy): Lấy thống kê dashboard cũ
 * Giữ lại để backward compatible
 * @return {Object} Dashboard statistics
 */
function getDashboardStats() {
  return BigQueryService.getDashboardStats();
}

/**
 * Utility: Test connection với BigQuery
 * Chạy trong Apps Script Editor để test
 * @return {Object} Test result
 */
function testBigQueryConnection() {
  Logger.log('Testing BigQuery connection...');

  try {
    var result = BigQueryService.getDashboardStats();
    Logger.log('Success: ' + JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log('Failed: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Utility: Get app configuration
 * Để debug hoặc hiển thị info
 * @return {Object} App config (safe version)
 */
function getAppInfo() {
  return {
    title: CONFIG.APP.TITLE,
    version: CONFIG.APP.VERSION,
    timezone: CONFIG.APP.TIMEZONE
  };
}

/**
 * ===================================================================
 * KẾ TOÁN MODULE - API ENDPOINTS
 * ===================================================================
 */

/**
 * API: Lấy danh sách khách hàng (cho dropdown filter)
 * Được gọi từ KeToanController.loadCustomers()
 * @return {Array} Danh sách khách hàng [{ma_khach_hang, ten_khach_hang}, ...]
 */
function getCustomerList() {
  try {
    ErrorHandler.log('API: getCustomerList called');
    var result = BigQueryService.getCustomerList();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Không thể tải danh sách khách hàng');
    }
  } catch (error) {
    ErrorHandler.log('Error in getCustomerList API', error);
    throw error;
  }
}

/**
 * API: Lấy danh sách loại tuyến (cho dropdown filter)
 * Được gọi từ KeToanController.loadRouteTypes()
 * @return {Array} Danh sách loại tuyến [{loai_tuyen}, ...]
 */
function getRouteList() {
  try {
    ErrorHandler.log('API: getRouteList called');
    var result = BigQueryService.getRouteTypeList();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Không thể tải danh sách loại tuyến');
    }
  } catch (error) {
    ErrorHandler.log('Error in getRouteList API', error);
    throw error;
  }
}

/**
 * API: Lấy dữ liệu đối soát
 * Được gọi từ KeToanController.loadDoiSoatPreview()
 * @param {Object} filters - {ma_khach_hang, loai_tuyen, tu_ngay, den_ngay}
 * @return {Object} Dữ liệu đối soát {customer, trips, summary, filters}
 */
function getDoiSoatData(filters) {
  try {
    ErrorHandler.log('API: getDoiSoatData called', null, { filters: filters });
    var result = BigQueryService.getDoiSoatData(filters);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Không thể tải dữ liệu đối soát');
    }
  } catch (error) {
    ErrorHandler.log('Error in getDoiSoatData API', error);
    throw error;
  }
}
