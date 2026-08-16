// GM Assistant enhancements: weekly history/editing + balanced health coaching
(() => {
  const getHistoryEl = () => document.getElementById('history');
  const getForm = () => document.getElementById('weekForm');

  function removeSurveyCountUI() {
    const form = getForm();
    const surveyInput = form?.elements?.surveyCount;
    surveyInput?.closest('label')?.remove();

    const metricSelect = document.getElementById('metric');
    const surveyOption = metricSelect?.querySelector('option[value="surveyCount"]');
    if (surveyOption) {
      if (metricSelect.value === 'surveyCount') metricSelect.value = 'osat';
      surveyOption.remove();
    }

    if (typeof META === 'object' && META.surveyCount) delete META.surveyCount;
  }

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
      if (key !== 'surveyCount' && form.elements[key]) form.elements[key].value = value ?? '';
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

  const originalShow = show;
  show = function (id) {
    originalShow(id);
    if (id === 'entry') renderHistory();
  };

  // Remove Survey Count from all active app surfaces. Legacy stored values remain untouched but unused.
  removeSurveyCountUI();
  if (typeof priorities === 'function') {
    const basePriorities = priorities;
    priorities = function (w, p) {
      return basePriorities(w, p).filter(item => item?.title !== 'Recover survey volume');
    };
  }

  // ----- Balanced Restaurant Health model -----
  function guestMetricScore(value) {
    if (value == null || !Number.isFinite(Number(value))) return null;
    const v = Number(value);
    if (v >= 75) return 100;
    if (v >= 65) return 94 + (v - 65) * 0.6;
    if (v >= 55) return 86 + (v - 55) * 0.8;
    if (v >= 45) return 76 + (v - 45);
    if (v >= 35) return 64 + (v - 35) * 1.2;
    return Math.max(35, v + 29);
  }

  function higherGoalScore(value, goal) {
    if (value == null || goal == null || !Number.isFinite(Number(value)) || !Number.isFinite(Number(goal)) || Number(goal) <= 0) return null;
    const r = Number(value) / Number(goal);
    if (r >= 1.10) return 103;
    if (r >= 1.00) return 98 + (r - 1.00) * 50;
    if (r >= 0.90) return 90 + (r - 0.90) * 80;
    if (r >= 0.80) return 80 + (r - 0.80) * 100;
    return Math.max(40, r * 100);
  }

  function lowerGoalScore(value, goal) {
    if (value == null || goal == null || !Number.isFinite(Number(value)) || !Number.isFinite(Number(goal)) || Number(value) < 0 || Number(goal) <= 0) return null;
    const r = Number(value) / Number(goal);
    if (r <= 0.90) return 103;
    if (r <= 1.00) return 98 + (1.00 - r) * 50;
    if (r <= 1.10) return 90 + (1.10 - r) * 80;
    if (r <= 1.25) return 78 + (1.25 - r) * 80;
    if (r <= 1.50) return 60 + (1.50 - r) * 72;
    return Math.max(35, 60 - (r - 1.50) * 35);
  }

  function healthParts(w) {
    if (!w) return [];
    const guestKeys = ['osat','accuracy','cleanliness','speed','taste','friendliness'];
    const guestScores = guestKeys.map(k => guestMetricScore(w[k])).filter(v => v != null);
    const guest = guestScores.length ? guestScores.reduce((a,b) => a+b,0) / guestScores.length : null;
    return [
      {key:'guest', label:'Guest Experience', score:guest, weight:35},
      {key:'operations', label:'Operations', score:lowerGoalScore(w.driveOverall, s.settings.driveGoal), weight:30},
      {key:'food', label:'Food Cost', score:lowerGoalScore(w.foodVariance, s.settings.foodGoal), weight:20},
      {key:'labor', label:'Labor', score:higherGoalScore(w.laborHoursSaved, s.settings.laborGoal), weight:15}
    ].filter(x => x.score != null);
  }

  healthScore = function (w) {
    const parts = healthParts(w);
    if (!parts.length) return 0;
    const totalWeight = parts.reduce((a,p) => a+p.weight,0);
    const score = parts.reduce((a,p) => a + p.score * p.weight,0) / totalWeight;
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  subscores = function (w) {
    const map = Object.fromEntries(healthParts(w).map(p => [p.label, Math.round(Math.min(100,p.score))]));
    return ['Guest Experience','Operations','Food Cost','Labor'].map(label => [label, map[label] ?? 0]);
  };

  grade = function (score) {
    return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  };

  function healthLabel(score) {
    if (score >= 90) return 'Elite operation';
    if (score >= 80) return 'Strong operation';
    if (score >= 70) return 'Solid operation — a few opportunities';
    if (score >= 60) return 'Needs attention';
    return 'Significant operational risk';
  }

  function improvementSuggestions(w) {
    if (!w) return [];
    const ideas = [];
    const guestKeys = ['accuracy','cleanliness','speed','taste','friendliness'].filter(k => w[k] != null);
    if (w.osat != null || guestKeys.length) {
      const allGuest = ['osat', ...guestKeys].filter(k => w[k] != null).sort((a,b) => Number(w[a]) - Number(w[b]));
      const low = allGuest[0];
      if (low) {
        const actions = {
          osat:'Focus coaching on the lowest guest-experience category and protect consistent execution over the rolling 90-day period.',
          accuracy:'Use order repeat-back, verify sauces/modifiers, and add a final bag check before handoff.',
          cleanliness:'Assign timed dining-room/restroom checks and make one manager responsible for verification each daypart.',
          speed:'Review deployment, product readiness and bottlenecks during the slowest daypart; use pull-ahead when appropriate.',
          taste:'Tighten hold times, freshness checks, portioning and product-temperature routines.',
          friendliness:'Coach greetings, eye contact, thank-you language and manager recognition for strong guest interactions.'
        };
        ideas.push({score:guestMetricScore(w[low]), title:`Raise ${cap(low)}`, text:actions[low]});
      }
    }
    if (w.driveOverall != null && s.settings.driveGoal != null) {
      ideas.push({score:lowerGoalScore(w.driveOverall,s.settings.driveGoal), title:'Improve Operations score', text:w.driveOverall <= s.settings.driveGoal ? 'Drive-thru is already at goal. Protect staffing, product readiness and peak deployment so the result stays consistent.' : 'Target the slowest daypart first. Check deployment, product readiness, headset/order-taking pace and pull-ahead opportunities.'});
    }
    if (w.foodVariance != null && s.settings.foodGoal != null) {
      ideas.push({score:lowerGoalScore(w.foodVariance,s.settings.foodGoal), title:'Improve Food Cost score', text:w.foodVariance <= s.settings.foodGoal ? 'Food variance is at company goal. Protect portion control, waste logging and inventory routines.' : 'Review top-loss items, waste, portions, transfers and count accuracy. Fix the largest controllable loss first.'});
    }
    if (w.laborHoursSaved != null && s.settings.laborGoal != null) {
      ideas.push({score:higherGoalScore(w.laborHoursSaved,s.settings.laborGoal), title:'Improve Labor score', text:w.laborHoursSaved >= s.settings.laborGoal ? 'Labor is meeting goal. Protect efficiency without sacrificing speed or guest experience.' : 'Close the labor gap through smarter deployment and schedule adjustments while protecting peak service.'});
    }
    return ideas.sort((a,b)=>(a.score??999)-(b.score??999)).slice(0,3);
  }

  const originalRenderDashboard = renderDashboard;
  renderDashboard = function () {
    originalRenderDashboard();
    const w = dashData().cur;
    const score = healthScore(w);
    const gradeEl = document.getElementById('weeklyGrade');
    const noteEl = document.getElementById('gradeNote');
    if (noteEl && w) noteEl.textContent = healthLabel(score);
    if (gradeEl) {
      const label = gradeEl.previousElementSibling;
      if (label) label.textContent = 'Restaurant Health Grade';
    }

    const healthCard = document.getElementById('scoreRing')?.closest('.card');
    if (healthCard) {
      let box = document.getElementById('healthCoaching');
      if (!box) {
        box = document.createElement('div');
        box.id = 'healthCoaching';
        box.style.cssText = 'margin-top:16px;padding-top:14px;border-top:1px solid var(--line)';
        healthCard.appendChild(box);
      }
      const tips = improvementSuggestions(w);
      box.innerHTML = w ? `<div class="eyebrow">How to improve the grade</div>${tips.length ? tips.map((t,i)=>`<div style="padding:9px 0${i<tips.length-1?';border-bottom:1px solid var(--line)':''}"><b>${esc(t.title)}</b><div class="muted" style="margin-top:3px;line-height:1.4">${esc(t.text)}</div></div>`).join('') : '<div class="muted">Performance is strong across the available metrics. Focus on consistency and protecting your best routines.</div>'}` : '<div class="eyebrow">How to improve the grade</div><div class="muted">Save a week to receive targeted recommendations.</div>';
    }
  };

  renderHistory();
  renderDashboard();
})();
