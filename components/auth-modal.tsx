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

type AuthModalProps = {
  /** The element that opens the modal. Omit it and pass `open` to open the
   * modal from code (e.g. a toast's "Entrar" action). */
  children?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Tab shown when the modal opens. */
  defaultTab?: "login" | "signup";
};

export function AuthModal({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultTab = "login",
}: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } =
    useAuth();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    getValues: getLoginValues,
    setError: setLoginError,
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
      await signUpWithEmail(data.email, data.password);
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

  const handleForgotPassword = async () => {
    const email = getLoginValues("email").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLoginError("email", {
        message: "Informe seu e-mail acima para receber o link de redefinição.",
      });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
    } catch {
      // Same message either way, so the form does not reveal who has an account.
    } finally {
      setLoading(false);
    }
    toast.success("Verifique seu e-mail", {
      description:
        "Se houver uma conta com esse endereço, enviamos um link para criar uma nova senha.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger render={children} nativeButton /> : null}
      <DialogContent className="max-h-[min(90dvh,48rem)] w-[calc(100vw-2rem)] max-w-[60rem] overflow-y-auto bg-background p-0 text-foreground sm:w-[calc(100vw-3rem)] sm:max-w-[60rem]">
        <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
          <div className="hidden min-h-[34rem] min-w-0 bg-linear-to-l from-background to-primary/40 p-4 lg:flex">
            <div className="grid h-full w-full grid-cols-12 gap-4">
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
                  className={`${image.className} group relative w-full h-full overflow-hidden `}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 16vw, 0vw"
                    className="object-cover bg-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex min-h-[34rem] flex-col gap-6 p-5 sm:p-7 md:p-8">
              <div>
                <h1 className="hidden 2xl:block text-3xl md:text-4xl font-bold text-primary mb-2">
                  Skillsy
                </h1>
                <h2 className="text-base md:text-xl font-medium text-foreground mb-1">
                  {tab === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
                </h2>
                <p className="text-xs font-normal md:text-sm text-muted-foreground mb-2 xxl:mb-6">
                  {tab === "login"
                    ? "Entre para continuar compartilhando suas habilidades."
                    : "Leva menos de um minuto. Você completa seu perfil depois."}
                </p>
              </div>

              <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as "login" | "signup")}
                className="w-full space-y-5 transition-all 2xl:space-y-6"
              >
                <TabsList className="w-full space-x-2 bg-muted">
                  <TabsTrigger className="" value="login">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger className="" value="signup">
                    Cadastrar
                  </TabsTrigger>
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
                        className="text-xs md:text-sm font-medium text-muted-foreground"
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
                        className={`h-10 border-input focus-visible:ring-accent ${loginErrors.email ? "ring-2 ring-destructive" : ""}`}
                        {...registerLogin("email")}
                      />
                      {loginErrors.email && (
                        <p
                          id="login-email-error"
                          className="text-xs text-destructive font-bold ml-1"
                        >
                          {loginErrors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-xs md:text-sm font-medium text-muted-foreground"
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
                        className={`h-10 border-input focus-visible:ring-accent ${loginErrors.password ? "ring-2 ring-destructive" : ""}`}
                        {...registerLogin("password")}
                      />
                      {loginErrors.password && (
                        <p
                          id="login-password-error"
                          className="text-xs text-destructive font-bold ml-1"
                        >
                          {loginErrors.password.message}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="h-auto p-0 text-xs"
                      >
                        Esqueci minha senha
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground h-10 font-semibold transition-colors"
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
                        htmlFor="signup-email"
                        className="text-xs md:text-sm font-medium text-muted-foreground"
                      >
                        E-mail <span className="text-destructive">*</span>
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
                        className={`h-10 border-input focus-visible:ring-accent ${signUpErrors.email ? "ring-2 ring-destructive" : ""}`}
                        {...registerSignUp("email")}
                      />
                      <p
                        id="signup-email-help"
                        className="text-xs text-muted-foreground ml-1"
                      >
                        Use um e-mail que você acessa: é por ele que você recupera a senha.
                      </p>
                      {signUpErrors.email && (
                        <p
                          id="signup-email-error"
                          className="text-xs text-destructive font-bold ml-1"
                        >
                          {signUpErrors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-xs md:text-sm font-medium text-muted-foreground"
                      >
                        Senha <span className="text-destructive">*</span>
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
                          className={`h-10 border-input focus-visible:ring-accent ${signUpErrors.password ? "ring-2 ring-destructive" : ""}`}
                          {...registerSignUp("password")}
                        />
                      </div>
                      <p
                        id="signup-password-help"
                        className="text-xs text-muted-foreground ml-1"
                      >
                        A senha deve ter o mínimo de 6 caracteres.
                      </p>
                      {signUpErrors.password && (
                        <p
                          id="signup-password-error"
                          className="text-xs text-destructive font-bold ml-1"
                        >
                          {signUpErrors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground h-10 font-semibold transition-colors"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        "Criar conta"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="flex items-center gap-4 w-full">
                <div className="h-px flex-grow bg-border" />
                <h3 className="md:text-base text-base font-bold text-muted-foreground shrink-0">
                  ou
                </h3>
                <div className="h-px flex-grow bg-border" />
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-10 font-semibold"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
