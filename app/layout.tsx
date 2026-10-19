import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = { title: 'ELORA WOMAN - Thời trang công sở và tư vấn phối đồ', description: 'Thời trang công sở cho phụ nữ hiện đại, kèm dịch vụ tư vấn phối đồ cá nhân hóa.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
      </head>
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
