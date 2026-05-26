/**
 * Shared sidebar navigation and layout utilities
 */
const Navigation = (function () {
  const NAV_SECTIONS = [
    {
      title: 'Overview',
      links: [
        { href: 'index.html', icon: '📊', label: 'Dashboard' },
        { href: 'insights.html', icon: '💡', label: 'Insights' },
        { href: 'calendar.html', icon: '📅', label: 'Calendar' }
      ]
    },
    {
      title: 'Transactions',
      links: [
        { href: 'transactions.html', icon: '💳', label: 'All Transactions' },
        { href: 'add-income.html', icon: '➕', label: 'Add Income' },
        { href: 'add-expense.html', icon: '➖', label: 'Add Expense' },
        { href: 'income.html', icon: '📈', label: 'Income' },
        { href: 'expenses.html', icon: '📉', label: 'Expenses' },
        { href: 'search.html', icon: '🔍', label: 'Search' }
      ]
    },
    {
      title: 'Budgets',
      links: [
        { href: 'budgets.html', icon: '🎯', label: 'Budgets' },
        { href: 'budget-setup.html', icon: '⚙️', label: 'Budget Setup' },
        { href: 'goals.html', icon: '🏆', label: 'Goals' },
        { href: 'recurring.html', icon: '🔄', label: 'Recurring' }
      ]
    },
    {
      title: 'Analytics',
      links: [
        { href: 'analytics.html', icon: '📈', label: 'Analytics' },
        { href: 'reports.html', icon: '📋', label: 'Reports' },
        { href: 'monthly-report.html', icon: '📆', label: 'Monthly Report' },
        { href: 'comparison.html', icon: '⚖️', label: 'Comparison' },
        { href: 'category-analytics.html', icon: '🏷️', label: 'Category Analytics' },
        { href: 'export.html', icon: '📤', label: 'Export' }
      ]
    },
    {
      title: 'Manage',
      links: [
        { href: 'categories.html', icon: '📁', label: 'Categories' },
        { href: 'wallets.html', icon: '👛', label: 'Wallets' },
        { href: 'savings-calculator.html', icon: '🧮', label: 'Savings Calculator' },
        { href: 'notifications.html', icon: '🔔', label: 'Notifications' }
      ]
    },
    {
      title: 'Settings',
      links: [
        { href: 'settings.html', icon: '⚙️', label: 'Settings' },
        { href: 'themes.html', icon: '🎨', label: 'Themes' },
        { href: 'help.html', icon: '❓', label: 'Help' }
      ]
    }
  ];

  function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  function renderSidebar() {
    const container = document.getElementById('sidebar-nav');
    if (!container) return;
    const current = getCurrentPage();

    container.innerHTML = NAV_SECTIONS.map(section => `
      <div class="nav-section">
        <div class="nav-section-title">${section.title}</div>
        ${section.links.map(link => `
          <a href="${link.href}" class="nav-link ${link.href === current ? 'active' : ''}">
            <span class="icon">${link.icon}</span>
            <span>${link.label}</span>
          </a>
        `).join('')}
      </div>
    `).join('');
  }

  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('show');
      });
    }
    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  function initParticles() {
    const container = document.getElementById('particles-bg');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 15 + 's';
      p.style.animationDuration = 10 + Math.random() * 20 + 's';
      container.appendChild(p);
    }
  }

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function initGlobalSearch() {
    const input = document.getElementById('global-search');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `search.html?q=${encodeURIComponent(input.value)}`;
      }
    });
  }

  function init() {
    renderSidebar();
    initMobileMenu();
    initParticles();
    initReveal();
    initGlobalSearch();
  }

  return { init, getCurrentPage, NAV_SECTIONS };
})();
