/**
 * Budget management and progress tracking
 */
const Budgets = (function () {
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function getCategorySpent(categoryId, month) {
    return Storage.getTransactions()
      .filter(t => t.type === 'expense' && t.category === categoryId && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);
  }

  function getBudgetProgress() {
    const month = getCurrentMonth();
    const budgets = Storage.getBudgets();
    const settings = Storage.getSettings();
    const totalBudget = settings.monthlyBudget;
    const totalSpent = Storage.getTransactions()
      .filter(t => t.type === 'expense' && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);

    const categories = Object.entries(budgets).map(([catId, limit]) => {
      const spent = getCategorySpent(catId, month);
      const cat = Storage.getCategories().find(c => c.id === catId);
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      return {
        id: catId,
        name: cat?.name || catId,
        icon: cat?.icon || '📁',
        color: cat?.color || '#7C3AED',
        limit,
        spent,
        remaining: Math.max(0, limit - spent),
        percent
      };
    });

    return {
      month,
      totalBudget,
      totalSpent,
      totalPercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      remaining: Math.max(0, totalBudget - totalSpent),
      categories
    };
  }

  function renderBudgetList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const progress = getBudgetProgress();

    if (progress.categories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No category budgets set</p>
          <a href="budget-setup.html" class="btn btn-primary mt-2">Set Up Budgets</a>
        </div>`;
      return;
    }

    container.innerHTML = progress.categories.map(cat => {
      const status = cat.percent > 100 ? 'danger' : cat.percent > 80 ? 'warning' : 'success';
      return `
        <div class="progress-bar-wrap reveal">
          <div class="progress-header">
            <span>${cat.icon} ${cat.name}</span>
            <span>${Storage.formatCurrency(cat.spent)} / ${Storage.formatCurrency(cat.limit)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${status}" style="width:${Math.min(cat.percent, 100)}%"></div>
          </div>
          <div class="flex justify-between mt-1" style="font-size:0.75rem;color:var(--text-muted)">
            <span>${cat.percent.toFixed(0)}% used</span>
            <span>${Storage.formatCurrency(cat.remaining)} left</span>
          </div>
        </div>`;
    }).join('');
  }

  function renderOverview() {
    const progress = getBudgetProgress();
    const totalEl = document.getElementById('budget-total-spent');
    const remainEl = document.getElementById('budget-remaining');
    const percentEl = document.getElementById('budget-percent');

    if (totalEl) totalEl.textContent = Storage.formatCurrency(progress.totalSpent);
    if (remainEl) remainEl.textContent = Storage.formatCurrency(progress.remaining);
    if (percentEl) percentEl.textContent = progress.totalPercent.toFixed(0) + '%';

    const canvas = document.getElementById('budget-circle');
    if (canvas) Charts.circularProgress('budget-circle', progress.totalPercent, 'of budget');

    const mainBar = document.getElementById('main-budget-bar');
    if (mainBar) {
      mainBar.style.width = Math.min(progress.totalPercent, 100) + '%';
      mainBar.className = 'progress-fill ' + (progress.totalPercent > 100 ? 'danger' : progress.totalPercent > 80 ? 'warning' : 'success');
    }
  }

  function handleSetupForm() {
    const form = document.getElementById('budget-setup-form');
    if (!form) return;

    const budgets = Storage.getBudgets();
    const settings = Storage.getSettings();

    const monthlyInput = form.querySelector('[name="monthlyBudget"]');
    if (monthlyInput) monthlyInput.value = settings.monthlyBudget;

    Storage.getCategories().filter(c => c.type === 'expense').forEach(cat => {
      const input = form.querySelector(`[name="budget_${cat.id}"]`);
      if (input && budgets[cat.id]) input.value = budgets[cat.id];
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const newBudgets = {};
      const monthly = parseFloat(fd.get('monthlyBudget')) || 3000;
      Storage.getCategories().filter(c => c.type === 'expense').forEach(cat => {
        const val = parseFloat(fd.get(`budget_${cat.id}`));
        if (val > 0) newBudgets[cat.id] = val;
      });
      Storage.saveBudgets(newBudgets);
      Storage.saveSettings({ monthlyBudget: monthly });
      Notify.toast('Budgets saved successfully', 'success');
    });
  }

  return { getBudgetProgress, renderBudgetList, renderOverview, handleSetupForm, getCurrentMonth };
})();
