"use client";

import React from "react";
import { ShieldCheck, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validations";
import { UserService } from "@/services/user-service";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function ContactCTA() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
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
    <section className="my-24 bg-primary  py-6 px-4 md:px-10 md:py-10 rounded-2xl">
      <div className="grid grid-cols-12 gap-y-8 md:gap-8">
        <div className="col-span-12 md:col-span-7 flex flex-col justify-center">
          <div className="text-center md:text-left">
            <h3 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-white">
              Dúvidas ou Sugestões?
            </h3>
            <p className="text-white/80 text-lg mb-8">
              Estamos aqui para ajudar você a encontrar o melhor serviço ou a
              divulgar o seu talento. Faça parte da nossa rede de excelência.
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 flex justify-end">
          <Card className="w-full lg:w-md">
            <CardContent>
              <CardHeader>
                <CardTitle className="text-gray-800 text-xl font-medium mb-6 text-center">
                  Fale Conosco
                </CardTitle>
               
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      placeholder="Nome *"
                      {...register("name")}
                      className={` border-1 h-12 border-gray-300  text-text-main placeholder:text-text-muted/50 transition-all ${
                        errors.name
                          ? "border-red-500/50 focus:border-red-500"
                          : touchedFields.name && !errors.name
                            ? "border-green-500/50 focus:border-green-500"
                            : " focus:border-blue-500/20"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {errors.name ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : touchedFields.name && !errors.name ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.name && (
                    <p className="text-[10px] text-red-500 font-bold ml-2">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      placeholder="E-mail *"
                      type="email"
                      {...register("email")}
                      className={`border-1 h-12  border-gray-300 text-text-main placeholder:text-text-muted/50 transition-all ${
                        errors.email
                          ? "border-red-500/50 focus:border-red-500"
                          : touchedFields.email && !errors.email
                            ? "border-green-500/50 focus:border-green-500"
                            : "focus:border-primary/20"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {errors.email ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : touchedFields.email && !errors.email ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-bold ml-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1 mb-1">
                    <span className="text-[10px] font-normal text-text-muted uppercase tracking-widest">
                      Sua Mensagem *
                    </span>
                    <span
                      className={`text-[10px] font-bold ${messageText?.length > 1000 ? "text-red-500" : "text-text-muted"}`}
                    >
                      {messageText?.length || 0} / 1000
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Conte-nos como podemos ajudar..."
                      {...register("message")}
                      className={`w-full border-1 border-gray-300 rounded-md p-4 text-text-main placeholder:text-text-muted/50 h-32 outline-none transition-all ${
                        errors.message
                          ? "border-red-500/50 focus:border-red-500"
                          : touchedFields.message && !errors.message
                            ? "border-green-500/50 focus:border-green-500"
                            : "focus:border-primary/20"
                      }`}
                      maxLength={1000}
                    />
                    <div className="absolute right-3 top-3 pointer-events-none">
                      {errors.message ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : touchedFields.message && !errors.message ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.message && (
                    <p className="text-[10px] text-red-500 font-bold ml-2">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors text-white h-10  font-bold "
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
