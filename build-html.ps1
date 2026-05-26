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
          <div class="search-box"><span class="search-icon">🔍</span><input type="search" id="global-search" placeholder="Search transactions..."></div>
          <div class="notification-bell" id="notification-bell" style="position:relative;cursor:pointer">
            <button class="btn btn-secondary btn-icon">🔔</button>
            <span class="notification-badge" id="notification-count" style="display:none">0</span>
            <div class="notification-dropdown" id="notification-dropdown"><div id="notification-list"></div></div>
          </div>
          <button class="btn btn-secondary btn-icon" id="theme-cycle" title="Cycle theme">🎨</button>
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

$filterBar = @'
      <form id="filter-form" class="filter-bar reveal">
        <input type="search" id="search-input" placeholder="Search transactions..." class="form-control" style="flex:1;min-width:200px">
        <select id="filter-category"><option value="">All Categories</option></select>
        <input type="month" id="filter-month">
        <select id="filter-type"><option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
        <select id="filter-sort"><option value="">Sort: Date</option><option value="amount-desc">Amount High-Low</option><option value="amount-asc">Amount Low-High</option><option value="date-asc">Date Oldest</option></select>
      </form>
      <div class="transaction-list" id="transaction-list"></div>
'@

# Populate category options via inline script for filter pages
$filterScript = '<script>document.addEventListener("DOMContentLoaded",()=>{const s=document.getElementById("filter-category");if(s)Storage.getCategories().forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.name;s.appendChild(o)})})</script>'

New-Page 'transactions.html' 'transactions' 'Transactions' 'Manage all your transactions' ($filterBar + $filterScript)
New-Page 'income.html' 'income' 'Income' 'All income transactions' ($filterBar + $filterScript)
New-Page 'expenses.html' 'expenses' 'Expenses' 'All expense transactions' ($filterBar + $filterScript)
New-Page 'search.html' 'search' 'Search' 'Find and filter transactions' ($filterBar + $filterScript)
New-Page 'transaction-history.html' 'transactions' 'Transaction History' 'Complete transaction log' ($filterBar + $filterScript)

$formTx = @'
      <div class="grid-2">
        <div class="card reveal">
          <form id="transaction-form">
            <div class="form-group"><label>Title *</label><input class="form-control" name="title" required placeholder="Transaction title"></div>
            <div class="form-row">
              <div class="form-group"><label>Amount *</label><input class="form-control" name="amount" type="number" step="0.01" min="0" required></div>
              <div class="form-group"><label>Date</label><input class="form-control" name="date" type="date" required></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Category</label><select class="form-control" name="category" id="category"></select></div>
              <div class="form-group"><label>Payment Method</label><select class="form-control" name="paymentMethod"><option value="card">Card</option><option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="wallet">Digital Wallet</option></select></div>
            </div>
            <input type="hidden" name="type" value="TYPE_PLACEHOLDER">
            <div class="form-group"><label>Notes</label><textarea class="form-control" name="notes" rows="3" placeholder="Optional description"></textarea></div>
            <button type="submit" class="btn btn-primary">Save Transaction</button>
          </form>
        </div>
        <div class="card reveal card-glass"><h3 class="mb-2">Quick Tips</h3><div class="insight-card">Use clear titles for easier search and reporting.</div><div class="insight-card">Assign the correct category for accurate budget tracking.</div><div class="insight-card">Add notes for receipts and tax documentation.</div></div>
      </div>
      <script>document.querySelector("[name=date]").valueAsDate=new Date()</script>
'@

New-Page 'add-income.html' 'add-income' 'Add Income' 'Record a new income' ($formTx -replace 'TYPE_PLACEHOLDER','income')
New-Page 'add-expense.html' 'add-expense' 'Add Expense' 'Record a new expense' ($formTx -replace 'TYPE_PLACEHOLDER','expense')

$editForm = $formTx -replace 'TYPE_PLACEHOLDER','expense' -replace '<input type="hidden" name="type"','<div class="form-group"><label>Type</label><select class="form-control" name="type"><option value="income">Income</option><option value="expense">Expense</option></select></div><input type="hidden" name="type" style="display:none"' 
# Simpler edit page
$editBody = @'
      <div class="card reveal" style="max-width:600px">
        <form id="transaction-form">
          <div class="form-group"><label>Title *</label><input class="form-control" name="title" required></div>
          <div class="form-row">
            <div class="form-group"><label>Amount *</label><input class="form-control" name="amount" type="number" step="0.01" required></div>
            <div class="form-group"><label>Date</label><input class="form-control" name="date" type="date" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Category</label><select class="form-control" name="category" id="category"></select></div>
            <div class="form-group"><label>Type</label><select class="form-control" name="type"><option value="income">Income</option><option value="expense">Expense</option></select></div>
          </div>
          <div class="form-group"><label>Payment Method</label><select class="form-control" name="paymentMethod"><option value="card">Card</option><option value="cash">Cash</option><option value="bank">Bank</option><option value="wallet">Wallet</option></select></div>
          <div class="form-group"><label>Notes</label><textarea class="form-control" name="notes" rows="3"></textarea></div>
          <button type="submit" class="btn btn-primary">Update Transaction</button>
        </form>
      </div>
'@
New-Page 'edit-transaction.html' 'edit-transaction' 'Edit Transaction' 'Update transaction details' $editBody

Write-Host "Done building HTML pages batch 1"
