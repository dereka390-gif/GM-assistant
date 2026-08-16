// Help / App Guide tab for GM Assistant
(() => {
  function boot(){
    const nav=document.querySelector('.tabs');
    const main=document.querySelector('main');
    if(!nav||!main) return setTimeout(boot,100);
    if(document.getElementById('help')) return;

    const helpBtn=document.createElement('button');
    helpBtn.dataset.v='help';
    helpBtn.textContent='Help / Guide';
    nav.appendChild(helpBtn);

    const section=document.createElement('section');
    section.id='help';
    section.className='view';
    section.innerHTML=`
      <div class="card hero" style="grid-template-columns:1fr">
        <div><div class="eyebrow">App guide</div><h2>How GM Assistant Works</h2><p class="muted">Use this page as a quick reference for the weekly workflow, Restaurant Health Status, trends, Communication Studio, and settings.</p></div>
      </div>

      <div class="card"><div class="eyebrow">Quick start</div><h2>Recommended weekly workflow</h2>
        <div class="action"><div class="step">1</div><div><b>Enter the completed week</b><div class="muted">Use the Friday week-ending date for the Saturday–Friday work week.</div></div></div>
        <div class="action"><div class="step">2</div><div><b>Review the Dashboard</b><div class="muted">Check Restaurant Health Status, alerts, wins, and suggested next moves.</div></div></div>
        <div class="action"><div class="step">3</div><div><b>Check Trends</b><div class="muted">Compare weekly and monthly performance to see whether changes are improving results.</div></div></div>
        <div class="action"><div class="step">4</div><div><b>Create team communication</b><div class="muted">Use Communication to turn priorities and wins into a printable board update or poster.</div></div></div>
      </div>

      <div class="card"><div class="eyebrow">Restaurant health</div><h2>How Restaurant Health Status is calculated</h2>
        <p class="muted">Restaurant Health is a 0–100 weighted operating score. It is intentionally more forgiving than a school-style percentage because guest metrics and operational KPIs do not behave like test scores.</p>
        <div class="two">
          <div class="panel"><b>Guest Experience — 35%</b><div class="muted" style="margin-top:6px">OSAT, Accuracy, Cleanliness, Speed, Taste, and Friendliness are converted to operational performance scores and averaged.</div></div>
          <div class="panel"><b>Operations — 30%</b><div class="muted" style="margin-top:6px">Uses overall Drive-Thru Time compared with the Drive-Thru Goal in Settings. Lower is better.</div></div>
          <div class="panel"><b>Food Cost — 20%</b><div class="muted" style="margin-top:6px">Uses Food Variance compared with the Food Variance Goal in Settings. Lower is better.</div></div>
          <div class="panel"><b>Labor — 15%</b><div class="muted" style="margin-top:6px">Uses Labor Hours Saved compared with the Labor Goal in Settings. Higher is better.</div></div>
        </div>
        <div class="panel" style="margin-top:12px"><b>Final formula</b><div class="muted" style="margin-top:6px">Guest Experience × 35% + Operations × 30% + Food Cost × 20% + Labor × 15% = Restaurant Health Score.</div></div>
      </div>

      <div class="card"><div class="eyebrow">Status bands</div><h2>What each status means</h2>
        <div class="grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="metric"><div class="value" style="font-size:22px">95–100</div><b>Goal Exceeded</b><div class="muted">Outstanding overall performance.</div></div>
          <div class="metric"><div class="value" style="font-size:22px">90–94</div><b>Goal Met</b><div class="muted">Strong overall performance.</div></div>
          <div class="metric"><div class="value" style="font-size:22px">80–89</div><b>Goal Almost Met</b><div class="muted">Very close; focus on the weakest area.</div></div>
          <div class="metric"><div class="value" style="font-size:22px">70–79</div><b>Making Progress</b><div class="muted">Several areas are working, with clear opportunities.</div></div>
          <div class="metric"><div class="value" style="font-size:22px">60–69</div><b>Needs Improvement</b><div class="muted">Prioritize the largest controllable gaps.</div></div>
          <div class="metric"><div class="value" style="font-size:22px">Below 60</div><b>Priority Attention</b><div class="muted">Multiple operational areas need focused attention.</div></div>
        </div>
      </div>

      <div class="card"><div class="eyebrow">Guest experience scoring</div><h2>Why survey percentages are converted</h2>
        <p class="muted">A 60% Accuracy score does not become 60/100 Restaurant Health. Guest metrics are converted into performance bands so strong company-level results are not unfairly treated as failing.</p>
        <div class="two">
          <div class="panel"><b>Approximate guest conversion</b><div class="muted" style="margin-top:6px">75%+ → 100<br>70% → 97<br>65% → 94<br>60% → 90<br>55% → 86<br>50% → 81<br>45% → 76<br>40% → 70<br>35% → 64</div></div>
          <div class="panel"><b>Goal-based metrics</b><div class="muted" style="margin-top:6px">For Drive-Thru and Food Variance, being slightly over goal still earns strong credit. Labor works the opposite way: getting close to or above the labor-saved goal earns strong credit.</div></div>
        </div>
      </div>

      <div class="card"><div class="eyebrow">Dashboard</div><h2>What the Dashboard shows</h2>
        <details open><summary><b>Executive Summary</b></summary><p class="muted">Creates a management-style summary of the latest week, including what is going well and where attention is needed.</p></details>
        <details><summary><b>Restaurant Health Status</b></summary><p class="muted">Shows the overall 0–100 health score, status label, category subscores, and targeted suggestions for improvement.</p></details>
        <details><summary><b>Smart Alerts</b></summary><p class="muted">Flags important opportunities or unfavorable movement that may need management attention.</p></details>
        <details><summary><b>Weekly Wins</b></summary><p class="muted">Highlights strong performance so managers can recognize and protect what is working.</p></details>
        <details><summary><b>Suggested Action Plan</b></summary><p class="muted">Turns the week’s biggest opportunities into practical next steps.</p></details>
      </div>

      <div class="card"><div class="eyebrow">Weekly Entry</div><h2>How to enter and edit weekly data</h2>
        <p class="muted">Enter one record per completed Saturday–Friday work week using the Friday week-ending date. Save the week, then use Saved Weeks to review, edit, or delete prior entries. OSAT is treated as a rolling 90-day score, so Survey Count is not used.</p>
      </div>

      <div class="card"><div class="eyebrow">Trends</div><h2>How to use Trends</h2>
        <p class="muted">Select a metric to compare performance over time. Weekly view shows individual weeks. Monthly view summarizes the weeks in each month so you can see broader direction without losing the weekly operating detail.</p>
      </div>

      <div class="card"><div class="eyebrow">Communication</div><h2>How to use the Communication Studio</h2>
        <details open><summary><b>Quick poster workflow</b></summary><p class="muted">Choose a topic/style, generate a poster from the latest metrics, then customize wording and layout.</p></details>
        <details><summary><b>Pro Layout Editor</b></summary><p class="muted">Tap an object to select it. Hold and drag with one finger. Use two fingers to pinch-resize and rotate. You can duplicate, layer, lock, or delete objects.</p></details>
        <details><summary><b>Add Objects</b></summary><p class="muted">Add extra text, boxes, illustrated characters, or uploaded images. Each object can be positioned and styled independently.</p></details>
        <details><summary><b>Edit text</b></summary><p class="muted">Tap a box or metric card to open its text controls. Metric cards let you edit the label and value separately.</p></details>
        <details><summary><b>Upload images</b></summary><p class="muted">Upload a photo, logo, screenshot, or graphic and place it anywhere on the poster. Uploaded images can be moved, resized, rotated, layered, duplicated, locked, or deleted.</p></details>
      </div>

      <div class="card"><div class="eyebrow">Settings</div><h2>Why Settings matter</h2>
        <p class="muted">Drive-Thru Goal, Food Variance Goal, and Labor Goal directly affect Restaurant Health scoring. Keep these aligned with the operating targets you actually want the restaurant measured against.</p>
      </div>

      <div class="card"><div class="eyebrow">Data & privacy</div><h2>Where the app saves information</h2>
        <p class="muted">Weekly restaurant records and layout preferences are stored locally in the browser on the device. Clearing browser/site storage can remove locally saved information, so avoid clearing site data unless you intend to reset the app.</p>
      </div>`;
    main.appendChild(section);

    const style=document.createElement('style');
    style.textContent=`#help details{border-top:1px solid var(--line);padding:11px 0}#help details:first-of-type{border-top:0}#help summary{cursor:pointer}#help .panel{background:#fcfaf8}@media(max-width:760px){#help .grid{grid-template-columns:1fr!important}}`;
    document.head.appendChild(style);

    helpBtn.addEventListener('click',()=>show('help'));
  }
  boot();
})();