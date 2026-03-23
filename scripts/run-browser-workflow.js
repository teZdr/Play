const path = require('path');
const { chromium } = require('@playwright/test');
const { ensureDir, loadWorkflowConfig, runWorkflow } = require('./lib/workflow-engine');

async function main() {
  const { resolvedPath, config } = loadWorkflowConfig(process.env.WORKFLOW_CONFIG);
  const outputDir = path.resolve(process.cwd(), 'output/playwright', config.name);
  const headless = process.env.HEADLESS !== 'false';

  ensureDir(outputDir);

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const page = await context.newPage();

  try {
    await runWorkflow(page, config, { outputDir });
    console.log(`Workflow "${config.name}" completed successfully.`);
    console.log(`Config: ${resolvedPath}`);
    console.log(`Artifacts: ${outputDir}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
