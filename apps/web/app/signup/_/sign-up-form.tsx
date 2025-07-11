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
        mutationFn: async (data: Omit<SignUpFormData, "confirmPassword">) => {
            const signUpResult = await api.post<void>("/api/auth/signup", data)

            if (signUpResult.isErr()) {
                throw signUpResult.error
            }

            // const userResult = await api.get<UserData>("/api/auth/me")
            // if (userResult.isErr()) {
            //     console.error("Failed to fetch user data:", userResult.error)
            //     return
            // }
            // const userData = userResult.value
            // console.log("User signed up:", userData)
        },
        onSuccess: () => {
            form.reset()
            router.push("/")
        },
        onError: (error: ApiException) => {
            form.setError("root", {
                message: error.message || "Sign up failed. Please try again."
            })
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

                <div className="mt-4 text-center">
                    <p className="text-muted-foreground text-sm">
                        Don't have an account?{" "}
                        <a className="underline hover:no-underline" href="/login">
                            Log in
                        </a>
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                        By signing up you agree to our{" "}
                        <a className="underline hover:no-underline" href="/">
                            Terms
                        </a>
                        .
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
