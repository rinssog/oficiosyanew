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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { delay } from "@/lib/time";

export function ForgotPasswordForm() {
  const router = useRouter();

  const FormSchema = z.object({
    email: z.string().trim().email({ message: "Email inválido" }),
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

  async function onSubmit(values: FormValues) {
    try {
      await authClient.requestPasswordReset({ email: values.email });
      await delay(500);
      toast.success(
        "Si el email existe, te enviamos un enlace para restablecer la contraseña.",
      );
      router.push("/auth/sign-in");
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e?.message || "No se pudo procesar la solicitud");
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
                <p className="text-muted-foreground text-sm">
                  Ingresá tu email y te enviaremos un enlace para restablecerla.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email?.message ? (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar enlace"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                ¿La recordaste? <a href="/auth/sign-in">Iniciá sesión</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted hidden md:grid md:content-center">
            <Logo width={600} height={600} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
