import { test, expect } from '@e2e/fixtures';
import { expectAuthenticated } from '@e2e/helpers/auth';
import { isModuleInstalled } from '@e2e/helpers/modules';

// These tests click through the dashboard user menu to log out, not just
// prove login. Under tenancy, an authenticated visitor without a workspace
// never reaches that chrome (see modules/tenancy/src/Http/Middleware/
// EnsureWorkspace.php) — skip here, tenancy's own e2e suite covers logout
// from inside a workspace.
async function skipIfTenancyInstalled(laravel: Parameters<typeof isModuleInstalled>[0]) {
    test.skip(await isModuleInstalled(laravel, 'tenancy'), 'dashboard chrome is covered by tenancy\'s own e2e suite when tenancy is installed');
}

test.describe.parallel('Logout Basics', () => {
    test('logs out from user menu and redirects to login', async ({ page, laravel, credentials, loginAs }) => {
        await skipIfTenancyInstalled(laravel);
        const user = credentials.user;

        await loginAs(user);
        await page.goto('/dashboard');
        await expectAuthenticated(page);

        // Open user menu using the test ID
        const userMenuTrigger = page.getByTestId('user-menu-trigger');
        await userMenuTrigger.click();

        // Wait for dropdown to be visible before clicking
        const logoutMenuItem = page.getByTestId('nav-action-logout');
        await expect(logoutMenuItem).toBeVisible();
        await logoutMenuItem.click();

        // Confirm dialog should appear
        const confirmDialog = page.getByTestId('confirm-dialog');
        await expect(confirmDialog).toBeVisible();

        // Confirm logout
        await page.getByTestId('confirm-dialog-confirm').click();

        // After logout we expect to be redirected to the home page
        await expect(page).toHaveURL('/');

        // Visiting protected route should redirect back to login
        await page.goto('/dashboard');
        await expect(page).toHaveURL('/auth/login');
    });

    test('clicking outside the logout dialog does not dismiss it', async ({ page, laravel, credentials, loginAs }) => {
        await skipIfTenancyInstalled(laravel);
        const user = credentials.user;

        await loginAs(user);
        await page.goto('/dashboard');
        await expectAuthenticated(page);

        const userMenuTrigger = page.getByTestId('user-menu-trigger');
        await userMenuTrigger.click();

        const logoutMenuItem = page.getByTestId('nav-action-logout');
        await expect(logoutMenuItem).toBeVisible();
        await logoutMenuItem.click();

        const confirmDialog = page.getByTestId('confirm-dialog');
        await expect(confirmDialog).toBeVisible();

        // Click the overlay (outside the dialog)
        await page.mouse.click(10, 10);

        // Dialog should still be visible
        await expect(confirmDialog).toBeVisible();
    });

    test('cancelling logout dialog keeps user logged in', async ({ page, laravel, credentials, loginAs }) => {
        await skipIfTenancyInstalled(laravel);
        const user = credentials.user;

        await loginAs(user);
        await page.goto('/dashboard');
        await expectAuthenticated(page);

        // Open user menu
        const userMenuTrigger = page.getByTestId('user-menu-trigger');
        await userMenuTrigger.click();

        // Wait for dropdown to be visible before clicking
        const logoutMenuItem = page.getByTestId('nav-action-logout');
        await expect(logoutMenuItem).toBeVisible();
        await logoutMenuItem.click();

        // Confirm dialog should appear
        const confirmDialog = page.getByTestId('confirm-dialog');
        await expect(confirmDialog).toBeVisible();

        // Cancel logout
        await page.getByTestId('confirm-dialog-cancel').click();

        // Dialog should be closed
        await expect(confirmDialog).not.toBeVisible();

        // User should still be logged in
        await expectAuthenticated(page);
    });
});
