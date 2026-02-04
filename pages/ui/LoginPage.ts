import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  usernameInput = '#email';
  passwordInput = '#password';
  loginButton = "//button[normalize-space()='SUBMIT']";

  async open() {
    await this.page.goto('/login');
  }

  async enterUsername(username: string) {
    await this.page.fill(this.usernameInput, username);
  }

  async enterPassword(password: string) {
    await this.page.fill(this.passwordInput, password);
  }

  async clickLogin() {
    await this.page.click(this.loginButton);
  }
}
