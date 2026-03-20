import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/lib/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Intern Portal",
    template: "%s | Intern Portal",
  },
  description: "Task submission and review portal for internship programs",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <ErrorBoundary>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "8px",
                background: "#333",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
                style: {
                  background: "#ECFDF5",
                  color: "#065F46",
                  border: "1px solid #10B981",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#FEF2F2",
                  color: "#991B1B",
                  border: "1px solid #EF4444",
                },
              },
              loading: {
                duration: 10000,
                style: {
                  background: "#EFF6FF",
                  color: "#1E40AF",
                  border: "1px solid #3B82F6",
                },
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
