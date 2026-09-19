"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validations";
import { UserService } from "@/services/user-service";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const CONTACT_LIMITS = {
  name: 50,
  email: 100,
  message: 1000,
};

export function ContactCTA() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const messageText = watch("message");

  const onSubmit = async (data: ContactFormData) => {
    try {
      await UserService.submitSupportMessage(data);

      toast.success("Mensagem enviada!", {
        description: "Obrigado pelo contato. Retornaremos em breve.",
      });
      reset();
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
      console.error(error);
    }
  };

  return (
    <section className="my-16 bg-primary p-4 shadow-md dark:bg-accent lg:p-6 xl:p-8">
      <div className="grid grid-cols-12 gap-y-12 md:gap-8">
        <div className="col-span-12 lg:col-span-6 xl:col-span-7 w-full h-full">
          <div className="space-y-4 justify-center pt-4 lg:pt-0 items-center md:items-start flex flex-col w-full h-full">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-heading tracking-tight text-center text-white md:text-left">
              Dúvidas ou sugestões?
            </h3>
            <p className="max-w-2xl text-base font-normal leading-relaxed text-center text-white/90 md:text-left md:text-lg">
              Conte para a gente como podemos ajudar você a encontrar um
              serviço ou divulgar o seu talento.
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6  xl:col-span-5 flex justify-end">
          <Card className="w-full lg:w-md">
            <CardContent>
              <CardHeader>
                <CardTitle className="text-text-main text-xl font-medium mb-6 text-center">
                  Fale conosco
                </CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      placeholder="Nome *"
                      maxLength={CONTACT_LIMITS.name}
                      {...register("name")}
                      className={` border-1 h-10 md:h-12  text-text-main rounded-full placeholder:text-text-muted/50 transition-all ${
                        errors.name
                          ? "border-destructive/60 focus:border-destructive"
                          : touchedFields.name && !errors.name
                            ? "border-success/60 focus:border-success"
                            : "focus:border-ring"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {errors.name ? (
                        <AlertCircle size={18} className="text-destructive" />
                      ) : touchedFields.name && !errors.name ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : null}
                    </div>
                  </div>
                  {errors.name && (
                    <p className="text-xs text-destructive font-bold ml-2">
                      {errors.name.message}
                    </p>
                  )}
                  <p className="text-xs text-text-muted ml-2">
                    Limite de {CONTACT_LIMITS.name} caracteres.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      placeholder="E-mail *"
                      type="email"
                      maxLength={CONTACT_LIMITS.email}
                      {...register("email")}
                      className={`border-1 h-10 md:h-12 rounded-full border-border-subtle text-text-main placeholder:text-text-muted/50 transition-all ${
                        errors.email
                          ? "border-destructive/60 focus:border-destructive"
                          : touchedFields.email && !errors.email
                            ? "border-success/60 focus:border-success"
                            : "focus:border-primary/20"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {errors.email ? (
                        <AlertCircle size={18} className="text-destructive" />
                      ) : touchedFields.email && !errors.email ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : null}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive font-bold ml-2">
                      {errors.email.message}
                    </p>
                  )}
                  <p className="text-xs text-text-muted ml-2">
                    Informe um e-mail válido.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1 mb-1">
                    <span className="text-xs font-normal text-text-muted uppercase">
                      Sua mensagem *
                    </span>
                    <span
                      className={`text-xs font-bold ${messageText?.length > 1000 ? "text-destructive" : "text-text-muted"}`}
                    >
                      {messageText?.length || 0} / {CONTACT_LIMITS.message}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Conte-nos como podemos ajudar..."
                      {...register("message")}
                      className={`w-full border rounded-none p-4 text-text-main placeholder:text-text-muted/50 h-32 outline-none transition-all ${
                        errors.message
                          ? "border-destructive/60 focus:border-destructive"
                          : touchedFields.message && !errors.message
                            ? "border-success/60 focus:border-success"
                            : "focus:border-primary/20"
                      }`}
                      maxLength={CONTACT_LIMITS.message}
                    />
                    <div className="absolute right-3 top-3 pointer-events-none">
                      {errors.message ? (
                        <AlertCircle size={18} className="text-destructive" />
                      ) : touchedFields.message && !errors.message ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : null}
                    </div>
                  </div>
                  {errors.message && (
                    <p className="text-xs text-destructive font-bold ml-2">
                      {errors.message.message}
                    </p>
                  )}
                  <p className="text-xs text-text-muted ml-2">
                    Descreva sua dúvida, mínimo de 10 caracteres.
                  </p>
                </div>
                <Button
                  type="submit"
                  size="icon-lg"
                  disabled={isSubmitting}
                  className="w-full rounded-none bg-primary font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
