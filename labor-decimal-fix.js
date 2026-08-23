(() => {
  function allowLaborHundredths() {
    const weeklyInput = weekForm?.elements?.laborHoursSaved;
    if (weeklyInput) {
      weeklyInput.step = '0.01';
      weeklyInput.inputMode = 'decimal';
    }

    const goalInput = settingsForm?.elements?.laborGoal;
    if (goalInput) goalInput.step = '0.01';
  }

  const originalRender = render;
  render = function() {
    originalRender();
    allowLaborHundredths();
  };

  allowLaborHundredths();
})();
