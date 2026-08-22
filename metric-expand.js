(() => {
  const STYLE_ID = 'gm-metric-expand-style';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #cards .metric{cursor:pointer;transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease}
      #cards .metric:active{transform:scale(.995)}
      #cards .metric.metric-open{border-color:#c9b7b0;box-shadow:0 16px 34px rgba(67,31,33,.12)}
      #cards .metric .metric-tap-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
      #cards .metric .metric-chevron{width:30px;height:30px;flex:0 0 30px;border-radius:999px;border:1px solid var(--line);display:grid;place-items:center;color:var(--muted);font-size:18px;font-weight:900;transition:transform .22s ease,background .2s ease}
      #cards .metric.metric-open .metric-chevron{transform:rotate(180deg);background:var(--soft)}
      #cards .metric-details{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .28s ease,opacity .2s ease;margin-top:0}
      #cards .metric.metric-open .metric-details{grid-template-rows:1fr;opacity:1;margin-top:14px}
      #cards .metric-details-inner{overflow:hidden;min-height:0}
      #cards .metric-detail-wrap{border-top:1px solid var(--line);padding-top:14px}
      #cards .metric-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      #cards .metric-detail-item{background:#fcfaf8;border:1px solid var(--line);border-radius:12px;padding:10px;min-width:0}
      #cards .metric-detail-item span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.07em;font-weight:900;color:var(--muted);margin-bottom:4px}
      #cards .metric-detail-item strong{font-size:18px;line-height:1.15;word-break:break-word}
      #cards .metric-detail-note{font-size:12px;color:var(--muted);line-height:1.45;margin-top:10px}
      #cards .metric-detail-good{color:var(--good)}
      #cards .metric-detail-bad{color:var(--bad)}
      @media(max-width:620px){#cards .metric-detail-grid{grid-template-columns:1fr 1fr}}
      @media(prefers-reduced-motion:reduce){#cards .metric,#cards .metric-chevron,#cards .metric-details{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  const labelToKey = {
    'OSAT': 'osat',
    'DRIVE-THRU': 'driveOverall',
    'FOOD VARIANCE': 'foodVariance',
    'LABOR SAVED': 'laborHoursSaved'
  };

  function safeFmt(key, value) {
    try { return fmt(key, value); } catch { return value == null ? '—' : String(value); }
  }

  function timeFmt(value) {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    const sec = Math.round(Number(value));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  }

  function currentData() {
    try { return dashData(); } catch { return { cur: null, pre: null }; }
  }

  function detailItem(label, value, cls = '') {
    return `<div class="metric-detail-item"><span>${label}</span><strong class="${cls}">${value}</strong></div>`;
  }

  function osatDetails(w) {
    if (!w) return '<div class="metric-detail-note">No saved data for this period.</div>';
    const items = [
      ['Accuracy', safeFmt('accuracy', w.accuracy)],
      ['Cleanliness', safeFmt('cleanliness', w.cleanliness)],
      ['Speed', safeFmt('speed', w.speed)],
      ['Taste', safeFmt('taste', w.taste)],
      ['Friendliness', safeFmt('friendliness', w.friendliness)],
      ['Surveys', w.surveyCount == null ? '—' : Math.round(w.surveyCount).toLocaleString()]
    ];
    return `<div class="metric-detail-grid">${items.map(x => detailItem(x[0], x[1])).join('')}</div><div class="metric-detail-note">OSAT goal: ${s?.settings?.osatGoal ?? '—'}%. These guest-experience metrics help show what is driving the overall score.</div>`;
  }

  function driveDetails(w) {
    if (!w) return '<div class="metric-detail-note">No saved data for this period.</div>';
    const parts = [
      ['Morning', 'driveMorning', 'driveMorningGoal'],
      ['Lunch', 'driveLunch', 'driveLunchGoal'],
      ['Afternoon', 'driveAfternoon', 'driveAfternoonGoal'],
      ['Dinner', 'driveDinner', 'driveDinnerGoal'],
      ['Evening', 'driveEvening', 'driveEveningGoal']
    ].map(([name,key,goalKey]) => ({ name, key, value:w[key], goal:s?.settings?.[goalKey] ?? s?.settings?.driveGoal }));
    const entered = parts.filter(p => p.value != null && Number.isFinite(Number(p.value)));
    const fastest = entered.length ? entered.reduce((a,b) => Number(a.value) <= Number(b.value) ? a : b) : null;
    const slowest = entered.length ? entered.reduce((a,b) => Number(a.value) >= Number(b.value) ? a : b) : null;
    const cards = parts.map(p => {
      const met = p.value != null && p.goal != null ? Number(p.value) <= Number(p.goal) : null;
      const cls = met === true ? 'metric-detail-good' : met === false ? 'metric-detail-bad' : '';
      return detailItem(p.name, timeFmt(p.value), cls);
    }).join('');
    let note = `Overall goal: ${timeFmt(s?.settings?.driveGoal)}.`;
    if (fastest && slowest) note += ` Fastest: ${fastest.name} at ${timeFmt(fastest.value)}. Slowest: ${slowest.name} at ${timeFmt(slowest.value)}.`;
    return `<div class="metric-detail-grid">${cards}</div><div class="metric-detail-note">${note}</div>`;
  }

  function foodDetails(w, p) {
    if (!w) return '<div class="metric-detail-note">No saved data for this period.</div>';
    const company = s?.settings?.foodGoal;
    const district = s?.settings?.districtFoodGoal;
    const previous = p?.foodVariance;
    const change = previous == null || w.foodVariance == null ? '—' : `${w.foodVariance - previous > 0 ? '+' : ''}${(w.foodVariance - previous).toFixed(2)} pts`;
    const companyGap = company == null || w.foodVariance == null ? '—' : `${w.foodVariance - company > 0 ? '+' : ''}${(w.foodVariance - company).toFixed(2)} pts`;
    return `<div class="metric-detail-grid">${detailItem('Current', safeFmt('foodVariance', w.foodVariance))}${detailItem('Company goal', company == null ? '—' : Number(company).toFixed(2) + '%')}${detailItem('District goal', district == null ? '—' : Number(district).toFixed(2) + '%')}${detailItem('Vs previous', change)}${detailItem('Vs company goal', companyGap)}</div><div class="metric-detail-note">Lower food variance is better. Use this view to see whether the current result is inside both company and district targets.</div>`;
  }

  function laborDetails(w, p) {
    if (!w) return '<div class="metric-detail-note">No saved data for this period.</div>';
    const goal = s?.settings?.laborGoal;
    const current = w.laborHoursSaved;
    const previous = p?.laborHoursSaved;
    const vsGoal = current == null || goal == null ? '—' : `${current - goal >= 0 ? '+' : ''}${(current - goal).toFixed(1).replace('.0','')} hrs`;
    const vsPrev = current == null || previous == null ? '—' : `${current - previous >= 0 ? '+' : ''}${(current - previous).toFixed(1).replace('.0','')} hrs`;
    const cls = current != null && goal != null ? (current >= goal ? 'metric-detail-good' : 'metric-detail-bad') : '';
    return `<div class="metric-detail-grid">${detailItem('Current', safeFmt('laborHoursSaved', current), cls)}${detailItem('Goal', goal == null ? '—' : Number(goal).toFixed(1).replace('.0','') + ' hrs')}${detailItem('Vs goal', vsGoal, cls)}${detailItem('Vs previous', vsPrev)}</div><div class="metric-detail-note">This shows how many labor hours were saved compared with the target and the prior period.</div>`;
  }

  function detailsFor(key) {
    const { cur:w, pre:p } = currentData();
    if (key === 'osat') return osatDetails(w);
    if (key === 'driveOverall') return driveDetails(w);
    if (key === 'foodVariance') return foodDetails(w,p);
    if (key === 'laborHoursSaved') return laborDetails(w,p);
    return '<div class="metric-detail-note">No additional details available.</div>';
  }

  function closeOthers(except) {
    document.querySelectorAll('#cards .metric.metric-open').forEach(card => {
      if (card !== except) {
        card.classList.remove('metric-open');
        card.setAttribute('aria-expanded','false');
      }
    });
  }

  function enhanceCard(card) {
    if (card.dataset.expandReady === '1') return;
    const label = card.querySelector('.eyebrow')?.textContent?.trim().toUpperCase();
    const key = labelToKey[label];
    if (!key) return;
    card.dataset.expandReady = '1';
    card.dataset.metricKey = key;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-expanded','false');
    card.setAttribute('aria-label',`${label}. Tap to show details.`);

    const eyebrow = card.querySelector('.eyebrow');
    if (eyebrow && !card.querySelector('.metric-tap-row')) {
      const row = document.createElement('div');
      row.className = 'metric-tap-row';
      eyebrow.parentNode.insertBefore(row, eyebrow);
      row.appendChild(eyebrow);
      const chev = document.createElement('span');
      chev.className = 'metric-chevron';
      chev.setAttribute('aria-hidden','true');
      chev.textContent = '⌄';
      row.appendChild(chev);
    }

    const details = document.createElement('div');
    details.className = 'metric-details';
    details.innerHTML = '<div class="metric-details-inner"><div class="metric-detail-wrap"></div></div>';
    card.appendChild(details);

    const toggle = () => {
      const opening = !card.classList.contains('metric-open');
      closeOthers(opening ? card : null);
      if (opening) {
        details.querySelector('.metric-detail-wrap').innerHTML = detailsFor(key);
        card.classList.add('metric-open');
        card.setAttribute('aria-expanded','true');
      } else {
        card.classList.remove('metric-open');
        card.setAttribute('aria-expanded','false');
      }
    };

    card.addEventListener('click', e => {
      if (e.target.closest('button,a,input,select,textarea')) return;
      toggle();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  function enhanceAll() {
    document.querySelectorAll('#cards .metric').forEach(enhanceCard);
  }

  enhanceAll();
  const cards = document.getElementById('cards');
  if (cards) {
    new MutationObserver(() => requestAnimationFrame(enhanceAll)).observe(cards,{childList:true,subtree:true});
  }
})();