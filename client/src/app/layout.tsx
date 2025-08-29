import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/providers/ReduxProvider";
import GetLoginUser from "@/components/GetLoginUser";
import ConnectToServer from "@/components/ConnectToServer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automate Things",
  description: "Automate your facebook account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" richColors swipeDirections={["left"]} />
        <ReduxProvider>
          <ConnectToServer>
            {/* <>{children}</> */}
            <GetLoginUser>{children}</GetLoginUser>
          </ConnectToServer>
        </ReduxProvider>
      </body>
    </html>
  );
}
