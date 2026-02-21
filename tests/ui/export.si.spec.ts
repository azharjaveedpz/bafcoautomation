import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';
import { ExportDashboardPage } from '../../pages/ui/exportDashboard.page';
import { JobPage } from '../../pages/ui/job.page';
import { ExportSIPage } from '../../pages/ui/exportSI.page';



test.describe('EXport SI Operation Scenarios', () => {

  test('Validate SI Requested details', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const exportdashboard = new ExportDashboardPage(page);
    const exportsi = new ExportSIPage(page);
    const job = new JobPage(page);
    // ================= LOGIN FLOW =================
    await test.step('Login flow', async () => {

      await test.step('Login with valid user', async () => {

        await loginPage.login(
          loginData.export.username,
          loginData.export.password
        );

        await loginPage.assertExportLoginSuccess();
      });

    });
     // ================= NAVIGATION FLOW =================
    await test.step('Navigate to SI Requested page', async () => {

      await test.step('Open Dashboard and click SI Requested', async () => {
        await exportdashboard.clickAndValidateExportSIRequestedPage();
      });

        const summary = `
Validation: SI Requested Page URL
Expected: /ExpShippingInstructionList/1
Actual: ${page.url()}
Status: SUCCESS
`;

        console.log(summary);

        await test.info().attach('SI Requested URL Validation', {
          body: summary,
          contentType: 'text/plain',
        });

      });

      // ================= SI Requested OPEN FLOW =================
    await test.step('Click Job ID and open Job details', async () => {

      const jobId = await exportsi.clickJobIdAndPrint();

      await test.info().attach('Selected Job ID', {
        body: `Selected Job ID: ${jobId}`,
        contentType: 'text/plain',
      });

    });

// ================= HEADER VALIDATION =================
    await test.step('Validate Job Header details', async () => {

      const summary = await job.validateAndPrintJobHeaderDetails();

      await test.info().attach('Job Header Details Validation', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'text/plain',
      });

    });
    await test.step('Validate Manifest, Draft BL and SI statuses', async () => {

  const statusData =
    await job.validateAndPrintStatuses();

  await test.info().attach('Status Details', {
    body: JSON.stringify(statusData, null, 2),
    contentType: 'application/json',
  });

});


    });
  });


