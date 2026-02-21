import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
export class JobPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------

get firstJobRow(): Locator {
  return this.page
    .locator('tbody.k-table-tbody tr.k-table-row.k-master-row')
    .first();
}

get firstRowCells(): Locator {
  return this.firstJobRow.locator('td.k-table-td');
}

get tableHeaders(): Locator {
  return this.page.locator('th.k-table-th');
}
get firstJobIdLink(): Locator {
  return this.firstJobRow.locator('a[href*="/ExportWorkFlow/"]');
}
get firstJobIdText(): Locator {
  return this.firstJobRow.locator('.mud-nav-link-text');
}

get jobDetailsSection(): Locator {
  return this.page.locator('.job_data');
}
get croNumber(): Locator {
  return this.page.locator('.job_sec h1');
}
get customerName(): Locator {
  return this.page.locator('.job_sec h2');
}
get jobStatus(): Locator {
  return this.page.locator('.job_status h5');
}
get jobInfoValues(): Locator {
  return this.page.locator('.main_bl_head strong');
}
get stepperLabels(): Locator {
  return this.page.locator('.k-step-text');
}

get shippingInstructionUpload(): Locator {
  return this.page.locator('#fileCustomerShippingApplication');
}

get uploadProgress(): Locator {
  return this.page.locator('span:has-text("Progress")');
}

get saveShippingButton(): Locator {
  return this.page.locator('button:has-text("Save")');
}

get siTeamProcessButton(): Locator {
  return this.page.locator('button:has-text("SI Team Process")');
}
// Packing List file input
get packingListUpload(): Locator {
  return this.page.locator('#filePackingList');
}

// VGM Checkbox
get vgmCheckbox(): Locator {
  return this.page.locator('#chkIsVGM');
}

// VGM File upload
get vgmFileUpload(): Locator {
  return this.page.locator('#fileVgm');
}

// Submit To SI Team button
get submitToSiTeamButton(): Locator {
  return this.page.locator('button:has-text("SUBMIT To SI Team")');
}

// Manifest Status
get manifestStatusInput(): Locator {
  return this.page
    .locator('label:has-text("Manifest Status")')
    .locator('xpath=../following-sibling::div[1]//input');
}


// Draft BL Status
get draftBlStatusInput(): Locator {
  return this.page
    .locator('label:has-text("Draft Bl Status")')
    .locator('xpath=../following-sibling::div[1]//input');
}


// SI Status
get siStatusInput(): Locator {
  return this.page
    .locator('label:has-text("SI Status")')
    .locator('xpath=../following-sibling::div[1]//input');
}



// Assigned To
get assignedToInput(): Locator {
  return this.page.locator('#txtNotAssign');
}
// Popup message text
get movedDialogMessage(): Locator {
  return this.page.locator('.k-dialog-content');
}

// OK button inside popup
get movedDialogOkButton(): Locator {
  return this.page.locator('.k-dialog-actions button:has-text("OK")');
}

  // ---------- Actions ----------



async validateJobAssignedDetails() {

  await this.firstRowCells.first().waitFor({
    state: 'visible',
    timeout: 60000
  });

  const data: Record<string, string> = {};

  const keys = [
    'Operator',
    'CRO No',
    'Booking No',
    'Customer',
    'Shipping Line',
    'POL',
    'POD',
    'Date',
    'Created By'
  ];

  const cells = this.firstRowCells;
  const count = await cells.count();

  console.log('Cell count:', count);

  for (let i = 0; i < count; i++) {

    const value = (await cells.nth(i).innerText()).trim();
    const key = keys[i];

    await expect(value).not.toBe('');

    data[key] = value;

    console.log(`${key} : ${value}`);
  }

  return data;
}
async clickJobIdAndPrint() {

  await this.firstJobIdLink.waitFor({
    state: 'visible',
    timeout: 60000
  });

  const jobId = (await this.firstJobIdText.innerText()).trim();

  console.log(`Selected Job ID: ${jobId}`);

  await this.firstJobIdLink.click();

  return jobId;
}

async validateAndPrintJobHeaderDetails() {

  await this.jobDetailsSection.waitFor({
    state: 'visible',
    timeout: 60000
  });

  const data: Record<string, string> = {};

  // CRO Number
  data['CRO No'] = (await this.croNumber.innerText()).trim();

  // Customer
  data['Customer'] = (await this.customerName.innerText()).trim();

  // Status
  const status = (await this.jobStatus.innerText()).trim();
  data['Status'] = status;

  // VALIDATION
  await expect(this.jobStatus).toHaveText('In Progress', {
    timeout: 60000
  });
  // Info values (BK#, POD etc.)
  const info = this.jobInfoValues;
  const count = await info.count();

  for (let i = 0; i < count; i++) {
    const value = (await info.nth(i).innerText()).trim();
    data[`Info_${i}`] = value;
  }

  console.log('----- Job Header Details -----');

  for (const key in data) {
    console.log(`${key} : ${data[key]}`);
  }

  return data;
}

async uploadShippingInstructionAndVgmDetail(
  relativePath: string
): Promise<string> {

  const filePath = path.join(process.cwd(), relativePath);

  // Safety check
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Upload file
  await this.shippingInstructionUpload.setInputFiles(filePath);

  // Wait for progress text
  await expect(this.uploadProgress).toBeVisible({ timeout: 60000 });

  const fileText = (await this.uploadProgress.innerText()).trim();

  console.log('Upload status:', fileText);

  //  CLICK SAVE BUTTON
  await this.saveShippingButton.click();

  console.log('Save button clicked');

  return fileText;
}
async clickSiTeamProcessButton(): Promise<void> {

  await expect(this.siTeamProcessButton).toBeVisible({
    timeout: 60000
  });

  await expect(this.siTeamProcessButton).toBeEnabled();

  await this.siTeamProcessButton.click();
  console.log('SI  button clicked');
}

async uploadPackingListDocument(relativePath: string): Promise<string> {

  const filePath = path.join(process.cwd(), relativePath);

  // Safety check
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  await this.packingListUpload.setInputFiles(filePath);

  await expect(this.packingListUpload).toBeVisible({
    timeout: 60000
  });

  const fileText = (await this.packingListUpload.innerText()).trim();
  const fileName = fileText.replace('File :', '').trim();

  console.log('Uploaded Packing List:', fileName);

  return fileName;
}

async uploadVgmDocument(relativePath: string): Promise<string> {

  const filePath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  await this.vgmFileUpload.setInputFiles(filePath);

  await expect(this.vgmFileUpload).toBeVisible({
    timeout: 60000
  });

  const fileText = (await this.vgmFileUpload.innerText()).trim();
  const fileName = fileText.replace('File :', '').trim();

  console.log('Uploaded VGM File:', fileName);

  return fileName;
}


async enableVgm(): Promise<void> {

  await expect(this.vgmCheckbox).toBeVisible();

  if (!(await this.vgmCheckbox.isChecked())) {
    await this.vgmCheckbox.click();
  }
}
async clickSubmitToSiTeam(): Promise<void> {

  await expect(this.submitToSiTeamButton).toBeVisible();
  await expect(this.submitToSiTeamButton).toBeEnabled();

  await this.submitToSiTeamButton.click();
}

async validateAndPrintStatuses(): Promise<Record<string, string>> {

  const data: Record<string, string> = {};

  // WAIT UNTIL VALUES ARE LOADED
  await expect(this.manifestStatusInput).toHaveValue('NA', {
    timeout: 60000
  });

  await expect(this.draftBlStatusInput).toHaveValue('NA', {
    timeout: 60000
  });

  await expect(this.siStatusInput).toHaveValue('Requested', {
    timeout: 60000
  });

  // READ VALUES AFTER LOAD
  data['Manifest Status'] =
    (await this.manifestStatusInput.inputValue()).trim();

  data['Draft BL Status'] =
    (await this.draftBlStatusInput.inputValue()).trim();

  data['SI Status'] =
    (await this.siStatusInput.inputValue()).trim();

  // VALIDATION
  await expect(data['Manifest Status']).toBe('NA');
  await expect(data['Draft BL Status']).toBe('NA');
  await expect(data['SI Status']).toBe('Requested');

  console.log('----- STATUS DETAILS -----');

  for (const key in data) {
    console.log(`${key} : ${data[key]}`);
  }

  return data;
}

async handleMovedDialog(): Promise<string> {

  await expect(this.movedDialogMessage).toBeVisible({
    timeout: 60000
  });

  const message =
    (await this.movedDialogMessage.innerText()).trim();

  console.log('Dialog Message:', message);

  await expect(this.movedDialogOkButton).toBeVisible();
  await this.movedDialogOkButton.click();

  return message;
}


  }