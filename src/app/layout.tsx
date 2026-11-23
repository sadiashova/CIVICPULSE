import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../components/ToastNotification';
import { CivicPulseProvider } from '../context/CivicPulseContext';

export const metadata: Metadata = {
  title: 'CivicPulse — Advanced Smart City Infrastructure Management Platform',
  description: 'A GovTech platform connecting citizens, municipal departments, and field maintenance teams to report, triage, assign, and resolve public infrastructure issues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900 selection:bg-sky-500 selection:text-white">
        <ToastProvider>
          <CivicPulseProvider>
            {children}
          </CivicPulseProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
