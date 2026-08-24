<?php

namespace Modules\Auth\Listeners;

use Modules\Auth\Events\ReturningUserAuthenticated;
use Modules\Auth\Notifications\LoginNotification;
use Modules\Auth\Settings\AuthSettings;

class SendLoginNotification
{
    public function __construct(
        private AuthSettings $settings,
    ) {}

    public function handle(ReturningUserAuthenticated $event): void
    {
        if (! $this->settings->login_notification_enabled) {
            return;
        }

        $event->user->notify(new LoginNotification(
            loggedInAt: $event->loggedInAt,
            ipAddress: $event->ipAddress,
            userAgent: $event->userAgent,
        ));
    }
}
