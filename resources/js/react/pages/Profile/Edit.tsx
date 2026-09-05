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
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n';
import SettingsLayout from '@/layouts/SettingsLayout';
import type { User } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';

type EditProps = {
    user: User & {
        has_uploaded_avatar?: boolean;
        has_password?: boolean;
    };
};

export default function Edit({ user }: EditProps) {
    const t = useT();
    const page = usePage();

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
    });

    /**
     * Object URLs must be revoked or every avatar pick leaks a blob for the
     * lifetime of the page.
     */
    const localPreview = useMemo(
        () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
        [avatarFile],
    );

    useEffect(() => {
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        };
    }, [localPreview]);

    const avatarPreview = localPreview ?? user?.avatar ?? null;
    const hasUploadedAvatar = user?.has_uploaded_avatar ?? false;

    const userInitials = (user?.name ?? '')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatarFile(file);
            setIsUpdatingAvatar(true);

            router.post(
                route('settings.profile.update-avatar'),
                { avatar: file },
                {
                    forceFormData: true,
                    onFinish: () => {
                        setAvatarFile(null);
                        setIsUpdatingAvatar(false);
                    },
                },
            );
        }

        // Reset the input so picking the same file again still fires onChange.
        e.target.value = '';
    };

    const confirmRemoveAvatar = () => {
        setIsRemovingAvatar(true);
        setIsDeleteDialogOpen(false);

        router.delete(route('settings.profile.delete-avatar'), {
            onFinish: () => setIsRemovingAvatar(false),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('settings.profile.update-info'), { preserveScroll: true });
    };

    const avatarError = (page.props.errors as Record<string, string>)?.avatar;

    return (
        <SettingsLayout title={t('Edit Profile')}>
            <PageHeader
                title={t('Edit Profile')}
                backUrl={route('settings.profile')}
            />

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>{t('Profile Information')}</CardTitle>
                    <CardDescription>
                        {t('Update your name and email address')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-8 md:flex-row md:gap-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-2 md:items-start">
                            <div className="group relative">
                                <Avatar className="size-36 border-4 border-gray-300 shadow-lg dark:border-white">
                                    <AvatarImage
                                        src={avatarPreview ?? ''}
                                        alt={user?.name}
                                    />
                                    <AvatarFallback className="text-3xl">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>

                                {(isUpdatingAvatar || isRemovingAvatar) && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                                        <Loader2 className="size-8 animate-spin text-white" />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    id="avatar-upload"
                                    name="avatar"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />

                                {!hasUploadedAvatar &&
                                    !isUpdatingAvatar &&
                                    !isRemovingAvatar && (
                                        <label
                                            htmlFor="avatar-upload"
                                            className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl shadow-md transition-transform hover:scale-110"
                                        >
                                            <Camera className="h-5 w-5" />
                                        </label>
                                    )}

                                {hasUploadedAvatar &&
                                    !isUpdatingAvatar &&
                                    !isRemovingAvatar && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDeleteDialogOpen(true)
                                            }
                                            className="absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}
                            </div>

                            {avatarError && (
                                <div className="text-destructive text-xs">
                                    {avatarError}
                                </div>
                            )}
                        </div>

                        {/* Form Section */}
                        <div className="flex-1">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                data-testid="profile-info-form"
                            >
                                <Field>
                                    <Label htmlFor="name">{t('Name')}</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder={t('Enter your full name')}
                                        autoComplete="name"
                                        required
                                        data-testid="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <FieldError data-testid="name-error">
                                            {errors.name}
                                        </FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <Label htmlFor="email">{t('Email')}</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={t(
                                            'Enter your email address',
                                        )}
                                        autoComplete="email"
                                        required
                                        data-testid="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <FieldError data-testid="email-error">
                                            {errors.email}
                                        </FieldError>
                                    )}
                                </Field>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="rounded-xl"
                                        disabled={processing}
                                    >
                                        {t('Update Profile')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Avatar Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Remove Avatar')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Are you sure you want to remove your avatar? This action cannot be undone.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmRemoveAvatar}
                            disabled={isRemovingAvatar}
                        >
                            {isRemovingAvatar ? t('Removing...') : t('Remove')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SettingsLayout>
    );
}
