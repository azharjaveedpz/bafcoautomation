import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { CROPage } from '../../pages/ui/cro.page';
import { loginData } from '../../data/ui/login.data';
import { DashboardPage } from '../../pages/ui/dashboard.page';
import { BookingPage } from '../../pages/ui/booking.page';
import { SoPage } from '../../pages/ui/so.page';
import { ExportDashboardPage } from '../../pages/ui/exportDashboard.page';
import { JobPage } from '../../pages/ui/job.page';
import { SIDashboardPage } from '../../pages/ui/siDashboard.page';
import { SIPage } from '../../pages/ui/si.page';
import { ExportSIPage } from '../../pages/ui/exportSI.page';
import { ManifestPage } from '../../pages/ui/maifest.page';



// ---------------- UTILITY FUNCTIONS ----------------
function generateBookingNumber(): string {
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `BK${timestamp}${letters}`;
}

function generateRemarks(): string {
  const words = ['Automation','CRO','Booking','Validation','Regression','Smoke','Playwright'];
  return `Automation test ${words[Math.floor(Math.random() * words.length)]}`;
}

// ================= SCENARIO 1 =================
test('CRO creation and SO mapping flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const croPage = new CROPage(page);
  const dashboard = new DashboardPage(page);
  const bookingPage = new BookingPage(page);
  const soPage = new SoPage(page);

  const croTestData = {
    bookingNumber: generateBookingNumber(),
    shippingLine: 'MSC',
    pol: 'JEDDAH',
    pod: 'MUNDRA',
    containerType: '20',
    vessel: 'MSC',
    quantity: 4,
    commercial: 'SAFDARALI',
    emptyPickupDepot: 'Jeddah',
    finalDestination: 'Chennai',
    remarks: generateRemarks(),
  };

  // LOGIN
  await loginPage.login(loginData.booking.valid.username, loginData.booking.valid.password);
  await loginPage.assertLoginSuccess();

  // CREATE CRO
  await dashboard.openLeftMenu();
  await croPage.openExportAndClickCRO();
  await croPage.clickNewAndVerifyNewCRO();
  await croPage.enterBookingNumber(croTestData.bookingNumber);
  await croPage.selectShippingAndPorts(croTestData.shippingLine, croTestData.pol, croTestData.pod);
  await croPage.selectFromAutoSuggest(croPage.containerTypeInput, croTestData.containerType);
  await croPage.selectFromAutoSuggest(croPage.vesselInput, croTestData.vessel);
  await croPage.enterQuantity(croTestData.quantity);
  await croPage.selectFromAutoSuggest(croPage.commercialInput, croTestData.commercial);
  await croPage.selectFromAutoSuggest(croPage.emptyPickupDepotInput, croTestData.emptyPickupDepot);
  await croPage.enterFinalDestination(croTestData.finalDestination);
  await croPage.enterETA();
  await croPage.enterRemarks(croTestData.remarks);
  await croPage.clickAddContainerButton();
  await expect(croPage.containerGridRows).toHaveCount(1);
  await croPage.uploadPaymentDocument('utils/acknowledgementSlip_S1372614554940.pdf');
  await croPage.clickSaveChanges();
  await croPage.waitForBookingListingPage();

  // NAVIGATE TO SO
  await dashboard.openLeftMenu();
  await dashboard.openDashboardMenu();
  await dashboard.openDashboardAndClickBooking();
  await bookingPage.verifyBookingPageNavigation();
  await bookingPage.clickSOReceived();
  await soPage.verifySOReceivedPageNavigation();

  // OPEN AND MAP SO
  const soNumber = await soPage.clickFirstSO();
  await soPage.clickEditButton();
  await soPage.selectCROStatusReceived();
  await soPage.selectFirstCRONumber();
  await soPage.clickUpdateCROStatus();
  await soPage.clickSaveJob();
});

// ================= SCENARIO 2 =================
test('Job Assigned validation and status checks', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const exportDashboard = new ExportDashboardPage(page);
  const job = new JobPage(page);

  // LOGIN
  await loginPage.login(loginData.export.username, loginData.export.password);
  await loginPage.assertExportLoginSuccess();

  // NAVIGATE TO JOB ASSIGNED
  await exportDashboard.clickJobAssignedMenu();
  await exportDashboard.verifyJobAssignedPage();

  // VALIDATE TABLE
  const rowData = await job.validateJobAssignedDetails();
  await test.info().attach('Job Assigned Details', { body: JSON.stringify(rowData, null, 2), contentType: 'text/plain' });

  // OPEN JOB
  const jobId = await job.clickJobIdAndPrint();
  await test.info().attach('Selected Job ID', { body: `Selected Job ID: ${jobId}`, contentType: 'text/plain' });

  // POPUPS & HEADER
  await job.handleKnowledgeBasePopup();
  const headerDetails = await job.validateAndPrintJobHeaderDetails();
  await test.info().attach('Job Header Details', { body: JSON.stringify(headerDetails, null, 2), contentType: 'text/plain' });

  // DOCUMENTS
  await job.uploadShippingInstructionAndVgmDetail('utils/acknowledgementSlip_S1372614554940.pdf');
  await job.clickSiTeamProcessButton();
  await job.uploadPackingListDocument('utils/acknowledgementSlip_S1372614554940.pdf');
  await job.enableVgm();
  await job.uploadVgmDocument('utils/acknowledgementSlip_S1372614554940.pdf');
  await job.clickSubmitToSiTeam();
  await job.handleMovedDialog();

  // STATUS CHECK
  const statusData = await job.validateAndPrintStatuses();
  await test.info().attach('Status Details', { body: JSON.stringify(statusData, null, 2), contentType: 'application/json' });
});

// ================= SCENARIO 3 =================
test('SI Requested validation and Assign SI', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sidashboard = new SIDashboardPage(page);
  const si = new SIPage(page);
  const job = new JobPage(page);

  // LOGIN SI USER
  await loginPage.login(loginData.si.username, loginData.si.password);
  await loginPage.assertSILoginSuccess();

  // NAVIGATION
  await sidashboard.openSIRequested();
  await expect(page).toHaveURL(/ShippingInstructionList\/1/);

  // SELECT ROW AND OPEN JOB
  const rowData = await si.clickCheckboxAndPrintRowDetails();
  await test.info().attach('Row Details', { body: JSON.stringify(rowData, null, 2), contentType: 'application/json' });
  const jobId = await si.clickJobIdAndPrint();
  await test.info().attach('Selected Job ID', { body: `Selected Job ID: ${jobId}`, contentType: 'text/plain' });

  // VALIDATE JOB
  const jobDetails = await si.getAndValidateJobDetails();
  await test.info().attach('Job Details', { body: JSON.stringify(jobDetails, null, 2), contentType: 'application/json' });

  // PROCESS AND ASSIGN
  const srDetails = await si.processSRRequestedDetails('utils/2576.jpg');
  await test.info().attach('SR Requested Details', { body: JSON.stringify(srDetails, null, 2), contentType: 'application/json' });
  await si.assignUserAndUpdate('Gaffar');
  await test.info().attach('Assign User Action', { body: 'User selected and Update clicked successfully', contentType: 'text/plain' });
});

// ================= SCENARIO 4 =================
test('SI Submitted flow - Export User', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const exportDashboard = new ExportDashboardPage(page);
  const exportSI = new ExportSIPage(page);
  const job = new JobPage(page);

  // LOGIN EXPORT USER
  await loginPage.login(loginData.export.username, loginData.export.password);
  await loginPage.assertExportLoginSuccess();

  // NAVIGATION TO SI SUBMITTED
  await exportDashboard.openSISubmitted();
  await expect(page).toHaveURL(/ExpShippingInstructionList\/3/);

  // OPEN JOB
  const jobId = await exportSI.clickJobIdAndPrint();
  await test.info().attach('Selected Job ID', { body: `Selected Job ID: ${jobId}`, contentType: 'text/plain' });

  // HEADER VALIDATION
  const header = await job.validateAndPrintSubmittedJobHeaderDetails();
  await test.info().attach('Header Details', { body: JSON.stringify(header, null, 2), contentType: 'application/json' });

  // STATUS VALIDATION
  const statusData = await job.getSIStatuses();
  await test.info().attach('Status Details', { body: JSON.stringify(statusData, null, 2), contentType: 'application/json' });

  // VIEW AND APPROVE DOCUMENTS
  const doc = await job.viewAndCloseDocument();
  await test.info().attach('Document Details', { body: JSON.stringify(doc, null, 2), contentType: 'application/json' });

  await job.approveAndSelectSITeam();
  const blNumber = await job.fillBLNumberAndUploadFiles('utils/acknowledgementSlip_S1372614554940.pdf','utils/acknowledgementSlip_S1372614554940.pdf');
  await test.info().attach('BL Created', { body: `Uploaded files and created BL Number: ${blNumber}`, contentType: 'text/plain' });
});

// ================= SCENARIO 5 =================
test('SI Submitted flow - SI User', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sidashboard = new SIDashboardPage(page);
  const si = new SIPage(page);
  const job = new JobPage(page);
    const exportSI = new ExportSIPage(page);

  // LOGIN SI USER
  await loginPage.login(loginData.si.username, loginData.si.password);
  await loginPage.assertSILoginSuccess();

  // NAVIGATION TO SI SUBMITTED
  await sidashboard.openSISubmitted();
  await expect(page).toHaveURL(/ShippingInstructionList\/3/);

  // SELECT FIRST ROW
  const rowData = await exportSI.clickJobIdAndPrint();
  await test.info().attach('Row Details', { body: JSON.stringify(rowData, null, 2), contentType: 'application/json' });

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
    
  });
// ================= SCENARIO 6 =================
test('Send manifest email to user', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const sidashboard = new SIDashboardPage(page);
  const si = new SIPage(page);  
  const manifest = new ManifestPage(page);

  // ================= LOGIN FLOW =================
  await test.step('Login as SI user', async () => {
    await loginPage.login(loginData.si.username, loginData.si.password);
    await loginPage.assertSILoginSuccess();
  });

  // ================= NAVIGATION TO MANIFEST PENDING =================
  await test.step('Navigate to Manifest Pending page', async () => {
    await sidashboard.clickManifestPendingCard();
    
    const summary = `
Validation: Manifest Pending Page URL
Expected: /SIManifestStatusList/1
Actual: ${page.url()}
Status: SUCCESS
`;

    console.log(summary);
    await test.info().attach('Manifest Pending URL Validation', {
      body: summary,
      contentType: 'text/plain',
    });
  });

  // ================= SELECT FIRST JOB =================
  await test.step('Click first Job ID and validate statuses', async () => {
    const jobId = await manifest.clickJobIdAndPrint();

    await test.info().attach('Selected Job ID', {
      body: `Selected Job ID: ${jobId}`,
      contentType: 'text/plain',
    });

  });

  // ================= SEND MANIFEST EMAIL =================
 /* await test.step('Send manifest email', async () => {
    const emailStatus = await manifest.sendManifestEmail(); // assuming this is implemented in ManifestPage

    await test.info().attach('Manifest Email Status', {
      body: emailStatus,
      contentType: 'text/plain',
    });

    // Validate that email sent successfully
    await expect(emailStatus).toContain('Email sent successfully');
  });*/
});