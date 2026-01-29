'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import NeumorphicCard from './ui/NeumorphicCard';
import NeumorphicButton from './ui/NeumorphicButton';
import { ChatMessage, ManualSource } from '@/types';

interface ChatInterfaceProps {
    onSendMessage: (message: string) => Promise<{ response: string; sources: ManualSource[] }>;
    disabled?: boolean;
}

export default function ChatInterface({ onSendMessage, disabled = false }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || disabled) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { response, sources } = await onSendMessage(userMessage.content);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                sources,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'エラーが発生しました。もう一度お試しください。',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NeumorphicCard className="w-full h-full flex flex-col" padding="none">
            <div className="p-4 border-b border-[var(--bg-base)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                    AIチャット
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                    マニュアルについて質問してください
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-[var(--text-muted)]">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 opacity-50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <p>マニュアルを取り込んでから</p>
                            <p>質問してください</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 ${message.role === 'user'
                                        ? 'chat-bubble-user'
                                        : 'chat-bubble-assistant'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>

                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-[var(--text-muted)] mb-2">参照元:</p>
                                        <div className="space-y-1">
                                            {message.sources.map((source, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-xs p-2 rounded bg-[var(--bg-base)] text-[var(--text-secondary)]"
                                                >
                                                    📄 {source.manual_title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="chat-bubble-assistant px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="spinner w-4 h-4 border-2" />
                                <span className="text-[var(--text-secondary)]">考え中...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--bg-base)]">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={disabled ? 'マニュアルを取り込んでください' : '質問を入力...'}
                        disabled={disabled || isLoading}
                        className="neumorphic-input flex-1 px-4 py-3 disabled:opacity-50"
                    />
                    <NeumorphicButton
                        type="submit"
                        variant="primary"
                        disabled={!input.trim() || isLoading || disabled}
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
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </NeumorphicButton>
                </div>
            </form>
        </NeumorphicCard>
    );
}
