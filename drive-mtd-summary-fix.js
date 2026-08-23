// Dashboard drive-thru summary: show the saved month-to-date overall drive-thru value,
// not an average of the individual daypart values.
(() => {
  if (typeof renderDayparts !== 'function') return;

  const originalRenderDayparts = renderDayparts;

  renderDayparts = function(w, p) {
    originalRenderDayparts(w, p);

    const summary = document.getElementById('daypartSummary');
    if (!summary) return;

    const cards = summary.querySelectorAll('.daypart-stat');
    if (cards.length < 3) return;

    const mtdCard = cards[2];
    const label = mtdCard.querySelector('.klabel');
    const value = mtdCard.querySelector('strong');
    const note = mtdCard.querySelector('.muted');

    if (label) label.textContent = 'MTD Drive-Thru';
    if (value) value.textContent = w?.driveOverall != null ? fmt('driveOverall', w.driveOverall) : '—';
    if (note) note.textContent = 'Current month-to-date overall';
  };

  if (typeof renderDashboard === 'function') renderDashboard();
})();
