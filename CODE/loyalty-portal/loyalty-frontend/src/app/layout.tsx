import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cardify Rewards Portal',
  description: 'Hệ thống tích điểm & đổi quà Loyalty',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}