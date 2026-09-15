# Playwright Visual Regression

Playwright built-in screenshot comparison against the [Toolshop](https://practicesoftwaretesting.com) UI. Compares each run to committed baseline images — any unexpected pixel change fails the test.

## Diff example (deliberate break)

The `@demo` test injects a red navbar to prove the framework catches UI changes. Playwright highlights changed pixels:

<p align="center">
  <img src="assets/home-catalog-diff.png" alt="Visual regression diff — changed pixels highlighted" width="900" />
</p>

<p align="center"><em>Regenerate: <code>npm run demo:diff</code></em></p>

---

## Prerequisites

- Node.js 18+
- npm

## Setup

```powershell
npm install
npx playwright install chromium
copy .env.example .env
```

On macOS/Linux: `cp .env.example .env`

## Run

```powershell
npm test                    # smoke journey — must pass
npm run test:headed         # same, visible browser
npm run test:update-snapshots   # save new baselines after an intentional UI change
npm run demo:diff           # deliberate failure → refreshes README diff image
npm run report              # open Playwright HTML report
```

## Journey

| Screen | Baseline |
|---|---|
| Home catalog | `tests/catalog-visual.spec.js-snapshots/home-catalog.png` |
| Product detail | `tests/catalog-visual.spec.js-snapshots/product-detail.png` |

Product detail uses the first in-stock product from the Toolshop API.

## How it works

**Baselines** — PNG snapshots committed in git. Update with `npm run test:update-snapshots`, then commit the snapshot folder.

**Masking** — Dynamic areas (notification bar, profile menu) are masked so they do not cause false failures. See `src/utils/visualHelpers.js`.

**On failure** — Playwright outputs Expected, Actual, and Diff images. Default tolerance: 1% pixel difference (`MAX_DIFF_PIXEL_RATIO=0.01` in `.env`).

**Platform** — Baselines are Windows + Chromium. CI uses `windows-latest` to match.

## Reports

| Output | Path |
|---|---|
| Visual summary | `reports/visual-summary.html` |
| Playwright HTML (interactive diffs) | `playwright-report/index.html` |

CI uploads both as the `visual-regression-reports` artifact.

## CI

Runs `npm run test:smoke` on push/PR. The `@demo` diff test is README-only — not part of CI.

## Environment

| Variable | Default |
|---|---|
| `UI_BASE_URL` | `https://practicesoftwaretesting.com` |
| `API_BASE_URL` | `https://api.practicesoftwaretesting.com` |
| `HEADLESS` | `true` |
| `MAX_DIFF_PIXEL_RATIO` | `0.01` |
