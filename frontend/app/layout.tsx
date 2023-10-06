import './globals.css';

// import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import Toast from './toast';
import { Suspense } from 'react';

export const metadata = {
  title: 'Next.js 13 + PlanetScale + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, PlanetScale, NextAuth, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full ">
        <Suspense>
          <Nav />
        </Suspense>
        <div
          style={{ height: 'calc(100vh - 64px)' }}
          className="p-4 md:p-10 mx-auto max-w-7xl"
        >
          {children}
        </div>
      </body>
    </html>
  );
}
