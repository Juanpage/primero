let password = '';

const lockOverlay = document.getElementById('admin-lock');
const unlockBtn = document.getElementById('unlock-btn');
const lockError = document.getElementById('lock-error');

function getFilters() {
  const vessel = document.getElementById('filter-vessel').value;
  const cruise_date = document.getElementById('filter-date').value;
  return { vessel, cruise_date };
}

async function fetchSummary() {
  const { vessel, cruise_date } = getFilters();
  const params = new URLSearchParams({ password });
  if (vessel) params.append('vessel', vessel);
  if (cruise_date) params.append('cruise_date', cruise_date);

  const response = await fetch(`/api/admin/summary?${params.toString()}`);
  if (response.status === 401) {
    lockOverlay.style.display = 'flex';
    throw new Error('Incorrect password. Please try again.');
  }
  if (!response.ok) {
    throw new Error('Unable to load dashboard data');
  }
  return response.json();
}

function renderMetrics(data) {
  const stats = data.stats || {};
  document.getElementById('metric-total').textContent = stats.total_responses || 0;
  document.getElementById('metric-rating').textContent = stats.average_rating || '0.00';
  document.getElementById('metric-nps').textContent = stats.average_nps || '0.00';
  document.getElementById('metric-last').textContent = stats.last_30_days || 0;
}

function renderTable(data) {
  const tbody = document.querySelector('#recent-table tbody');
  tbody.innerHTML = '';

  (data.recent || []).forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.vessel_id}</td>
      <td>${row.nationality}</td>
      <td>${row.cruise_date}</td>
      <td>${row.cabin_number}</td>
      <td>${row.rating_general ?? ''}</td>
      <td>${row.nps ?? ''}</td>
      <td>${new Date(row.created_at).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadDashboard() {
  try {
    const data = await fetchSummary();
    renderMetrics(data);
    renderTable(data);
  } catch (error) {
    alert(error.message);
  }
}

function handleUnlock() {
  const input = document.getElementById('admin-password');
  password = input.value.trim();
  if (!password) {
    lockError.textContent = 'Password is required.';
    return;
  }
  lockError.textContent = '';
  lockOverlay.style.display = 'none';
  loadDashboard();
}

function exportCsv() {
  const { vessel, cruise_date } = getFilters();
  const params = new URLSearchParams({ password });
  if (vessel) params.append('vessel', vessel);
  if (cruise_date) params.append('cruise_date', cruise_date);
  window.location.href = `/api/admin/export?${params.toString()}`;
}

function init() {
  unlockBtn.addEventListener('click', handleUnlock);
  document.getElementById('apply-filters').addEventListener('click', loadDashboard);
  document.getElementById('export-csv').addEventListener('click', exportCsv);
  document.getElementById('admin-password').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      handleUnlock();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
