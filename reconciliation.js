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
        const dateSelect = document.getElementById('jntDateSelect');
        if (dateSelect) {
            dateSelect.value = today;
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
    const routeSelect = document.getElementById('jntRouteSelect');

    const plates = new Set();
    const routes = new Set();

    // Extract unique values
    for (const date in data) {
        for (const loaiChuyen in data[date]) {
            routes.add(loaiChuyen);
            for (const bienSo in data[date][loaiChuyen]) {
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

// Áp dụng bộ lọc
function applyJNTFilter() {
    const displayType = document.getElementById('jntDisplayTypeSelect').value;
    const selectedDate = document.getElementById('jntDateSelect').value;
    const selectedPlate = document.getElementById('jntPlateSelect').value;
    const selectedRoute = document.getElementById('jntRouteSelect').value;

    currentDisplayType = displayType;

    // Filter data
    jntFilteredData = [];

    if (!selectedDate) {
        showJNTNoData(true);
        return;
    }

    const dateData = jntReportData[selectedDate];
    if (!dateData) {
        showJNTNoData(true);
        return;
    }

    // Filter by route and plate
    for (const loaiChuyen in dateData) {
        if (selectedRoute && loaiChuyen !== selectedRoute) continue;

        for (const bienSo in dateData[loaiChuyen]) {
            if (selectedPlate && bienSo !== selectedPlate) continue;

            const vehicleData = dateData[loaiChuyen][bienSo];
            jntFilteredData.push(vehicleData);
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

        // Gộp tất cả mã tem và điểm đi-đến của các chuyến đi trong ngày
        const allMaTem = [];
        const allDiemDiDen = [];

        vehicle.chi_tiet_chuyen_di.forEach(trip => {
            // Mã tem - gộp tất cả vào một mảng
            if (Array.isArray(trip.ma_tem)) {
                allMaTem.push(...trip.ma_tem);
            } else if (trip.ma_tem) {
                allMaTem.push(trip.ma_tem);
            }

            // Điểm đi - điểm đến - gộp tất cả vào một mảng
            if (Array.isArray(trip.diem_di_diem_den)) {
                allDiemDiDen.push(...trip.diem_di_diem_den);
            } else if (trip.diem_di_diem_den) {
                allDiemDiDen.push(trip.diem_di_diem_den);
            }
        });

        // Gom tất cả mã tem thành một chuỗi, xuống dòng cho mỗi item
        const maTem = allMaTem.join('<br>');
        
        // Gom tất cả điểm đi-đến thành một chuỗi, ngăn cách bởi " - "
        const diemDiDen = allDiemDiDen.join(' - ');

        row.innerHTML = `
            <td>${stt++}</td>
            <td>${vehicle.ngay}</td>
            <td>${vehicle.bien_so}</td>
            <td style="white-space: pre-line;">${maTem || ''}</td>
            <td>${diemDiDen || ''}</td>
            <td></td>
            <td></td>
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
            const route = Array.isArray(trip.diem_di_diem_den)
                ? trip.diem_di_diem_den.join(' - ')
                : trip.diem_di_diem_den || 'Không xác định';

            if (!routeGroups[route]) {
                routeGroups[route] = {
                    temDi: [],
                    temVe: [],
                    theTich: []
                };
            }

            // Assume first half are "tem chiều đi", second half are "tem chiều về"
            const maTems = Array.isArray(trip.ma_tem) ? trip.ma_tem : [trip.ma_tem];
            const midPoint = Math.ceil(maTems.length / 2);

            routeGroups[route].temDi.push(...maTems.slice(0, midPoint));
            routeGroups[route].temVe.push(...maTems.slice(midPoint));

            if (trip.the_tich) {
                routeGroups[route].theTich.push(trip.the_tich);
            }
        });

        // Display grouped data
        for (const route in routeGroups) {
            const row = document.createElement('tr');

            const group = routeGroups[route];
            const temDi = group.temDi.join(', ');
            const temVe = group.temVe.join(', ');
            const theTich = group.theTich.join(', ');

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
 * Xuất dữ liệu J&T ra file Excel
 */
function exportJNTToExcel() {
    if (!jntFilteredData || jntFilteredData.length === 0) {
        alert('Không có dữ liệu để xuất. Vui lòng chọn bộ lọc và có dữ liệu hiển thị.');
        return;
    }

    try {
        // Lấy loại hiển thị hiện tại
        const displayType = document.getElementById('jntDisplayTypeSelect').value;
        const selectedDate = document.getElementById('jntDateSelect').value || 'all';

        let excelData = [];
        let sheetName = '';
        let fileName = '';

        if (displayType === 'theo-ca') {
            // Xuất dữ liệu theo ca
            sheetName = 'J&T Theo Ca';
            fileName = `JNT_TheoCa_${selectedDate}.xlsx`;

            // Tạo header
            excelData.push(['STT', 'Ngày', 'Biển Số', 'Mã Tem', 'Điểm đi - Điểm đến', 'Thể tích', 'Loại ca']);

            // Thêm dữ liệu
            let stt = 1;
            jntFilteredData.forEach(vehicle => {
                // Gộp tất cả mã tem và điểm đi-đến của các chuyến đi trong ngày
                const allMaTem = [];
                const allDiemDiDen = [];

                vehicle.chi_tiet_chuyen_di.forEach(trip => {
                    // Mã tem - gộp tất cả vào một mảng
                    if (Array.isArray(trip.ma_tem)) {
                        allMaTem.push(...trip.ma_tem);
                    } else if (trip.ma_tem) {
                        allMaTem.push(trip.ma_tem);
                    }

                    // Điểm đi - điểm đến - gộp tất cả vào một mảng
                    if (Array.isArray(trip.diem_di_diem_den)) {
                        allDiemDiDen.push(...trip.diem_di_diem_den);
                    } else if (trip.diem_di_diem_den) {
                        allDiemDiDen.push(trip.diem_di_diem_den);
                    }
                });

                // Gom tất cả mã tem thành một chuỗi, ngăn cách bởi xuống dòng
                const maTem = allMaTem.join('\n');
                
                // Gom tất cả điểm đi-đến thành một chuỗi, ngăn cách bởi " - "
                const diemDiDen = allDiemDiDen.join(' - ');

                // Thêm dòng vào Excel
                excelData.push([
                    stt++,
                    vehicle.ngay,
                    vehicle.bien_so,
                    maTem,
                    diemDiDen,
                    '', // Thể tích - để trống
                    ''  // Loại ca - để trống
                ]);
            });

        } else {
            // Xuất dữ liệu theo tuyến
            sheetName = 'J&T Theo Tuyến';
            fileName = `JNT_TheoTuyen_${selectedDate}.xlsx`;

            // Tạo header
            excelData.push(['STT', 'Ngày', 'Biển Số', 'Điểm đi - Điểm đến', 'Tem chiều đi', 'Tem chiều về', 'Thể tích']);

            // Thêm dữ liệu
            let stt = 1;
            jntFilteredData.forEach(vehicle => {
                // Group trips by route (diem_di_diem_den)
                const routeGroups = {};

                vehicle.chi_tiet_chuyen_di.forEach(trip => {
                    const route = Array.isArray(trip.diem_di_diem_den)
                        ? trip.diem_di_diem_den.join(' - ')
                        : trip.diem_di_diem_den || 'Không xác định';

                    if (!routeGroups[route]) {
                        routeGroups[route] = {
                            temDi: [],
                            temVe: [],
                            theTich: []
                        };
                    }

                    // Assume first half are "tem chiều đi", second half are "tem chiều về"
                    const maTems = Array.isArray(trip.ma_tem) ? trip.ma_tem : [trip.ma_tem];
                    const midPoint = Math.ceil(maTems.length / 2);

                    routeGroups[route].temDi.push(...maTems.slice(0, midPoint));
                    routeGroups[route].temVe.push(...maTems.slice(midPoint));

                    if (trip.the_tich) {
                        routeGroups[route].theTich.push(trip.the_tich);
                    }
                });

                // Thêm dòng cho từng tuyến
                for (const route in routeGroups) {
                    const group = routeGroups[route];
                    excelData.push([
                        stt++,
                        vehicle.ngay,
                        vehicle.bien_so,
                        route,
                        group.temDi.join(', '),
                        group.temVe.join(', '),
                        group.theTich.join(', ')
                    ]);
                }
            });
        }

        // Tạo workbook và worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Định dạng độ rộng cột
        const colWidths = [
            { wch: 5 },  // STT
            { wch: 12 }, // Ngày
            { wch: 12 }, // Biển Số
            { wch: 30 }, // Cột 4
            { wch: 30 }, // Cột 5
            { wch: 30 }, // Cột 6
            { wch: 15 }  // Cột 7
        ];
        ws['!cols'] = colWidths;

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Xuất file
        XLSX.writeFile(wb, fileName);

        console.log('Đã xuất file Excel:', fileName);

    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.');
    }
}

// ===== EVENT LISTENERS =====
function initJNTEventListeners() {
    // Display type change
    const displayTypeSelect = document.getElementById('jntDisplayTypeSelect');
    if (displayTypeSelect) {
        displayTypeSelect.addEventListener('change', applyJNTFilter);
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
            document.getElementById('jntDisplayTypeSelect').value = 'theo-ca';
            document.getElementById('jntDateSelect').value = new Date().toISOString().split('T')[0];
            document.getElementById('jntPlateSelect').value = '';
            document.getElementById('jntRouteSelect').value = '';
            applyJNTFilter();
        });
    }

    // Export Excel button
    const exportBtn = document.getElementById('jntExportExcel');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportJNTToExcel);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initReconciliationTabs();
    initJNTEventListeners();

    // Load J&T data if on reconciliation page
    const doiSoatSection = document.getElementById('doiSoatSection');
    if (doiSoatSection && doiSoatSection.style.display !== 'none') {
        loadJNTData();
    }
});
