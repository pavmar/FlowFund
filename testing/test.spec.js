import { test, expect } from '@playwright/test';

test.describe('Sign-In Flow', () => {
  test('should display the Sign-In Page', async ({ page }) => {
    // Navigate to the Sign-In Page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');

    // Verify the Email field is visible
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

    // Verify the Password field is visible
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    // Verify the "Sign In" button is visible
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
  });

  test('should allow the user to fill in credentials', async ({ page }) => {
    // Navigate to the Sign-In Page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');

    // Fill in the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');

    // Fill in the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');
  });

  test('should allow the user to click the "Sign In" button', async ({ page }) => {
    // Navigate to the Sign-In Page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');

    // Fill in the Email and Password fields
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');

    // Click the "Sign In" button
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  });

  test('should navigate to the homepage after signing in', async ({ page }) => {
    // Navigate to the Sign-In Page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');

    // Fill in the Email and Password fields
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');

    // Click the "Sign In" button
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Wait for navigation to the homepage
    await page.waitForURL('http://flowfund.pavankumarcs.ninja'); // Replace with the actual homepage URL

    // Verify that the homepage is loaded
    await page.getByRole('button', { name: 'Current User' }).click();
    await expect(page.locator('#account-menu')).toContainText('1test@gmail.com');
    await page.getByRole('button', { name: 'Sign Out' }).click();
});
});


test.describe('Wallet Flow', () => {
test('test', async ({ page }) => {
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('link', { name: 'Wallet' }).click();
  await page.getByRole('textbox', { name: 'Wallet Address' }).click();
  await page.getByRole('textbox', { name: 'Wallet Address' }).fill('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
  await page.getByRole('textbox', { name: 'Wallet Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Private Key' }).click();
  await page.getByRole('textbox', { name: 'Private Key' }).fill('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a');
  await expect(page.getByRole('paragraph')).toContainText('Balance:');
  await page.getByRole('button', { name: 'Update Details' }).click();
  await page.getByRole('link', { name: 'Borrow' }).click();
});
})



test.describe('Lender Flow', () => {
  test('should allow the user to sign in', async ({ page }) => {
    // Navigate to the Sign-In Page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');

    // Fill in the Email and Password fields
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');

    // Click the "Sign In" button
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Verify successful login
    await expect(page).toHaveURL('http://flowfund.pavankumarcs.ninja'); // Replace with the actual homepage URL
  });

  test('should allow the user to navigate to the "Become a Lender" page', async ({ page }) => {
    // Navigate to the Sign-In Page and log in
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Navigate to the "Become a Lender" page
    await page.getByRole('link', { name: 'Become a Lender' }).click();

    // Verify that the "Become a Lender" page is loaded
    await expect(page.getByRole('textbox', { name: 'Interest' })).toBeVisible();
  });

  test('should allow the user to fill in lender details', async ({ page }) => {
    // Navigate to the "Become a Lender" page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Become a Lender' }).click();

    // Fill in the lender details
    await page.getByRole('textbox', { name: 'Interest' }).fill('10');
    await page.getByRole('textbox', { name: 'Amount', exact: true }).fill('1000');
    await page.getByRole('textbox', { name: 'Duration' }).fill('36');

    // Verify that the fields are filled correctly
    await expect(page.getByRole('textbox', { name: 'Interest' })).toHaveValue('10');
    await expect(page.getByRole('textbox', { name: 'Amount', exact: true })).toHaveValue('1000');
    await expect(page.getByRole('textbox', { name: 'Duration' })).toHaveValue('36');
  });

  test('should handle dialog and submit lender details', async ({ page }) => {
    // Navigate to the "Become a Lender" page
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Become a Lender' }).click();

    // Fill in the lender details
    await page.getByRole('textbox', { name: 'Interest' }).fill('10');
    await page.getByRole('textbox', { name: 'Amount', exact: true }).fill('1000');
    await page.getByRole('textbox', { name: 'Duration' }).fill('36');

    // Handle dialog and submit the form
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'Submit' }).click();

    
  });
});




test('Borrow and Repayment', async ({ page }) => {
    await page.goto('http://flowfund.pavankumarcs.ninja/sign-in?callbackUrl=%2F');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('1test@gmail.com');
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('qwerty123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Borrow' }).click();
    await expect(page.getByRole('main')).toContainText('Available Lenders');
    await page.getByRole('link', { name: 'Payments' }).click();
    await expect(page.getByRole('main')).toContainText('Loan details');

});

