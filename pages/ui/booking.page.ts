import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';


export class BookingPage {
  constructor(private page: Page) {}

   // ---------- Locators ----------
get bookingPageTitle(): Locator {
  return this.page.getByRole('heading', { name: 'Booking Dashboard' });
}
get soReceivedCard(): Locator {
  return this.page.locator('.card_info_sec', {
    has: this.page.getByRole('heading', { name: 'SO Received' })
  });
}


get soOnHoldCard(): Locator {
  return this.page.locator('.card_info_sec', {
    has: this.page.getByRole('heading', { name: 'SO On Hold' })
  });
}


get croRequestedCard(): Locator {
  return this.page.locator('.card_info_sec', {
    has: this.page.getByRole('heading', { name: 'CRO Requested' })
  });
}


get croReceivedCard(): Locator {
  return this.page.locator('.card_info_sec', {
    has: this.page.getByRole('heading', { name: 'CRO Received' })
  });
}




 // ---------- Actions ----------
 async verifyBookingPageNavigation() {

 
  await expect(this.bookingPageTitle).toBeVisible({ timeout: 10000 });


  const pageTitle = await this.bookingPageTitle.textContent();

  
  console.log(`Page navigated to: ${pageTitle}`);

  
  await expect(this.bookingPageTitle).toHaveText('Booking Dashboard');
}

async clickSOReceived() {
  await expect(this.soReceivedCard).toBeVisible();
  await this.soReceivedCard.click();
}
async clickSOOnHold() {
  await expect(this.soOnHoldCard).toBeVisible();
  await this.soOnHoldCard.click();
}
async clickCRORequested() {
  await expect(this.croRequestedCard).toBeVisible();
  await this.croRequestedCard.click();
}
async clickCROReceived() {
  await expect(this.croReceivedCard).toBeVisible();
  await this.croReceivedCard.click();
}


}