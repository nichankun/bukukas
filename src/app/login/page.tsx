// src/app/login/page.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal masuk. Silakan coba lagi.");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      {/* Lebar dibuat ramping max-w-[360px] agar proporsional */}
      <Card className="w-full max-w-90 shadow-sm border rounded-xl bg-card">
        {/* Header Card */}
        <CardHeader className="space-y-1 pb-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Sesi Aman
            </div>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground pt-1.5">
            Buku Kas Masuk
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Masukkan kredensial admin untuk melanjutkan
          </CardDescription>
        </CardHeader>

        {/* Form & Input */}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 pt-1">
            {/* Pesan Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  name="username"
                  type="text"
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="pl-8 pr-9 h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          {/* Footer Card */}
          <CardFooter className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-8 font-medium text-xs shadow-sm transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Dilindungi enkripsi sesi server HTTP-Only
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}