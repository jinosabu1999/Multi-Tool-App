import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Script from "next/script"
import { InstallPWAPrompt } from "@/components/install-pwa-prompt"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Multi-Tool App",
  description: "A collection of useful tools in one app",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false"

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex h-screen">
              <MainSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <SidebarTrigger />
                  <div className="flex-1" />
                </header>
                <main className="flex-1 overflow-auto p-6">
                  <div className="container mx-auto">{children}</div>
                </main>
              </div>
            </div>
          </SidebarProvider>
          <InstallPWAPrompt />
          <Toaster />
        </ThemeProvider>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }

              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                document.dispatchEvent(new CustomEvent('showInstallPrompt'));
              });

              window.installPWA = () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                  });
                }
              };
            `,
          }}
        />
      </body>
    </html>
  )
}



import './globals.css'