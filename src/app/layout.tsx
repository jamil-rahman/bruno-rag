import type { Metadata } from "next";
import { Roboto, Raleway } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bruno | Your Friendly Cloud Advisor",
  description: "An intelligent chatbot powered by RAG technology to answer your questions about investments in Canada",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" }
    ],
    apple: { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    shortcut: { url: "/favicon.png" }
  },
  openGraph: {
    title: "Bruno | Your Friendly Cloud Advisor",
    description: "An intelligent chatbot powered by RAG technology to answer your questions about investments in Canada",
    images: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${raleway.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
