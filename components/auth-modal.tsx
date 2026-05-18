"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  signUpSchema,
  type LoginFormData,
  type SignUpFormData,
} from "@/lib/validations";
import Image from "next/image";

const profileLimits = {
  avatarAndBannerMaxSizeMb: 10,
  galleryMaxItems: 5,
  supportedFormats: "JPG, PNG ou WEBP",
};

function getSignUpErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    switch ((error as { code: string }).code) {
      case "auth/email-already-in-use":
        return "Este e-mail já está em uso. Entre com ele ou use outro endereço.";
      case "auth/invalid-email":
        return "Digite um e-mail válido com até 100 caracteres.";
      case "auth/weak-password":
        return "A senha precisa ter entre 6 e 50 caracteres.";
      case "auth/network-request-failed":
        return "Não foi possível concluir o cadastro por causa da conexão. Tente novamente.";
      case "auth/too-many-requests":
        return "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.";
      default:
        break;
    }
  }

  return "Não foi possível criar a conta. Revise os campos e tente novamente.";
}

const authGalleryImages = [
  {
    src: "/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png",
    alt: "Ilustracao de criacao colaborativa",
    className: "col-span-8",
    delay: 0,
  },
  {
    src: "/Gemini_Generated_Image_81npfy81npfy81np.png",
    alt: "Ilustracao de aprendizado digital",
    className: "col-span-4",
    delay: 0.06,
  },
  {
    src: "/Gemini_Generated_Image_m9c1ibm9c1ibm9c1.png",
    alt: "Ilustracao de networking profissional",
    className: "col-span-4",
    delay: 0.12,
  },
  {
    src: "/Gemini_Generated_Image_xfqkexfqkexfqkex.png",
    alt: "Ilustracao de estudo online",
    className: "col-span-4",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_ez45xsez45xsez45.png",
    alt: "Ilustracao de comunidade criativa",
    className: "col-span-4",
    delay: 0.24,
  },
  {
    src: "/Gemini_Generated_Image_2guq8v2guq8v2guq.png",
    alt: "Ilustracao de portfolio digital",
    className: "col-span-4",
    delay: 0.3,
  },
  {
    src: "/Gemini_Generated_Image_cjqsrjcjqsrjcjqs.png",
    alt: "Ilustracao de ensino e troca de habilidades",
    className: "col-span-8",
    delay: 0.36,
  },
];

export function AuthModal({ children }: { children: React.ReactElement }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Sign Up Form
  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setOpen(false);
      toast.success("Bem-vindo ao Skillsy!");
    } catch (error: any) {
      console.error("Login error detail:", error);

      let message = "Erro ao entrar com Google. Tente novamente.";

      if (error.code === "auth/unauthorized-domain") {
        message =
          'Domínio não autorizado. Adicione os URLs do projeto na seção "Authentication > Settings" do Firebase Console.';
      } else if (error.code === "auth/popup-blocked") {
        message =
          "O popup foi bloqueado pelo seu navegador. Por favor, permita popups para este site.";
      } else if (error.code === "auth/popup-closed-by-user") {
        message = "O login foi cancelado (popup fechado antes da conclusão).";
      } else if (error.message) {
        message = `Erro: ${error.message}`;
      }

      toast.error(message, {
        duration: 8000,
        description: error.code ? `Código do erro: ${error.code}` : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      setOpen(false);
      toast.success("Bem-vindo de volta!");
    } catch (error: any) {
      toast.error("E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.name);
      setOpen(false);
      toast.success("Conta criada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao criar conta", {
        description: getSignUpErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} nativeButton />
      <DialogContent className="">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6 bg-linear-to-l from-white to-blue-400 rounded-l-md p-4 hidden md:flex">
            <div className="grid grid-cols-12 gap-4 w-full h-full">
              {authGalleryImages.map((image) => (
                <motion.div
                  key={image.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: image.delay,
                    ease: "easeOut",
                  }}
                  className={`${image.className} group relative w-full h-full overflow-hidden rounded-xl`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover bg-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 flex flex-col items-start justify-between gap-2">
            <div>
              <h1 className="hidden 2xl:block text-3xl md:text-4xl font-bold text-primary mb-2">
                Skillsy
              </h1>
              <h2 className="text-base md:text-xl font-medium text-gray-700 mb-1">
                Bem-vindo de volta!
              </h2>
              <p className="text-xs font-normal md:text-sm text-text-muted mb-2 xxl:mb-6">
                Faça login ou crie uma conta para continuar compartilhado suas
                habilidades.
              </p>
            </div>

            <Tabs
              defaultValue="login"
              className="w-full sm:h-full space-y-5 2xl:space-y-6 transition-all"
            >
              <TabsList className="w-full">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={handleSubmitLogin(handleEmailLogin)}
                  className="space-y-3 2xl:space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs md:text-sm font-medium text-text-muted"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      aria-invalid={Boolean(loginErrors.email)}
                      aria-describedby={
                        loginErrors.email ? "login-email-error" : undefined
                      }
                      className={`h-10 border-border-subtle focus-visible:ring-accent ${loginErrors.email ? "ring-2 ring-red-500" : ""}`}
                      {...registerLogin("email")}
                    />
                    {loginErrors.email && (
                      <p
                        id="login-email-error"
                        className="text-[10px] text-red-500 font-bold ml-1"
                      >
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-xs md:text-sm font-medium text-text-muted"
                    >
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      aria-invalid={Boolean(loginErrors.password)}
                      aria-describedby={
                        loginErrors.password
                          ? "login-password-error"
                          : undefined
                      }
                      className={`h-10 border-border-subtle focus-visible:ring-accent ${loginErrors.password ? "ring-2 ring-red-500" : ""}`}
                      {...registerLogin("password")}
                    />
                    {loginErrors.password && (
                      <p
                        id="login-password-error"
                        className="text-[10px] text-red-500 font-bold ml-1"
                      >
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white h-10 font-semibold transition-all"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form
                  onSubmit={handleSubmitSignUp(handleEmailSignUp)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-name"
                      className="text-xs md:text-sm font-medium text-text-muted"
                    >
                      Nome<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="signup-name"
                      placeholder="Como você quer aparecer no Skillsy"
                      aria-invalid={Boolean(signUpErrors.name)}
                      aria-describedby={
                        signUpErrors.name
                          ? "signup-name-error"
                          : "signup-name-help"
                      }
                      className={`h-10 border-border-subtle focus-visible:ring-accent ${signUpErrors.name ? "ring-2 ring-red-500" : ""}`}
                      {...registerSignUp("name")}
                    />
                    <p
                      id="signup-name-help"
                      className="text-[11px] text-text-muted ml-1"
                    >
                      Use entre 2 e 50 caracteres.
                    </p>
                    {signUpErrors.name && (
                      <p
                        id="signup-name-error"
                        className="text-[10px] text-red-500 font-bold ml-1"
                      >
                        {signUpErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-xs md:text-sm font-medium text-text-muted"
                    >
                      E-mail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      aria-invalid={Boolean(signUpErrors.email)}
                      aria-describedby={
                        signUpErrors.email
                          ? "signup-email-error"
                          : "signup-email-help"
                      }
                      className={`h-10 border-border-subtle focus-visible:ring-accent ${signUpErrors.email ? "ring-2 ring-red-500" : ""}`}
                      {...registerSignUp("email")}
                    />
                    <p
                      id="signup-email-help"
                      className="text-[11px] text-text-muted ml-1"
                    >
                      Use um e-mail válido com até 30 caracteres.
                    </p>
                    {signUpErrors.email && (
                      <p
                        id="signup-email-error"
                        className="text-[10px] text-red-500 font-bold ml-1"
                      >
                        {signUpErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-xs md:text-sm font-medium text-text-muted"
                    >
                      Senha <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Crie uma senha segura"
                        aria-invalid={Boolean(signUpErrors.password)}
                        aria-describedby={
                          signUpErrors.password
                            ? "signup-password-error"
                            : "signup-password-help"
                        }
                        className={`h-10 border-border-subtle focus-visible:ring-accent ${signUpErrors.password ? "ring-2 ring-red-500" : ""}`}
                        {...registerSignUp("password")}
                      />
                    </div>
                    <p
                      id="signup-password-help"
                      className="text-[11px] text-text-muted ml-1"
                    >
                      A senha deve ter o mínimo de 6 caracteres.
                    </p>
                    {signUpErrors.password && (
                      <p
                        id="signup-password-error"
                        className="text-[10px] text-red-500 font-bold ml-1"
                      >
                        {signUpErrors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white h-10 font-semibold transition-all"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-grow bg-slate-300" />
              <h3 className="md:text-base text-base font-bold text-gray-500  shrink-0">
                ou
              </h3>
              <div className="h-px flex-grow bg-slate-300" />
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-10 font-semibold "
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continuar com Google
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
