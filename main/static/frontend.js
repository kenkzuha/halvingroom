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
    const AUTO_REFRESH_INTERVAL = 300000;
    
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
 * Initialize time period buttons for portfolio chart
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
            
            // Update chart based on selected period
            let days = 30;
            switch(period) {
                case '24h': days = 1; break;
                case '7d': days = 7; break;
                case '30d': days = 30; break;
                case '90d': days = 90; break;
                case '1y': days = 365; break;
                case 'all': days = window.portfolioData.length; break;
            }
            
            const newLabels = window.dates.slice(-days);
            const newData = window.portfolioData.slice(-days);
            
            window.portfolioChart.data.labels = newLabels;
            window.portfolioChart.data.datasets[0].data = newData;
            window.portfolioChart.update();
        });
    });
}

/**
 * Initialize portfolio chart
 */
function initializePortfolioChart() {
    const portfolioChartElement = document.getElementById('portfolioChart');
    if (!portfolioChartElement) return;
    
    const ctx = portfolioChartElement.getContext('2d');
    
    // Generate dates
    window.dates = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        window.dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Extract current portfolio value
    let totalValueElement = document.getElementById('totalValue');
    let currentPortfolioValue = 0;
    
    if (totalValueElement) {
        const valueText = totalValueElement.innerText || totalValueElement.textContent;
        currentPortfolioValue = parseFloat(valueText.replace(/[^0-9.-]+/g, '')) || 0;
    }
    
    // Generate data with rounding
    let baseValue = currentPortfolioValue * 0.8; // Start at 80% of current value
    window.portfolioData = [];
    for (let i = 0; i < 30; i++) {
        const dailyChange = baseValue * (Math.random() * 0.027 - 0.012);
        baseValue += dailyChange;
        window.portfolioData.push(Math.round(baseValue));
    }
    window.portfolioData[window.portfolioData.length - 1] = Math.round(currentPortfolioValue);
    
    // Gradient fill
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 200);
    gradientFill.addColorStop(0, 'rgba(247, 147, 26, 0.6)');
    gradientFill.addColorStop(0.8, 'rgba(247, 147, 26, 0.1)');
    gradientFill.addColorStop(1, 'rgba(247, 147, 26, 0)');
    
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: window.dates,
            datasets: [{
                label: 'Portfolio Value',
                data: window.portfolioData,
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
                    min: Math.min(...window.portfolioData) * 0.98,
                    max: Math.max(...window.portfolioData) * 1.02
                }
            },
            interaction: { intersect: false, mode: 'index' },
            elements: { line: { tension: 0.3 } }
        }
    });
}

/**
 * Initialize asset allocation chart
 */
function initializeAssetAllocationChart() {
    const canvas = document.getElementById('assetAllocationChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const allocationItems = document.querySelectorAll('.allocation-item');

    // Check if there are valid assets
    let hasAssets = false;
    allocationItems.forEach(item => {
        const nameElement = item.querySelector('.allocation-name');
        if (nameElement && !nameElement.textContent.toLowerCase().includes('no assets')) {
            hasAssets = true;
        }
    });
    
    const noAssetOverlay = document.getElementById('noAssetOverlay');
    if (noAssetOverlay) {
        if (hasAssets) {
            noAssetOverlay.style.display = 'none';
        } else {
            noAssetOverlay.style.display = 'flex';
        }
    }

    if (hasAssets) {
        const labels = [];
        const data = [];
        const backgroundColors = [];

        allocationItems.forEach(item => {
            const nameElement = item.querySelector('.allocation-name');
            const percentElement = item.querySelector('.allocation-percentage');
            const colorElement = item.querySelector('.allocation-color');

            if (nameElement && percentElement && !nameElement.textContent.toLowerCase().includes('no assets')) {
                const symbol = nameElement.textContent.trim();
                const percentage = parseFloat(percentElement.textContent);
                labels.push(symbol);
                data.push(percentage);

                let color = '#181e26'; // default color
                if (colorElement?.classList.contains('btc')) color = '#f7931a';
                else if (colorElement?.classList.contains('eth')) color = '#627eea';
                else if (colorElement?.classList.contains('sol')) color = '#00ffbd';
                else if (colorElement?.classList.contains('bnb')) color = '#f3ba2f';
                else if (colorElement?.classList.contains('xrp')) color = '#346aa9';

                backgroundColors.push(color);
            }
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: Array(data.length).fill('#181e26'),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                // This is the critical change to add a space
                                return context.label + " " + context.raw.toFixed(1) + "%";
                            }
                        }
                    }
                }
            }
        });
    } else {
        const noDataPlugin = {
            id: 'noDataText',
            afterDraw(chart) {
                const { width, height } = chart;
                const ctx = chart.ctx;
                ctx.save();
                ctx.clearRect(0, 0, width, height);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#718096';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('No assets', width / 2, height / 2);
                ctx.restore();
            }
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            },
            plugins: [noDataPlugin]
        });
    }
}



function initializeModals() {
    // Add Asset Modal
    const addOverall = document.getElementById("Overall-profit");
    const addBtn = document.getElementById("overall-profit");
    const closeAddOverall = document.getElementById("closeOverallprofit");

    if (addBtn) {
        addBtn.onclick = function() {
            addOverall.style.display = "block";
        }
    }
    
    if (closeAddOverall) {
        closeAddOverall.onclick = function() {
            addOverall.style.display = "none";
        }
    }

}
