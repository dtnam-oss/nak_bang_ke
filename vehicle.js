// Vehicle page variables
let allVehicleData = [];
let currentMonth = 12;
let currentYear = 2025;

// Initialize vehicle page
async function initVehiclePage() {
    await fetchVehicleData();
    initMonthNavigation();
    renderVehicleTable();
}

// Fetch vehicle data from Google Apps Script
async function fetchVehicleData() {
    try {
        const url = `${WEB_APP_URL}?action=getVehicleData`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            allVehicleData = data;
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
    const tableHeader = document.getElementById('vehicleTableHeader');
    const tableBody = document.getElementById('vehicleTableBody');

    // Clear existing content
    tableBody.innerHTML = '';

    // Get days in current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Render header with days
    renderTableHeader(tableHeader, daysInMonth);

    // Render rows
    if (allVehicleData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="${4 + daysInMonth}" style="text-align: center; padding: 40px;">Không có dữ liệu phương tiện</td>`;
        tableBody.appendChild(row);
        return;
    }

    allVehicleData.forEach(vehicle => {
        const row = createVehicleRow(vehicle, daysInMonth);
        tableBody.appendChild(row);
    });
}

// Render table header
function renderTableHeader(tableHeader, daysInMonth) {
    // Remove old day columns
    const existingDayCols = tableHeader.querySelectorAll('.day-header');
    existingDayCols.forEach(col => col.remove());

    // Add day columns
    for (let day = 1; day <= daysInMonth; day++) {
        const th = document.createElement('th');
        th.className = 'day-header';
        th.textContent = day;
        tableHeader.appendChild(th);
    }
}

// Create vehicle row
function createVehicleRow(vehicle, daysInMonth) {
    const row = document.createElement('tr');

    // Fixed columns
    row.innerHTML = `
        <td class="sticky-col">${vehicle.bien_kiem_soat || ''}</td>
        <td class="sticky-col-2">${vehicle.nhan || ''}</td>
        <td class="sticky-col-3">${vehicle.tinh_trang || ''}</td>
        <td class="sticky-col-4">${vehicle.trang_thai_trong_ngay || ''}</td>
    `;

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

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${day}/${currentMonth}/${currentYear}`;
        const td = document.createElement('td');
        td.className = 'day-cell';

        // Check if date exists in activity status
        if (activityStatus[dateKey]) {
            const dayData = activityStatus[dateKey];

            // Determine cell status
            if (Object.keys(dayData).length > 0) {
                // Has data - mark as active
                td.classList.add('active');
                td.textContent = '✓';
                td.title = `${vehicle.bien_kiem_soat} - ${dateKey}: Hoạt động`;
            } else {
                // Empty object - no activity
                td.classList.add('inactive');
                td.textContent = '✗';
                td.title = `${vehicle.bien_kiem_soat} - ${dateKey}: Không hoạt động`;
            }
        } else {
            // Date not in data
            td.classList.add('empty');
            td.textContent = '-';
            td.title = `${vehicle.bien_kiem_soat} - ${dateKey}: Chưa có dữ liệu`;
        }

        // Add click handler
        td.addEventListener('click', () => {
            handleDayCellClick(vehicle, dateKey, td);
        });

        row.appendChild(td);
    }

    return row;
}

// Handle day cell click
function handleDayCellClick(vehicle, dateKey, cellElement) {
    const currentClass = cellElement.classList.contains('active') ? 'active' :
                        cellElement.classList.contains('inactive') ? 'inactive' : 'empty';

    let message = `${vehicle.bien_kiem_soat} - ${dateKey}\n`;

    if (currentClass === 'active') {
        message += 'Trạng thái: Hoạt động ✓';
    } else if (currentClass === 'inactive') {
        message += 'Trạng thái: Không hoạt động ✗';
    } else {
        message += 'Trạng thái: Chưa có dữ liệu';
    }

    showNotification(message);
}
