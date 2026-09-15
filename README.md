# Playwright Visual Regression

Playwright built-in screenshot comparison (`expect().toHaveScreenshot()`) against the [Toolshop](https://practicesoftwaretesting.com) UI.

Agency-ready template: smoke journey, committed baselines, industry-standard **Expected / Actual / Diff** reporting.

## Prerequisites

- Node.js 18+
- npm

## Setup

From this folder:

```powershell
npm install
npx playwright install chromium
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`.

## Run

```powershell
npm test                  # compare + open visual summary
npm run test:headed       # visible browser
npm run test:smoke        # @smoke journey only
npm run test:update-snapshots   # refresh baselines after intentional UI change
npm run report            # open Playwright HTML report
npm run report:summary    # rebuild summary from last JSON results
```

## Journey

1. **Home catalog** — viewport screenshot after catalog grid loads; dynamic banner/profile masked.
2. **Product detail** — viewport screenshot after add-to-cart loads; product resolved via Toolshop API.

## Baselines

Snapshots live in `tests/catalog-visual.spec.js-snapshots/` and are committed to git.

Playwright compares pixel-by-pixel using `maxDiffPixelRatio` (default `0.01` = 1%). Override via `.env`:

```powershell
$env:MAX_DIFF_PIXEL_RATIO="0.02"; npm test
```

### Updating baselines

After an intentional UI change:

```powershell
npm run test:update-snapshots
git add tests/catalog-visual.spec.js-snapshots
git commit -m "Update visual baselines"
```

**Platform note:** Baselines are generated on **Windows + Chromium**. CI uses `windows-latest` so snapshots stay consistent.

## Reporting (industry pattern)

Playwright-native visual regression uses two layers — same approach teams use before adopting Percy/Chromatic:

### 1. Visual summary (stakeholder-friendly)

| Output | Path |
|---|---|
| Summary dashboard | `reports/visual-summary.html` |
| Side-by-side bundle | `reports/visual-run/{case}/expected.png`, `actual.png`, `diff.png` |
| Machine-readable JSON | `reports/visual-results.json` |

Open `reports/visual-summary.html` after every `npm test`. On **pass**, you see baseline thumbnails. On **fail**, you get the industry-standard **Expected · Actual · Diff** triptych.

### 2. Playwright HTML report (developer detail)

| Output | Path |
|---|---|
| Interactive HTML report | `playwright-report/index.html` |
| Raw failure attachments | `test-results/` |

The Playwright HTML report is the canonical built-in diff viewer — click a failed test to inspect screenshots with Playwright's attachment UI. Run `npm run report` to open it anytime.

### CI artifacts

GitHub Actions uploads one artifact: **`visual-regression-reports`** containing both `playwright-report/` and `reports/`. Download, extract fully, then open `reports/visual-summary.html`.

### vs SaaS visual tools

| Approach | When teams use it |
|---|---|
| **Playwright built-in** (this repo) | Free, git-tracked baselines, PR-friendly, no external service |
| **Percy / Chromatic / Argos** | Design-system teams wanting cloud history, PR comments, approval workflows |

This template uses Playwright built-in — the reporting pattern (Expected / Actual / Diff) is the same; delivery is local HTML + CI artifacts instead of a cloud dashboard.

## CI

GitHub Actions runs `npm run test:smoke` on `windows-latest`, builds the visual summary, and uploads reports.

## Environment

| Variable | Default |
|---|---|
| `UI_BASE_URL` | `https://practicesoftwaretesting.com` |
| `API_BASE_URL` | `https://api.practicesoftwaretesting.com` |
| `HEADLESS` | `true` |
| `MAX_DIFF_PIXEL_RATIO` | `0.01` |
