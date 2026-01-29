'use client';

import { useState } from 'react';
import NeumorphicCard from './ui/NeumorphicCard';
import NeumorphicButton from './ui/NeumorphicButton';
import NeumorphicInput from './ui/NeumorphicInput';

interface ManualInputProps {
    onSubmit: (url: string, title?: string) => void;
    loading?: boolean;
}

export default function ManualInput({ onSubmit, loading = false }: ManualInputProps) {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate URL
        try {
            new URL(url);
        } catch {
            setError('有効なURLを入力してください');
            return;
        }

        onSubmit(url, title || undefined);
        setUrl('');
        setTitle('');
    };

    const isPDF = url.toLowerCase().endsWith('.pdf');

    return (
        <NeumorphicCard className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        URLを入力
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        PDFまたはWebページのURLを入力してください
                    </p>
                </div>

                <div className="space-y-4">
                    <NeumorphicInput
                        label="マニュアルURL"
                        type="url"
                        placeholder="https://example.com/manual.pdf"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        fullWidth
                        required
                    />

                    <NeumorphicInput
                        label="タイトル（任意）"
                        type="text"
                        placeholder="製品マニュアル名"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                </div>

                {url && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-base)]">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPDF
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-[var(--accent-blue)]'
                            }`}>
                            {isPDF ? 'PDF' : 'WEB'}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)] truncate">
                            {url}
                        </span>
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-[var(--accent-red)] text-sm">
                        {error}
                    </div>
                )}

                <NeumorphicButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    disabled={!url}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                    マニュアルを取り込む
                </NeumorphicButton>
            </form>
        </NeumorphicCard>
    );
}
