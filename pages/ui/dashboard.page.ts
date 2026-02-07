import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  // ---------- Locators ----------

  menuIcon = 'button.mud-icon-button';
  exportMenu="(//aside[contains(@class,'mud-drawer--open')]//nav[contains(@class,'mud-navmenu-dense')]//nav[@aria-label='Export']/button[@aria-label='Toggle Export'])[2]"
 /* get exportMenu(): Locator {
  return this.page.locator(
    'aside.mud-drawer--open nav.mud-nav-group:has(div.mud-nav-link-text:has-text("Export")) > button'
  );
}*/




  get croMenu(): Locator {
    return this.page.locator('a[href="/cros"]');
  }

  // ---------- Actions ----------

  async openLeftMenu() {
    // If Export is already visible, menu is open
   // if (await this.exportMenu.isVisible()) return;

    await this.page.click(this.menuIcon);

   
   // await expect(this.exportMenu).toBeVisible({ timeout: 10000 });
  }

  async openExportMenu() {
  /*  await this.exportMenu.scrollIntoViewIfNeeded();

    const expanded = await this.exportMenu.getAttribute('aria-expanded');
    if (expanded === 'true') return;*/

    await this.page.click(this.exportMenu);

    // Wait for accordion expansion
   /* await expect(this.exportMenu).toHaveAttribute(
      'aria-expanded',
      'true',
      { timeout: 10000 }
    );*/
  }

  async clickCRO() {
    await expect(this.croMenu).toBeVisible({ timeout: 10000 });
    await this.croMenu.click();
  }

  // ---------- Convenience ----------

  async openExportAndClickCRO() {
    await this.openExportMenu();
    await this.clickCRO();
  }
}
