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
get dashboardGroup(): Locator {
  return this.page.getByRole('navigation', { name: 'Dashboard' });
}

 get dashboardMenu(): Locator {
  return this.page.getByRole('button', { name: 'Toggle Dashboard' });
}
get dashboardExportMenu(): Locator {
  return this.dashboardGroup.getByLabel('Toggle Export');
}

get bookingMenu(): Locator {
  return this.page.locator('a[href="/bookingDashboard"]');
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

  async openDashboardMenu() {

  const expanded = await this.dashboardMenu.getAttribute('aria-expanded');
  if (expanded === 'true') return;

  await this.dashboardMenu.click();

  await expect(this.dashboardMenu).toHaveAttribute(
    'aria-expanded',
    'true',
    { timeout: 10000 }
  );
}
async openDashboardExportMenu() {

  const expanded = await this.dashboardExportMenu.getAttribute('aria-expanded');
  if (expanded === 'true') return;

  await this.dashboardExportMenu.click();

  await expect(this.dashboardExportMenu).toBeVisible({ timeout: 10000 });
}

async clickBooking() {
  await expect(this.bookingMenu).toBeVisible({ timeout: 10000 });
  await this.bookingMenu.click();
}

async openDashboardAndClickBooking() {
 // await this.openDashboardMenu();
  await this.openDashboardExportMenu();
  await this.clickBooking();
}



}
