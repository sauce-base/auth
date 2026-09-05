<?php

namespace Modules\Auth\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_index_redirects_authenticated_user_to_profile(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user)->get(route('settings.index'));

        $response->assertRedirectToRoute('settings.profile');
    }

    public function test_settings_navigation_only_contains_profile(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user)->get(route('settings.profile'));

        $this->assertSame(
            ['Profile'],
            array_column($response->inertiaProps('navigation.settings'), 'title'),
        );
    }
}
