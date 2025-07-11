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
import { api, ApiException } from "@/api/client"

const loginFormSchema = z.object({
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
})
type LoginFormData = z.infer<typeof loginFormSchema>

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
        mutationFn: async (data: LoginFormData) => {
            const loginResult = await api.post<void>("/api/auth/login", data)

            if (loginResult.isErr()) {
                throw loginResult.error
            }

            // const userResult = await api.get<UserData>("/api/auth/me")
            // if (userResult.isErr()) {
            //     console.error("Failed to fetch user data:", userResult.error)
            //     return
            // }
            // const userData = userResult.value
            // console.log("User logged in:", userData)
        },
        onSuccess: () => {
            form.reset()
            router.push("/")
        },
        onError: (error: ApiException) => {
            form.setError("root", {
                message: error.message || "Login failed. Please try again."
            })
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
                        {form.formState.errors.root && (
                            <div className="rounded-sm bg-destructive/15 p-3 grid place-items-center">
                                <span className="text-destructive">{form.formState.errors.root.message}</span>
                            </div>
                        )}
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
