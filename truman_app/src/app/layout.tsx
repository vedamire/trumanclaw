import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  variable: '--font-pixel',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Trumanclaw - Gamble with Death',
  description: 'A dark betting game where you predict tomorrow\'s death count. Will it be higher or lower? Place your bets and test your mortality intuition.',
  keywords: ['betting', 'game', 'prediction', 'dark theme'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${pixelFont.variable} antialiased bg-black font-pixel`}
      >
        {children}
      </body>
    </html>
  );
}
