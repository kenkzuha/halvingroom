// frontend.js
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
        refreshButton.addEventListener('click', async function() {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            
            try {
                const response = await fetch('/refresh_prices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                if (data.success) {
                    document.getElementById('totalValue').textContent = '$' + data.total_value.toFixed(2);
                    
                    const activePeriod = document.querySelector('.time-button.active')?.getAttribute('data-period') || '24h';
                    const historyResponse = await fetch(`/portfolio_history/?period=${activePeriod}`);
                    const historyData = await historyResponse.json();
                    
                    if (historyData.success) {
                        window.portfolioChart.data.labels = historyData.data.labels;
                        window.portfolioChart.data.datasets[0].data = historyData.data.data;
                        window.portfolioChart.options.scales.y.min = historyData.data.min;
                        window.portfolioChart.options.scales.y.max = historyData.data.max;
                        window.portfolioChart.update();
                    }
                    
                    showNotification('Prices refreshed successfully!');
                } else {
                    showNotification('Error refreshing prices: ' + data.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Network error while refreshing prices', 'error');
            } finally {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Prices';
            }
        });
        
        // Auto refresh prices every 5 minutes
        setInterval(async () => {
            try {
                const response = await fetch('/refresh_prices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                if (data.success) {
                    document.getElementById('totalValue').textContent = '$' + data.total_value.toFixed(2);
                    
                    if (window.portfolioChart) {
                        const activePeriod = document.querySelector('.time-button.active')?.getAttribute('data-period') || '24h';
                        const historyResponse = await fetch(`/portfolio_history/?period=${activePeriod}`);
                        const historyData = await historyResponse.json();
                        
                        if (historyData.success) {
                            window.portfolioChart.data.labels = historyData.data.labels;
                            window.portfolioChart.data.datasets[0].data = historyData.data.data;
                            window.portfolioChart.options.scales.y.min = historyData.data.min;
                            window.portfolioChart.options.scales.y.max = historyData.data.max;
                            window.portfolioChart.update();
                        }
                    }
                }
            } catch (error) {
                console.error('Auto-refresh error:', error);
            }
        }, 30000);
    }
}

function initializeTimeButtons() {
    const timeButtons = document.querySelectorAll('.time-button');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', async function() {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            
            try {
                const response = await fetch(`/portfolio_history/?period=${period}`);
                const data = await response.json();
                
                if (data.success) {
                    window.portfolioChart.data.labels = data.data.labels;
                    window.portfolioChart.data.datasets[0].data = data.data.data;
                    window.portfolioChart.options.scales.y.min = data.data.min;
                    window.portfolioChart.options.scales.y.max = data.data.max;
                    window.portfolioChart.update();
                }
            } catch (error) {
                console.error('Error fetching portfolio history:', error);
            }
        });
    });
}

/**
 * Initialize portfolio chart with real data
 */
function initializePortfolioChart() {
    const portfolioChartElement = document.getElementById('portfolioChart');
    if (!portfolioChartElement) return;
    
    const historicalDataEl = document.getElementById('historical-data');
    let initialData;
    try {
        initialData = historicalDataEl ? JSON.parse(historicalDataEl.textContent) : {labels: [], data: [], min: 0, max: 100};
    } catch (e) {
        console.error('Error parsing historical data:', e);
        initialData = {labels: [], data: [], min: 0, max: 100};
    }
    
    const ctx = portfolioChartElement.getContext('2d');
    
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 200);
    gradientFill.addColorStop(0, 'rgba(247, 147, 26, 0.6)');
    gradientFill.addColorStop(0.8, 'rgba(247, 147, 26, 0.1)');
    gradientFill.addColorStop(1, 'rgba(247, 147, 26, 0)');
    
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: initialData.labels,
            datasets: [{
                label: 'Portfolio Value',
                data: initialData.data,
                borderColor: '#f7931a',
                backgroundColor: gradientFill,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
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
                            return '$ ' + context.parsed.y.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
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
                            return '$ ' + value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        },
                        maxTicksLimit: 5
                    },
                    min: initialData.min,
                    max: initialData.max
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
    if (!canvas) return;

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
            
            let color = '#f7931a';
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

    if (noAssetOverlay) {
        noAssetOverlay.style.display = hasAssets ? 'none' : 'flex';
    }

    if (hasAssets) {
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 24hr changes
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

// Portfolio Summary Change Display
document.addEventListener("DOMContentLoaded", () => {
    const totalValueEl = document.getElementById("totalValue");
    const changeEl = document.getElementById("changeDisplay");

    if (!totalValueEl || !changeEl) return;

    const currentValueText = totalValueEl.textContent || totalValueEl.innerText || "";
    const currentValue = parseFloat(currentValueText.replace(/[^0-9.-]/g, ""));
    
    const previousValueText = totalValueEl.dataset.previous || localStorage.getItem('previousPortfolioValue') || currentValue.toString();
    const previousValue = parseFloat(previousValueText);

    if (!totalValueEl.dataset.previous) {
        localStorage.setItem('previousPortfolioValue', currentValue.toString());
    }

    if (isNaN(currentValue) || isNaN(previousValue)) {
        changeEl.innerHTML = '<span style="color: #6c757d;">N/A</span>';
        return;
    }

    const difference = currentValue - previousValue;
    const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
    const isGain = difference > 0;
    const isLoss = difference < 0;
    const isNeutral = difference === 0;

    let textColor, arrow;
    
    if (isNeutral) {
        textColor = "#6c757d";
        arrow = '<i class="fas fa-minus"></i>';
    } else if (isGain) {
        textColor = "#28a745";
        arrow = '<i class="fas fa-caret-up"></i>';
    } else if (isLoss) {
        textColor = "#dc3545";
        arrow = '<i class="fas fa-caret-down"></i>';
    }

    const formattedPercentage = Math.abs(percentage).toFixed(2);
    const formattedDifference = Math.abs(difference).toFixed(2);
    
    changeEl.innerHTML = `
        ${arrow} ${formattedPercentage}%
        (<span style="color:${textColor}">$${formattedDifference}</span>)
    `;
    changeEl.style.color = textColor;
    changeEl.classList.add('portfolio-change-updated');
});

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// CSS for notifications
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    transition: opacity 0.5s;
    opacity: 1;
}

.notification.success {
    background-color: #28a745;
}

.notification.error {
    background-color: #dc3545;
}
`;
document.head.appendChild(style);