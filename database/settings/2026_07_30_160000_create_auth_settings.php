<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('auth.magic_link_enabled', true);
        $this->migrator->add('auth.magic_link_expiry', 15);
    }
};
