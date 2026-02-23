import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';
import { SIDashboardPage } from '../../pages/ui/siDashboard.page';
import { SIPage } from '../../pages/ui/si.page';
import { JobPage } from '../../pages/ui/job.page';

test.describe('Job Operation Scenarios', () => {

  test('Validate Assign SI and Status change from Requested to Inprogress details', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidashboard = new SIDashboardPage(page);
    const si = new SIPage(page);
    const job = new JobPage(page);
   

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
    await test.step('Navigate to SI Requested page', async () => {

      await test.step('Open Dashboard and click SI Requested', async () => {
        await sidashboard.openSIRequested();
      
        const summary = `
Validation: SI Requested Page URL
Expected: /ShippingInstructionList/1
Actual: ${page.url()}
Status: SUCCESS
`;

        console.log(summary);

        await test.info().attach('SI Requested URL Validation', {
          body: summary,
          contentType: 'text/plain',
        });

      });

    });
 // ================= select checkbox =================
  await test.step('Click first row checkbox and print row details',
  async () => {

    const rowData =
      await si.clickCheckboxAndPrintRowDetails();

    await test.info().attach('Row Details', {
      body: JSON.stringify(rowData, null, 2),
      contentType: 'application/json',
    });

  }
);
await test.step('Click first row Job ID and print Job ID',
  async () => {

    const jobId = await si.clickJobIdAndPrint();

    await test.info().attach('Selected Job ID', {
      body: `Selected Job ID: ${jobId}`,
      contentType: 'text/plain',
    });

  }
);

    await test.step('Validate Job Details and Status',
  async () => {

    const jobDetails = await si.getAndValidateJobDetails();

    await test.info().attach('Job Details', {
      body: JSON.stringify(jobDetails, null, 2),
      contentType: 'application/json',
    });

  }
);
/*await test.step(
  'Validate Shipping Application Status',
  async () => {

    const data = await si.validateShippingApplicationSection();

    await test.info().attach('Shipping Application Details', {
      body: JSON.stringify(data, null, 2),
      contentType: 'application/json',

  });
      });
await test.step('View and Close Document',
  async () => {

    const documentData = await si.viewAndCloseDocument();

    await test.info().attach('Document Details', {
      body: JSON.stringify(documentData, null, 2),
      contentType: 'application/json',
    });

  }
);
await test.step('Upload Remark Document and Validate Save',
  async () => {

    const remarkData =
      await si.uploadRemarkAndSave('utils/2576.jpg');

    await test.info().attach('Remark Details', {
      body: JSON.stringify(remarkData, null, 2),
      contentType: 'application/json',
    });

  }
);
await test.step(
  'Validate First Container Type Matches Header',
  async () => {

    const data = await si.validateFirstContainerType();

    await test.info().attach('Container Validation', {
      body: JSON.stringify(data, null, 2),
      contentType: 'application/json',
    });

  }
);*/
await test.step(
  'Process SR Requested Full Flow',
  async () => {

    const srDetails =
      await si.processSRRequestedDetails('utils/2576.jpg');

    await test.info().attach('SR Requested Details', {
      body: JSON.stringify(srDetails, null, 2),
      contentType: 'application/json',
    });

  }
);
await test.step('Assign user and click Update', async () => {

  await si.assignUserAndUpdate('Salman');

  await test.info().attach('Assign User Action', {
    body: 'User selected and Update clicked successfully',
    contentType: 'text/plain',
  });

});   
 });


 //----------------------------------------


 test.only('Validate Assigned SI and Status change from SI Inprogress to SI Submmitted ', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidashboard = new SIDashboardPage(page);
    const si = new SIPage(page);
    const job = new JobPage(page);
   

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
    await test.step('Navigate to SI Requested page', async () => {

      await test.step('Open Dashboard and click SI Requested', async () => {
        await sidashboard.openSIInprogress();
      
        const summary = `
Validation: SI Requested Page URL
Expected: /ShippingInstructionList/2
Actual: ${page.url()}
Status: SUCCESS
`;

        console.log(summary);

        await test.info().attach('SI Inprogress URL Validation', {
          body: summary,
          contentType: 'text/plain',
        });

      });

    });
 // ================= select checkbox =================
  await test.step('Click first row checkbox and print row details',
  async () => {

    const rowData =
      await si.clickCheckboxAndPrintRowDetails();

    await test.info().attach('Row Details', {
      body: JSON.stringify(rowData, null, 2),
      contentType: 'application/json',
    });

  }
);
await test.step('Validate and print assignee ', async () => {

  const assignee =
    await si.validateAndPrintAssignee();

  await test.info().attach('Assignee Details', {
    body: JSON.stringify({ assignee }, null, 2),
    contentType: 'application/json',
  });

});
await test.step('Click first row Job ID and print Job ID',
  async () => {

    const jobId = await si.clickJobIdAndPrint();

    await test.info().attach('Selected Job ID', {
      body: `Selected Job ID: ${jobId}`,
      contentType: 'text/plain',
    });

  }
);

    await test.step('Validate Job Details and Status',
  async () => {

    const jobDetails = await si.getSIInprogressJobDetails();

    await test.info().attach('Job Details', {
      body: JSON.stringify(jobDetails, null, 2),
      contentType: 'application/json',
    });

  }
);

await test.step(
  'Process SI Inprogress Full Flow',
  async () => {

    const srDetails =
      await si.acknowledgeSIInprogressDetails('utils/acknowledgementSlip_S1372614554940.pdf');

    await test.info().attach('SI Inprogress Details', {
      body: JSON.stringify(srDetails, null, 2),
      contentType: 'application/json',
    });

  }
);
  

 });



  });