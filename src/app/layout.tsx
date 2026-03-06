import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Pelestarian Bahasa Dayak Ngaju',
  description: 'Aplikasi Pembelajaran dan Pelestarian Bahasa Dayak Ngaju Interaktif untuk Siswa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-8 text-center text-muted-foreground border-t border-border mt-12">
          <p>© {new Date().getFullYear()} Pelestarian Bahasa Dayak Ngaju - Lestarikan Budaya Lewat Bahasa</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
