import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'مرکز پایش خودرو چاره', description: 'پنل مشاهده‌ای عملیات، ناوگان و درآمد خودرو چاره', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="fa" dir="rtl"><body>{children}</body></html>; }
