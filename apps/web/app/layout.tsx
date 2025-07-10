import type { Metadata } from "next";
import "@/global.css";

export const metadata: Metadata = {
    title: "Stork",
    description: "Start your next project with Stork",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="max-w-screen h-screen">
                {children}
            </body>
        </html>
    );
}
