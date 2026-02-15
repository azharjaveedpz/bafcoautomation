import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { CROPage } from '../../pages/ui/cro.page';
import { loginData } from '../../data/ui/login.data';
import { DashboardPage } from '../../pages/ui/dashboard.page';
import { BookingPage } from '../../pages/ui/booking.page';
import { SoPage } from '../../pages/ui/so.page';

test.describe('Export -CRO & SRO Scenarios', () => {

  test('Create CRO successfully and verify status changes to Buffer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const croPage = new CROPage(page);
      const dashboard = new DashboardPage(page);


    // ---------------- UTILITIES ----------------
    function generateBookingNumber(): string {
      const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      return `BK${timestamp}${letters}`;
    }

    function generateRemarks(): string {
      const words = [
        'Automation',
        'CRO',
        'Booking',
        'Validation',
        'Regression',
        'Smoke',
        'Playwright'
      ];
      return `Automation test ${words[Math.floor(Math.random() * words.length)]}`;
    }

    // ---------------- TEST DATA ----------------
    const croTestData = {
      bookingNumber: generateBookingNumber(),
      shippingLine: 'MSC',
      pol: 'JEDDAH',
      pod: 'ROTTERDAM',
      containerType: 'M',
      vessel: 'MSC',
      quantity: 4,
      commercial: 'SAFDARALI',
      emptyPickupDepot: 'Jeddah',
      finalDestination: 'Chennai',
      remarks: generateRemarks(),
    };

    let todayETA: string;

    // ================= LOGIN FLOW =================
    await test.step('Login flow', async () => {
      await test.step('Login with valid user', async () => {
        await loginPage.login(
          loginData.booking.valid.username,
          loginData.booking.valid.password
        );
        await loginPage.assertLoginSuccess();
      });
    });

    // ================= NAVIGATION FLOW =================
    await test.step('Navigate to CRO creation screen', async () => {
      await test.step('Open Export → CRO', async () => {
           await dashboard.openLeftMenu();
        await croPage.openExportAndClickCRO();
      });

      await test.step('Click New CRO and verify form', async () => {
        await croPage.clickNewAndVerifyNewCRO();
      });
    });

    // ================= FORM FILL FLOW =================
    await test.step('Fill Create CRO form', async () => {

      await test.step('Enter booking and route details', async () => {
        await croPage.enterBookingNumber(croTestData.bookingNumber);
        await croPage.selectShippingAndPorts(
          croTestData.shippingLine,
          croTestData.pol,
          croTestData.pod
        );
      });

      await test.step('Enter container and vessel details', async () => {
        await croPage.selectFromAutoSuggest(
          croPage.containerTypeInput,
          croTestData.containerType
        );
        await croPage.selectFromAutoSuggest(
          croPage.vesselInput,
          croTestData.vessel
        );
        await croPage.enterQuantity(croTestData.quantity);
      });

      await test.step('Enter commercial and logistics details', async () => {
        await croPage.selectFromAutoSuggest(
          croPage.commercialInput,
          croTestData.commercial
        );
        await croPage.selectFromAutoSuggest(
          croPage.emptyPickupDepotInput,
          croTestData.emptyPickupDepot
        );
        await croPage.enterFinalDestination(croTestData.finalDestination);
      });

      await test.step('Enter ETA and remarks', async () => {
        todayETA = croPage.getTodayDDMMYYYY();
        await croPage.enterETA();
        await croPage.enterRemarks(croTestData.remarks);
      });
    });

    // ================= INPUT SUMMARY =================
    await test.step('Attach CRO input summary', async () => {
      const summary = `
Booking Number: ${croTestData.bookingNumber}
Shipping Line : ${croTestData.shippingLine}
POL           : ${croTestData.pol}
POD           : ${croTestData.pod}
Commercial    : ${croTestData.commercial}
Empty Depot   : ${croTestData.emptyPickupDepot}
Final Dest    : ${croTestData.finalDestination}
ETA           : ${todayETA}
Quantity      : ${croTestData.quantity}
Remarks       : ${croTestData.remarks}
`;

      await test.info().attach('CRO Input Summary', {
        body: summary,
        contentType: 'text/plain',
      });
    });

    // ================= CONTAINER FLOW =================
    await test.step('Manage container details', async () => {

      await test.step('Add container to grid', async () => {
        await croPage.clickAddContainerButton();
      });

      await test.step('Verify container added to grid', async () => {
        await expect(croPage.containerGridRows).toHaveCount(1);

        const gridText = await croPage.verifyAndPrintContainerGridRow();
        expect(gridText).toContain(String(croTestData.quantity));

        await test.info().attach('Container Grid Evidence', {
          body: gridText,
          contentType: 'text/plain',
        });
      });
    });

    // ================= DOCUMENT UPLOAD =================
    await test.step('Upload payment document', async () => {
      const uploadedFileName = await croPage.uploadPaymentDocument(
        'utils/acknowledgementSlip_S1372614554940.pdf'
      );

      await test.info().attach('Uploaded Payment File', {
        body: uploadedFileName,
        contentType: 'text/plain',
      });
    });

    // ================= SAVE & VERIFY =================
    await test.step('Save CRO and verify booking listing', async () => {

      await test.step('Save booking', async () => {
        await croPage.clickSaveChanges();
        await croPage.waitForBookingListingPage();
      });

      await test.step('Verify booking appears in grid', async () => {
        const bookingDetails = await croPage.verifyAndPrintBookingRow({
          quantity: croTestData.quantity,
          pol: croTestData.pol,
          pod: croTestData.pod,
          etaDate: todayETA,
          createdBy: 'Commercial',
        });

        await test.info().attach('Booking Grid Details', {
          body: bookingDetails,
          contentType: 'text/plain',
        });
      });
    });

  });

  ////////////////////////////////////////////////////////////////////////////////////
  test('Prevent duplicate CRO creation when Booking Number already exists', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const croPage = new CROPage(page);

    // ---------------- UTILITIES ----------------
    function generateBookingNumber(): string {
      const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      return `BK${timestamp}${letters}`;
    }

    function generateRemarks(): string {
      const words = [
        'Automation',
        'CRO',
        'Booking',
        'Validation',
        'Regression',
        'Smoke',
        'Playwright'
      ];
      return `Automation test ${words[Math.floor(Math.random() * words.length)]}`;
    }

    // ---------------- TEST DATA ----------------
    const croTestData = {
      bookingNumber: "BK595806FN1",
      shippingLine: 'ACE',
      pol: 'Mumbai',
      pod: 'Dubai',
      containerType: 'M',
      vessel: 'MSC',
      quantity: 4,
      commercial: 'Az',
      emptyPickupDepot: 'Jeddah',
      finalDestination: 'Chennai',
      remarks: generateRemarks(),
    };

    let todayETA: string;

    // ================= LOGIN FLOW =================
    await test.step('Login flow', async () => {
      await test.step('Login with valid user', async () => {
        await loginPage.login(
          loginData.booking.valid.username,
          loginData.booking.valid.password
        );
        await loginPage.assertLoginSuccess();
      });
    });

    // ================= NAVIGATION FLOW =================
    await test.step('Navigate to CRO creation screen', async () => {
      await test.step('Open Export → CRO', async () => {
        await croPage.openExportAndClickCRO();
      });

      await test.step('Click New CRO and verify form', async () => {
        await croPage.clickNewAndVerifyNewCRO();
      });
    });

    // ================= FORM FILL FLOW =================
    await test.step('Fill Create CRO form', async () => {

      await test.step('Enter booking and route details', async () => {
        await croPage.enterBookingNumber(croTestData.bookingNumber);
        await croPage.selectShippingAndPorts(
          croTestData.shippingLine,
          croTestData.pol,
          croTestData.pod
        );
      });
 // ================= DOCUMENT UPLOAD =================

    await test.step('Upload payment document', async () => {
      const uploadedFileName = await croPage.uploadPaymentDocument(
        'utils/acknowledgementSlip_S1372614554940.pdf'
      );

      await test.info().attach('Uploaded Payment File', {
        body: uploadedFileName,
        contentType: 'text/plain',
      });
    });
      await test.step('Enter container and vessel details', async () => {
        await croPage.selectFromAutoSuggest(
          croPage.containerTypeInput,
          croTestData.containerType
        );
        await croPage.selectFromAutoSuggest(
          croPage.vesselInput,
          croTestData.vessel
        );
        await croPage.enterQuantity(croTestData.quantity);
      });

      await test.step('Enter commercial and logistics details', async () => {
        await croPage.selectFromAutoSuggest(
          croPage.commercialInput,
          croTestData.commercial
        );
        await croPage.selectFromAutoSuggest(
          croPage.emptyPickupDepotInput,
          croTestData.emptyPickupDepot
        );
        await croPage.enterFinalDestination(croTestData.finalDestination);
      });

      await test.step('Enter ETA and remarks', async () => {
        todayETA = croPage.getTodayDDMMYYYY();
        await croPage.enterETA();
        await croPage.enterRemarks(croTestData.remarks);
      });
    });

    // ================= INPUT SUMMARY =================
    await test.step('Attach CRO input summary', async () => {
      const summary = `
Booking Number: ${croTestData.bookingNumber}
Shipping Line : ${croTestData.shippingLine}
POL           : ${croTestData.pol}
POD           : ${croTestData.pod}
Commercial    : ${croTestData.commercial}
Empty Depot   : ${croTestData.emptyPickupDepot}
Final Dest    : ${croTestData.finalDestination}
ETA           : ${todayETA}
Quantity      : ${croTestData.quantity}
Remarks       : ${croTestData.remarks}
`;

      await test.info().attach('CRO Input Summary', {
        body: summary,
        contentType: 'text/plain',
      });
    });
   

    // ================= CONTAINER FLOW =================
    await test.step('Manage container details', async () => {

      await test.step('Add container to grid', async () => {
        await croPage.clickAddContainerButton();
      });

      await test.step('Verify container added to grid', async () => {
        await expect(croPage.containerGridRows).toHaveCount(1);

        const gridText = await croPage.verifyAndPrintContainerGridRow();
        expect(gridText).toContain(String(croTestData.quantity));

        await test.info().attach('Container Grid Evidence', {
          body: gridText,
          contentType: 'text/plain',
        });
      });
    });

    

    // ================= SAVE & VERIFY =================
 await test.step('Save CRO', async () => {
  await croPage.clickSaveChanges();
});

await test.step('Handle popup if shown', async () => {
  await croPage.handleAnyPopup();
});

});

//////////////////////////////////////////////////////////////
test('Mappig CRO successfully to SO and verify status changes to CRO received', async ({ page }) => {

  const loginPage = new LoginPage(page);
    const croPage = new CROPage(page);
    const dashboard = new DashboardPage(page);
     const bookingpage = new BookingPage(page);
      const sopage = new SoPage(page);

 // ================= LOGIN FLOW =================
    await test.step('Login flow', async () => {
      await test.step('Login with valid user', async () => {
        await loginPage.login(
          loginData.booking.valid.username,
          loginData.booking.valid.password
        );
        await loginPage.assertLoginSuccess();
      });
    });


 // ================= NAVIGATION FLOW =================
    await test.step('Navigate to Bookig  screen', async () => {
      await test.step('Open Dashboard → Bookig', async () => {
         await dashboard.openLeftMenu();
          await dashboard.openDashboardMenu();
        await dashboard.openDashboardAndClickBooking();
      })

       // ================= Booking page  verification =================
     await test.step('Verify user is on Booking Dashboard page', async () => {

  await bookingpage.verifyBookingPageNavigation();

  const gridText =
    await bookingpage.bookingPageTitle.textContent();

  await test.info().attach('Container Grid Evidence', {
    body: gridText ?? '',
    contentType: 'text/plain',
  });

});
// ================= NAVIGATION FLOW =================
await test.step('Navigate to SO Received screen', async () => {

  await test.step('Click SO Received card', async () => {
    await bookingpage.clickSOReceived();
  });

});

await test.step('Verify user landed on SO Received page', async () => {

  const pageTitle =
    await sopage.verifySOReceivedPageNavigation();

  await test.info().attach('SO Received Page Evidence', {
    body: pageTitle ?? '',
    contentType: 'text/plain',
  });

});

await test.step('Click first Service Order', async () => {

  const soNumber = await sopage.clickFirstSO();

  await test.info().attach('Clicked Service Order', {
    body: `Clicked SO Number: ${soNumber}`,
    contentType: 'text/plain',
  });

});
await test.step('Print SO Received Details', async () => {

  const details = await sopage.printAllSODetails();

  await test.info().attach('SO Details', {
    body: details,
    contentType: 'text/plain'
  });

});


await test.step('Print Form Values', async () => {

  const details = await sopage.printAllFormValues();

  await test.info().attach('Form Values', {
    body: details,
    contentType: 'text/plain'
  });

});




    });



await test.step('Click Edit SO record', async () => {

  await expect(sopage.editButton).toBeVisible();

  await sopage.clickEditButton();

  console.log('Edit SO record button clicked');

});


await test.step('Select CRO status as Received', async () => {
  await sopage.selectCROStatusReceived();
});

await test.step('Select Link Buffer CRO number', async () => {
  await sopage.selectFirstCRONumber();
});


await test.step('Click Update CRO Status button', async () => {
  await sopage.clickUpdateCROStatus();
});
await test.step('Verify popup and customer name', async () => {

  const details = await sopage.verifyPopupAndCustomerName();

  await test.info().attach('Form Values', {
    body: details,
    contentType: 'text/plain'
  });

});

await test.step('Click Save Job button', async () => {

  await sopage.clickSaveJob();

});

await test.step('Verify Email Sent popup and click OK', async () => {

  const message = await sopage.verifyEmailSentPopupAndClickOK();

  await test.info().attach('Email Sent Popup', {
    body: message,
    contentType: 'text/plain'
  });

});
await test.step('Handle email result popup', async () => {

  const details = await sopage.handleEmailResultPopup();

  await test.info().attach('Email Result Popup', {
    body: details,
    contentType: 'text/plain'
  });

});




});
//------------------------------------------------------------------------------
test.only('Create CRO and map to SO - End to End Flow', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const croPage = new CROPage(page);
  const dashboard = new DashboardPage(page);
  const bookingpage = new BookingPage(page);
  const sopage = new SoPage(page);

  // ---------------- UTILITIES ----------------
  function generateBookingNumber(): string {
    const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `BK${timestamp}${letters}`;
  }

  function generateRemarks(): string {
    const words = [
      'Automation','CRO','Booking',
      'Validation','Regression','Smoke','Playwright'
    ];
    return `Automation test ${words[Math.floor(Math.random() * words.length)]}`;
  }

  // ---------------- TEST DATA ----------------
  const croTestData = {
    bookingNumber: generateBookingNumber(),
    shippingLine: 'MSC',
    pol: 'JEDDAH',
    pod: 'ROTTERDAM',
    containerType: 'M',
    vessel: 'MSC',
    quantity: 4,
    commercial: 'SAFDARALI',
    emptyPickupDepot: 'Jeddah',
    finalDestination: 'Chennai',
    remarks: generateRemarks(),
  };

  let todayETA: string;

  // ================= LOGIN =================
  await test.step('Login flow', async () => {
    await loginPage.login(
      loginData.booking.valid.username,
      loginData.booking.valid.password
    );
    await loginPage.assertLoginSuccess();
  });

  // ================= CREATE CRO =================
  await test.step('Navigate and create CRO', async () => {

    await dashboard.openLeftMenu();
    await croPage.openExportAndClickCRO();
    await croPage.clickNewAndVerifyNewCRO();

    await croPage.enterBookingNumber(croTestData.bookingNumber);

    await croPage.selectShippingAndPorts(
      croTestData.shippingLine,
      croTestData.pol,
      croTestData.pod
    );

    await croPage.selectFromAutoSuggest(
      croPage.containerTypeInput,
      croTestData.containerType
    );

    await croPage.selectFromAutoSuggest(
      croPage.vesselInput,
      croTestData.vessel
    );

    await croPage.enterQuantity(croTestData.quantity);

    await croPage.selectFromAutoSuggest(
      croPage.commercialInput,
      croTestData.commercial
    );

    await croPage.selectFromAutoSuggest(
      croPage.emptyPickupDepotInput,
      croTestData.emptyPickupDepot
    );

    await croPage.enterFinalDestination(croTestData.finalDestination);

    todayETA = croPage.getTodayDDMMYYYY();
    await croPage.enterETA();
    await croPage.enterRemarks(croTestData.remarks);

    await croPage.clickAddContainerButton();
    await expect(croPage.containerGridRows).toHaveCount(1);

    await croPage.uploadPaymentDocument(
      'utils/acknowledgementSlip_S1372614554940.pdf'
    );

    await croPage.clickSaveChanges();
    await croPage.waitForBookingListingPage();
  });

  // ================= NAVIGATION =================
  await test.step('Navigate to SO Received', async () => {

    await dashboard.openLeftMenu();
    await dashboard.openDashboardMenu();
    await dashboard.openDashboardAndClickBooking();

    await bookingpage.verifyBookingPageNavigation();
    await bookingpage.clickSOReceived();
    await sopage.verifySOReceivedPageNavigation();
  });

  // ================= OPEN SO =================
  await test.step('Open first Service Order', async () => {

    const soNumber = await sopage.clickFirstSO();

    await test.info().attach('Clicked SO', {
      body: `SO Number: ${soNumber}`,
      contentType: 'text/plain',
    });
  });

  // ================= EDIT + MAP CRO =================
  await test.step('Edit SO and map CRO', async () => {

    await expect(sopage.editButton).toBeVisible();
    await sopage.clickEditButton();

    await sopage.selectCROStatusReceived();
    await sopage.selectFirstCRONumber();
    await sopage.clickUpdateCROStatus();
  });

  // ================= POPUP VALIDATION =================
  await test.step('Verify popup and customer name', async () => {

    const details = await sopage.verifyPopupAndCustomerName();

    await test.info().attach('Popup Details', {
      body: details,
      contentType: 'text/plain',
    });
  });

  // ================= SAVE JOB =================
  await test.step('Click Save Job button', async () => {
    await sopage.clickSaveJob();
  });

  // ================= EMAIL POPUPS =================
  await test.step('Verify Email Sent popup and click OK', async () => {

    const message = await sopage.verifyEmailSentPopupAndClickOK();

    await test.info().attach('Email Sent Popup', {
      body: message,
      contentType: 'text/plain'
    });
  });

  await test.step('Handle email result popup', async () => {

    const details = await sopage.handleEmailResultPopup();

    await test.info().attach('Email Result Popup', {
      body: details,
      contentType: 'text/plain'
    });
  });

}); 





});
