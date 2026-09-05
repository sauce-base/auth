import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useT } from '@/i18n';
import SettingsLayout from '@/layouts/SettingsLayout';
import type { User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import IconGithub from '~icons/simple-icons/github';
import IconGoogle from '~icons/simple-icons/google';

type SocialiteProvider = {
    name: string;
    label: string;
};

type SocialAccount = {
    provider: string;
    last_login_at: string;
    provider_avatar_url?: string;
};

type ProfileProps = {
    user: User & {
        social_accounts?: SocialAccount[];
    };
    available_providers?: SocialiteProvider[];
};

const providerIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    google: IconGoogle,
    github: IconGithub,
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(date: string | null): string {
    if (!date) return 'Never';

    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatLastLogin(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Profile({ user, available_providers }: ProfileProps) {
    const t = useT();
    const page = usePage();

    const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
    const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
    const [providerToDisconnect, setProviderToDisconnect] = useState<
        string | null
    >(null);

    const enabledProviders = useMemo<SocialiteProvider[]>(() => {
        const auth = page.props.auth as {
            socialite_providers?: SocialiteProvider[];
        };

        return auth?.socialite_providers ?? [];
    }, [page.props.auth]);

    const enabledProviderNames = useMemo(
        () => new Set(enabledProviders.map((provider) => provider.name)),
        [enabledProviders],
    );

    /**
     * Providers currently enabled, plus any the user is still connected to even
     * though the provider has since been disabled — otherwise a user could never
     * disconnect an account belonging to a turned-off provider.
     */
    const socialiteProviders = useMemo<SocialiteProvider[]>(() => {
        const configuredProviders = new Map(
            (available_providers ?? []).map((provider) => [
                provider.name,
                provider,
            ]),
        );
        const providers = new Map(
            enabledProviders.map((provider) => [provider.name, provider]),
        );

        for (const account of user.social_accounts ?? []) {
            if (!providers.has(account.provider)) {
                providers.set(
                    account.provider,
                    configuredProviders.get(account.provider) ?? {
                        name: account.provider,
                        label: account.provider,
                    },
                );
            }
        }

        return [...providers.values()];
    }, [available_providers, enabledProviders, user.social_accounts]);

    const hasSocialiteProviders =
        route().has('auth.socialite.redirect') && socialiteProviders.length > 0;

    const isProviderConnected = (providerName: string): boolean =>
        user.social_accounts?.some(
            (account) => account.provider === providerName,
        ) ?? false;

    const getConnectedAccount = (providerName: string) =>
        user.social_accounts?.find(
            (account) => account.provider === providerName,
        );

    const initiateDisconnect = (provider: string) => {
        setProviderToDisconnect(provider);
        setIsDisconnectDialogOpen(true);
    };

    const confirmDisconnect = () => {
        if (!providerToDisconnect) return;

        const provider = providerToDisconnect;
        setIsDisconnecting(provider);
        setIsDisconnectDialogOpen(false);

        router.delete(route('auth.socialite.disconnect', provider), {
            onFinish: () => {
                setIsDisconnecting(null);
                setProviderToDisconnect(null);
            },
            onError: () => setIsDisconnecting(null),
        });
    };

    return (
        <SettingsLayout title="Profile">
            <div className="grid gap-6">
                {/* Profile Overview Card */}
                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>{t('Profile Information')}</CardTitle>
                        <CardDescription>
                            {t('Your personal information and account details')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                            <div className="flex justify-center sm:justify-start">
                                <Avatar className="ring-border h-24 w-24 ring-2">
                                    <AvatarImage
                                        src={user.avatar ?? ''}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="grid gap-4">
                                    <div>
                                        <div className="text-muted-foreground text-sm font-medium">
                                            {t('Name')}
                                        </div>
                                        <div className="mt-1 text-lg font-semibold">
                                            {user.name}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground text-sm font-medium">
                                            {t('Email')}
                                        </div>
                                        <div className="mt-1 text-lg font-semibold">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-muted-foreground text-sm font-medium">
                                        {t('Last Login')}
                                    </div>
                                    <div className="mt-1">
                                        {formatDate(user.last_login_at)}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Link href={route('settings.profile.edit')}>
                                        <Button variant="outline">
                                            {t('Edit Profile')}
                                        </Button>
                                    </Link>
                                    <Link
                                        href={route(
                                            'settings.profile.password.edit',
                                        )}
                                    >
                                        <Button variant="outline">
                                            {t('Change Password')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Connected Social Accounts */}
                {hasSocialiteProviders && (
                    <Card className="max-w-3xl">
                        <CardHeader>
                            <CardTitle>{t('Connected Accounts')}</CardTitle>
                            <CardDescription>
                                {t(
                                    'Manage your connected social login providers',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {socialiteProviders.map((provider) => {
                                    const ProviderIcon =
                                        providerIcons[
                                            provider.name.toLowerCase()
                                        ];
                                    const connected = isProviderConnected(
                                        provider.name,
                                    );

                                    return (
                                        <div
                                            key={provider.name}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                            data-testid={`socialite-account-${provider.name}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {ProviderIcon && (
                                                    <ProviderIcon
                                                        className={
                                                            connected
                                                                ? 'size-6'
                                                                : 'size-6 opacity-50'
                                                        }
                                                    />
                                                )}

                                                <div>
                                                    <p className="font-medium">
                                                        {provider.label}
                                                    </p>
                                                    {connected ? (
                                                        <p className="text-muted-foreground text-sm">
                                                            {t('Last login')}:{' '}
                                                            {formatLastLogin(
                                                                getConnectedAccount(
                                                                    provider.name,
                                                                )
                                                                    ?.last_login_at ??
                                                                    '',
                                                            )}
                                                        </p>
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm">
                                                            {t('Not connected')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {connected ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            initiateDisconnect(
                                                                provider.name,
                                                            )
                                                        }
                                                        data-testid={`disconnect-socialite-${provider.name}`}
                                                        disabled={
                                                            isDisconnecting ===
                                                            provider.name
                                                        }
                                                    >
                                                        {isDisconnecting ===
                                                            provider.name && (
                                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                                        )}
                                                        {isDisconnecting ===
                                                        provider.name
                                                            ? t(
                                                                  'Disconnecting...',
                                                              )
                                                            : t('Disconnect')}
                                                    </Button>
                                                ) : (
                                                    enabledProviderNames.has(
                                                        provider.name,
                                                    ) && (
                                                        <Button
                                                            asChild
                                                            variant="default"
                                                            size="sm"
                                                            data-testid={`connect-socialite-${provider.name}`}
                                                        >
                                                            <a
                                                                href={route(
                                                                    'auth.socialite.redirect',
                                                                    provider.name,
                                                                )}
                                                            >
                                                                {t('Connect')}
                                                            </a>
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Disconnect Social Account Confirmation Dialog */}
            <Dialog
                open={isDisconnectDialogOpen}
                onOpenChange={setIsDisconnectDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('Disconnect Social Account')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'Are you sure you want to disconnect this social account? You can reconnect it anytime.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            data-testid="cancel-socialite-disconnect"
                            onClick={() => setIsDisconnectDialogOpen(false)}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            data-testid="confirm-socialite-disconnect"
                            onClick={confirmDisconnect}
                        >
                            {t('Disconnect')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SettingsLayout>
    );
}
