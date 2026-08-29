<?php

namespace Modules\Auth\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Modules\Auth\Settings\AuthSettings;
use Tests\TestCase;

class SocialiteAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_disabled_provider_redirect_returns_404_without_starting_oauth(): void
    {
        Socialite::shouldReceive('driver')->never();

        $this->get(route('auth.socialite.redirect', ['provider' => 'google']))
            ->assertNotFound();
    }

    public function test_disabled_provider_callback_returns_404_without_resolving_user(): void
    {
        Socialite::shouldReceive('driver')->never();

        $this->get(route('auth.socialite.callback', ['provider' => 'google']))
            ->assertNotFound();
    }

    public function test_unknown_provider_returns_404_when_saved_setting_is_stale(): void
    {
        $settings = app(AuthSettings::class);
        $settings->enabled_socialite_providers = ['unsupported'];
        $settings->save();

        Socialite::shouldReceive('driver')->never();

        $this->get(route('auth.socialite.redirect', ['provider' => 'unsupported']))
            ->assertNotFound();
    }

    public function test_enabled_provider_starts_oauth_redirect(): void
    {
        $settings = app(AuthSettings::class);
        $settings->enabled_socialite_providers = ['google'];
        $settings->save();

        Socialite::fake('google');

        $this->get(route('auth.socialite.redirect', ['provider' => 'google']))
            ->assertRedirect('https://socialite.fake/google/authorize');
    }
}
