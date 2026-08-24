import CardLayout from '@/layouts/CardLayout';
import type { ReactNode } from 'react';

interface AuthCardLayoutProps {
    title?: string;
    description?: string;
    cardClass?: string;
    children: ReactNode;
    outside?: ReactNode;
}

/**
 * The auth module's name for the shared centred-card layout.
 *
 * The presentation moved to core so that naming a workspace looks like signing up rather
 * than like a different product. This wrapper stays so the module's pages keep their own
 * vocabulary, and so anything auth-specific has an obvious home later.
 */
export default function AuthCardLayout({
    title,
    description,
    cardClass,
    children,
    outside,
}: AuthCardLayoutProps) {
    return (
        <CardLayout
            title={title}
            description={description}
            cardClass={cardClass}
            outside={outside}
        >
            {children}
        </CardLayout>
    );
}
