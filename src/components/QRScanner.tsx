'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import NeumorphicCard from './ui/NeumorphicCard';
import NeumorphicButton from './ui/NeumorphicButton';

interface QRScannerProps {
    onScan: (url: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const stopScanning = useCallback(async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.warn('Failed to stop scanner:', err);
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    }, []);

    const startScanning = useCallback(async () => {
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!containerRef.current) return;

        try {
            setError(null);
            setIsScanning(true);

            // Cleanup previous instance if exists
            if (scannerRef.current) {
                await stopScanning();
            }

            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            // Calculate qrbox size based on viewport
            const width = Math.min(window.innerWidth, window.innerHeight);
            const qrBoxSize = Math.floor(width * 0.7); // 70% of screen

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: qrBoxSize, height: qrBoxSize },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Check if it's a valid URL
                    try {
                        new URL(decodedText);
                        setLastScanned(decodedText);
                        onScan(decodedText);
                        stopScanning();
                    } catch {
                        // Not a valid URL, continue scanning
                    }
                },
                () => {
                    // QR code not found - ignore
                }
            );

        } catch (err) {
            console.error('Scanner start error:', err);
            const errorMessage = err instanceof Error ? err.message : 'カメラを起動できませんでした';
            setError(errorMessage);
            // Don't stop immediate scanning state to show error in modal
        }
    }, [onScan, stopScanning]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, [stopScanning]);

    return (
        <div className="w-full">
            <NeumorphicCard className="w-full text-center py-8">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-base)] neumorphic-inset mb-4 text-[var(--accent-blue)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">QRコード読み取り</h3>
                    <p className="text-[var(--text-secondary)] text-sm">カメラを起動してスキャンします</p>
                </div>

                <NeumorphicButton variant="primary" onClick={startScanning} className="w-full max-w-xs mx-auto">
                    カメラを起動
                </NeumorphicButton>

                {lastScanned && (
                    <div className="mt-6 p-4 rounded-xl bg-green-50 animate-fade-in">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">スキャン完了:</p>
                        <p className="text-[var(--accent-green)] font-medium text-sm break-all">{lastScanned}</p>
                    </div>
                )}
            </NeumorphicCard>

            {/* Full Screen Scanner Modal */}
            {isScanning && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <p className="text-white font-medium text-lg drop-shadow-md">スキャン中...</p>
                        <button
                            onClick={stopScanning}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div id="qr-reader" ref={containerRef} className="w-full max-w-md bg-black" />

                    {error && (
                        <div className="absolute bottom-10 px-6 w-full max-w-sm">
                            <div className="bg-red-500/90 text-white p-4 rounded-xl text-center backdrop-blur-sm shadow-lg">
                                <p className="text-sm font-medium">{error}</p>
                                <button onClick={stopScanning} className="mt-2 text-xs underline opacity-80">閉じる</button>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-12 text-white/70 text-sm pointer-events-none">
                        QRコードを枠内にあわせてください
                    </div>
                </div>
            )}
        </div>
    );
}
