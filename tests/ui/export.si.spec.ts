import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';
import { ExportDashboardPage } from '../../pages/ui/exportDashboard.page';
import { JobPage } from '../../pages/ui/job.page';
import { ExportSIPage } from '../../pages/ui/exportSI.page';

test.describe('Export SI Operation Scenarios', () => {

  // =================================================
  // 1️⃣ Validate SI Requested details
  // =================================================
  test('Validate SI Requested details', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const exportDashboard = new ExportDashboardPage(page);
    const exportSI = new ExportSIPage(page);
    const job = new JobPage(page);

    // LOGIN
    await loginPage.login(
      loginData.export.username,
      loginData.export.password
    );
    await loginPage.assertExportLoginSuccess();

    // NAVIGATION
    await exportDashboard.clickAndValidateExportSIRequestedPage();
    await expect(page).toHaveURL(/ExpShippingInstructionList\/1/);

    // OPEN JOB
    const jobId = await exportSI.clickJobIdAndPrint();

    await test.info().attach('Selected Job ID', {
      body: `Selected Job ID: ${jobId}`,
      contentType: 'text/plain',
    });

    // HEADER VALIDATION
    const header = await job.validateAndPrintJobHeaderDetails();
    await test.info().attach('Header Details', {
      body: JSON.stringify(header, null, 2),
      contentType: 'application/json',
    });

    // STATUS VALIDATION
    const statusData = await job.validateAndPrintStatuses();
    await test.info().attach('Status Details', {
      body: JSON.stringify(statusData, null, 2),
      contentType: 'application/json',
    });
  });

  // =================================================
  // 2️⃣ Validate SI Submitted & Acknowledge
  // =================================================
  test.only('Validate SI Submitted details & Acknowledge SI', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const exportDashboard = new ExportDashboardPage(page);
    const exportSI = new ExportSIPage(page);
    const job = new JobPage(page);

    // LOGIN
    await loginPage.login(
      loginData.export.username,
      loginData.export.password
    );
    await loginPage.assertExportLoginSuccess();

    // NAVIGATION
    await exportDashboard.openSISubmitted();
    await expect(page).toHaveURL(/ExpShippingInstructionList\/3/);

    // OPEN JOB
    const jobId = await exportSI.clickJobIdAndPrint();

    await test.info().attach('Selected Job ID', {
      body: `Selected Job ID: ${jobId}`,
      contentType: 'text/plain',
    });

    // HEADER VALIDATION
    const header = await job.validateAndPrintSubmittedJobHeaderDetails();
    await test.info().attach('Header Details', {
      body: JSON.stringify(header, null, 2),
      contentType: 'application/json',
    });

    // STATUS VALIDATION
    const statusData = await job.getSIStatuses();

await expect(statusData['Manifest Status']).toBe('NA');
await expect(statusData['Draft BL Status']).toBe('NA');
await expect(statusData['SI Status']).toBe('Submitted');
await expect(statusData['Assigned To']).toBe('SALMAN');

await test.info().attach('Status Details', {
  body: JSON.stringify(statusData, null, 2),
  contentType: 'application/json',
});
// View Document
    const doc = await job.viewAndCloseDocument();
    await test.info().attach('Header Details', {
      body: JSON.stringify(doc, null, 2),
      contentType: 'application/json',
    });

    await job.approveAndSelectSITeam();
await test.info().attach('SI Buttons Clicked', {
  body: 'Clicked Approve SI Acknowledgment and SI Team buttons',
  contentType: 'text/plain',
});



const blNumber = await job.fillBLNumberAndUploadFiles(
  'utils/acknowledgementSlip_S1372614554940.pdf',
  'utils/acknowledgementSlip_S1372614554940.pdf'
);

await test.info().attach('BL Created', {
  body: `Uploaded files and created BL Number: ${blNumber}`,
  contentType: 'text/plain',
});
    // ACKNOWLEDGE SI
   // await exportSI.acknowledgeSI();
  });

  

});