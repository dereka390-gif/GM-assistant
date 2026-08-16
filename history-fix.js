// GM Assistant hotfix: saved weekly history + editing UI
(() => {
  const getHistoryEl = () => document.getElementById('history');
  const getForm = () => document.getElementById('weekForm');

  function setEditState(week) {
    const form = getForm();
    if (!form) return;

    let banner = document.getElementById('editWeekBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'editWeekBanner';
      banner.style.cssText = 'display:none;margin:0 0 14px;padding:12px 14px;border:1px solid #e7ddd8;border-radius:12px;background:#fff6df;color:#6d4a00;font-weight:800';
      form.parentNode.insertBefore(banner, form);
    }

    const saveBtn = form.querySelector('button.primary');
    if (week) {
      banner.style.display = 'block';
      banner.textContent = `Editing saved week: ${fd(week.weekStart)} – ${end(week.weekStart)}`;
      if (saveBtn) saveBtn.textContent = 'Update Week';
    } else {
      banner.style.display = 'none';
      banner.textContent = '';
      if (saveBtn) saveBtn.textContent = 'Save Week';
    }
  }

  // Avoid the browser's built-in window.history object. Always target the DOM element explicitly.
  renderHistory = function () {
    const historyEl = getHistoryEl();
    if (!historyEl) return;

    const weeks = sorted().reverse();
    historyEl.innerHTML = weeks.length
      ? weeks.map(w => `
        <div class="history">
          <div>
            <b>${fd(w.weekStart)} – ${end(w.weekStart)}</b>
            <div class="muted">OSAT ${fmt('osat', w.osat)} · Drive ${fmt('driveOverall', w.driveOverall)} · Food ${fmt('foodVariance', w.foodVariance)}</div>
            ${w.comments ? `<div class="muted" style="margin-top:5px">${esc(w.comments)}</div>` : ''}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="secondary" onclick="editW('${w.id}')">Edit Week</button>
            <button type="button" class="secondary" onclick="delW('${w.id}')">Delete</button>
          </div>
        </div>`).join('')
      : '<p class="muted">No weeks saved yet.</p>';
  };

  editW = function (id) {
    const form = getForm();
    const week = s.weeks.find(x => x.id === id);
    if (!form || !week) return;

    show('entry');
    Object.entries(week).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value ?? '';
    });
    form.dataset.id = id;
    setEditState(week);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  clearForm = function () {
    const form = getForm();
    if (!form) return;
    form.reset();
    delete form.dataset.id;
    setEditState(null);
  };

  // Re-render when the Weekly Entry tab is opened so cached/PWA sessions always refresh the list.
  const originalShow = show;
  show = function (id) {
    originalShow(id);
    if (id === 'entry') renderHistory();
  };

  renderHistory();
})();
