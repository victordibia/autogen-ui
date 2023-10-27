import "./globals.css";

// import { Analytics } from '@vercel/analytics/react';
import Nav from "./nav";
import { Suspense } from "react";

export const metadata = {
  title: "AutoGen UI",
  description:
    "AutoGen UI is a web-based interface for building AutoGen agents.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50 light">
      <body className="h-full ">
        <Suspense>
          <Nav />
        </Suspense>
        <div
          style={{ height: "calc(100vh - 64px)" }}
          className="p-4 md:p-10 mx-auto max-w-7xl"
        >
          {children}
        </div>
      </body>
    </html>
  );
}
