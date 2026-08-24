<?php

namespace Modules\Auth\Filament\Pages;

use App\Filament\Pages\SettingsPage;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Modules\Auth\Settings\AuthSettings;

class AuthenticationSettings extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedKey;

    protected static ?int $navigationSort = 1;

    protected static string $settings = AuthSettings::class;

    public static function getNavigationLabel(): string
    {
        return __('Authentication');
    }

    public function getTitle(): string
    {
        return __('Authentication Settings');
    }

    public function form(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            Section::make(__('Magic Link Authentication'))
                ->description(__('Configure passwordless authentication by email.'))
                ->icon(Heroicon::OutlinedKey)
                ->schema([
                    Toggle::make('magic_link_enabled')
                        ->label(__('Enable magic link authentication')),
                    TextInput::make('magic_link_expiry')
                        ->label(__('Link expiry'))
                        ->integer()
                        ->required()
                        ->minValue(1)
                        ->suffix(__('minutes')),
                ])
                ->columns(1),
            Section::make(__('auth::auth.notifications.title'))
                ->description(__('auth::auth.notifications.description'))
                ->icon(Heroicon::OutlinedBellAlert)
                ->schema([
                    Toggle::make('login_notification_enabled')
                        ->label(__('auth::auth.notifications.login-enabled'))
                        ->helperText(__('auth::auth.notifications.login-help')),
                ])
                ->columns(1),
        ]);
    }
}
