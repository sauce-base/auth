<?php

namespace Modules\Auth\Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Modules\Auth\Filament\Pages\AuthenticationSettings;
use Modules\Auth\Settings\AuthSettings;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthenticationSettingsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_load_authentication_settings_form(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::ADMIN);

        $this->actingAs($admin);

        $this->get(AuthenticationSettings::getUrl(panel: 'admin'))
            ->assertOk();

        Livewire::test(AuthenticationSettings::class)
            ->assertFormSet([
                'magic_link_enabled' => true,
                'magic_link_expiry' => 15,
            ]);
    }

    public function test_administrator_can_save_authentication_settings(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::ADMIN);

        $this->actingAs($admin);

        Livewire::test(AuthenticationSettings::class)
            ->fillForm([
                'magic_link_enabled' => false,
                'magic_link_expiry' => 30,
            ])
            ->call('save')
            ->assertHasNoFormErrors()
            ->assertNotified();

        $settings = new AuthSettings();

        $this->assertFalse($settings->magic_link_enabled);
        $this->assertSame(30, $settings->magic_link_expiry);
    }

    #[DataProvider('invalidExpiryProvider')]
    public function test_invalid_expiry_does_not_change_authentication_settings(
        mixed $expiry,
        string $rule,
    ): void {
        $admin = User::factory()->create();
        $admin->assignRole(Role::ADMIN);

        $this->actingAs($admin);

        Livewire::test(AuthenticationSettings::class)
            ->fillForm([
                'magic_link_enabled' => false,
                'magic_link_expiry' => $expiry,
            ])
            ->call('save')
            ->assertHasFormErrors(['magic_link_expiry' => $rule])
            ->assertNotNotified();

        $settings = new AuthSettings();

        $this->assertTrue($settings->magic_link_enabled);
        $this->assertSame(15, $settings->magic_link_expiry);
    }

    /**
     * @return array<string, array{expiry: mixed, rule: string}>
     */
    public static function invalidExpiryProvider(): array
    {
        return [
            'expiry is required' => [
                'expiry' => null,
                'rule' => 'required',
            ],
            'expiry must be an integer' => [
                'expiry' => 'fifteen',
                'rule' => 'integer',
            ],
            'expiry must be positive' => [
                'expiry' => 0,
                'rule' => 'min',
            ],
        ];
    }

    public function test_regular_user_cannot_access_authentication_settings_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::USER);

        $this->actingAs($user)
            ->get(AuthenticationSettings::getUrl(panel: 'admin'))
            ->assertForbidden();
    }
}
