/**
 * TEST QUERY - Debug các trường dữ liệu
 * Chạy function này trong Apps Script Editor để test
 */

function testDataFields() {
  var table = 'nakvi-476804.nak_logistics.tb_chuyen_di';

  // Test 1: Kiểm tra NULL values trong các trường quan trọng
  var query1 = `
    SELECT
      COUNT(*) as total_rows,
      COUNT(DISTINCT loai_tuyen_khach_hang) as distinct_loai_tuyen_khach_hang,
      COUNT(DISTINCT loai_tuyen) as distinct_loai_tuyen,
      COUNTIF(loai_tuyen_khach_hang IS NULL) as null_loai_tuyen_khach_hang,
      COUNTIF(loai_tuyen IS NULL) as null_loai_tuyen,
      COUNTIF(bien_kiem_soat IS NULL) as null_bien_kiem_soat,
      COUNTIF(ten_khach_hang IS NULL) as null_ten_khach_hang,
      COUNTIF(ma_khach_hang IS NULL) as null_ma_khach_hang
    FROM \`${table}\`
  `;

  Logger.log('=== TEST 1: NULL VALUES CHECK ===');
  try {
    var result1 = BigQuery.Jobs.query({
      query: query1,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result1.rows && result1.rows.length > 0) {
      var row = result1.rows[0];
      Logger.log('Total rows: ' + row.f[0].v);
      Logger.log('Distinct loai_tuyen_khach_hang: ' + row.f[1].v);
      Logger.log('Distinct loai_tuyen: ' + row.f[2].v);
      Logger.log('NULL loai_tuyen_khach_hang: ' + row.f[3].v);
      Logger.log('NULL loai_tuyen: ' + row.f[4].v);
      Logger.log('NULL bien_kiem_soat: ' + row.f[5].v);
      Logger.log('NULL ten_khach_hang: ' + row.f[6].v);
      Logger.log('NULL ma_khach_hang: ' + row.f[7].v);
    }
  } catch (error) {
    Logger.log('Error in query1: ' + error);
  }

  // Test 2: Lấy sample data từ các trường
  var query2 = `
    SELECT
      loai_tuyen_khach_hang,
      loai_tuyen,
      bien_kiem_soat,
      ten_khach_hang,
      ma_khach_hang,
      doanh_thu
    FROM \`${table}\`
    WHERE doanh_thu > 0
    LIMIT 5
  `;

  Logger.log('\n=== TEST 2: SAMPLE DATA ===');
  try {
    var result2 = BigQuery.Jobs.query({
      query: query2,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result2.rows) {
      result2.rows.forEach(function(row, index) {
        Logger.log('\nRow ' + (index + 1) + ':');
        Logger.log('  loai_tuyen_khach_hang: ' + row.f[0].v);
        Logger.log('  loai_tuyen: ' + row.f[1].v);
        Logger.log('  bien_kiem_soat: ' + row.f[2].v);
        Logger.log('  ten_khach_hang: ' + row.f[3].v);
        Logger.log('  ma_khach_hang: ' + row.f[4].v);
        Logger.log('  doanh_thu: ' + row.f[5].v);
      });
    }
  } catch (error) {
    Logger.log('Error in query2: ' + error);
  }

  // Test 3: Test các queries hiện tại
  Logger.log('\n=== TEST 3: CURRENT QUERIES ===');

  // Test với filter NGÀY HÔM NAY
  var today = new Date();
  var todayStr = Utilities.formatDate(today, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  Logger.log('Testing with today date: ' + todayStr);

  // Test TOP CUSTOMERS query WITH TODAY FILTER
  var query3 = `
    SELECT
      ma_khach_hang,
      ten_khach_hang,
      COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
      ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
    FROM \`${table}\`
    WHERE DATE(ngay_tao) = DATE('${todayStr}')
    GROUP BY ma_khach_hang, ten_khach_hang
    ORDER BY tong_doanh_thu DESC
    LIMIT 5
  `;

  Logger.log('\nTop Customers Query (TODAY):');
  try {
    var result3 = BigQuery.Jobs.query({
      query: query3,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result3.rows) {
      Logger.log('Found ' + result3.rows.length + ' customers for today');
      result3.rows.forEach(function(row, index) {
        Logger.log('  #' + (index + 1) + ': ' + row.f[1].v + ' - ' + row.f[3].v + ' VND');
      });
    } else {
      Logger.log('NO DATA RETURNED for today!');
    }
  } catch (error) {
    Logger.log('Error: ' + error);
  }

  // Test TOP CUSTOMERS query WITHOUT DATE FILTER
  var query3_nofilter = `
    SELECT
      ma_khach_hang,
      ten_khach_hang,
      COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
      ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
    FROM \`${table}\`
    WHERE 1=1
    GROUP BY ma_khach_hang, ten_khach_hang
    ORDER BY tong_doanh_thu DESC
    LIMIT 5
  `;

  Logger.log('\nTop Customers Query (NO FILTER - ALL TIME):');
  try {
    var result3_nf = BigQuery.Jobs.query({
      query: query3_nofilter,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result3_nf.rows) {
      Logger.log('Found ' + result3_nf.rows.length + ' customers (all time)');
      result3_nf.rows.forEach(function(row, index) {
        Logger.log('  #' + (index + 1) + ': ' + row.f[1].v + ' - ' + row.f[3].v + ' VND');
      });
    }
  } catch (error) {
    Logger.log('Error: ' + error);
  }

  // Test TOP ROUTES query
  var query4 = `
    SELECT
      loai_tuyen_khach_hang as tuyen,
      COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
      ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
    FROM \`${table}\`
    WHERE 1=1
      AND loai_tuyen_khach_hang IS NOT NULL
    GROUP BY loai_tuyen_khach_hang
    ORDER BY tong_doanh_thu DESC
    LIMIT 5
  `;

  Logger.log('\nTop Routes Query (using loai_tuyen_khach_hang):');
  try {
    var result4 = BigQuery.Jobs.query({
      query: query4,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result4.rows) {
      Logger.log('Found ' + result4.rows.length + ' routes');
      result4.rows.forEach(function(row, index) {
        Logger.log('  #' + (index + 1) + ': ' + row.f[0].v + ' - ' + row.f[2].v + ' VND');
      });
    }
  } catch (error) {
    Logger.log('Error: ' + error);
  }

  // Test với loai_tuyen thay vì loai_tuyen_khach_hang
  var query5 = `
    SELECT
      loai_tuyen as tuyen,
      COUNT(DISTINCT ma_chuyen_di) as so_chuyen,
      ROUND(SUM(doanh_thu), 0) as tong_doanh_thu
    FROM \`${table}\`
    WHERE 1=1
      AND loai_tuyen IS NOT NULL
    GROUP BY loai_tuyen
    ORDER BY tong_doanh_thu DESC
    LIMIT 5
  `;

  Logger.log('\nTop Routes Query (using loai_tuyen):');
  try {
    var result5 = BigQuery.Jobs.query({
      query: query5,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result5.rows) {
      Logger.log('Found ' + result5.rows.length + ' routes');
      result5.rows.forEach(function(row, index) {
        Logger.log('  #' + (index + 1) + ': ' + row.f[0].v + ' - ' + row.f[2].v + ' VND');
      });
    }
  } catch (error) {
    Logger.log('Error: ' + error);
  }

  Logger.log('\n=== TEST COMPLETED ===');
}
