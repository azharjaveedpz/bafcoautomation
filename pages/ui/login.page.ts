import { Page, Locator, expect, test } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // ---------- Locators (as methods) ----------

  get usernameInput(): Locator {
    return this.page.locator('#email');
  }

  get passwordInput(): Locator {
    return this.page.locator('#password');
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'SUBMIT' });
  }

  get errorMessage(): Locator {
    return this.page.locator('div.text-danger.mt-2');
  }

  get bookingDashboardHeader(): Locator {
    return this.page.getByRole('heading', { name: 'Booking Dashboard' });
  }

  // ---------- Actions ----------

  async open() {
    await this.page.goto('/login');
  }

  async enterUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  // ---------- Getters (for tests) ----------

  getErrorMessage(): Locator {
    return this.errorMessage;
  }

  getBookingDashboardHeader(): Locator {
    return this.bookingDashboardHeader;
  }

  // ---------- Reusable login flow ----------

  async login(username: string, password: string) {
    await test.step('Login with credentials', async () => {
      await this.open();
      await this.enterUsername(username);
      await this.enterPassword(password);
      await this.clickLogin();
    });
  }

  // ---------- Optional assertions ----------

  async assertLoginFailed() {
    await expect(this.errorMessage).toBeVisible();
  }

  async assertLoginSuccess() {
    await expect(this.bookingDashboardHeader).toBeVisible();
  }
}
