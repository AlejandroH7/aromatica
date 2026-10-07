"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";

// Mejora de Ivan: el login no exige 8 caracteres (bloqueaba al usuario del seed con "123456"); la regla de largo aplica solo al registro.
const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const registerSchema = loginSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(1, "Ingresa tu nombre"),
});

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(form.entries());
    const parsed = (isLogin ? loginSchema : registerSchema).safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error, intenta de nuevo");
        return;
      }
      // Mejora de Ivan: el servidor ya dejó la cookie de sesión; aquí solo se guarda el usuario para la UI.
      setUser(data.user);
      router.push("/");
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-container flex min-h-[72vh] max-w-lg flex-col justify-center pb-16 pt-8">
      <div className="rounded-sm bg-paper p-7 shadow-lift sm:p-10">
        <p className="eyebrow">Aromática</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">{isLogin ? "Ingresar" : "Crear cuenta"}</h1>
        <div className="rule mt-5" />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {!isLogin && (
            <div>
              <label className="label" htmlFor="name">
                Nombre
              </label>
              <input id="name" name="name" type="text" autoComplete="name" className="field" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">
              Correo
            </label>
            <input id="email" name="email" type="email" autoComplete="email" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="field"
            />
          </div>

          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Enviando..." : isLogin ? "Ingresar" : "Registrarse"}
          </button>
        </form>
      </div>
    </main>
  );
}
