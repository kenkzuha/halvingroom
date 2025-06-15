document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    initializeModals();
    
    // Price refresh functionality
    initializePriceRefresh();
    
    // Charts initialization
    initializePortfolioChart();
    initializeAssetAllocationChart();
    
    // Time period buttons for portfolio chart
    initializeTimeButtons();
});

/**
 * Initialize all modal functionality
 */
function initializeModals() {
    // Add Asset Modal
    const addModal = document.getElementById("addAssetModal");
    const addBtn = document.getElementById("addAssetButton");
    const closeAddModal = document.getElementById("closeModal");

    if (addBtn) {
        addBtn.onclick = function() {
            addModal.style.display = "block";
        }
    }
    
    if (closeAddModal) {
        closeAddModal.onclick = function() {
            addModal.style.display = "none";
        }
    }

    // Edit Asset Modal
    const editModal = document.getElementById("editAssetModal");
    const closeEditModal = document.getElementById("closeEditModal");
    
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const assetId = this.getAttribute('data-id');
            const symbol = this.getAttribute('data-symbol');
            const holdings = this.getAttribute('data-holdings');
            
            document.getElementById('edit_asset_id').value = assetId;
            document.getElementById('edit_symbol').value = symbol;
            document.getElementById('edit_holdings').value = holdings;
            
            editModal.style.display = "block";
        });
    });
    
    if (closeEditModal) {
        closeEditModal.onclick = function() {
            editModal.style.display = "none";
        }
    }

    // Delete Asset Modal
    const deleteModal = document.getElementById("deleteAssetModal");
    const closeDeleteModal = document.getElementById("closeDeleteModal");
    const cancelDeleteBtn = document.getElementById("cancelDelete");
    
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const assetId = this.getAttribute('data-id');
            const symbol = this.getAttribute('data-symbol');
            
            document.getElementById('delete_asset_id').value = assetId;
            document.getElementById('delete_asset_symbol').textContent = symbol;
            
            deleteModal.style.display = "block";
        });
    });
    
    if (closeDeleteModal) {
        closeDeleteModal.onclick = function() {
            deleteModal.style.display = "none";
        }
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.onclick = function() {
            deleteModal.style.display = "none";
        }
    }
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target == addModal) {
            addModal.style.display = "none";
        }
        if (event.target == editModal) {
            editModal.style.display = "none";
        }
        if (event.target == deleteModal) {
            deleteModal.style.display = "none";
        }
    }

    const addOverall = document.getElementById("Overallprofit");
    const addbtn = document.getElementById("changeElement");
    const closeAddOverall = document.getElementById("closeOverallProfit");

    if (addbtn) {
        addbtn.onclick = function() {
            addOverall.style.display = "block";
        }
    }
    
    if (closeAddOverall) {
        closeAddOverall.onclick = function() {
            addOverall.style.display = "none";
        }
    }
}

/**
 * Initialize price refresh functionality
 */
function initializePriceRefresh() {
    const refreshButton = document.getElementById("refreshButton");
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            
            fetch('/refresh_prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Error refreshing prices: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Network error while refreshing prices');
            })
            .finally(() => {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Prices';
            });
        });
        
        // Auto refresh prices every 5 minutes (300000 ms)
        setupAutoRefresh();
    }
}

/**
 * Set up automatic price refresh every 5 minutes
 */
function setupAutoRefresh() {
    const AUTO_REFRESH_INTERVAL = 30000;
    
    setInterval(() => {
        if (document.getElementById("refreshButton")) {
            console.log("Auto-refreshing prices...");
            fetch('/refresh_prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('totalValue').innerText = '$' + parseFloat(data.total_value).toFixed(2);
                }
            })
            .catch(error => {
                console.error('Auto-refresh error:', error);
            });
        }
    }, AUTO_REFRESH_INTERVAL);
}

/**
 * Updated time period buttons handler
 */
function initializeTimeButtons() {
    const timeButtons = document.querySelectorAll('.time-button');
    
    if (!timeButtons.length) return;
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the time period
            const period = this.getAttribute('data-period');
            
            let newLabels, newData, yAxisMin, yAxisMax;
            
            // Update chart based on selected period
            switch(period) {
                case '24h':
                    newLabels = window.timeLabels; // Use time labels
                    newData = window.hourlyData; // Use hourly data
                    yAxisMin = Math.min(...window.hourlyData) * 0.98;
                    yAxisMax = Math.max(...window.hourlyData) * 1.02;
                    break;
                case '7d':
                    newLabels = window.dates.slice(-7);
                    newData = window.portfolioData.slice(-7);
                    yAxisMin = Math.min(...window.portfolioData.slice(-7)) * 0.98;
                    yAxisMax = Math.max(...window.portfolioData.slice(-7)) * 1.02;
                    break;
                case '30d':
                    newLabels = window.dates.slice(-30);
                    newData = window.portfolioData.slice(-30);
                    yAxisMin = Math.min(...window.portfolioData.slice(-30)) * 0.98;
                    yAxisMax = Math.max(...window.portfolioData.slice(-30)) * 1.02;
                    break;
                case '90d':
                    // For 90d, we'll extend the data array
                    newLabels = window.dates.slice(-30); // Use available data
                    newData = window.portfolioData.slice(-30);
                    yAxisMin = Math.min(...window.portfolioData.slice(-30)) * 0.98;
                    yAxisMax = Math.max(...window.portfolioData.slice(-30)) * 1.02;
                    break;
                case '1y':
                    newLabels = window.dates.slice(-30); // Use available data
                    newData = window.portfolioData.slice(-30);
                    yAxisMin = Math.min(...window.portfolioData.slice(-30)) * 0.98;
                    yAxisMax = Math.max(...window.portfolioData.slice(-30)) * 1.02;
                    break;
                case 'all':
                    newLabels = window.dates;
                    newData = window.portfolioData;
                    yAxisMin = Math.min(...window.portfolioData) * 0.98;
                    yAxisMax = Math.max(...window.portfolioData) * 1.02;
                    break;
                default:
                    newLabels = window.dates.slice(-30);
                    newData = window.portfolioData.slice(-30);
                    yAxisMin = Math.min(...window.portfolioData.slice(-30)) * 0.98;
                    yAxisMax = Math.max(...window.portfolioData.slice(-30)) * 1.02;
            }
            
            // Update chart data
            window.portfolioChart.data.labels = newLabels;
            window.portfolioChart.data.datasets[0].data = newData;
            
            // Update Y-axis range
            window.portfolioChart.options.scales.y.min = yAxisMin;
            window.portfolioChart.options.scales.y.max = yAxisMax;
            
            // Update the chart
            window.portfolioChart.update();
        });
    });
}
/**
 * Initialize portfolio chart with time-based labels for 24h period
 */
function initializePortfolioChart() {
    const portfolioChartElement = document.getElementById('portfolioChart');
    if (!portfolioChartElement) return;
    
    const ctx = portfolioChartElement.getContext('2d');
    
    // Generate different date/time arrays for different periods
    window.dates = [];
    window.timeLabels = []; // New array for 24h time labels
    
    // Generate regular dates (for 7d, 30d, etc.)
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        window.dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Generate 24-hour time labels (every hour for last 24 hours)
    for (let i = 23; i >= 0; i--) {
        const timePoint = new Date();
        timePoint.setHours(timePoint.getHours() - i);
        const timeString = timePoint.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false // Use 24-hour format, change to true for 12-hour format
        });
        window.timeLabels.push(timeString);
    }
    
    // Extract current portfolio value
    let totalValueElement = document.getElementById('totalValue');
    let currentPortfolioValue = 0;
    
    if (totalValueElement) {
        const valueText = totalValueElement.innerText || totalValueElement.textContent;
        currentPortfolioValue = parseFloat(valueText.replace(/[^0-9.-]+/g, '')) || 0;
    }
    
    // Generate data for 30 days (regular periods)
    let baseValue = currentPortfolioValue * 0.8;
    window.portfolioData = [];
    for (let i = 0; i < 30; i++) {
        const dailyChange = baseValue * (Math.random() * 0.027 - 0.012);
        baseValue += dailyChange;
        window.portfolioData.push(Math.round(baseValue));
    }
    window.portfolioData[window.portfolioData.length - 1] = Math.round(currentPortfolioValue);
    
    // Generate data for 24 hours (hourly data)
    let hourlyBaseValue = currentPortfolioValue * 0.95;
    window.hourlyData = [];
    for (let i = 0; i < 24; i++) {
        const hourlyChange = hourlyBaseValue * (Math.random() * 0.008 - 0.004); // Smaller hourly changes
        hourlyBaseValue += hourlyChange;
        window.hourlyData.push(Math.round(hourlyBaseValue));
    }
    window.hourlyData[window.hourlyData.length - 1] = Math.round(currentPortfolioValue);
    
    // Gradient fill
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 200);
    gradientFill.addColorStop(0, 'rgba(247, 147, 26, 0.6)');
    gradientFill.addColorStop(0.8, 'rgba(247, 147, 26, 0.1)');
    gradientFill.addColorStop(1, 'rgba(247, 147, 26, 0)');
    
    // Initialize with 24h data (time labels)
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: window.timeLabels, // Start with time labels for 24h view
            datasets: [{
                label: 'Portfolio Value',
                data: window.hourlyData, // Start with hourly data
                borderColor: '#f7931a',
                backgroundColor: gradientFill,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#f7931a',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#181e26',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '$ ' + Math.round(context.parsed.y).toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: {
                        display: true,
                        color: '#718096',
                        font: { size: 10 },
                        maxRotation: 0,
                        maxTicksLimit: 6
                    }
                },
                y: {
                    grid: { color: 'rgba(45, 55, 72, 0.3)', drawBorder: false },
                    ticks: {
                        display: true,
                        color: '#718096',
                        font: { size: 10 },
                        callback: function(value) {
                            return '$ ' + Math.round(value).toLocaleString();
                        },
                        maxTicksLimit: 5
                    },
                    min: Math.min(...window.hourlyData) * 0.98,
                    max: Math.max(...window.hourlyData) * 1.02
                }
            },
            interaction: { intersect: false, mode: 'index' },
            elements: { line: { tension: 0.3 } }
        }
    });
}

/**
 * Initialize asset allocation chart with sorted data
 */
function initializeAssetAllocationChart() {
    const canvas = document.getElementById('assetAllocationChart');
    if (!canvas) {
        console.error('Allocation chart canvas not found');
        return;
    }

    // Safely destroy previous chart if it exists
    if (window.assetAllocationChart && typeof window.assetAllocationChart.destroy === 'function') {
        try {
            window.assetAllocationChart.destroy();
        } catch (e) {
            console.warn('Error destroying previous chart:', e);
        }
    }

    const ctx = canvas.getContext('2d');
    const allocationItems = document.querySelectorAll('.allocation-item');
    const noAssetOverlay = document.getElementById('noAssetOverlay');

    // Check if we have valid assets
    let hasAssets = false;
    let assetData = [];
    
    allocationItems.forEach(item => {
        const nameElement = item.querySelector('.allocation-name');
        const percentElement = item.querySelector('.allocation-percentage');
        const colorElement = item.querySelector('.allocation-color');

        if (nameElement && percentElement && !nameElement.textContent.includes('No assets')) {
            hasAssets = true;
            const symbol = nameElement.textContent.trim();
            const percentage = parseFloat(percentElement.textContent);
            
            // Get color from class
            let color = '#f7931a'; // default BTC color
            if (colorElement.classList.contains('btc')) color = '#f7931a';
            else if (colorElement.classList.contains('eth')) color = '#627eea';
            else if (colorElement.classList.contains('sol')) color = '#00ffbd';
            else if (colorElement.classList.contains('bnb')) color = '#f3ba2f';
            else if (colorElement.classList.contains('xrp')) color = '#346aa9';
            else if (colorElement.classList.contains('pepe')) color = '#069420';
            else if (colorElement.classList.contains('usdt')) color = '#26a17b';
            else if (colorElement.classList.contains('sui')) color = '#006afd';

            assetData.push({
                symbol: symbol,
                percentage: percentage,
                color: color
            });
        }
    });

    // Toggle overlay
    if (noAssetOverlay) {
        noAssetOverlay.style.display = hasAssets ? 'none' : 'flex';
    }

    if (hasAssets) {
        // Sort by percentage (highest to lowest)
        assetData.sort((a, b) => b.percentage - a.percentage);
        
        const labels = assetData.map(item => item.symbol);
        const data = assetData.map(item => item.percentage);
        const backgroundColors = assetData.map(item => item.color);

        try {
            window.assetAllocationChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: '#181e26',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.raw.toFixed(2)}%`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Error creating allocation chart:', e);
        }
    } else {
        // Clear canvas if no assets
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// bagian 24hr changes
document.addEventListener("DOMContentLoaded", function () {
    const rows = document.querySelectorAll("#assetTableBody tr[data-symbol]");

    rows.forEach(row => {
        const symbol = row.getAttribute("data-symbol").toUpperCase() + "USDT";
        const changeCell = row.querySelector(".change");

        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch Binance API");
                return response.json();
            })
            .then(data => {
                const percentChange = parseFloat(data.priceChangePercent).toFixed(2);
                changeCell.textContent = `${percentChange > 0 ? '+' : ''}${percentChange}%`;
                changeCell.classList.remove("positive", "negative");

                if (percentChange >= 0) {
                    changeCell.classList.add("positive");
                    changeCell.innerHTML = `<div class="colornaik"><i class="fas fa-caret-up"></i> ${percentChange}%</div>`;
                } else {
                    changeCell.classList.add("negative");
                    changeCell.innerHTML = `<div class="colorturun"><i class="fas fa-caret-down"></i> ${percentChange}%</div>`;
                }
            })
            .catch(error => {
                console.error(`Error fetching price for ${symbol}:`, error);
                changeCell.textContent = "N/A";
            });
    });
});

// Enhanced Portfolio Summary Change Display
document.addEventListener("DOMContentLoaded", () => {
    const totalValueEl = document.getElementById("totalValue");
    const changeEl = document.getElementById("changeDisplay");

    // Validation checks
    if (!totalValueEl || !changeEl) {
        console.error("Required elements not found");
        return;
    }

    // Extract current value from text content
    const currentValueText = totalValueEl.textContent || totalValueEl.innerText || "";
    const currentValue = parseFloat(currentValueText.replace(/[^0-9.-]/g, ""));
    
    // Get previous value from data attribute or localStorage as fallback
    const previousValueText = totalValueEl.dataset.previous || localStorage.getItem('previousPortfolioValue') || currentValue.toString();
    const previousValue = parseFloat(previousValueText);

    // Store current value for next time (if using localStorage fallback)
    if (!totalValueEl.dataset.previous) {
        localStorage.setItem('previousPortfolioValue', currentValue.toString());
    }

    // Validation for numeric values
    if (isNaN(currentValue) || isNaN(previousValue)) {
        console.error("Invalid numeric values:", { currentValue, previousValue });
        changeEl.innerHTML = '<span style="color: #6c757d;">N/A</span>';
        return;
    }

    // Calculate difference and percentage
    const difference = currentValue - previousValue;
    const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
    const isGain = difference > 0;
    const isLoss = difference < 0;
    const isNeutral = difference === 0;

    // Determine colors and icons
    let textColor, arrow;
    
    if (isNeutral) {
        textColor = "#6c757d"; // Gray for neutral
        arrow = '<i class="fas fa-minus"></i>';
    } else if (isGain) {
        textColor = "#28a745"; // Green for gains   
        arrow = '<i class="fas fa-caret-up"></i>';
    } else if (isLoss) {
        textColor = "#dc3545"; // Red for losses
        arrow = '<i class="fas fa-caret-down"></i>';
    }

    // Format the display
    const formattedPercentage = Math.abs(percentage).toFixed(2);
    const formattedDifference = Math.abs(difference).toFixed(2);
    
    // Update the change element
    changeEl.innerHTML = `
        ${arrow} ${formattedPercentage}%
        (<span style="color:${textColor}">$${formattedDifference}</span>)
    `;
    changeEl.style.color = textColor;

    // Optional: Add animation class for visual feedback
    changeEl.classList.add('portfolio-change-updated');
    
    // Log for debugging (remove in production)
    console.log('Portfolio Change Updated:', {
        currentValue,
        previousValue,
        difference,
        percentage: `${formattedPercentage}%`
    });
});