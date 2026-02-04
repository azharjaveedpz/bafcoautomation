import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/ui/LoginPage';
import { loginData } from '../data/ui/login.data';

test('UI Login Test - BAFCO (Export)', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.enterUsername(loginData.export.username);
  await loginPage.enterPassword(loginData.export.password);
  await loginPage.clickLogin();

  await expect(page).toHaveURL(/7071/);
});
