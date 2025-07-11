import type { Metadata } from "next";
import "@/style/global.css";
import { Provider } from "@/provider/server";

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
        <html lang="en" suppressHydrationWarning>
            <body className="max-w-screen h-screen">
                <Provider>
                    {children}
                </Provider>
            </body>
        </html>
    );
}
