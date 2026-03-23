const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveConfigPath(configPath) {
  return path.resolve(process.cwd(), configPath || 'workflow/browser-workflow.json');
}

function loadWorkflowConfig(configPath) {
  const resolvedPath = resolveConfigPath(configPath);
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const config = JSON.parse(raw);

  if (!config.name || !Array.isArray(config.steps) || config.steps.length === 0) {
    throw new Error(
      `Workflow config at ${resolvedPath} must include "name" and a non-empty "steps" array.`,
    );
  }

  return { resolvedPath, config };
}

function resolveValue(step) {
  if (Object.prototype.hasOwnProperty.call(step, 'value')) {
    return step.value;
  }

  if (step.valueFromEnv) {
    const envValue = process.env[step.valueFromEnv];
    if (envValue === undefined) {
      throw new Error(
        `Missing environment variable "${step.valueFromEnv}" for step "${step.name || step.action}".`,
      );
    }
    return envValue;
  }

  return undefined;
}

async function runStep(page, step, context) {
  const timeout = step.timeoutMs ?? context.defaultTimeoutMs;

  switch (step.action) {
    case 'goto': {
      const url = resolveValue(step) || step.url;
      if (!url) {
        throw new Error(`Step "${step.name || step.action}" requires "url" or "value".`);
      }

      await page.goto(url, {
        waitUntil: step.waitUntil || 'domcontentloaded',
        timeout,
      });
      return;
    }

    case 'click':
      await page.locator(step.selector).click({ timeout });
      return;

    case 'fill':
      await page.locator(step.selector).fill(String(resolveValue(step) ?? ''), { timeout });
      return;

    case 'press':
      await page.locator(step.selector).press(step.key, { timeout });
      return;

    case 'waitForSelector':
      await page.locator(step.selector).waitFor({
        state: step.state || 'visible',
        timeout,
      });
      return;

    case 'expectVisible':
      await page.locator(step.selector).waitFor({ state: 'visible', timeout });
      return;

    case 'expectUrlContains': {
      const expected = resolveValue(step) || step.value;
      await page.waitForURL(
        currentUrl => currentUrl.toString().includes(expected),
        { timeout },
      );
      return;
    }

    case 'screenshot': {
      const targetPath = path.resolve(context.outputDir, step.path || 'workflow.png');
      ensureDir(path.dirname(targetPath));
      await page.screenshot({
        path: targetPath,
        fullPage: step.fullPage !== false,
      });
      return;
    }

    case 'waitForTimeout':
      await page.waitForTimeout(step.durationMs ?? 1000);
      return;

    default:
      throw new Error(`Unsupported workflow action "${step.action}".`);
  }
}

async function runWorkflow(page, workflowConfig, options = {}) {
  const context = {
    outputDir: path.resolve(process.cwd(), options.outputDir || 'output/playwright'),
    defaultTimeoutMs: options.defaultTimeoutMs ?? workflowConfig.defaultTimeoutMs ?? 15000,
  };

  ensureDir(context.outputDir);
  page.setDefaultTimeout(context.defaultTimeoutMs);

  for (const step of workflowConfig.steps) {
    await runStep(page, step, context);
  }
}

module.exports = {
  ensureDir,
  loadWorkflowConfig,
  runWorkflow,
};
