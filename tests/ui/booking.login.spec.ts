import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';

test.describe('UI Login Test - BAFCO Booking', () => {

  test('Login failed should show error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(
      loginData.booking.invalid.username,
      loginData.booking.invalid.password
    );

    await test.step('Verify error message is displayed', async () => {
      const error = loginPage.getErrorMessage();

      await expect(error).toBeVisible();
      await expect(error).toHaveText('Username or Password is incorrect.');

      const actualText = (await error.textContent())?.trim();
      test.info().annotations.push({
        type: 'info',
        description: `Invalid login error message: ${actualText}`,
      });
    });
  });

  
  test('Valid login should navigate to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(
      loginData.booking.valid.username,
      loginData.booking.valid.password
    );

    await test.step('Verify Booking Dashboard is loaded', async () => {
      const dashboardHeader = loginPage.getBookingDashboardHeader();

      await expect(dashboardHeader).toBeVisible();
      await expect(dashboardHeader).toHaveText('Booking Dashboard');

      const actualText = (await dashboardHeader.textContent())?.trim();
      test.info().annotations.push({
        type: 'info',
        description: `Dashboard header text: ${actualText}`,
      });
    });
  });

});
