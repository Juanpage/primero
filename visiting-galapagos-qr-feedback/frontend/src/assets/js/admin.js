const passwordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');
const metricsSection = document.getElementById('metrics');
const loginSection = document.getElementById('login-section');
const vesselTableBody = document.querySelector('#vessel-table tbody');

const authenticated = () => localStorage.getItem('va_admin') === '1';

const showMetrics = () => {
  loginSection.classList.add('hidden');
  metricsSection.classList.remove('hidden');
};

const handleLogin = () => {
  if (passwordInput.value === window.APP_CONFIG.ADMIN_PASSWORD) {
    localStorage.setItem('va_admin', '1');
    showMetrics();
    loadData();
  } else {
    alert('Contraseña incorrecta');
  }
};

loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleLogin();
  }
});

const setOverview = (data) => {
  document.getElementById('total-responses').textContent = data.total_responses || 0;
  document.getElementById('avg-rating').textContent = data.avg_rating || '-';
  document.getElementById('avg-nps').textContent = data.avg_nps || '-';
  document.getElementById('last-30').textContent = data.last_30_days || 0;
};

const renderVessels = (rows) => {
  vesselTableBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.vessel_id}</td>
      <td>${row.responses}</td>
      <td>${row.avg_rating ?? '-'}</td>
      <td>${row.avg_nps ?? '-'}</td>
      <td>${row.last_30_days}</td>
    `;
    vesselTableBody.appendChild(tr);
  });
};

const fetchOverview = () => fetch(`${window.APP_CONFIG.API_BASE}/metrics/overview`).then((res) => res.json());
const fetchByVessel = () => fetch(`${window.APP_CONFIG.API_BASE}/metrics/by-vessel`).then((res) => res.json());
const fetchFeedback = () => fetch(`${window.APP_CONFIG.API_BASE}/feedback?limit=1000`).then((res) => res.json());

const loadData = async () => {
  try {
    const [overview, vessels] = await Promise.all([fetchOverview(), fetchByVessel()]);
    setOverview(overview);
    renderVessels(vessels);
  } catch (error) {
    alert('No se pudieron cargar los datos');
  }
};

const exportCsv = async () => {
  try {
    const rows = await fetchFeedback();
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(',')]
      .concat(rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'feedback.csv';
    link.click();
  } catch (error) {
    alert('No se pudo exportar');
  }
};

document.getElementById('export-btn').addEventListener('click', exportCsv);

if (authenticated()) {
  showMetrics();
  loadData();
}
