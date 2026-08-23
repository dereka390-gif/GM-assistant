(() => {
  const originalRollupWeeks = rollupWeeks;
  const originalSeries = series;
  const originalRenderDashboard = renderDashboard;
  const originalStatusFor = statusFor;
  const originalHealthScore = healthScore;
  const originalSubscores = subscores;
  const originalPriorities = priorities;

  // These are tracking/snapshot metrics. Each new weekly entry replaces the
  // prior displayed value for the month instead of being averaged with it.
  const TRACKED_LATEST = new Set([
    'osat',
    'accuracy',
    'cleanliness',
    'speed',
    'taste',
    'friendliness',
    'driveOverall',
    'driveLunch',
    'driveAfternoon',
    'driveDinner',
    'driveEvening',
    'foodVariance'
  ]);

  function latestValue(ws, key) {
    return [...ws]
      .filter(w => w && w.weekStart && w[key] != null && Number.isFinite(Number(w[key])))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map(w => Number(w[key]))
      .at(-1) ?? null;
  }

  rollupWeeks = function(ws) {
    const out = originalRollupWeeks(ws);

    TRACKED_LATEST.forEach(key => {
      out[key] = latestValue(ws, key);
    });

    // True weekly totals still accumulate for the selected month:
    // sales, surveyCount, and laborHoursSaved.
    return out;
  };

  series = function(k, mode) {
    if (mode !== 'monthly' || !TRACKED_LATEST.has(k)) {
      return originalSeries(k, mode);
    }

    const groups = {};
    sorted().forEach(w => {
      if (w[k] != null && Number.isFinite(Number(w[k]))) {
        (groups[monthKey(w.weekStart)] ??= []).push(w);
      }
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mk, ws]) => ({
        label: monthLabel(mk).replace(' ', ' ’'),
        value: latestValue(ws, k)
      }))
      .filter(p => p.value != null);
  };

  // Food variance is a balance metric, not a simple "lower is better" metric.
  // Negative is acceptable, closest to 0% is best, and positive is a caution
  // because the store is not supposed to run over 0%.
  function foodStatus(v) {
    if (v == null || !Number.isFinite(Number(v))) {
      return { label: 'No data', cls: 'neutral', tone: '#315f9b' };
    }
    v = Number(v);

    if (v <= 0 && v >= -1) {
      return { label: 'On target', cls: 'good', tone: '#217a45' };
    }
    if (v < -1) {
      return { label: 'Acceptable', cls: 'good', tone: '#217a45' };
    }
    if (v <= 1) {
      return { label: 'Over zero', cls: 'warn', tone: '#a56800' };
    }
    return { label: 'Needs review', cls: 'bad', tone: '#b02d35' };
  }

  function foodScore(v) {
    if (v == null || !Number.isFinite(Number(v))) return 0;
    v = Number(v);

    // 0% is ideal. All negative variance remains acceptable, but values very
    // close to zero receive the strongest score. Positive variance is reduced
    // gradually instead of being treated as an automatic failure.
    if (v === 0) return 100;
    if (v < 0) {
      if (v >= -1) return Math.round(100 - Math.abs(v) * 8);   // -1 = 92
      return Math.max(82, Math.round(92 - (Math.abs(v) - 1) * 2));
    }
    if (v <= 0.5) return Math.round(90 - v * 20);             // +0.5 = 80
    if (v <= 1) return Math.round(80 - (v - 0.5) * 20);       // +1 = 70
    return Math.max(40, Math.round(70 - (v - 1) * 15));
  }

  statusFor = function(k, v) {
    if (k === 'foodVariance') return foodStatus(v);
    return originalStatusFor(k, v);
  };

  healthScore = function(w) {
    if (!w) return 0;

    // Preserve the app's existing health calculation, but replace the old food
    // calculation (which incorrectly rewarded increasingly negative values)
    // with a zero-centered food score.
    const parts = [];

    if (w.osat != null && s.settings.osatGoal != null) {
      const r = w.osat / s.settings.osatGoal;
      parts.push(Math.max(0, Math.min(1.15, r)) / .0115);
    }
    if (w.driveOverall != null && s.settings.driveGoal != null) {
      const r = s.settings.driveGoal / Math.max(.01, w.driveOverall);
      parts.push(Math.max(0, Math.min(1.15, r)) / .0115);
    }
    if (w.foodVariance != null) parts.push(foodScore(w.foodVariance));
    if (w.laborHoursSaved != null && s.settings.laborGoal != null) {
      const r = w.laborHoursSaved / s.settings.laborGoal;
      parts.push(Math.max(0, Math.min(1.15, r)) / .0115);
    }

    const cats = ['accuracy','cleanliness','speed','taste','friendliness']
      .map(k => w[k])
      .filter(v => v != null);
    if (cats.length) parts.push(cats.reduce((a,b)=>a+b,0)/cats.length);

    return parts.length ? Math.round(parts.reduce((a,b)=>a+b,0)/parts.length) : 0;
  };

  subscores = function(w) {
    const rows = originalSubscores(w);
    return rows.map(([label, score]) =>
      label === 'Food Cost' && w?.foodVariance != null
        ? [label, foodScore(w.foodVariance)]
        : [label, score]
    );
  };

  priorities = function(w, p) {
    const list = originalPriorities(w, p).filter(x =>
      !/food variance|district food gap/i.test((x?.title || '') + ' ' + (x?.text || ''))
    );

    if (w?.foodVariance != null) {
      const v = Number(w.foodVariance);
      if (v > 1) {
        list.push({
          level: 'med',
          title: 'Review positive food variance',
          text: `${v.toFixed(2)}% is above zero. Positive variance is not automatically bad, but the target is to stay at or below 0% and as close to zero as possible.`
        });
      } else if (v > 0) {
        list.push({
          level: 'med',
          title: 'Bring food variance back to zero',
          text: `${v.toFixed(2)}% is slightly positive. This is a caution, not a failure; verify counts, portions, waste and transfers.`
        });
      }
    }

    const order = { high: 0, med: 1, good: 2 };
    return list.sort((a,b)=>(order[a.level]??9)-(order[b.level]??9)).slice(0,4);
  };

  function updateTrackingLabels() {
    const foodInput = weekForm?.elements?.foodVariance;
    const foodLabel = foodInput?.closest('label');
    if (foodLabel?.firstChild) foodLabel.firstChild.textContent = 'Food variance MTD (%)';

    const companyGoal = settingsForm?.elements?.foodGoal?.closest('label');
    if (companyGoal?.firstChild) companyGoal.firstChild.textContent = 'Food variance reference (%)';
  }

  function correctFoodDashboardMessaging() {
    const w = dashData?.().cur;
    if (!w || w.foodVariance == null) return;

    // Remove legacy alerts generated by the old "lower than goal" rule.
    document.querySelectorAll('#alerts .alert').forEach(el => {
      if (/food variance above goal/i.test(el.textContent || '')) el.remove();
    });

    // If positive, surface it as a caution rather than a hard failure.
    if (Number(w.foodVariance) > 0 && ![...document.querySelectorAll('#alerts .alert')].some(el => /food variance/i.test(el.textContent || ''))) {
      const el = document.createElement('div');
      el.className = 'alert';
      el.innerHTML = `<b>Food variance is above zero</b><span class="muted">${Number(w.foodVariance).toFixed(2)}% is slightly over the preferred zero point. Review it, but do not treat it as an automatic failure.</span>`;
      alerts.appendChild(el);
    }
  }

  renderDashboard = function() {
    originalRenderDashboard();
    updateTrackingLabels();
    correctFoodDashboardMessaging();
  };

  updateTrackingLabels();
  renderDashboard();
})();
