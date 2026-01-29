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

    const startScanning = useCallback(async () => {
        if (!containerRef.current) return;

        try {
            setError(null);
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // Check if it's a valid URL
                    try {
                        new URL(decodedText);
                        setLastScanned(decodedText);
                        onScan(decodedText);
                        // Stop scanning after successful read
                        stopScanning();
                    } catch {
                        // Not a valid URL, continue scanning
                    }
                },
                () => {
                    // QR code not found - this is normal, scanner keeps trying
                }
            );

            setIsScanning(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'カメラを起動できませんでした';
            setError(errorMessage);
            setIsScanning(false);
        }
    }, [onScan]);

    const stopScanning = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current = null;
            } catch {
                // Ignore stop errors
            }
        }
        setIsScanning(false);
    }, []);

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, [stopScanning]);

    return (
        <NeumorphicCard className="w-full">
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        QRコードをスキャン
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        マニュアルのQRコードをカメラにかざしてください
                    </p>
                </div>

                <div className="relative">
                    <div
                        id="qr-reader"
                        ref={containerRef}
                        className={`
              w-full aspect-square max-w-[300px] mx-auto
              rounded-2xl overflow-hidden
              neumorphic-inset
              ${!isScanning ? 'flex items-center justify-center bg-[var(--bg-base)]' : ''}
            `}
                    >
                        {!isScanning && (
                            <div className="text-center p-8">
                                <svg
                                    className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                    />
                                </svg>
                                <p className="text-[var(--text-muted)]">
                                    スキャンを開始してください
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="text-center p-4 rounded-xl bg-red-50 text-[var(--accent-red)]">
                        <p>{error}</p>
                    </div>
                )}

                {lastScanned && (
                    <div className="text-center p-4 rounded-xl bg-green-50">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">検出されたURL:</p>
                        <p className="text-[var(--accent-green)] font-medium break-all text-sm">
                            {lastScanned}
                        </p>
                    </div>
                )}

                <div className="flex justify-center">
                    {!isScanning ? (
                        <NeumorphicButton variant="primary" onClick={startScanning}>
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
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            スキャン開始
                        </NeumorphicButton>
                    ) : (
                        <NeumorphicButton variant="danger" onClick={stopScanning}>
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            スキャン停止
                        </NeumorphicButton>
                    )}
                </div>
            </div>
        </NeumorphicCard>
    );
}
