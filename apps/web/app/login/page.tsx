import type React from "react"
import { LoginForm } from "./_/login-form"
import { getCurrentSession } from "~/lib/auth/cookie"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await getCurrentSession()
    if (session.session) {
        redirect("/")
    }
    return (
        <main className="w-full h-full flex items-center justify-center p-4">
            <LoginForm />
        </main>
    )
}
