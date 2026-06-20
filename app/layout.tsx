import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChargedLife",
  description: "Start broke. Die legendary.",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "ChargedLife",
    description: "Start broke. Die legendary.",
    siteName: "ChargedLife",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "ChargedLife logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ChargedLife",
    description: "Start broke. Die legendary.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}