// Vehicle page variables
let allVehicleData = [];
let currentMonth = 12;
let currentYear = 2025;

// Initialize vehicle page
async function initVehiclePage() {
    await fetchVehicleData();
    initMonthNavigation();
    renderVehicleTable();
    initPopup();
}

// Fetch vehicle data from Google Apps Script
async function fetchVehicleData() {
    try {
        const url = `${WEB_APP_URL}?action=getVehicleData`;
        console.log('Fetching vehicle data from:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Vehicle data received:', data);

        if (Array.isArray(data) && data.length > 0) {
            allVehicleData = data;
            console.log('Total vehicles:', data.length);
        } else {
            allVehicleData = [];
        }
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        allVehicleData = [];
    }
}

// Initialize month navigation
function initMonthNavigation() {
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    prevMonthBtn.addEventListener('click', () => {
        changeMonth(-1);
    });

    nextMonthBtn.addEventListener('click', () => {
        changeMonth(1);
    });

    updateMonthDisplay();
}

// Change month
function changeMonth(direction) {
    currentMonth += direction;

    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    } else if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }

    updateMonthDisplay();
    renderVehicleTable();
}

// Update month display
function updateMonthDisplay() {
    const monthDisplay = document.getElementById('currentMonthDisplay');
    monthDisplay.textContent = `Tháng ${currentMonth}/${currentYear}`;
}

// Render vehicle table
function renderVehicleTable() {
    const tableBody = document.getElementById('vehicleTableBody');
    tableBody.innerHTML = '';

    // Get days in current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Render rows
    if (allVehicleData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center; padding: 40px;">Không có dữ liệu phương tiện</td>`;
        tableBody.appendChild(row);
        return;
    }

    allVehicleData.forEach((vehicle, index) => {
        const row = createVehicleRow(vehicle, index + 1, daysInMonth);
        tableBody.appendChild(row);
    });
}

// Create vehicle row
function createVehicleRow(vehicle, stt, daysInMonth) {
    const row = document.createElement('tr');

    // Parse activity status JSON
    let activityStatus = {};
    if (vehicle.tinh_trang_hoat_dong) {
        try {
            activityStatus = typeof vehicle.tinh_trang_hoat_dong === 'string'
                ? JSON.parse(vehicle.tinh_trang_hoat_dong)
                : vehicle.tinh_trang_hoat_dong;
        } catch (e) {
            console.error('Error parsing tinh_trang_hoat_dong:', e);
        }
    }

    // Calculate statistics
    const stats = calculateActivityStats(activityStatus, daysInMonth);

    // Create row HTML
    row.innerHTML = `
        <td>${stt}</td>
        <td><strong>${vehicle.bien_kiem_soat || ''}</strong></td>
        <td>${vehicle.nhan || ''}</td>
        <td>${vehicle.tinh_trang || ''}</td>
        <td>${vehicle.trang_thai_trong_ngay || ''}</td>
        <td class="result-cell">
            <div class="result-stats">
                <span class="stat-active">✓ ${stats.active} ngày</span>
                <span class="stat-inactive">✗ ${stats.inactive} ngày</span>
            </div>
        </td>
        <td>
            <button class="view-detail-btn" data-vehicle='${JSON.stringify(vehicle).replace(/'/g, "&apos;")}'>
                Xem chi tiết
            </button>
        </td>
    `;

    // Add click handler for detail button
    const detailBtn = row.querySelector('.view-detail-btn');
    detailBtn.addEventListener('click', () => {
        showVehicleDetail(vehicle, activityStatus, daysInMonth);
    });

    return row;
}

// Calculate activity statistics
function calculateActivityStats(activityStatus, daysInMonth) {
    let active = 0;
    let inactive = 0;

    console.log('Calculating stats for month:', currentMonth, currentYear);
    console.log('Activity status:', activityStatus);
    console.log('Days in month:', daysInMonth);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${day}/${currentMonth}/${currentYear}`;

        if (activityStatus[dateKey] !== undefined) {
            const dayData = activityStatus[dateKey];

            // Check if has so_luong_chuyen or any trip data
            const hasTripData = dayData.so_luong_chuyen && dayData.so_luong_chuyen > 0;
            const hasOtherData = Object.keys(dayData).length > 0 && !dayData.so_luong_chuyen;

            if (hasTripData || hasOtherData) {
                active++;
                console.log(`Day ${day}: Active`, dayData);
            } else {
                inactive++;
                console.log(`Day ${day}: Inactive (empty)`, dayData);
            }
        } else {
            console.log(`Day ${day}: No data`);
        }
    }

    console.log('Final stats:', { active, inactive });
    return { active, inactive };
}

// Show vehicle detail popup
function showVehicleDetail(vehicle, activityStatus, daysInMonth) {
    const popup = document.getElementById('vehicleDetailPopup');

    // Set vehicle info
    document.getElementById('popupBienKiemSoat').textContent = vehicle.bien_kiem_soat || '';
    document.getElementById('popupNhan').textContent = vehicle.nhan || '';
    document.getElementById('popupMonth').textContent = `Tháng ${currentMonth}/${currentYear}`;

    // Render calendar
    renderPopupCalendar(activityStatus, daysInMonth);

    // Show popup
    popup.style.display = 'flex';
}

// Render popup calendar
function renderPopupCalendar(activityStatus, daysInMonth) {
    const calendar = document.getElementById('popupCalendar');
    calendar.innerHTML = '';

    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'popup-calendar-grid';

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();

    // Add day headers
    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day-cell empty';
        calendarGrid.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${day}/${currentMonth}/${currentYear}`;
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;

        const dayStatus = document.createElement('div');
        dayStatus.className = 'day-status';

        // Check activity status
        if (activityStatus[dateKey]) {
            const dayData = activityStatus[dateKey];
            if (Object.keys(dayData).length > 0 && dayData.so_luong_chuyen > 0) {
                cell.classList.add('active');
                dayStatus.innerHTML = `<span class="status-icon">✓</span><span class="trip-count">${dayData.so_luong_chuyen} chuyến</span>`;
            } else {
                cell.classList.add('inactive');
                dayStatus.innerHTML = '<span class="status-icon">✗</span><span class="trip-text">Không hoạt động</span>';
            }
        } else {
            cell.classList.add('no-data');
            dayStatus.innerHTML = '<span class="status-text">-</span>';
        }

        cell.appendChild(dayNumber);
        cell.appendChild(dayStatus);
        calendarGrid.appendChild(cell);
    }

    calendar.appendChild(calendarGrid);

    // Add summary
    const summary = document.createElement('div');
    summary.className = 'calendar-summary';

    const stats = calculateActivityStats(activityStatus, daysInMonth);
    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Tổng ngày hoạt động:</span>
            <span class="summary-value active">${stats.active} ngày</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Tổng ngày không hoạt động:</span>
            <span class="summary-value inactive">${stats.inactive} ngày</span>
        </div>
    `;

    calendar.appendChild(summary);
}

// Initialize popup
function initPopup() {
    const popup = document.getElementById('vehicleDetailPopup');
    const closeBtn = document.getElementById('closePopupBtn');
    const overlay = popup.querySelector('.vehicle-popup-overlay');

    // Close on button click
    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Close on overlay click
    overlay.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.style.display === 'flex') {
            popup.style.display = 'none';
        }
    });
}

// Export initVehiclePage để script.js có thể gọi khi chuyển menu và refresh
window.initVehiclePage = initVehiclePage;
