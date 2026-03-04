import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';
import { SIDashboardPage } from '../../pages/ui/siDashboard.page';
import { SIPage } from '../../pages/ui/si.page';
import { ManifestPage } from '../../pages/ui/maifest.page';

test.describe('Manifest Scenarios', () => {

  test('Send requested manifest  email to user', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidashboard = new SIDashboardPage(page);
    const si = new SIPage(page);  
     const manifest = new ManifestPage(page);
   

    // ================= LOGIN FLOW =================
    await test.step('Login flow', async () => {

      await test.step('Login with valid user', async () => {

        await loginPage.login(
          loginData.si.username,
          loginData.si.password
        );

        await loginPage.assertSILoginSuccess();
      });

    });

    // ================= NAVIGATION FLOW =================
    await test.step('Navigate to  Manifest pendingpage', async () => {

      await test.step('Open Dashboard and click Manifest pending', async () => {
        await sidashboard.clickManifestPendingCard();
      
        const summary = `
Validation: Manifest pending Page URL
Expected: /SIManifestStatusList/1
Actual: ${page.url()}
Status: SUCCESS
`;

        console.log(summary);

        await test.info().attach(' Manifest pending URL Validation', {
          body: summary,
          contentType: 'text/plain',
        });

      });

    });
 // ================= select job =================
 
await test.step('Click first row Job ID and validate statuses', async () => {

  // Click the first Job ID and get its value
  const jobId = await manifest.clickJobIdAndPrint();

  // Attach the selected Job ID to the report
  await test.info().attach('Selected Job ID', {
    body: `Selected Job ID: ${jobId}`,
    contentType: 'text/plain',
  });

  // Get current statuses for the selected job
 const statusData = await manifest.getShippingAndManifestStatuses();

await expect(statusData['Shipping Application Status']).toBe('Approved');
await expect(statusData['Manifest Status']).toBe('Pending');


await test.info().attach('Status Details', {
  body: JSON.stringify(statusData, null, 2),
  contentType: 'application/json',
});
});

await test.step('Click Compose Manifest Follow-Up Email', async () => {

  await manifest.clickComposeManifestFollowUp();

  // Validate popup
  await expect(manifest.emailPopupTitle).toBeVisible();
  await expect(manifest.emailPopupTitle).toHaveText(/^\s*Email\s*$/);
  await manifest.removeEmail('SAU-ex-cs.localwest@msc.com');
await manifest.removeEmail('m.salman@bafcointl.com');
await manifest.removeEmail('sateam@bafcointl.com');

  await test.info().attach('Email Popup Opened', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });

});

await test.step('Enter To and CC Emails', async () => {

  const toEmail = 'sameer@bafcointl.com';
  const ccEmail = 'azharjaveedpz@gmail.com';

  await manifest.enterToAndCcEmails(toEmail, ccEmail);

  // Attach entered emails to report
  await test.info().attach('Entered Emails', {
    body: JSON.stringify(
      {
        To: toEmail,
        CC: ccEmail,
      },
      null,
      2
    ),
    contentType: 'application/json',
  });

});
await test.step('Validate Job ID with Subject', async () => {

  const validationData = await manifest.validateJobIdWithSubject();

  await test.info().attach('Job Validation', {
    body: JSON.stringify(validationData, null, 2),
    contentType: 'application/json',
  });

});

await test.step('Click Send Email button', async () => {
  await manifest.clickSendEmail();
});

await test.step('Validate Email Sent Success Popup', async () => {

  const message = await manifest.confirmEmailSent();

  await expect(message).toContain('Mail Sent');

  await test.info().attach('Email Success Message', {
    body: message,
    contentType: 'text/plain',
  });

});
 });



 });

  
