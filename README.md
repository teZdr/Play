# Play

Reusable Playwright automation lives in [`workflow/browser-workflow.json`](/Users/tzdravkov/Projects/Automation/Play/workflow/browser-workflow.json), with one shared engine used by both the script runner and the Playwright test.

## Files

- [`scripts/run-browser-workflow.js`](/Users/tzdravkov/Projects/Automation/Play/scripts/run-browser-workflow.js): launches Chromium and runs the workflow config.
- [`scripts/lib/workflow-engine.js`](/Users/tzdravkov/Projects/Automation/Play/scripts/lib/workflow-engine.js): shared step engine for scripts and tests.
- [`tests/browser-workflow.spec.js`](/Users/tzdravkov/Projects/Automation/Play/tests/browser-workflow.spec.js): Playwright test wrapper around the same workflow.
- [`workflow/browser-workflow.json`](/Users/tzdravkov/Projects/Automation/Play/workflow/browser-workflow.json): edit this with the real site steps.
- [`playwright-cli.json`](/Users/tzdravkov/Projects/Automation/Play/playwright-cli.json): default CLI viewport and headless settings.

## Supported Step Actions

- `goto`
- `click`
- `fill`
- `press`
- `waitForSelector`
- `expectVisible`
- `expectUrlContains`
- `waitForTimeout`
- `screenshot`

`fill`, `goto`, and `expectUrlContains` can pull values from env vars with `"valueFromEnv": "ENV_VAR_NAME"`.

## Run Steps

1. Edit [`workflow/browser-workflow.json`](/Users/tzdravkov/Projects/Automation/Play/workflow/browser-workflow.json) with the real URL, selectors, and assertions.
2. If your workflow needs secrets, export them first, for example: `export LOGIN_EMAIL='you@example.com'`.
3. Run the standalone browser script: `npm run workflow:run`
4. Run it headed for debugging: `HEADLESS=false npm run workflow:run`
5. Run the matching Playwright test: `npm run workflow:test`

Artifacts are written under `output/playwright/<workflow-name>/`.

## Playwright CLI Discovery

Use the CLI wrapper to inspect a page and collect stable element refs before encoding selectors:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"

"$PWCLI" open https://example.com --headed
"$PWCLI" snapshot
```

Snapshot again after each major UI change so the element refs stay fresh.
