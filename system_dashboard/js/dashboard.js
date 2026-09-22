/**
 * ⚡ CYBER TASK MANAGER // DASHBOARD ENGINE
 * Real-time Telemetry, Hardware Canvas Charts, Process Management & Kill API
 */

(function () {
  'use strict';

  // Application State
  const state = {
    activeTab: 'overview',
    refreshIntervalMs: 1000,
    pollTimer: null,
    isPaused: false,
    selectedPids: new Set(),
    processSort: { field: 'cpu', order: 'desc' },
    processFilter: 'all',
    searchQuery: '',
    history: {
      cpu: [],
      ram: [],
      netRecv: [],
      netSent: [],
      diskRead: [],
      diskWrite: []
    },
    systemSpecsLoaded: false
  };

  // DOM Elements Cache
  const DOM = {
    // Tabs
    tabs: document.querySelectorAll('.nav-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    // KPI Cards
    cpuPercent: document.getElementById('kpi-cpu-val'),
    cpuFill: document.getElementById('kpi-cpu-fill'),
    cpuFreq: document.getElementById('kpi-cpu-freq'),
    cpuProcesses: document.getElementById('kpi-cpu-procs'),
    coresGrid: document.getElementById('cores-grid'),

    ramPercent: document.getElementById('kpi-ram-val'),
    ramFill: document.getElementById('kpi-ram-fill'),
    ramUsed: document.getElementById('kpi-ram-used'),
    ramAvail: document.getElementById('kpi-ram-avail'),
    swapPercent: document.getElementById('kpi-swap-val'),

    diskFill: document.getElementById('kpi-disk-fill'),
    diskReadSpeed: document.getElementById('kpi-disk-read'),
    diskWriteSpeed: document.getElementById('kpi-disk-write'),
    drivesList: document.getElementById('drives-list'),

    netRecvSpeed: document.getElementById('kpi-net-recv'),
    netSentSpeed: document.getElementById('kpi-net-sent'),
    netAdapterBadge: document.getElementById('kpi-net-adapter'),

    // Uptime & Status
    uptimeDisplay: document.getElementById('uptime-display'),
    refreshSelect: document.getElementById('refresh-rate-select'),
    totalProcsBadge: document.getElementById('badge-total-procs'),

    // Process Table
    processTableBody: document.getElementById('process-table-body'),
    processSearchInput: document.getElementById('process-search-input'),
    filterPills: document.querySelectorAll('.filter-pill'),
    tableHeaders: document.querySelectorAll('.cyber-table th[data-sort]'),
    bulkActions: document.getElementById('bulk-actions-bar'),
    bulkCount: document.getElementById('bulk-selected-count'),
    btnBulkKill: document.getElementById('btn-bulk-kill'),
    btnBulkCancel: document.getElementById('btn-bulk-cancel'),

    // Connections Table
    connectionsTableBody: document.getElementById('connections-table-body'),
    connectionsCount: document.getElementById('badge-total-conns'),

    // Health Banner & Guide
    healthBanner: document.getElementById('system-health-banner'),
    healthTitle: document.getElementById('health-title'),
    healthDesc: document.getElementById('health-desc'),
    healthPill: document.getElementById('health-pill'),
    btnToggleGuide: document.getElementById('btn-toggle-guide'),
    btnGuideClose: document.getElementById('btn-guide-close'),
    quickGuidePanel: document.getElementById('quick-guide-panel'),
    btnBannerClean: document.getElementById('btn-banner-clean'),

    // Modals
    processModal: document.getElementById('process-detail-modal'),
    modalProcName: document.getElementById('modal-proc-name'),
    modalProcBody: document.getElementById('modal-proc-body'),
    modalProcKillBtn: document.getElementById('modal-proc-kill-btn'),
    modalCloseBtns: document.querySelectorAll('.modal-close'),

    // Clean Hogs Modal
    hogsModal: document.getElementById('hogs-modal'),
    btnOpenHogs: document.getElementById('btn-open-hogs'),
    hogsListContainer: document.getElementById('hogs-list-container'),
    btnKillHogsConfirm: document.getElementById('btn-kill-hogs-confirm'),

    // Toasts
    toastContainer: document.getElementById('toast-container'),

    // Canvases
    cpuCanvas: document.getElementById('canvas-cpu'),
    ramCanvas: document.getElementById('canvas-ram'),
    netCanvas: document.getElementById('canvas-net')
  };

  // =========================================================================
  // UTILITY HELPERS
  // =========================================================================
  function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function formatSpeed(bytesPerSec) {
    return formatBytes(bytesPerSec) + '/s';
  }

  function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1rem;">&times;</button>
    `;

    toast.querySelector('button').onclick = () => toast.remove();
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // =========================================================================
  // HARDWARE CANVAS CHART ENGINE
  // =========================================================================
  class CyberChart {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = Object.assign({
        color: '#8b5cf6',
        secondaryColor: '#ec4899',
        fillGradient: true,
        maxVal: 100,
        autoScale: false,
        unit: '%'
      }, options);
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    draw(dataSeries1, dataSeries2 = null) {
      if (!this.canvas || !this.width || !this.height) return;
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      // Draw subtle cyber gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSteps = 4;
      for (let i = 1; i < gridSteps; i++) {
        const y = Math.floor((h / gridSteps) * i);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (!dataSeries1 || dataSeries1.length === 0) return;

      // Determine scale
      let maxVal = this.options.maxVal;
      if (this.options.autoScale) {
        let max1 = Math.max(...dataSeries1, 10);
        let max2 = dataSeries2 ? Math.max(...dataSeries2, 0) : 0;
        maxVal = Math.max(max1, max2) * 1.25;
      }

      // Draw series 1 (Area + Glow Line)
      this.drawLineSeries(dataSeries1, maxVal, this.options.color, this.options.fillGradient);

      // Draw series 2 if provided (e.g. Upload vs Download)
      if (dataSeries2) {
        this.drawLineSeries(dataSeries2, maxVal, this.options.secondaryColor, false);
      }
    }

    drawLineSeries(data, maxVal, color, fillArea = true) {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const len = data.length;
      if (len < 2) return;

      const step = w / (len - 1);
      const points = [];

      for (let i = 0; i < len; i++) {
        const val = Math.min(Math.max(data[i], 0), maxVal);
        const y = h - (val / maxVal) * (h - 10) - 5;
        const x = i * step;
        points.push({ x, y });
      }

      // Fill Area Gradient
      if (fillArea) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, h);
        ctx.lineTo(points[0].x, points[0].y);

        for (let i = 0; i < len - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[len - 1].x, points[len - 1].y);
        ctx.lineTo(w, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, color.replace(')', ', 0.35)').replace('rgb', 'rgba').replace('#', 'rgba('));
        // Fallback smooth fill
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        grad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // Stroke Neon Line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < len - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[len - 1].x, points[len - 1].y);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Initialize Canvas Charts
  let cpuChart, ramChart, netChart;
  function initCharts() {
    if (DOM.cpuCanvas) {
      cpuChart = new CyberChart(DOM.cpuCanvas, { color: '#a78bfa', maxVal: 100 });
    }
    if (DOM.ramCanvas) {
      ramChart = new CyberChart(DOM.ramCanvas, { color: '#22d3ee', maxVal: 100 });
    }
    if (DOM.netCanvas) {
      netChart = new CyberChart(DOM.netCanvas, {
        color: '#22d3ee',
        secondaryColor: '#ec4899',
        autoScale: true,
        fillGradient: false
      });
    }
  }

  // =========================================================================
  // TELEMETRY & SYSTEM STATS POLLER
  // =========================================================================
  async function fetchSystemStats() {
    try {
      const res = await fetch('/api/system');
      if (!res.ok) throw new Error('System stats HTTP error');
      const data = await res.json();
      updateSystemUI(data);
    } catch (err) {
      console.warn('Chyba čtení telemetrie:', err);
    }
  }

  function updateHealthBanner(cpuPercent, ramPercent) {
    if (!DOM.healthBanner) return;

    if (cpuPercent > 80 || ramPercent > 88) {
      DOM.healthBanner.className = 'system-health-banner health-critical';
      if (DOM.healthTitle) DOM.healthTitle.textContent = 'Pozor: Počítač je silně vytížený';
      if (DOM.healthDesc) {
        DOM.healthDesc.textContent = `Vysoká zátěž: Procesor ${Math.round(cpuPercent)} %, Paměť RAM ${Math.round(ramPercent)} %. Doporučujeme kliknout na „Vyčistit zátěž“ a ukončit nepotřebné programy.`;
      }
      if (DOM.healthPill) DOM.healthPill.textContent = 'STAV: VYSOKÁ ZÁTĚŽ';
    } else if (cpuPercent > 45 || ramPercent > 70) {
      DOM.healthBanner.className = 'system-health-banner health-warning';
      if (DOM.healthTitle) DOM.healthTitle.textContent = 'Zvýšená zátěž počítače';
      if (DOM.healthDesc) {
        DOM.healthDesc.textContent = `Systém běží, ale paměť (${Math.round(ramPercent)} %) nebo procesor (${Math.round(cpuPercent)} %) pracují intenzivněji. Pokud se PC zpomaluje, zkontrolujte běžící programy.`;
      }
      if (DOM.healthPill) DOM.healthPill.textContent = 'STAV: ZVÝŠENÁ ZÁTĚŽ';
    } else {
      DOM.healthBanner.className = 'system-health-banner health-optimal';
      if (DOM.healthTitle) DOM.healthTitle.textContent = 'Vše běží hladce a optimálně';
      if (DOM.healthDesc) {
        DOM.healthDesc.textContent = `Procesor (${Math.round(cpuPercent)} %) i operační paměť (${Math.round(ramPercent)} %) mají dostatek volného výkonu. Žádný program nezpomaluje počítač.`;
      }
      if (DOM.healthPill) DOM.healthPill.textContent = 'STAV: 100% V POŘÁDKU';
    }
  }

  function updateSystemUI(data) {
    if (!data) return;

    // CPU Card
    const cpuTotal = data.cpu.total_percent || 0;
    DOM.cpuPercent.textContent = Math.round(cpuTotal);
    DOM.cpuFill.style.width = `${Math.min(cpuTotal, 100)}%`;
    DOM.cpuFreq.textContent = `${(data.cpu.frequency_mhz / 1000).toFixed(2)} GHz`;
    DOM.cpuProcesses.textContent = `${data.system.total_processes} úloh`;

    const cpuStatusEl = document.getElementById('kpi-cpu-status');
    if (cpuStatusEl) {
      if (cpuTotal > 80) {
        cpuStatusEl.textContent = 'Vysoká zátěž';
        cpuStatusEl.style.color = 'var(--rose-400)';
      } else if (cpuTotal > 50) {
        cpuStatusEl.textContent = 'Střední zátěž';
        cpuStatusEl.style.color = 'var(--amber-400)';
      } else {
        cpuStatusEl.textContent = 'V normě';
        cpuStatusEl.style.color = 'var(--emerald-400)';
      }
    }

    const cpuCoresEl = document.getElementById('kpi-cpu-cores-text');
    if (cpuCoresEl && data.system.logical_cores) {
      cpuCoresEl.textContent = `${data.system.logical_cores} jader (${data.system.physical_cores || 1} fyz.)`;
    }

    const headerCpu = document.getElementById('header-cpu-name');
    if (headerCpu && data.system.cpu_model) {
      headerCpu.textContent = data.system.cpu_model.split('@')[0].trim();
    }

    // Per-Core Grid
    if (data.cpu.per_core && data.cpu.per_core.length > 0) {
      updateCoresGrid(data.cpu.per_core);
    }

    // RAM Card
    const ram = data.memory;
    DOM.ramPercent.textContent = Math.round(ram.percent);
    DOM.ramFill.style.width = `${Math.min(ram.percent, 100)}%`;
    DOM.ramUsed.textContent = formatBytes(ram.used);
    DOM.ramAvail.textContent = `${formatBytes(ram.available)} volno`;
    DOM.swapPercent.textContent = `${Math.round(ram.swap_percent)}% swap`;

    const ramTotalEl = document.getElementById('kpi-ram-total-text');
    if (ramTotalEl) {
      ramTotalEl.textContent = `z celkem ${formatBytes(ram.total)}`;
    }

    // Update Overall System Health Banner
    updateHealthBanner(cpuTotal, ram.percent);

    // Disks
    const diskIo = data.disk_io;
    DOM.diskReadSpeed.textContent = formatSpeed(diskIo.read_bytes_sec);
    DOM.diskWriteSpeed.textContent = formatSpeed(diskIo.write_bytes_sec);
    if (data.disks && data.disks.length > 0) {
      updateDrivesList(data.disks);
    }

    // Network
    const net = data.network;
    DOM.netRecvSpeed.textContent = formatSpeed(net.recv_bytes_sec);
    DOM.netSentSpeed.textContent = formatSpeed(net.sent_bytes_sec);

    if (net.adapters && net.adapters.length > 0) {
      DOM.netAdapterBadge.textContent = `${net.adapters[0].name} (${net.adapters[0].ipv4})`;
    }

    // Header Badges
    DOM.uptimeDisplay.textContent = formatUptime(data.uptime);
    DOM.totalProcsBadge.textContent = data.system.total_processes;

    // Rolling Charts Update
    if (data.history) {
      if (cpuChart) cpuChart.draw(data.history.cpu);
      if (ramChart) ramChart.draw(data.history.ram);
      if (netChart) netChart.draw(data.history.net_recv, data.history.net_sent);
    }

    // Populate System Specs Tab once
    if (!state.systemSpecsLoaded) {
      populateSystemSpecs(data);
      state.systemSpecsLoaded = true;
    }

    // Ping server heartbeat
    fetch('/api/ping', { method: 'POST' }).catch(() => {});
  }

  function updateCoresGrid(cores) {
    if (!DOM.coresGrid) return;
    if (DOM.coresGrid.children.length !== cores.length) {
      DOM.coresGrid.innerHTML = '';
      cores.forEach((_, idx) => {
        const box = document.createElement('div');
        box.className = 'core-box';
        box.id = `core-box-${idx}`;
        box.innerHTML = `
          <div class="core-header">
            <span>Core #${idx + 1}</span>
            <span class="core-val" id="core-val-${idx}">0%</span>
          </div>
          <div class="core-bar-track">
            <div class="core-bar-fill" id="core-bar-${idx}"></div>
          </div>
        `;
        DOM.coresGrid.appendChild(box);
      });
    }

    cores.forEach((load, idx) => {
      const valEl = document.getElementById(`core-val-${idx}`);
      const barEl = document.getElementById(`core-bar-${idx}`);
      if (valEl && barEl) {
        valEl.textContent = `${Math.round(load)}%`;
        barEl.style.width = `${Math.min(load, 100)}%`;
        if (load > 80) barEl.style.backgroundColor = 'var(--rose-400)';
        else if (load > 50) barEl.style.backgroundColor = 'var(--amber-400)';
        else barEl.style.backgroundColor = 'var(--violet-400)';
      }
    });
  }

  function updateDrivesList(disks) {
    if (!DOM.drivesList) return;
    DOM.drivesList.innerHTML = '';
    disks.forEach(d => {
      const item = document.createElement('div');
      item.className = 'drive-item';
      item.innerHTML = `
        <div class="drive-meta">
          <strong>${d.mountpoint} (${d.fstype || 'NTFS'})</strong>
          <span>${formatBytes(d.used)} / ${formatBytes(d.total)} (${Math.round(d.percent)}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill fill-disk" style="width: ${Math.min(d.percent, 100)}%"></div>
        </div>
      `;
      DOM.drivesList.appendChild(item);
    });
  }

  function populateSystemSpecs(data) {
    const sys = data.system;
    const groups = [
      {
        category: '🖥️ Počítač & Systém',
        items: [
          { label: 'Název počítače (Hostname)', val: sys.hostname },
          { label: 'Operační systém', val: `${sys.os} (Build ${sys.build})` },
          { label: 'Architektura procesoru', val: sys.arch }
        ]
      },
      {
        category: '⚡ Procesor (CPU)',
        items: [
          { label: 'Model procesoru', val: sys.cpu_model },
          { label: 'Fyzická jádra', val: `${sys.physical_cores} jader` },
          { label: 'Logická vlákna', val: `${sys.logical_cores} vláken` }
        ]
      },
      {
        category: '💾 Paměť & Úložiště',
        items: [
          { label: 'Fyzická paměť RAM', val: formatBytes(data.memory.total) },
          { label: 'Swap / Stránkovací soubor', val: formatBytes(data.memory.swap_total) }
        ]
      },
      {
        category: '⏱️ Provoz & Spuštění',
        items: [
          { label: 'Doba nepřetržitého běhu', val: formatUptime(data.uptime) },
          { label: 'Čas spuštění systému (Boot)', val: data.boot_time }
        ]
      }
    ];

    const container = document.getElementById('system-specs-container');
    if (!container) return;
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'specs-category-grid';

    groups.forEach(g => {
      const card = document.createElement('div');
      card.className = 'spec-category-card';
      card.innerHTML = `
        <h3 class="spec-category-title">${g.category}</h3>
        <div class="spec-items-list">
          ${g.items.map(it => `
            <div class="spec-item">
              <span class="spec-label">${it.label}</span>
              <span class="spec-val">${it.val}</span>
            </div>
          `).join('')}
        </div>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // =========================================================================
  // PROCESS MANAGER (TAB 2)
  // =========================================================================
  let lastProcessesData = [];

  async function fetchProcesses() {
    if (state.activeTab !== 'processes') return;

    try {
      const params = new URLSearchParams({
        sort: state.processSort.field,
        order: state.processSort.order,
        search: state.searchQuery,
        filter: state.processFilter,
        limit: '80'
      });

      const res = await fetch(`/api/processes?${params.toString()}`);
      if (!res.ok) throw new Error('Processes fetch error');
      const data = await res.json();
      lastProcessesData = data.processes || [];
      renderProcessesTable(lastProcessesData);
    } catch (err) {
      console.warn('Chyba načítání procesů:', err);
    }
  }

  function renderProcessesTable(procs) {
    if (!DOM.processTableBody) return;
    DOM.processTableBody.innerHTML = '';

    if (procs.length === 0) {
      DOM.processTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">
            Žádné procesy neodpovídají zadanému filtru.
          </td>
        </tr>
      `;
      return;
    }

    procs.forEach(p => {
      const tr = document.createElement('tr');
      if (p.cpu_percent > 10.0) tr.classList.add('high-cpu');

      const isChecked = state.selectedPids.has(p.pid);
      const isProtected = p.is_protected;

      tr.innerHTML = `
        <td style="width:40px;text-align:center;">
          <input type="checkbox" class="proc-select-cb" data-pid="${p.pid}" ${isChecked ? 'checked' : ''} ${isProtected ? 'disabled' : ''}>
        </td>
        <td style="color:var(--text-muted);">${p.pid}</td>
        <td>
          <div class="proc-name-cell">
            <span class="proc-icon">${p.name.substring(0, 2).toUpperCase()}</span>
            <span>${escapeHtml(p.name)}</span>
            ${isProtected ? '<span class="proc-tag protected">SYSTÉM</span>' : ''}
          </div>
        </td>
        <td style="font-weight:700;color:${p.cpu_percent > 10 ? 'var(--rose-400)' : 'var(--text-primary)'};">
          ${p.cpu_percent.toFixed(1)}%
        </td>
        <td>${p.memory_mb.toFixed(1)} MB</td>
        <td style="color:var(--text-secondary);">${p.memory_percent.toFixed(1)}%</td>
        <td style="color:var(--text-muted);">${p.threads}</td>
        <td style="color:var(--text-secondary);max-width:140px;overflow:hidden;text-overflow:ellipsis;">
          ${escapeHtml(p.username.split('\\').pop())}
        </td>
        <td style="text-align:right;">
          ${!isProtected ? `
            <button class="btn-kill-row" data-pid="${p.pid}" data-name="${escapeHtml(p.name)}">
              Ukončit
            </button>
          ` : '<span style="font-size:0.7rem;color:var(--text-muted);">Chráněno</span>'}
          <button class="btn-info-row" data-pid="${p.pid}" title="Detail procesu">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </button>
        </td>
      `;

      // Event listener for checkbox
      const cb = tr.querySelector('.proc-select-cb');
      if (cb) {
        cb.onchange = (e) => {
          if (e.target.checked) state.selectedPids.add(p.pid);
          else state.selectedPids.delete(p.pid);
          updateBulkBar();
        };
      }

      // Event listener for Kill button
      const killBtn = tr.querySelector('.btn-kill-row');
      if (killBtn) {
        killBtn.onclick = () => killSingleProcess(p.pid, p.name);
      }

      // Event listener for Info button
      const infoBtn = tr.querySelector('.btn-info-row');
      if (infoBtn) {
        infoBtn.onclick = () => openProcessDetail(p.pid);
      }

      DOM.processTableBody.appendChild(tr);
    });

    updateBulkBar();
  }

  function updateBulkBar() {
    const count = state.selectedPids.size;
    if (count > 0) {
      DOM.bulkActions.classList.add('visible');
      DOM.bulkCount.textContent = count;
    } else {
      DOM.bulkActions.classList.remove('visible');
    }
  }

  async function killSingleProcess(pid, name) {
    if (!confirm(`Opravdu chcete ukončit proces '${name}' (PID: ${pid})?`)) return;

    try {
      const res = await fetch('/api/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Proces '${name}' (PID: ${pid}) byl úspěšně ukončen.`, 'success');
        state.selectedPids.delete(pid);
        fetchProcesses();
      } else {
        showToast(data.errors.join(' | ') || 'Ukončení procesu se nezdařilo.', 'danger');
      }
    } catch (err) {
      showToast(`Chyba při komunikaci se serverem: ${err.message}`, 'danger');
    }
  }

  async function killMultipleProcesses(pids) {
    if (pids.length === 0) return;
    if (!confirm(`Opravdu chcete ukončit vybraných ${pids.length} procesů?`)) return;

    try {
      const res = await fetch('/api/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pids })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Úspěšně ukončeno ${data.killed.length} procesů.`, 'success');
        state.selectedPids.clear();
        fetchProcesses();
      } else {
        showToast(data.errors.join('\n'), 'warning');
      }
    } catch (err) {
      showToast(`Chyba ukončování: ${err.message}`, 'danger');
    }
  }

  async function openProcessDetail(pid) {
    try {
      const res = await fetch(`/api/process/${pid}`);
      if (!res.ok) throw new Error('Process details not found');
      const d = await res.json();

      DOM.modalProcName.textContent = `${d.name} (PID: ${d.pid})`;
      DOM.modalProcBody.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;font-size:0.82rem;">
          <div class="spec-item"><span class="spec-label">Spustitelný soubor:</span><span class="spec-val" style="word-break:break-all;">${escapeHtml(d.exe || 'Neznámá')}</span></div>
          <div class="spec-item"><span class="spec-label">Příkazový řádek:</span><span class="spec-val" style="word-break:break-all;font-size:0.75rem;">${escapeHtml(d.cmdline || '-')}</span></div>
          <div class="spec-item"><span class="spec-label">Pracovní složka:</span><span class="spec-val">${escapeHtml(d.cwd || '-')}</span></div>
          <div class="spec-item"><span class="spec-label">Uživatel:</span><span class="spec-val">${escapeHtml(d.username || 'SYSTEM')}</span></div>
          <div class="spec-item"><span class="spec-label">Spuštěno dne:</span><span class="spec-val">${d.created}</span></div>
          <div class="spec-item"><span class="spec-label">Využití CPU:</span><span class="spec-val">${d.cpu_percent}%</span></div>
          <div class="spec-item"><span class="spec-label">Fyzická paměť (RSS):</span><span class="spec-val">${d.memory_rss_mb} MB</span></div>
          <div class="spec-item"><span class="spec-label">Virtuální paměť (VMS):</span><span class="spec-val">${d.memory_vms_mb} MB</span></div>
          <div class="spec-item"><span class="spec-label">Počet vláken:</span><span class="spec-val">${d.threads}</span></div>
          <div class="spec-item"><span class="spec-label">Stav procesu:</span><span class="spec-val">${d.status}</span></div>
        </div>
      `;

      if (d.is_protected) {
        DOM.modalProcKillBtn.style.display = 'none';
      } else {
        DOM.modalProcKillBtn.style.display = 'inline-flex';
        DOM.modalProcKillBtn.onclick = () => {
          DOM.processModal.classList.remove('active');
          killSingleProcess(d.pid, d.name);
        };
      }

      DOM.processModal.classList.add('active');
    } catch (err) {
      showToast(`Chyba načtení detailu procesu: ${err.message}`, 'danger');
    }
  }

  // =========================================================================
  // CLEAN HOGS (RYCHLÉ VYČIŠTĚNÍ) MODAL
  // =========================================================================
  function openHogsModal() {
    // Scan last processes for CPU > 5% or RAM > 300MB
    const hogs = lastProcessesData.filter(p => !p.is_protected && (p.cpu_percent > 5.0 || p.memory_mb > 300.0));

    DOM.hogsListContainer.innerHTML = '';
    if (hogs.length === 0) {
      DOM.hogsListContainer.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--emerald-400);">
          Systém je optimalizovaný. Žádné náročné procesy s CPU &gt; 5% ani RAM &gt; 300MB neběží.
        </div>
      `;
      DOM.btnKillHogsConfirm.style.display = 'none';
    } else {
      DOM.btnKillHogsConfirm.style.display = 'inline-flex';
      hogs.forEach(h => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:6px;';
        row.innerHTML = `
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.85rem;">
            <input type="checkbox" class="hog-cb" data-pid="${h.pid}" checked>
            <strong>${escapeHtml(h.name)}</strong>
            <span style="color:var(--text-muted);font-size:0.75rem;">(PID: ${h.pid})</span>
          </label>
          <div style="font-family:var(--font-mono);font-size:0.8rem;text-align:right;">
            <span style="color:var(--rose-400);margin-right:12px;">${h.cpu_percent.toFixed(1)}% CPU</span>
            <span style="color:var(--cyan-400);">${h.memory_mb.toFixed(0)} MB RAM</span>
          </div>
        `;
        DOM.hogsListContainer.appendChild(row);
      });
    }

    DOM.hogsModal.classList.add('active');
  }

  // =========================================================================
  // NETWORK CONNECTIONS (TAB 3)
  // =========================================================================
  async function fetchConnections() {
    if (state.activeTab !== 'connections') return;

    try {
      const res = await fetch('/api/connections');
      if (!res.ok) throw new Error('Connections fetch error');
      const data = await res.json();
      renderConnectionsTable(data.connections || []);
      DOM.connectionsCount.textContent = data.count || 0;
    } catch (err) {
      console.warn('Chyba načítání síťových spojení:', err);
    }
  }

  function renderConnectionsTable(conns) {
    if (!DOM.connectionsTableBody) return;
    DOM.connectionsTableBody.innerHTML = '';

    if (conns.length === 0) {
      DOM.connectionsTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Žádná aktivní spojení.</td></tr>
      `;
      return;
    }

    conns.forEach(c => {
      const tr = document.createElement('tr');
      let statusClass = 'status-established';
      if (c.status === 'LISTEN') statusClass = 'status-listen';
      else if (c.status.includes('WAIT')) statusClass = 'status-time-wait';

      tr.innerHTML = `
        <td><span class="proc-tag">${c.type}</span></td>
        <td style="color:var(--text-primary);">${c.local}</td>
        <td style="color:var(--text-secondary);">${c.remote}</td>
        <td><span class="net-status-badge ${statusClass}">${c.status}</span></td>
        <td style="color:var(--text-muted);">${c.pid || '-'}</td>
        <td style="font-weight:600;">${escapeHtml(c.process_name)}</td>
        <td style="text-align:right;">
          ${c.pid && c.pid > 4 ? `
            <button class="btn-kill-row" data-pid="${c.pid}" data-name="${escapeHtml(c.process_name)}">
              Zrušit proces
            </button>
          ` : '-'}
        </td>
      `;

      const killBtn = tr.querySelector('.btn-kill-row');
      if (killBtn) {
        killBtn.onclick = () => killSingleProcess(c.pid, c.process_name);
      }

      DOM.connectionsTableBody.appendChild(tr);
    });
  }

  // =========================================================================
  // SETUP EVENT LISTENERS & NAVIGATION
  // =========================================================================
  function setupEventListeners() {
    // Navigation Tabs
    DOM.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        DOM.tabs.forEach(t => t.classList.remove('active'));
        DOM.tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const content = document.getElementById(`tab-${target}`);
        if (content) content.classList.add('active');

        state.activeTab = target;

        // Trigger immediate fetch for the tab
        if (target === 'processes') fetchProcesses();
        else if (target === 'connections') fetchConnections();
        else if (target === 'overview') {
          if (cpuChart) cpuChart.resize();
          if (ramChart) ramChart.resize();
          if (netChart) netChart.resize();
        }
      });
    });

    // Refresh Rate Selector
    DOM.refreshSelect.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (val === 0) {
        state.isPaused = true;
        showToast('Obnova dat pozastavena.', 'warning');
      } else {
        state.isPaused = false;
        state.refreshIntervalMs = val;
        resetPollingTimer();
        showToast(`Interval obnovy: ${val} ms`, 'info');
      }
    });

    // Process Search Input
    let searchDebounce;
    DOM.processSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        fetchProcesses();
      }, 250);
    });

    // Process Category Filters
    DOM.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.processFilter = pill.getAttribute('data-filter');
        fetchProcesses();
      });
    });

    // Table Sorting
    DOM.tableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (state.processSort.field === field) {
          state.processSort.order = state.processSort.order === 'desc' ? 'asc' : 'desc';
        } else {
          state.processSort.field = field;
          state.processSort.order = 'desc';
        }

        DOM.tableHeaders.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
        th.classList.add(state.processSort.order === 'asc' ? 'sorted-asc' : 'sorted-desc');
        fetchProcesses();
      });
    });

    // Bulk Actions
    DOM.btnBulkCancel.addEventListener('click', () => {
      state.selectedPids.clear();
      updateBulkBar();
      document.querySelectorAll('.proc-select-cb').forEach(cb => cb.checked = false);
    });

    DOM.btnBulkKill.addEventListener('click', () => {
      killMultipleProcesses(Array.from(state.selectedPids));
    });

    // Modal Close buttons
    DOM.modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.processModal.classList.remove('active');
        DOM.hogsModal.classList.remove('active');
      });
    });

    window.addEventListener('click', (e) => {
      if (e.target === DOM.processModal) DOM.processModal.classList.remove('active');
      if (e.target === DOM.hogsModal) DOM.hogsModal.classList.remove('active');
    });

    // Clean Hogs Buttons
    DOM.btnOpenHogs.addEventListener('click', openHogsModal);
    if (DOM.btnBannerClean) {
      DOM.btnBannerClean.addEventListener('click', openHogsModal);
    }

    // Toggle Quick Guide Panel
    if (DOM.btnToggleGuide && DOM.quickGuidePanel) {
      DOM.btnToggleGuide.addEventListener('click', () => {
        const isHidden = DOM.quickGuidePanel.style.display === 'none' || !DOM.quickGuidePanel.style.display;
        DOM.quickGuidePanel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          DOM.quickGuidePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (DOM.btnGuideClose && DOM.quickGuidePanel) {
      DOM.btnGuideClose.addEventListener('click', () => {
        DOM.quickGuidePanel.style.display = 'none';
      });
    }

    DOM.btnKillHogsConfirm.addEventListener('click', () => {
      const selectedHogPids = [];
      document.querySelectorAll('.hog-cb:checked').forEach(cb => {
        selectedHogPids.push(parseInt(cb.getAttribute('data-pid'), 10));
      });
      DOM.hogsModal.classList.remove('active');
      killMultipleProcesses(selectedHogPids);
    });

    // Global keyboard shortcut '/' to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.processSearchInput) {
        e.preventDefault();
        const procTab = document.querySelector('.nav-tab[data-tab="processes"]');
        if (procTab) procTab.click();
        DOM.processSearchInput.focus();
      }
    });
  }

  function resetPollingTimer() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    if (!state.isPaused) {
      state.pollTimer = setInterval(tick, state.refreshIntervalMs);
    }
  }

  function tick() {
    if (state.isPaused) return;
    fetchSystemStats();
    if (state.activeTab === 'processes') fetchProcesses();
    else if (state.activeTab === 'connections') fetchConnections();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Application Entrypoint
  function init() {
    initCharts();
    setupEventListeners();
    fetchSystemStats();
    resetPollingTimer();
    console.log('Cyber Task Manager Initialized.');
  }

  window.addEventListener('DOMContentLoaded', init);
})();
