// GM Assistant: present weekly entry as Week Ending (Friday) while preserving existing Saturday-based stored records.
(() => {
  const form = document.getElementById('weekForm');
  if (!form) return;
  const input = form.elements.weekStart;
  if (!input) return;

  const isoShift = (iso, days) => {
    if (!iso) return '';
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  // Change only the user-facing meaning of the date. Stored data remains weekStart=Saturday
  // so existing history, trends, monthly rollups and saved records stay compatible.
  const label = input.closest('label');
  if (label) {
    const textNode = [...label.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.nodeValue = 'Week ending (Friday)';
  }

  // Existing form handler expects a Saturday weekStart. Convert the selected Friday
  // to the prior Saturday immediately before that handler reads FormData.
  form.addEventListener('submit', () => {
    const friday = input.value;
    if (!friday) return;
    input.value = isoShift(friday, -6);
    setTimeout(() => {
      // After a normal save the form is cleared. Only restore if another handler left
      // the converted Saturday value in the field.
      if (input.value === isoShift(friday, -6)) input.value = friday;
    }, 0);
  }, true);

  // When editing an existing saved record, the legacy edit function loads Saturday.
  // Convert it back to the corresponding Friday for display to the GM.
  const baseEditW = window.editW;
  if (typeof baseEditW === 'function') {
    window.editW = function(id) {
      baseEditW(id);
      if (input.value) input.value = isoShift(input.value, 6);
      const banner = document.getElementById('editWeekBanner');
      const week = window.s?.weeks?.find?.(x => x.id === id);
      if (banner && week?.weekStart) banner.textContent = `Editing week ending: ${fd(isoShift(week.weekStart, 6))}`;
    };
  }
})();
