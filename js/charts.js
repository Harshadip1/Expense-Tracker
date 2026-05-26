/**
 * Canvas-based chart rendering (no external dependencies)
 */
const Charts = (function () {
  const colors = ['#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#8B5CF6'];

  function getCtx(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = (rect.height || 280) * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = (rect.height || 280) + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height || 280 };
  }

  function clear(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
  }

  function pieChart(canvasId, data, labels) {
    const result = getCtx(canvasId);
    if (!result) return;
    const { ctx, w, h } = result;
    clear(ctx, w, h);
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) {
      ctx.fillStyle = '#64748B';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', w / 2, h / 2);
      return;
    }
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 40;
    let start = -Math.PI / 2;
    data.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      start += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1E293B';
    ctx.fill();
    let legendY = 20;
    labels.forEach((label, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(10, legendY, 12, 12);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${label} (${((data[i] / total) * 100).toFixed(0)}%)`, 28, legendY + 10);
      legendY += 18;
    });
  }

  function lineChart(canvasId, datasets, labels) {
    const result = getCtx(canvasId);
    if (!result) return;
    const { ctx, w, h } = result;
    clear(ctx, w, h);
    const pad = { t: 20, r: 20, b: 40, l: 50 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const allVals = datasets.flatMap(d => d.data);
    const max = Math.max(...allVals, 1);
    const min = 0;

    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
      const val = max - (max - min) * (i / 4);
      ctx.fillStyle = '#64748B';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(val).toLocaleString(), pad.l - 8, y + 4);
    }

    datasets.forEach((ds, di) => {
      ctx.beginPath();
      ctx.strokeStyle = ds.color || colors[di];
      ctx.lineWidth = 2.5;
      ds.data.forEach((val, i) => {
        const x = pad.l + (chartW / (ds.data.length - 1 || 1)) * i;
        const y = pad.t + chartH - ((val - min) / (max - min)) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.lineTo(pad.l + chartW, pad.t + chartH);
      ctx.lineTo(pad.l, pad.t + chartH);
      ctx.closePath();
      ctx.fillStyle = (ds.color || colors[di]) + '22';
      ctx.fill();
    });

    labels.forEach((label, i) => {
      const x = pad.l + (chartW / (labels.length - 1 || 1)) * i;
      ctx.fillStyle = '#64748B';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, h - 10);
    });
  }

  function barChart(canvasId, data, labels) {
    const result = getCtx(canvasId);
    if (!result) return;
    const { ctx, w, h } = result;
    clear(ctx, w, h);
    const pad = { t: 20, r: 20, b: 40, l: 50 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const max = Math.max(...data, 1);
    const barW = chartW / data.length * 0.6;
    const gap = chartW / data.length;

    data.forEach((val, i) => {
      const barH = (val / max) * chartH;
      const x = pad.l + gap * i + (gap - barW) / 2;
      const y = pad.t + chartH - barH;
      const gradient = ctx.createLinearGradient(x, y, x, pad.t + chartH);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#06B6D4');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();
      ctx.fillStyle = '#64748B';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] || '', x + barW / 2, h - 10);
    });
  }

  function circularProgress(canvasId, percent, label) {
    const result = getCtx(canvasId);
    if (!result) return;
    const { ctx, w, h } = result;
    clear(ctx, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 15;
    const start = -Math.PI / 2;
    const end = start + (Math.min(percent, 100) / 100) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#7C3AED');
    grad.addColorStop(1, '#06B6D4');
    ctx.strokeStyle = percent > 90 ? '#EF4444' : percent > 70 ? '#F59E0B' : grad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(percent) + '%', cx, cy);
    if (label) {
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(label, cx, cy + 18);
    }
  }

  function animateCounter(el, target, duration = 1200) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      el.textContent = Storage.formatCurrency(current);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  return { pieChart, lineChart, barChart, circularProgress, animateCounter };
})();
