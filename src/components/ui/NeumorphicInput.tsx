'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface NeumorphicInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

const NeumorphicInput = forwardRef<HTMLInputElement, NeumorphicInputProps>(
    ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            neumorphic-input
            w-full
            px-4 py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            ${error ? 'ring-2 ring-[var(--accent-red)]' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-[var(--accent-red)]">{error}</p>
                )}
            </div>
        );
    }
);

NeumorphicInput.displayName = 'NeumorphicInput';

export default NeumorphicInput;
