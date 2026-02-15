import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
export class CROPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------

  get menuIcon(): Locator {
    return this.page.locator('button.mud-icon-button');
  }

  get leftDrawerOpen(): Locator {
    return this.page.locator('aside.mud-drawer--open');
  }

  get exportMenu(): Locator {
    return this.page
      .locator(
        'aside.mud-drawer--open nav[aria-label="Export"] button[aria-label="Toggle Export"]'
      )
      .nth(1);
  }

  get croMenu(): Locator {
    return this.page.locator('a[href="/cros"]');
  }

  get newButton(): Locator {
  return this.page.getByRole('button', { name: 'New' });
}

get newCROText(): Locator {
  return this.page.getByText('New CRO', { exact: true });
}

get shipLineInput(): Locator {
  return this.page.getByPlaceholder('Choose a Ship Line');
}

get shipLineListbox(): Locator {
  return this.page.locator('[role="listbox"]');
}

get shipLineOption(): Locator {
  return this.page.locator('[role="option"]');
}

get bookingNumberInput(): Locator {
  return this.page.getByLabel('Booking Number');
}

get portOfLoadingInput(): Locator {
  return this.page.getByPlaceholder('Choose a Port').first();
}

get portOfDischargeInput(): Locator {
  return this.page.getByPlaceholder('Choose a Port').nth(1);
}

get vesselInput(): Locator {
  return this.page.getByPlaceholder('Choose a Vessel');
}

get etaDateInput(): Locator {
  return this.page.locator('#txtETADate');
}

get containerTypeInput(): Locator {
  return this.page.getByPlaceholder('Choose a Container Type');
}

get quantityInput(): Locator {
  return this.page.locator('#txtQuantity');
}

get remarksTextarea(): Locator {
  return this.page.getByLabel('Remarks');
}

get addContainerButton(): Locator {
  return this.page.locator(
    '.col-lg-2 > button:has(span.k-i-plus)'
  );
}



get etaCalendarButton(): Locator {
  return this.etaInput
    .locator('xpath=ancestor::span[contains(@class,"k-datepicker")]')
    .locator('button[aria-label="Open"]');
}

get todayDateCell(): Locator {
  return this.page.locator(
    'td.k-today[aria-disabled="false"]'
  );
}
get etaInput(): Locator {
  return this.page.getByLabel('ETA', { exact: true });
}


get emptyPickupDepotInput(): Locator {
  return this.page
    .locator('div.col-lg-3', {
      has: this.page.locator('label', { hasText: 'Empty Pickup Depot' }),
    })
    .locator('input#CROStatuslookup');
}



get commercialInput(): Locator {
  return this.page.getByPlaceholder('Select a User');
}
get finalDestinationInput(): Locator {
  return this.page.getByLabel('Final Destination');
}

get cutOffInput(): Locator {
  return this.page.getByLabel(/Cut Off/i);
}
get containerGridRows(): Locator {
  return this.page.locator(
    '.telerik-blazor.k-grid tbody tr.k-master-row'
  );
}

get paymentDocUploadInput(): Locator {
  return this.page.locator('#filePaymentDoc');
}
get uploadedFileText(): Locator {
  return this.page.locator('span', { hasText: 'File :' });
}

get saveChangesButton(): Locator {
  return this.page.getByRole('button', { name: 'Save Changes' });
}
get bookingGridRow(): Locator {
  return this.page.locator(
    '.telerik-blazor.k-grid tbody tr.k-master-row'
  ).first();
}

get bookingNumberCell() {
  return this.bookingGridRow.locator('td[data-col-index="0"] .mud-nav-link-text');
}

get releaseNumberCell() {
  return this.bookingGridRow.locator('td[data-col-index="1"]');
}

get containerQtyCell() {
  return this.bookingGridRow.locator('td[data-col-index="3"]');
}

get polCell() {
  return this.bookingGridRow.locator('td[data-col-index="4"]');
}

get podCell() {
  return this.bookingGridRow.locator('td[data-col-index="5"]');
}

get etaDateCell() {
  return this.bookingGridRow.locator('td[data-col-index="6"]');
}

get validatyDateCell() {
  return this.bookingGridRow.locator('td[data-col-index="7"]');
}

get createdDateCell() {
  return this.bookingGridRow.locator('td[data-col-index="8"]');
}

get createdByCell() {
  return this.bookingGridRow.locator('td[data-col-index="9"]');
}

get statusCell() {
  return this.bookingGridRow.locator('td[data-col-index="10"]');
}
get duplicateCROErrorMessage() {
  return this.page.locator(
    'div.k-dialog-content:has-text("CRO with same Booking No already exists")'
  );
}

get dialogMessage() {
  return this.page.locator(
    '.k-window.k-dialog .k-dialog-title'
  );
}
get dialogTitle() {
  return this.page.locator('.k-window.k-dialog:visible .k-dialog-title');
}

get dialogOkButton() {
  return this.page.locator('.k-window.k-dialog:visible button:has-text("OK")');
}



  // ---------- Actions ----------

  async openLeftMenu() {

  // If menu already open → skip
  if (await this.exportMenu.isVisible()) return;

  await this.menuIcon.click();

  // Wait until menu becomes visible
  await expect(this.exportMenu).toBeVisible({ timeout: 10000 });
}

  async openExportMenu() {
    await expect(this.exportMenu)
      .toBeVisible({ timeout: 10000 });

    await this.exportMenu.click();

    await expect(
      this.croMenu,
      'CRO menu should be visible after opening Export'
    ).toBeVisible({ timeout: 10000 });
  }

  async clickCRO() {
    await this.croMenu.click();
  }

  // ---------- Convenience ----------

  

async openExportAndClickCRO() {
 // await this.openLeftMenu();
  await this.openExportMenu();
  await this.clickCRO();

  // Wait for CRO list page to be stable
  await this.waitForCROListPageReady();
}
async waitForCROListPageReady() {
  // Grid loaded (prevents row auto-click issues)
  await this.page.getByRole('grid').waitFor({ state: 'visible' });

  // Toolbar ready
  await expect(this.newButton).toBeVisible({ timeout: 10000 });
  await expect(this.newButton).toBeEnabled();

  // Kill any auto-focus on grid rows
  await this.page.keyboard.press('Escape');
}


async clickNewAndVerifyNewCRO() {
  await expect(this.newButton).toBeVisible({ timeout: 10000 });

  await this.newButton.click();

  await expect(this.newCROText)
    .toBeVisible({ timeout: 10000 });

  await this.bookingNumberInput.click();
}


async selectShipLine(shipLine: string) {
  await this.shipLineInput.click();
  await this.shipLineInput.fill(shipLine);

  // wait for suggestion list
  await expect(this.shipLineListbox)
    .toBeVisible({ timeout: 10000 });

 
  await this.shipLineOption
    .filter({ hasText: shipLine })
    .first()
    .click();
}

async enterBookingNumber(value: string) {
  await this.bookingNumberInput.fill(value);
}

async enterQuantity(value: number) {
  await this.quantityInput.fill(String(value));
}
async enterRemarks(text: string) {
  await this.remarksTextarea.fill(text);
}

async selectFromAutoSuggest(input: Locator, value: string) {
  await input.fill(value);
  await this.page.waitForTimeout(300); // allow list to render
  await input.press('ArrowDown');
  await input.press('Enter');
}

async selectShippingAndPorts(
  shipLine: string,
  portOfLoading: string,
  portOfDischarge: string
) {
  await this.selectFromAutoSuggest(this.shipLineInput, shipLine);
  await this.selectFromAutoSuggest(this.portOfLoadingInput, portOfLoading);
  await this.selectFromAutoSuggest(this.portOfDischargeInput, portOfDischarge);
}

async selectContainerAndVessel(
  containerType: string,
  vessel: string
) {
  await this.selectFromAutoSuggest(this.containerTypeInput, containerType);
  await this.selectFromAutoSuggest(this.vesselInput, vessel);
}


async validateValues(
  shipLine: string,
  pol: string,
  pod: string,
  quantity: number
) {
  await expect(this.shipLineInput).toHaveValue(new RegExp(shipLine, 'i'));
  await expect(this.portOfLoadingInput).toHaveValue(new RegExp(pol, 'i'));
  await expect(this.portOfDischargeInput).toHaveValue(new RegExp(pod, 'i'));
  await expect(this.quantityInput).toHaveValue(quantity.toString());
}
async enterETA(): Promise<string> {
 
  await this.page.locator('.k-overlay').waitFor({ state: 'detached' });

  
  await this.etaCalendarButton.click();


  await expect(this.todayDateCell).toBeVisible();
  await this.todayDateCell.click();

  // close the picker
  await this.page.keyboard.press('Escape');

  // wait until value is NOT the format mask
  await this.page.waitForFunction(() => {
    const el = document.querySelector('#txtETADate') as HTMLInputElement;
    return el && el.value !== 'dd/MM/yyyy' && el.value !== '';
  });

  const etaValue = await this.etaInput.inputValue();
  console.log('Selected ETA date:', etaValue);

  return etaValue;
}



async enterCutOffDate(date: string) {
  await this.cutOffInput.click();
  await this.cutOffInput.fill(date);
  await this.cutOffInput.press('Enter');
}
async selectCommercial
(commercial: string) {
  await this.selectFromAutoSuggest(this.commercialInput, commercial);
}

async selectEmptyPickupDepot(depot: string) {
  await this.selectFromAutoSuggest(this.emptyPickupDepotInput, depot);
}
async clickAddContainerButton() {
  await this.addContainerButton.click();
}
async addContainer(
  containerType: string,
  quantity: string
) {
  await this.selectFromAutoSuggest(this.containerTypeInput, containerType);
  await this.quantityInput.fill(quantity);
  await this.clickAddContainerButton();
}
async enterFinalDestination(destination: string) {
  await this.finalDestinationInput.fill(destination);
}
getTodayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}
async verifyAndPrintContainerGridRow(): Promise<string> {
  await expect(this.containerGridRows.first()).toBeVisible();

  const rowText = await this.containerGridRows.first().innerText();
  console.log('Grid row text:', rowText);

  return rowText;
}


async uploadPaymentDocument(relativePath: string): Promise<string> {
  const filePath = path.join(process.cwd(), relativePath);

  // Safety check
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  await this.paymentDocUploadInput.setInputFiles(filePath);

  await expect(this.uploadedFileText).toBeVisible({ timeout: 60000 });

  const fileText = (await this.uploadedFileText.innerText()).trim();
  const fileName = fileText.replace('File :', '').trim();

  console.log('Uploaded filename:', fileName);
  return fileName;
}
async clickSaveChanges() {

  await this.page.locator('.k-overlay').waitFor({ state: 'detached' });

  await expect(this.saveChangesButton).toBeVisible();
  await expect(this.saveChangesButton).toBeEnabled();


  await this.saveChangesButton.click();
}
normalizeDate(dateStr: string): string {
  const value = dateStr.trim();

  const monthMap: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12',
  };

  // Case 1: Already numeric without separators → DDMMYYYY
  if (/^\d{8}$/.test(value)) {
    const day = value.substring(0, 2);
    const month = value.substring(2, 4);
    const year = value.substring(4, 8);
    return `${year}${month}${day}`;
  }

  // Case 2: 07/Feb/26 or 07-Feb-26
  const alphaMatch = value.match(/(\d{1,2})[\/\-](\w{3})[\/\-](\d{2,4})/i);
  if (alphaMatch) {
    const day = alphaMatch[1].padStart(2, '0');
    const month = monthMap[alphaMatch[2].toLowerCase()];
    const year =
      alphaMatch[3].length === 2 ? `20${alphaMatch[3]}` : alphaMatch[3];
    return `${year}${month}${day}`;
  }

  //  Case 3: 07/02/26 or 7/2/2026
  const numericMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (numericMatch) {
    const day = numericMatch[1].padStart(2, '0');
    const month = numericMatch[2].padStart(2, '0');
    const year =
      numericMatch[3].length === 2 ? `20${numericMatch[3]}` : numericMatch[3];
    return `${year}${month}${day}`;
  }

  throw new Error(`Unsupported date format: ${dateStr}`);
}



async verifyAndPrintBookingRow(expected: {
  quantity: number;
  pol: string;
  pod: string;
  etaDate: string;
  createdBy: string;
})
 {
  await expect(this.bookingGridRow).toBeVisible();

  const bookingNo = await this.bookingNumberCell.innerText();
  const releaseNo = await this.releaseNumberCell.innerText();
  const qty = await this.containerQtyCell.innerText();
  const pol = await this.polCell.innerText();
  const pod = await this.podCell.innerText();
  const eta = await this.etaDateCell.innerText();
   const validity = await this.validatyDateCell.innerText();
  const createdDate = await this.createdDateCell.innerText();
  const createdBy = await this.createdByCell.innerText();
  const status = await this.statusCell.innerText();

  //  Assertions
  expect(bookingNo).not.toBe('');
  expect(releaseNo.trim()).not.toBe('');
  expect(qty).toContain(String(expected.quantity));
  expect(pol.toUpperCase()).toContain(expected.pol.toUpperCase());
  expect(pod.toUpperCase()).toContain(expected.pod.toUpperCase());
 
  expect(this.normalizeDate(eta))
  .toBe(this.normalizeDate(expected.etaDate));

  expect(createdBy).not.toBe('');
  expect(validity).not.toBe('');
  expect(status.trim()).toBe('Buffer');
  expect(createdDate.trim()).not.toBe('');

  //  Print for report
  const reportText = `
Booking No   : ${bookingNo}
//Release No   : ${releaseNo}
Quantity     : ${qty}
POL          : ${pol}
POD          : ${pod}
ETA          : ${eta}
Validity     : ${validity}
Created Date : ${createdDate}
Created By   : ${createdBy}
Status       : ${status}
`;

  console.log(reportText);
  return reportText;
}

async waitForBookingListingPage() {
  // wait for overlay to disappear
  await this.page.locator('.k-overlay').waitFor({ state: 'detached' });


  await expect(
    this.page.locator('.telerik-blazor.k-grid tbody tr.k-master-row')
  ).toBeVisible({ timeout: 60000 });
}

async getDialogMessageText() {
  return await this.dialogMessage.innerText();
}
async handleAnyPopup() {

  if (await this.dialogTitle.isVisible({ timeout: 5000 })) {

    const message = await this.dialogTitle.innerText();

    console.log('Popup Message:', message);

   

    await this.dialogOkButton.click();
  }
}
async verifyBookingPage() {
  await expect(this.newButton).toBeVisible({ timeout: 10000 });

  await this.newButton.click();

  await expect(this.newCROText)
    .toBeVisible({ timeout: 10000 });

  await this.bookingNumberInput.click();
}
}
