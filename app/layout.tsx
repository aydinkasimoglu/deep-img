import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const noto_sans = Noto_Sans({
    display: "swap",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DEEP-IMG",
    description: "Tag your images with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${noto_sans.className} antialiased`}>{children}</body>
        </html>
    );
}
