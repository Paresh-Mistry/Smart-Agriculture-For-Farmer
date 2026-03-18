"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@component/components/common/NavbarWrapper";
import { Button } from "@component/components/ui/button";
import { BotMessageSquare } from "lucide-react";
import { useState } from "react";
import AIAssistant from "@component/components/common/MessageBox";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@component/hooks/translation/useLanguage";
import { AutoTranslate } from "@component/components/common/AutoTranslate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showMessageBox, setShowMessageBox] = useState(false);

  const queryClient = new QueryClient();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <AutoTranslate>
              <NavbarWrapper />
              <div className="fixed z-20 space-y-12 bottom-6 right-6">
                {showMessageBox && <AIAssistant />}
                <Button onClick={() => setShowMessageBox(!showMessageBox)}>
                  <BotMessageSquare />
                </Button>
              </div>
              {children}
            </AutoTranslate>
          </QueryClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


