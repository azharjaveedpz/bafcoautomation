import { Page, Locator, expect } from '@playwright/test';

export class SIDashboardPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------
// SI Requested
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
  return this.page.locator('.card_info', {
    has: this.page.locator('h3', { hasText: 'SI Submitted' })
  });
}






  // ---------- Actions ----------


async clickCardAndValidate(
  card: Locator,
  expectedUrl: RegExp
) {

  await card.locator('a').first().click();

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