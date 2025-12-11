// reconciliation.js - Xử lý logic cho trang Đối soát

// ===== GLOBAL VARIABLES =====
let jntReportData = {};
let jntFilteredData = [];
let currentDisplayType = 'theo-ca';

// ===== TAB SWITCHING =====
function initReconciliationTabs() {
    const tabButtons = document.querySelectorAll('.reconciliation-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(`${tabName}TabContent`);
            if (targetContent) {
                targetContent.style.display = 'block';
                targetContent.classList.add('active');
            }

            // Hide other tab contents
            tabContents.forEach(content => {
                if (content.id !== `${tabName}TabContent`) {
                    content.style.display = 'none';
                }
            });

            // Load data for the selected tab
            if (tabName === 'jnt') {
                loadJNTData();
            } else if (tabName === 'ghn') {
                loadGHNData();
            }
        });
    });
}

// ===== J&T TAB FUNCTIONS =====

// Load dữ liệu J&T từ Google Apps Script
async function loadJNTData() {
    showJNTLoading(true);

    try {
        // Google Apps Script Web App URL
        // TODO: Replace with your actual deployment URL
        const GAS_URL = 'https://script.google.com/macros/s/AKfycbyOuru9de8kUesUXGOeGX3PGzCraa_hXE7uYJD9LidDGzTQkDh9XKkVS63ZvY8i4kKV/exec';

        // Call Google Apps Script để lấy dữ liệu
        const response = await fetch(
            `${GAS_URL}?action=getJNTReportData`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Loaded J&T data:', data);

        // Check if data is empty
        if (!data || Object.keys(data).length === 0) {
            console.warn('No J&T data available');
            showJNTNoData(true);
            showJNTLoading(false);
            return;
        }

        jntReportData = data;

        // Populate filters
        populateJNTFilters(data);

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateFromInput = document.getElementById('jntDateFrom');
        const dateToInput = document.getElementById('jntDateTo');
        if (dateFromInput) {
            dateFromInput.value = today;
        }
        if (dateToInput) {
            dateToInput.value = today;
        }

        // Apply initial filter
        applyJNTFilter();

    } catch (error) {
        console.error('Error loading J&T data:', error);
        showJNTNoData(true);
    } finally {
        showJNTLoading(false);
    }
}

// Populate bộ lọc từ dữ liệu
function populateJNTFilters(data) {
    const plateSelect = document.getElementById('jntPlateSelect');

    const plates = new Set();

    // Extract unique values
    for (const date in data) {
        for (const loaiChuyen in data[date]) {
            for (const bienSo in data[date][loaiChuyen]) {
                plates.add(bienSo);
            }
        }
    }

    // Populate plate select
    if (plateSelect) {
        plateSelect.innerHTML = '<option value="">-- Tất cả --</option>';
        Array.from(plates).sort().forEach(plate => {
            const option = document.createElement('option');
            option.value = plate;
            option.textContent = plate;
            plateSelect.appendChild(option);
        });
    }
}

// Áp dụng bộ lọc
function applyJNTFilter() {
    // Get current display type from toggle buttons
    const activeBtn = document.querySelector('.toggle-btn.active');
    const displayType = activeBtn ? activeBtn.getAttribute('data-view') : 'theo-ca';

    const dateFrom = document.getElementById('jntDateFrom').value;
    const dateTo = document.getElementById('jntDateTo').value;
    const selectedPlate = document.getElementById('jntPlateSelect').value;

    currentDisplayType = displayType;

    // Determine loai_chuyen value based on display type
    const loaiChuyenFilter = displayType === 'theo-ca' ? 'Theo ca' : 'Theo tuyến';

    // Filter data
    jntFilteredData = [];

    if (!dateFrom || !dateTo) {
        showJNTNoData(true);
        return;
    }

    // Parse dates for comparison
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Loop through all dates in the range
    for (const dateKey in jntReportData) {
        const currentDate = new Date(dateKey);

        // Check if date is within range
        if (currentDate >= fromDate && currentDate <= toDate) {
            const dateData = jntReportData[dateKey];

            // Filter by loai_chuyen (based on display type)
            for (const loaiChuyen in dateData) {
                // Only include data matching the selected loai_chuyen
                if (loaiChuyen !== loaiChuyenFilter) continue;

                for (const bienSo in dateData[loaiChuyen]) {
                    if (selectedPlate && bienSo !== selectedPlate) continue;

                    const vehicleData = dateData[loaiChuyen][bienSo];
                    jntFilteredData.push(vehicleData);
                }
            }
        }
    }

    // Display data based on display type
    if (displayType === 'theo-ca') {
        displayJNTDataTheoCa(jntFilteredData);
    } else {
        displayJNTDataTheoTuyen(jntFilteredData);
    }
}

// Hiển thị dữ liệu theo ca (gộp theo xe)
function displayJNTDataTheoCa(data) {
    document.getElementById('jntTableTheoCa').style.display = 'block';
    document.getElementById('jntTableTheoTuyen').style.display = 'none';

    const tbody = document.getElementById('jntTableBodyTheoCa');
    tbody.innerHTML = '';

    if (data.length === 0) {
        showJNTNoData(true);
        return;
    }

    showJNTNoData(false);

    let stt = 1;

    // Gộp dữ liệu theo xe - mỗi xe 1 dòng
    data.forEach(vehicle => {
        const row = document.createElement('tr');

        // Gộp tất cả mã tem, điểm đi-đến, thể tích, loại ca
        const allMaTem = [];
        const allDiemDiDen = [];
        const allTheTich = [];
        const allLoaiCa = [];

        vehicle.chi_tiet_chuyen_di.forEach(trip => {
            // Mã tem - gộp tất cả vào một mảng
            if (Array.isArray(trip.ma_tem)) {
                allMaTem.push(...trip.ma_tem);
            } else if (trip.ma_tem) {
                allMaTem.push(trip.ma_tem);
            }

            // Điểm đi - điểm đến - mỗi cặp điểm là một dòng
            if (Array.isArray(trip.diem_di_diem_den)) {
                allDiemDiDen.push(trip.diem_di_diem_den.join(' - '));
            } else if (trip.diem_di_diem_den) {
                allDiemDiDen.push(trip.diem_di_diem_den);
            }

            // Thể tích
            if (trip.the_tich) {
                allTheTich.push(trip.the_tich);
            }

            // Loại ca
            if (trip.loai_ca) {
                allLoaiCa.push(trip.loai_ca);
            }
        });

        // Format hiển thị - xuống dòng cho mỗi item
        const maTem = allMaTem.join('<br>');
        const diemDiDen = allDiemDiDen.join('<br>');
        const theTich = allTheTich.length > 0 ? allTheTich[0] : ''; // Lấy thể tích đầu tiên hoặc tổng
        const loaiCa = allLoaiCa.length > 0 ? allLoaiCa[0] : ''; // Lấy loại ca đầu tiên

        row.innerHTML = `
            <td>${stt++}</td>
            <td>${vehicle.ngay}</td>
            <td>${vehicle.bien_so}</td>
            <td style="white-space: pre-line;">${maTem || ''}</td>
            <td style="white-space: pre-line;">${diemDiDen || ''}</td>
            <td>${theTich || ''}</td>
            <td>${loaiCa || ''}</td>
        `;

        tbody.appendChild(row);
    });
}

// Hiển thị dữ liệu theo tuyến
function displayJNTDataTheoTuyen(data) {
    document.getElementById('jntTableTheoCa').style.display = 'none';
    document.getElementById('jntTableTheoTuyen').style.display = 'block';

    const tbody = document.getElementById('jntTableBodyTheoTuyen');
    tbody.innerHTML = '';

    if (data.length === 0) {
        showJNTNoData(true);
        return;
    }

    showJNTNoData(false);

    let stt = 1;

    data.forEach(vehicle => {
        // Group trips by route (diem_di_diem_den)
        const routeGroups = {};

        vehicle.chi_tiet_chuyen_di.forEach(trip => {
            const route = trip.lo_trinh_doi_soat || 'Không xác định';

            if (!routeGroups[route]) {
                routeGroups[route] = {
                    maTems: [], // Lưu tất cả ma_tem
                    theTich: []
                };
            }

            // Thêm ma_tem vào array
            if (trip.ma_tem) {
                routeGroups[route].maTems.push(trip.ma_tem.toString().trim());
            }

            if (trip.the_tich) {
                routeGroups[route].theTich.push(trip.the_tich);
            }
        });

        // Xử lý logic phân chia tem chiều đi/về sau khi đã gom hết dữ liệu
        for (const route in routeGroups) {
            const group = routeGroups[route];

            // Nếu có 2 ma_tem: đầu tiên là chiều đi, thứ hai là chiều về
            if (group.maTems.length >= 2) {
                group.temDi = [group.maTems[0]];
                group.temVe = [group.maTems[1]];
            }
            // Nếu chỉ có 1 ma_tem: ghi vào chiều đi
            else if (group.maTems.length === 1) {
                group.temDi = [group.maTems[0]];
                group.temVe = [];
            }
            // Nếu không có ma_tem nào
            else {
                group.temDi = [];
                group.temVe = [];
            }
        }

        // Display grouped data
        for (const route in routeGroups) {
            const row = document.createElement('tr');

            const group = routeGroups[route];
            const temDi = group.temDi.join(', ');
            const temVe = group.temVe.join(', ');
            // Loại bỏ giá trị trùng lặp trong theTich
            const uniqueTheTich = [...new Set(group.theTich)];
            const theTich = uniqueTheTich.join(', ');

            row.innerHTML = `
                <td>${stt++}</td>
                <td>${vehicle.ngay}</td>
                <td>${vehicle.bien_so}</td>
                <td>${route}</td>
                <td>${temDi || ''}</td>
                <td>${temVe || ''}</td>
                <td>${theTich || ''}</td>
            `;

            tbody.appendChild(row);
        }
    });
}

// Show/hide loading
function showJNTLoading(show) {
    const loading = document.getElementById('jntLoading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Show/hide no data message
function showJNTNoData(show) {
    const noData = document.getElementById('jntNoData');
    const tableTheoCa = document.getElementById('jntTableTheoCa');
    const tableTheoTuyen = document.getElementById('jntTableTheoTuyen');

    if (noData) {
        noData.style.display = show ? 'block' : 'none';
    }

    if (show) {
        if (tableTheoCa) tableTheoCa.style.display = 'none';
        if (tableTheoTuyen) tableTheoTuyen.style.display = 'none';
    }
}

// ===== EXPORT TO EXCEL =====

/**
 * Xuất dữ liệu J&T ra file Excel sử dụng ExcelJS
 */
async function exportJNTToExcel() {
    if (!jntFilteredData || jntFilteredData.length === 0) {
        alert('Không có dữ liệu để xuất. Vui lòng chọn bộ lọc và có dữ liệu hiển thị.');
        return;
    }

    try {
        // Lấy loại hiển thị hiện tại
        const activeBtn = document.querySelector('.toggle-btn.active');
        const displayType = activeBtn ? activeBtn.getAttribute('data-view') : 'theo-ca';
        const dateFrom = document.getElementById('jntDateFrom').value || '';
        const dateTo = document.getElementById('jntDateTo').value || '';

        let fileName = '';

        // Format date range for filename
        const dateRangeStr = dateFrom === dateTo ? dateFrom : `${dateFrom}_to_${dateTo}`;

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('J&T Report');

        if (displayType === 'theo-ca') {
            // Xuất dữ liệu theo ca
            fileName = `JNT_TheoCa_${dateRangeStr}.xlsx`;

            // Định nghĩa cột
            worksheet.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'Ngày', key: 'ngay', width: 12 },
                { header: 'Biển Số', key: 'bien_so', width: 12 },
                { header: 'Mã Tem', key: 'ma_tem', width: 30 },
                { header: 'Điểm đi - Điểm đến', key: 'diem_di_den', width: 50 },
                { header: 'Thể tích', key: 'the_tich', width: 15 },
                { header: 'Loại ca', key: 'loai_ca', width: 20 }
            ];

            // Thêm dữ liệu
            let stt = 1;
            jntFilteredData.forEach(vehicle => {
                // Gộp tất cả mã tem, điểm đi-đến, thể tích, loại ca
                const allMaTem = [];
                const allDiemDiDen = [];
                const allTheTich = [];
                const allLoaiCa = [];

                vehicle.chi_tiet_chuyen_di.forEach(trip => {
                    // Mã tem - gộp tất cả vào một mảng
                    if (Array.isArray(trip.ma_tem)) {
                        allMaTem.push(...trip.ma_tem);
                    } else if (trip.ma_tem) {
                        allMaTem.push(trip.ma_tem);
                    }

                    // Điểm đi - điểm đến - mỗi cặp điểm là một dòng
                    if (Array.isArray(trip.diem_di_diem_den)) {
                        allDiemDiDen.push(trip.diem_di_diem_den.join(' - '));
                    } else if (trip.diem_di_diem_den) {
                        allDiemDiDen.push(trip.diem_di_diem_den);
                    }

                    // Thể tích
                    if (trip.the_tich) {
                        allTheTich.push(trip.the_tich);
                    }

                    // Loại ca
                    if (trip.loai_ca) {
                        allLoaiCa.push(trip.loai_ca);
                    }
                });

                // Format Excel - mỗi giá trị xuống dòng bằng \n
                const maTem = allMaTem.join('\n');
                const diemDiDen = allDiemDiDen.join('\n');
                const theTich = allTheTich.length > 0 ? allTheTich[0] : ''; // Lấy thể tích đầu tiên
                const loaiCa = allLoaiCa.length > 0 ? allLoaiCa[0] : ''; // Lấy loại ca đầu tiên

                // Thêm dòng vào worksheet
                const row = worksheet.addRow({
                    stt: stt++,
                    ngay: vehicle.ngay,
                    bien_so: vehicle.bien_so,
                    ma_tem: maTem,
                    diem_di_den: diemDiDen,
                    the_tich: theTich,
                    loai_ca: loaiCa
                });

                // Thiết lập wrapText cho các ô có nội dung xuống dòng
                row.getCell('ma_tem').alignment = { wrapText: true, vertical: 'top' };
                row.getCell('diem_di_den').alignment = { wrapText: true, vertical: 'top' };
            });

        } else {
            // Xuất dữ liệu theo tuyến
            fileName = `JNT_TheoTuyen_${dateRangeStr}.xlsx`;

            // Định nghĩa cột
            worksheet.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'Ngày', key: 'ngay', width: 12 },
                { header: 'Biển Số', key: 'bien_so', width: 12 },
                { header: 'Điểm đi - Điểm đến', key: 'diem_di_den', width: 30 },
                { header: 'Tem chiều đi', key: 'tem_di', width: 30 },
                { header: 'Tem chiều về', key: 'tem_ve', width: 30 },
                { header: 'Thể tích', key: 'the_tich', width: 15 }
            ];

            // Thêm dữ liệu
            let stt = 1;
            jntFilteredData.forEach(vehicle => {
                // Group trips by route (diem_di_diem_den)
                const routeGroups = {};

                vehicle.chi_tiet_chuyen_di.forEach(trip => {
                    const route = trip.lo_trinh_doi_soat || 'Không xác định';

                    if (!routeGroups[route]) {
                        routeGroups[route] = {
                            maTems: [], // Lưu tất cả ma_tem
                            theTich: []
                        };
                    }

                    // Thêm ma_tem vào array
                    if (trip.ma_tem) {
                        routeGroups[route].maTems.push(trip.ma_tem.toString().trim());
                    }

                    if (trip.the_tich) {
                        routeGroups[route].theTich.push(trip.the_tich);
                    }
                });

                // Xử lý logic phân chia tem chiều đi/về sau khi đã gom hết dữ liệu
                for (const route in routeGroups) {
                    const group = routeGroups[route];

                    // Nếu có 2 ma_tem: đầu tiên là chiều đi, thứ hai là chiều về
                    if (group.maTems.length >= 2) {
                        group.temDi = [group.maTems[0]];
                        group.temVe = [group.maTems[1]];
                    }
                    // Nếu chỉ có 1 ma_tem: ghi vào chiều đi
                    else if (group.maTems.length === 1) {
                        group.temDi = [group.maTems[0]];
                        group.temVe = [];
                    }
                    // Nếu không có ma_tem nào
                    else {
                        group.temDi = [];
                        group.temVe = [];
                    }
                }

                // Thêm dòng cho từng tuyến
                for (const route in routeGroups) {
                    const group = routeGroups[route];
                    // Loại bỏ giá trị trùng lặp trong theTich
                    const uniqueTheTich = [...new Set(group.theTich)];
                    worksheet.addRow({
                        stt: stt++,
                        ngay: vehicle.ngay,
                        bien_so: vehicle.bien_so,
                        diem_di_den: route,
                        tem_di: group.temDi.join(', '),
                        tem_ve: group.temVe.join(', '),
                        the_tich: uniqueTheTich.join(', ')
                    });
                }
            });
        }

        // Định dạng header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);

        console.log('Đã xuất file Excel:', fileName);

    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.');
    }
}

// ===== EVENT LISTENERS =====
function initJNTEventListeners() {
    // Toggle buttons for display type
    const btnTheoCa = document.getElementById('jntBtnTheoCa');
    const btnTheoTuyen = document.getElementById('jntBtnTheoTuyen');

    if (btnTheoCa) {
        btnTheoCa.addEventListener('click', function() {
            document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            applyJNTFilter();
        });
    }

    if (btnTheoTuyen) {
        btnTheoTuyen.addEventListener('click', function() {
            document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            applyJNTFilter();
        });
    }

    // Apply filter button
    const applyBtn = document.getElementById('jntApplyFilter');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyJNTFilter);
    }

    // Reset filter button
    const resetBtn = document.getElementById('jntResetFilter');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Reset toggle buttons
            document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
            const btnTheoCa = document.getElementById('jntBtnTheoCa');
            if (btnTheoCa) {
                btnTheoCa.classList.add('active');
            }

            // Reset date range to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('jntDateFrom').value = today;
            document.getElementById('jntDateTo').value = today;
            document.getElementById('jntPlateSelect').value = '';
            applyJNTFilter();
        });
    }

    // Export Excel button
    const exportBtn = document.getElementById('jntExportExcel');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportJNTToExcel);
    }
}

// ===== GHN TAB FUNCTIONS =====

// Global variables for GHN
let ghnReportData = {};
let ghnFilteredData = [];

// Load dữ liệu GHN từ Google Apps Script
async function loadGHNData() {
    showGHNLoading(true);

    try {
        // Google Apps Script Web App URL
        const GAS_URL = 'https://script.google.com/macros/s/AKfycbyOuru9de8kUesUXGOeGX3PGzCraa_hXE7uYJD9LidDGzTQkDh9XKkVS63ZvY8i4kKV/exec';

        // Call Google Apps Script để lấy dữ liệu GHN
        const response = await fetch(
            `${GAS_URL}?action=getGHNReportData`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch GHN data');
        }

        const data = await response.json();
        console.log('Loaded GHN data:', data);

        // Check if data is empty
        if (!data || Object.keys(data).length === 0) {
            console.warn('No GHN data available');
            showGHNNoData(true);
            showGHNLoading(false);
            return;
        }

        ghnReportData = data;

        // Populate filters
        populateGHNFilters(data);

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateSelect = document.getElementById('ghnDateSelect');
        if (dateSelect) {
            dateSelect.value = today;
        }

        // Apply initial filter
        applyGHNFilter();

    } catch (error) {
        console.error('Error loading GHN data:', error);
        showGHNNoData(true);
    } finally {
        showGHNLoading(false);
    }
}

// Populate bộ lọc từ dữ liệu GHN
function populateGHNFilters(data) {
    const plateSelect = document.getElementById('ghnPlateSelect');
    const routeSelect = document.getElementById('ghnRouteSelect');

    const plates = new Set();
    const routes = new Set();

    // Extract unique values
    for (const date in data) {
        for (const loaiTuyen in data[date]) {
            routes.add(loaiTuyen);
            for (const bienSo in data[date][loaiTuyen]) {
                plates.add(bienSo);
            }
        }
    }

    // Populate plate select
    plateSelect.innerHTML = '<option value="">-- Tất cả --</option>';
    Array.from(plates).sort().forEach(plate => {
        const option = document.createElement('option');
        option.value = plate;
        option.textContent = plate;
        plateSelect.appendChild(option);
    });

    // Populate route select
    routeSelect.innerHTML = '<option value="">-- Tất cả --</option>';
    Array.from(routes).sort().forEach(route => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        routeSelect.appendChild(option);
    });
}

// Áp dụng bộ lọc GHN
function applyGHNFilter() {
    const selectedDate = document.getElementById('ghnDateSelect').value;
    const selectedPlate = document.getElementById('ghnPlateSelect').value;
    const selectedRoute = document.getElementById('ghnRouteSelect').value;

    // Filter data
    ghnFilteredData = [];

    if (!selectedDate) {
        showGHNNoData(true);
        return;
    }

    const dateData = ghnReportData[selectedDate];
    if (!dateData) {
        showGHNNoData(true);
        return;
    }

    // Filter by route and plate
    for (const loaiTuyen in dateData) {
        if (selectedRoute && loaiTuyen !== selectedRoute) continue;

        for (const bienSo in dateData[loaiTuyen]) {
            if (selectedPlate && bienSo !== selectedPlate) continue;

            const vehicleData = dateData[loaiTuyen][bienSo];
            ghnFilteredData.push(vehicleData);
        }
    }

    // Display data
    displayGHNData(ghnFilteredData);
}

// Hiển thị dữ liệu GHN - mỗi lo_trinh và ma_chuyen_di_kh là 1 dòng
function displayGHNData(data) {
    const tbody = document.getElementById('ghnTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        showGHNNoData(true);
        return;
    }

    showGHNNoData(false);

    let stt = 1;

    // Duyệt qua từng xe
    data.forEach(vehicle => {
        // Duyệt qua từng chuyến đi chi tiết
        vehicle.chi_tiet_chuyen_di.forEach(trip => {
            // Lộ trình chi tiết theo điểm (giữ nguyên chuỗi gốc)
            const loTrinhChiTiet = trip.lo_trinh_chi_tiet_theo_diem || '';

            // Lấy danh sách mã chuyến
            const maChuyens = Array.isArray(trip.ma_chuyen_di_kh)
                ? trip.ma_chuyen_di_kh
                : (trip.ma_chuyen_di_kh ? [trip.ma_chuyen_di_kh] : []);

            // Tính số dòng cần tạo (dựa trên số lượng mã chuyến, ít nhất 1 dòng)
            const maxRows = Math.max(maChuyens.length, 1);

            // Tạo nhiều dòng nếu có nhiều mã chuyến
            for (let i = 0; i < maxRows; i++) {
                const row = document.createElement('tr');

                // Mã chuyến cho dòng này
                const maChuyen = maChuyens[i] || '';

                row.innerHTML = `
                    <td>${stt++}</td>
                    <td>${vehicle.ngay}</td>
                    <td>${vehicle.bien_so}</td>
                    <td>${trip.tai_trong_tinh_phi || ''}</td>
                    <td>${trip.hinh_thuc_tinh_gia || ''}</td>
                    <td>${loTrinhChiTiet}</td>
                    <td>${trip.quang_duong || ''}</td>
                    <td>${trip.don_gia || ''}</td>
                    <td></td>
                    <td></td>
                    <td>100%</td>
                    <td></td>
                    <td>${trip.lo_trinh || ''}</td>
                    <td>${maChuyen}</td>
                `;

                tbody.appendChild(row);
            }
        });
    });
}

// Show/hide loading GHN
function showGHNLoading(show) {
    const loading = document.getElementById('ghnLoading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Show/hide no data message GHN
function showGHNNoData(show) {
    const noData = document.getElementById('ghnNoData');
    const tableSection = document.getElementById('ghnTableSection');

    if (noData) {
        noData.style.display = show ? 'block' : 'none';
    }

    if (show) {
        if (tableSection) tableSection.style.display = 'none';
    } else {
        if (tableSection) tableSection.style.display = 'block';
    }
}

// ===== EXPORT GHN TO EXCEL =====

/**
 * Xuất dữ liệu GHN ra file Excel sử dụng ExcelJS
 */
async function exportGHNToExcel() {
    if (!ghnFilteredData || ghnFilteredData.length === 0) {
        alert('Không có dữ liệu để xuất. Vui lòng chọn bộ lọc và có dữ liệu hiển thị.');
        return;
    }

    try {
        const selectedDate = document.getElementById('ghnDateSelect').value || 'all';
        const fileName = `GHN_${selectedDate}.xlsx`;

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('GHN Report');

        // Định nghĩa cột
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Ngày', key: 'ngay', width: 12 },
            { header: 'BiểnSố', key: 'bien_so', width: 12 },
            { header: 'Trọng Tải Yêu Cầu', key: 'tai_trong', width: 15 },
            { header: 'Hình Thức Tính Giá', key: 'hinh_thuc', width: 18 },
            { header: 'Lộ Trình', key: 'lo_trinh', width: 50 },
            { header: 'Số KM', key: 'quang_duong', width: 10 },
            { header: 'Đơn giá khung', key: 'don_gia', width: 15 },
            { header: 'Về cầu đường', key: 've_cau_duong', width: 15 },
            { header: 'Phí đường tải', key: 'phi_duong_tai', width: 15 },
            { header: 'Tỷ lệ Ontime', key: 'ty_le_ontime', width: 12 },
            { header: 'Thành Tiền (chưa VAT)', key: 'thanh_tien', width: 18 },
            { header: 'Tên tuyến', key: 'ten_tuyen', width: 25 },
            { header: 'Mã chuyến', key: 'ma_chuyen', width: 20 }
        ];

        // Thêm dữ liệu
        let stt = 1;

        ghnFilteredData.forEach(vehicle => {
            vehicle.chi_tiet_chuyen_di.forEach(trip => {
                // Lộ trình chi tiết theo điểm (giữ nguyên chuỗi gốc)
                const loTrinhChiTiet = trip.lo_trinh_chi_tiet_theo_diem || '';

                // Lấy danh sách mã chuyến
                const maChuyens = Array.isArray(trip.ma_chuyen_di_kh)
                    ? trip.ma_chuyen_di_kh
                    : (trip.ma_chuyen_di_kh ? [trip.ma_chuyen_di_kh] : []);

                // Tính số dòng cần tạo (dựa trên số lượng mã chuyến, ít nhất 1 dòng)
                const maxRows = Math.max(maChuyens.length, 1);

                // Tạo nhiều dòng nếu có nhiều mã chuyến
                for (let i = 0; i < maxRows; i++) {
                    const maChuyen = maChuyens[i] || '';

                    const row = worksheet.addRow({
                        stt: stt++,
                        ngay: vehicle.ngay,
                        bien_so: vehicle.bien_so,
                        tai_trong: trip.tai_trong_tinh_phi || '',
                        hinh_thuc: trip.hinh_thuc_tinh_gia || '',
                        lo_trinh: loTrinhChiTiet,
                        quang_duong: trip.quang_duong || '',
                        don_gia: trip.don_gia || '',
                        ve_cau_duong: '',
                        phi_duong_tai: '',
                        ty_le_ontime: '100%',
                        thanh_tien: '',
                        ten_tuyen: trip.lo_trinh || '',
                        ma_chuyen: maChuyen
                    });

                    // Enable text wrapping cho cột lộ trình (cột F - index 6)
                    row.getCell(6).alignment = { wrapText: true, vertical: 'top' };
                }
            });
        });

        // Định dạng header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);

        console.log('Đã xuất file Excel GHN:', fileName);

    } catch (error) {
        console.error('Lỗi khi xuất Excel GHN:', error);
        alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.');
    }
}

// ===== GHN EVENT LISTENERS =====
function initGHNEventListeners() {
    // Apply filter button
    const applyBtn = document.getElementById('ghnApplyFilter');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyGHNFilter);
    }

    // Reset filter button
    const resetBtn = document.getElementById('ghnResetFilter');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('ghnDateSelect').value = new Date().toISOString().split('T')[0];
            document.getElementById('ghnPlateSelect').value = '';
            document.getElementById('ghnRouteSelect').value = '';
            applyGHNFilter();
        });
    }

    // Export Excel button
    const exportBtn = document.getElementById('ghnExportExcel');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportGHNToExcel);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initReconciliationTabs();
    initJNTEventListeners();
    initGHNEventListeners();

    // Không load dữ liệu ngay khi trang mở vì mặc định hiển thị menu "Báo cáo"
    // Dữ liệu sẽ được load khi người dùng chuyển sang menu "Đối soát"
});

// Export function để script.js có thể gọi khi chuyển menu
window.initReconciliationPage = function() {
    // Load J&T data khi mở trang Đối soát lần đầu
    if (!jntReportData || Object.keys(jntReportData).length === 0) {
        loadJNTData();
    }
};
