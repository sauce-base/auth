<?php

namespace Modules\Auth\Settings;

use Spatie\LaravelSettings\Settings;

class AuthSettings extends Settings
{
    public bool $magic_link_enabled;

    public int $magic_link_expiry;

    public bool $login_notification_enabled;

    public static function group(): string
    {
        return 'auth';
    }
}
