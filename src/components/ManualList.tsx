'use client';

import { Manual } from '@/types';
import NeumorphicCard from './ui/NeumorphicCard';
import NeumorphicButton from './ui/NeumorphicButton';

interface ManualListProps {
    manuals: Manual[];
    onDelete: (id: string) => void;
    loading?: boolean;
}

export default function ManualList({ manuals, onDelete, loading = false }: ManualListProps) {
    if (loading) {
        return (
            <NeumorphicCard className="w-full">
                <div className="flex items-center justify-center py-8">
                    <div className="spinner" />
                </div>
            </NeumorphicCard>
        );
    }

    if (manuals.length === 0) {
        return (
            <NeumorphicCard className="w-full">
                <div className="text-center py-8">
                    <svg
                        className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-[var(--text-muted)]">
                        マニュアルがまだありません
                    </p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        QRスキャンまたはURL入力で追加してください
                    </p>
                </div>
            </NeumorphicCard>
        );
    }

    return (
        <NeumorphicCard className="w-full" padding="sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 px-2">
                取り込み済みマニュアル ({manuals.length})
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {manuals.map((manual) => (
                    <div
                        key={manual.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] hover:bg-white transition-colors"
                    >
                        <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${manual.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'}
            `}>
                            {manual.type === 'pdf' ? (
                                <svg
                                    className="w-5 h-5 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 text-[var(--accent-blue)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                    />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[var(--text-primary)] truncate">
                                {manual.title}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] truncate">
                                {manual.chunk_count} チャンク • {new Date(manual.created_at).toLocaleDateString('ja-JP')}
                            </p>
                        </div>

                        <NeumorphicButton
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(manual.id)}
                            className="text-[var(--accent-red)] hover:bg-red-50"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </NeumorphicButton>
                    </div>
                ))}
            </div>
        </NeumorphicCard>
    );
}
