"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Logo from "@/components/ui/logo";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();

  const FormSchema = z.object({
    email: z.string().trim().email({ message: "Email inválido" }),
    password: z.string().min(1, { message: "Requerido" }),
  });

  type FormValues = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
  });

  async function singIn(values: FormValues) {
    try {
      await authClient.signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
            router.push("/app");
          },
          onError: () => {
            toast.error("No se pudo iniciar sesión");
          },
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e?.message || "Error desconocido");
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(singIn)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Iniciá sesión</h1>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  {...register("email")}
                />
                {errors.email?.message ? (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password?.message ? (
                  <FieldDescription className="text-destructive">
                    {errors.password.message}
                  </FieldDescription>
                ) : null}
              </Field>
              <FieldDescription className="text-right">
                <a href="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
              </FieldDescription>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                ¿No tenés una cuenta? <a href="/auth/sign-up">Creá una</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted hidden md:grid md:content-center">
            <Logo width={600} height={600} />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar, aceptás nuestros <a href="#">Términos del servicio</a> y{" "}
        <a href="#">Política de privacidad</a>.
      </FieldDescription>
    </div>
  );
}
