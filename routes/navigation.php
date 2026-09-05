<?php

use App\Facades\Navigation;
use App\Navigation\Section;

/*
|--------------------------------------------------------------------------
| Auth Module Navigation
|--------------------------------------------------------------------------
|
| Define Auth module navigation items here.
| These items will be loaded automatically when the module is enabled.
|
*/

// User menu - Settings
Navigation::add('Settings', fn () => route('settings.profile'), function (Section $section) {
    $section->attributes([
        'group' => 'user',
        'slug' => 'settings',
        'icon' => 'settings',
        'order' => 10,
    ]);
});

// Settings sidebar - Profile
Navigation::add('Profile', fn () => route('settings.profile'), function (Section $section) {
    $section->attributes([
        'group' => 'settings',
        'slug' => 'profile',
        'icon' => 'profile',
        'order' => 10,
    ]);
});

// User menu - Logout
Navigation::add('Log out', '#', function (Section $section) {
    $section->attributes([
        'group' => 'user',
        'action' => 'logout',
        'slug' => 'logout',
        'icon' => 'logout',
        'order' => 100,
    ]);
});
