import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
