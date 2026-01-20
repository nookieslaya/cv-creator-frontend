import { SignIn } from "@clerk/clerk-react";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-slate">
          Sign in to manage your CV data and generate targeted variants.
        </p>
        <div className="mt-6">
          <SignIn routing="hash" afterSignInUrl="/" afterSignUpUrl="/" />
        </div>
      </div>
    </div>
  );
}
