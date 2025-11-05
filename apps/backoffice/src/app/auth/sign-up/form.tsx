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
import { StringUtils } from "@/lib/string";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const FormSchema = z
    .object({
      name: z.string().trim().min(1, { message: "Requerido" }),
      lastname: z.string().trim().min(1, { message: "Requerido" }),
      email: z.string().trim().email({ message: "Email inválido" }),
      password: z
        .string()
        .min(8, { message: "Debe tener al menos 8 caracteres." }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden.",
      path: ["confirmPassword"],
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
    const fullName = `${StringUtils.toTitleCase(values.lastname)}, ${StringUtils.toTitleCase(values.name)}`;

    try {
      await authClient.signUp.email({
        email: values.email,
        name: fullName,
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
            router.push("/app");
          },
          onError: () => {
            toast.error("No se pudo crear la cuenta");
          },
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e?.message || "unknown error");
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
                <h1 className="text-2xl font-bold">Creá tu cuenta</h1>
              </div>
              <Field>
                <FieldLabel htmlFor="lastname">
                  Apellido{"("}s{")"}
                </FieldLabel>
                <Input id="lastname" type="text" {...register("lastname")} />
                {errors.lastname?.message ? (
                  <FieldDescription className="text-destructive">
                    {errors.lastname.message}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="name">
                  Nombre{"("}s{")"}
                </FieldLabel>
                <Input id="name" type="text" {...register("name")} />
                {errors.name?.message ? (
                  <FieldDescription className="text-destructive">
                    {errors.name.message}
                  </FieldDescription>
                ) : null}
              </Field>
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
                <FieldDescription>
                  Vamos a usar este email para contactarte en caso de ser
                  necesario.
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
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
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar contraseña
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword?.message ? (
                      <FieldDescription className="text-destructive">
                        {errors.confirmPassword.message}
                      </FieldDescription>
                    ) : null}
                  </Field>
                </Field>
                <FieldDescription>
                  Debe tener al menos 8 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear cuenta"}
                </Button>
              </Field>
              {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                O continuar con
              </FieldSeparator>
              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Registrate con Google</span>
                </Button>
              </Field> */}
              <FieldDescription className="text-center">
                ¿Ya tenés una cuenta? <a href="/auth/sign-in">Iniciá sesión</a>
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
