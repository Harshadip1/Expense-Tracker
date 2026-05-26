# Expense Tracker

A modern, premium personal finance web application built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. Track income and expenses, manage budgets, view analytics, generate monthly reports, and customize themes — all with data persisted locally in your browser.

![Technologies](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Technologies](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Technologies](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## Features

### Core
- **Income & expense tracking** — Add, edit, and delete transactions with categories, notes, dates, and payment methods
- **Budget management** — Monthly and category-wise budgets with progress bars and alerts
- **Financial analytics** — Pie charts, line graphs, bar charts, and circular progress indicators
- **Monthly reports** — Summaries with printable/export layouts
- **Category management** — Built-in and custom categories with icons and colors
- **Search & filters** — Search by keyword; filter by category, month, type; sort by amount or date

### Dashboard
- Total balance, income, expenses, and monthly savings
- Animated statistic cards with counter animations
- Budget progress and recent transactions
- Financial goals tracker

### Themes
- **Dark** (default)
- **Light**
- **Neon Finance**
- **Minimal Professional**

### Advanced
- LocalStorage persistence
- Toast notifications and alert dropdown
- Recurring expense UI
- Savings calculator
- Currency selector (USD, EUR, GBP, INR, JPY)
- Calendar view
- Month comparison
- JSON data export

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic structure, multi-page app |
| CSS3 | Layout, glassmorphism, animations, CSS variables |
| Vanilla JavaScript | CRUD, charts, storage, themes |
| Canvas API | Custom charts (no external libraries) |
| LocalStorage | Client-side data persistence |

---

## How to Run in Visual Studio Code

### Step 1: Install Visual Studio Code
1. Download [Visual Studio Code](https://code.visualstudio.com/)
2. Run the installer and complete setup

### Step 2: Open the Project Folder
1. Launch VS Code
2. Go to **File → Open Folder**
3. Select the `Expense Tracker` project folder

### Step 3: Install Live Server Extension
1. Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **Live Server** by Ritwick Dey
3. Click **Install**

### Step 4: Launch the App
1. In the Explorer, right-click `index.html`
2. Click **Open with Live Server**
3. Your browser opens at `http://127.0.0.1:5500` (port may vary)

### Alternative: Open Directly
Double-click `index.html` to open in a browser. Some features work best with Live Server to avoid file-path restrictions.

---

## Usage Guide

1. **First launch** — Demo data loads automatically if no data exists
2. **Add transactions** — Use **Add Income** or **Add Expense** from the sidebar
3. **Set budgets** — Go to **Budget Setup** and configure limits
4. **View analytics** — Open **Analytics** for charts and trends
5. **Reports** — Use **Reports** or **Monthly Report** to review and print
6. **Themes** — Click the palette icon in the top bar or visit **Themes**
7. **Settings** — Change currency and monthly budget under **Settings**

---

## Folder Structure

```
Expense Tracker/
├── index.html              # Main dashboard
├── transactions.html       # All transactions
├── add-income.html         # Add income form
├── add-expense.html        # Add expense form
├── analytics.html          # Charts & analytics
├── reports.html            # Monthly reports
├── settings.html           # App settings
├── themes.html             # Theme switcher
├── ... (24+ pages total)
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── style.css           # Main styles
│   ├── themes.css          # Theme variants
│   └── responsive.css      # Mobile breakpoints
├── js/
│   ├── storage.js          # LocalStorage layer
│   ├── app.js              # Application bootstrap
│   ├── transactions.js     # Transaction CRUD
│   ├── budgets.js          # Budget logic
│   ├── analytics.js        # Charts & reports
│   ├── charts.js           # Canvas chart rendering
│   ├── themes.js           # Theme persistence
│   ├── notifications.js    # Toasts & alerts
│   └── navigation.js       # Sidebar & layout
├── assets/
│   └── images/             # Static assets
└── README.md
```

### Pages Overview (30 pages)

| Section | Pages |
|---------|-------|
| Overview | Dashboard, Overview, Insights, Calendar, Widgets |
| Transactions | All, Income, Expenses, Add, Edit, Search, History |
| Budgets | Budgets, Setup, Goals, Recurring |
| Analytics | Analytics, Reports, Monthly Report, Comparison, Category Analytics, Export |
| Manage | Categories, Wallets, Savings Calculator, Notifications |
| Settings | Settings, Themes, Help |

---

## Theme Customization

Themes are defined in `css/themes.css` using `[data-theme="..."]` selectors. To customize:

1. Edit CSS variables in `css/variables.css`
2. Add or modify theme blocks in `css/themes.css`
3. Register the theme in `js/themes.js` (`THEMES` array)

Primary palette (default dark theme):

| Token | Value |
|-------|-------|
| Background | `#0F172A` |
| Primary | `#7C3AED` |
| Accent | `#06B6D4` |
| Success | `#22C55E` |
| Danger | `#EF4444` |
| Warning | `#F59E0B` |
| Text | `#F8FAFC` |

---

## Data Storage System

All data is stored in the browser **localStorage** under these keys:

| Key | Content |
|-----|---------|
| `et_transactions` | Income/expense records |
| `et_budgets` | Category budget limits |
| `et_categories` | Category definitions |
| `et_settings` | Theme, currency, monthly budget |
| `et_goals` | Financial goals |
| `et_recurring` | Recurring items |
| `et_notifications` | System alerts |

- Data never leaves your device
- Use **Load Demo Data** or **Reset All Data** in Settings to manage data
- Export JSON from the **Export** page

---

## Charts and Analytics

Charts are rendered with the **Canvas API** in `js/charts.js`:

- **Pie chart** — Expense/category breakdown
- **Line chart** — Income vs expenses, savings trends
- **Bar chart** — Monthly spending
- **Circular progress** — Budget utilization

Charts update dynamically when transactions change and redraw on window resize.

---

## Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

Requires: localStorage, CSS Grid/Flexbox, Canvas 2D, ES6+

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not saving | Enable cookies/storage; avoid private/incognito mode |
| Charts empty | Add transactions dated in the current month |
| Sidebar not visible on mobile | Tap the ☰ menu button |
| Styles broken | Use Live Server; ensure `css/` paths are correct |
| Demo data missing | Settings → **Load Demo Data** |

---

## Performance

- Efficient DOM updates (targeted re-renders)
- Canvas charts with device pixel ratio scaling
- CSS animations via GPU-friendly transforms
- Intersection Observer for scroll reveal
- Lazy chart redraw on resize only when needed

---

## License

This project is provided as-is for educational and portfolio use. No personal branding or third-party data is included.

---

## Quick Start Checklist

- [ ] Install VS Code
- [ ] Install Live Server extension
- [ ] Open project folder
- [ ] Right-click `index.html` → Open with Live Server
- [ ] Explore the dashboard and add your first transaction
