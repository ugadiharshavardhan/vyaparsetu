import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Access Denied
      </h1>
      
      <p className="mt-4 text-muted-foreground max-w-md mx-auto">
        You don't have permission to view this page. This area is restricted to a different account type.
      </p>
      
      <div className="mt-10 flex justify-center gap-4">
        <Button onClick={() => router.history.back()} variant="outline">
          Go Back
        </Button>
        <Button asChild className="shadow-brand">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
