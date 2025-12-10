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

    // Lấy parameters
    var ma_tai_xe = requestData.ma_tai_xe; // Có thể là string hoặc array
    var trang_thai_chuyen_di = requestData.trang_thai_chuyen_di;

    // Kiểm tra dữ liệu đầu vào
    if (!ma_tai_xe || !trang_thai_chuyen_di) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Missing required parameters: ma_tai_xe or trang_thai_chuyen_di'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Cập nhật trạng thái phương tiện
    var result = updateVehicleStatus(ma_tai_xe, trang_thai_chuyen_di);

    return ContentService
      .createTextOutput(JSON.stringify(result))
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
