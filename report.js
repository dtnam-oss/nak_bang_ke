// Report page variables
let allReportData = [];
let currentReportData = [];
let charts = {
    revenueByDate: null,
    revenueByRoute: null,
    revenueByCustomerRoute: null
};

// Fetch report data from Google Apps Script
async function fetchReportData() {
    try {
        const url = `${WEB_APP_URL}?action=getReportData`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            allReportData = data;
            currentReportData = [...allReportData];
            updateReportView();
        } else {
            allReportData = [];
            currentReportData = [];
        }
    } catch (error) {
        console.error('Error fetching report data:', error);
        allReportData = [];
        currentReportData = [];
    }
}

// Initialize report page
async function initReportPage() {
    try {
        await fetchReportData();
        initReportFilters();
        filterReportByMonth(); // Default filter: Tháng này
    } catch (error) {
        console.error('Error initializing report page:', error);
        // Hiển thị thông báo lỗi cho người dùng
        const baoCaoSection = document.getElementById('baoCaoSection');
        if (baoCaoSection) {
            baoCaoSection.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h3 style="color: #e74c3c;">Không thể tải dữ liệu báo cáo</h3>
                    <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
                    <p style="color: #7f8c8d; font-size: 0.9em;">Lỗi: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Initialize report filters
function initReportFilters() {
    const quickFilterBtns = document.querySelectorAll('.quick-filter-btn');
    const reportFromDate = document.getElementById('reportFromDate');
    const reportToDate = document.getElementById('reportToDate');
    const customDateFilter = document.querySelector('.custom-date-filter');

    quickFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all buttons
            quickFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            if (filter === 'custom') {
                customDateFilter.style.display = 'flex';
            } else {
                customDateFilter.style.display = 'none';

                switch(filter) {
                    case 'today':
                        filterReportByToday();
                        break;
                    case 'week':
                        filterReportByWeek();
                        break;
                    case 'month':
                        filterReportByMonth();
                        break;
                }
            }
        });
    });

    // Custom date filter
    reportFromDate.addEventListener('change', filterReportByCustomDate);
    reportToDate.addEventListener('change', filterReportByCustomDate);
}

// Filter report by today
function filterReportByToday() {
    const today = formatDateForInput(new Date());
    currentReportData = allReportData.filter(item => {
        const itemDate = convertDateToYYYYMMDD(item.ngay_tao);
        return itemDate === today;
    });
    updateReportView();
}

// Filter report by week
function filterReportByWeek() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const todayStr = formatDateForInput(today);
    const weekAgoStr = formatDateForInput(weekAgo);

    currentReportData = allReportData.filter(item => {
        const itemDate = convertDateToYYYYMMDD(item.ngay_tao);
        return itemDate >= weekAgoStr && itemDate <= todayStr;
    });
    updateReportView();
}

// Filter report by month
function filterReportByMonth() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(today.getMonth() - 1);

    const todayStr = formatDateForInput(today);
    const monthAgoStr = formatDateForInput(monthAgo);

    currentReportData = allReportData.filter(item => {
        const itemDate = convertDateToYYYYMMDD(item.ngay_tao);
        return itemDate >= monthAgoStr && itemDate <= todayStr;
    });
    updateReportView();
}

// Filter report by custom date
function filterReportByCustomDate() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;

    if (!fromDate || !toDate) return;

    currentReportData = allReportData.filter(item => {
        const itemDate = convertDateToYYYYMMDD(item.ngay_tao);
        return itemDate >= fromDate && itemDate <= toDate;
    });
    updateReportView();
}

// Update report view
function updateReportView() {
    updateOverviewCards();
    updateCharts();
    updateVendorTripsTable();
}

// Update overview cards
function updateOverviewCards() {
    const totalRevenue = currentReportData.reduce((sum, item) => sum + (item.tong_doanh_thu || 0), 0);
    const totalTrips = currentReportData.reduce((sum, item) => sum + (item.so_luong_chuyen_di || 0), 0);
    const totalNak = currentReportData.reduce((sum, item) => sum + (item.so_xe_nak || 0), 0);
    const totalVendor = currentReportData.reduce((sum, item) => sum + (item.so_xe_vendor || 0), 0);

    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalTrips').textContent = totalTrips.toLocaleString('vi-VN');
    document.getElementById('totalNakVehicles').textContent = totalNak;
    document.getElementById('totalVendorVehicles').textContent = totalVendor;
}

// Update charts
function updateCharts() {
    updateRevenueByDateChart();
    updateRevenueByRouteChart();
    updateRevenueByCustomerRouteChart();
}

// Update revenue by date chart
function updateRevenueByDateChart() {
    const ctx = document.getElementById('revenueByDateChart').getContext('2d');

    // Prepare data
    const sortedData = [...currentReportData].sort((a, b) => {
        const dateA = convertDateToYYYYMMDD(a.ngay_tao);
        const dateB = convertDateToYYYYMMDD(b.ngay_tao);
        return dateA.localeCompare(dateB);
    });

    const labels = sortedData.map(item => formatDateForDisplay(item.ngay_tao));
    const data = sortedData.map(item => item.tong_doanh_thu || 0);

    // Destroy existing chart
    if (charts.revenueByDate) {
        charts.revenueByDate.destroy();
    }

    // Create chart
    charts.revenueByDate = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: '#667eea',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value) {
                        return formatCurrency(value);
                    },
                    anchor: 'end',
                    align: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Update revenue by route chart
function updateRevenueByRouteChart() {
    const ctx = document.getElementById('revenueByRouteChart').getContext('2d');

    // Aggregate data
    const revenueByRoute = {};
    currentReportData.forEach(item => {
        if (item.chi_tiet_bao_cao) {
            const details = typeof item.chi_tiet_bao_cao === 'string'
                ? JSON.parse(item.chi_tiet_bao_cao)
                : item.chi_tiet_bao_cao;

            if (details.doanh_thu_theo_tuyen) {
                Object.entries(details.doanh_thu_theo_tuyen).forEach(([route, revenue]) => {
                    revenueByRoute[route] = (revenueByRoute[route] || 0) + revenue;
                });
            }
        }
    });

    const labels = Object.keys(revenueByRoute);
    const data = Object.values(revenueByRoute);

    // Destroy existing chart
    if (charts.revenueByRoute) {
        charts.revenueByRoute.destroy();
    }

    // Create chart
    charts.revenueByRoute = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.parsed);
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: function(value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return percentage + '%';
                    }
                }
            }
        }
    });
}

// Update revenue by customer-route chart
function updateRevenueByCustomerRouteChart() {
    const ctx = document.getElementById('revenueByCustomerRouteChart').getContext('2d');

    // Aggregate data
    const revenueByCustomerRoute = {};
    currentReportData.forEach(item => {
        if (item.chi_tiet_bao_cao) {
            const details = typeof item.chi_tiet_bao_cao === 'string'
                ? JSON.parse(item.chi_tiet_bao_cao)
                : item.chi_tiet_bao_cao;

            if (details.doanh_thu_theo_khach_hang_tuyen) {
                Object.entries(details.doanh_thu_theo_khach_hang_tuyen).forEach(([key, revenue]) => {
                    revenueByCustomerRoute[key] = (revenueByCustomerRoute[key] || 0) + revenue;
                });
            }
        }
    });

    const labels = Object.keys(revenueByCustomerRoute);
    const data = Object.values(revenueByCustomerRoute);

    // Destroy existing chart
    if (charts.revenueByCustomerRoute) {
        charts.revenueByCustomerRoute.destroy();
    }

    // Create chart
    charts.revenueByCustomerRoute = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: data,
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: '#667eea',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value) {
                        return formatCurrency(value);
                    },
                    anchor: 'end',
                    align: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Update vendor trips table
function updateVendorTripsTable() {
    const tbody = document.getElementById('vendorTripsBody');
    tbody.innerHTML = '';

    // Aggregate vendor trips
    const vendorTrips = {};
    currentReportData.forEach(item => {
        if (item.chi_tiet_bao_cao) {
            const details = typeof item.chi_tiet_bao_cao === 'string'
                ? JSON.parse(item.chi_tiet_bao_cao)
                : item.chi_tiet_bao_cao;

            if (details.so_luong_chuyen_vendor && Array.isArray(details.so_luong_chuyen_vendor)) {
                details.so_luong_chuyen_vendor.forEach(vendor => {
                    const key = `${vendor.ten_tai_xe}|${vendor.ten_khach_hang}|${vendor.loai_tuyen_khach_hang}`;
                    if (!vendorTrips[key]) {
                        vendorTrips[key] = {
                            ten_tai_xe: vendor.ten_tai_xe,
                            ten_khach_hang: vendor.ten_khach_hang,
                            loai_tuyen_khach_hang: vendor.loai_tuyen_khach_hang,
                            so_chuyen: 0
                        };
                    }
                    vendorTrips[key].so_chuyen += vendor.so_chuyen || 0;
                });
            }
        }
    });

    // Sort by number of trips
    const sortedVendors = Object.values(vendorTrips).sort((a, b) => b.so_chuyen - a.so_chuyen);

    // Render table
    sortedVendors.forEach((vendor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${vendor.ten_tai_xe}</td>
            <td>${vendor.ten_khach_hang}</td>
            <td>${vendor.loai_tuyen_khach_hang}</td>
            <td><strong>${vendor.so_chuyen}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
