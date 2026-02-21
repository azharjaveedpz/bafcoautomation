import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/ui/login.page';
import { loginData } from '../../data/ui/login.data';

test('Validate Job Assigned details', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await test.step('Login with valid export user', async () => {

    await loginPage.login(
      loginData.si.username,
      loginData.si.password
    );

    await loginPage.assertSILoginSuccess();

  });

});


