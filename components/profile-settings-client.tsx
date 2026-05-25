"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Camera,
  Plus,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  MessageCircle,
  ArrowLeft,
  Save,
  ShieldCheck,
  Briefcase,
  MapPin,
  Church,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Clock,
  CalendarDays,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/validations";
import {
  AVAILABILITY_OPTIONS,
  PROVIDER_CATEGORIES,
  clearProviderFields,
  getProfileFormDefaults,
  profileToFormValues,
  toProfileUpdatePayload,
} from "@/lib/profile-form";

import { Skeleton } from "@/components/ui/skeleton";

import { ThemeToggle } from "@/components/theme-toggle";
import { LocationService } from "@/services/location-service";
import { Footer } from "./footer";
import { shouldShowVerifiedBadge } from "@/lib/member-verification";

const MAX_IMAGE_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_INLINE_IMAGE_SIZE_BYTES = 100 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const SUPPORTED_IMAGE_FORMATS_LABEL = "JPG, PNG ou WEBP";
const PROFILE_LIMITS = {
  name: 50,
  location: 100,
  ward: 100,
  bio: 500,
  serviceType: 100,
  companyName: 100,
  address: 150,
  addressNumber: 20,
  neighborhood: 100,
  state: 100,
  complement: 100,
  whatsappDigitsMin: 10,
  whatsappDigitsMax: 15,
  phoneDigitsMax: 15,
  socialHandle: 50,
  socialUrl: 100,
  website: 150,
  serviceHours: 100,
  galleryMaxItems: 5,
  galleryDescription: 200,
};

const readFileAsDataURL = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error("Nao foi possivel ler a imagem selecionada."));
  });

const getCompressionErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return "Nao foi possivel processar essa imagem.";
};

export function ProfileSettingsClient() {
  const {
    user,
    profile,
    updateProfile,
    cancelAccount,
    loading: authLoading,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cancelingAccount, setCancelingAccount] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, touchedFields, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: getProfileFormDefaults(),
  });

  const formData = watch();

  useEffect(() => {
    if (profile) {
      reset(profileToFormValues(profile));
    }
  }, [profile, reset]);

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const data = await LocationService.getCurrentLocation();
      setValue("location", data.display, { shouldValidate: true });
      toast.success("Localização detectada!", { description: data.display });
    } catch (error: any) {
      toast.error("Erro de geolocalização", { description: error.message });
    } finally {
      setDetectingLocation(false);
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      await updateProfile(toProfileUpdatePayload(data));
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      let errorMessage = "Erro ao atualizar perfil";

      try {
        const errorData = JSON.parse(error.message);
        if (
          errorData.error.includes("permission-denied") ||
          errorData.error.includes("Missing or insufficient permissions")
        ) {
          errorMessage =
            "Erro de permissão: Verifique se todos os campos estão no formato correto e dentro do limite de tamanho.";
        } else {
          errorMessage = `Erro: ${errorData.error}`;
        }
      } catch (e) {
        if (error.message) errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const compressAndGetBase64 = async (file: File) => {
    const options = {
      maxSizeMB: 0.1, // 100KB to keep Firestore docs small
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return await readFileAsDataURL(compressedFile);
    } catch (error) {
      try {
        const compressedFile = await imageCompression(file, {
          ...options,
          useWebWorker: false,
        });
        return await readFileAsDataURL(compressedFile);
      } catch (retryError) {
        console.warn("Compression failed:", {
          message: getCompressionErrorMessage(retryError ?? error),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        if (file.size <= MAX_INLINE_IMAGE_SIZE_BYTES) {
          return await readFileAsDataURL(file);
        }

        throw new Error(
          "Nao foi possivel comprimir a imagem. Tente uma foto JPG, PNG ou WEBP menor.",
        );
      }
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner" | "gallery",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo invalido", {
        description: "Selecione um arquivo de imagem.",
      });
      e.target.value = "";
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      toast.error("Formato nao suportado", {
        description: "Use uma imagem JPG, PNG ou WEBP.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
      toast.error("Imagem muito grande", {
        description: "Escolha uma imagem de ate 10 MB.",
      });
      e.target.value = "";
      return;
    }

    setUploading(type);
    try {
      const base64 = await compressAndGetBase64(file);
      if (type === "avatar") {
        setValue("photoURL", base64, { shouldDirty: true });
        toast.success("Foto de perfil carregada!");
      } else if (type === "banner") {
        setValue("bannerURL", base64, { shouldDirty: true });
        toast.success("Banner carregado!");
      } else if (type === "gallery") {
        if (formData.gallery.length >= 5) {
          toast.error("Limite atingido", {
            description: "Você pode enviar no máximo 5 fotos para a galeria.",
          });
          return;
        }
        setValue(
          "gallery",
          [...formData.gallery, { url: base64, description: "" }],
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
        toast.success("Foto adicionada à galeria!");
      }
    } catch (error) {
      toast.error("Erro ao carregar imagem", {
        description: getCompressionErrorMessage(error),
      });
    } finally {
      setUploading(null);
      e.target.value = ""; // Reset input
    }
  };

  const handleAddPhoto = () => {
    if (formData.gallery.length >= 5) {
      toast.error("Limite atingido", {
        description: "Você pode enviar no máximo 5 fotos para a galeria.",
      });
      return;
    }
    galleryInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setValue(
      "gallery",
      formData.gallery.filter((_, i) => i !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const handleCancelAccount = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar sua conta? Seu perfil sera desativado e voce saira da plataforma.",
    );

    if (!confirmed) {
      return;
    }

    setCancelingAccount(true);
    try {
      await cancelAccount();
      toast.success("Conta cancelada com sucesso.");
    } catch (error: any) {
      toast.error("Nao foi possivel cancelar a conta.", {
        description: error?.message || "Tente novamente em alguns instantes.",
      });
    } finally {
      setCancelingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-32 rounded-2xl" />
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <Skeleton className="h-64 w-full rounded-[2.5rem]" />
              <Skeleton className="h-48 w-full rounded-[2.5rem]" />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
              <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-text-muted mb-8">
          Você precisa estar logado para editar seu perfil.
        </p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">
            Voltar para Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface w-full md:space-y-2">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle ">
        <nav className="mx-auto container px-4 py-1 md:py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft size={16} className="text-gray-600" />{" "}
              <p className="hidden text-sm md:flex text-gray-600 font-medium">
                Voltar
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              form="profile-settings-form"
              disabled={loading || uploading !== null || !isDirty}
              className="bg-blue-500 text-white hover:bg-blue-600 active:to-blue-700 transition-colors rounded-sm px-6 font-bold h-10"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save size={16} className="mr-2" /> Salvar
                </>
              )}
            </Button>
          </div>
        </nav>
      </div>

      <main className="md:container md:mx-auto md:px-4 mb-6">
        <form id="profile-settings-form" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Left Column: Avatar & Basic Info */}
            <div className="space-y-2">
              <div className="md:border border-b bg-white overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-primary/10 to-accent/10">
                  {formData.bannerURL && (
                    <Image
                      src={formData.bannerURL!}
                      alt="Banner"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploading === "banner"}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50"
                    title="Alterar Banner"
                  >
                    {uploading === "banner" ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Camera size={18} />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "banner")}
                  />
                </div>
                <div className="pt-10 pb-4 px-4 flex flex-col items-center -mt-16">
                  <div className="relative group mb-6">
                    <Avatar className="w-32 h-32 border-4 border-surface shadow-xl">
                      <AvatarImage src={formData.photoURL || undefined} />
                      <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                        {formData.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading === "avatar"}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      {uploading === "avatar" ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Camera size={18} />
                      )}
                    </button>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "avatar")}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-text-main mb-1">
                    {formData.name || "Seu Nome"}
                  </h2>
                  <p className="text-sm text-text-muted mb-4">{user.email}</p>
                  {shouldShowVerifiedBadge(formData) && (
                    <Badge className="bg-primary/10 text-primary border-none font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                      <ShieldCheck size={14} /> Membro Verificado
                    </Badge>
                  )}
                  <div className="mt-4 space-y-1  w-full rounded-md  border bg-amber-50 p-4 text-xs text-amber-700">
                    <p className="font-semibold text-amber-900">
                      Limites de imagem
                    </p>
                    <p className="text-[10px] md:text-xs">
                      Avatar e banner: até 10 MB por arquivo em{" "}
                      {SUPPORTED_IMAGE_FORMATS_LABEL}.
                    </p>
                  </div>
                </div>
              </div>
              {/* status profissional */}
            </div>

            {/* Right Column: Detailed Info */}
            <div className="lg:col-span-2 space-y-2">
              <div className="md:rounded-md   border-y md:border bg-amber-50 px-4 py-4 md:px-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                  <div className="space-y-1">
                    <p className="font-semibold text-xs md:text-sm text-amber-900">
                      Preencha dentro dos limites para evitar erro ao salvar
                    </p>
                    <p className="text-[10px] md:text-xs text-amber-700">
                      Textos longos, links inválidos e imagens fora do padrão
                      podem ser bloqueados pelas validações do app.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white md:p-8 p-4 md:border border-y space-y-6 ">
                <div className="space-y-1 ">
                  <h3 className="md:text-xl text-base font-semibold text-gray-800 dark:text-gray-200">
                    Informações Pessoais
                  </h3>
                  <p className="text-xs font-normal text-gray-500">
                    Estes dados ajudam outros membros a te encontrarem.
                  </p>
                </div>
                <section className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400  flex items-center gap-1">
                        Nome Completo <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          {...register("name")}
                          maxLength={PROFILE_LIMITS.name}
                          className={`bg-surface focus:bg-white rounded-sm text-sm h-12 transition-all ${
                            errors.name
                              ? "border-red-500/50 focus:border-red-500 ring-0"
                              : touchedFields.name && !errors.name
                                ? "border-green-500/50 focus:border-green-500 ring-0"
                                : "border focus:border-primary/20 ring-0"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {errors.name ? (
                            <AlertCircle size={16} className="text-red-500" />
                          ) : touchedFields.name && !errors.name ? (
                            <CheckCircle2
                              size={16}
                              className="text-green-500"
                            />
                          ) : null}
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted ml-1">
                        Use entre 2 e {PROFILE_LIMITS.name} caracteres.
                      </p>
                      {errors.name && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400  flex items-center gap-1">
                        Localização (Cidade/Estado)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          {...register("location")}
                          placeholder="Ex: São Paulo, SP"
                          maxLength={PROFILE_LIMITS.location}
                          className={`bg-surface focus:bg-white transition-all rounded-sm text-sm h-12 flex-grow ${errors.location ? "ring-2 ring-red-500" : ""}`}
                        />
                        <Button
                          type="button"
                          size="icon"
                          onClick={handleDetectLocation}
                          disabled={detectingLocation}
                          className="size-12 rounded-sm bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50"
                          title="Detectar minha localização"
                        >
                          {detectingLocation ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Navigation size={16} />
                          )}
                        </Button>
                      </div>
                      {errors.location && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">
                          {errors.location.message}
                        </p>
                      )}
                      <p className="text-[10px] text-text-muted ml-1">
                        Até {PROFILE_LIMITS.location} caracteres.
                      </p>
                    </div>
                    <div className="space-y-2 ">
                      <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        Ramo / Ala
                      </Label>
                      <Input
                        {...register("ward")}
                        placeholder="Ex: Ala Centro, Estaca Brasil"
                        maxLength={PROFILE_LIMITS.ward}
                        className={`bg-surface focus:bg-white transition-all text-sm rounded-sm h-12 ${errors.ward ? "ring-2 ring-red-500" : ""}`}
                      />
                      <p className="text-[10px] text-text-muted ml-1">
                        Até {PROFILE_LIMITS.ward} caracteres.
                      </p>
                      {errors.ward && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">
                          {errors.ward.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        Ano de Batismo
                      </Label>
                      <Input
                        {...register("baptismYear")}
                        placeholder="Ex: 2010"
                        maxLength={4}
                        className={`bg-surface focus:bg-white transition-all text-sm rounded-sm h-12 ${errors.baptismYear ? "ring-2 ring-red-500" : ""}`}
                      />
                      {errors.baptismYear && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">
                          {errors.baptismYear.message}
                        </p>
                      )}
                      <p className="text-[10px] text-primary/60 font-medium ml-1">
                        Preencha junto com a ala ou ramo para exibir o selo de
                        membro verificado no perfil.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        Bio / Descrição
                      </Label>
                      <span
                        className={`text-[10px] font-semibold ${formData.bio && formData.bio.length > 500 ? "text-red-500" : "text-gray-500"}`}
                      >
                        {formData.bio?.length || 0} / 500
                      </span>
                    </div>
                    <Textarea
                      {...register("bio")}
                      placeholder="Conte um pouco sobre você e seus talentos..."
                      className={`bg-surface focus:bg-white transition-all text-sm rounded-sm min-h-[150px] p-4 focus:ring-2 focus:ring-primary/20 ${errors.bio ? "ring-2 ring-red-500" : ""}`}
                      maxLength={PROFILE_LIMITS.bio}
                    />
                    <p className="text-[10px] text-text-muted ml-1">
                      Até {PROFILE_LIMITS.bio} caracteres.
                    </p>
                    {errors.bio && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.bio.message}
                      </p>
                    )}
                  </div>
                </section>
              </div>
              {/* aqui */}
              <div className="md:border border-y bg-white p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="md:text-xl text-base font-semibold text-gray-800 dark:text-gray-200">
                      Status Profissional
                    </h3>
                    <p className="text-xs font-normal text-gray-500">
                      Ative para cadastrar seu serviço ou empresa
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-2 px-4 gap-2  bg-surface  border ">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-gray-700">
                        Quero Anunciar
                      </Label>
                      <p className="text-[10px] text-text-muted">
                        Apareça nos resultados das buscas de serviços
                      </p>
                    </div>
                    <Switch
                      checked={formData.isProvider}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          reset(clearProviderFields(getValues()), {
                            keepDirty: true,
                            keepTouched: true,
                          });
                        }

                        setValue("isProvider", checked, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {formData.isProvider && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Categoria do Serviço
                        </Label>
                        <div className="relative">
                          <select
                            {...register("category")}
                            className={`w-full bg-surface border focus:bg-white rounded-sm h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none ${errors.category ? "ring-2 ring-red-500" : ""}`}
                          >
                            <option value="">Selecione uma categoria</option>
                            {PROVIDER_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.category && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            {errors.category.message}
                          </p>
                        )}
                        <p className="text-[10px] text-text-muted ml-1">
                          Escolha uma categoria para aparecer nas buscas.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Especialidade Detalhada
                        </Label>
                        <Input
                          {...register("serviceType")}
                          placeholder="Ex: Eletricista, Professor de Inglês, etc."
                          maxLength={PROFILE_LIMITS.serviceType}
                          className={`bg-surface focus:bg-white text-sm transition-all rounded-sm h-12 ${errors.serviceType ? "ring-2 ring-red-500" : ""}`}
                        />
                        <p className="text-[10px] text-text-muted ml-1">
                          Até {PROFILE_LIMITS.serviceType} caracteres.
                        </p>
                        {errors.serviceType && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            {errors.serviceType.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Nome da Empresa
                          <span className="text-xs text-gray-700">
                            (Opcional)
                          </span>
                        </Label>
                        <Input
                          {...register("companyName")}
                          placeholder="Ex: Silva Construções"
                          maxLength={PROFILE_LIMITS.companyName}
                          className={`bg-surface focus:bg-white transition-all text-sm rounded-sm h-12 ${errors.companyName ? "ring-2 ring-red-500" : ""}`}
                        />
                        {errors.companyName && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            {errors.companyName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4 pt-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Disponibilidade
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABILITY_OPTIONS.map((day) => {
                            const isSelected =
                              formData.availability?.includes(day);
                            return (
                              <Button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const current = formData.availability || [];
                                  const next = isSelected
                                    ? current.filter((d) => d !== day)
                                    : [...current, day];
                                  setValue("availability", next, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                                className={`h-10 px-4 text-xs font-bold transition-all  ${
                                  isSelected
                                    ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                                    : "bg-blue-100 text-blue-500 hover:bg-blue-200 "
                                }`}
                              >
                                {day}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"></Label>
                        <Input
                          {...register("serviceHours")}
                          placeholder="Ex: 08:00 - 18:00 ou Por agendamento"
                          maxLength={PROFILE_LIMITS.serviceHours}
                          className={`bg-surface focus:bg-white transition-all text-sm rounded-sm h-12 ${errors.serviceHours ? "ring-2 ring-red-500" : ""}`}
                        />
                        <p className="text-[10px] text-text-muted ml-1">
                          Horário ou disponibilidade resumida, até{" "}
                          {PROFILE_LIMITS.serviceHours} caracteres.
                        </p>
                        {errors.serviceHours && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            {errors.serviceHours.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {formData.isProvider && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 ">
                          Endereço Comercial
                          <span className="text-gray-500 text-xs font-medium">
                            (Opcional)
                          </span>
                        </h4>
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Endereço (Rua/Avenida)
                        </Label>
                        <Input
                          {...register("businessAddress")}
                          placeholder="Ex: Rua das Flores"
                          maxLength={PROFILE_LIMITS.address}
                          className={`bg-surface focus:bg-white transition-all rounded-sm h-12 ${errors.businessAddress ? "ring-2 ring-red-500" : ""}`}
                        />
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Número
                        </Label>
                        <Input
                          {...register("businessAddressNumber")}
                          placeholder="Ex: 123"
                          maxLength={PROFILE_LIMITS.addressNumber}
                          className={`bg-surface focus:bg-white transition-all rounded-sm h-12 ${errors.businessAddressNumber ? "ring-2 ring-red-500" : ""}`}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Bairro
                        </Label>
                        <Input
                          {...register("businessNeighborhood")}
                          placeholder="Ex: Centro"
                          maxLength={PROFILE_LIMITS.neighborhood}
                          className={`bg-surface focus:bg-white transition-all rounded-sm h-12 ${errors.businessNeighborhood ? "ring-2 ring-red-500" : ""}`}
                        />
                      </div>
                      <div className="space-y-2 col-auto">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Estado
                        </Label>
                        <Input
                          {...register("businessState")}
                          placeholder="Ex: SP"
                          maxLength={PROFILE_LIMITS.state}
                          className={`focus:bg-white bg-surface rounded-sm text-sm h-12 ${errors.businessState ? "ring-2 ring-red-500" : ""}`}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Complemento
                        </Label>
                        <Input
                          {...register("businessComplement")}
                          placeholder="Ex: Sala 10, Bloco B"
                          maxLength={PROFILE_LIMITS.complement}
                          className={`focus:bg-white bg-surface rounded-sm text-sm h-12 ${errors.businessComplement ? "ring-2 ring-red-500" : ""}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white md:p-8 p-4 md:border border-y space-y-6">
                <h3 className="md:text-xl text-base font-semibold text-gray-800 dark:text-gray-200">
                  Redes Sociais & Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      WhatsApp
                    </Label>
                    <Input
                      {...register("whatsapp")}
                      placeholder="Ex: 11999999999"
                      inputMode="numeric"
                      maxLength={PROFILE_LIMITS.whatsappDigitsMax}
                      className={`bg-surface rounded-sm text-sm h-12 ${errors.whatsapp ? "ring-2 ring-red-500" : ""}`}
                    />
                    <p className="text-[10px] text-text-muted ml-1">
                      Somente números, de {PROFILE_LIMITS.whatsappDigitsMin} a{" "}
                      {PROFILE_LIMITS.whatsappDigitsMax} dígitos.
                    </p>
                    {errors.whatsapp && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.whatsapp.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-1 col-span-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Telefone Adicional
                      <span className="text-gray-800 text-xs font-normal">
                        (Opcional)
                      </span>
                    </Label>
                    <Input
                      {...register("phone")}
                      placeholder="Ex: 1133334444"
                      inputMode="numeric"
                      maxLength={PROFILE_LIMITS.phoneDigitsMax}
                      className={`bg-surface rounded-sm text-sm h-12 ${errors.phone ? "ring-2 ring-red-500" : ""}`}
                    />
                    <p className="text-[10px] text-text-muted ml-1">
                      Somente números, até {PROFILE_LIMITS.phoneDigitsMax} dígitos.
                    </p>
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Instagram
                    </Label>
                    <Input
                      {...register("instagram")}
                      placeholder="@seuusuario"
                      maxLength={PROFILE_LIMITS.socialHandle}
                      className={`bg-surface rounded-sm text-sm h-12 ${errors.instagram ? "ring-2 ring-red-500" : ""}`}
                    />
                    <p className="text-[10px] text-text-muted ml-1">
                      Usuário do Instagram com até {PROFILE_LIMITS.socialHandle} caracteres.
                    </p>
                    {errors.instagram && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.instagram.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Facebook
                    </Label>
                    <Input
                      {...register("facebook")}
                      placeholder="Link do perfil"
                      maxLength={PROFILE_LIMITS.socialUrl}
                      className={`bg-surface rounded-sm text-sm h-12 ${errors.facebook ? "ring-2 ring-red-500" : ""}`}
                    />
                    {errors.facebook && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.facebook.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      LinkedIn
                    </Label>
                    <Input
                      {...register("linkedin")}
                      placeholder="Link do perfil"
                      maxLength={PROFILE_LIMITS.socialUrl}
                      className={`bg-surface rounded-sm text-sm h-12 ${errors.linkedin ? "ring-2 ring-red-500" : ""}`}
                    />
                    {errors.linkedin && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.linkedin.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Website
                    </Label>
                    <Input
                      {...register("website")}
                      placeholder="https://exemplo.com"
                      maxLength={PROFILE_LIMITS.website}
                      className={`bg-surface rounded-sm h-12 text-sm  ${errors.website ? "ring-2 ring-red-500" : ""}`}
                    />
                    <p className="text-[10px] text-text-muted ml-1">
                      URL completa com `https://`, até {PROFILE_LIMITS.website} caracteres.
                    </p>
                    {errors.website && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.website.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white md:border border-y md:p-8 p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="md:text-xl text-base font-semibold text-gray-800 dark:text-gray-200">
                      Galeria de Fotos
                    </h3>
                    <Badge
                      className={`text-xs font-bold px-2 py-0.5 ${formData.gallery.length >= PROFILE_LIMITS.galleryMaxItems ? "bg-red-50 text-red-500 border-red-100" : "bg-primary/5 text-primary border-primary/10"}`}
                    >
                      {formData.gallery.length}/{PROFILE_LIMITS.galleryMaxItems}
                    </Badge>
                  </div>
                  <Button
                    variant="default"
                    onClick={handleAddPhoto}
                    disabled={uploading === "gallery"}
                    className="hidden md:flex rounded-sm h-10 text-sm bg-blue-500 px-4 hover:bg-blue-600 active:bg-blue-700 text-white font-bold disabled:opacity-50"
                  >
                    {uploading === "gallery" ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Plus size={16} className="mr-2 text-white" />
                    )}{" "}
                    Adicionar Foto
                  </Button>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "gallery")}
                  />
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-[11px] text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">
                    Regras da galeria
                  </p>
                  <p>
                    Até {PROFILE_LIMITS.galleryMaxItems} fotos em{" "}
                    {SUPPORTED_IMAGE_FORMATS_LABEL}, com até 10 MB por arquivo.
                  </p>
                  <p>
                    Cada descrição é opcional e pode ter até{" "}
                    {PROFILE_LIMITS.galleryDescription} caracteres.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {formData.gallery.map((photo, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="relative aspect-square rounded-2xl overflow-hidden group border border-border-subtle">
                        <Image
                          src={photo.url}
                          alt={`Galeria ${index}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="rounded-full w-8 h-8"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Comentário (opcional)"
                        value={photo.description || ""}
                        maxLength={PROFILE_LIMITS.galleryDescription}
                        onChange={(e) => {
                          const newGallery = [...formData.gallery];
                          const photoItem = formData.gallery[index];
                          newGallery[index] = {
                            ...photoItem,
                            description: e.target.value,
                          };
                          setValue("gallery", newGallery, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className="text-[10px] min-h-[50px] h-auto p-2 bg-surface border-none resize-none rounded-xl"
                      />
                      <p className="text-[10px] text-text-muted ml-1">
                        {(photo.description || "").length}/
                        {PROFILE_LIMITS.galleryDescription}
                      </p>
                    </div>
                  ))}
                  {formData.gallery.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-surface rounded-3xl border-2 border-dashed border-border-subtle">
                      <Camera className="mx-auto h-10 w-10 text-text-muted/20 mb-3" />
                      <p className="text-sm text-text-muted font-medium">
                        Sua galeria está vazia.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="default"
                    onClick={handleAddPhoto}
                    disabled={uploading === "gallery"}
                    className="md:hidden flex rounded-sm h-10 text-sm bg-blue-500 px-4 hover:bg-blue-600 active:bg-blue-700 text-white font-bold disabled:opacity-50"
                  >
                    {uploading === "gallery" ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Plus size={16} className="mr-2 text-white" />
                    )}{" "}
                    Adicionar Foto
                  </Button>
                </div>
              </div>

              <div className="bg-white md:border border-y md:p-8 p-4 space-y-6">
                <div className="space-y-1">
                  <h3 className="md:text-xl text-base font-semibold text-gray-800 dark:text-gray-200">
                    Zona de Perigo
                  </h3>
                  <p className="text-xs font-normal text-gray-500">
                    Cancelar sua conta da plataforma.
                  </p>
                </div>

                <div className="flex flex-col gap-4 rounded-sm border border-red-200 bg-red-50 p-4 md:p-5">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-700">
                      Cancelar minha conta
                    </p>
                    <p className="text-xs text-red-600">
                     todos seus dados serão apagados na plataforma, deseja continuar?
                    </p>
                  </div>

                  <div className="flex justify-start">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleCancelAccount}
                      disabled={cancelingAccount || loading}
                      className="rounded-sm h-10 px-4"
                    >
                      {cancelingAccount ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Cancelando conta...
                        </>
                      ) : (
                        "Cancelar conta"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
