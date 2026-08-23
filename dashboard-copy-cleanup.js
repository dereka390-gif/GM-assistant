// Remove internal/explanatory implementation notes from the dashboard UI.
(() => {
  const phrases = [
    'Morning stays in the five-daypart average but is hidden here.',
    'Visible performance is Lunch, Afternoon, Dinner, and Evening.'
  ];

  function cleanDashboardCopy() {
    const dash = document.getElementById('dash');
    if (!dash) return;

    [...dash.querySelectorAll('p,div,span,small')].forEach(el => {
      const text = (el.textContent || '').trim();
      if (!text) return;
      if (phrases.some(p => text.includes(p))) {
        // Prefer removing the smallest text-only element so surrounding layout stays intact.
        if (el.children.length === 0 || el.matches('p,small')) el.remove();
      }
    });
  }

  cleanDashboardCopy();
  const dash = document.getElementById('dash');
  if (dash) new MutationObserver(cleanDashboardCopy).observe(dash,{childList:true,subtree:true});
})();
