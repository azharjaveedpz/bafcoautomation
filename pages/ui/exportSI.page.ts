import { Page, Locator, expect } from '@playwright/test';

export class ExportSIPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------
get firstJobRow(): Locator {
  return this.page
    .locator('tbody.k-table-tbody tr.k-table-row')
    .first();
}

get firstJobIdLink(): Locator {
  return this.firstJobRow.locator(
    'td[data-col-index="1"] a.custom-link-button'
  );
}

get firstJobIdText(): Locator {
  return this.firstJobIdLink;
}










  // ---------- Actions ----------

  async clickJobIdAndPrint() {

  await expect(this.firstJobIdLink).toBeVisible();

  const jobId =
    (await this.firstJobIdLink.innerText()).trim();

  console.log(`Selected Job ID: ${jobId}`);

  await this.firstJobIdLink.click();

  return jobId;
}


  }