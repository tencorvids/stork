import { Button } from "@stork/ui";

export default function Page() {
    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col gap-4">
                <Button asChild>
                    <a href="/signup">Sign Up</a>
                </Button>

                <Button asChild variant="outline">
                    <a href="/login">Login</a>
                </Button>
            </div>
        </main>
    );
}
