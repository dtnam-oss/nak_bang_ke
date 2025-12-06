// Google Apps Script Web App URL
// Bạn cần deploy Google Apps Script và lấy URL ở đây
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOuru9de8kUesUXGOeGX3PGzCraa_hXE7uYJD9LidDGzTQkDh9XKkVS63ZvY8i4kKV/exec'; // Thay bằng URL deploy từ Google Apps Script

// Global variables
let allData = [];
let currentData = [];

// DOM elements
const customerSelect = document.getElementById('customerSelect');
const plateSelect = document.getElementById('plateSelect');
const routeSelect = document.getElementById('routeSelect');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');
const tableBody = document.getElementById('tableBody');
const totalTripsEl = document.getElementById('totalTrips');
const noDataEl = document.getElementById('noData');

// Initialize the page
async function init() {
    setDefaultDates();
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
            if (item.lo_trinh) parts.push(`Lộ trình: ${item.lo_trinh}`);
            if (item.lo_trinh_chi_tiet_theo_diem) parts.push(`Chi tiết: ${item.lo_trinh_chi_tiet_theo_diem}`);
            if (item.loai_diem) parts.push(`Loại: ${item.loai_diem}`);
            if (item.ma_chuyen_di_kh) parts.push(`Mã: ${item.ma_chuyen_di_kh}`);
            return parts.join('<br>');
        }).join('<br><hr style="margin: 5px 0;">');
    }

    return JSON.stringify(chiTiet);
}

// Render table with data
function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        noDataEl.style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
        totalTripsEl.textContent = '0';
        return;
    }

    noDataEl.style.display = 'none';
    document.querySelector('.table-container').style.display = 'block';

    data.forEach((item, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDateForDisplay(item.ngay_tao || '')}</td>
            <td>${item.bien_kiem_soat || ''}</td>
            <td>${item.ten_khach_hang || ''}</td>
            <td>${item.ma_chuyen_di || ''}</td>
            <td>${item.loai_tuyen_khach_hang || ''}</td>
            <td style="max-width: 300px; white-space: normal;">${formatTripDetails(item.chi_tiet_chuyen_di)}</td>
        `;

        tableBody.appendChild(row);
    });

    totalTripsEl.textContent = data.length;
}

// Filter data
function filterData() {
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
    customerSelect.value = '';
    plateSelect.value = '';
    routeSelect.value = '';
    setDefaultDates();
    currentData = [...allData];
    renderTable(currentData);
}

// Attach event listeners
function attachEventListeners() {
    filterBtn.addEventListener('click', filterData);
    resetBtn.addEventListener('click', resetFilters);

    // Allow filtering with Enter key
    customerSelect.addEventListener('change', filterData);
    plateSelect.addEventListener('change', filterData);
    routeSelect.addEventListener('change', filterData);
    fromDateInput.addEventListener('change', filterData);
    toDateInput.addEventListener('change', filterData);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
