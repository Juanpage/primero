const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:4000/api'
  : `${window.location.origin}/api`;
const ADMIN_PASSWORD = 'alapagos-demo';

window.APP_CONFIG = { API_BASE, ADMIN_PASSWORD };
