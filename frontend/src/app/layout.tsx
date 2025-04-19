import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'DevTrivia',
  description: 'A real-time quiz platform for tech enthusiasts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto py-8">{children}</main>
      </body>
    </html>
  );
}
