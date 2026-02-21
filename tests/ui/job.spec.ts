import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';
import { ExportDashboardPage } from '../../pages/ui/exportDashboard.page';
import { JobPage } from '../../pages/ui/job.page';


test.describe('Job Operation Scenarios', () => {

  test('Validate Job Assigned details', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const exportdashboard = new ExportDashboardPage(page);
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
    await test.step('Navigate to Job Assigned page', async () => {

      await test.step('Open Dashboard and click Job Assigned', async () => {
        await exportdashboard.clickJobAssignedMenu();
      });

      await test.step('Verify Job Assigned page loaded', async () => {

        await exportdashboard.verifyJobAssignedPage();

        const summary = `
Validation: Job Assigned Page URL
Expected: /JobAssignedSIPending
Actual: ${page.url()}
Status: SUCCESS
`;

        console.log(summary);

        await test.info().attach('Job Assigned URL Validation', {
          body: summary,
          contentType: 'text/plain',
        });

      });

    });

    // ================= VALIDATION FLOW =================
    await test.step('Validate Job Assigned table details', async () => {

      const rowData = await job.validateJobAssignedDetails();

      await test.info().attach('Job Assigned Details Validation', {
        body: JSON.stringify(rowData, null, 2),
        contentType: 'text/plain',
      });

    });

    // ================= JOB OPEN FLOW =================
    await test.step('Click Job ID and open Job details', async () => {

      const jobId = await job.clickJobIdAndPrint();

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
await test.step('Upload Shipping Instruction and VGM detail', async () => {

  const uploadStatus =
    await job.uploadShippingInstructionAndVgmDetail(
      'utils/acknowledgementSlip_S1372614554940.pdf'
    );

  await test.info().attach('Uploaded Shipping Instruction File', {
    body: uploadStatus,
    contentType: 'text/plain',
  });

});
await test.step('Click Shipping Instruction button', async () => {

  await job.clickSiTeamProcessButton();

  await test.info().attach('Shipping Instruction Action', {
    body: 'Shipping Instruction button clicked successfully',
    contentType: 'text/plain',
  });

});

await test.step('Upload Packing List document', async () => {

  const uploadedFileName =
    await job.uploadPackingListDocument(
      'utils/acknowledgementSlip_S1372614554940.pdf'
    );

  await test.info().attach('Uploaded Packing List File', {
    body: uploadedFileName,
    contentType: 'text/plain',
  });

});

await test.step('Upload VGM document', async () => {
  await job.enableVgm();

  const uploadedFileName =
    await job.uploadVgmDocument(
     'utils/acknowledgementSlip_S1372614554940.pdf'
    );

  await test.info().attach('Uploaded VGM File', {
    body: uploadedFileName,
    contentType: 'text/plain',
  });

});
await test.step('Submit document to SI Team', async () => {

  await job.clickSubmitToSiTeam();

  await test.info().attach('SI Team Submit Action', {
    body: 'Clicked SUBMIT To SI Team button successfully',
    contentType: 'text/plain',
  });

});
await test.step('Verify moved dialog and click OK', async () => {

  const dialogMessage =
    await job.handleMovedDialog();

  await test.info().attach('Moved Dialog Message', {
    body: dialogMessage,
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
