/**
 * NAK Logistics Dashboard - Backend API Server
 * Thay thế Google Apps Script bằng Node.js + Express
 *
 * Cài đặt:
 * npm install express cors dotenv @google-cloud/bigquery
 *
 * Chạy:
 * node server.js
 */

const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html)

// BigQuery Client
const bigquery = new BigQuery({
    projectId: process.env.BIGQUERY_PROJECT_ID,
    keyFilename: process.env.BIGQUERY_KEY_FILE // Path to service account JSON
});

const DATASET = process.env.BIGQUERY_DATASET || 'nak_logistics';
const TABLE_TRIPS = 'tb_chuyen_di';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build WHERE clause cho date filter
 */
function buildDateFilter(filter) {
    if (!filter || !filter.date) {
        return '1=1'; // No filter
    }

    const dateField = 'ngay_tao';
    const date = filter.date;
    const type = filter.type;

    switch(type) {
        case 'day':
            return `DATE(${dateField}) = DATE('${date}')`;

        case 'week':
            return `DATE_TRUNC(DATE(${dateField}), WEEK) = DATE_TRUNC(DATE('${date}'), WEEK)`;

        case 'month':
            return `DATE_TRUNC(DATE(${dateField}), MONTH) = DATE_TRUNC(DATE('${date}'), MONTH)`;

        case 'year':
            return `DATE_TRUNC(DATE(${dateField}), YEAR) = DATE_TRUNC(DATE('${date}'), YEAR)`;

        default:
            return '1=1';
    }
}

/**
 * Execute BigQuery query
 */
async function executeQuery(sqlQuery) {
    try {
        console.log('[BigQuery] Executing query:', sqlQuery.substring(0, 200) + '...');

        const options = {
            query: sqlQuery,
            location: 'US' // Adjust based on your dataset location
        };

        const [job] = await bigquery.createQueryJob(options);
        console.log('[BigQuery] Job created:', job.id);

        const [rows] = await job.getQueryResults();
        console.log('[BigQuery] Rows returned:', rows.length);

        return rows;
    } catch (error) {
        console.error('[BigQuery] Query error:', error);
        throw error;
    }
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'NAK Logistics API Server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * Get all dashboard data (combined endpoint)
 */
app.post('/api/dashboard/all', async (req, res) => {
    try {
        const filter = req.body;
        console.log('[API] GET /dashboard/all - Filter:', filter);

        // Execute all queries in parallel
        const [overview, topCustomers, topRoutes, topVehicles, bottomVehicles] = await Promise.all([
            getOverviewMetrics(filter),
            getTopCustomers(filter),
            getTopRoutes(filter),
            getTopVehicles(filter),
            getBottomVehicles(filter)
        ]);

        res.json({
            success: true,
            data: {
                overview,
                topCustomers,
                topRoutes,
                topVehicles,
                bottomVehicles
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[API] Error in /dashboard/all:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Get overview metrics (4 cards)
 */
async function getOverviewMetrics(filter) {
    const whereClause = buildDateFilter(filter);
    const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;

    const sql = `
        SELECT
            COUNT(DISTINCT ma_chuyen_di) as so_chuyen_di,
            COUNT(DISTINCT bien_kiem_soat) as so_xe_su_dung,
            ROUND(SUM(doanh_thu), 0) as tong_doanh_thu,
            COUNT(DISTINCT ma_khach_hang) as so_khach_hang
        FROM \`${table}\`
        WHERE ${whereClause}
    `;

    const rows = await executeQuery(sql);

    if (rows && rows.length > 0) {
        const row = rows[0];
        return {
            soChuyen: parseInt(row.so_chuyen_di) || 0,
            soXe: parseInt(row.so_xe_su_dung) || 0,
            doanhThu: parseFloat(row.tong_doanh_thu) || 0,
            soKhachHang: parseInt(row.so_khach_hang) || 0
        };
    }

    return { soChuyen: 0, soXe: 0, doanhThu: 0, soKhachHang: 0 };
}

/**
 * Get top 10 customers by revenue
 */
async function getTopCustomers(filter) {
    const whereClause = buildDateFilter(filter);
    const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;

    const sql = `
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

    const rows = await executeQuery(sql);
    return rows.map(row => ({
        ma_khach_hang: row.ma_khach_hang,
        ten_khach_hang: row.ten_khach_hang,
        so_chuyen: parseInt(row.so_chuyen) || 0,
        tong_doanh_thu: parseFloat(row.tong_doanh_thu) || 0
    }));
}

/**
 * Get top 10 routes by revenue
 */
async function getTopRoutes(filter) {
    const whereClause = buildDateFilter(filter);
    const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;

    const sql = `
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

    const rows = await executeQuery(sql);
    return rows.map(row => ({
        tuyen: row.tuyen,
        so_chuyen: parseInt(row.so_chuyen) || 0,
        tong_doanh_thu: parseFloat(row.tong_doanh_thu) || 0
    }));
}

/**
 * Get top 10 vehicles by revenue
 */
async function getTopVehicles(filter) {
    const whereClause = buildDateFilter(filter);
    const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;

    const sql = `
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

    const rows = await executeQuery(sql);
    return rows.map(row => ({
        bien_kiem_soat: row.bien_kiem_soat,
        so_chuyen: parseInt(row.so_chuyen) || 0,
        tong_doanh_thu: parseFloat(row.tong_doanh_thu) || 0,
        doanh_thu_trung_binh: parseFloat(row.doanh_thu_trung_binh) || 0
    }));
}

/**
 * Get bottom 10 vehicles by revenue
 */
async function getBottomVehicles(filter) {
    const whereClause = buildDateFilter(filter);
    const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;

    const sql = `
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

    const rows = await executeQuery(sql);
    return rows.map(row => ({
        bien_kiem_soat: row.bien_kiem_soat,
        so_chuyen: parseInt(row.so_chuyen) || 0,
        tong_doanh_thu: parseFloat(row.tong_doanh_thu) || 0,
        doanh_thu_trung_binh: parseFloat(row.doanh_thu_trung_binh) || 0
    }));
}

/**
 * ============================================
 * KẾ TOÁN MODULE ENDPOINTS
 * ============================================
 */

/**
 * Get customer list
 */
app.get('/api/ke-toan/customers', async (req, res) => {
    try {
        const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.tb_khach_hang`;
        const sql = `
            SELECT ma_khach_hang, ten_khach_hang
            FROM \`${table}\`
            WHERE ma_khach_hang IS NOT NULL
            ORDER BY ten_khach_hang ASC
        `;

        const rows = await executeQuery(sql);

        res.json({
            success: true,
            data: rows,
            count: rows.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[API] Error getting customers:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Get route types
 */
app.get('/api/ke-toan/route-types', async (req, res) => {
    try {
        const table = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;
        const sql = `
            SELECT DISTINCT loai_tuyen
            FROM \`${table}\`
            WHERE loai_tuyen IS NOT NULL
            ORDER BY loai_tuyen ASC
        `;

        const rows = await executeQuery(sql);

        res.json({
            success: true,
            data: rows,
            count: rows.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[API] Error getting route types:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Get doi soat data
 */
app.post('/api/ke-toan/doi-soat', async (req, res) => {
    try {
        const { ma_khach_hang, loai_tuyen, tu_ngay, den_ngay } = req.body;

        if (!ma_khach_hang) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng chọn khách hàng',
                timestamp: new Date().toISOString()
            });
        }

        if (!tu_ngay || !den_ngay) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng chọn thời gian',
                timestamp: new Date().toISOString()
            });
        }

        // Get customer info
        const customerTable = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.tb_khach_hang`;
        const customerSql = `
            SELECT ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi
            FROM \`${customerTable}\`
            WHERE ma_khach_hang = '${ma_khach_hang}'
        `;

        const customerRows = await executeQuery(customerSql);

        if (!customerRows || customerRows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy thông tin khách hàng',
                timestamp: new Date().toISOString()
            });
        }

        const customer = customerRows[0];

        // Get trips
        const tripsTable = `${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.${TABLE_TRIPS}`;
        let tripsSql = `
            SELECT
                ngay_tao,
                ma_chuyen_di,
                loai_tuyen,
                tuyen_duong,
                bien_so_xe,
                doanh_thu,
                trang_thai
            FROM \`${tripsTable}\`
            WHERE ma_khach_hang = '${ma_khach_hang}'
                AND DATE(ngay_tao) BETWEEN '${tu_ngay}' AND '${den_ngay}'
        `;

        if (loai_tuyen) {
            tripsSql += ` AND loai_tuyen = '${loai_tuyen}'`;
        }

        tripsSql += ' ORDER BY ngay_tao DESC';

        const trips = await executeQuery(tripsSql);

        // Calculate summary
        let totalRevenue = 0;
        let paidAmount = 0;
        let unpaidAmount = 0;

        trips.forEach(trip => {
            const revenue = parseFloat(trip.doanh_thu) || 0;
            totalRevenue += revenue;

            if (trip.trang_thai === 'Da thanh toan') {
                paidAmount += revenue;
            } else {
                unpaidAmount += revenue;
            }
        });

        const summary = {
            so_chuyen: trips.length,
            tong_doanh_thu: totalRevenue,
            da_thanh_toan: paidAmount,
            con_no: unpaidAmount
        };

        res.json({
            success: true,
            data: {
                customer,
                trips,
                summary,
                filters: { ma_khach_hang, loai_tuyen, tu_ngay, den_ngay }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[API] Error getting doi soat data:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   NAK Logistics Dashboard - API Server                ║
║                                                        ║
║   Server running on: http://localhost:${PORT}        ║
║   Health check: http://localhost:${PORT}/api/health  ║
║                                                        ║
║   Environment:                                         ║
║   - Project: ${process.env.BIGQUERY_PROJECT_ID || 'Not set'}           ║
║   - Dataset: ${DATASET}                          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
