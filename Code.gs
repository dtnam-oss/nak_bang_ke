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
