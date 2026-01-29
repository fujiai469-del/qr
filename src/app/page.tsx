'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ManualInput from '@/components/ManualInput';
import ChatInterface from '@/components/ChatInterface';
import ManualList from '@/components/ManualList';
import NeumorphicButton from '@/components/ui/NeumorphicButton';
import { Manual, ManualSource } from '@/types';

// Dynamically import QRScanner to avoid SSR issues with camera
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => (
    <div className="neumorphic-card p-6 flex items-center justify-center">
      <div className="spinner" />
    </div>
  ),
});

type TabType = 'scan' | 'url' | 'chat';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch manuals on mount
  const fetchManuals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/manuals');
      const data = await response.json();
      if (data.manuals) {
        setManuals(data.manuals);
      }
    } catch (error) {
      console.error('Failed to fetch manuals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManuals();
  }, [fetchManuals]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle URL submission (from QR or manual input)
  const handleIngest = async (url: string, title?: string) => {
    setIsIngesting(true);
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', data.message || 'マニュアルを取り込みました');
        fetchManuals();
        setActiveTab('chat');
      } else {
        showNotification('error', data.error || '取り込みに失敗しました');
      }
    } catch (error) {
      console.error('Ingest error:', error);
      showNotification('error', '取り込みに失敗しました');
    } finally {
      setIsIngesting(false);
    }
  };

  // Handle manual deletion
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/manuals?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setManuals((prev) => prev.filter((m) => m.id !== id));
        showNotification('success', 'マニュアルを削除しました');
      } else {
        showNotification('error', '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('error', '削除に失敗しました');
    }
  };

  // Handle chat message
  const handleSendMessage = async (message: string): Promise<{ response: string; sources: ManualSource[] }> => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      response: data.message,
      sources: data.sources || [],
    };
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'scan',
      label: 'QRスキャン',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      id: 'url',
      label: 'URL入力',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      id: 'chat',
      label: 'AIチャット',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="neumorphic-card m-4 sm:m-6 !rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-blue-light)] flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Manual AI Manager
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Clean White Edition
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
            {manuals.length} マニュアル登録済み
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-fade-in
          ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tabs & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="neumorphic p-2 flex gap-2">
              {tabs.map((tab) => (
                <NeumorphicButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'default'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 ${activeTab === tab.id ? '' : 'opacity-70'}`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </NeumorphicButton>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {activeTab === 'scan' && (
                <QRScanner onScan={(url) => handleIngest(url)} />
              )}
              {activeTab === 'url' && (
                <ManualInput onSubmit={handleIngest} loading={isIngesting} />
              )}
              {activeTab === 'chat' && (
                <ChatInterface
                  onSendMessage={handleSendMessage}
                  disabled={manuals.length === 0}
                />
              )}
            </div>
          </div>

          {/* Right Column - Manual List */}
          <div className="lg:col-span-1">
            <ManualList
              manuals={manuals}
              onDelete={handleDelete}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
