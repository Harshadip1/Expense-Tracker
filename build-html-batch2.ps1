$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot

$headEnd = @'
  <script src="js/storage.js"></script>
  <script src="js/themes.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/charts.js"></script>
  <script src="js/navigation.js"></script>
  <script src="js/transactions.js"></script>
  <script src="js/budgets.js"></script>
  <script src="js/analytics.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
'@

function New-Page($file, $page, $title, $subtitle, $body) {
  $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title - Expense Tracker</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/themes.css">
  <link rel="stylesheet" href="css/responsive.css">
</head>
<body data-page="$page">
  <div id="particles-bg" class="particles-bg"></div>
  <div id="sidebar-overlay" class="sidebar-overlay"></div>
  <div class="app-wrapper page-enter">
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-logo"><div class="logo-icon">💎</div><h1>Expense Tracker</h1></div>
      <nav id="sidebar-nav"></nav>
    </aside>
    <main class="main-content">
      <div class="top-bar">
        <button id="menu-toggle" class="menu-toggle" aria-label="Menu">☰</button>
        <div class="page-title"><h2>$title</h2><p>$subtitle</p></div>
        <div class="top-actions">
          <div class="search-box"><span class="search-icon">🔍</span><input type="search" id="global-search" placeholder="Search..."></div>
          <div class="notification-bell" id="notification-bell" style="position:relative;cursor:pointer">
            <button class="btn btn-secondary btn-icon">🔔</button>
            <span class="notification-badge" id="notification-count" style="display:none">0</span>
            <div class="notification-dropdown" id="notification-dropdown"><div id="notification-list"></div></div>
          </div>
          <button class="btn btn-secondary btn-icon" id="theme-cycle">🎨</button>
          <a href="add-expense.html" class="btn btn-primary">+ Add</a>
        </div>
      </div>
      $body
    </main>
  </div>
$headEnd
"@
  Set-Content -Path (Join-Path $dir $file) -Value $html -Encoding UTF8
  Write-Host "Created $file"
}

New-Page 'budgets.html' 'budgets' 'Budgets' 'Track spending limits' @'
      <div class="stats-grid reveal">
        <div class="stat-card"><div class="stat-label">Total Spent</div><div class="stat-value" id="budget-total-spent">$0</div></div>
        <div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value text-success" id="budget-remaining">$0</div></div>
        <div class="stat-card"><div class="stat-label">Budget Used</div><div class="stat-value" id="budget-percent">0%</div></div>
      </div>
      <div class="grid-2">
        <div class="card reveal"><div class="card-header"><h3>Overall Budget</h3></div><div class="chart-container" style="height:200px"><canvas id="budget-circle"></canvas></div><div class="progress-bar mt-2"><div class="progress-fill" id="main-budget-bar" style="width:0%"></div></div></div>
        <div class="card reveal"><div class="card-header"><h3>Category Budgets</h3><a href="budget-setup.html">Edit →</a></div><div id="budget-list"></div></div>
      </div>
'@

$setupBody = @'
      <div class="card reveal" style="max-width:700px">
        <form id="budget-setup-form">
          <div class="form-group"><label>Monthly Total Budget</label><input class="form-control" name="monthlyBudget" type="number" step="100" min="0"></div>
          <h3 class="mb-2 mt-2">Category Limits</h3>
          <div id="category-budget-fields"></div>
          <button type="submit" class="btn btn-primary mt-2">Save Budgets</button>
        </form>
      </div>
      <script>
      document.addEventListener("DOMContentLoaded",()=>{
        const c=document.getElementById("category-budget-fields");
        Storage.getCategories().filter(x=>x.type==="expense").forEach(cat=>{
          c.innerHTML+=`<div class="form-group"><label>${cat.icon} ${cat.name}</label><input class="form-control" name="budget_${cat.id}" type="number" step="10" min="0" placeholder="0"></div>`;
        });
      });
      </script>
'@
New-Page 'budget-setup.html' 'budget-setup' 'Budget Setup' 'Configure monthly budgets' $setupBody

New-Page 'goals.html' 'goals' 'Financial Goals' 'Track savings goals' @'
      <div class="grid-2">
        <div class="card reveal"><h3 class="mb-2">Add Goal</h3><form id="goal-form">
          <div class="form-group"><label>Goal Name</label><input class="form-control" name="name" required></div>
          <div class="form-row"><div class="form-group"><label>Target</label><input class="form-control" name="target" type="number" required></div><div class="form-group"><label>Current</label><input class="form-control" name="current" type="number" value="0"></div></div>
          <div class="form-group"><label>Deadline</label><input class="form-control" name="deadline" type="date" required></div>
          <button class="btn btn-primary">Add Goal</button>
        </form></div>
        <div id="goals-list" class="reveal"></div>
      </div>
'@

New-Page 'recurring.html' 'recurring' 'Recurring' 'Recurring transactions' @'
      <div class="grid-2">
        <div class="card reveal"><form id="recurring-form">
          <div class="form-group"><label>Title</label><input class="form-control" name="title" required></div>
          <div class="form-row"><div class="form-group"><label>Amount</label><input class="form-control" name="amount" type="number" step="0.01" required></div>
          <div class="form-group"><label>Type</label><select class="form-control" name="type"><option value="expense">Expense</option><option value="income">Income</option></select></div></div>
          <div class="form-row"><div class="form-group"><label>Frequency</label><select class="form-control" name="frequency"><option>Weekly</option><option>Monthly</option><option>Yearly</option></select></div>
          <div class="form-group"><label>Next Date</label><input class="form-control" name="nextDate" type="date" required></div></div>
          <button class="btn btn-primary">Add Recurring</button>
        </form></div>
        <div class="card reveal"><div id="recurring-list"></div></div>
      </div>
'@

New-Page 'analytics.html' 'analytics' 'Analytics' 'Charts and trends' @'
      <div class="filter-bar reveal"><label>Month: <input type="month" id="analytics-month"></label></div>
      <div class="dashboard-grid-3 reveal">
        <div class="card"><div class="card-header"><h3>Expense Pie Chart</h3></div><div class="chart-container"><canvas id="expense-pie-chart"></canvas></div></div>
        <div class="card"><div class="card-header"><h3>Category Breakdown</h3></div><div class="chart-container"><canvas id="category-pie-chart"></canvas></div></div>
        <div class="card"><div class="card-header"><h3>Income Sources</h3></div><div class="chart-container"><canvas id="income-pie-chart"></canvas></div></div>
      </div>
      <div class="dashboard-grid reveal">
        <div class="card"><div class="card-header"><h3>Income vs Expenses</h3></div><div class="chart-container"><canvas id="income-line-chart"></canvas></div></div>
        <div class="card"><div class="card-header"><h3>Monthly Bar Chart</h3></div><div class="chart-container"><canvas id="monthly-bar-chart"></canvas></div></div>
      </div>
      <script>document.addEventListener("DOMContentLoaded",()=>{const m=document.getElementById("analytics-month");const n=new Date();m.value=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")})</script>
'@

New-Page 'reports.html' 'reports' 'Reports' 'Monthly financial reports' @'
      <div class="filter-bar reveal no-print">
        <input type="month" id="report-month">
        <button class="btn btn-primary" id="download-report">Download Report</button>
        <button class="btn btn-secondary" id="print-report">Print Report</button>
      </div>
      <div id="printable-report" class="reveal">
        <div class="stats-grid">
          <div class="stat-card income"><div class="stat-label">Income</div><div class="stat-value" id="report-income">$0</div></div>
          <div class="stat-card expense"><div class="stat-label">Expenses</div><div class="stat-value" id="report-expenses">$0</div></div>
          <div class="stat-card savings"><div class="stat-label">Savings</div><div class="stat-value" id="report-savings">$0</div></div>
          <div class="stat-card"><div class="stat-label">Transactions</div><div class="stat-value" id="report-count">0</div></div>
        </div>
        <h3 class="mt-2 mb-2">Report for <span id="report-month-label"></span></h3>
        <div class="grid-2"><div class="card"><div class="chart-container"><canvas id="report-pie-chart"></canvas></div></div>
        <div class="card"><table class="data-table" id="report-category-table"><thead><tr><th>Category</th><th>Amount</th><th>%</th></tr></thead><tbody></tbody></table></div></div>
      </div>
'@

New-Page 'monthly-report.html' 'monthly-report' 'Monthly Report' 'Detailed monthly summary' @'
      <div class="filter-bar reveal"><input type="month" id="report-month"><button class="btn btn-primary" id="print-report">Print</button><button class="btn btn-secondary" id="download-report">Export PDF</button></div>
      <div class="card reveal card-glass" id="printable-report">
        <h2 class="mb-2">Monthly Financial Report — <span id="report-month-label"></span></h2>
        <div class="stats-grid"><div class="stat-card"><div class="stat-label">Total Income</div><div class="stat-value" id="report-income">$0</div></div>
        <div class="stat-card"><div class="stat-label">Total Expenses</div><div class="stat-value" id="report-expenses">$0</div></div>
        <div class="stat-card"><div class="stat-label">Net Savings</div><div class="stat-value" id="report-savings">$0</div></div></div>
        <div class="grid-2 mt-2"><div class="chart-container"><canvas id="report-pie-chart"></canvas></div>
        <table class="data-table" id="report-category-table"><thead><tr><th>Category</th><th>Spent</th><th>Share</th></tr></thead><tbody></tbody></table></div>
      </div>
'@

New-Page 'comparison.html' 'comparison' 'Comparison' 'Compare two months' @'
      <form id="compare-form" class="filter-bar reveal">
        <input type="month" id="compare-month-1" required><span>vs</span><input type="month" id="compare-month-2" required>
        <button class="btn btn-primary" type="submit">Compare</button>
      </form>
      <div class="dashboard-grid-3 reveal">
        <div class="card text-center"><h3>Month 1 Income</h3><p class="stat-value" id="cmp-income-1">$0</p></div>
        <div class="card text-center"><h3>Month 2 Income</h3><p class="stat-value" id="cmp-income-2">$0</p></div>
        <div class="card text-center"><h3>Savings Diff</h3><p class="stat-value" id="cmp-diff">$0</p></div>
      </div>
      <div class="grid-2 reveal"><div class="card"><h4>Expenses M1: <span id="cmp-expense-1"></span></h4></div><div class="card"><h4>Expenses M2: <span id="cmp-expense-2"></span></h4></div></div>
      <div class="grid-2 reveal"><div class="card"><h4>Savings M1: <span id="cmp-savings-1"></span></h4></div><div class="card"><h4>Savings M2: <span id="cmp-savings-2"></span></h4></div></div>
      <script>document.addEventListener("DOMContentLoaded",()=>{const n=new Date();const m=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0");document.getElementById("compare-month-2").value=m;const p=new Date(n.getFullYear(),n.getMonth()-1);document.getElementById("compare-month-1").value=p.getFullYear()+"-"+String(p.getMonth()+1).padStart(2,"0");if(typeof Analytics!=="undefined")Analytics.renderComparison()})</script>
'@

New-Page 'category-analytics.html' 'category-analytics' 'Category Analytics' 'Spending by category' @'
      <div class="filter-bar"><input type="month" id="analytics-month"></div>
      <div class="dashboard-grid reveal">
        <div class="card"><div class="chart-container"><canvas id="category-pie-chart"></canvas></div></div>
        <div class="card"><div class="chart-container"><canvas id="expense-pie-chart"></canvas></div></div>
      </div>
      <script>document.addEventListener("DOMContentLoaded",()=>{const m=document.getElementById("analytics-month");const n=new Date();m.value=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0");m.addEventListener("change",()=>Analytics.updateCategoryCharts(m.value))})</script>
'@

New-Page 'export.html' 'export' 'Export' 'Export and print reports' @'
      <div class="card reveal"><h3 class="mb-2">Export Financial Data</h3>
        <p class="text-muted mb-2">Generate printable reports or export your data.</p>
        <div class="flex gap-2 flex-wrap">
          <a href="monthly-report.html" class="btn btn-primary">Monthly Report</a>
          <button class="btn btn-secondary" onclick="window.print()">Print Current Page</button>
          <button class="btn btn-secondary" id="export-json">Export JSON</button>
        </div>
      </div>
      <div class="card reveal mt-2"><h3>Export Preview</h3><pre id="export-preview" style="background:var(--bg-tertiary);padding:1rem;border-radius:8px;overflow:auto;max-height:300px;font-size:0.75rem"></pre></div>
      <script>document.getElementById("export-json")?.addEventListener("click",()=>{const data={transactions:Storage.getTransactions(),budgets:Storage.getBudgets(),settings:Storage.getSettings()};document.getElementById("export-preview").textContent=JSON.stringify(data,null,2);const b=new Blob([JSON.stringify(data)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="expense-tracker-export.json";a.click();Notify.toast("JSON exported","success")})</script>
'@

New-Page 'categories.html' 'categories' 'Categories' 'Manage categories' @'
      <div class="grid-2">
        <div class="card reveal"><h3>Add Category</h3><form id="add-category-form" class="mt-2">
          <div class="form-group"><label>Name</label><input class="form-control" name="name" required></div>
          <div class="form-row"><div class="form-group"><label>Icon</label><input class="form-control" name="icon" placeholder="📁"></div>
          <div class="form-group"><label>Color</label><input class="form-control" name="color" type="color" value="#7C3AED"></div></div>
          <div class="form-group"><label>Type</label><select class="form-control" name="type"><option value="expense">Expense</option><option value="income">Income</option></select></div>
          <button class="btn btn-primary">Add Category</button>
        </form></div>
        <div class="category-grid reveal" id="categories-grid"></div>
      </div>
'@

New-Page 'wallets.html' 'wallets' 'Wallets' 'Payment methods' @'
      <div class="stats-grid reveal">
        <div class="stat-card"><div class="stat-icon">💳</div><div class="stat-label">Card</div><div class="stat-value" id="wallet-card">$0</div></div>
        <div class="stat-card"><div class="stat-icon">🏦</div><div class="stat-label">Bank</div><div class="stat-value" id="wallet-bank">$0</div></div>
        <div class="stat-card"><div class="stat-icon">💵</div><div class="stat-label">Cash</div><div class="stat-value" id="wallet-cash">$0</div></div>
        <div class="stat-card"><div class="stat-icon">📱</div><div class="stat-label">Wallet</div><div class="stat-value" id="wallet-digital">$0</div></div>
      </div>
      <script>document.addEventListener("DOMContentLoaded",()=>{const txs=Storage.getTransactions().filter(t=>t.type==="expense");const sum=m=>txs.filter(t=>(t.paymentMethod||"card")===m).reduce((s,t)=>s+t.amount,0);document.getElementById("wallet-card").textContent=Storage.formatCurrency(sum("card"));document.getElementById("wallet-bank").textContent=Storage.formatCurrency(sum("bank"));document.getElementById("wallet-cash").textContent=Storage.formatCurrency(sum("cash"));document.getElementById("wallet-digital").textContent=Storage.formatCurrency(sum("wallet"))})</script>
'@

New-Page 'savings-calculator.html' 'savings-calculator' 'Savings Calculator' 'Project savings growth' @'
      <div class="grid-2 reveal">
        <div class="card"><form id="savings-calc-form">
          <div class="form-group"><label>Monthly Income</label><input class="form-control" name="income" type="number" required></div>
          <div class="form-group"><label>Monthly Expenses</label><input class="form-control" name="expenses" type="number" required></div>
          <div class="form-row"><div class="form-group"><label>Growth Rate %</label><input class="form-control" name="rate" type="number" value="5" step="0.1"></div>
          <div class="form-group"><label>Months</label><input class="form-control" name="months" type="number" value="12"></div></div>
          <button class="btn btn-primary">Calculate</button>
        </form></div>
        <div class="card card-glass text-center"><h3>Projected Savings</h3><p class="stat-value mt-2" id="calc-result">$0.00</p><p class="text-muted">Monthly savings: <strong id="calc-monthly">$0</strong></p></div>
      </div>
'@

New-Page 'notifications.html' 'notifications' 'Notifications' 'Alerts and activity' @'
      <div class="card reveal mb-2"><h3>System Alerts</h3><div id="notification-list-page"></div></div>
      <div class="card reveal"><h3>Recent Activity</h3><div class="transaction-list" id="notification-transactions"></div></div>
      <script>document.addEventListener("DOMContentLoaded",()=>{const l=document.getElementById("notification-list-page");const n=Storage.getNotifications();l.innerHTML=n.length?n.map(x=>`<div class="insight-card">${x.title}: ${x.message}</div>`).join(""):"<p class='text-muted'>No alerts</p>"})</script>
'@

New-Page 'settings.html' 'settings' 'Settings' 'App preferences' @'
      <div class="grid-2 reveal">
        <div class="card"><h3 class="mb-2">General Settings</h3><form id="settings-form">
          <div class="form-group"><label>Currency</label><select class="form-control" name="currency"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option><option value="JPY">JPY (¥)</option></select></div>
          <div class="form-group"><label>Monthly Budget</label><input class="form-control" name="monthlyBudget" type="number" step="100"></div>
          <button class="btn btn-primary">Save Settings</button>
        </form></div>
        <div class="card"><h3 class="mb-2">Data Management</h3>
          <button class="btn btn-secondary mb-2" id="load-demo" style="width:100%">Load Demo Data</button>
          <button class="btn btn-danger" id="reset-data" style="width:100%">Reset All Data</button>
          <p class="text-muted mt-2" style="font-size:0.8rem">Data is stored locally in your browser via localStorage.</p>
        </div>
      </div>
'@

New-Page 'themes.html' 'themes' 'Themes' 'Customize appearance' @'
      <div class="card reveal"><h3 class="mb-2">Choose Theme</h3>
        <div class="theme-switcher" style="gap:1rem">
          <button class="theme-btn active" data-theme="dark" style="background:#0F172A" title="Dark"></button>
          <button class="theme-btn" data-theme="light" style="background:#F8FAFC;border:1px solid #ccc" title="Light"></button>
          <button class="theme-btn" data-theme="neon" style="background:linear-gradient(135deg,#00ff88,#ff00ff)" title="Neon"></button>
          <button class="theme-btn" data-theme="minimal" style="background:#FAFAFA;border:1px solid #ddd" title="Minimal"></button>
        </div>
        <p class="text-muted mt-2">Theme preference is saved automatically.</p>
      </div>
      <div class="stats-grid reveal mt-2"><div class="stat-card"><div class="stat-label">Preview Card</div><div class="stat-value">$1,234.56</div></div></div>
'@

New-Page 'help.html' 'help' 'Help' 'Documentation' @'
      <div class="card reveal"><h3>Getting Started</h3>
        <ol class="mt-2" style="padding-left:1.25rem;color:var(--text-secondary)">
          <li class="mb-1">Add income and expenses from the Transactions menu.</li>
          <li class="mb-1">Set up budgets in Budget Setup.</li>
          <li class="mb-1">View analytics and monthly reports.</li>
          <li class="mb-1">Customize themes in Settings or Themes page.</li>
        </ol>
      </div>
      <div class="card reveal mt-2"><h3>Troubleshooting</h3>
        <p class="text-muted mt-1"><strong>Data not saving?</strong> Ensure localStorage is enabled and you are not in private browsing.</p>
        <p class="text-muted mt-1"><strong>Charts not showing?</strong> Add transactions with the current month date.</p>
      </div>
'@

New-Page 'insights.html' 'insights' 'Insights' 'Financial insights' @'
      <div id="insights-container" class="reveal mb-2"></div>
      <div class="dashboard-grid reveal">
        <div class="card"><div class="chart-container"><canvas id="expense-pie-chart"></canvas></div></div>
        <div class="card"><div id="goals-container"></div></div>
      </div>
'@

New-Page 'calendar.html' 'calendar' 'Calendar' 'Transaction calendar' @'
      <div class="card reveal">
        <div class="card-header"><button class="btn btn-secondary btn-sm" id="cal-prev">←</button><h3 id="calendar-title"></h3><button class="btn btn-secondary btn-sm" id="cal-next">→</button></div>
        <div class="calendar-grid" id="calendar-grid"></div>
      </div>
      <div class="card reveal mt-2"><h3>Day Details</h3><div id="calendar-day-detail" class="mt-2"></div></div>
'@

New-Page 'overview.html' 'dashboard' 'Overview' 'Quick snapshot' @'
      <div class="stats-grid reveal">
        <div class="stat-card balance"><div class="stat-label">Balance</div><div class="stat-value" id="stat-balance">$0</div></div>
        <div class="stat-card income"><div class="stat-label">Income</div><div class="stat-value" id="stat-income">$0</div></div>
        <div class="stat-card expense"><div class="stat-label">Expenses</div><div class="stat-value" id="stat-expenses">$0</div></div>
        <div class="stat-card savings"><div class="stat-label">Savings</div><div class="stat-value" id="stat-savings">$0</div></div>
      </div>
      <div class="transaction-list" id="recent-transactions"></div>
'@

New-Page 'dashboard-widgets.html' 'dashboard' 'Widgets' 'Dashboard widgets' @'
      <div class="dashboard-grid-3 reveal">
        <div class="card"><div class="chart-container"><canvas id="budget-circle"></canvas></div></div>
        <div class="card"><div class="chart-container"><canvas id="expense-pie-chart"></canvas></div></div>
        <div class="card"><div id="dashboard-budgets"></div></div>
      </div>
      <div id="goals-container"></div>
'@

Write-Host "Batch 2 complete"
