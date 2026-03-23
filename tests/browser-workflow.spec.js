const { test } = require('@playwright/test');
const { loadWorkflowConfig, runWorkflow } = require('../scripts/lib/workflow-engine');

test('browser workflow config runs successfully', async ({ page }) => {
  const { config } = loadWorkflowConfig(process.env.WORKFLOW_CONFIG);
  await runWorkflow(page, config, {
    outputDir: `output/playwright/${config.name}/test`,
  });
});
