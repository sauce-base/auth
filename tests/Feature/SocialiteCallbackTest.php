<?php

namespace Modules\Auth\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery\MockInterface;
use Modules\Auth\Notifications\LoginNotification;
use Modules\Auth\Settings\AuthSettings;
use Tests\TestCase;

class SocialiteCallbackTest extends TestCase
{
    use RefreshDatabase;

    private function enableGithub(): AuthSettings
    {
        $settings = app(AuthSettings::class);
        $settings->enabled_socialite_providers = ['github'];
        $settings->save();

        return $settings;
    }

    private function makeSocialiteUser(
        string $id = 'provider-123',
        string $email = 'socialuser@example.com',
        string $name = 'Social User',
    ): SocialiteUser {
        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = $id;
        $socialiteUser->email = $email;
        $socialiteUser->name = $name;
        $socialiteUser->token = 'access-token';
        $socialiteUser->refreshToken = 'refresh-token';
        $socialiteUser->avatar = 'https://example.com/avatar.jpg';

        return $socialiteUser;
    }

    private function mockSocialiteDriver(SocialiteUser $socialiteUser): void
    {
        $abstractUser = $socialiteUser;

        Socialite::shouldReceive('driver')
            ->with('github')
            ->andReturn(
                \Mockery::mock(AbstractProvider::class, function (MockInterface $mock) use ($abstractUser) {
                    $mock->shouldReceive('user')->andReturn($abstractUser);
                }),
            );
    }

    public function test_callback_sets_last_social_provider_cookie(): void
    {
        $this->enableGithub();

        $socialiteUser = $this->makeSocialiteUser();
        $this->mockSocialiteDriver($socialiteUser);

        $response = $this->get(route('auth.socialite.callback', ['provider' => 'github']));

        $response->assertRedirect();
        $response->assertCookie('last_social_provider', 'github');
    }

    public function test_returning_user_receives_login_notification_after_social_authentication(): void
    {
        Notification::fake();

        $settings = $this->enableGithub();
        $settings->login_notification_enabled = true;
        $settings->save();

        $user = $this->createUser();
        $socialiteUser = $this->makeSocialiteUser(email: $user->email);
        $this->mockSocialiteDriver($socialiteUser);

        $this->withServerVariables([
            'REMOTE_ADDR' => '203.0.113.12',
            'HTTP_USER_AGENT' => 'Social Browser 1.0',
        ])->get(route('auth.socialite.callback', ['provider' => 'github']));

        Notification::assertSentTo(
            $user,
            LoginNotification::class,
            fn (LoginNotification $notification): bool => $notification->ipAddress === '203.0.113.12'
                && $notification->userAgent === 'Social Browser 1.0',
        );
    }

    public function test_first_time_social_signup_does_not_send_login_notification(): void
    {
        Notification::fake();

        $settings = $this->enableGithub();
        $settings->login_notification_enabled = true;
        $settings->save();

        $socialiteUser = $this->makeSocialiteUser();
        $this->mockSocialiteDriver($socialiteUser);

        $this->get(route('auth.socialite.callback', ['provider' => 'github']));

        $user = User::where('email', $socialiteUser->email)->sole();

        Notification::assertNotSentTo($user, LoginNotification::class);
    }

    public function test_callback_does_not_set_cookie_during_account_linking(): void
    {
        $this->enableGithub();

        $user = $this->createUser();
        $socialiteUser = $this->makeSocialiteUser(email: $user->email);
        $this->mockSocialiteDriver($socialiteUser);

        $response = $this->actingAs($user)
            ->get(route('auth.socialite.callback', ['provider' => 'github']));

        $response->assertRedirect();
        $response->assertCookieMissing('last_social_provider');
    }
}
