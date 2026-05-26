/**
 * Analytics and report generation
 */
const Analytics = (function () {
  function getLast6Months() {
    const months = [];
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(ym);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    return { months, labels };
  }

  function renderDashboardCharts() {
    const { months, labels } = getLast6Months();
    const incomeData = months.map(m => Storage.getMonthStats(m).income);
    const expenseData = months.map(m => Storage.getMonthStats(m).expenses);

    if (document.getElementById('income-line-chart')) {
      Charts.lineChart('income-line-chart', [
        { data: incomeData, color: '#22C55E' },
        { data: expenseData, color: '#EF4444' }
      ], labels);
    }

    const currentMonth = months[months.length - 1];
    const breakdown = Storage.getCategoryBreakdown(currentMonth);
    const cats = Object.keys(breakdown);
    const values = Object.values(breakdown);
    const catLabels = cats.map(id => {
      const c = Storage.getCategories().find(x => x.id === id);
      return c?.name || id;
    });

    if (document.getElementById('expense-pie-chart') && values.length > 0) {
      Charts.pieChart('expense-pie-chart', values, catLabels);
    }

    if (document.getElementById('monthly-bar-chart')) {
      Charts.barChart('monthly-bar-chart', expenseData, labels);
    }

    const savingsData = months.map(m => Storage.getMonthStats(m).savings);
    if (document.getElementById('savings-line-chart')) {
      Charts.lineChart('savings-line-chart', [{ data: savingsData, color: '#06B6D4' }], labels);
    }
  }

  function renderAnalyticsPage() {
    renderDashboardCharts();
    const monthSelect = document.getElementById('analytics-month');
    const month = monthSelect?.value || getLast6Months().months[5];
    updateCategoryCharts(month);
  }

  function updateCategoryCharts(month) {
    const breakdown = Storage.getCategoryBreakdown(month);
    const cats = Object.keys(breakdown);
    const values = Object.values(breakdown);
    const labels = cats.map(id => Storage.getCategories().find(c => c.id === id)?.name || id);

    if (document.getElementById('category-pie-chart') && values.length > 0) {
      Charts.pieChart('category-pie-chart', values, labels);
    }

    const incomeBreakdown = Storage.getCategoryBreakdown(month, 'income');
    const iCats = Object.keys(incomeBreakdown);
    const iValues = Object.values(incomeBreakdown);
    const iLabels = iCats.map(id => Storage.getCategories().find(c => c.id === id)?.name || id);
    if (document.getElementById('income-pie-chart') && iValues.length > 0) {
      Charts.pieChart('income-pie-chart', iValues, iLabels);
    }
  }

  function renderMonthlyReport(month) {
    const stats = Storage.getMonthStats(month);
    const breakdown = Storage.getCategoryBreakdown(month);
    const progress = Budgets.getBudgetProgress();

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText('report-income', Storage.formatCurrency(stats.income));
    setText('report-expenses', Storage.formatCurrency(stats.expenses));
    setText('report-savings', Storage.formatCurrency(stats.savings));
    setText('report-count', stats.count.toString());
    setText('report-month-label', new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

    const table = document.getElementById('report-category-table');
    if (table) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = Object.entries(breakdown).map(([catId, amount]) => {
        const cat = Storage.getCategories().find(c => c.id === catId);
        const pct = stats.expenses > 0 ? ((amount / stats.expenses) * 100).toFixed(1) : 0;
        return `<tr><td>${cat?.icon || ''} ${cat?.name || catId}</td><td>${Storage.formatCurrency(amount)}</td><td>${pct}%</td></tr>`;
      }).join('') || '<tr><td colspan="3">No expenses this month</td></tr>';
    }

    if (document.getElementById('report-pie-chart')) {
      const values = Object.values(breakdown);
      const labels = Object.keys(breakdown).map(id => Storage.getCategories().find(c => c.id === id)?.name || id);
      if (values.length > 0) Charts.pieChart('report-pie-chart', values, labels);
    }
  }

  function initReportFilters() {
    const monthInput = document.getElementById('report-month');
    if (!monthInput) return;
    const now = new Date();
    monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthInput.addEventListener('change', () => renderMonthlyReport(monthInput.value));
    renderMonthlyReport(monthInput.value);

    document.getElementById('print-report')?.addEventListener('click', () => window.print());
    document.getElementById('download-report')?.addEventListener('click', () => {
      Notify.toast('Report ready for print/save as PDF', 'info');
      window.print();
    });
  }

  function renderComparison() {
    const m1 = document.getElementById('compare-month-1')?.value;
    const m2 = document.getElementById('compare-month-2')?.value;
    if (!m1 || !m2) return;
    const s1 = Storage.getMonthStats(m1);
    const s2 = Storage.getMonthStats(m2);
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('cmp-income-1', Storage.formatCurrency(s1.income));
    setText('cmp-income-2', Storage.formatCurrency(s2.income));
    setText('cmp-expense-1', Storage.formatCurrency(s1.expenses));
    setText('cmp-expense-2', Storage.formatCurrency(s2.expenses));
    setText('cmp-savings-1', Storage.formatCurrency(s1.savings));
    setText('cmp-savings-2', Storage.formatCurrency(s2.savings));
    const diff = s2.savings - s1.savings;
    setText('cmp-diff', (diff >= 0 ? '+' : '') + Storage.formatCurrency(diff));
  }

  return { renderDashboardCharts, renderAnalyticsPage, renderMonthlyReport, initReportFilters, renderComparison, getLast6Months };
})();
