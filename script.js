// Sample data - Dữ liệu mẫu cho bảng kê
const sampleData = [
    {
        id: 1,
        customerName: 'Nguyễn Văn A',
        customerId: 'customer1',
        plate: '29A-12345',
        route: 'HN-HP',
        date: '2024-12-01',
        orderId: 'DH001',
        amount: 5000000,
        status: 'paid',
        note: 'Đã thanh toán đầy đủ'
    },
    {
        id: 2,
        customerName: 'Trần Thị B',
        customerId: 'customer2',
        plate: '30G-67890',
        route: 'HN-HCM',
        date: '2024-12-02',
        orderId: 'DH002',
        amount: 3500000,
        status: 'pending',
        note: 'Chờ xác nhận'
    },
    {
        id: 3,
        customerName: 'Lê Văn C',
        customerId: 'customer3',
        plate: '29A-12345',
        route: 'HN-DN',
        date: '2024-12-03',
        orderId: 'DH003',
        amount: 7200000,
        status: 'paid',
        note: 'Hoàn thành'
    },
    {
        id: 4,
        customerName: 'Phạm Thị D',
        customerId: 'customer4',
        plate: '51F-23456',
        route: 'HN-HP',
        date: '2024-12-04',
        orderId: 'DH004',
        amount: 2800000,
        status: 'cancelled',
        note: 'Đã hủy đơn'
    },
    {
        id: 5,
        customerName: 'Hoàng Văn E',
        customerId: 'customer5',
        plate: '30G-67890',
        route: 'HN-HCM',
        date: '2024-11-28',
        orderId: 'DH005',
        amount: 4500000,
        status: 'paid',
        note: 'Thanh toán qua chuyển khoản'
    },
    {
        id: 6,
        customerName: 'Nguyễn Văn A',
        customerId: 'customer1',
        plate: '29A-12345',
        route: 'HN-DN',
        date: '2024-11-25',
        orderId: 'DH006',
        amount: 6000000,
        status: 'paid',
        note: 'Đã giao hàng'
    },
    {
        id: 7,
        customerName: 'Trần Thị B',
        customerId: 'customer2',
        plate: '51F-23456',
        route: 'HN-HP',
        date: '2024-11-20',
        orderId: 'DH007',
        amount: 1500000,
        status: 'pending',
        note: 'Đang xử lý'
    },
    {
        id: 8,
        customerName: 'Lê Văn C',
        customerId: 'customer3',
        plate: '30G-67890',
        route: 'HN-HCM',
        date: '2024-11-15',
        orderId: 'DH008',
        amount: 8900000,
        status: 'paid',
        note: 'Hoàn thành xuất sắc'
    }
];

// Global variables
let currentData = [...sampleData];

// DOM elements
const customerSelect = document.getElementById('customerSelect');
const plateSelect = document.getElementById('plateSelect');
const routeSelect = document.getElementById('routeSelect');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');
const tableBody = document.getElementById('tableBody');
const totalAmountEl = document.getElementById('totalAmount');
const noDataEl = document.getElementById('noData');

// Initialize the page
function init() {
    populateFilters();
    renderTable(currentData);
    setDefaultDates();
    attachEventListeners();
}

// Populate filter dropdowns with unique values from data
function populateFilters() {
    // Get unique plates
    const plates = [...new Set(sampleData.map(item => item.plate))].sort();
    plates.forEach(plate => {
        const option = document.createElement('option');
        option.value = plate;
        option.textContent = plate;
        plateSelect.appendChild(option);
    });

    // Get unique routes
    const routes = [...new Set(sampleData.map(item => item.route))].sort();
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

// Format date for display (DD/MM/YYYY)
function formatDateForDisplay(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Format currency (VNĐ)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

// Get status label and class
function getStatusDisplay(status) {
    const statusMap = {
        'paid': { label: 'Đã thanh toán', class: 'status-paid' },
        'pending': { label: 'Chờ xử lý', class: 'status-pending' },
        'cancelled': { label: 'Đã hủy', class: 'status-cancelled' }
    };
    return statusMap[status] || { label: status, class: '' };
}

// Render table with data
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        noDataEl.style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
        totalAmountEl.textContent = '0';
        return;
    }
    
    noDataEl.style.display = 'none';
    document.querySelector('.table-container').style.display = 'block';
    
    let total = 0;
    
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const statusDisplay = getStatusDisplay(item.status);
        
        // Only add to total if status is 'paid'
        if (item.status === 'paid') {
            total += item.amount;
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.customerName}</td>
            <td>${formatDateForDisplay(item.date)}</td>
            <td>${item.orderId}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td><span class="${statusDisplay.class}">${statusDisplay.label}</span></td>
            <td>${item.note}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    totalAmountEl.textContent = formatCurrency(total);
}

// Filter data
function filterData() {
    const selectedCustomer = customerSelect.value;
    const selectedPlate = plateSelect.value;
    const selectedRoute = routeSelect.value;
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    let filteredData = [...sampleData];

    // Filter by customer
    if (selectedCustomer) {
        filteredData = filteredData.filter(item => item.customerId === selectedCustomer);
    }

    // Filter by plate
    if (selectedPlate) {
        filteredData = filteredData.filter(item => item.plate === selectedPlate);
    }

    // Filter by route
    if (selectedRoute) {
        filteredData = filteredData.filter(item => item.route === selectedRoute);
    }

    // Filter by date range
    if (fromDate) {
        filteredData = filteredData.filter(item => item.date >= fromDate);
    }

    if (toDate) {
        filteredData = filteredData.filter(item => item.date <= toDate);
    }

    currentData = filteredData;
    renderTable(currentData);
}

// Reset filters
function resetFilters() {
    customerSelect.value = '';
    plateSelect.value = '';
    routeSelect.value = '';
    setDefaultDates();
    currentData = [...sampleData];
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

// Export data function (có thể sử dụng cho tính năng xuất Excel)
function exportData() {
    // This function can be extended to export data to Excel or CSV
    console.log('Export data:', currentData);
}
