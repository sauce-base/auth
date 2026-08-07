<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Form, Link } from '@inertiajs/vue3';
import AuthCardLayout from '../layouts/AuthCardLayout.vue';
</script>

<template>
    <AuthCardLayout :title="$t('We are glad you signed up!')">
        <Form
            :action="route('verification.send')"
            method="post"
            class="max-w-md min-w-sm space-y-3 text-center"
            data-testid="verify-email-form"
            disable-while-processing
        >
            <p class="mb-3 leading-relaxed text-gray-600 dark:text-gray-400">
                {{
                    $t(
                        'Before getting started, could you verify your email address by clicking on the link we just emailed to you?',
                    )
                }}
            </p>
            <p class="mb-10 leading-relaxed text-gray-600 dark:text-gray-400">
                {{
                    $t(
                        'If you did not receive the email, you can click the button below to request another.',
                    )
                }}
            </p>
            <Button type="submit" class="w-full">
                {{ $t('Resend Verification Email') }}
            </Button>

            <p
                class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
            >
                <Link
                    :href="route('logout')"
                    method="post"
                    as="button"
                    class="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                    data-testid="logout-link"
                >
                    {{ $t('Log Out') }}
                </Link>
            </p>
        </Form>
    </AuthCardLayout>
</template>
