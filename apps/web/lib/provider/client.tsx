"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme";

interface ClientProviderProps {
    children: React.ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    )
}
