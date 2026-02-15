import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';


export class SoPage {
  constructor(private page: Page) {}

   // ---------- Locators ----------
get soReceivedPageTitle(): Locator {
  return this.page.getByRole('heading', {
    name: 'Service Order(SO Received)'
  });
}
get firstSOLink(): Locator {
  return this.page
    .locator('tbody.k-table-tbody tr[role="row"]')
    .first()
    .locator('a[href*="/ServiceOrders/"]');
}
// Labels (SO NO :, Customer :, etc.)
get soDetailLabels(): Locator {
  return this.page.locator('span.text-primary');
}

// Values (110226-001, HO-GENERAL CUSTOMER etc.)
get soDetailValues(): Locator {
  return this.page.locator('span.text-primary + span');
}


get formLabels(): Locator {
  return this.page.locator('label.form-label');
}
get editButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit Record' });
  }

// ===== CRO Dropdown (corner arrow button) =====
get croStatusCombo(): Locator {
  return this.page.locator('span.k-combobox:has(input#CROStatuslookup)');
}

get croStatusArrow(): Locator {
  return this.croStatusCombo.locator('button[aria-label="Open"]');
}
get linkBufferCRORow(): Locator {
  return this.page.locator('div.mb-2.row', {
    has: this.page.locator('label:has-text("Link Buffer CRO")')
  });
}

get linkBufferCROArrow(): Locator {
  return this.linkBufferCRORow.locator('button[aria-label="Open"]');
}

// ===== CRO options list =====
get croOptions(): Locator {
  return this.page.locator('[role="option"]');
}

get receivedStatusOption(): Locator {
  return this.page.locator('[role="option"]', { hasText: 'Received' });
}



get createJobPopup(): Locator {
  return this.page.locator('div.k-window[role="dialog"]');
}
get popupMessage(): Locator {
  return this.createJobPopup.locator(
    'span:has-text("You are about to link the current SO and CRO")'
  );
}
get createNewJobRadio(): Locator {
  return this.createJobPopup.locator(
    'input[type="radio"][value="Create New Job"]'
  );
}
get customerNameLabel(): Locator {
  return this.createJobPopup
    .locator('label.form-label')
    .nth(2); // dynamic customer name
}

get updateCROStatusButton(): Locator {
  return this.page.getByRole('button', {name: 'Update CRO Status'
  });
}

get saveJobButton(): Locator {
  return this.createJobPopup.getByRole('button', {
    name: 'Save',
    exact: true
  });
}


get emailSentPopupTitle(): Locator {
  return this.page.locator('.k-dialog-title', {
    hasText: 'Email sent'
  });
}
get emailSentPopup(): Locator {
  return this.page.locator('div.k-window.k-dialog');
}

get emailSentOkButton(): Locator {
  return this.emailSentPopup.getByRole('button', {
    name: 'OK'
  });
}


get latestDialog(): Locator {
  return this.page.locator('div.k-window.k-dialog').last();
}

get popupMessageContent(): Locator {
  return this.latestDialog.locator('.k-dialog-content');
}

get popupOkButton(): Locator {
  return this.page.getByRole('button', { name: 'OK' });
}

 // ---------- Action ----------
async verifySOReceivedPageNavigation() {

  // Wait until page heading appears
  await expect(this.soReceivedPageTitle)
    .toBeVisible({ timeout: 10000 });

  // Capture text for logs/report
  const pageTitle =
    await this.soReceivedPageTitle.textContent();

  console.log(` Navigated to page: ${pageTitle}`);

  return pageTitle;
}
async clickFirstSO() {

  const soNumber = await this.firstSOLink.textContent();
  console.log(` Clicking SO: ${soNumber}`);

  await this.firstSOLink.click();

   return soNumber?.trim();
}

async printAllSODetails() {

  // wait until values are rendered
  await this.page.locator('span.text-primary + span')
    .first()
    .waitFor({ state: 'visible', timeout: 60000 });

  const labels = this.page.locator('span.text-primary');
  const count = await labels.count();

  let fullText = '';

  for (let i = 0; i < count; i++) {

    const label = labels.nth(i);

    const key = (await label.innerText()).trim();

    // wait for each value (important)
    const valueLocator = label.locator('+ span');
    await valueLocator.waitFor({ state: 'visible' });

    const value = (await valueLocator.innerText()).trim();

    await expect(value, `${key} should not be empty`)
      .not.toBe('');

    const line = `${key} ${value}`;

    console.log(line);
    fullText += line + '\n';
  }

  return fullText;
}

async printAllFormValues() {

  await this.page.locator('label.form-label')
    .first()
    .waitFor({ state: 'visible', timeout: 60000 });

  const labels = this.page.locator('label.form-label');
  const count = await labels.count();

  let fullText = '';

  for (let i = 0; i < count; i++) {

    const label = labels.nth(i);
    const key = (await label.innerText()).trim();

    if (!key) continue;

    const inputId = await label.getAttribute('for');
    if (!inputId) continue;

    const element = this.page.locator(`#${inputId}`).first();

    let value = '';

    if (await element.count() > 0) {

      // ⭐ CASE 1 — element itself is input / textarea
      const tagName = await element.evaluate(
        el => el.tagName.toLowerCase()
      );

      if (tagName === 'input' || tagName === 'textarea') {
        value = (await element.inputValue()).trim();
      }

      // ⭐ CASE 2 — child input inside wrapper
      if (!value) {
        const input = element.locator('input, textarea').first();

        if (await input.count() > 0) {
          value = (await input.inputValue()).trim();
        }
      }

      // ⭐ CASE 3 — Telerik dropdown value
      if (!value) {
        const dropValue = element.locator('.k-input-value-text').first();

        if (await dropValue.count() > 0) {
          value = (await dropValue.innerText()).trim();
        }
      }

      // ⭐ CASE 4 — Telerik inner input
      if (!value) {
        const inner = element.locator('.k-input-inner').first();

        if (await inner.count() > 0) {
          try {
            value = (await inner.inputValue()).trim();
          } catch {}
        }
      }

      // ⭐ CASE 5 — fallback
      if (!value) {
        value = (await element.innerText()).trim();
      }
    }

    const line = `${key} : ${value}`;

    console.log(line);
    fullText += line + '\n';
  }

  return fullText;
}

 async clickEditButton() {
    await this.editButton.click();
  }

async selectFirstCRONumber() {

  await this.linkBufferCROArrow.waitFor({
    state: 'visible',
    timeout: 60000
  });

  await this.linkBufferCROArrow.click();

  await this.croOptions.first().waitFor({
    state: 'visible',
    timeout: 60000
  });

  const croNumber = await this.croOptions.first().textContent();

  await this.croOptions.first().click();

  console.log(`Selected CRO Number: ${croNumber}`);
}


async selectCROStatusReceived() {

  await this.croStatusArrow.click();

  await this.croOptions.first().waitFor({
    state: 'visible',
    timeout: 60000
  });

  await this.page.locator('[role="option"]', {
    hasText: 'Received'
  }).click();

  console.log('CRO Status selected: Received');
}

async clickUpdateCROStatus() {

  await this.updateCROStatusButton.waitFor({
    state: 'visible',
    timeout: 45000
  });

  await this.updateCROStatusButton.click();

  console.log('Clicked Update CRO Status button');
}

async verifyPopupAndCustomerName(): Promise<string> {

  // ===== Verify popup opened =====
  await this.popupMessage.waitFor({
    state: 'visible',
    timeout: 60000
  });

  const popupText =
    (await this.popupMessage.textContent())?.trim() || '';

  console.log(`Popup message: ${popupText}`);

  // ===== Click Create New Job =====
  await this.createNewJobRadio.check();

  console.log('Selected: Create New Job');

  // ===== Customer Name =====
  await this.customerNameLabel.waitFor({ state: 'visible' });

  const customerName =
    (await this.customerNameLabel.textContent())?.trim() || '';

  console.log(`Customer Name: ${customerName}`);

  // Verify not empty
  expect(customerName).not.toBe('');

  // ⭐ RETURN details for attachment
  return `
Popup Message: ${popupText}
Customer Name: ${customerName}
`;
}

async clickSaveJob() {

  await this.saveJobButton.waitFor({
    state: 'visible',
    timeout: 60000
  });

  await this.saveJobButton.click();

  console.log('Clicked Save Job button');
}

async verifyEmailSentPopupAndClickOK(): Promise<string> {

  // Wait for popup
  await this.emailSentPopupTitle.waitFor({
    state: 'visible',
    timeout: 60000
  });

  const popupText =
    (await this.emailSentPopupTitle.textContent())?.trim() || '';

  console.log(`Popup message: ${popupText}`);

  expect(popupText).toBe('Email sent');

  // Click OK
  await this.emailSentOkButton.click();

  console.log('Clicked OK button');

  // RETURN for report
  return `Popup Message: ${popupText}`;
}
async handleEmailResultPopup(): Promise<string> {

  await this.popupMessageContent.waitFor({
    state: 'visible',
    timeout: 60000
  });

  const message =
    (await this.popupMessageContent.textContent())?.trim() || '';

  console.log(`Email Result Popup: ${message}`);

  expect(message).not.toBe('');

  // click OK of latest popup
  await this.latestDialog
    .getByRole('button', { name: 'OK' })
    .click();

  return `Popup Message: ${message}`;
}



}


