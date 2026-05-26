/**
 * Toast notifications and notification dropdown
 */
const Notify = (function () {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function toast(message, type = 'info', duration = 4000) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    el.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    getContainer().appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  function renderDropdown() {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notification-count');
    if (!list) return;

    const notifs = Storage.getNotifications();
    const unread = notifs.filter(n => !n.read).length;

    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    if (notifs.length === 0) {
      list.innerHTML = '<div class="notification-item"><span>No notifications yet</span></div>';
      return;
    }

    list.innerHTML = notifs.slice(0, 10).map(n => `
      <div class="notification-item" data-id="${n.id}">
        <span>${n.type === 'danger' ? '🔴' : n.type === 'warning' ? '🟡' : '🔵'}</span>
        <div>
          <strong style="display:block;font-size:0.85rem">${escapeHtml(n.title)}</strong>
          <span style="font-size:0.75rem;color:var(--text-secondary)">${escapeHtml(n.message)}</span>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.notification-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        Storage.markNotificationRead(item.dataset.id);
        renderDropdown();
      });
    });
  }

  function initDropdown() {
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (!bell || !dropdown) return;

    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      renderDropdown();
    });

    document.addEventListener('click', () => dropdown.classList.remove('show'));
    renderDropdown();
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function checkAlerts() {
    const settings = Storage.getSettings();
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const stats = Storage.getMonthStats(ym);

    if (stats.expenses > settings.monthlyBudget * 0.9 && stats.expenses <= settings.monthlyBudget) {
      Storage.addNotification({
        type: 'warning',
        title: 'Budget alert',
        message: 'You have used 90% of your monthly budget.'
      });
    }
  }

  return { toast, renderDropdown, initDropdown, checkAlerts };
})();
