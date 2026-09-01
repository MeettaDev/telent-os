"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  findMockUser,
  mockUsers,
  setActiveMockUser,
} from "@/common/auth/mock-auth";
import { setSuccessFlashToast } from "@/common/toasts/flash-toast";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { useLocale } from "@/providers/locale-provider";

export function LoginForm() {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const user = findMockUser(email, password);
    if (!user) {
      setError(dictionary.auth.invalidCredentials);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setActiveMockUser(user);
    setSuccessFlashToast(dictionary.auth.loginSuccess);
    router.replace(user.destination);
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          className="text-sm font-semibold leading-[1.5] text-foreground"
          htmlFor="email"
        >
          {dictionary.auth.email}
        </label>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4 transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
          <Mail
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            autoComplete="email"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isSubmitting}
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={dictionary.auth.emailPlaceholder}
            required
            type="email"
            value={email}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            className="text-sm font-semibold leading-[1.5] text-foreground"
            htmlFor="password"
          >
            {dictionary.auth.password}
          </label>
          <button
            className="cursor-pointer text-xs font-semibold text-primary-hover hover:underline"
            disabled={isSubmitting}
            type="button"
          >
            {dictionary.auth.forgotPassword}
          </button>
        </div>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4 transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
          <LockKeyhole
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            autoComplete="current-password"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isSubmitting}
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder={dictionary.auth.passwordPlaceholder}
            required
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={
              showPassword
                ? dictionary.auth.hidePassword
                : dictionary.auth.showPassword
            }
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            disabled={isSubmitting}
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <Text aria-live="polite" variant="error">
          {error}
        </Text>
      )}
      <Button
        className="h-12 w-full"
        disabled={isSubmitting}
        type="submit"
        variant="app-primary"
      >
        {isSubmitting && (
          <LoaderCircle className="animate-spin motion-reduce:animate-none" />
        )}
        {isSubmitting ? dictionary.auth.signingIn : dictionary.auth.signIn}
      </Button>
      <div className="grid gap-2 sm:grid-cols-2">
        {mockUsers.map((user) => (
          <button
            className="cursor-pointer rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-primary-hover transition-colors hover:bg-primary-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            disabled={isSubmitting}
            key={user.id}
            onClick={() => {
              setEmail(user.email);
              setPassword(user.password);
              setError("");
            }}
            type="button"
          >
            {user.role === "admin"
              ? dictionary.auth.useAdminDemo
              : dictionary.auth.useCounselorDemo}
          </button>
        ))}
      </div>
    </form>
  );
}
