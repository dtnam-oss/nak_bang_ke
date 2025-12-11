// Google Apps Script Web App URL
// Bạn cần deploy Google Apps Script và lấy URL ở đây
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOuru9de8kUesUXGOeGX3PGzCraa_hXE7uYJD9LidDGzTQkDh9XKkVS63ZvY8i4kKV/exec'; // Thay bằng URL deploy từ Google Apps Script

// Global variables
let allData = [];
let currentData = [];
let currentPage = 1;
const itemsPerPage = 50;

// DOM elements
let customerSelect;
let plateSelect;
let routeSelect;
let fromDateInput;
let toDateInput;
let tableBody;
let noDataEl;
let paginationEl;
let paginationInfoEl;
let currentPageEl;
let totalPagesEl;
let prevBtn;
let nextBtn;

// Initialize DOM elements
function initDOMElements() {
    customerSelect = document.getElementById('customerSelect');
    plateSelect = document.getElementById('plateSelect');
    routeSelect = document.getElementById('routeSelect');
    fromDateInput = document.getElementById('fromDate');
    toDateInput = document.getElementById('toDate');
    tableBody = document.getElementById('tableBody');
    noDataEl = document.getElementById('noData');
    paginationEl = document.getElementById('pagination');
    paginationInfoEl = document.getElementById('paginationInfo');
    currentPageEl = document.getElementById('currentPage');
    totalPagesEl = document.getElementById('totalPages');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
}

// Initialize the page
async function init() {
    initDOMElements();
    if (fromDateInput && toDateInput) {
        setDefaultDates();
    }
    await fetchDataFromGoogleSheets();
    populateFilters();
    renderTable(currentData);
    attachEventListeners();
}

// Fetch data from Google Apps Script Web App
async function fetchDataFromGoogleSheets() {
    try {
        const url = `${WEB_APP_URL}?action=getData`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            allData = data;
            currentData = [...allData];
        } else {
            allData = [];
            currentData = [];
        }
    } catch (error) {
        console.error('Error fetching data from Google Apps Script:', error);
        // Fallback to empty data
        allData = [];
        currentData = [];
    }
}

// Populate filter dropdowns with unique values from data
function populateFilters() {
    if (!plateSelect || !customerSelect || !routeSelect) return;

    // Get unique plates
    const plates = [...new Set(allData.map(item => item.bien_kiem_soat).filter(Boolean))].sort();
    plates.forEach(plate => {
        const option = document.createElement('option');
        option.value = plate;
        option.textContent = plate;
        plateSelect.appendChild(option);
    });

    // Get unique customers
    const customers = [...new Set(allData.map(item => item.ten_khach_hang).filter(Boolean))].sort();
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer;
        option.textContent = customer;
        customerSelect.appendChild(option);
    });

    // Get unique route types
    const routes = [...new Set(allData.map(item => item.loai_tuyen_khach_hang).filter(Boolean))].sort();
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        routeSelect.appendChild(option);
    });
}

// Set default dates (last 30 days)
function setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    toDateInput.value = formatDateForInput(today);
    fromDateInput.value = formatDateForInput(thirtyDaysAgo);
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    // If already in DD/MM/YYYY format
    if (dateString.includes('/')) return dateString;
    // If in YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Format trip details from JSON object
function formatTripDetails(chiTiet) {
    if (!chiTiet) return '';

    if (typeof chiTiet === 'string') {
        return chiTiet;
    }

    if (Array.isArray(chiTiet)) {
        return chiTiet.map(item => {
            const parts = [];
            if (item.lo_trinh) parts.push(`<strong>Lộ trình:</strong> ${item.lo_trinh}`);
            if (item.lo_trinh_chi_tiet_theo_diem) parts.push(`<strong>Chi tiết:</strong> ${item.lo_trinh_chi_tiet_theo_diem}`);
            if (item.loai_diem) parts.push(`<strong>Loại:</strong> ${item.loai_diem}`);
            if (item.ma_chuyen_di_kh) parts.push(`<strong>Mã:</strong> ${item.ma_chuyen_di_kh}`);
            return parts.join('<br>');
        }).join('<br><hr style="margin: 5px 0; border: none; border-top: 1px solid rgba(102, 126, 234, 0.2);">');
    }

    return JSON.stringify(chiTiet);
}

// Render table with data
function renderTable(data) {
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (data.length === 0) {
        if (noDataEl) noDataEl.style.display = 'block';
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) tableContainer.style.display = 'none';
        if (paginationEl) paginationEl.style.display = 'none';
        return;
    }

    if (noDataEl) noDataEl.style.display = 'none';
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) tableContainer.style.display = 'block';

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    const paginatedData = data.slice(startIndex, endIndex);

    // Render rows
    paginatedData.forEach((item, index) => {
        const row = document.createElement('tr');
        const globalIndex = startIndex + index + 1;

        row.innerHTML = `
            <td>${globalIndex}</td>
            <td>${formatDateForDisplay(item.ngay_tao || '')}</td>
            <td>${item.bien_kiem_soat || ''}</td>
            <td>${item.ten_khach_hang || ''}</td>
            <td>${item.loai_tuyen_khach_hang || ''}</td>
            <td style="white-space: normal; font-size: 0.9em;">${formatTripDetails(item.chi_tiet_chuyen_di)}</td>
        `;

        tableBody.appendChild(row);
    });

    // Update pagination controls
    updatePaginationControls(data.length, totalPages, startIndex, endIndex);
}

// Update pagination controls
function updatePaginationControls(totalItems, totalPages, startIndex, endIndex) {
    if (!paginationEl) return;

    if (totalItems <= itemsPerPage) {
        paginationEl.style.display = 'none';
        return;
    }

    paginationEl.style.display = 'flex';
    if (paginationInfoEl) paginationInfoEl.textContent = `Hiển thị ${startIndex + 1}-${endIndex} / ${totalItems} chuyến`;
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// Filter data
function filterData() {
    if (!customerSelect || !plateSelect || !routeSelect || !fromDateInput || !toDateInput) {
        return;
    }

    const selectedCustomer = customerSelect.value;
    const selectedPlate = plateSelect.value;
    const selectedRoute = routeSelect.value;
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    let filteredData = [...allData];

    // Filter by plate
    if (selectedPlate) {
        filteredData = filteredData.filter(item => item.bien_kiem_soat === selectedPlate);
    }

    // Filter by customer
    if (selectedCustomer) {
        filteredData = filteredData.filter(item => item.ten_khach_hang === selectedCustomer);
    }

    // Filter by route type
    if (selectedRoute) {
        filteredData = filteredData.filter(item => item.loai_tuyen_khach_hang === selectedRoute);
    }

    // Filter by date range
    if (fromDate || toDate) {
        filteredData = filteredData.filter(item => {
            const itemDate = convertDateToYYYYMMDD(item.ngay_tao);
            if (!itemDate) return false;

            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            return true;
        });
    }

    currentData = filteredData;
    currentPage = 1; // Reset to first page when filtering
    renderTable(currentData);
}

// Convert DD/MM/YYYY to YYYY-MM-DD for comparison
function convertDateToYYYYMMDD(dateString) {
    if (!dateString) return null;
    if (dateString.includes('-')) return dateString; // Already in YYYY-MM-DD

    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Reset filters
function resetFilters() {
    if (!customerSelect || !plateSelect || !routeSelect) return;

    customerSelect.value = '';
    plateSelect.value = '';
    routeSelect.value = '';
    if (fromDateInput && toDateInput) {
        setDefaultDates();
    }
    currentData = [...allData];
    currentPage = 1;
    renderTable(currentData);
}

// Pagination handlers
function goToNextPage() {
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable(currentData);
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable(currentData);
    }
}

// Attach event listeners
function attachEventListeners() {
    // Auto-filter when any filter changes
    if (customerSelect) customerSelect.addEventListener('change', filterData);
    if (plateSelect) plateSelect.addEventListener('change', filterData);
    if (routeSelect) routeSelect.addEventListener('change', filterData);
    if (fromDateInput) fromDateInput.addEventListener('change', filterData);
    if (toDateInput) toDateInput.addEventListener('change', filterData);

    // Pagination buttons
    if (prevBtn) prevBtn.addEventListener('click', goToPrevPage);
    if (nextBtn) nextBtn.addEventListener('click', goToNextPage);
}

// Navigation menu handling
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Get page name
            const page = this.getAttribute('data-page');

            // Hide all page sections
            document.querySelectorAll('.page-section').forEach(section => {
                section.style.display = 'none';
            });

            // Show selected page
            switch(page) {
                case 'bao-cao':
                    document.getElementById('baoCaoSection').style.display = 'block';
                    if (typeof initReportPage === 'function') {
                        initReportPage();
                    }
                    break;
                case 'doi-soat':
                    document.getElementById('doiSoatSection').style.display = 'block';
                    break;
                case 'phuong-tien':
                    document.getElementById('phuongTienSection').style.display = 'block';
                    if (typeof initVehiclePage === 'function') {
                        initVehiclePage();
                    }
                    break;
                case 'nhien-lieu':
                    showNotification(`Trang "${this.textContent}" đang được xây dựng`);
                    // Show doi-soat as default
                    document.getElementById('doiSoatSection').style.display = 'block';
                    // Re-activate doi-soat link
                    navLinks.forEach(l => {
                        if (l.getAttribute('data-page') === 'doi-soat') {
                            l.classList.add('active');
                        } else if (l === this) {
                            l.classList.remove('active');
                        }
                    });
                    break;
            }
        });
    });
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    initNavigation();
});
