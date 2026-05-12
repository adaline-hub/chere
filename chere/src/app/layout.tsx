import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chère — Turn your love into something they can keep",
  description:
    "Create beautiful, personalized digital gift experiences — memory tributes, gift reveals, surprise trips — for the people (and pets) you love most.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Chère",
    description: "Turn your love into something they can keep.",
    siteName: "Chère",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chère",
    description: "Turn your love into something they can keep.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linen text-espresso antialiased">
        {children}
      </body>
    </html>
  );
}
