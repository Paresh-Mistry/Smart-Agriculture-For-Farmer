"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@component/components/common/NavbarWrapper";
import { Button } from "@component/components/ui/button";
import { AirplayIcon, Bot, BotMessageSquare } from "lucide-react";
import { useState } from "react";
import AIAssistant from "@component/components/common/MessageBox";

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

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarWrapper />
        <div className="absolute space-y-12 bottom-6 right-6">
          {showMessageBox && <AIAssistant />}
          <Button onClick={() => setShowMessageBox(!showMessageBox)}><BotMessageSquare /></Button>
        </div>
        {children}

      </body>
    </html>
  );
}
