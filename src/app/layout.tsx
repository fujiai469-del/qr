import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Manual AI Manager - Clean White Edition',
  description: 'QRコードやURLから製品マニュアルを取り込み、AIが質問に回答するアプリ',
  keywords: ['マニュアル', 'AI', 'QRコード', 'PDF', 'チャット'],
  authors: [{ name: 'Manual AI Manager' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#F0F2F5" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
