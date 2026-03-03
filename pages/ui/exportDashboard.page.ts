import { Page, Locator, expect } from '@playwright/test';

export class ExportDashboardPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------
get jobAssignedMenu(): Locator {
  return this.page.locator('.card_info.two a[href="/JobAssignedSIPending"]').first();
}

get SIRequested(): Locator {
  return this.page.locator('.card_info', {
    has: this.page.locator('h3', { hasText: 'SI Requested' })
  });
}


// SI Inprogress
get SIInprogress(): Locator {
  return this.page.locator('.card_info', {
    has: this.page.locator('h3', { hasText: 'SI Inprogress' })
  });
}

// SI Rejected
get SIRejected(): Locator {
  return this.page.locator('.card_info', {
    has: this.page.locator('h3', { hasText: 'SI Rejected' })
  });
}

// SI Submitted
get SISubmitted(): Locator {
  return this.page.locator('a:has(h3:has-text("SI Submitted"))');
}




  // ---------- Actions ----------

  async clickJobAssignedMenu() {
  await this.jobAssignedMenu.waitFor({ state: 'visible' });
  await this.jobAssignedMenu.click();
}
async verifyJobAssignedPage() {
  await expect(this.page).toHaveURL(/JobAssignedSIPending/);
}

async clickAndValidateExportSIRequestedPage() {

  await this.SIRequested.locator('a').first().click();

  await expect(this.page)
    .toHaveURL(/ExpShippingInstructionList\/1/);

  const currentUrl = this.page.url();

  console.log(`Navigated URL: ${currentUrl}`);

  return {
    pageName: 'SI Requested',
    url: currentUrl
  };
}

async clickCardAndValidate(
  card: Locator,
  expectedUrl: RegExp
) {
  await card.waitFor({ state: 'visible' });

  await card.click();   

  await expect(this.page).toHaveURL(expectedUrl);

  const currentUrl = this.page.url();
  console.log(`Navigated URL: ${currentUrl}`);

  return currentUrl;
}
async openSIRequested() {
  return await this.clickCardAndValidate(
    this.SIRequested,
    /ShippingInstructionList\/1/
  );
}

async openSIInprogress() {
  return await this.clickCardAndValidate(
    this.SIInprogress,
    /ShippingInstructionList\/2/
  );
}

async openSIRejected() {
  return await this.clickCardAndValidate(
    this.SIRejected,
    /ShippingInstructionList\/5/
  );
}

async openSISubmitted() {
  return await this.clickCardAndValidate(
    this.SISubmitted,
    /ShippingInstructionList\/3/
  );
}


  }