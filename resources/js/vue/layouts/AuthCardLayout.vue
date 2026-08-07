<script setup lang="ts">
import CardLayout from '@/layouts/CardLayout.vue';

/**
 * The auth module's name for the shared centred-card layout.
 *
 * The presentation moved to core so that naming a workspace looks like signing up rather
 * than like a different product. This wrapper stays so the module's pages keep their own
 * vocabulary, and so anything auth-specific has an obvious home later.
 */
defineProps<{
    title?: string;
    description?: string;
    cardClass?: string | object;
}>();
</script>

<template>
    <CardLayout
        :title="title"
        :description="description"
        :card-class="cardClass"
    >
        <slot />

        <template #outside>
            <slot name="outside" />
        </template>
    </CardLayout>
</template>
