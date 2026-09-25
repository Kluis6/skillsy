"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/user-service";
import { CommunityRecommendation, Rating, UserProfile } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatReviewCount,
  RecommendationCount,
  RecommendationSummary,
} from "@/components/profile/recommendation-summary";
import {
  UserPlus,
  Star,
  Info,
  Building2,
  Camera,
  Globe,
  Copy,
  CalendarDays,
  Clock,
  Flag,
  HeartHandshake,
  MessageSquareText,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfilePublicPageLoading } from "@/components/loading/route-loaders";
import { MembershipMark } from "@/components/ui/trust-signals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Navbar } from "./navbar";
import { AuthModal } from "./auth-modal";
import { LuMapPin, LuPencil, LuUserMinus } from "react-icons/lu";
import { TooltipContent, Tooltip, TooltipTrigger } from "./ui/tooltip";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPhone,
  FaWhatsapp,
} from "react-icons/fa";
import { PiShareFat } from "react-icons/pi";
import { BsWhatsapp } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { AVAILABILITY_OPTIONS } from "@/lib/profile-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { reportUserSchema, type ReportUserFormData } from "@/lib/validations";
import { REPORT_REASON_LABELS, REPORT_REASON_OPTIONS } from "@/lib/reporting";

interface ProfileDetailClientProps {
  id: string;
  initialProfile: UserProfile | null;
}

export function ProfileDetailClient({
  id,
  initialProfile,
}: ProfileDetailClientProps) {
  const {
    user,
    profile: currentUserProfile,
    toggleContact,
    profile,
    logout,
  } = useAuth();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(
    initialProfile,
  );
  const [loading, setLoading] = useState(!initialProfile);
  const [userRating, setUserRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [recommendedState, setIsRecommended] = useState(false);
  const [loadedRecommendations, setRecommendations] = useState<
    CommunityRecommendation[]
  >([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  // Recommendations only apply to providers (and never to your own profile);
  // derive that here instead of resetting state inside the effects below.
  const isRecommended =
    Boolean(user?.uid) &&
    Boolean(targetProfile?.isProvider) &&
    user?.uid !== targetProfile?.uid &&
    recommendedState;
  const recommendations = targetProfile?.isProvider
    ? loadedRecommendations
    : [];
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const reportForm = useForm<ReportUserFormData>({
    resolver: zodResolver(reportUserSchema),
    mode: "onBlur",
    defaultValues: {
      reason: "informacao_falsa",
      details: "",
    },
  });
  const reportDetails = useWatch({
    control: reportForm.control,
    name: "details",
  });

  const shareUrl = targetProfile
    ? typeof window === "undefined"
      ? `/profile/${targetProfile.uid}`
      : `${window.location.origin}/profile/${targetProfile.uid}`
    : "";

  const canUseNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;
  const canReportProfile = Boolean(
    user && targetProfile && targetProfile.uid !== user.uid,
  );
  const canToggleContact = Boolean(
    user && targetProfile && targetProfile.uid !== user.uid,
  );
  const canRateProfile = Boolean(
    targetProfile &&
    targetProfile.isProvider &&
    user?.uid !== targetProfile.uid,
  );
  const hasReviews = (targetProfile?.reviewCount || 0) > 0;
  // Mobile keeps the main contact action on screen while scrolling.
  const showStickyWhatsApp = Boolean(
    targetProfile?.whatsapp && user?.uid !== targetProfile?.uid,
  );
  const publicLocation = [targetProfile?.publicCity, targetProfile?.publicState]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    // We only need to fetch if we don't have the profile yet or to get fresh data
    const fetchProfile = async () => {
      if (!id || initialProfile) return;
      setLoading(true);
      try {
        const p = await UserService.getPublicProfile(id);
        setTargetProfile(p);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, initialProfile]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!targetProfile?.isProvider) {
        setRatings([]);
        return;
      }

      setLoadingRatings(true);
      try {
        const nextRatings = await UserService.getRatings(targetProfile.uid);
        setRatings(nextRatings);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        toast.error("Não foi possível carregar os comentários.");
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, [targetProfile?.uid, targetProfile?.isProvider]);

  useEffect(() => {
    if (
      !user?.uid ||
      !targetProfile?.isProvider ||
      user.uid === targetProfile.uid
    ) {
      return;
    }

    UserService.getCommunityRecommendation(targetProfile.uid, user.uid)
      .then((recommendation) => setIsRecommended(Boolean(recommendation)))
      .catch(() => setIsRecommended(false));
  }, [targetProfile?.uid, targetProfile?.isProvider, user?.uid]);

  useEffect(() => {
    if (!targetProfile?.uid || !targetProfile.isProvider) {
      return;
    }

    UserService.getCommunityRecommendations(targetProfile.uid, 8)
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [targetProfile?.uid, targetProfile?.isProvider]);

  const isContact = currentUserProfile?.contacts?.includes(id);

  const handleToggleContact = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar contatos", {
        description: "Faça login para criar sua rede de confiança.",
        action: { label: "Entrar", onClick: () => setAuthModalOpen(true) },
      });
      return;
    }

    try {
      await toggleContact(id);
      toast.success(
        isContact ? "Removido dos contatos" : "Adicionado aos contatos",
      );
    } catch (error) {
      toast.error("Erro ao atualizar contatos");
    }
  };

  const handleToggleRecommendation = async () => {
    if (!user) {
      toast.error("Entre para indicar um profissional", {
        description: "A indicação comunitária é registrada uma vez por membro.",
        action: { label: "Entrar", onClick: () => setAuthModalOpen(true) },
      });
      return;
    }
    if (!targetProfile || user.uid === targetProfile.uid) return;

    setRecommendationLoading(true);
    try {
      const added = await UserService.toggleCommunityRecommendation(
        user.uid,
        targetProfile.uid,
        {
          name:
            currentUserProfile?.name ||
            profile?.name ||
            user.displayName ||
            "Membro Skillsy",
          photoURL:
            currentUserProfile?.photoURL ||
            profile?.photoURL ||
            user.photoURL ||
            "",
        },
      );
      setIsRecommended(added);
      setTargetProfile((current) =>
        current
          ? {
              ...current,
              recommendationCount: Math.max(
                0,
                (current.recommendationCount || 0) + (added ? 1 : -1),
              ),
            }
          : current,
      );
      setRecommendations((current) => {
        if (added) {
          const nextRecommendation: CommunityRecommendation = {
            recommenderId: user.uid,
            recommenderName:
              currentUserProfile?.name ||
              profile?.name ||
              user.displayName ||
              "Membro Skillsy",
            recommenderPhotoURL:
              currentUserProfile?.photoURL ||
              profile?.photoURL ||
              user.photoURL ||
              "",
            createdAt: new Date(),
          };

          return [
            nextRecommendation,
            ...current.filter((item) => item.recommenderId !== user.uid),
          ].slice(0, 8);
        }

        return current.filter((item) => item.recommenderId !== user.uid);
      });
      toast.success(added ? "Indicação registrada" : "Indicação removida", {
        description: added
          ? "Seu nome e foto públicos podem aparecer como prova social neste perfil."
          : "Você pode indicar novamente quando quiser.",
      });
    } catch (error) {
      console.error("Error toggling recommendation:", error);
      toast.error("Não foi possível atualizar sua indicação");
    } finally {
      setRecommendationLoading(false);
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const handleWhatsApp = () => {
    if (!targetProfile?.whatsapp) {
      toast.error("WhatsApp não informado", {
        description:
          "Este profissional ainda não cadastrou um número de contato.",
      });
      return;
    }
    const phone = targetProfile.whatsapp.replace(/\D/g, "");
    window.open(
      `https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}`,
      "_blank",
    );
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado", {
        description: "Agora você pode compartilhar este perfil.",
      });
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleNativeShare = async () => {
    if (!targetProfile || !shareUrl || !canUseNativeShare) return;

    try {
      await navigator.share({
        title: targetProfile.name,
        text: `Confira o perfil de ${targetProfile.name} no Skillsy.`,
        url: shareUrl,
      });
    } catch {
      // Usuario cancelou ou o navegador bloqueou a acao.
    }
  };

  const handleSubmitReport = async (data: ReportUserFormData) => {
    if (!user) {
      toast.error("Login necessário", {
        description: "Você precisa estar logado para denunciar um perfil.",
      });
      return;
    }

    if (!targetProfile || user.uid === targetProfile.uid) {
      toast.error("Ação inválida", {
        description: "Você não pode denunciar o próprio perfil.",
      });
      return;
    }

    try {
      await UserService.submitUserReport({
        reportedUserId: targetProfile.uid,
        reportedUserName: targetProfile.name,
        reason: data.reason,
        details: data.details?.trim(),
      });

      toast.success("Denúncia enviada", {
        description: "Nossa equipe administrativa poderá revisar esse perfil.",
      });
      reportForm.reset({
        reason: "informacao_falsa",
        details: "",
      });
      setReportDialogOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Não foi possível enviar a denúncia.");
    }
  };

  const handleWhatsAppShare = () => {
    if (!targetProfile || !shareUrl) return;

    const message = `Confira o perfil de ${targetProfile.name} no Skillsy: ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleTelegramShare = () => {
    if (!targetProfile || !shareUrl) return;

    const message = `Confira o perfil de ${targetProfile.name} no Skillsy: ${shareUrl}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareActions = [
    {
      label: "Compartilhar no WhatsApp",
      description: "Envie o perfil no WhatsApp.",
      icon: BsWhatsapp,
      onClick: handleWhatsAppShare,
      className: "text-success",
    },
    {
      label: "Compartilhar no Telegram",
      description: "Envie o perfil no Telegram.",
      icon: FaTelegramPlane,
      onClick: handleTelegramShare,
      className: "text-sky-500",
    },
    {
      label: "Copiar link",
      description: "Copia o link para a area de transferencia.",
      icon: Copy,
      onClick: handleCopyLink,
      className: "text-sky-600",
    },
  ];

  const renderShareSheet = () => (
    <SheetContent side="bottom" className="">
      <SheetHeader className="text-left">
        <SheetTitle>Compartilhar perfil</SheetTitle>
        <SheetDescription>
          Envie o perfil de <strong>{targetProfile?.name}</strong> por:
        </SheetDescription>
      </SheetHeader>
      <div className="flex w-full flex-col gap-2 p-4 md:flex-row">
        {shareActions.map((action) => {
          const Icon = action.icon;

          return (
            <SheetClose
              key={action.label}
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start gap-3 p-4 text-left md:w-1/3"
                  onClick={action.onClick}
                />
              }
            >
              <span className={action.className}>
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col items-start">
                <span className="font-semibold text-text-main">
                  {action.label}
                </span>
                <span className="whitespace-normal text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </SheetClose>
          );
        })}
      </div>
    </SheetContent>
  );

  const renderShareButton = (className?: string) => {
    if (canUseNativeShare) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className={className}
                onClick={handleNativeShare}
              />
            }
          >
            <PiShareFat className="text-text-muted" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Compartilhar</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Sheet>
        <Tooltip>
          <SheetTrigger
            render={
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    className={` ${className || "size-10"}`}
                  />
                }
              >
                <PiShareFat className="text-text-muted" />
              </TooltipTrigger>
            }
          />
          <TooltipContent>
            <p>Compartilhar</p>
          </TooltipContent>
        </Tooltip>
        {renderShareSheet()}
      </Sheet>
    );
  };

  const renderReportButton = (className?: string) => {
    if (!canReportProfile) {
      return null;
    }

    return (
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="destructive"
                size="icon-lg"
                className={` ${className && ""}`}
                onClick={() => setReportDialogOpen(true)}
              />
            }
          >
            <Flag className="text-destructive" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Denunciar perfil</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-md sm:h-auto">
          <DialogHeader>
            <DialogTitle>Denunciar perfil</DialogTitle>
            <DialogDescription>
              Informe o motivo da denúncia. Isso será enviado para o painel
              administrativo.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={reportForm.handleSubmit(handleSubmitReport)}
            className="space-y-4"
          >
            <div className="border border-warning-border bg-warning-surface px-4 py-3 text-xs text-warning-foreground">
              Use a denúncia apenas para casos reais de conteúdo inadequado,
              fraude, spam ou informações enganosas.
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="profile-report-reason"
                className="text-sm font-medium text-text-main"
              >
                Motivo
              </Label>
              <Controller
                control={reportForm.control}
                name="reason"
                render={({ field }) => (
                  <Select
                    items={REPORT_REASON_LABELS}
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                  >
                    <SelectTrigger
                      id="profile-report-reason"
                      ref={field.ref}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(reportForm.formState.errors.reason)}
                      className="h-10 w-full px-3 text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_REASON_OPTIONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {REPORT_REASON_LABELS[reason]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {reportForm.formState.errors.reason && (
                <p className="text-xs font-bold text-destructive">
                  {reportForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="profile-report-details"
                className="text-sm font-medium text-text-main"
              >
                Detalhes adicionais
              </Label>
              <Textarea
                id="profile-report-details"
                {...reportForm.register("details")}
                placeholder="Descreva o problema com até 1000 caracteres."
                maxLength={1000}
                className="min-h-28"
              />
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Opcional, mas ajuda na análise.</span>
                <span>{(reportDetails || "").length}/1000</span>
              </div>
              {reportForm.formState.errors.details && (
                <p className="text-xs font-bold text-destructive">
                  {reportForm.formState.errors.details.message}
                </p>
              )}
            </div>
            <DialogFooter>
              {/* <Button
                type="button"
                variant="ghost"
                onClick={() => setReportDialogOpen(false)}
              >
                Cancelar
              </Button> */}
              <Button
                type="submit"
                size="lg"
                variant="default"
                className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-medium"
                disabled={reportForm.formState.isSubmitting}
              >
                {reportForm.formState.isSubmitting
                  ? "Enviando..."
                  : "Enviar denúncia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const handlePhoneCall = () => {
    if (!targetProfile?.phone) return;
    window.open(`tel:${targetProfile.phone.replace(/\D/g, "")}`, "_self");
  };

  const hasContactInfo = Boolean(
    targetProfile?.whatsapp ||
    targetProfile?.phone ||
    targetProfile?.instagram ||
    targetProfile?.facebook ||
    targetProfile?.linkedin ||
    targetProfile?.website,
  );

  const availabilityDays = (targetProfile?.availability || []).filter((day) =>
    AVAILABILITY_OPTIONS.includes(day as (typeof AVAILABILITY_OPTIONS)[number]),
  );

  const hasAvailabilityInfo = Boolean(
    availabilityDays.length || targetProfile?.serviceHours?.trim(),
  );

  const formatRatingDate = (createdAt: Rating["createdAt"]) => {
    if (
      !createdAt ||
      typeof createdAt !== "object" ||
      !("seconds" in createdAt)
    ) {
      return "Agora há pouco";
    }

    return formatDistanceToNow(new Date(createdAt.seconds * 1000), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const handleRatingSelect = (score: number) => {
    if (!canRateProfile || submittingRating) {
      return;
    }

    setUserRating(score);
  };

  const handleRate = async () => {
    if (!user) {
      toast.error("Login necessário", {
        description:
          "Você precisa estar logado para avaliar este profissional.",
      });
      return;
    }

    if (user.uid === id) {
      toast.error("Ação inválida", {
        description: "Você não pode avaliar seu próprio perfil.",
      });
      return;
    }

    if (!targetProfile?.isProvider) {
      toast.error("Avaliação indisponível", {
        description: "Este perfil não está público para avaliações.",
      });
      return;
    }

    if (!userRating) {
      toast.error("Selecione uma nota", {
        description: "Escolha de 1 a 5 estrelas para enviar sua avaliação.",
      });
      return;
    }

    setSubmittingRating(true);
    try {
      await UserService.submitRating(
        user.uid,
        id,
        userRating,
        ratingComment.trim() || undefined,
      );
      toast.success("Avaliação enviada!", {
        description:
          "Obrigado por compartilhar sua percepção com a comunidade.",
      });
      // Apply the new score locally instead of refetching the profile.
      const updatedRatings = await UserService.getRatings(id);
      setTargetProfile((current) => {
        if (!current) return current;
        const count = current.reviewCount || 0;
        const average =
          ((current.rating || 0) * count + userRating) / (count + 1);
        return {
          ...current,
          rating: Math.round(average * 10) / 10,
          reviewCount: count + 1,
        };
      });
      setRatings(updatedRatings);
      setRatingComment("");
    } catch (error: any) {
      console.error("Error submitting rating:", error);

      let message = "Erro ao enviar avaliação";

      // Try to parse the FirestoreErrorInfo or generic error
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error) {
          if (
            errorData.error.toLowerCase().includes("permission") ||
            errorData.error.toLowerCase().includes("insufficient")
          ) {
            message =
              "Erro de permissão. Verifique se você já avaliou este profissional ou tente novamente mais tarde.";
          } else {
            message = errorData.error;
          }
        }
      } catch {
        // Not JSON, use message directly if it's user-friendly
        if (error.message && !error.message.includes("[object Object]")) {
          message = error.message;
        }
      }

      toast.error(message);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <ProfilePublicPageLoading />;
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <Info size={64} className="text-text-muted mb-6" />
        <h1 className="text-3xl font-bold mb-4">Perfil não encontrado</h1>
        <p className="text-text-muted mb-8">
          Este perfil não está disponível publicamente no momento ou o link
          informado está incorreto.
        </p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground font-bold  px-8">
            Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  const profileRoleLabel =
    targetProfile.serviceType ||
    targetProfile.category ||
    "Membro da comunidade Skillsy";
  return (
    <>
      <Navbar user={user} profile={profile} logout={logout} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <main
        className={`w-full h-full ${showStickyWhatsApp ? "pb-20 sm:pb-0" : ""}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {/* Top Profile Card */}
          <section className="border-border-subtle border-b bg-card">
            <div className="relative h-26 md:h-52 bg-muted">
              {targetProfile.bannerURL ? (
                <Image
                  src={targetProfile.bannerURL}
                  alt={`Capa do perfil de ${targetProfile.name}`}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-r from-primary/15 via-primary/5 to-surface" />
              )}
            </div>

            <section className="mx-auto container px-4 pb-4">
              <div className="relative flex flex-col">
                {/* Avatar Overlap */}
                <div className="flex items-center md:py-4 py-2 justify-end">
                  <div className="flex border px-2 py-1 sm:hidden">
                    <RecommendationCount
                      recommendationCount={
                        targetProfile.recommendationCount || 0
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="sm:flex space-x-2 hidden">
                    {renderShareButton("size-10")}
                    {renderReportButton("size-10")}
                    {user?.uid === targetProfile.uid ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              className="size-9 flex border justify-center items-center hover:bg-muted transition-colors"
                              href="/profile"
                            >
                              <LuPencil className="text-text-muted" />
                            </Link>
                          }
                        />
                        <TooltipContent>
                          <p>Editar perfil</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <>
                        {canToggleContact && (
                          <Button
                            size="lg"
                            variant={isContact ? "destructive" : "outline"}
                            onClick={handleToggleContact}
                            className="px-5 font-semibold"
                          >
                            {isContact ? (
                              <>
                                <LuUserMinus /> Desconectar
                              </>
                            ) : (
                              <>
                                <UserPlus size={18} className="mr-2" /> Conectar
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      onClick={handleWhatsApp}
                      size="lg"
                      variant="default"
                      className="rounded-none bg-success px-6 font-bold text-success-foreground hover:bg-success/90 active:bg-success/80"
                    >
                      <FaWhatsapp /> <p>Falar no WhatsApp</p>
                    </Button>
                    {user?.uid !== targetProfile.uid &&
                      !targetProfile.isProvider && (
                        <Button
                          size="lg"
                          onClick={handleToggleRecommendation}
                          disabled={recommendationLoading}
                          variant="outline"
                          className="px-5 font-semibold rounded-none"
                        >
                          <HeartHandshake className="size-4" />
                          {isRecommended ? "Você indicou" : "Eu indico"}
                        </Button>
                      )}
                  </div>
                </div>
                <div className="-mt-28 sm:-mt-34 md:-mt-38 mb-4 relative z-10 size-28 sm:size-32 md:size-40">
                  <Avatar className="w-full h-full border-6 border-card bg-card shadow-sm shadow-black/30">
                    <AvatarImage
                      src={targetProfile.photoURL}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-surface text-primary font-bold text-4xl">
                      {targetProfile.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="md:space-y-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl md:text-3xl font-bold text-text-main leading-tight">
                        {targetProfile.name}
                      </h2>
                      <MembershipMark profile={targetProfile} size={20} />
                    </div>

                    <p className="text-base text-text-muted font-normal">
                      {profileRoleLabel}
                    </p>
                    {(targetProfile.companyName || targetProfile.category) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {targetProfile.companyName && (
                          <div className="flex items-center space-x-2">
                            <Building2 size={18} className="text-text-main" />
                            <p className="text-sm font-normal text-text-main">
                              {targetProfile.companyName}
                            </p>
                          </div>
                        )}
                        {targetProfile.companyName && targetProfile.category ? (
                          <span className="font-bold block text-text-main">
                            ·
                          </span>
                        ) : null}
                        {targetProfile.category && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                          >
                            {targetProfile.category}
                          </Badge>
                        )}
                      </div>
                    )}

                    {publicLocation && (
                      <div className="flex items-center space-x-2">
                        <LuMapPin size={18} className="text-text-main" />
                        <p className="text-sm text-text-main font-normal">
                          {publicLocation}
                        </p>
                      </div>
                    )}

                    {!targetProfile.isProvider && targetProfile.ward && (
                      <div className="flex items-center space-x-2">
                        <Users size={18} className="text-text-main" />
                        <p className="text-sm text-text-main font-normal">
                          {targetProfile.ward}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full sm:w-auto">
                    <div className="hidden space-y-1 border bg-surface p-4 text-center sm:block">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <HeartHandshake size={22} aria-hidden="true" />
                        <p className="text-3xl font-bold">
                          {targetProfile.recommendationCount || 0}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-text-muted">
                        {(targetProfile.recommendationCount || 0) === 1
                          ? "indicação"
                          : "indicações"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:hidden">
                      <div className="flex gap-2 justify-end">
                        {renderShareButton("size-9")}
                        {renderReportButton("size-9")}
                        {user?.uid === targetProfile.uid ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Link
                                  className="size-9 flex border justify-center items-center hover:bg-muted transition-colors"
                                  href="/profile"
                                >
                                  <LuPencil className="text-text-muted" />
                                </Link>
                              }
                            />
                            <TooltipContent>
                              <p>Editar perfil</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <>
                            {canToggleContact && (
                              <Button
                                size="lg"
                                variant={isContact ? "destructive" : "outline"}
                                onClick={handleToggleContact}
                                className="flex-1 px-5 font-semibold"
                              >
                                {isContact ? (
                                  <>
                                    <LuUserMinus /> Desconectar
                                  </>
                                ) : (
                                  <>
                                    <UserPlus size={18} className="mr-2" />
                                    Conectar
                                  </>
                                )}
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      <Button
                        onClick={handleWhatsApp}
                        variant="default"
                        size="lg"
                        className="w-full bg-success px-6 font-bold text-success-foreground hover:bg-success/90 active:bg-success/80"
                      >
                        <FaWhatsapp /> <p>Falar no WhatsApp</p>
                      </Button>
                      {user?.uid !== targetProfile.uid &&
                        !targetProfile.isProvider && (
                          <Button
                            onClick={handleToggleRecommendation}
                            disabled={recommendationLoading}
                            variant="outline"
                            size="lg"
                            className="w-full font-semibold"
                          >
                            <HeartHandshake className="size-4" />
                            {isRecommended ? "Você indicou" : "Eu indico"}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>

          {targetProfile.isProvider ? (
            <section className="border-b border-border-subtle bg-card">
              <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-text-main">
                    Indicado pela comunidade
                  </h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
                    Cada membro pode indicar uma vez este profissional.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <RecommendationSummary
                    recommendationCount={targetProfile.recommendationCount || 0}
                    recommenders={recommendations.map((recommendation) => ({
                      id: recommendation.recommenderId,
                      name: recommendation.recommenderName,
                      photoURL: recommendation.recommenderPhotoURL,
                    }))}
                    avatarSize="lg"
                  />

                  {user?.uid !== targetProfile.uid ? (
                    <Button
                      onClick={handleToggleRecommendation}
                      disabled={recommendationLoading}
                      variant={isRecommended ? "outline" : "default"}
                      className="w-full sm:w-auto"
                    >
                      <HeartHandshake className="size-4" />
                      {isRecommended ? "Você indicou" : "Eu indico"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {/* About Section */}
          <section className="bg-card border-y border-border-subtle">
            <div className="mx-auto container p-4 space-y-4">
              <h3 className="md:text-xl text-base font-semibold text-text-main">
                Sobre este perfil
              </h3>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap max-w-3xl">
                {targetProfile.bio ||
                  "Este membro ainda não adicionou uma descrição."}
              </p>
            </div>
          </section>

          {/* disponibilidade e avaliações */}
          <div className="w-full flex flex-col md:flex-row gap-2">
            {hasAvailabilityInfo && (
              <div className="bg-card w-full border-y border-border-subtle md:border-r border-r-0">
                <div className="h-full w-full md:ps-7 p-4 mx-auto container space-y-4">
                  <h3 className="text-base font-semibold text-text-main md:text-xl">
                    Disponibilidade
                  </h3>

                  {availabilityDays.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={16} className="text-text-muted" />
                        <p className="text-xs font-bold text-text-muted">
                          Dias de atendimento
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABILITY_OPTIONS.filter((day) =>
                          availabilityDays.includes(day),
                        ).map((day) => (
                          <Badge key={day} variant="outline" className="">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {targetProfile?.serviceHours?.trim() && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-text-muted" />{" "}
                        <p className="text-xs font-bold text-text-muted">
                          Horário de atendimento
                        </p>
                      </div>
                      <div className="bg-surface px-4 py-2">
                        <p className="text-sm font-medium text-text-main">
                          {targetProfile.serviceHours}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {targetProfile.isProvider && (
              <div className="bg-card w-full border-y border-border-subtle md:border-l border-l-0">
                <div className="h-full w-full p-4 mx-auto container md:pe-7 space-y-4">
                  <h3 className="md:text-xl text-base font-semibold text-text-main">
                    Avaliar este profissional
                  </h3>
                  <div className="w-full h-full flex space-x-2 md:space-x-4">
                    <div className="text-center bg-surface border size-26 p-2 flex-none">
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <p className="md:text-3xl text-2xl font-bold text-text-main">
                          {hasReviews
                            ? Number(targetProfile.rating || 0).toFixed(1)
                            : "—"}
                        </p>
                        {hasReviews ? (
                          <div
                            className="flex items-center justify-center gap-0.5 py-1 text-highlight"
                            aria-hidden="true"
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                fill={
                                  Math.round(targetProfile.rating || 0) >= star
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ))}
                          </div>
                        ) : null}
                        <p className="text-xs font-bold text-text-muted">
                          {hasReviews
                            ? formatReviewCount(targetProfile.reviewCount || 0)
                            : "Ainda sem avaliações"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm text-text-main font-medium">
                        Dê uma nota em estrelas e, se quiser, deixe um
                        comentário.
                      </p>
                      <p className="text-xs text-text-muted">
                        A nota de 1 a 5 estrelas acompanha o seu comentário, que
                        é opcional. Seu nome aparece junto à avaliação.
                      </p>
                      {!user ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-fit"
                          onClick={() => setAuthModalOpen(true)}
                        >
                          Entrar para avaliar
                        </Button>
                      ) : (
                        <div
                          className="flex items-center gap-1.5"
                          role="radiogroup"
                          aria-label="Nota em estrelas"
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              role="radio"
                              aria-checked={userRating === star}
                              aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
                              disabled={!canRateProfile || submittingRating}
                              onMouseEnter={() => setRatingHover(star)}
                              onMouseLeave={() => setRatingHover(0)}
                              onClick={() => handleRatingSelect(star)}
                              className={`transition-all ${
                                (ratingHover || userRating || 0) >= star
                                  ? "text-highlight"
                                  : "text-border-subtle"
                              } disabled:opacity-50`}
                            >
                              <Star
                                size={24}
                                fill={
                                  (ratingHover || userRating || 0) >= star
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {user && (
                    <>
                      <Textarea
                        value={ratingComment}
                        onChange={(event) =>
                          setRatingComment(event.target.value)
                        }
                        placeholder="Compartilhe sua experiência ou recomendação. Opcional."
                        maxLength={500}
                        disabled={!canRateProfile || submittingRating}
                        className="min-h-24 w-full bg-background flex"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-text-muted">
                          {ratingComment.length}/500 caracteres
                        </p>
                        <Button
                          type="button"
                          onClick={handleRate}
                          disabled={
                            !canRateProfile || submittingRating || !userRating
                          }
                          className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
                        >
                          {submittingRating
                            ? "Enviando..."
                            : "Enviar avaliação"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {targetProfile.isProvider && (
            <section className="bg-card border-y border-border-subtle">
              <div className="mx-auto container p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquareText size={18} className="text-primary" />
                  <h3 className="md:text-xl text-base font-semibold text-text-main">
                    Comentários da comunidade
                  </h3>
                </div>

                {loadingRatings ? (
                  <p className="text-sm text-text-muted">
                    Carregando comentários...
                  </p>
                ) : ratings.length === 0 ? (
                  <div className="border border-dashed border-border-subtle bg-surface p-4">
                    <p className="text-sm text-text-muted">
                      Ainda não há avaliações públicas sobre este profissional.
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      As novas avaliações mostram o nome de quem avaliou; o
                      comentário continua opcional.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ratings.map((rating) => (
                      <article
                        key={rating.id}
                        className="border border-border-subtle bg-surface p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-highlight">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  fill={
                                    rating.score >= star
                                      ? "currentColor"
                                      : "none"
                                  }
                                  className={
                                    rating.score >= star
                                      ? "text-highlight"
                                      : "text-border-subtle"
                                  }
                                />
                              ))}
                            </div>
                            <p className="text-xs font-medium text-text-muted">
                              {rating.authorName || "Membro Skillsy"}
                            </p>
                          </div>
                          <p className="text-xs text-text-muted">
                            {formatRatingDate(rating.createdAt)}
                          </p>
                        </div>
                        {rating.comment?.trim() ? (
                          <p className="text-sm leading-relaxed text-text-main whitespace-pre-wrap">
                            {rating.comment}
                          </p>
                        ) : (
                          <p className="text-sm text-text-muted">
                            Classificação sem comentário.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="w-full flex flex-col md:flex-row gap-2">
            <div className="bg-card w-full border-y border-border-subtle md:border-l border-l-0">
              <div className="h-full w-full p-4 mx-auto container md:pe-7">
                {hasContactInfo && (
                  <div className="space-y-4">
                    <h3 className="md:text-xl text-base font-semibold text-text-main">
                      Contato e redes
                    </h3>
                    <div className="space-y-3">
                      {targetProfile.whatsapp && (
                        <button
                          type="button"
                          onClick={handleWhatsApp}
                          className="flex w-full items-center gap-3 border border-border-subtle bg-surface px-3 py-3 text-left transition-colors hover:border-primary/30"
                        >
                          <FaWhatsapp size={16} className="text-success" />
                          <p className="text-sm font-medium text-text-main">
                            {targetProfile.whatsapp}
                          </p>
                        </button>
                      )}
                      {targetProfile.phone && (
                        <button
                          type="button"
                          onClick={handlePhoneCall}
                          className="flex w-full items-center gap-3 border border-border-subtle bg-surface px-3 py-3 text-left transition-colors hover:border-primary/30"
                        >
                          <FaPhone size={16} className="text-primary" />
                          <p className="text-sm font-medium text-text-main">
                            {targetProfile.phone}
                          </p>
                        </button>
                      )}
                      {targetProfile.instagram && (
                        <a
                          href={formatUrl(
                            `instagram.com/${targetProfile.instagram.replace(/^@/, "")}`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 border border-border-subtle bg-surface px-3 py-3 transition-colors hover:border-primary/30"
                        >
                          <FaInstagram size={16} className="text-pink-600" />
                          <span className="break-all text-sm font-medium text-text-main">
                            {targetProfile.instagram}
                          </span>
                        </a>
                      )}
                      {targetProfile.facebook && (
                        <a
                          href={formatUrl(targetProfile.facebook)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 border border-border-subtle bg-surface px-3 py-3 transition-colors hover:border-primary/30"
                        >
                          <FaFacebookF size={16} className="text-blue-600" />
                          <p className="break-all text-sm font-medium text-text-main">
                            {targetProfile.facebook}
                          </p>
                        </a>
                      )}
                      {targetProfile.linkedin && (
                        <a
                          href={formatUrl(targetProfile.linkedin)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 border border-border-subtle bg-surface px-3 py-3 transition-colors hover:border-primary/30"
                        >
                          <FaLinkedinIn size={16} className="text-sky-700" />
                          <p className="break-all text-sm font-medium text-text-main">
                            {targetProfile.linkedin}
                          </p>
                        </a>
                      )}
                      {targetProfile.website && (
                        <a
                          href={formatUrl(targetProfile.website)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 border border-border-subtle bg-surface px-3 py-3 transition-colors hover:border-primary/30"
                        >
                          <Globe size={16} className="text-primary" />
                          <p className="break-all text-sm font-medium text-text-main">
                            {targetProfile.website}
                          </p>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          {(targetProfile.gallery && targetProfile.gallery.length > 0) ||
          user?.uid === targetProfile.uid ? (
            <section className="bg-card border border-border-subtle relative overflow-hidden">
              <div className="mx-auto container p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="md:text-xl text-base font-semibold text-text-main">
                    Galeria de fotos
                  </h3>
                </div>

                {targetProfile.gallery && targetProfile.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {targetProfile.gallery.map((photo, index) => (
                      <Dialog key={index}>
                        <DialogTrigger
                          nativeButton
                          render={
                            <button
                              type="button"
                              className={`relative overflow-hidden aspect-square cursor-pointer hover:shadow-lg transition-all ${
                                index === 0
                                  ? "col-span-2 md:col-span-2 md:row-span-2"
                                  : ""
                              }`}
                            />
                          }
                        >
                          <Image
                            src={typeof photo === "string" ? photo : photo.url}
                            alt={
                              typeof photo === "object" && photo.description
                                ? photo.description
                                : `Galeria ${index + 1}`
                            }
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </DialogTrigger>
                        <DialogContent className="gap-0 overflow-hidden border-none bg-black/95 p-0">
                          <DialogTitle className="sr-only">
                            Visualização de foto
                          </DialogTitle>
                          <div className="relative flex h-[80vh] w-full items-center justify-center bg-black">
                            <Image
                              src={
                                typeof photo === "string" ? photo : photo.url
                              }
                              alt={
                                typeof photo === "object" && photo.description
                                  ? photo.description
                                  : `Galeria ${index + 1}`
                              }
                              fill
                              className="object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          {typeof photo === "object" && photo.description && (
                            <DialogFooter className="bg-card">
                              <h4 className="mb-2 text-xs font-bold text-primary">
                                Comentário
                              </h4>
                              <DialogDescription className="text-base leading-relaxed tracking-tight text-text-main">
                                {photo.description}
                              </DialogDescription>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle bg-surface/50">
                    <Camera className="w-12 h-12 text-text-muted/30 mb-4" />
                    <p className="text-sm text-text-muted font-medium mb-4">
                      Sua galeria ainda não possui fotos profissionais.
                    </p>
                    <Link href="/profile">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground font-bold h-9"
                      >
                        Adicionar fotos
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="flex justify-end items-center">
                  {user?.uid === targetProfile.uid && (
                    <div className="flex items-center gap-4">
                      {targetProfile.gallery &&
                        targetProfile.gallery.length > 0 && (
                          <span className="text-xs text-text-muted font-medium bg-surface px-2 py-0.5 border border-border-subtle">
                            {targetProfile.gallery.length}/5 fotos
                          </span>
                        )}
                      <Link
                        href="/profile"
                        className="text-xs font-bold text-primary-foreground flex justify-center items-center px-4 bg-primary hover:bg-primary/90 active:bg-primary/80 h-8"
                      >
                        Gerenciar galeria
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </motion.div>
      </main>

      {showStickyWhatsApp ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border-subtle bg-card/95 p-3 backdrop-blur sm:hidden">
          <Button
            onClick={handleWhatsApp}
            size="lg"
            className="h-12 flex-1 bg-success font-bold text-success-foreground hover:bg-success/90 active:bg-success/80"
          >
            <FaWhatsapp /> Falar no WhatsApp
          </Button>
        </div>
      ) : null}
    </>
  );
}
