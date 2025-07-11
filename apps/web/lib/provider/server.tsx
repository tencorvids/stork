import { ClientProvider } from "./client"

interface ProviderProps {
    children?: React.ReactNode
}

export async function Provider({ children }: ProviderProps) {
    return (
        <ClientProvider>
            {children}
        </ClientProvider>
    )
}
