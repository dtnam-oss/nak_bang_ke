/**
 * QUICK CHECK - Kiểm tra nhanh data trong database
 * Chạy function này trong Apps Script Editor
 */

function quickCheckDatabase() {
  var table = 'nakvi-476804.nak_logistics.tb_chuyen_di';

  // Query đơn giản: lấy 10 records gần nhất và kiểm tra NULL
  var query = `
    SELECT
      ngay_tao,
      ma_khach_hang,
      ten_khach_hang,
      doanh_thu,
      bien_kiem_soat,
      loai_tuyen_khach_hang,
      FORMAT_DATE('%Y-%m-%d', DATE(ngay_tao)) as date_formatted,
      CASE WHEN ma_khach_hang IS NULL THEN 'NULL' ELSE 'HAS VALUE' END as ma_kh_check,
      CASE WHEN loai_tuyen_khach_hang IS NULL THEN 'NULL' ELSE 'HAS VALUE' END as tuyen_check
    FROM \`${table}\`
    ORDER BY ngay_tao DESC
    LIMIT 10
  `;

  Logger.log('=== QUICK DATABASE CHECK ===\n');
  Logger.log('Query: ' + query + '\n');

  try {
    var result = BigQuery.Jobs.query({
      query: query,
      useLegacySql: false
    }, 'nakvi-476804');

    if (result.rows && result.rows.length > 0) {
      Logger.log('Found ' + result.rows.length + ' recent records:\n');

      result.rows.forEach(function(row, index) {
        Logger.log('Record #' + (index + 1) + ':');
        Logger.log('  ngay_tao: ' + row.f[0].v);
        Logger.log('  ma_khach_hang: ' + row.f[1].v + ' (' + row.f[7].v + ')');
        Logger.log('  ten_khach_hang: ' + row.f[2].v);
        Logger.log('  doanh_thu: ' + row.f[3].v);
        Logger.log('  bien_kiem_soat: ' + row.f[4].v);
        Logger.log('  loai_tuyen_khach_hang: ' + row.f[5].v + ' (' + row.f[8].v + ')');
        Logger.log('  date_formatted: ' + row.f[6].v);
        Logger.log('');
      });

      // Thống kê nhanh
      var statsQuery = `
        SELECT
          COUNT(*) as total,
          MIN(DATE(ngay_tao)) as min_date,
          MAX(DATE(ngay_tao)) as max_date,
          COUNT(DISTINCT DATE(ngay_tao)) as unique_dates
        FROM \`${table}\`
      `;

      var stats = BigQuery.Jobs.query({
        query: statsQuery,
        useLegacySql: false
      }, 'nakvi-476804');

      if (stats.rows && stats.rows.length > 0) {
        var s = stats.rows[0];
        Logger.log('=== STATISTICS ===');
        Logger.log('Total records: ' + s.f[0].v);
        Logger.log('Earliest date: ' + s.f[1].v);
        Logger.log('Latest date: ' + s.f[2].v);
        Logger.log('Unique dates: ' + s.f[3].v);
      }

    } else {
      Logger.log('NO DATA FOUND IN TABLE!');
    }

  } catch (error) {
    Logger.log('ERROR: ' + error);
  }

  Logger.log('\n=== END ===');
}
