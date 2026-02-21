import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export class SIPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------
get firstRow(): Locator {
  return this.page
    .locator('tbody.k-table-tbody tr.k-table-row')
    .first();
}

get firstRowCheckbox(): Locator {
  return this.firstRow.locator(
    'td[data-col-index="0"] input[type="checkbox"]'
  );
}


get firstRowCells(): Locator {
  return this.firstRow.locator('td.k-table-td');
}

get assignToInput(): Locator {
  return this.page.locator('#UserSelect');
}

// Job ID links (bold link)
  get jobIdLinks(): Locator {
    return this.page.locator('a.custom-link-button');
  }

  // First Job ID link
  get firstJobIdLink(): Locator {
    return this.jobIdLinks.first();
  }

  // First Job ID text
  get firstJobIdText(): Locator {
    return this.jobIdLinks.first();
  }
 get jobId(): Locator {
  return this.page.locator('.job_sec').getByRole('heading', { level: 1 });
}
  get customerName(): Locator {
    return this.page.locator('h2');
  }

  get status(): Locator {
    return this.page.locator('div.job_status span');
  }

  get bookingNumber(): Locator {
    return this.page.locator('span:has-text("BK#")').locator('xpath=following::strong[1]');
  }

  get pol(): Locator {
    return this.page.locator('span:has-text("POL")').locator('xpath=following::strong[1]');
  }

  get pod(): Locator {
    return this.page.locator('span:has-text("POD")').locator('xpath=following::strong[1]');
  }

  get handledBy(): Locator {
    return this.page.locator('span:has-text("Handle By")').locator('xpath=following::strong[1]');
  }

// ================= SHIPPING APPLICATION SECTION =================

get shippingApplicationPanel(): Locator {
  return this.page.locator('.mud-expand-panel')
    .filter({
      has: this.page.getByRole('heading', { name: 'Shipping Application' })
    });
}

// Disabled status input
get shippingAppStatusInput(): Locator {
  return this.shippingApplicationPanel.locator('#txtCROStatusCode');
}

// Dynamic green status text (like VGM Requested, VGM Approved etc.)
get dynamicStatusText(): Locator {
  return this.shippingApplicationPanel
    .locator('span')
    .filter({ hasText: /Requested/ });
}

get firstDocumentName() {
  return this.page.locator('tbody tr.k-table-row td[data-col-index="1"]').first();
}
get firstRowEyeButton() {
  return this.page
    .locator('tbody tr.k-table-row')
    .first()
    .locator('td[data-col-index="4"] button')
    .nth(1); // second button = eye
}
get pdfViewerLayer() {
  return this.page.locator('.k-text-layer');
}
get pdfCloseButton() {
  return this.page.locator('button[title="Close"]');
}

// Remarks tab
get remarksTab() {
  return this.page.getByRole('tab', { name: /Remarks/ });
}

// File upload input
get remarkFileInput() {
  return this.page.locator('#fileManifest');
}

// Save button
get saveButton() {
  return this.page.getByRole('button', { name: 'Save' });
}

// Latest saved remark row
get latestRemarkRow() {
  return this.page.locator('.msg_row').first();
}

// Saved username
get remarkUserName() {
  return this.latestRemarkRow.locator('.user_txt');
}

// Saved message text
get remarkMessage() {
  return this.latestRemarkRow.locator('.body_msg_txt p');
}

// Saved date
get remarkDate() {
  return this.latestRemarkRow.locator('div[style*="green"]');
}
// Remark Editor
get remarkEditor() {
  return this.page
    .frameLocator('iframe[aria-label="Iframe edit mode"]').first()
    .locator('.ProseMirror[contenteditable="true"]');
}

get containerTab() {
  return this.page.getByRole('tab', { name: 'Container' });
}
get containerGridFirstRow() {
  return this.page.locator('.k-grid-table tbody tr').first();
}
get firstRowContainerType() {
  return this.containerGridFirstRow.locator('td[data-col-index="3"]');
}
get headerContainerTypes() {
  return this.page.locator('.qty_sec .d-flex.flex-column b');
}

  // ---------- Actions ----------

  

async clickCheckboxAndPrintRowDetails() {

  // click checkbox
  await this.firstRowCheckbox.check();

  // get all cells
  const cells = this.firstRowCells;
  const count = await cells.count();

  const rowData: Record<string, string> = {};

  for (let i = 0; i < count; i++) {

    const cell = cells.nth(i);
    const value = (await cell.innerText()).trim();

    rowData[`col_${i}`] = value;
  }

  console.log('Row Details:', rowData);

  return rowData;
}
get userSuggestions() {
  return this.page.locator('ul.k-list-ul li.k-list-item');
}
get firstUserSuggestion(): Locator {
  return this.userSuggestions.first();
}
get updateButton(): Locator {
  return this.page.locator('button:has-text("Update")');
}
async assignUserAndUpdate(userName: string) {

  // Activate combobox
  await this.assignToInput.click();

  // Clear
  await this.assignToInput.fill('');

  // Type name
  await this.assignToInput.type(userName, { delay: 100 });

  // Wait until dropdown opens
  await expect(this.assignToInput)
    .toHaveAttribute('aria-expanded', 'true');

  // Select first suggestion via keyboard
  await this.page.keyboard.press('ArrowDown');
  await this.page.keyboard.press('Enter');

  // Wait until dropdown closes
  await expect(this.assignToInput)
    .toHaveAttribute('aria-expanded', 'false');

  // Click Update
  await this.updateButton.click();

  console.log(`User assigned successfully: ${userName}`);
}

async clickJobIdAndPrint(): Promise<string> {

  await this.firstJobIdLink.waitFor({ state: 'visible' });

  const jobId = (await this.firstJobIdText.innerText()).trim();

  console.log(`Selected Job ID: ${jobId}`);

  await this.firstJobIdLink.click();

  return jobId;
}

 async getAndValidateJobDetails(): Promise<any> {

    await this.jobId.waitFor({ state: 'visible' });

    const details = {
      jobId: (await this.jobId.innerText()).split('\n')[0].trim(),
      customer: await this.customerName.innerText(),
      status: await this.status.innerText(),
      bookingNumber: await this.bookingNumber.innerText(),
      pol: await this.pol.innerText(),
      pod: await this.pod.innerText(),
      handledBy: await this.handledBy.innerText(),
     
    };

    console.log('===== JOB DETAILS =====');
    console.log(details);

    // Validate status
    expect(details.status).toBe('Requested');

    return details;
  }
async validateShippingApplicationSection(): Promise<any> {

  // Ensure panel visible
  await this.shippingApplicationPanel.waitFor({ state: 'visible' });

  // Validate input status = Requested
  await expect(this.shippingAppStatusInput).toHaveValue('Requested');

  // Wait for dynamic status
  await this.dynamicStatusText.first().waitFor({ state: 'visible' });

  const dynamicText =
    (await this.dynamicStatusText.first().innerText()).trim();

  console.log('Dynamic Status:', dynamicText);

  return {
    shippingStatus: 'Requested',
    dynamicStatus: dynamicText
  };
}
async viewAndCloseDocument(): Promise<any> {

  // Get document name
  const docName = (await this.firstDocumentName.innerText()).trim();
  console.log('Document Name:', docName);

  // Click eye icon
  await this.firstRowEyeButton.click();

  // Wait for PDF viewer
  await this.pdfViewerLayer.waitFor({ state: 'visible' });

  console.log('Document viewed successfully');

  // Close document
  await this.pdfCloseButton.click();

  await this.pdfViewerLayer.waitFor({ state: 'hidden' });

  console.log('Document closed successfully');

  return {
    documentName: docName,
    status: 'Viewed and Closed Successfully'
  };
}


async uploadRemarkAndSave(relativePath: string): Promise<any> {

  // Click Remarks tab
  await this.remarksTab.click();
 await this.remarkEditor.waitFor({ state: 'visible' });
await this.remarkEditor.fill('tst automation');


await this.page.keyboard.press('Tab');

  // Prepare file path
  const filePath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Upload file
  await this.remarkFileInput.setInputFiles(filePath);
  console.log('File uploaded:', filePath);

  // Click Save
  await expect(this.saveButton).toBeEnabled();
  await this.saveButton.click();

  // Wait for new remark
  await this.latestRemarkRow.waitFor({ state: 'visible' });

  // Capture details
  const user = (await this.remarkUserName.innerText()).trim();
  const message = (await this.remarkMessage.innerText()).trim();
  const date = (await this.remarkDate.innerText()).trim();

  console.log('Saved Remark Details:');
  console.log('User:', user);
  console.log('Message:', message);
  console.log('Date:', date);

  return {
    uploadedFile: path.basename(filePath),
    user,
    message,
    date
  };
}

async validateFirstContainerType(): Promise<any> {

  await this.containerTab.click();

  await this.containerGridFirstRow.waitFor({ state: 'visible' });

  // Grid first row container type
  const gridType =
    (await this.firstRowContainerType.innerText()).trim();

  console.log('Grid First Container Type:', gridType);

  expect(gridType.length).toBeGreaterThan(0);

  // Get all header container types
  const headerTypes =
    (await this.headerContainerTypes.allInnerTexts())
      .map(t => t.trim());

  console.log('Header Container Types:', headerTypes);

  // Validate grid type exists in header list
  expect(headerTypes).toContain(gridType);

  console.log('Container type matched successfully');

  return {
    gridContainerType: gridType,
    headerContainerTypes: headerTypes
  };
}

async processSRRequestedDetails(relativePath: string): Promise<any> {

  const result: any = {};

  // =================  SHIPPING APPLICATION =================
  await this.shippingApplicationPanel.waitFor({ state: 'visible' });

  await expect(this.shippingAppStatusInput).toHaveValue('Requested');

  await this.dynamicStatusText.first().waitFor({ state: 'visible' });

  const dynamicText =
    (await this.dynamicStatusText.first().innerText()).trim();

  console.log('Dynamic Status:', dynamicText);

  result.shippingApplication = {
    status: 'Requested',
    dynamicStatus: dynamicText
  };

  // =================  VIEW DOCUMENT =================
  const docName = (await this.firstDocumentName.innerText()).trim();
  console.log('Document Name:', docName);

  await this.firstRowEyeButton.click();
  await this.pdfViewerLayer.waitFor({ state: 'visible' });

  console.log('Document viewed successfully');

  await this.pdfCloseButton.click();
  await this.pdfViewerLayer.waitFor({ state: 'hidden' });

  console.log('Document closed successfully');

  result.document = {
    documentName: docName,
    status: 'Viewed and Closed Successfully'
  };

  // ================= REMARK UPLOAD =================
  await this.remarksTab.click();

  await this.remarkEditor.waitFor({ state: 'visible' });
  await this.remarkEditor.fill('tst automation');
  await this.page.keyboard.press('Tab');

  const filePath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  await this.remarkFileInput.setInputFiles(filePath);
  console.log('File uploaded:', filePath);

  await expect(this.saveButton).toBeEnabled();
  await this.saveButton.click();

  await this.latestRemarkRow.waitFor({ state: 'visible' });

  const user = (await this.remarkUserName.innerText()).trim();
  const message = (await this.remarkMessage.innerText()).trim();
  const date = (await this.remarkDate.innerText()).trim();

  console.log('Saved Remark Details:');
  console.log('User:', user);
  console.log('Message:', message);
  console.log('Date:', date);

  result.remark = {
    uploadedFile: path.basename(filePath),
    user,
    message,
    date
  };

  // =================  CONTAINER VALIDATION =================
  await this.containerTab.click();
  await this.containerGridFirstRow.waitFor({ state: 'visible' });

  const gridType =
    (await this.firstRowContainerType.innerText()).trim();

  console.log('Grid First Container Type:', gridType);

  expect(gridType.length).toBeGreaterThan(0);

  const headerTypes =
    (await this.headerContainerTypes.allInnerTexts())
      .map(t => t.trim());

  console.log('Header Container Types:', headerTypes);

  expect(headerTypes).toContain(gridType);

  console.log('Container type matched successfully');

  result.container = {
    gridContainerType: gridType,
    headerContainerTypes: headerTypes
  };

  // ================= BACK USING BROWSER =================
await this.page.goBack();

await this.page.waitForLoadState('networkidle');

console.log('Navigated back using browser goBack()');

result.navigation = {
  backAction: 'Browser goBack executed successfully'
};
await this.firstRowCheckbox.check();
  return result;
}
  }