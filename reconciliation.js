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
        // Call Google Apps Script để lấy dữ liệu
        const response = await fetch(
            `${window.location.origin}?action=getJNTReportData`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        jntReportData = data;

        // Populate filters
        populateJNTFilters(data);

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('jntDateSelect').value = today;

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

// Hiển thị dữ liệu theo ca
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

    data.forEach(vehicle => {
        vehicle.chi_tiet_chuyen_di.forEach(trip => {
            const row = document.createElement('tr');

            // Mã tem - có thể là array
            const maTem = Array.isArray(trip.ma_tem)
                ? trip.ma_tem.join(', ')
                : trip.ma_tem;

            // Điểm đi - điểm đến
            const diemDiDen = Array.isArray(trip.diem_di_diem_den)
                ? trip.diem_di_diem_den.join(' - ')
                : trip.diem_di_diem_den;

            row.innerHTML = `
                <td>${stt++}</td>
                <td>${vehicle.ngay}</td>
                <td>${vehicle.bien_so}</td>
                <td>${maTem || ''}</td>
                <td>${diemDiDen || ''}</td>
                <td>${trip.the_tich || ''}</td>
                <td>${trip.loai_ca || ''}</td>
            `;

            tbody.appendChild(row);
        });
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
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initReconciliationTabs();
    initJNTEventListeners();

    // Load J&T data if on reconciliation page
    const doiSoatSection = document.getElementById('doiSoatSection');
    if (doiSoatSection && !doiSoatSection.style.display === 'none') {
        loadJNTData();
    }
});
