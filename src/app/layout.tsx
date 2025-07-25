// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ResumeProvider } from '@/context/ResumeContext';
// import Header from '@/components/Header'; // Header is now rendered in page.tsx

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resume_pro',
  description: 'Build your professional resume quickly with AI enhancements',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} animated-gradient-background`}> {/* ADDED animated-gradient-background */}
        {/* The Header component is now rendered in page.tsx as a client component */}
        <ResumeProvider>
          {children}
        </ResumeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}