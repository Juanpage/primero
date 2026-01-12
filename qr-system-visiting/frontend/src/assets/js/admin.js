const API_BASE = '/api';

const vesselFilter = document.getElementById('vessel-filter');
const statusFilter = document.getElementById('status-filter');
const fromDateInput = document.getElementById('from-date');
const toDateInput = document.getElementById('to-date');
const applyFiltersButton = document.getElementById('apply-filters');
const feedbackBody = document.getElementById('feedback-body');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

const kpiTotal = document.getElementById('kpi-total');
const kpiAverage = document.getElementById('kpi-average');
const kpiNegative = document.getElementById('kpi-negative');
const kpiPending = document.getElementById('kpi-pending');
const kpiManaged = document.getElementById('kpi-managed');

let currentPage = 1;
let totalItems = 0;
const limit = 10;
let ratingChart;
let countChart;
let alertChart;

const formatDateInput = (date) => date.toISOString().slice(0, 10);
const today = new Date();
const defaultTo = formatDateInput(today);
const defaultFromDate = new Date();
defaultFromDate.setDate(today.getDate() - 29);
const defaultFrom = formatDateInput(defaultFromDate);

fromDateInput.value = defaultFrom;
toDateInput.value = defaultTo;

const buildQuery = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  return search.toString();
};

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al cargar datos');
  }
  return response.json();
};

const loadSummary = async () => {
  const query = buildQuery({
    vessel: vesselFilter.value,
    from: fromDateInput.value,
    to: toDateInput.value
  });
  const summary = await fetchJson(`${API_BASE}/metrics/summary?${query}`);
  kpiTotal.textContent = summary.total_feedback;
  kpiAverage.textContent = summary.average_rating.toFixed(2);
  kpiNegative.textContent = `${summary.negative_percent}%`;
  kpiPending.textContent = summary.pending_alerts;
  kpiManaged.textContent = summary.managed_alerts;
};

const loadRatingsChart = async () => {
  const query = buildQuery({
    vessel: vesselFilter.value,
    from: fromDateInput.value,
    to: toDateInput.value,
    bucket: 'day'
  });
  const data = await fetchJson(`${API_BASE}/metrics/ratings-timeseries?${query}`);

  if (ratingChart) ratingChart.destroy();
  ratingChart = new Chart(document.getElementById('rating-chart'), {
    type: 'line',
    data,
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 5 }
      }
    }
  });
};

const loadAlertsChart = async () => {
  const query = buildQuery({
    vessel: vesselFilter.value,
    from: fromDateInput.value,
    to: toDateInput.value,
    bucket: 'day'
  });
  const data = await fetchJson(`${API_BASE}/metrics/alerts-timeseries?${query}`);

  if (alertChart) alertChart.destroy();
  alertChart = new Chart(document.getElementById('alert-chart'), {
    type: 'line',
    data,
    options: {
      responsive: true
    }
  });

  if (countChart) countChart.destroy();
  const totalCounts = data.datasets[0].data.map((value, index) => value + data.datasets[1].data[index]);
  countChart = new Chart(document.getElementById('count-chart'), {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Feedback total',
          data: totalCounts,
          backgroundColor: '#2563eb'
        }
      ]
    },
    options: {
      responsive: true
    }
  });
};

const renderTable = (items) => {
  feedbackBody.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.vessel_name}</td>
      <td>${item.rating}</td>
      <td>${item.comment || '-'}</td>
      <td>${item.email || '-'}</td>
      <td>${new Date(item.created_at).toISOString().slice(0, 16).replace('T', ' ')}</td>
      <td><span class="badge ${item.alert_status === 'Pending' ? 'pending' : 'managed'}">${item.alert_status}</span></td>
      <td>
        <button class="action-btn" data-id="${item.id}" ${item.alert_status === 'Managed' ? 'disabled' : ''}>
          Gestionar
        </button>
      </td>
    `;
    feedbackBody.appendChild(row);
  });
};

const loadFeedback = async () => {
  const query = buildQuery({
    page: currentPage,
    limit,
    vessel: vesselFilter.value,
    status: statusFilter.value,
    from: fromDateInput.value,
    to: toDateInput.value
  });

  const data = await fetchJson(`${API_BASE}/feedback?${query}`);
  totalItems = data.total;
  pageInfo.textContent = `Página ${data.page}`;
  renderTable(data.items);
  prevPageButton.disabled = currentPage <= 1;
  nextPageButton.disabled = currentPage * limit >= totalItems;
};

const refreshDashboard = async () => {
  await Promise.all([loadSummary(), loadRatingsChart(), loadAlertsChart(), loadFeedback()]);
};

applyFiltersButton.addEventListener('click', () => {
  currentPage = 1;
  refreshDashboard();
});

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadFeedback();
  }
});

nextPageButton.addEventListener('click', () => {
  if (currentPage * limit < totalItems) {
    currentPage += 1;
    loadFeedback();
  }
});

feedbackBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;

  const id = button.dataset.id;
  button.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/feedback/${id}/manage`, {
      method: 'PATCH',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('No se pudo actualizar');
    }

    await refreshDashboard();
  } catch (error) {
    button.disabled = false;
    alert(error.message);
  }
});

refreshDashboard();
