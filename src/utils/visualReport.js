const fs = require('fs');
const path = require('path');

const jsonPath = path.join('reports', 'visual-results.json');
const summaryPath = path.join('reports', 'visual-summary.html');
const bundleDir = path.join('reports', 'visual-run');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function walkSpecs(suites, parentTitles = []) {
  const rows = [];

  for (const suite of suites || []) {
    const titles = [...parentTitles, suite.title].filter(Boolean);

    for (const spec of suite.specs || []) {
      const testTitle = [...titles, spec.title].join(' › ');
      const test = spec.tests?.[0];
      const result = test?.results?.[0];
      if (!result) {
        continue;
      }

      rows.push({
        title: testTitle,
        status: result.status,
        error: result.error?.message,
        attachments: result.attachments || [],
      });
    }

    rows.push(...walkSpecs(suite.suites, titles));
  }

  return rows;
}

function copyIfExists(source, dest) {
  if (!source || !fs.existsSync(source)) {
    return null;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  return path.relative(path.dirname(summaryPath), dest).replace(/\\/g, '/');
}

function resolveBaseline(snapshotName) {
  const snapshotDir = path.join('tests', 'catalog-visual.spec.js-snapshots');
  const baseline = path.join(snapshotDir, snapshotName);
  return fs.existsSync(baseline) ? baseline : null;
}

function snapshotNameFromTitle(title) {
  if (title.includes('home catalog')) {
    return 'home-catalog.png';
  }
  if (title.includes('product detail')) {
    return 'product-detail.png';
  }
  return null;
}

function buildRowHtml(row, index) {
  const slug = `case-${index + 1}`;
  const attachment = (name) => row.attachments.find((item) => item.name === name)?.path;

  const expectedSrc = copyIfExists(
    attachment('expected') || resolveBaseline(snapshotNameFromTitle(row.title)),
    path.join(bundleDir, slug, 'expected.png'),
  );
  const actualSrc = copyIfExists(attachment('actual'), path.join(bundleDir, slug, 'actual.png'));
  const diffSrc = copyIfExists(attachment('diff'), path.join(bundleDir, slug, 'diff.png'));

  const passed = row.status === 'passed';
  const statusClass = passed ? 'pass' : 'fail';
  const statusLabel = passed ? 'Match' : 'Mismatch';

  const images = passed
    ? `
      <div class="compare pass-only">
        <figure>
          <figcaption>Baseline</figcaption>
          ${expectedSrc ? `<img src="${escapeHtml(expectedSrc)}" alt="Baseline screenshot" />` : '<p class="meta">Baseline committed in repo snapshots.</p>'}
        </figure>
      </div>`
    : `
      <div class="compare">
        <figure>
          <figcaption>Expected (baseline)</figcaption>
          ${expectedSrc ? `<img src="${escapeHtml(expectedSrc)}" alt="Expected screenshot" />` : '<p class="meta">Expected image unavailable.</p>'}
        </figure>
        <figure>
          <figcaption>Actual (current run)</figcaption>
          ${actualSrc ? `<img src="${escapeHtml(actualSrc)}" alt="Actual screenshot" />` : '<p class="meta">Actual image unavailable.</p>'}
        </figure>
        <figure>
          <figcaption>Diff (highlighted changes)</figcaption>
          ${diffSrc ? `<img src="${escapeHtml(diffSrc)}" alt="Diff screenshot" />` : '<p class="meta">Diff image unavailable.</p>'}
        </figure>
      </div>`;

  return `
    <section class="case ${statusClass}">
      <header>
        <h2>${escapeHtml(row.title)}</h2>
        <span class="pill ${statusClass}">${statusLabel}</span>
      </header>
      ${row.error ? `<pre class="error">${escapeHtml(row.error.split('\n').slice(0, 8).join('\n'))}</pre>` : ''}
      ${images}
    </section>`;
}

function buildHtml(payload, rows) {
  const passed = rows.filter((row) => row.status === 'passed').length;
  const failed = rows.length - passed;
  const overallClass = failed > 0 ? 'fail' : 'pass';
  const overallLabel = failed > 0 ? 'Visual differences detected' : 'All screenshots match baselines';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visual Regression Summary</title>
  <style>
    :root { font-family: Segoe UI, system-ui, sans-serif; color: #e2e8f0; background: #0b1220; line-height: 1.5; }
    main { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .hero, .case { background: #111827; border: 1px solid #334155; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
    .hero.pass { border-color: #166534; }
    .hero.fail { border-color: #991b1b; }
    h1, h2 { margin: 0 0 8px; }
    .meta { color: #94a3b8; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 14px; }
    .card { background: #1e293b; border-radius: 10px; padding: 12px; }
    .card strong { display: block; font-size: 1.4rem; }
    .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
    .pill.pass { background: #166534; }
    .pill.fail { background: #991b1b; }
    .compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 12px; }
    .compare.pass-only { grid-template-columns: 1fr; max-width: 640px; }
    figure { margin: 0; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px; }
    figcaption { color: #94a3b8; margin-bottom: 8px; font-size: 0.9rem; }
    img { width: 100%; height: auto; display: block; border-radius: 8px; background: #fff; }
    pre.error { white-space: pre-wrap; background: #1f2937; border-radius: 8px; padding: 10px; color: #fecaca; font-size: 0.85rem; }
    a { color: #93c5fd; }
  </style>
</head>
<body>
  <main>
    <section class="hero ${overallClass}">
      <h1>${escapeHtml(overallLabel)}</h1>
      <p class="meta">Generated ${escapeHtml(new Date().toISOString())} · Playwright <code>toHaveScreenshot()</code></p>
      <div class="cards">
        <div class="card"><strong>${rows.length}</strong> screens checked</div>
        <div class="card"><strong>${passed}</strong> matched</div>
        <div class="card"><strong>${failed}</strong> mismatched</div>
      </div>
      <p class="meta" style="margin-top:12px;">Full interactive diff report: <a href="../playwright-report/index.html">playwright-report/index.html</a></p>
    </section>
    ${rows.map(buildRowHtml).join('')}
    <section class="hero">
      <p class="meta"><strong>How to read:</strong> Expected = committed baseline. Actual = this run. Diff = pixels that changed (industry-standard Playwright visual output).</p>
    </section>
  </main>
</body>
</html>`;
}

function generateVisualSummary() {
  if (!fs.existsSync(jsonPath)) {
    console.warn('No reports/visual-results.json found. Run tests first.');
    return null;
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const rows = walkSpecs(payload.suites);

  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, buildHtml(payload, rows));
  return summaryPath;
}

if (require.main === module) {
  const report = generateVisualSummary();
  if (report) {
    console.log(`Visual summary: ${path.resolve(report)}`);
  }
}

module.exports = { generateVisualSummary, summaryPath };
