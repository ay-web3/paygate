// app.js

// Utilities
const formatAddress = (addr) => {
    if (!addr) return 'Unknown';
    return \`\${addr.slice(0, 6)}...\${addr.slice(-4)}\`;
};

const formatUSDC = (atomicUnits) => {
    // Assuming 6 decimals for USDC
    const num = Number(atomicUnits) / 1_000_000;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).format(num);
};

const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return \`\${seconds}s ago\`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return \`\${minutes}m ago\`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return \`\${hours}h ago\`;
    return \`\${Math.floor(hours / 24)}d ago\`;
};

// Chart Setup
let revenueChart;
const initChart = () => {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = "'Inter', sans-serif";

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Will be populated dynamically
            datasets: [{
                label: 'Revenue (USDC)',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#09090b',
                pointBorderColor: '#8b5cf6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    titleColor: '#f4f4f5',
                    bodyColor: '#f4f4f5',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => \`$\${context.parsed.y.toFixed(2)}\`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            }
        }
    });
};

// Data Fetching and Updating
const fetchStats = async () => {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        updateUI(data);
    } catch (e) {
        console.error('Error fetching stats:', e);
        // Fallback mock data for visual testing if API fails
        if (location.hostname === 'localhost') {
            updateUI({
                totalRevenueAtomic: "1250000000",
                totalCalls: 1250,
                uniquePayersCount: 42,
                endpoints: [
                    { route: "GET /weather", calls: 800, revenueAtomic: "800000000", uniquePayersCount: 30 },
                    { route: "POST /generate", calls: 450, revenueAtomic: "450000000", uniquePayersCount: 12 }
                ],
                recentTransactions: [
                    { payer: "0x1234567890abcdef1234567890abcdef12345678", amount: "1000000", timestamp: Date.now() - 5000 },
                    { payer: "0x9876543210fedcba9876543210fedcba98765432", amount: "1000000", timestamp: Date.now() - 15000 }
                ]
            });
        }
    }
};

const updateUI = (data) => {
    // Update Stats Grid
    document.getElementById('total-revenue').innerText = formatUSDC(data.totalRevenueAtomic);
    document.getElementById('total-calls').innerText = data.totalCalls.toLocaleString();
    document.getElementById('unique-payers').innerText = data.uniquePayersCount.toLocaleString();

    // Update Endpoints Table
    const tbody = document.getElementById('endpoints-body');
    tbody.innerHTML = '';
    data.endpoints.sort((a, b) => b.calls - a.calls).forEach(ep => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
            <td><span class="route-badge">\${ep.route}</span></td>
            <td>\${ep.calls.toLocaleString()}</td>
            <td>\${formatUSDC(ep.revenueAtomic)}</td>
            <td>\${ep.uniquePayersCount}</td>
        \`;
        tbody.appendChild(tr);
    });

    // Update Transaction Feed
    const feed = document.getElementById('tx-feed');
    feed.innerHTML = '';
    data.recentTransactions.forEach(tx => {
        const item = document.createElement('div');
        item.className = 'tx-item';
        item.innerHTML = \`
            <div class="tx-details">
                <span class="tx-address">\${formatAddress(tx.payer)}</span>
                <span class="tx-time">\${formatTimeAgo(tx.timestamp)}</span>
            </div>
            <div class="tx-amount">+\${formatUSDC(tx.amount)}</div>
        \`;
        feed.appendChild(item);
    });

    // Mock Chart Data update (since we don't have historical data yet)
    updateChart(data.totalRevenueAtomic);
};

let historyData = [0, 0, 0, 0, 0, 0, 0];
const updateChart = (currentTotalAtomic) => {
    const currentTotal = Number(currentTotalAtomic) / 1_000_000;
    
    // Simple mock logic: push current total to end, remove first
    if (historyData[historyData.length - 1] !== currentTotal) {
        historyData.shift();
        historyData.push(currentTotal);
    }

    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 60 * 60 * 1000); // last 6 hours
        labels.push(\`\${d.getHours()}:00\`);
    }

    revenueChart.data.labels = labels;
    
    // To make the chart look like a growing line instead of just flat zeros
    const displayData = historyData.map((v, i) => v === 0 ? (currentTotal * (i/6)) : v);
    
    revenueChart.data.datasets[0].data = displayData;
    revenueChart.update();
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    fetchStats();
    // Poll every 5 seconds
    setInterval(fetchStats, 5000);
});
