// Google Apps Script Code
// File: Code.gs
// Sử dụng để deploy webapp lên Google Apps Script và embed vào website khác

function doGet(e) {
  // Nếu có parameter 'action=getData', trả về JSON data từ sheet ke_toan
  if (e.parameter.action === 'getData') {
    var data = getDataFromSheet();
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Nếu có parameter 'action=getReportData', trả về JSON data từ sheet tong_quan
  if (e.parameter.action === 'getReportData') {
    var data = getReportDataFromSheet();
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Nếu có parameter 'action=getVehicleData', trả về JSON data từ sheet doi_xe
  if (e.parameter.action === 'getVehicleData') {
    var data = getVehicleDataFromSheet();
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Nếu có parameter 'action=getJNTReportData', trả về JSON data từ báo cáo J&T
  if (e.parameter.action === 'getJNTReportData') {
    var result = createJNTReport('chi_tiet_chuyen_di', 'bao_cao_jnt_tuyen_nhanh');
    if (result.success) {
      return ContentService
        .createTextOutput(JSON.stringify(result.data))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Nếu có parameter 'action=getGHNReportData', trả về JSON data từ báo cáo GHN
  if (e.parameter.action === 'getGHNReportData') {
    var result = createGHNReport('chi_tiet_chuyen_di', 'bao_cao_ghn');
    if (result.success) {
      return ContentService
        .createTextOutput(JSON.stringify(result.data))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Nếu có parameter 'action=triggerJNTReport', chạy createJNTReport và trả về status
  if (e.parameter.action === 'triggerJNTReport') {
    var result = createJNTReport('chi_tiet_chuyen_di', 'bao_cao_jnt_tuyen_nhanh');
    return ContentService
      .createTextOutput(JSON.stringify({
        success: result.success,
        message: result.message,
        stats: result.stats || {}
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Nếu có parameter 'action=triggerGHNReport', chạy createGHNReport và trả về status
  if (e.parameter.action === 'triggerGHNReport') {
    var result = createGHNReport('chi_tiet_chuyen_di', 'bao_cao_ghn');
    return ContentService
      .createTextOutput(JSON.stringify({
        success: result.success,
        message: result.message,
        stats: result.stats || {}
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Nếu có parameter 'action=triggerAllReports', chạy cả 2 reports
  if (e.parameter.action === 'triggerAllReports') {
    var jntResult = createJNTReport('chi_tiet_chuyen_di', 'bao_cao_jnt_tuyen_nhanh');
    var ghnResult = createGHNReport('chi_tiet_chuyen_di', 'bao_cao_ghn');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: jntResult.success && ghnResult.success,
        jnt: {
          success: jntResult.success,
          message: jntResult.message,
          stats: jntResult.stats || {}
        },
        ghn: {
          success: ghnResult.success,
          message: ghnResult.message,
          stats: ghnResult.stats || {}
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Nếu không có parameter, trả về HTML page
  var template = HtmlService.createTemplateFromFile('Index');
  return template
    .evaluate()
    .setTitle('Bảng kê đối soát')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setFaviconUrl('https://i.ibb.co/8b4MvV2/Black-Modern-Software-Programmer-Logo-2.png');
}

// Hàm xử lý POST request từ AppSheet webhook
function doPost(e) {
  try {
    // Parse JSON data từ request body
    var requestData = JSON.parse(e.postData.contents);

    // Kiểm tra loại action
    var action = requestData.action;

    // Action 1: Cập nhật trạng thái phương tiện (webhook cũ)
    if (action === 'updateStatus' || (requestData.ma_tai_xe && requestData.trang_thai_chuyen_di)) {
      var ma_tai_xe = requestData.ma_tai_xe;
      var trang_thai_chuyen_di = requestData.trang_thai_chuyen_di;

      if (!ma_tai_xe || !trang_thai_chuyen_di) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: 'Missing required parameters: ma_tai_xe or trang_thai_chuyen_di'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var result = updateVehicleStatus(ma_tai_xe, trang_thai_chuyen_di);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Action 2: Cập nhật tình trạng hoạt động (webhook mới)
    if (action === 'updateActivity' || (requestData.bien_kiem_soat && requestData.ngay_tao && requestData.so_luong_chuyen !== undefined)) {
      var bien_kiem_soat = requestData.bien_kiem_soat;
      var ngay_tao = requestData.ngay_tao;
      var so_luong_chuyen = requestData.so_luong_chuyen;

      if (!bien_kiem_soat || !ngay_tao || so_luong_chuyen === undefined) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: 'Missing required parameters: bien_kiem_soat, ngay_tao, or so_luong_chuyen'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var result = updateVehicleActivity(bien_kiem_soat, ngay_tao, so_luong_chuyen);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Không xác định được action
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid action or missing parameters'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Include CSS and JS files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Hàm lấy dữ liệu từ Google Sheets
function getDataFromSheet() {
  try {
    var spreadsheet = SpreadsheetApp.openById('18pS9YMZSwZCVBt_anIGn3GN4qFoPpMtALQm4YvMDd-g');
    var sheet = spreadsheet.getSheetByName('ke_toan');
    var data = sheet.getDataRange().getValues();

    // Chuyển đổi dữ liệu thành JSON
    var headers = data[0];
    var jsonData = [];

    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var value = data[i][j];

        // Format date cho cột ngay_tao
        if (headers[j] === 'ngay_tao' && value instanceof Date) {
          var day = String(value.getDate()).padStart(2, '0');
          var month = String(value.getMonth() + 1).padStart(2, '0');
          var year = value.getFullYear();
          row[headers[j]] = day + '/' + month + '/' + year;
        }
        // Parse JSON cho cột chi_tiet_chuyen_di
        else if (headers[j] === 'chi_tiet_chuyen_di' && typeof value === 'string') {
          try {
            row[headers[j]] = JSON.parse(value);
          } catch (e) {
            row[headers[j]] = value;
          }
        } else {
          row[headers[j]] = value;
        }
      }
      jsonData.push(row);
    }

    return jsonData;
  } catch (error) {
    Logger.log('Error getting data from sheet: ' + error);
    return [];
  }
}

// Hàm lấy dữ liệu báo cáo từ Google Sheets (sheet tong_quan)
function getReportDataFromSheet() {
  try {
    var spreadsheet = SpreadsheetApp.openById('18pS9YMZSwZCVBt_anIGn3GN4qFoPpMtALQm4YvMDd-g');
    var sheet = spreadsheet.getSheetByName('tong_quan');
    var data = sheet.getDataRange().getValues();

    // Chuyển đổi dữ liệu thành JSON
    var headers = data[0];
    var jsonData = [];

    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var value = data[i][j];

        // Format date cho cột ngay_tao
        if (headers[j] === 'ngay_tao' && value instanceof Date) {
          var day = String(value.getDate()).padStart(2, '0');
          var month = String(value.getMonth() + 1).padStart(2, '0');
          var year = value.getFullYear();
          row[headers[j]] = day + '/' + month + '/' + year;
        }
        // Parse JSON cho cột chi_tiet_bao_cao
        else if (headers[j] === 'chi_tiet_bao_cao' && typeof value === 'string') {
          try {
            row[headers[j]] = JSON.parse(value);
          } catch (e) {
            row[headers[j]] = value;
          }
        } else {
          row[headers[j]] = value;
        }
      }
      jsonData.push(row);
    }

    return jsonData;
  } catch (error) {
    Logger.log('Error getting report data from sheet: ' + error);
    return [];
  }
}

// Hàm lấy dữ liệu phương tiện từ Google Sheets (sheet doi_xe)
function getVehicleDataFromSheet() {
  try {
    var spreadsheet = SpreadsheetApp.openById('18pS9YMZSwZCVBt_anIGn3GN4qFoPpMtALQm4YvMDd-g');
    var sheet = spreadsheet.getSheetByName('doi_xe');
    var data = sheet.getDataRange().getValues();

    // Chuyển đổi dữ liệu thành JSON
    var headers = data[0];
    var jsonData = [];

    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var value = data[i][j];

        // Parse JSON cho cột tinh_trang_hoat_dong
        if (headers[j] === 'tinh_trang_hoat_dong' && typeof value === 'string') {
          try {
            row[headers[j]] = JSON.parse(value);
          } catch (e) {
            row[headers[j]] = value;
          }
        } else {
          row[headers[j]] = value;
        }
      }
      jsonData.push(row);
    }

    return jsonData;
  } catch (error) {
    Logger.log('Error getting vehicle data from sheet: ' + error);
    return [];
  }
}

// Hàm lưu dữ liệu vào Google Sheets (nếu cần)
function saveDataToSheet(data) {
  try {
    var spreadsheet = SpreadsheetApp.openById('YOUR_SHEET_ID');
    var sheet = spreadsheet.getSheetByName('Data');
    
    // Xóa dữ liệu cũ (trừ header)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Thêm dữ liệu mới
    var dataArray = JSON.parse(data);
    dataArray.forEach(function(item) {
      sheet.appendRow([
        item.id,
        item.customerName,
        item.customerId,
        item.date,
        item.orderId,
        item.amount,
        item.status,
        item.note
      ]);
    });
    
    return { success: true, message: 'Data saved successfully' };
  } catch (error) {
    Logger.log('Error saving data: ' + error);
    return { success: false, message: 'Error: ' + error };
  }
}

// Hàm cập nhật trạng thái phương tiện
function updateVehicleStatus(ma_tai_xe, trang_thai_chuyen_di) {
  try {
    // Mở Google Sheets
    var spreadsheet = SpreadsheetApp.openById('1fzepYrS-o5zc01h7nQFzJSOwagoTvOgoiDQHrTLB12E');
    var sheet = spreadsheet.getSheetByName('phuong_tien');

    if (!sheet) {
      return {
        success: false,
        message: 'Sheet "phuong_tien" not found'
      };
    }

    // Lấy tất cả dữ liệu từ sheet
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // Tìm index của các cột
    var taiXeTheoXeColIndex = -1;
    var trangThaiColIndex = -1;

    for (var i = 0; i < headers.length; i++) {
      if (headers[i] === 'tai_xe_theo_xe') {
        taiXeTheoXeColIndex = i;
      }
      if (headers[i] === 'trang_thai') {
        trangThaiColIndex = i;
      }
    }

    // Kiểm tra nếu không tìm thấy cột
    if (taiXeTheoXeColIndex === -1 || trangThaiColIndex === -1) {
      return {
        success: false,
        message: 'Required columns not found. Looking for: tai_xe_theo_xe, trang_thai'
      };
    }

    // Chuyển ma_tai_xe thành array nếu là string
    var maTaiXeArray = [];
    if (typeof ma_tai_xe === 'string') {
      maTaiXeArray = [ma_tai_xe];
    } else if (Array.isArray(ma_tai_xe)) {
      maTaiXeArray = ma_tai_xe;
    } else {
      return {
        success: false,
        message: 'ma_tai_xe must be a string or array'
      };
    }

    // Đếm số dòng đã cập nhật
    var updatedCount = 0;
    var updatedRows = [];

    // Duyệt qua từng dòng (bỏ qua header)
    for (var row = 1; row < data.length; row++) {
      var taiXeTheoXe = data[row][taiXeTheoXeColIndex];

      // Kiểm tra nếu tai_xe_theo_xe chứa bất kỳ ma_tai_xe nào trong array
      var shouldUpdate = false;

      for (var j = 0; j < maTaiXeArray.length; j++) {
        var maTaiXe = maTaiXeArray[j].toString().trim();

        // Kiểm tra nếu taiXeTheoXe chứa maTaiXe
        if (taiXeTheoXe && taiXeTheoXe.toString().indexOf(maTaiXe) !== -1) {
          shouldUpdate = true;
          break;
        }
      }

      // Nếu tìm thấy, cập nhật trạng thái
      if (shouldUpdate) {
        // Cập nhật giá trị trong sheet (row + 1 vì sheet bắt đầu từ 1)
        sheet.getRange(row + 1, trangThaiColIndex + 1).setValue(trang_thai_chuyen_di);
        updatedCount++;
        updatedRows.push(row + 1);

        Logger.log('Updated row ' + (row + 1) + ' - tai_xe_theo_xe: ' + taiXeTheoXe + ' - trang_thai: ' + trang_thai_chuyen_di);
      }
    }

    return {
      success: true,
      message: 'Updated ' + updatedCount + ' row(s)',
      updatedCount: updatedCount,
      updatedRows: updatedRows,
      ma_tai_xe: maTaiXeArray,
      trang_thai_chuyen_di: trang_thai_chuyen_di
    };

  } catch (error) {
    Logger.log('Error in updateVehicleStatus: ' + error);
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// Hàm test
function testFunction() {
  Logger.log('Test function executed successfully');
  return 'Success';
}

// Hàm test updateVehicleStatus
function testUpdateVehicleStatus() {
  var result = updateVehicleStatus(['LX216', 'LX215'], 'Đang giao hàng');
  Logger.log(JSON.stringify(result));
  return result;
}

// Hàm cập nhật tình trạng hoạt động phương tiện vào sheet doi_xe
function updateVehicleActivity(bien_kiem_soat, ngay_tao, so_luong_chuyen) {
  try {
    // Mở Google Sheets
    var spreadsheet = SpreadsheetApp.openById('18pS9YMZSwZCVBt_anIGn3GN4qFoPpMtALQm4YvMDd-g');
    var sheet = spreadsheet.getSheetByName('doi_xe');

    if (!sheet) {
      return {
        success: false,
        message: 'Sheet "doi_xe" not found'
      };
    }

    // Lấy tất cả dữ liệu từ sheet
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // Tìm index của các cột
    var bienKiemSoatColIndex = -1;
    var tinhTrangHoatDongColIndex = -1;

    for (var i = 0; i < headers.length; i++) {
      if (headers[i] === 'bien_kiem_soat') {
        bienKiemSoatColIndex = i;
      }
      if (headers[i] === 'tinh_trang_hoat_dong') {
        tinhTrangHoatDongColIndex = i;
      }
    }

    // Kiểm tra nếu không tìm thấy cột
    if (bienKiemSoatColIndex === -1 || tinhTrangHoatDongColIndex === -1) {
      return {
        success: false,
        message: 'Required columns not found. Looking for: bien_kiem_soat, tinh_trang_hoat_dong'
      };
    }

    // Tìm dòng có bien_kiem_soat tương ứng
    var targetRow = -1;
    for (var row = 1; row < data.length; row++) {
      var currentBienKiemSoat = data[row][bienKiemSoatColIndex];
      if (currentBienKiemSoat && currentBienKiemSoat.toString().trim() === bien_kiem_soat.toString().trim()) {
        targetRow = row;
        break;
      }
    }

    if (targetRow === -1) {
      return {
        success: false,
        message: 'Vehicle with bien_kiem_soat "' + bien_kiem_soat + '" not found'
      };
    }

    // Lấy giá trị hiện tại của tinh_trang_hoat_dong
    var currentValue = data[targetRow][tinhTrangHoatDongColIndex];
    var activityData = {};

    // Parse JSON nếu đã có dữ liệu
    if (currentValue && typeof currentValue === 'string' && currentValue.trim() !== '') {
      try {
        activityData = JSON.parse(currentValue);
      } catch (e) {
        Logger.log('Error parsing existing tinh_trang_hoat_dong: ' + e);
        activityData = {};
      }
    }

    // Cập nhật dữ liệu cho ngày tạo
    // Format ngay_tao về dạng DD/MM/YYYY nếu cần
    var dateKey = ngay_tao;
    if (dateKey.includes('-')) {
      // Convert from YYYY-MM-DD to DD/MM/YYYY
      var parts = dateKey.split('-');
      dateKey = parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    // Cập nhật hoặc thêm mới
    if (so_luong_chuyen > 0) {
      // Có hoạt động
      activityData[dateKey] = {
        so_luong_chuyen: so_luong_chuyen
      };
    } else {
      // Không có hoạt động
      activityData[dateKey] = {};
    }

    // Chuyển đổi object thành JSON string
    var jsonString = JSON.stringify(activityData);

    // Ghi vào sheet (row + 1 vì sheet bắt đầu từ 1)
    sheet.getRange(targetRow + 1, tinhTrangHoatDongColIndex + 1).setValue(jsonString);

    Logger.log('Updated vehicle activity - bien_kiem_soat: ' + bien_kiem_soat + ' - date: ' + dateKey + ' - trips: ' + so_luong_chuyen);

    return {
      success: true,
      message: 'Updated vehicle activity successfully',
      bien_kiem_soat: bien_kiem_soat,
      ngay_tao: dateKey,
      so_luong_chuyen: so_luong_chuyen,
      row: targetRow + 1
    };

  } catch (error) {
    Logger.log('Error in updateVehicleActivity: ' + error);
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// Hàm test updateVehicleActivity
function testUpdateVehicleActivity() {
  var result = updateVehicleActivity('51C-123.45', '10/12/2025', 5);
  Logger.log(JSON.stringify(result));
  return result;
}

// Hàm debug để kiểm tra cấu trúc sheet
function debugSheetStructure() {
  try {
    var spreadsheet = SpreadsheetApp.openById('1fzepYrS-o5zc01h7nQFzJSOwagoTvOgoiDQHrTLB12E');
    var sheet = spreadsheet.getSheetByName('phuong_tien');

    if (!sheet) {
      Logger.log('Sheet "phuong_tien" not found!');
      Logger.log('Available sheets: ' + spreadsheet.getSheets().map(s => s.getName()).join(', '));
      return;
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    Logger.log('=== SHEET HEADERS ===');
    Logger.log('Total columns: ' + headers.length);
    for (var i = 0; i < headers.length; i++) {
      Logger.log('Column ' + i + ': "' + headers[i] + '"');
    }

    Logger.log('\n=== FIRST 5 ROWS OF DATA ===');
    for (var row = 1; row <= Math.min(5, data.length - 1); row++) {
      Logger.log('\nRow ' + (row + 1) + ':');
      for (var col = 0; col < headers.length; col++) {
        Logger.log('  ' + headers[col] + ': "' + data[row][col] + '"');
      }
    }

    // Tìm cột tai_xe_theo_xe
    var taiXeColIndex = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] === 'tai_xe_theo_xe') {
        taiXeColIndex = i;
        break;
      }
    }

    if (taiXeColIndex !== -1) {
      Logger.log('\n=== ALL VALUES IN tai_xe_theo_xe COLUMN ===');
      for (var row = 1; row < data.length; row++) {
        var value = data[row][taiXeColIndex];
        Logger.log('Row ' + (row + 1) + ': "' + value + '"');
      }
    } else {
      Logger.log('\nColumn "tai_xe_theo_xe" NOT FOUND!');
    }

  } catch (error) {
    Logger.log('Error: ' + error);
  }
}

// ===== HÀM TẠO BÁO CÁO J&T TUYẾN NHANH =====

// Spreadsheet IDs
var SOURCE_SHEET_ID = '1fzepYrS-o5zc01h7nQFzJSOwagoTvOgoiDQHrTLB12E';
var TARGET_SHEET_ID = '18pS9YMZSwZCVBt_anIGn3GN4qFoPpMtALQm4YvMDd-g';

/**
 * Hàm truy vấn dữ liệu chuyến đi và tạo báo cáo dưới dạng Nested JSON Object
 * Cấu trúc: { "2025-11-27": { "Tuyến nhanh": { "29GQ2506": { chi_tiet_chuyen_di: [...], tong_chuyen: 2, ... } } } }
 * Truy vấn: data[ngay][loai_chuyen][bien_so]
 *
 * @param {string} sheetNameSource - Tên sheet nguồn (mặc định: "chi_tiet_chuyen_di")
 * @param {string} sheetNameTarget - Tên sheet đích (mặc định: "bao_cao_jnt_tuyen_nhanh")
 * @return {Object} Nested JSON object hoặc error object
 */
function createJNTReport(sheetNameSource, sheetNameTarget) {
  try {
    // Sử dụng giá trị mặc định nếu không truyền tham số
    var sourceSheetName = sheetNameSource || 'chi_tiet_chuyen_di';
    var targetSheetName = sheetNameTarget || 'bao_cao_jnt_tuyen_nhanh';

    Logger.log('=== BẮT ĐẦU TẠO BÁO CÁO J&T ===');
    Logger.log('Source: ' + SOURCE_SHEET_ID + ' / ' + sourceSheetName);
    Logger.log('Target: ' + TARGET_SHEET_ID + ' / ' + targetSheetName);

    // 1. Mở source spreadsheet
    var sourceSpreadsheet = SpreadsheetApp.openById(SOURCE_SHEET_ID);
    var sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetName);

    if (!sourceSheet) {
      throw new Error('Sheet "' + sourceSheetName + '" không tồn tại trong source spreadsheet');
    }

    // 2. Lấy dữ liệu từ source sheet
    var sourceData = sourceSheet.getDataRange().getValues();

    if (sourceData.length <= 1) {
      Logger.log('Không có dữ liệu để xử lý');
      return {
        success: false,
        message: 'Không có dữ liệu trong sheet nguồn'
      };
    }

    var headers = sourceData[0];
    Logger.log('Headers: ' + headers.join(', '));

    // 3. Tìm index của các cột cần thiết
    var colIndexes = findColumnIndexes(headers, [
      'ngay_chuyen_di',
      'bien_kiem_soat',
      'ma_chuyen_di_kh',
      'lo_trinh_chi_tiet_theo_diem',
      'tai_trong_tinh_phi',
      'loai_ca',
      'ma_khach_hang',
      'loai_chuyen',
      'lo_trinh_doi_soat'
    ]);

    // Kiểm tra các cột bắt buộc
    var missingCols = [];
    for (var key in colIndexes) {
      if (colIndexes[key] === -1) {
        missingCols.push(key);
      }
    }

    if (missingCols.length > 0) {
      throw new Error('Không tìm thấy các cột: ' + missingCols.join(', '));
    }

    Logger.log('Column indexes: ' + JSON.stringify(colIndexes));

    // 4. Tạo Nested JSON Object
    var reportData = buildNestedReportData(sourceData, colIndexes);

    Logger.log('Đã xử lý ' + Object.keys(reportData).length + ' ngày');

    // Đếm tổng số xe và loại chuyến
    var totalVehicles = 0;
    var totalTripTypes = 0;
    for (var date in reportData) {
      for (var loaiChuyen in reportData[date]) {
        totalTripTypes++;
        totalVehicles += Object.keys(reportData[date][loaiChuyen]).length;
      }
    }
    Logger.log('Tổng số loại chuyến: ' + totalTripTypes);
    Logger.log('Tổng số xe: ' + totalVehicles);

    // 5. Ghi dữ liệu vào target sheet
    var writeResult = writeReportToSheet(reportData, targetSheetName);

    Logger.log('=== HOÀN THÀNH TẠO BÁO CÁO ===');

    return {
      success: true,
      message: 'Tạo báo cáo thành công',
      stats: {
        totalDays: Object.keys(reportData).length,
        totalTripTypes: totalTripTypes,
        totalVehicles: totalVehicles,
        rowsWritten: writeResult.rowsWritten
      },
      data: reportData
    };

  } catch (error) {
    Logger.log('ERROR in createJNTReport: ' + error.toString());
    return {
      success: false,
      message: 'Lỗi: ' + error.toString()
    };
  }
}

/**
 * Tìm index của các cột trong header
 * @param {Array} headers - Mảng header
 * @param {Array} columnNames - Mảng tên cột cần tìm
 * @return {Object} Object chứa index của từng cột
 */
function findColumnIndexes(headers, columnNames) {
  var indexes = {};

  for (var i = 0; i < columnNames.length; i++) {
    var colName = columnNames[i];
    indexes[colName] = -1;

    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === colName) {
        indexes[colName] = j;
        break;
      }
    }
  }

  return indexes;
}

/**
 * Xây dựng Nested JSON Object từ dữ liệu
 * @param {Array} data - Dữ liệu từ sheet
 * @param {Object} colIndexes - Index của các cột
 * @return {Object} Nested object: {date: {loai_chuyen: {bien_so: {chi_tiet}}}}
 */
function buildNestedReportData(data, colIndexes) {
  var reportData = {};

  // Duyệt qua từng dòng (bỏ qua header)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Lấy giá trị các cột
    var ngayChuyen = row[colIndexes.ngay_chuyen_di];
    var bienSo = row[colIndexes.bien_kiem_soat];
    var maTem = row[colIndexes.ma_chuyen_di_kh];
    var diemDiDen = row[colIndexes.lo_trinh_chi_tiet_theo_diem];
    var theTich = row[colIndexes.tai_trong_tinh_phi];
    var loaiCa = row[colIndexes.loai_ca];
    var maKhachHang = row[colIndexes.ma_khach_hang];
    var loaiChuyen = row[colIndexes.loai_chuyen];
    var loTrinhDoiSoat = colIndexes.lo_trinh_doi_soat !== -1 ? row[colIndexes.lo_trinh_doi_soat] : '';

    // Bỏ qua dòng không có ngày hoặc biển số
    if (!ngayChuyen || !bienSo) {
      continue;
    }

    // Điều kiện lọc: chỉ lấy dữ liệu của khách hàng KH001
    if (!maKhachHang || maKhachHang.toString().trim() !== 'KH001') {
      continue;
    }

    // Format ngày về dạng YYYY-MM-DD
    var dateKey = formatDateKey(ngayChuyen);

    // Format biển số (trim whitespace)
    var bienSoKey = bienSo.toString().trim();

    // Format loại chuyến (trim, nếu rỗng thì dùng "Khác")
    var loaiChuyenKey = (loaiChuyen && loaiChuyen.toString().trim()) || 'Khác';

    // Khởi tạo object cho ngày nếu chưa có
    if (!reportData[dateKey]) {
      reportData[dateKey] = {};
    }

    // Khởi tạo object cho loại chuyến nếu chưa có
    if (!reportData[dateKey][loaiChuyenKey]) {
      reportData[dateKey][loaiChuyenKey] = {};
    }

    // Khởi tạo object cho xe nếu chưa có
    if (!reportData[dateKey][loaiChuyenKey][bienSoKey]) {
      reportData[dateKey][loaiChuyenKey][bienSoKey] = {
        bien_so: bienSoKey,
        ngay: dateKey,
        loai_chuyen: loaiChuyenKey,
        chi_tiet_chuyen_di: [],
        tong_chuyen: 0,
        tong_the_tich: 0
      };
    }

    // Giữ nguyên ma_tem dưới dạng chuỗi (không parse) để frontend tự xử lý split
    var maTemStr = maTem ? maTem.toString().trim() : '';

    // Parse điểm đi - điểm đến
    var diemDiDenParsed = parseRouteDetail(diemDiDen);

    // Thêm chi tiết chuyến đi
    reportData[dateKey][loaiChuyenKey][bienSoKey].chi_tiet_chuyen_di.push({
      ma_tem: maTemStr,
      diem_di_diem_den: diemDiDenParsed,
      the_tich: theTich || '',
      loai_ca: loaiCa || '',
      lo_trinh_doi_soat: loTrinhDoiSoat || ''
    });

    // Cập nhật tổng số chuyến
    reportData[dateKey][loaiChuyenKey][bienSoKey].tong_chuyen += 1;

    // Cập nhật tổng thể tích (nếu là số)
    if (typeof theTich === 'number') {
      reportData[dateKey][loaiChuyenKey][bienSoKey].tong_the_tich += theTich;
    } else if (typeof theTich === 'string') {
      var numValue = parseFloat(theTich.replace(/[^\d.-]/g, ''));
      if (!isNaN(numValue)) {
        reportData[dateKey][loaiChuyenKey][bienSoKey].tong_the_tich += numValue;
      }
    }
  }

  return reportData;
}

/**
 * Format ngày về dạng YYYY-MM-DD
 * @param {Date|string} dateValue - Giá trị ngày
 * @return {string} Ngày dạng YYYY-MM-DD
 */
function formatDateKey(dateValue) {
  if (dateValue instanceof Date) {
    return Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } else if (typeof dateValue === 'string') {
    // Nếu đã là string, kiểm tra format
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      var parts = dateValue.split('/');
      return parts[2] + '-' + parts[1] + '-' + parts[0];
    }
  }
  return dateValue.toString();
}

/**
 * Parse giá trị có thể chứa nhiều item (ngăn cách bởi dấu phẩy)
 * @param {string} value - Giá trị cần parse
 * @return {Array} Mảng các giá trị
 */
function parseMultipleValues(value) {
  if (!value) return [];

  var strValue = value.toString().trim();
  if (!strValue) return [];

  // Split bởi dấu phẩy và trim từng phần tử
  return strValue.split(',').map(function(item) {
    return item.trim();
  }).filter(function(item) {
    return item !== '';
  });
}

/**
 * Parse chi tiết lộ trình theo điểm
 * @param {string} routeDetail - Chi tiết lộ trình
 * @return {string} Chuỗi gốc (không parse)
 */
function parseRouteDetail(routeDetail) {
  if (!routeDetail) return '';

  var strValue = routeDetail.toString().trim();
  return strValue;
}

/**
 * Ghi dữ liệu báo cáo vào target sheet
 * @param {Object} reportData - Nested JSON object
 * @param {string} targetSheetName - Tên sheet đích
 * @return {Object} Kết quả ghi dữ liệu
 */
function writeReportToSheet(reportData, targetSheetName) {
  try {
    var targetSpreadsheet = SpreadsheetApp.openById(TARGET_SHEET_ID);
    var targetSheet = targetSpreadsheet.getSheetByName(targetSheetName);

    // Tạo sheet mới nếu chưa có
    if (!targetSheet) {
      targetSheet = targetSpreadsheet.insertSheet(targetSheetName);
      Logger.log('Đã tạo sheet mới: ' + targetSheetName);
    }

    // Clear dữ liệu cũ
    targetSheet.clear();

    // Tạo header
    var headers = [
      'ngay',
      'loai_chuyen',
      'bien_so',
      'chi_tiet_chuyen_di',
      'tong_chuyen',
      'tong_the_tich'
    ];

    // Ghi header
    targetSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    targetSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // Chuyển nested object thành array để ghi
    var rowsToWrite = [];

    for (var date in reportData) {
      for (var loaiChuyen in reportData[date]) {
        for (var bienSo in reportData[date][loaiChuyen]) {
          var vehicleData = reportData[date][loaiChuyen][bienSo];

          rowsToWrite.push([
            vehicleData.ngay,
            vehicleData.loai_chuyen,
            vehicleData.bien_so,
            JSON.stringify(vehicleData.chi_tiet_chuyen_di),
            vehicleData.tong_chuyen,
            vehicleData.tong_the_tich
          ]);
        }
      }
    }

    // Ghi dữ liệu
    if (rowsToWrite.length > 0) {
      targetSheet.getRange(2, 1, rowsToWrite.length, headers.length).setValues(rowsToWrite);
      Logger.log('Đã ghi ' + rowsToWrite.length + ' dòng vào sheet');
    }

    // Format sheet
    targetSheet.autoResizeColumns(1, headers.length);

    return {
      success: true,
      rowsWritten: rowsToWrite.length
    };

  } catch (error) {
    Logger.log('ERROR in writeReportToSheet: ' + error.toString());
    throw error;
  }
}

/**
 * Hàm test tạo báo cáo J&T
 */
function testCreateJNTReport() {
  var result = createJNTReport('chi_tiet_chuyen_di', 'bao_cao_jnt_tuyen_nhanh');
  Logger.log('=== KẾT QUẢ TEST ===');
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

// ===== HÀM TẠO BÁO CÁO GHN =====

/**
 * Hàm truy vấn dữ liệu chuyến đi và tạo báo cáo GHN dưới dạng Nested JSON Object
 * Cấu trúc: { "2025-11-27": { "Tuyến nhanh": { "29GQ2506": { chi_tiet_chuyen_di: [...], tong_chuyen: 2, ... } } } }
 * Truy vấn: data[ngay][loai_tuyen_khach_hang][bien_so]
 *
 * @param {string} sheetNameSource - Tên sheet nguồn (mặc định: "chi_tiet_chuyen_di")
 * @param {string} sheetNameTarget - Tên sheet đích (mặc định: "bao_cao_ghn")
 * @return {Object} Nested JSON object hoặc error object
 */
function createGHNReport(sheetNameSource, sheetNameTarget) {
  try {
    // Sử dụng giá trị mặc định nếu không truyền tham số
    var sourceSheetName = sheetNameSource || 'chi_tiet_chuyen_di';
    var targetSheetName = sheetNameTarget || 'bao_cao_ghn';

    Logger.log('=== BẮT ĐẦU TẠO BÁO CÁO GHN ===');
    Logger.log('Source: ' + SOURCE_SHEET_ID + ' / ' + sourceSheetName);
    Logger.log('Target: ' + TARGET_SHEET_ID + ' / ' + targetSheetName);

    // 1. Mở source spreadsheet
    var sourceSpreadsheet = SpreadsheetApp.openById(SOURCE_SHEET_ID);
    var sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetName);

    if (!sourceSheet) {
      throw new Error('Sheet "' + sourceSheetName + '" không tồn tại trong source spreadsheet');
    }

    // 2. Lấy dữ liệu từ source sheet
    var sourceData = sourceSheet.getDataRange().getValues();

    if (sourceData.length <= 1) {
      Logger.log('Không có dữ liệu để xử lý');
      return {
        success: false,
        message: 'Không có dữ liệu trong sheet nguồn'
      };
    }

    var headers = sourceData[0];
    Logger.log('Headers: ' + headers.join(', '));

    // 3. Tìm index của các cột cần thiết
    var colIndexes = findColumnIndexes(headers, [
      'ngay_chuyen_di',
      'bien_kiem_soat',
      'loai_chuyen',
      'tai_trong_tinh_phi',
      'hinh_thuc_tinh_gia',
      'lo_trinh',
      'lo_trinh_chi_tiet_theo_diem',
      'quang_duong',
      'don_gia',
      'ma_chuyen_di_kh',
      'ma_khach_hang',
      'ten_khach_hang_cap_1'
    ]);

    // Kiểm tra các cột bắt buộc
    var requiredCols = ['ngay_chuyen_di', 'bien_kiem_soat', 'loai_chuyen'];
    var missingCols = [];
    for (var i = 0; i < requiredCols.length; i++) {
      if (colIndexes[requiredCols[i]] === -1) {
        missingCols.push(requiredCols[i]);
      }
    }

    if (missingCols.length > 0) {
      throw new Error('Không tìm thấy các cột bắt buộc: ' + missingCols.join(', '));
    }

    Logger.log('Column indexes: ' + JSON.stringify(colIndexes));

    // 4. Tạo Nested JSON Object
    var reportData = buildGHNReportData(sourceData, colIndexes);

    Logger.log('Đã xử lý ' + Object.keys(reportData).length + ' ngày');

    // Đếm tổng số xe và loại tuyến
    var totalVehicles = 0;
    var totalTripTypes = 0;
    for (var date in reportData) {
      for (var loaiTuyen in reportData[date]) {
        totalTripTypes++;
        totalVehicles += Object.keys(reportData[date][loaiTuyen]).length;
      }
    }
    Logger.log('Tổng số loại tuyến: ' + totalTripTypes);
    Logger.log('Tổng số xe: ' + totalVehicles);

    // 5. Ghi dữ liệu vào target sheet
    var writeResult = writeGHNReportToSheet(reportData, targetSheetName);

    Logger.log('=== HOÀN THÀNH TẠO BÁO CÁO GHN ===');

    return {
      success: true,
      message: 'Tạo báo cáo GHN thành công',
      stats: {
        totalDays: Object.keys(reportData).length,
        totalTripTypes: totalTripTypes,
        totalVehicles: totalVehicles,
        rowsWritten: writeResult.rowsWritten
      },
      data: reportData
    };

  } catch (error) {
    Logger.log('ERROR in createGHNReport: ' + error.toString());
    return {
      success: false,
      message: 'Lỗi: ' + error.toString()
    };
  }
}

/**
 * Xây dựng Nested JSON Object từ dữ liệu cho báo cáo GHN
 * @param {Array} data - Dữ liệu từ sheet
 * @param {Object} colIndexes - Index của các cột
 * @return {Object} Nested object: {date: {loai_chuyen: {bien_so: {chi_tiet}}}}
 */
function buildGHNReportData(data, colIndexes) {
  var reportData = {};

  // Duyệt qua từng dòng (bỏ qua header)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Lấy giá trị các cột key chính
    var ngayChuyen = row[colIndexes.ngay_chuyen_di];
    var bienSo = row[colIndexes.bien_kiem_soat];
    var loaiChuyen = row[colIndexes.loai_chuyen];

    // Lấy giá trị chi tiết chuyến đi
    var taiTrong = colIndexes.tai_trong_tinh_phi !== -1 ? row[colIndexes.tai_trong_tinh_phi] : '';
    var hinhThucTinhGia = colIndexes.hinh_thuc_tinh_gia !== -1 ? row[colIndexes.hinh_thuc_tinh_gia] : '';
    var loTrinh = colIndexes.lo_trinh !== -1 ? row[colIndexes.lo_trinh] : '';
    var loTrinhChiTiet = colIndexes.lo_trinh_chi_tiet_theo_diem !== -1 ? row[colIndexes.lo_trinh_chi_tiet_theo_diem] : '';
    var quangDuong = colIndexes.quang_duong !== -1 ? row[colIndexes.quang_duong] : '';
    var donGia = colIndexes.don_gia !== -1 ? row[colIndexes.don_gia] : '';
    var maChuyen = colIndexes.ma_chuyen_di_kh !== -1 ? row[colIndexes.ma_chuyen_di_kh] : '';
    var maKhachHang = colIndexes.ma_khach_hang !== -1 ? row[colIndexes.ma_khach_hang] : '';
    var tenKhachHangCap1 = colIndexes.ten_khach_hang_cap_1 !== -1 ? row[colIndexes.ten_khach_hang_cap_1] : '';

    // Bỏ qua dòng không có ngày hoặc biển số
    if (!ngayChuyen || !bienSo) {
      continue;
    }

    // Điều kiện lọc: chỉ lấy dữ liệu của khách hàng KH002
    if (!maKhachHang || maKhachHang.toString().trim() !== 'KH002') {
      continue;
    }

    // Format ngày về dạng YYYY-MM-DD
    var dateKey = formatDateKey(ngayChuyen);

    // Format biển số (trim whitespace)
    var bienSoKey = bienSo.toString().trim();

    // Format loại chuyến (trim, nếu rỗng thì dùng "Khác")
    var loaiChuyenKey = (loaiChuyen && loaiChuyen.toString().trim()) || 'Khác';

    // Khởi tạo object cho ngày nếu chưa có
    if (!reportData[dateKey]) {
      reportData[dateKey] = {};
    }

    // Khởi tạo object cho loại chuyến nếu chưa có
    if (!reportData[dateKey][loaiChuyenKey]) {
      reportData[dateKey][loaiChuyenKey] = {};
    }

    // Khởi tạo object cho xe nếu chưa có
    if (!reportData[dateKey][loaiChuyenKey][bienSoKey]) {
      reportData[dateKey][loaiChuyenKey][bienSoKey] = {
        bien_so: bienSoKey,
        ngay: dateKey,
        loai_chuyen: loaiChuyenKey,
        chi_tiet_chuyen_di: [],
        tong_chuyen: 0,
        tong_quang_duong: 0,
        tong_tai_trong: 0
      };
    }

    // Parse lộ trình chi tiết theo điểm
    var loTrinhChiTietParsed = parseRouteDetail(loTrinhChiTiet);

    // Parse mã chuyến (có thể là nhiều giá trị)
    var maChuyens = parseMultipleValues(maChuyen);

    // Thêm chi tiết chuyến đi
    reportData[dateKey][loaiChuyenKey][bienSoKey].chi_tiet_chuyen_di.push({
      tai_trong_tinh_phi: taiTrong || '',
      hinh_thuc_tinh_gia: hinhThucTinhGia || '',
      lo_trinh: loTrinh || '',
      lo_trinh_chi_tiet_theo_diem: loTrinhChiTietParsed,
      quang_duong: quangDuong || '',
      don_gia: donGia || '',
      ma_chuyen_di_kh: maChuyens,
      ten_khach_hang_cap_1: tenKhachHangCap1 || ''
    });

    // Cập nhật tổng số chuyến
    reportData[dateKey][loaiChuyenKey][bienSoKey].tong_chuyen += 1;

    // Cập nhật tổng quãng đường (nếu là số)
    if (typeof quangDuong === 'number') {
      reportData[dateKey][loaiChuyenKey][bienSoKey].tong_quang_duong += quangDuong;
    } else if (typeof quangDuong === 'string' && quangDuong) {
      var numValue = parseFloat(quangDuong.replace(/[^\d.-]/g, ''));
      if (!isNaN(numValue)) {
        reportData[dateKey][loaiChuyenKey][bienSoKey].tong_quang_duong += numValue;
      }
    }

    // Cập nhật tổng tải trọng (nếu là số)
    if (typeof taiTrong === 'number') {
      reportData[dateKey][loaiChuyenKey][bienSoKey].tong_tai_trong += taiTrong;
    } else if (typeof taiTrong === 'string' && taiTrong) {
      var numValue = parseFloat(taiTrong.replace(/[^\d.-]/g, ''));
      if (!isNaN(numValue)) {
        reportData[dateKey][loaiChuyenKey][bienSoKey].tong_tai_trong += numValue;
      }
    }
  }

  return reportData;
}

/**
 * Ghi dữ liệu báo cáo GHN vào target sheet
 * @param {Object} reportData - Nested JSON object
 * @param {string} targetSheetName - Tên sheet đích
 * @return {Object} Kết quả ghi dữ liệu
 */
function writeGHNReportToSheet(reportData, targetSheetName) {
  try {
    var targetSpreadsheet = SpreadsheetApp.openById(TARGET_SHEET_ID);
    var targetSheet = targetSpreadsheet.getSheetByName(targetSheetName);

    // Tạo sheet mới nếu chưa có
    if (!targetSheet) {
      targetSheet = targetSpreadsheet.insertSheet(targetSheetName);
      Logger.log('Đã tạo sheet mới: ' + targetSheetName);
    }

    // Clear dữ liệu cũ
    targetSheet.clear();

    // Tạo header
    var headers = [
      'ngay',
      'loai_chuyen',
      'bien_so',
      'chi_tiet_chuyen_di',
      'tong_chuyen',
      'tong_quang_duong',
      'tong_tai_trong'
    ];

    // Ghi header
    targetSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    targetSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // Chuyển nested object thành array để ghi
    var rowsToWrite = [];

    for (var date in reportData) {
      for (var loaiChuyen in reportData[date]) {
        for (var bienSo in reportData[date][loaiChuyen]) {
          var vehicleData = reportData[date][loaiChuyen][bienSo];

          rowsToWrite.push([
            vehicleData.ngay,
            vehicleData.loai_chuyen,
            vehicleData.bien_so,
            JSON.stringify(vehicleData.chi_tiet_chuyen_di),
            vehicleData.tong_chuyen,
            vehicleData.tong_quang_duong,
            vehicleData.tong_tai_trong
          ]);
        }
      }
    }

    // Ghi dữ liệu
    if (rowsToWrite.length > 0) {
      targetSheet.getRange(2, 1, rowsToWrite.length, headers.length).setValues(rowsToWrite);
      Logger.log('Đã ghi ' + rowsToWrite.length + ' dòng vào sheet');
    }

    // Format sheet
    targetSheet.autoResizeColumns(1, headers.length);

    return {
      success: true,
      rowsWritten: rowsToWrite.length
    };

  } catch (error) {
    Logger.log('ERROR in writeGHNReportToSheet: ' + error.toString());
    throw error;
  }
}

/**
 * Hàm test tạo báo cáo GHN
 */
function testCreateGHNReport() {
  var result = createGHNReport('chi_tiet_chuyen_di', 'bao_cao_ghn');
  Logger.log('=== KẾT QUẢ TEST GHN ===');
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
