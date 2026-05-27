import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { FormField } from "@/components/molecules/form-field";
import { AuthLayout } from "@/components/templates/auth-layout";
import { createClient } from "@/lib/supabase/server";
import { Text } from "@/components/atoms";

type PageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  
  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  async function signIn(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/dashboard");
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      {params.error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200 mb-4">
          {params.error}
        </div>
      ) : null}
      {params.success ? (
        <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950 p-3 text-sm text-green-800 dark:text-green-200 mb-4">
          {params.success}
        </div>
      ) : null}

      <form action={signIn} className="space-y-4">
        <FormField label="Email" required>
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </FormField>

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <Text size="sm" variant="muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </Link>
        </Text>
      </div>
    </AuthLayout>
  );
}
