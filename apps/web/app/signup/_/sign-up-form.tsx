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

const signUpFormSchema = z
    .object({
        email: z.email({ message: "Please enter a valid email address." }),
        password: z.string().min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match.",
        path: ["confirmPassword"],
    })

type SignUpFormData = z.infer<typeof signUpFormSchema>

async function signUp(data: Omit<SignUpFormData, "confirmPassword">) {
    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to sign up")
    }

    return response.json()
}

export function SignUpForm() {
    const router = useRouter()

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const signUpMutation = useMutation({
        mutationFn: (data: Omit<SignUpFormData, "confirmPassword">) => signUp(data),
        onSuccess: async () => {
            form.reset()

            // Fetch user data after successful signup
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

    function onSubmit(values: SignUpFormData) {
        const { confirmPassword, ...signUpData } = values
        signUpMutation.mutate(signUpData)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Sign up</CardTitle>
                <CardDescription>
                    We just need a few details to get you started.
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
                                                disabled={signUpMutation.isPending}
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
                                                autoComplete="new-password"
                                                disabled={signUpMutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Confirm your password"
                                                type="password"
                                                autoComplete="new-password"
                                                disabled={signUpMutation.isPending}
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
                            disabled={signUpMutation.isPending}
                        >
                            {signUpMutation.isPending ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>
                </Form>

                <p className="text-muted-foreground text-center text-xs mt-4">
                    By signing up you agree to our{" "}
                    <a className="underline hover:no-underline" href="/">
                        Terms
                    </a>
                    .
                </p>
            </CardContent>
        </Card>
    )
}


