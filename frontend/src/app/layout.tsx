import './globals.css';
import NavBar from '@/components/NavBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata = {
  title: 'DevTrivia',
  description: 'A real-time quiz platform for tech enthusiasts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <ErrorBoundary>
          <NavBar />
        </ErrorBoundary>
        <main className="container mx-auto py-8 px-4">
          <ErrorBoundary>
            <div className="relative z-10">{children}</div>
          </ErrorBoundary>
          
          {/* Background decorative elements */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
          </div>
        </main>
      </body>
    </html>
  );
}
