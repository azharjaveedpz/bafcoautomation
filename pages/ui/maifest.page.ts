import { Page, Locator, expect } from '@playwright/test';

export class ManifestPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------

  // Job ID links
  get jobIdLinks(): Locator {
    return this.page.locator('.custom-link-button a'); // select <a> inside div
  }

  // First Job ID link
  get firstJobIdLink(): Locator {
    return this.jobIdLinks.first();
  }

  // First Job ID text
  get firstJobIdText(): Locator {
    return this.jobIdLinks.first().locator('.mud-nav-link-text');
  }

get shippingStatus(): Locator {
  return this.page.locator(
    `.mud-expand-panel-header:has(h1:has-text("Shipping Application"))
     input#txtCROStatusCode`
  ).first();
}

get manifestStatus(): Locator {
  return this.page.locator(
    `.mud-expand-panel-header:has(h1:has-text("Manifest"))
     input#txtCROStatusCode`
  ).first();
}

private panelHeader(sectionName: string): Locator {
  return this.page.locator(`div.mud-expand-panel-header:has-text("${sectionName}")`);
}

get composeManifestFollowUpBtn(): Locator {
  return this.page.locator(
    'button:has-text("Compose - Manifest Follow-Up Email For Line")'
  );
}

get emailPopupTitle(): Locator {
  return this.page.getByRole('dialog').locator('.k-window-title');
}

private emailCloseButton(email: string): Locator {
  return this.page.locator(
    `span.badge:has-text("${email}") button.btn-close`
  );
}

get emailInputs(): Locator {
  return this.page.locator(
    '.k-window:visible span.k-autocomplete input.k-input-inner'
  );
}

get toEmailInput(): Locator {
  return this.emailInputs.first();   
}

get ccEmailInput(): Locator {
  return this.emailInputs.nth(1);   
}

get subjectInput(): Locator {
  return this.page.locator('#txtSubject');
}
get sendEmailButton(): Locator {
  return this.page.getByRole('button', { name: 'Send Email' });
}

get successPopupTitle(): Locator {
  return this.page.locator('.k-dialog-title:has-text("Success")');
}
get successMessage(): Locator {
  return this.page.locator('.k-dialog-content:has-text("Mail Sent and moved to Manifest request.")');
}
get successOkButton(): Locator {
  return this.page.getByRole('button', { name: 'OK' });
}
  // ---------- Actions ----------

  // Click first Job ID and return its text
  private selectedJobId: string = '';
  async clickJobIdAndPrint(): Promise<void> {

  await this.firstJobIdLink.waitFor({ state: 'visible' });

  this.selectedJobId = (await this.firstJobIdText.innerText()).trim();

  console.log(`Selected Job ID: ${this.selectedJobId}`);

  await this.firstJobIdLink.click();
}

  
async getShippingStatus(): Promise<string> {
  await this.shippingStatus.waitFor({ state: 'visible' });
  return (await this.shippingStatus.inputValue()).trim();
}

async getManifestStatus(): Promise<string> {
  await this.manifestStatus.waitFor({ state: 'visible' });
  return (await this.manifestStatus.inputValue()).trim();
}

async getShippingAndManifestStatuses(): Promise<Record<string, string>> {

  await this.panelHeader('Shipping Application').click();

  await this.shippingStatus.waitFor({ state: 'attached' });
  await this.manifestStatus.waitFor({ state: 'attached' });

  const shipping = await this.shippingStatus.evaluate(
    (el: HTMLInputElement) => el.value
  );

  const manifest = await this.manifestStatus.evaluate(
    (el: HTMLInputElement) => el.value
  );

  console.log('Shipping Application Status:', shipping);
  console.log('Manifest Status:', manifest);

  return {
    'Shipping Application Status': shipping?.trim() ?? '',
    'Manifest Status': manifest?.trim() ?? '',
  };
}

async clickComposeManifestFollowUp(): Promise<void> {

  await this.composeManifestFollowUpBtn.waitFor({ state: 'visible' });

  await this.composeManifestFollowUpBtn.click();

 
}

async removeEmail(email: string): Promise<void> {

  const closeBtn = this.emailCloseButton(email);

  await closeBtn.waitFor({ state: 'visible' });

  await closeBtn.click();

}

async enterToAndCcEmails(toEmail: string, ccEmail: string): Promise<void> {

  // ---- TO ----
  await this.toEmailInput.waitFor({ state: 'visible' });
  await this.toEmailInput.click({ force: true });

  await this.toEmailInput.fill('');
  await this.toEmailInput.type(toEmail, { delay: 500 });

  await this.toEmailInput.press('Enter');
  await this.toEmailInput.blur();  

  // ---- CC ----
  await this.ccEmailInput.click({ force: true });

  await this.ccEmailInput.fill('');
  await this.ccEmailInput.type(ccEmail, { delay: 500 });

  await this.ccEmailInput.press('Enter');
  await this.ccEmailInput.blur();
}

async getSubjectDetails(): Promise<{ full: string; trimmed: string }> {

  await this.subjectInput.waitFor({ state: 'visible' });

  const fullSubject = (await this.subjectInput.inputValue()).trim();

  console.log('Full Subject:', fullSubject);

  const match = fullSubject.match(/\d+\s*\/\s*\d{2}-\d{2}/);

  const trimmed = match ? match[0].replace(/\s+/g, '') : '';

  console.log('Job Number:', trimmed);

  return {
    full: fullSubject,
    trimmed: trimmed,
  };
}
async validateJobIdWithSubject(): Promise<{
  jobId: string;
  subjectJobNumber: string;
  fullSubject: string;
}> {

  const subjectData = await this.getSubjectDetails();

  console.log('Selected Job ID:', this.selectedJobId);
  console.log('Subject Job Number:', subjectData.trimmed);

  await expect(subjectData.trimmed).toBe(this.selectedJobId);

  return {
    jobId: this.selectedJobId,
    subjectJobNumber: subjectData.trimmed,
    fullSubject: subjectData.full
  };
}

async clickSendEmail(): Promise<void> {
  await this.sendEmailButton.waitFor({ state: 'visible' });
  await this.sendEmailButton.click();
}

async confirmEmailSent(): Promise<string> {

  await this.successPopupTitle.waitFor({ state: 'visible' });

  const message = (await this.successMessage.innerText()).trim();

  console.log('Success Message:', message);

  await this.successOkButton.click();

  return message;
}
}