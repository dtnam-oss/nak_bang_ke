/**
 * DEBUG QUERY - Kiểm tra dữ liệu trong database
 * Chạy function này để kiểm tra có data hay không
 */

function debugCheckData() {
  var table = 'nakvi-476804.nak_logistics.tb_chuyen_di';

  Logger.log('=== DEBUG: CHECKING DATABASE DATA ===\n');

  // 0. Check kiểu dữ liệu và format của ngay_tao
  Logger.log('0. CHECKING ngay_tao FORMAT:');
  var query0 = `
    SELECT
      ngay_tao,
      CAST(ngay_tao AS STRING) as string_value,
      DATE(ngay_tao) as date_parsed,
      FORMAT_DATE('%Y-%m-%d', DATE(ngay_tao)) as formatted_date
    FROM \`${table}\`
    LIMIT 5
  `;

  try {
    var result0 = BigQuery.Jobs.query({
      query: query0,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result0.rows) {
      result0.rows.forEach(function(row, index) {
        Logger.log('  Row ' + (index + 1) + ':');
        Logger.log('    Raw value: ' + row.f[0].v);
        Logger.log('    As string: ' + row.f[1].v);
        Logger.log('    Parsed as DATE: ' + row.f[2].v);
        Logger.log('    Formatted: ' + row.f[3].v);
      });
    }
  } catch (error) {
    Logger.log('  Error checking date format: ' + error);
  }

  Logger.log('\n');

  // 1. Check tổng số records
  var query1 = `
    SELECT
      COUNT(*) as total_records,
      MIN(DATE(ngay_tao)) as earliest_date,
      MAX(DATE(ngay_tao)) as latest_date
    FROM \`${table}\`
  `;

  Logger.log('1. TOTAL RECORDS AND DATE RANGE:');
  try {
    var result1 = BigQuery.Jobs.query({
      query: query1,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result1.rows && result1.rows.length > 0) {
      var row = result1.rows[0];
      Logger.log('  Total records: ' + row.f[0].v);
      Logger.log('  Earliest date: ' + row.f[1].v);
      Logger.log('  Latest date: ' + row.f[2].v);
    }
  } catch (error) {
    Logger.log('  Error: ' + error);
  }

  // 2. Check data trong tuần này
  var today = new Date();
  var todayStr = Utilities.formatDate(today, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');

  var query2 = `
    SELECT
      COUNT(*) as records_this_week,
      COUNT(DISTINCT ma_khach_hang) as customers,
      COUNT(DISTINCT bien_kiem_soat) as vehicles,
      ROUND(SUM(doanh_thu), 0) as revenue
    FROM \`${table}\`
    WHERE DATE_TRUNC(DATE(ngay_tao), WEEK) = DATE_TRUNC(DATE('${todayStr}'), WEEK)
  `;

  Logger.log('\n2. DATA FOR THIS WEEK (${todayStr}):');
  try {
    var result2 = BigQuery.Jobs.query({
      query: query2,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result2.rows && result2.rows.length > 0) {
      var row = result2.rows[0];
      Logger.log('  Records this week: ' + row.f[0].v);
      Logger.log('  Customers: ' + row.f[1].v);
      Logger.log('  Vehicles: ' + row.f[2].v);
      Logger.log('  Revenue: ' + row.f[3].v);
    }
  } catch (error) {
    Logger.log('  Error: ' + error);
  }

  // 3. Check data hôm nay
  var query3 = `
    SELECT
      COUNT(*) as records_today,
      COUNT(DISTINCT ma_khach_hang) as customers,
      COUNT(DISTINCT bien_kiem_soat) as vehicles,
      ROUND(SUM(doanh_thu), 0) as revenue
    FROM \`${table}\`
    WHERE DATE(ngay_tao) = DATE('${todayStr}')
  `;

  Logger.log('\n3. DATA FOR TODAY (${todayStr}):');
  try {
    var result3 = BigQuery.Jobs.query({
      query: query3,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result3.rows && result3.rows.length > 0) {
      var row = result3.rows[0];
      Logger.log('  Records today: ' + row.f[0].v);
      Logger.log('  Customers: ' + row.f[1].v);
      Logger.log('  Vehicles: ' + row.f[2].v);
      Logger.log('  Revenue: ' + row.f[3].v);
    }
  } catch (error) {
    Logger.log('  Error: ' + error);
  }

  // 4. Check data tháng này
  var query4 = `
    SELECT
      COUNT(*) as records_this_month,
      COUNT(DISTINCT ma_khach_hang) as customers,
      COUNT(DISTINCT bien_kiem_soat) as vehicles,
      ROUND(SUM(doanh_thu), 0) as revenue
    FROM \`${table}\`
    WHERE DATE_TRUNC(DATE(ngay_tao), MONTH) = DATE_TRUNC(DATE('${todayStr}'), MONTH)
  `;

  Logger.log('\n4. DATA FOR THIS MONTH (${todayStr}):');
  try {
    var result4 = BigQuery.Jobs.query({
      query: query4,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result4.rows && result4.rows.length > 0) {
      var row = result4.rows[0];
      Logger.log('  Records this month: ' + row.f[0].v);
      Logger.log('  Customers: ' + row.f[1].v);
      Logger.log('  Vehicles: ' + row.f[2].v);
      Logger.log('  Revenue: ' + row.f[3].v);
    }
  } catch (error) {
    Logger.log('  Error: ' + error);
  }

  // 5. Lấy sample 5 records gần nhất
  var query5 = `
    SELECT
      ngay_tao,
      ma_khach_hang,
      ten_khach_hang,
      bien_kiem_soat,
      loai_tuyen_khach_hang,
      doanh_thu
    FROM \`${table}\`
    ORDER BY ngay_tao DESC
    LIMIT 5
  `;

  Logger.log('\n5. LATEST 5 RECORDS:');
  try {
    var result5 = BigQuery.Jobs.query({
      query: query5,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result5.rows) {
      result5.rows.forEach(function(row, index) {
        Logger.log('  Record #' + (index + 1) + ':');
        Logger.log('    Date: ' + row.f[0].v);
        Logger.log('    Customer: ' + row.f[2].v + ' (' + row.f[1].v + ')');
        Logger.log('    Vehicle: ' + row.f[3].v);
        Logger.log('    Route: ' + row.f[4].v);
        Logger.log('    Revenue: ' + row.f[5].v);
        Logger.log('');
      });
    }
  } catch (error) {
    Logger.log('  Error: ' + error);
  }

  Logger.log('\n=== DEBUG COMPLETED ===');
}
