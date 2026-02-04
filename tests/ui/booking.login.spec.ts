import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/LoginPage';
import { loginData } from '../../data/ui/login.data';

test('UI Login Test - BAFCO (Booking)', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step('Open application', async () => {
    await loginPage.open();
  });

  await test.step('Enter username', async () => {
    await loginPage.enterUsername(loginData.booking.username);
  });

  await test.step('Enter password', async () => {
    await loginPage.enterPassword(loginData.booking.password);
  });

  await test.step('Click login button', async () => {
    await loginPage.clickLogin();
  });

  await test.step('Verify dashboard', async () => {
    await expect(page).toHaveURL(/7071/);
  });
});
