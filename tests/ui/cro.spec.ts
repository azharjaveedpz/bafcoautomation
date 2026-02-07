import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { CROPage } from '../../pages/ui/cro.page';
import { loginData } from '../../data/ui/login.data';

test.describe('CRO Navigation Tests', () => {

  test('Create CRO and verify booking listing', async ({ page }) => {
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
      bookingNumber: generateBookingNumber(),
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

});
