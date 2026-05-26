/**
 * Transaction CRUD and rendering
 */
const Transactions = (function () {
  function getCategoryInfo(categoryId) {
    return Storage.getCategories().find(c => c.id === categoryId) || { name: categoryId, icon: '📁', color: '#64748B' };
  }

  function renderList(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let txs = [...Storage.getTransactions()];

    if (options.type) txs = txs.filter(t => t.type === options.type);
    if (options.category) txs = txs.filter(t => t.category === options.category);
    if (options.month) txs = txs.filter(t => t.date.startsWith(options.month));
    if (options.search) {
      const q = options.search.toLowerCase();
      txs = txs.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (options.sort === 'amount-desc') txs.sort((a, b) => b.amount - a.amount);
    else if (options.sort === 'amount-asc') txs.sort((a, b) => a.amount - b.amount);
    else if (options.sort === 'date-asc') txs.sort((a, b) => a.date.localeCompare(b.date));
    else txs.sort((a, b) => b.date.localeCompare(a.date));

    if (options.limit) txs = txs.slice(0, options.limit);

    if (txs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No transactions found</p>
          <a href="add-expense.html" class="btn btn-primary mt-2">Add Transaction</a>
        </div>`;
      return;
    }

    container.innerHTML = txs.map(tx => {
      const cat = getCategoryInfo(tx.category);
      const statusIcon = tx.type === 'income' ? '↑' : '↓';
      return `
        <div class="transaction-item" data-id="${tx.id}">
          <div class="transaction-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
          <div class="transaction-details">
            <h4>${escapeHtml(tx.title)}</h4>
            <div class="transaction-meta">
              <span class="badge" style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>
              <span>${formatDate(tx.date)}</span>
              <span>${tx.paymentMethod || 'card'}</span>
              <span>${tx.type}</span>
            </div>
          </div>
          <span class="transaction-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}${Storage.formatCurrency(tx.amount)}</span>
          <span style="font-size:1.2rem;opacity:0.5">${statusIcon}</span>
          <div class="transaction-actions">
            <a href="edit-transaction.html?id=${tx.id}" class="btn btn-secondary btn-sm">Edit</a>
            <button class="btn btn-danger btn-sm" data-delete="${tx.id}">Delete</button>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this transaction?')) {
          Storage.deleteTransaction(btn.dataset.delete);
          Notify.toast('Transaction deleted', 'success');
          renderList(containerId, options);
          if (typeof App !== 'undefined' && App.refreshDashboard) App.refreshDashboard();
        }
      });
    });
  }

  function populateCategorySelect(selectId, type) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const cats = Storage.getCategories().filter(c => !type || c.type === type);
    select.innerHTML = cats.map(c =>
      `<option value="${c.id}">${c.icon} ${c.name}</option>`
    ).join('');
  }

  function handleForm(formId, defaultType) {
    const form = document.getElementById(formId);
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');

    if (editId) {
      const tx = Storage.getTransactions().find(t => t.id === editId);
      if (tx) {
        form.querySelector('[name="title"]').value = tx.title;
        form.querySelector('[name="amount"]').value = tx.amount;
        form.querySelector('[name="category"]').value = tx.category;
        form.querySelector('[name="date"]').value = tx.date;
        form.querySelector('[name="notes"]').value = tx.notes || '';
        if (form.querySelector('[name="paymentMethod"]')) form.querySelector('[name="paymentMethod"]').value = tx.paymentMethod;
        if (form.querySelector('[name="type"]')) form.querySelector('[name="type"]').value = tx.type;
      }
    } else if (defaultType && form.querySelector('[name="type"]')) {
      form.querySelector('[name="type"]').value = defaultType;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd);
      if (!data.title || !data.amount) {
        Notify.toast('Please fill required fields', 'error');
        return;
      }
      if (editId) {
        Storage.updateTransaction(editId, data);
        Notify.toast('Transaction updated', 'success');
      } else {
        Storage.addTransaction(data);
        Notify.toast('Transaction added', 'success');
      }
      setTimeout(() => { window.location.href = 'transactions.html'; }, 800);
    });
  }

  function initFilters() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    filterForm.addEventListener('change', applyFilters);
    filterForm.addEventListener('submit', (e) => { e.preventDefault(); applyFilters(); });

    const params = new URLSearchParams(window.location.search);
    if (params.get('q') && document.getElementById('search-input')) {
      document.getElementById('search-input').value = params.get('q');
    }
    applyFilters();
  }

  function applyFilters() {
    const search = document.getElementById('search-input')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';
    const month = document.getElementById('filter-month')?.value || '';
    const type = document.getElementById('filter-type')?.value || '';
    const sort = document.getElementById('filter-sort')?.value || '';
    renderList('transaction-list', { search, category, month, type, sort });
  }

  function formatDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function escapeHtml(str) {
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  }

  return { renderList, populateCategorySelect, handleForm, initFilters, getCategoryInfo };
})();
