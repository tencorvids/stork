"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from "@stork/ui"
import { z } from "zod/v4"

const loginFormSchema = z.object({
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
})

type LoginFormData = z.infer<typeof loginFormSchema>

async function login(data: LoginFormData) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        let errorMessage = "Failed to log in"

        try {
            const errorResponse = await response.json()
            errorMessage = errorResponse.error?.message || errorMessage
        } catch {
            errorMessage = response.statusText || errorMessage
        }

        throw new Error(errorMessage)
    }

    const result = await response.json()
    return result.data
}

export function LoginForm() {
    const router = useRouter()

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const loginMutation = useMutation({
        mutationFn: (data: LoginFormData) => login(data),
        onSuccess: async () => {
            form.reset()

            // Fetch user data after successful login
            // const response = await fetch("/api/auth/me")
            // if (response.ok) {
            // const userData = await response.json()
            // setUser(userData) - you'll need to handle user state management
            // }

            router.push("/")
        },
        onError: (error: Error) => {
            console.error(error)
        },
    })

    function onSubmit(values: LoginFormData) {
        loginMutation.mutate(values)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Log in</CardTitle>
                <CardDescription>
                    Welcome back! Please enter your credentials.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="you@example.com"
                                                type="email"
                                                autoComplete="email"
                                                disabled={loginMutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your password"
                                                type="password"
                                                autoComplete="current-password"
                                                disabled={loginMutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? "Logging in..." : "Log in"}
                        </Button>
                    </form>
                </Form>

                <div className="mt-4 text-center">
                    <p className="text-muted-foreground text-sm">
                        Don't have an account?{" "}
                        <a className="underline hover:no-underline" href="/signup">
                            Sign up
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
