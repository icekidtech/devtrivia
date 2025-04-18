import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'DevTrivia',
  description: 'A real-time quiz platform for tech enthusiasts.',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto py-8">{children}</main>
      </body>
    </html>
  );
}
