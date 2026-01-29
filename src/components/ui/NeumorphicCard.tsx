'use client';

import { ReactNode } from 'react';

interface NeumorphicCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'flat' | 'inset';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const variantClasses = {
    default: 'neumorphic-card',
    flat: 'neumorphic-flat',
    inset: 'neumorphic-inset',
};

export default function NeumorphicCard({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
}: NeumorphicCardProps) {
    return (
        <div
            className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        >
            {children}
        </div>
    );
}
