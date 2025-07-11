import { Button } from "@stork/ui";
import { getCurrentSession } from "@/auth/cookie";

export default async function Page() {
    const session = await getCurrentSession()

    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col gap-4">
                {session.session ? (
                    <p>Welcome back, {session.user.email}!</p>
                ) : (
                    <>
                        <p>Welcome to Stork!</p>

                        <Button asChild>
                            <a href="/signup">Sign Up</a>
                        </Button>

                        <Button asChild variant="outline">
                            <a href="/login">Login</a>
                        </Button>
                    </>
                )}
            </div>
        </main>
    );
}
