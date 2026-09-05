import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n';
import SettingsLayout from '@/layouts/SettingsLayout';
import { Link, useForm } from '@inertiajs/react';
import PageHeader from '../../components/PageHeader';

export default function ChangePassword() {
    const t = useT();

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('settings.profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <SettingsLayout title={t('Change Password')}>
            <PageHeader
                title={t('Change Password')}
                backUrl={route('settings.profile')}
            />

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>{t('Update Password')}</CardTitle>
                    <CardDescription>
                        {t(
                            'Ensure your account is using a long, random password to stay secure.',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                        data-testid="change-password-form"
                    >
                        <Field>
                            <Label htmlFor="current_password">
                                {t('Current Password')}
                            </Label>
                            <Input
                                id="current_password"
                                name="current_password"
                                type="password"
                                placeholder={t('Enter your current password')}
                                autoComplete="current-password"
                                required
                                data-testid="current_password"
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                            />
                            {errors.current_password && (
                                <FieldError data-testid="current_password-error">
                                    {errors.current_password}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <Label htmlFor="password">
                                {t('New Password')}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={t('Enter your new password')}
                                autoComplete="new-password"
                                required
                                data-testid="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            {errors.password && (
                                <FieldError data-testid="password-error">
                                    {errors.password}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <Label htmlFor="password_confirmation">
                                {t('Confirm Password')}
                            </Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                placeholder={t('Confirm your new password')}
                                autoComplete="new-password"
                                required
                                data-testid="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>

                        <div className="flex justify-end gap-2 pt-2">
                            <Link href={route('settings.profile')}>
                                <Button type="button" variant="outline">
                                    {t('Cancel')}
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {t('Update Password')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </SettingsLayout>
    );
}
