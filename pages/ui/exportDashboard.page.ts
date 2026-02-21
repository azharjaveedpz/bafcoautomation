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



  }