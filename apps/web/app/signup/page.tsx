import type React from "react"
import { SignUpForm } from "./_/sign-up-form"
import { getCurrentSession } from "@/auth/cookie"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await getCurrentSession()
    if (session.session) {
        redirect("/")
    }

    return (
        <main className="w-full h-full flex items-center justify-center p-4">
            <SignUpForm />
        </main>
    )
}


