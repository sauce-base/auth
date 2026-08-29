import { expect, test } from '@e2e/fixtures';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login Social Authentication', () => {
    test.describe.configure({ mode: 'serial' });

    test('hides social login providers when none are enabled', async ({
        page,
        laravel,
    }) => {
        await laravel.query('UPDATE settings SET payload = ? WHERE name = ?', [
            '[]',
            'enabled_socialite_providers',
        ]);

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await expect(page.getByTestId('socialite-providers')).not.toBeVisible();
    });

    test('shows only enabled providers on login and registration', async ({
        page,
        laravel,
    }) => {
        await laravel.query('UPDATE settings SET payload = ? WHERE name = ?', [
            '["google"]',
            'enabled_socialite_providers',
        ]);

        try {
            const loginPage = new LoginPage(page);
            await loginPage.goto();

            const googleButton = page.getByTestId('socialite-provider-google');
            await expect(googleButton).toBeVisible();
            await expect(
                page.getByTestId('socialite-provider-github'),
            ).not.toBeVisible();
            await expect(googleButton).toHaveAttribute(
                'href',
                /\/auth\/socialite\/google$/,
            );

            await page.goto('/auth/register');

            await expect(
                page.getByTestId('socialite-provider-google'),
            ).toBeVisible();
            await expect(
                page.getByTestId('socialite-provider-github'),
            ).not.toBeVisible();
        } finally {
            await laravel.query(
                'UPDATE settings SET payload = ? WHERE name = ?',
                ['[]', 'enabled_socialite_providers'],
            );
        }
    });
});
