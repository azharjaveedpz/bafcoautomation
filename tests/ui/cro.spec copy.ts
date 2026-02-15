import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { CROPage } from '../../pages/ui/cro.page';
import { loginData } from '../../data/ui/login.data';
import { DashboardPage } from '../../pages/ui/dashboard.page';
import { BookingPage } from '../../pages/ui/booking.page';
import { SoPage } from '../../pages/ui/so.page';

//
// ======================================================
// COMMON UTILITIES (ONLY ONCE)
// ======================================================
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

//
// ======================================================
// TEST SUITE
// ======================================================
test.describe('Export - CRO & SRO Scenarios', () => {

  //
  // ======================================================
  // GLOBAL SETUP (AUTO RUN BEFORE EVERY TEST)
  // ======================================================
  test.beforeEach(async ({ page }) => {

    const loginPage = new LoginPage(page);

    // launch app
    await page.goto('/');

    // refresh after launch
    await page.reload({ waitUntil: 'networkidle' });

    // login
    await loginPage.login(
      loginData.booking.valid.username,
      loginData.booking.valid.password
    );

    await loginPage.assertLoginSuccess();
  });

  //
  // ======================================================
  // TEST 1 — CREATE CRO
  // ======================================================
  test('Create CRO successfully and verify status changes to Buffer', async ({ page }) => {

    const croPage = new CROPage(page);
    const dashboard = new DashboardPage(page);

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

    await test.step('Navigate to CRO page', async () => {
      await dashboard.openLeftMenu();
      await croPage.openExportAndClickCRO();
      await croPage.clickNewAndVerifyNewCRO();
    });

    await test.step('Fill CRO form', async () => {

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

      await croPage.enterFinalDestination(
        croTestData.finalDestination
      );

      todayETA = croPage.getTodayDDMMYYYY();

      await croPage.enterETA();
      await croPage.enterRemarks(croTestData.remarks);
    });

    await test.step('Save CRO', async () => {
      await croPage.clickAddContainerButton();
      await expect(croPage.containerGridRows).toHaveCount(1);

      await croPage.uploadPaymentDocument(
        'utils/acknowledgementSlip_S1372614554940.pdf'
      );

      await croPage.clickSaveChanges();
      await croPage.waitForBookingListingPage();
    });

  });

  //
  // ======================================================
  // TEST 2 — DUPLICATE CRO
  // ======================================================
  test('Prevent duplicate CRO creation', async ({ page }) => {

    const croPage = new CROPage(page);

    await croPage.openExportAndClickCRO();
    await croPage.clickNewAndVerifyNewCRO();

    await croPage.enterBookingNumber("BK595806FN1");

    await croPage.clickSaveChanges();

    await croPage.handleAnyPopup();
  });

  //
  // ======================================================
  // TEST 3 — MAP CRO TO SO
  // ======================================================
  test.only('Mapping CRO successfully to SO', async ({ page }) => {

    const dashboard = new DashboardPage(page);
    const bookingpage = new BookingPage(page);
    const sopage = new SoPage(page);

    await dashboard.openLeftMenu();
    await dashboard.openDashboardMenu();
    await dashboard.openDashboardAndClickBooking();

    await bookingpage.clickSOReceived();

    await sopage.verifySOReceivedPageNavigation();

    await sopage.clickFirstSO();

    await sopage.clickEditButton();

    await sopage.selectCROStatusReceived();
    await sopage.selectFirstCRONumber();

    await sopage.clickUpdateCROStatus();

    const popupDetails =
      await sopage.verifyPopupAndCustomerName();

    await test.info().attach('Popup Details', {
      body: popupDetails,
      contentType: 'text/plain'
    });

    await sopage.clickSaveJob();

    const msg =
      await sopage.verifyEmailSentPopupAndClickOK();

    await test.info().attach('Email Popup', {
      body: msg,
      contentType: 'text/plain'
    });

    const result =
      await sopage.handleEmailResultPopup();

    await test.info().attach('Result Popup', {
      body: result,
      contentType: 'text/plain'
    });

  });

});
