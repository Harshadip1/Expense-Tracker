/**
 * Main application bootstrap
 */
const App = (function () {
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function refreshDashboard() {
    const month = getCurrentMonth();
    const stats = Storage.getMonthStats(month);
    const allTx = Storage.getTransactions();
    const totalIncome = allTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    const setCounter = (id, value) => {
      const el = document.getElementById(id);
      if (el) Charts.animateCounter(el, value);
    };

    setCounter('stat-balance', balance);
    setCounter('stat-income', stats.income);
    setCounter('stat-expenses', stats.expenses);
    setCounter('stat-savings', stats.savings);

    const changeEl = document.getElementById('stat-savings-change');
    if (changeEl) {
      const prevMonth = new Date();
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevYm = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
      const prevStats = Storage.getMonthStats(prevYm);
      const diff = stats.savings - prevStats.savings;
      changeEl.textContent = (diff >= 0 ? '+' : '') + Storage.formatCurrency(Math.abs(diff)) + ' vs last month';
      changeEl.className = 'stat-change ' + (diff >= 0 ? 'positive' : 'negative');
    }

    Transactions.renderList('recent-transactions', { limit: 6 });
    Budgets.renderOverview();
    Budgets.renderBudgetList('dashboard-budgets');
    Analytics.renderDashboardCharts();

    if (document.getElementById('insights-container')) renderInsights();
    if (document.getElementById('goals-container')) renderGoals();
  }

  function renderInsights() {
    const month = getCurrentMonth();
    const stats = Storage.getMonthStats(month);
    const settings = Storage.getSettings();
    const container = document.getElementById('insights-container');
    if (!container) return;

    const insights = [];
    const savingsRate = stats.income > 0 ? (stats.savings / stats.income) * 100 : 0;
    insights.push({ text: `Your savings rate this month is ${savingsRate.toFixed(1)}%.`, type: savingsRate >= 20 ? 'success' : 'warning' });

    const topCat = Object.entries(Storage.getCategoryBreakdown(month))
      .sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      const cat = Storage.getCategories().find(c => c.id === topCat[0]);
      insights.push({ text: `Highest spending: ${cat?.name || topCat[0]} (${Storage.formatCurrency(topCat[1])})`, type: 'info' });
    }

    if (stats.expenses > settings.monthlyBudget * 0.8) {
      insights.push({ text: 'You are approaching your monthly budget limit.', type: 'warning' });
    } else {
      insights.push({ text: 'Spending is within healthy budget range.', type: 'success' });
    }

    container.innerHTML = insights.map(i =>
      `<div class="insight-card" style="border-color:var(--${i.type === 'success' ? 'success' : i.type === 'warning' ? 'warning' : 'accent'})">${i.text}</div>`
    ).join('');
  }

  function renderGoals() {
    const container = document.getElementById('goals-container');
    if (!container) return;
    const goals = Storage.getGoals();
    if (goals.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No goals set</p><a href="goals.html" class="btn btn-primary btn-sm mt-1">Add Goal</a></div>';
      return;
    }
    container.innerHTML = goals.map(g => {
      const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
      return `
        <div class="goal-card card mb-2">
          <div class="flex justify-between"><strong>${g.name}</strong><span>${pct.toFixed(0)}%</span></div>
          <div class="progress-bar goal-progress"><div class="progress-fill success" style="width:${Math.min(pct, 100)}%"></div></div>
          <div class="flex justify-between mt-1" style="font-size:0.8rem;color:var(--text-muted)">
            <span>${Storage.formatCurrency(g.current)} / ${Storage.formatCurrency(g.target)}</span>
            <span>Due: ${g.deadline}</span>
          </div>
        </div>`;
    }).join('');
  }

  function initCategoriesPage() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    const render = () => {
      grid.innerHTML = Storage.getCategories().map(c => `
        <div class="category-card" data-id="${c.id}">
          <div class="cat-icon">${c.icon}</div>
          <div style="font-weight:600">${c.name}</div>
          <div class="badge mt-1" style="background:${c.color}22;color:${c.color}">${c.type}</div>
        </div>`).join('');
    };
    render();

    document.getElementById('add-category-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Storage.addCategory(Object.fromEntries(fd));
      Notify.toast('Category added', 'success');
      e.target.reset();
      render();
    });
  }

  function initGoalsPage() {
    const form = document.getElementById('goal-form');
    const list = document.getElementById('goals-list');
    if (!list) return;

    const render = () => {
      const goals = Storage.getGoals();
      list.innerHTML = goals.map((g, i) => `
        <div class="card mb-2">
          <div class="flex justify-between items-center">
            <div><strong>${g.name}</strong><br><small class="text-muted">Target: ${Storage.formatCurrency(g.target)}</small></div>
            <button class="btn btn-danger btn-sm" data-remove="${i}">Remove</button>
          </div>
          <div class="form-row mt-2">
            <div class="form-group" style="margin:0">
              <label>Current Amount</label>
              <input type="number" class="form-control goal-current" data-idx="${i}" value="${g.current}" step="0.01">
            </div>
          </div>
          <div class="progress-bar mt-2"><div class="progress-fill" style="width:${Math.min((g.current / g.target) * 100, 100)}%"></div></div>
        </div>`).join('') || '<div class="empty-state">No goals yet</div>';

      list.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const goals = Storage.getGoals();
          goals.splice(parseInt(btn.dataset.remove), 1);
          Storage.saveGoals(goals);
          render();
        });
      });
      list.querySelectorAll('.goal-current').forEach(input => {
        input.addEventListener('change', () => {
          const goals = Storage.getGoals();
          goals[input.dataset.idx].current = parseFloat(input.value) || 0;
          Storage.saveGoals(goals);
          render();
        });
      });
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const goals = Storage.getGoals();
      goals.push({
        id: 'g_' + Date.now(),
        name: fd.get('name'),
        target: parseFloat(fd.get('target')),
        current: parseFloat(fd.get('current')) || 0,
        deadline: fd.get('deadline')
      });
      Storage.saveGoals(goals);
      form.reset();
      Notify.toast('Goal added', 'success');
      render();
    });
    render();
  }

  function initSettings() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    const settings = Storage.getSettings();
    form.querySelector('[name="currency"]').value = settings.currency;
    form.querySelector('[name="monthlyBudget"]').value = settings.monthlyBudget;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
      Storage.saveSettings({
        currency: fd.get('currency'),
        currencySymbol: symbols[fd.get('currency')] || '$',
        monthlyBudget: parseFloat(fd.get('monthlyBudget'))
      });
      Notify.toast('Settings saved', 'success');
    });

    document.getElementById('reset-data')?.addEventListener('click', () => {
      if (confirm('Reset all data? This cannot be undone.')) {
        localStorage.clear();
        Storage.init();
        Storage.seedDemoData();
        Notify.toast('Data reset with demo data', 'info');
        location.reload();
      }
    });

    document.getElementById('load-demo')?.addEventListener('click', () => {
      Storage.seedDemoData();
      Notify.toast('Demo data loaded', 'success');
      location.reload();
    });
  }

  function initSavingsCalculator() {
    const form = document.getElementById('savings-calc-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const income = parseFloat(form.income.value) || 0;
      const expenses = parseFloat(form.expenses.value) || 0;
      const rate = parseFloat(form.rate.value) || 0;
      const months = parseInt(form.months.value) || 12;
      const monthly = income - expenses;
      const future = monthly * months * (1 + rate / 100);
      document.getElementById('calc-result').textContent = Storage.formatCurrency(future);
      document.getElementById('calc-monthly').textContent = Storage.formatCurrency(monthly);
    });
  }

  function initRecurring() {
    const form = document.getElementById('recurring-form');
    const list = document.getElementById('recurring-list');
    if (!list) return;

    const render = () => {
      const items = Storage.getRecurring();
      list.innerHTML = items.map((r, i) => `
        <div class="transaction-item">
          <div class="transaction-icon">${r.type === 'income' ? '💵' : '🔄'}</div>
          <div class="transaction-details"><h4>${r.title}</h4><div class="transaction-meta"><span>${r.frequency}</span><span>Next: ${r.nextDate}</span></div></div>
          <span class="transaction-amount ${r.type}">${Storage.formatCurrency(r.amount)}</span>
          <button class="btn btn-danger btn-sm" data-idx="${i}">Remove</button>
        </div>`).join('') || '<div class="empty-state">No recurring items</div>';
      list.querySelectorAll('[data-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const items = Storage.getRecurring();
          items.splice(parseInt(btn.dataset.idx), 1);
          Storage.saveRecurring(items);
          render();
        });
      });
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const items = Storage.getRecurring();
      items.push(Object.fromEntries(fd));
      Storage.saveRecurring(items);
      form.reset();
      Notify.toast('Recurring item added', 'success');
      render();
    });
    render();
  }

  function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    function render() {
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const startDay = first.getDay();
      const txs = Storage.getTransactions();
      const daysWithTx = new Set(txs.map(t => t.date));

      document.getElementById('calendar-title').textContent =
        first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d =>
        `<div style="text-align:center;font-size:0.7rem;color:var(--text-muted);padding:0.5rem">${d}</div>`
      ).join('');

      for (let i = 0; i < startDay; i++) html += '<div></div>';
      for (let d = 1; d <= last.getDate(); d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
        html += `<div class="calendar-day ${daysWithTx.has(dateStr) ? 'has-transaction' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}">${d}</div>`;
      }
      grid.innerHTML = html;

      grid.querySelectorAll('.calendar-day[data-date]').forEach(day => {
        day.addEventListener('click', () => {
          const date = day.dataset.date;
          const dayTxs = txs.filter(t => t.date === date);
          const panel = document.getElementById('calendar-day-detail');
          if (panel) {
            panel.innerHTML = dayTxs.length
              ? dayTxs.map(t => `<div class="transaction-item"><span>${t.title}</span><span class="transaction-amount ${t.type}">${Storage.formatCurrency(t.amount)}</span></div>`).join('')
              : '<p class="text-muted">No transactions on this day</p>';
          }
        });
      });
    }

    document.getElementById('cal-prev')?.addEventListener('click', () => { month--; if (month < 0) { month = 11; year--; } render(); });
    document.getElementById('cal-next')?.addEventListener('click', () => { month++; if (month > 11) { month = 0; year++; } render(); });
    render();
  }

  function init() {
    Storage.seedDemoData();
    Navigation.init();
    ThemeManager.init();
    Notify.initDropdown();
    Notify.checkAlerts();

    const page = document.body.dataset.page;

    switch (page) {
      case 'dashboard':
        refreshDashboard();
        break;
      case 'transactions':
      case 'income':
      case 'expenses':
      case 'search':
        if (page === 'income') {
          const ft = document.getElementById('filter-type');
          if (ft) ft.value = 'income';
        }
        if (page === 'expenses') {
          const ft = document.getElementById('filter-type');
          if (ft) ft.value = 'expense';
        }
        Transactions.initFilters();
        break;
      case 'add-income':
        Transactions.populateCategorySelect('category', 'income');
        Transactions.handleForm('transaction-form', 'income');
        break;
      case 'add-expense':
        Transactions.populateCategorySelect('category', 'expense');
        Transactions.handleForm('transaction-form', 'expense');
        break;
      case 'edit-transaction':
        Transactions.populateCategorySelect('category');
        Transactions.handleForm('transaction-form');
        break;
      case 'budgets':
        Budgets.renderOverview();
        Budgets.renderBudgetList('budget-list');
        break;
      case 'budget-setup':
        Budgets.handleSetupForm();
        break;
      case 'analytics':
        Analytics.renderAnalyticsPage();
        document.getElementById('analytics-month')?.addEventListener('change', (e) => {
          Analytics.updateCategoryCharts(e.target.value);
        });
        break;
      case 'reports':
      case 'monthly-report':
        Analytics.initReportFilters();
        break;
      case 'comparison':
        Analytics.renderComparison();
        document.getElementById('compare-form')?.addEventListener('submit', (e) => {
          e.preventDefault();
          Analytics.renderComparison();
        });
        break;
      case 'categories':
        initCategoriesPage();
        break;
      case 'goals':
        initGoalsPage();
        break;
      case 'settings':
        initSettings();
        break;
      case 'savings-calculator':
        initSavingsCalculator();
        break;
      case 'recurring':
        initRecurring();
        break;
      case 'calendar':
        initCalendar();
        break;
      case 'notifications':
        Transactions.renderList('notification-transactions', { limit: 20 });
        break;
      case 'insights':
        renderInsights();
        refreshDashboard();
        break;
      case 'category-analytics':
        Analytics.renderAnalyticsPage();
        break;
      default:
        if (document.getElementById('recent-transactions')) {
          Transactions.renderList('recent-transactions', { limit: 10 });
        }
    }

    window.addEventListener('resize', () => {
      if (['dashboard', 'analytics', 'reports', 'monthly-report', 'insights', 'category-analytics'].includes(page)) {
        Analytics.renderDashboardCharts();
        if (page === 'dashboard') Budgets.renderOverview();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { refreshDashboard, renderInsights, renderGoals };
})();
