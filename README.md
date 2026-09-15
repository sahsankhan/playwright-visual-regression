# Playwright Visual Regression

Playwright built-in screenshot comparison (`expect().toHaveScreenshot()`) against the [Toolshop](https://practicesoftwaretesting.com) UI.

Agency-ready template: smoke journey (home catalog + product detail), committed baselines, HTML diff report on failure, CI on Windows (matches snapshot platform).

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
npm test                  # compare against baselines
npm run test:headed       # visible browser
npm run test:smoke        # @smoke journey only
npm run test:update-snapshots   # refresh baselines after intentional UI change
npm run report            # open HTML report (shows diff images on failure)
```

## Journey

1. **Home catalog** — viewport screenshot after catalog grid loads; dynamic banner/profile masked.
2. **Product detail** — viewport screenshot after product title loads; product resolved via Toolshop API.

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

**Platform note:** Baselines in this repo are generated on **Windows + Chromium**. CI uses `windows-latest` so snapshots stay consistent. If you regenerate on Linux/macOS, filenames and rendering may differ — re-run update on Windows or adjust CI runner to match your dev OS.

## Reports

| Output | Path |
|---|---|
| HTML report (diff highlights) | `playwright-report/` |
| Failure artifacts | `test-results/` |

On CI failure, download the `visual-diffs` artifact for expected/actual/diff images.

## CI

GitHub Actions runs `npm run test:smoke` on `windows-latest` and uploads the Playwright HTML report.

## Environment

| Variable | Default |
|---|---|
| `UI_BASE_URL` | `https://practicesoftwaretesting.com` |
| `API_BASE_URL` | `https://api.practicesoftwaretesting.com` |
| `HEADLESS` | `true` |
| `MAX_DIFF_PIXEL_RATIO` | `0.01` |
