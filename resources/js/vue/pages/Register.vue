<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import InputField from '@/components/ui/input/InputField.vue';
import { Form, Link, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import SocialiteProviders from '../components/SocialiteProviders.vue';
import AuthCardLayout from '../layouts/AuthCardLayout.vue';

const page = usePage();
const termsError = computed(() => page.props.errors?.terms);

const nameRef = ref('');
const emailRef = ref('');
const passwordRef = ref('');
const termsRef = ref(false);

const canSubmit = computed(
    () =>
        !!nameRef.value.trim() &&
        !!emailRef.value.trim() &&
        !!passwordRef.value &&
        termsRef.value,
);
</script>

<template>
    <AuthCardLayout
        :title="$t('Create your account')"
        :description="$t('Sign up for Saucebase to start building your SaaS')"
    >
        <SocialiteProviders />

        <Form
            :action="route('register')"
            method="post"
            class="space-y-3"
            data-testid="register-form"
            disable-while-processing
            :reset-on-error="['password']"
        >
            <!-- Name -->
            <InputField
                name="name"
                type="text"
                :label="$t('Name')"
                :placeholder="$t('Enter your full name')"
                autocomplete="name"
                v-model="nameRef"
            />

            <!-- Email -->
            <InputField
                name="email"
                type="email"
                :label="$t('Email')"
                :placeholder="$t('Enter your email')"
                autocomplete="email"
                v-model="emailRef"
            />

            <!-- Password -->
            <InputField
                name="password"
                type="password"
                :label="$t('Password')"
                :placeholder="$t('Enter your password')"
                autocomplete="new-password"
                required
                v-model="passwordRef"
            />

            <!-- Terms & Privacy -->
            <Field
                orientation="horizontal"
                class="mt-6 items-start"
                :data-invalid="!!termsError"
            >
                <Checkbox
                    id="terms"
                    name="terms"
                    data-testid="terms-checkbox"
                    :aria-invalid="!!termsError"
                    v-model="termsRef"
                />
                <FieldLabel
                    for="terms"
                    class="text-sm leading-snug font-normal"
                >
                    {{ $t('I agree to the') }}
                    <Link
                        :href="route('terms')"
                        class="text-primary font-medium underline-offset-4 hover:underline"
                        data-testid="terms-link"
                    >
                        {{ $t('Terms of Service') }}
                    </Link>
                    {{ $t('and the') }}
                    <Link
                        :href="route('privacy')"
                        class="text-primary font-medium underline-offset-4 hover:underline"
                        data-testid="privacy-link"
                    >
                        {{ $t('Privacy Policy') }}
                    </Link>
                </FieldLabel>
            </Field>
            <FieldError v-if="termsError" data-testid="terms-error">
                {{ termsError }}
            </FieldError>

            <Button
                type="submit"
                class="mt-3 w-full"
                data-testid="register-button"
                :disabled="!canSubmit"
            >
                {{ $t('Register') }}
            </Button>

            <p
                class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400"
            >
                {{ $t('Already registered?') }}
                <Link
                    :href="route('login')"
                    class="text-primary font-medium underline-offset-4 hover:underline"
                    data-testid="login-link"
                >
                    {{ $t('Log in') }}
                </Link>
            </p>
        </Form>
    </AuthCardLayout>
</template>
