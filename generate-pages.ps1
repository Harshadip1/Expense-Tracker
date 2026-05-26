$base = $PSScriptRoot

function Get-Shell($title, $subtitle, $page, $content) {
@"
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
      <div class="sidebar-logo">
        <div class="logo-icon">💎</div>
        <h1>Expense Tracker</h1>
      </div>
      <nav id="sidebar-nav"></nav>
    </aside>
    <main class="main-content">
      <div class="top-bar">
        <button id="menu-toggle" class="menu-toggle" aria-label="Menu">☰</button>
        <div class="page-title">
          <h2>$title</h2>
          <p>$subtitle</p>
        </div>
        <div class="top-actions">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="search" id="global-search" placeholder="Search transactions...">
          </div>
          <div class="notification-bell" id="notification-bell" style="position:relative;cursor:pointer">
            <button class="btn btn-secondary btn-icon">🔔</button>
            <span class="notification-badge" id="notification-count" style="display:none">0</span>
            <div class="notification-dropdown" id="notification-dropdown">
              <div id="notification-list"></div>
            </div>
          </div>
          <button class="btn btn-secondary btn-icon" id="theme-cycle" title="Cycle theme">🎨</button>
          <a href="add-expense.html" class="btn btn-primary">+ Add</a>
        </div>
      </div>
      $content
    </main>
  </div>
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
"@
}

# Write index separately - handled manually
Write-Host "Use manual HTML files for rich content pages"
