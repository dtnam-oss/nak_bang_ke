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

// Hàm test
function testFunction() {
  Logger.log('Test function executed successfully');
  return 'Success';
}
