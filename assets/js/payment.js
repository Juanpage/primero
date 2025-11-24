export function redirectToWeTravel(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener');
}
