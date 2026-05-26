/**
 * Theme management with localStorage persistence
 */
const ThemeManager = (function () {
  const THEMES = ['dark', 'light', 'neon', 'minimal'];

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.saveSettings({ theme });
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function init() {
    const { theme } = Storage.getSettings();
    apply(theme || 'dark');

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => apply(btn.dataset.theme));
    });

    const cycleBtn = document.getElementById('theme-cycle');
    if (cycleBtn) {
      cycleBtn.addEventListener('click', () => {
        const current = Storage.getSettings().theme;
        const idx = THEMES.indexOf(current);
        apply(THEMES[(idx + 1) % THEMES.length]);
      });
    }
  }

  return { init, apply, THEMES };
})();
