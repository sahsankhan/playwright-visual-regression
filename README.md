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
| Home catalog | `tests/catalog-visual.spec.js-snapshots/home-catalog-{platform}.png` |
| Product detail | `tests/catalog-visual.spec.js-snapshots/product-detail-{platform}.png` |

Windows local runs use `-win32` snapshots. CI uses `-linux` snapshots generated on GitHub Actions. Product detail resolves a live product ID from the Toolshop API (override with `PRODUCT_ID`).

## How it works

**Baselines** — PNG snapshots committed in git. Update with `npm run test:update-snapshots`, then commit the snapshot folder.

**Masking** — Dynamic areas (notification bar, profile menu) are masked so they do not cause false failures. See `src/utils/visualHelpers.js`.

**On failure** — Playwright outputs Expected, Actual, and Diff images. Default tolerance: 1% pixel difference (`MAX_DIFF_PIXEL_RATIO=0.01` in `.env`).

**Platform** — Screenshot rendering differs between Windows and Linux, so baselines are stored per OS. After the first successful CI run, Linux snapshots are committed automatically. Local Windows: `npm run test:update-snapshots`.

## Reports

| Output | Path |
|---|---|
| Visual summary | `reports/visual-summary.html` |
| Playwright HTML (interactive diffs) | `playwright-report/index.html` |

CI always builds the summary and uploads `visual-regression-reports` (even when tests fail). Download it from the Actions run page.

## CI

Runs `npm run test:smoke` on Ubuntu (not Docker). The `@demo` diff test is README-only — not part of CI.

## Environment

| Variable | Default |
|---|---|
| `UI_BASE_URL` | `https://practicesoftwaretesting.com` |
| `PRODUCT_ID` | `01M2MTJ2QH6C62RDQHWFVAVE9Y` |
| `HEADLESS` | `true` |
| `MAX_DIFF_PIXEL_RATIO` | `0.01` |
