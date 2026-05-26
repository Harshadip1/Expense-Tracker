/**
 * LocalStorage persistence layer for Expense Tracker
 */
const Storage = (function () {
  const KEYS = {
    transactions: 'et_transactions',
    budgets: 'et_budgets',
    categories: 'et_categories',
    settings: 'et_settings',
    goals: 'et_goals',
    recurring: 'et_recurring',
    notifications: 'et_notifications'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'food', name: 'Food', icon: '🍔', color: '#F59E0B', type: 'expense' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899', type: 'expense' },
    { id: 'bills', name: 'Bills', icon: '📄', color: '#6366F1', type: 'expense' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8B5CF6', type: 'expense' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#06B6D4', type: 'expense' },
    { id: 'health', name: 'Health', icon: '💊', color: '#22C55E', type: 'expense' },
    { id: 'education', name: 'Education', icon: '📚', color: '#3B82F6', type: 'expense' },
    { id: 'salary', name: 'Salary', icon: '💰', color: '#22C55E', type: 'income' },
    { id: 'freelance', name: 'Freelance', icon: '💼', color: '#10B981', type: 'income' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#7C3AED', type: 'income' },
    { id: 'other-expense', name: 'Other', icon: '📦', color: '#64748B', type: 'expense' },
    { id: 'other-income', name: 'Other Income', icon: '💵', color: '#64748B', type: 'income' }
  ];

  const DEFAULT_SETTINGS = {
    theme: 'dark',
    currency: 'USD',
    currencySymbol: '$',
    monthlyBudget: 3000,
    language: 'en'
  };

  function get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function init() {
    if (!get(KEYS.categories)) set(KEYS.categories, DEFAULT_CATEGORIES);
    if (!get(KEYS.transactions)) set(KEYS.transactions, []);
    if (!get(KEYS.budgets)) set(KEYS.budgets, {});
    if (!get(KEYS.settings)) set(KEYS.settings, DEFAULT_SETTINGS);
    if (!get(KEYS.goals)) set(KEYS.goals, []);
    if (!get(KEYS.recurring)) set(KEYS.recurring, []);
    if (!get(KEYS.notifications)) set(KEYS.notifications, []);
  }

  function getTransactions() {
    return get(KEYS.transactions, []);
  }

  function saveTransactions(transactions) {
    set(KEYS.transactions, transactions);
  }

  function addTransaction(tx) {
    const list = getTransactions();
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      title: tx.title,
      amount: parseFloat(tx.amount),
      type: tx.type,
      category: tx.category,
      date: tx.date || new Date().toISOString().split('T')[0],
      notes: tx.notes || '',
      paymentMethod: tx.paymentMethod || 'card',
      createdAt: new Date().toISOString()
    };
    list.unshift(newTx);
    saveTransactions(list);
    checkBudgetAlerts(newTx);
    return newTx;
  }

  function updateTransaction(id, updates) {
    const list = getTransactions();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, amount: parseFloat(updates.amount ?? list[idx].amount) };
    saveTransactions(list);
    return list[idx];
  }

  function deleteTransaction(id) {
    const list = getTransactions().filter(t => t.id !== id);
    saveTransactions(list);
  }

  function getCategories() {
    return get(KEYS.categories, DEFAULT_CATEGORIES);
  }

  function saveCategories(categories) {
    set(KEYS.categories, categories);
  }

  function addCategory(cat) {
    const cats = getCategories();
    const newCat = {
      id: 'cat_' + Date.now(),
      name: cat.name,
      icon: cat.icon || '📁',
      color: cat.color || '#7C3AED',
      type: cat.type || 'expense'
    };
    cats.push(newCat);
    saveCategories(cats);
    return newCat;
  }

  function getBudgets() {
    return get(KEYS.budgets, {});
  }

  function saveBudgets(budgets) {
    set(KEYS.budgets, budgets);
  }

  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...get(KEYS.settings, {}) };
  }

  function saveSettings(settings) {
    set(KEYS.settings, { ...getSettings(), ...settings });
  }

  function getGoals() {
    return get(KEYS.goals, []);
  }

  function saveGoals(goals) {
    set(KEYS.goals, goals);
  }

  function getRecurring() {
    return get(KEYS.recurring, []);
  }

  function saveRecurring(recurring) {
    set(KEYS.recurring, recurring);
  }

  function getNotifications() {
    return get(KEYS.notifications, []);
  }

  function addNotification(notif) {
    const list = getNotifications();
    list.unshift({
      id: 'n_' + Date.now(),
      ...notif,
      read: false,
      createdAt: new Date().toISOString()
    });
    set(KEYS.notifications, list.slice(0, 50));
  }

  function markNotificationRead(id) {
    const list = getNotifications().map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    set(KEYS.notifications, list);
  }

  function checkBudgetAlerts(transaction) {
    if (transaction.type !== 'expense') return;
    const settings = getSettings();
    const month = transaction.date.slice(0, 7);
    const expenses = getTransactions()
      .filter(t => t.type === 'expense' && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);

    const budgets = getBudgets();
    const catBudget = budgets[transaction.category];
    if (catBudget) {
      const catSpent = getTransactions()
        .filter(t => t.type === 'expense' && t.category === transaction.category && t.date.startsWith(month))
        .reduce((s, t) => s + t.amount, 0);
      if (catSpent > catBudget) {
        addNotification({
          type: 'warning',
          title: 'Category budget exceeded',
          message: `Spending in ${transaction.category} has exceeded the set limit.`
        });
      }
    }

    if (expenses > settings.monthlyBudget) {
      addNotification({
        type: 'danger',
        title: 'Monthly budget exceeded',
        message: 'Total expenses have exceeded your monthly budget limit.'
      });
    }

    const income = getTransactions()
      .filter(t => t.type === 'income' && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    if (income > 0 && savings < income * 0.1) {
      addNotification({
        type: 'warning',
        title: 'Low savings warning',
        message: 'Your savings rate is below 10% this month.'
      });
    }
  }

  function formatCurrency(amount) {
    const { currencySymbol } = getSettings();
    return currencySymbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getMonthStats(yearMonth) {
    const txs = getTransactions().filter(t => t.date.startsWith(yearMonth));
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, savings: income - expenses, balance: income - expenses, count: txs.length };
  }

  function getCategoryBreakdown(yearMonth, type = 'expense') {
    const txs = getTransactions().filter(t => t.type === type && t.date.startsWith(yearMonth));
    const map = {};
    txs.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }

  function seedDemoData() {
    if (getTransactions().length > 0) return;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const demos = [
      { title: 'Monthly Salary', amount: 5200, type: 'income', category: 'salary', date: `${ym}-01`, paymentMethod: 'bank' },
      { title: 'Grocery Store', amount: 127.45, type: 'expense', category: 'food', date: `${ym}-03`, paymentMethod: 'card' },
      { title: 'Electric Bill', amount: 89.20, type: 'expense', category: 'bills', date: `${ym}-05`, paymentMethod: 'bank' },
      { title: 'Streaming Service', amount: 15.99, type: 'expense', category: 'entertainment', date: `${ym}-07`, paymentMethod: 'card' },
      { title: 'Freelance Project', amount: 850, type: 'income', category: 'freelance', date: `${ym}-10`, paymentMethod: 'bank' },
      { title: 'Restaurant', amount: 62.30, type: 'expense', category: 'food', date: `${ym}-12`, paymentMethod: 'card' },
      { title: 'Gym Membership', amount: 45, type: 'expense', category: 'health', date: `${ym}-15`, paymentMethod: 'card' },
      { title: 'Online Course', amount: 199, type: 'expense', category: 'education', date: `${ym}-18`, paymentMethod: 'card' }
    ];
    demos.forEach(d => addTransaction(d));
    saveBudgets({
      food: 400,
      shopping: 300,
      bills: 500,
      entertainment: 150,
      travel: 200,
      health: 100,
      education: 250
    });
    saveGoals([
      { id: 'g1', name: 'Emergency Fund', target: 10000, current: 3500, deadline: '2026-12-31' },
      { id: 'g2', name: 'Vacation', target: 3000, current: 1200, deadline: '2026-08-01' }
    ]);
  }

  init();

  return {
    KEYS,
    init,
    getTransactions,
    saveTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getCategories,
    saveCategories,
    addCategory,
    getBudgets,
    saveBudgets,
    getSettings,
    saveSettings,
    getGoals,
    saveGoals,
    getRecurring,
    saveRecurring,
    getNotifications,
    addNotification,
    markNotificationRead,
    formatCurrency,
    getMonthStats,
    getCategoryBreakdown,
    seedDemoData,
    DEFAULT_CATEGORIES
  };
})();
