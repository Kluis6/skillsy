"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurfacePanel } from "@/components/ui/page-layout";
import { ProfileToolbar } from "@/components/profile/profile-toolbar";
import { CompanyImageField } from "@/components/profile/company-image-field";
import { MembershipMark } from "@/components/ui/trust-signals";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  HandHeart,
  ListChecks,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Plus,
  Save,
  ShieldCheck,
  Store,
  Trash2,
  X,
} from "lucide-react";
import Link from "@/lib/i18n/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MAX_STORED_IMAGE_MB, uploadImage, uploadImageFile } from "@/lib/image-upload";
import { companyProfilePath } from "@/lib/company-profile";
import { storageImageUrl, USE_STORAGE_EMULATOR, type CompanyImageKind } from "@/lib/storage-images";
import { PROFILE_LIMITS, profileSchema, type ProfileFormData } from "@/lib/validations";
import {
  AVAILABILITY_OPTIONS,
  PROVIDER_CATEGORIES,
  clearProviderFields,
  getProfileFormDefaults,
  profileToFormValues,
  toProfileUpdatePayload,
  type MembershipType,
} from "@/lib/profile-form";

import { LocationService } from "@/services/location-service";
import { Footer } from "./footer";
import { useT, useValidationMessage } from "@/lib/i18n/provider";
import { rich } from "@/lib/i18n/rich";
import { useLabels } from "@/lib/i18n/labels";
import { ContentLanguageSelect } from "@/components/content-language-select";
import type { MessageKey } from "@skillsy/shared/i18n/keys";

const MAX_PROFILE_IMAGE_MB = 10;
const MAX_IMAGE_UPLOAD_SIZE_BYTES = MAX_PROFILE_IMAGE_MB * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_IMAGE_ACCEPT = PROFILE_IMAGE_TYPES.join(",");

type ProfileImageKind = "avatar" | "banner" | "gallery" | CompanyImageKind;
const COMPANY_IMAGE_FIELDS = {
  "company-logo": "companyLogoImageName",
  "company-banner": "companyBannerImageName",
} as const;
const COMPANY_IMAGE_KINDS = ["company-logo", "company-banner"] as const;

const CONTACT_AND_MEDIA_DEFAULTS = {
  whatsapp: "",
  phone: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  website: "",
  gallery: [],
} satisfies Partial<ProfileFormData>;

const CONTACT_AND_MEDIA_FIELDS = Object.keys(CONTACT_AND_MEDIA_DEFAULTS) as Array<
  keyof typeof CONTACT_AND_MEDIA_DEFAULTS
>;

const resolveProfile = zodResolver(profileSchema);
const resolveProfileSettings: Resolver<ProfileFormData> = (values, context, options) =>
  resolveProfile(
    values.isProvider
      ? values
      : { ...clearProviderFields(values), ...CONTACT_AND_MEDIA_DEFAULTS },
    context,
    options,
  );

function profileFieldId(field: keyof ProfileFormData) {
  return `profile-${field}`;
}

type OnboardingIntent = "find" | "offer" | "both";

// Onboarding choices live in localStorage; read them through
// useSyncExternalStore so the server render and hydration stay consistent.
const ONBOARDING_INTENT_KEY = "skillsy:onboarding-intent";
const ONBOARDING_DISMISSED_KEY = "skillsy:onboarding-dismissed";
const ONBOARDING_CHANGE_EVENT = "skillsy:onboarding-change";

function subscribeOnboarding(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(ONBOARDING_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ONBOARDING_CHANGE_EVENT, onChange);
  };
}

function readOnboardingSnapshot(uid: string | undefined) {
  if (!uid) return "|";

  const intent = window.localStorage.getItem(`${ONBOARDING_INTENT_KEY}:${uid}`) ?? "";
  const dismissed = window.localStorage.getItem(`${ONBOARDING_DISMISSED_KEY}:${uid}`) ?? "";
  return `${intent}|${dismissed}`;
}

function writeOnboarding(uid: string, key: string, value: string) {
  window.localStorage.setItem(`${key}:${uid}`, value);
  window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT));
}

const MEMBERSHIP_OPTIONS: Array<{
  value: Exclude<MembershipType, "">;
  label: MessageKey;
  description: MessageKey;
  icon: typeof ShieldCheck;
  iconClassName: string;
}> = [
  {
    value: "member",
    label: "settings.memberLabel",
    description: "settings.memberDescription",
    icon: ShieldCheck,
    iconClassName: "text-primary",
  },
  {
    value: "friend",
    label: "settings.friendLabel",
    description: "settings.friendDescription",
    icon: HandHeart,
    iconClassName: "text-success",
  },
];

const getCompressionErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
};

export function ProfileSettingsClient() {
  const {
    user,
    profile,
    updateProfile,
    cancelAccount,
    loading: authLoading,
    isFirstSignIn,
  } = useAuth();
  const t = useT();
  const tv = useValidationMessage();
  const labels = useLabels();
  const [loading, setLoading] = useState(false);
  const [cancelingAccount, setCancelingAccount] = useState(false);
  const [uploading, setUploading] = useState<ProfileImageKind | null>(null);
  const onboardingUid = isFirstSignIn ? user?.uid : undefined;
  const onboardingSnapshot = useSyncExternalStore(
    subscribeOnboarding,
    () => readOnboardingSnapshot(onboardingUid),
    () => "|",
  );
  const [savedIntent, dismissedFlag] = onboardingSnapshot.split("|");
  const onboardingIntent: OnboardingIntent | null =
    savedIntent === "find" || savedIntent === "offer" || savedIntent === "both"
      ? savedIntent
      : null;
  const onboardingDismissed = dismissedFlag === "true";

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const serviceSectionRef = useRef<HTMLElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors, touchedFields, isDirty },
  } = useForm<ProfileFormData>({
    resolver: resolveProfileSettings,
    mode: "onChange",
    defaultValues: getProfileFormDefaults(),
  });

  const formData = useWatch({ control }) as ProfileFormData;
  const fieldProps = (field: keyof ProfileFormData) => {
    const id = profileFieldId(field);
    return {
      id,
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `${id}-help ${id}-error` : `${id}-help`,
    };
  };
  const fieldFeedback = (field: keyof ProfileFormData, help: string) => {
    const id = profileFieldId(field);
    const error = errors[field]?.message;
    return (
      <>
        <FieldDescription id={`${id}-help`}>{help}</FieldDescription>
        {error && <FieldError id={`${id}-error`}>{tv(error)}</FieldError>}
      </>
    );
  };
  const imageHelp = t("settings.imagesRule", {
    size: MAX_PROFILE_IMAGE_MB,
    formats: t("settings.imageFormats"),
  });
  const galleryFull = formData.gallery.length >= PROFILE_LIMITS.galleryMaxItems;
  const serviceConfigured = formData.isProvider && Boolean(formData.companyName?.trim() && formData.category);
  const readinessItems = [
    {
      label: t("settings.readyName"),
      // New accounts start as "Membro Skillsy"; that default is not done.
      done: Boolean(
        formData.name?.trim() && formData.name.trim() !== "Membro Skillsy",
      ),
    },
    {
      label: t("settings.readyPhoto"),
      done: Boolean(formData.photoURL),
    },
    {
      label: t("settings.readyCity"),
      done: Boolean(formData.location?.trim()),
    },
    {
      label: t("settings.readyBio"),
      done: Boolean(formData.bio?.trim()),
    },
    // Only for members who advertise a service.
    ...(formData.isProvider
      ? [
          {
            label: t("settings.readyService"),
            done: serviceConfigured,
          },
          {
            label: t("settings.readyContact"),
            done: Boolean(formData.whatsapp?.trim() || formData.phone?.trim()),
          },
        ]
      : []),
  ];
  const readinessDoneCount = readinessItems.filter((item) => item.done).length;
  const readinessPercent = Math.round(
    (readinessDoneCount / readinessItems.length) * 100,
  );

  const onboardingItems = [
    {
      id: "location",
      label: t("settings.stepLocation"),
      description: t("settings.stepLocationText"),
      done: Boolean(formData.location?.trim()),
      action: t("settings.stepLocationAction"),
      icon: MapPin,
    },
    ...(onboardingIntent === "offer" ||
    onboardingIntent === "both" ||
    formData.isProvider
      ? [
          {
            id: "service",
            label: t("settings.stepService"),
            description: t("settings.stepServiceText"),
            done: serviceConfigured,
            action: t("settings.stepServiceAction"),
            icon: Store,
          },
        ]
      : []),
    ...(formData.isProvider
      ? [
          {
            id: "contact",
            label: t("settings.stepWhatsapp"),
            description: t("settings.stepWhatsappText"),
            done: Boolean(formData.whatsapp?.trim()),
            action: t("settings.stepWhatsappAction"),
            icon: MessageCircle,
          },
        ]
      : []),
  ];
  const onboardingDoneCount = onboardingItems.filter(
    (item) => item.done,
  ).length;
  const nextOnboardingItem = onboardingItems.find((item) => !item.done);
  const publicFieldsSummary = [
    t("settings.publicName"),
    t("settings.publicCity"),
    t("settings.publicBadge"),
    t("settings.publicService"),
    t("settings.publicContacts"),
  ];

  useEffect(() => {
    if (profile) {
      reset(profileToFormValues(profile));
    }
  }, [profile, reset]);

  useEffect(() => {
    if (authLoading || !profile?.uid || window.location.hash !== "#perfil-de-servico") return;

    const frame = requestAnimationFrame(() => serviceSectionRef.current?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [authLoading, profile?.uid]);

  useEffect(() => {
    if (!isDirty) return;
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  function confirmNavigation(event: { preventDefault: () => void }) {
    if (isDirty && !window.confirm(t("settings.unsavedChanges"))) event.preventDefault();
  }

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const data = await LocationService.getCurrentLocation();
      setValue("location", data.display, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success(t("settings.locationDetected"), { description: data.display });
    } catch (error: any) {
      toast.error(t("settings.geoError"), { description: tv(error.message) });
    } finally {
      setDetectingLocation(false);
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      const payload = toProfileUpdatePayload(data);
      if (data.isProvider) {
        for (const field of Object.values(COMPANY_IMAGE_FIELDS)) {
          if (data[field] !== (profile?.[field] ?? "")) {
            payload[field] = data[field] || undefined;
          }
        }
      } else {
        // Hidden draft values must not overwrite saved contacts or portfolio photos.
        for (const field of CONTACT_AND_MEDIA_FIELDS) {
          delete payload[field];
        }
      }
      await updateProfile(payload);
      toast.success(t("settings.saved"));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      let errorMessage = t("settings.saveError");

      try {
        const errorData = JSON.parse(error.message);
        if (
          errorData.error.includes("permission-denied") ||
          errorData.error.includes("Missing or insufficient permissions")
        ) {
          errorMessage = t("settings.permissionError");
        } else {
          errorMessage = t("settings.errorDetail", { message: errorData.error });
        }
      } catch (e) {
        if (error.message) errorMessage = tv(error.message);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const chooseOnboardingIntent = (intent: OnboardingIntent) => {
    if (onboardingUid) writeOnboarding(onboardingUid, ONBOARDING_INTENT_KEY, intent);
  };

  const dismissOnboarding = () => {
    if (onboardingUid) writeOnboarding(onboardingUid, ONBOARDING_DISMISSED_KEY, "true");
  };

  const focusOnboardingStep = (stepId: string) => {
    const target =
      stepId === "location"
        ? locationSectionRef.current
        : stepId === "service"
          ? serviceSectionRef.current
          : contactSectionRef.current;

    target?.scrollIntoView({ block: "start" });
    const serviceField = formData.isProvider ? "companyName" : "isProvider";
    const firstField =
      stepId === "service"
        ? document.getElementById(profileFieldId(serviceField))
        : target?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea, button");
    firstField?.focus({ preventScroll: true });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: ProfileImageKind,
  ) => {
    const file = e.target.files?.[0];
    if (!file || uploading !== null) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.invalidFile"), {
        description: t("settings.invalidFileText"),
      });
      e.target.value = "";
      return;
    }

    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("settings.unsupportedFormat"), {
        description: t("settings.unsupportedFormatText"),
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
      toast.error(t("settings.imageTooLarge"), {
        description: t("settings.imageTooLargeText", { size: MAX_PROFILE_IMAGE_MB }),
      });
      e.target.value = "";
      return;
    }

    setUploading(type);
    try {
      if (type === "company-logo" || type === "company-banner") {
        const uploaded = await uploadImageFile(file, type);
        setValue(COMPANY_IMAGE_FIELDS[type], uploaded.name, { shouldDirty: true });
        toast.success(t("settings.companyImageUploaded"));
        return;
      }
      if (type === "gallery" && getValues("gallery").length >= PROFILE_LIMITS.galleryMaxItems) {
        toast.error(t("settings.galleryLimit"), {
          description: t("settings.galleryLimitText"),
        });
        return;
      }
      const url = await uploadImage(file, type);
      if (type === "avatar") {
        setValue("photoURL", url, { shouldDirty: true });
        toast.success(t("settings.photoUploaded"));
      } else if (type === "banner") {
        setValue("bannerURL", url, { shouldDirty: true });
        toast.success(t("settings.bannerUploaded"));
      } else if (type === "gallery") {
        setValue(
          "gallery",
          [...getValues("gallery"), { url, description: "" }],
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
        toast.success(t("settings.galleryAdded"));
      }
    } catch (error) {
      toast.error(t("settings.imageUploadError"), {
        description: tv(getCompressionErrorMessage(error, t("settings.imageError"))),
      });
    } finally {
      setUploading(null);
      e.target.value = ""; // Reset input
    }
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
    const confirmed = window.confirm(t("settings.cancelConfirm"));

    if (!confirmed) {
      return;
    }

    setCancelingAccount(true);
    try {
      await cancelAccount();
      toast.success(t("settings.accountCanceled"));
    } catch (error: any) {
      toast.error(t("settings.cancelError"), {
        description: tv(error?.message) || t("settings.tryAgainSoon"),
      });
    } finally {
      setCancelingAccount(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <h1 className="text-3xl font-bold mb-4">{t("settings.restrictedTitle")}</h1>
        <p className="text-text-muted mb-8">
          {t("settings.restrictedText")}
        </p>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          className="bg-primary text-primary-foreground font-bold px-8"
        >
          {t("settings.backHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface w-full md:space-y-2">
      <ProfileToolbar backHref="/" backLabel={t("settings.back")} onBackNavigate={confirmNavigation}>
        <Button
          type="submit"
          form="profile-settings-form"
          disabled={loading || uploading !== null || !isDirty}
          className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors px-6 font-bold h-10"
        >
          {loading ? (
            t("settings.saving")
          ) : (
            <>
              <Save size={16} className="mr-2" /> {t("settings.save")}
            </>
          )}
        </Button>
      </ProfileToolbar>

      <main className="md:container md:mx-auto md:px-4 mb-6">
        <form id="profile-settings-form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
          {onboardingUid && !onboardingDismissed &&
            (onboardingIntent === null || nextOnboardingItem) && (
              <SurfacePanel className="mb-3 space-y-4 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-text-main">
                      {t("settings.startTitle")}
                    </p>
                    <p className="text-sm text-text-muted">
                      {t("settings.startText")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={dismissOnboarding}
                    aria-label={t("settings.dismissOnboarding")}
                    className="shrink-0 text-text-muted"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                {onboardingIntent === null ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-main">
                      {t("settings.firstQuestion")}
                    </p>
                    {/* Grid cells bound the width; Button is shrink-0, so in a
                        flex row the third option overflowed on tablets. */}
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => chooseOnboardingIntent("find")}
                        className="h-auto w-full min-w-0 justify-start whitespace-normal px-4 py-3 text-left"
                      >
                        <span>
                          <span className="block font-semibold">
                            {t("settings.intentFind")}
                          </span>
                          <span className="mt-1 block text-xs font-normal text-text-muted">
                            {t("settings.intentFindText")}
                          </span>
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => chooseOnboardingIntent("offer")}
                        className="h-auto w-full min-w-0 justify-start whitespace-normal px-4 py-3 text-left"
                      >
                        <span>
                          <span className="block font-semibold">
                            {t("settings.intentOffer")}
                          </span>
                          <span className="mt-1 block text-xs font-normal text-text-muted">
                            {t("settings.intentOfferText")}
                          </span>
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => chooseOnboardingIntent("both")}
                        className="h-auto w-full min-w-0 justify-start whitespace-normal px-4 py-3 text-left"
                      >
                        <span>
                          <span className="block font-semibold">{t("settings.intentBoth")}</span>
                          <span className="mt-1 block text-xs font-normal text-text-muted">
                            {t("settings.intentBothText")}
                          </span>
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-text-main">
                        {t("settings.stepsDone", {
                          done: onboardingDoneCount,
                          total: onboardingItems.length,
                        })}
                      </span>
                      <span className="text-text-muted">
                        {t("settings.takesMinutes")}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden bg-surface"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-primary transition-[width] duration-200"
                        style={{
                          width: `${(onboardingDoneCount / onboardingItems.length) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="divide-y divide-border-subtle border border-border-subtle">
                      {onboardingItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3"
                          >
                            <Icon
                              className={`size-4 shrink-0 ${item.done ? "text-success" : "text-primary"}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-text-main">
                                {item.label}
                              </p>
                              <p className="text-xs text-text-muted">
                                {item.description}
                              </p>
                            </div>
                            {item.done ? (
                              <CheckCircle2
                                className="size-5 shrink-0 text-success"
                                aria-label={t("settings.done")}
                              />
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => focusOnboardingStep(item.id)}
                                className="shrink-0"
                              >
                                {item.action}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SurfacePanel>
            )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Left Column: Avatar & Basic Info */}
            {/* Sticks exactly where it sits in the flow (57px header + 0.5rem
                gap), so its top stays level with the right column. */}
            <div className="space-y-2 lg:sticky lg:top-[calc(57px+0.5rem)] lg:self-start">
              <div className="md:border border-b bg-card overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-primary/10 to-accent/10">
                  {formData.bannerURL && (
                    <Image
                      src={formData.bannerURL!}
                      alt={t("settings.coverAlt")}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      unoptimized={USE_STORAGE_EMULATOR}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <Button
                    type="button"
                    size="icon-lg"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploading !== null}
                    className="absolute top-4 right-4 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:bg-primary/80"
                    title={t("settings.changeCover")}
                    aria-label={t("settings.changeCoverAria")}
                    aria-describedby="profile-banner-help"
                    aria-busy={uploading === "banner"}
                  >
                    {uploading === "banner" ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Camera size={18} />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept={PROFILE_IMAGE_ACCEPT}
                    onChange={(e) => handleFileChange(e, "banner")}
                  />
                </div>
                <div className="pt-10 pb-4 px-4 flex flex-col items-center -mt-16">
                  <div className="relative group mb-6">
                    <Avatar className="w-32 h-32 border-4 border-surface shadow-sm">
                      <AvatarImage src={formData.photoURL || undefined} alt="" />
                      <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                        {formData.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon-lg"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading !== null}
                      aria-label={t("settings.changePhoto")}
                      aria-describedby="profile-avatar-help"
                      aria-busy={uploading === "avatar"}
                      className="absolute bottom-0 right-0 shadow-sm hover:scale-105"
                    >
                      {uploading === "avatar" ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Camera size={18} />
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept={PROFILE_IMAGE_ACCEPT}
                      onChange={(e) => handleFileChange(e, "avatar")}
                    />
                  </div>
                  <h2 className="flex items-center gap-1.5 text-xl font-bold text-text-main mb-1">
                    {formData.name || t("settings.yourName")}
                    <MembershipMark
                      size={18}
                      profile={
                        formData.membershipType === "member"
                          ? { ward: formData.ward, baptismYear: formData.baptismYear }
                          : { communityFriend: formData.membershipType === "friend" }
                      }
                    />
                  </h2>
                  <p className="mb-4 break-all text-sm text-text-muted">{user.email}</p>
                  <dl className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-2 border-t border-border-subtle pt-3 text-xs">
                    <dt className="font-semibold text-text-main">{t("settings.avatarLabel")}</dt>
                    <dd id="profile-avatar-help" className="text-text-muted">{imageHelp}</dd>
                    <dt className="font-semibold text-text-main">{t("settings.coverAlt")}</dt>
                    <dd id="profile-banner-help" className="text-text-muted">{imageHelp}</dd>
                  </dl>
                </div>
              </div>
              <SurfacePanel className="space-y-4 p-4 md:p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-main flex items-center gap-2">
                      <ListChecks className="size-4 text-primary" />
                      {t("settings.readiness")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t("settings.readinessText")}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/10">
                    {readinessPercent}%
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden bg-surface">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${readinessPercent}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {readinessItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-text-muted">{item.label}</span>
                      {item.done ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <AlertCircle className="size-4 text-warning" />
                      )}
                    </div>
                  ))}
                </div>
              </SurfacePanel>
              <SurfacePanel className="space-y-3 p-4 md:p-4">
                <p className="text-sm font-bold text-text-main flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  {t("settings.whatIsPublic")}
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  {publicFieldsSummary.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </SurfacePanel>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="lg:col-span-2 space-y-2">
              <div className="bg-card md:p-8 p-4 md:border border-y space-y-6">
                <div className="space-y-1">
                  <h3 className="md:text-xl text-base font-semibold text-text-main">
                    {t("settings.identity")}
                  </h3>
                  <p className="text-xs font-normal text-text-muted">
                    {t("settings.identityText")}
                  </p>
                </div>
                <section className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={profileFieldId("name")} className="text-xs md:text-sm font-medium text-text-muted flex items-center gap-1">
                        {t("settings.fullName")} <span className="text-destructive" aria-hidden="true">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          {...fieldProps("name")}
                          {...register("name")}
                          required
                          minLength={PROFILE_LIMITS.nameMin}
                          autoComplete="name"
                          maxLength={PROFILE_LIMITS.name}
                          className={`bg-surface focus:bg-card text-sm h-12 transition-all ${
                            errors.name
                              ? "border-destructive/60 focus:border-destructive ring-0"
                              : touchedFields.name && !errors.name
                                ? "border-success/60 focus:border-success ring-0"
                                : "border focus:border-primary/20 ring-0"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {errors.name ? (
                            <AlertCircle size={16} className="text-destructive" />
                          ) : touchedFields.name && !errors.name ? (
                            <CheckCircle2
                              size={16}
                              className="text-success"
                            />
                          ) : null}
                        </div>
                      </div>
                      {fieldFeedback("name", t("settings.nameHint", { min: PROFILE_LIMITS.nameMin, max: PROFILE_LIMITS.name }))}
                    </div>
                    <div ref={locationSectionRef} className="space-y-2">
                      <Label htmlFor={profileFieldId("location")} className="text-xs md:text-sm font-medium text-text-muted flex items-center gap-1">
                        {t("settings.location")}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          {...fieldProps("location")}
                          {...register("location")}
                          autoComplete="address-level2"
                          placeholder={t("settings.locationPlaceholder")}
                          maxLength={PROFILE_LIMITS.location}
                          className={`bg-surface focus:bg-card transition-all text-sm h-12 flex-grow ${errors.location ? "ring-2 ring-destructive" : ""}`}
                        />
                        <Button
                          type="button"
                          size="icon"
                          onClick={handleDetectLocation}
                          disabled={detectingLocation}
                          aria-label={t("settings.detectLocation")}
                          className="size-12 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50"
                          title={t("settings.detectLocation")}
                        >
                          {detectingLocation ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Navigation size={16} />
                          )}
                        </Button>
                      </div>
                      {fieldFeedback("location", t("settings.locationHint", { max: PROFILE_LIMITS.location }))}
                    </div>
                    <div className="md:col-span-2 space-y-4 border border-border-subtle p-4">
                      <div className="space-y-1">
                        <p
                          id="membership-heading"
                          className="text-xs md:text-sm font-medium text-text-main"
                        >
                          {t("settings.membership")}
                        </p>
                        <p className="text-xs text-text-muted">
                          {t("settings.membershipText")}
                        </p>
                      </div>

                      <RadioGroup
                        aria-labelledby="membership-heading"
                        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        value={formData.membershipType || null}
                        onValueChange={(value) =>
                          setValue(
                            "membershipType",
                            value as ProfileFormData["membershipType"],
                            { shouldDirty: true },
                          )
                        }
                      >
                        {MEMBERSHIP_OPTIONS.map((option) => (
                          <Label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-3 border border-border-subtle p-3 text-left leading-normal transition-colors hover:border-primary/40 has-data-checked:border-primary has-data-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-primary"
                          >
                            <RadioGroupItem
                              value={option.value}
                              className="mt-0.5"
                            />
                            <option.icon
                              size={18}
                              className={`mt-0.5 shrink-0 ${option.iconClassName}`}
                              aria-hidden="true"
                            />
                            <span className="space-y-0.5">
                              <span className="block text-sm font-semibold text-text-main">
                                {t(option.label)}
                              </span>
                              <span className="block text-xs text-text-muted">
                                {t(option.description)}
                              </span>
                            </span>
                          </Label>
                        ))}
                      </RadioGroup>

                      {formData.membershipType === "member" && (
                        <div className="space-y-4">
                          <p className="bg-primary/5 px-3 py-2 text-xs text-text-main">
                            {rich(t("settings.memberOnly"), {
                              only: <strong>{t("settings.memberOnlyStrong")}</strong>,
                            })}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor={profileFieldId("ward")}
                                className="text-xs md:text-sm font-medium text-text-muted"
                              >
                                {t("settings.ward")}
                              </Label>
                              <Input
                                {...fieldProps("ward")}
                                {...register("ward")}
                                autoComplete="off"
                                placeholder={t("settings.wardPlaceholder")}
                                maxLength={PROFILE_LIMITS.ward}
                                className={`bg-surface focus:bg-card transition-all text-sm h-12 ${errors.ward ? "ring-2 ring-destructive" : ""}`}
                              />
                              {fieldFeedback("ward", t("settings.upTo", { max: PROFILE_LIMITS.ward }))}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={profileFieldId("baptismYear")}
                                className="text-xs md:text-sm font-medium text-text-muted"
                              >
                                {t("settings.baptismYear")}
                              </Label>
                              <Input
                                {...fieldProps("baptismYear")}
                                {...register("baptismYear")}
                                autoComplete="off"
                                placeholder={t("settings.baptismPlaceholder")}
                                inputMode="numeric"
                                maxLength={PROFILE_LIMITS.baptismYearDigits}
                                className={`bg-surface focus:bg-card transition-all text-sm h-12 ${errors.baptismYear ? "ring-2 ring-destructive" : ""}`}
                              />
                              {fieldFeedback("baptismYear", t("settings.baptismYearHint", {
                                digits: PROFILE_LIMITS.baptismYearDigits,
                                min: String(PROFILE_LIMITS.baptismYearMin),
                                max: String(new Date().getFullYear()),
                              }))}
                            </div>
                          </div>
                          {/* LGPD art. 11: specific consent for religious data
                              (Termos de Uso, "Dados de filiação religiosa"). */}
                          <p className="text-xs leading-relaxed text-text-muted">
                            {rich(t("settings.religiousConsent"), {
                              terms: (
                                <Link
                                  href="/termos#dados-de-filiacao-religiosa"
                                  className="font-semibold text-primary hover:underline"
                                >
                                  {t("settings.termsLink")}
                                </Link>
                              ),
                            })}
                          </p>
                        </div>
                      )}

                      {formData.membershipType === "friend" && (
                        <p className="bg-success/10 px-3 py-2 text-xs text-text-main">
                          {rich(t("settings.friendNotice"), {
                            badge: <strong>{t("settings.friendLabel")}</strong>,
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={profileFieldId("bio")} className="text-xs md:text-sm font-medium text-text-muted">
                        {t("settings.bio")}
                      </Label>
                      <span
                        className={`text-xs font-semibold ${formData.bio && formData.bio.length > PROFILE_LIMITS.bio ? "text-destructive" : "text-text-muted"}`}
                      >
                        {formData.bio?.length || 0} / {PROFILE_LIMITS.bio}
                      </span>
                    </div>
                    <Textarea
                      {...fieldProps("bio")}
                      {...register("bio")}
                      autoComplete="off"
                      placeholder={t("settings.bioPlaceholder")}
                      className={`bg-surface focus:bg-card transition-all text-sm min-h-[150px] p-4 focus:ring-2 focus:ring-primary/20 ${errors.bio ? "ring-2 ring-destructive" : ""}`}
                      maxLength={PROFILE_LIMITS.bio}
                    />
                    {fieldFeedback("bio", t("settings.upTo", { max: PROFILE_LIMITS.bio }))}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-language"
                      className="text-xs md:text-sm font-medium text-text-muted"
                    >
                      {t("settings.language")}
                    </Label>
                    <ContentLanguageSelect
                      id="profile-language"
                      value={formData.language || "pt"}
                      onChange={(language) =>
                        setValue("language", language, { shouldDirty: true })
                      }
                    />
                    <p className="text-xs text-text-muted ml-1">
                      {t("settings.languageHint")}
                    </p>
                  </div>
                </section>
              </div>
              <section
                id="perfil-de-servico"
                ref={serviceSectionRef}
                aria-label={t("settings.serviceProfile")}
                className="scroll-mt-20 border-y bg-card p-4 md:border md:p-8"
              >
                <Field
                  orientation="horizontal"
                  className="gap-3 border border-primary/30 bg-primary/5 p-4 transition-colors has-data-checked:border-primary/50 md:gap-5 md:px-5"
                >
                  <Label
                    htmlFor={profileFieldId("isProvider")}
                    className="min-w-0 flex-1 cursor-pointer gap-3 md:gap-4"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary md:size-11">
                      <Store className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 space-y-1">
                      <span
                        id="profile-advertise-label"
                        className="block text-base font-semibold leading-snug text-text-main md:text-lg"
                      >
                        {t("settings.wantToAdvertise")}
                      </span>
                      <span
                        id="profile-advertise-help"
                        className="block text-sm font-normal leading-snug text-text-muted"
                      >
                        {t("settings.wantToAdvertiseText")}
                      </span>
                    </span>
                  </Label>
                  <Switch
                    id={profileFieldId("isProvider")}
                    render={<button type="button" />}
                    nativeButton
                    checked={formData.isProvider}
                    aria-labelledby="profile-advertise-label"
                    aria-describedby="profile-advertise-help"
                    aria-controls={formData.isProvider ? "profile-service-fields" : undefined}
                    onCheckedChange={(checked) =>
                      setValue("isProvider", checked, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </Field>

                {formData.isProvider && (
                  <div id="profile-service-fields" className="mt-6 space-y-6">
                    {profile?.isProvider && (
                      <div className="flex flex-wrap gap-2">
                        <Link href="/profile/produtos" onNavigate={confirmNavigation} className={buttonVariants({ variant: "default" })}>
                          {t("products.manageButton")}
                        </Link>
                        {profile.companyName?.trim() && (
                          <Link href={companyProfilePath(user.uid)} onNavigate={confirmNavigation} className={buttonVariants({ variant: "outline" })}>
                            {t("products.viewCompany")}
                          </Link>
                        )}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={profileFieldId("companyName")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.company")}
                          <span className="text-destructive" aria-hidden="true">*</span>
                        </Label>
                        <Input
                          {...fieldProps("companyName")}
                          {...register("companyName")}
                          required
                          autoComplete="organization"
                          placeholder={t("settings.companyPlaceholder")}
                          maxLength={PROFILE_LIMITS.companyName}
                          className={`bg-surface focus:bg-card transition-all text-sm h-12 ${errors.companyName ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("companyName", t("settings.upTo", { max: PROFILE_LIMITS.companyName }))}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={profileFieldId("category")}
                          className="text-xs md:text-sm font-medium text-text-muted"
                        >
                          {t("settings.category")}
                          <span className="text-destructive" aria-hidden="true">*</span>
                        </Label>
                        <Controller
                          control={control}
                          name="category"
                          render={({ field }) => (
                            <Select
                              name={field.name}
                              value={field.value || null}
                              onValueChange={(value) =>
                                field.onChange(value ?? "")
                              }
                            >
                              <SelectTrigger
                                {...fieldProps("category")}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                aria-required="true"
                                className="h-12 w-full bg-surface px-4 text-sm"
                              >
                                <SelectValue placeholder={t("settings.selectCategory")} />
                              </SelectTrigger>
                              <SelectContent>
                                {PROVIDER_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {labels.category(category)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {fieldFeedback("category", t("settings.categoryHint"))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={profileFieldId("serviceType")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.specialty")}
                          <span className="text-xs text-text-main">{t("settings.optional")}</span>
                        </Label>
                        <Input
                          {...fieldProps("serviceType")}
                          {...register("serviceType")}
                          minLength={PROFILE_LIMITS.serviceTypeMin}
                          autoComplete="off"
                          placeholder={t("settings.specialtyPlaceholder")}
                          maxLength={PROFILE_LIMITS.serviceType}
                          className={`bg-surface focus:bg-card text-sm transition-all h-12 ${errors.serviceType ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("serviceType", t("settings.specialtyLengthHint", { min: PROFILE_LIMITS.serviceTypeMin, max: PROFILE_LIMITS.serviceType }))}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={profileFieldId("companyBio")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.companyBio")}
                          <span className="text-xs text-text-main">{t("settings.optional")}</span>
                        </Label>
                        <Textarea
                          {...fieldProps("companyBio")}
                          {...register("companyBio")}
                          maxLength={PROFILE_LIMITS.companyBio}
                          className="min-h-24 bg-surface text-sm focus:bg-card"
                        />
                        {fieldFeedback("companyBio", t("settings.companyBioHelp", { max: PROFILE_LIMITS.companyBio }))}
                      </div>

                      <section aria-labelledby="profile-company-images" className="space-y-3">
                        <div className="space-y-1">
                          <h3 id="profile-company-images" className="text-sm font-semibold text-text-main">
                            {t("settings.companyImages")}
                          </h3>
                          <FieldDescription>{t("settings.companyImagesFallback")}</FieldDescription>
                          <FieldDescription id="profile-company-images-help">{imageHelp}</FieldDescription>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-2">
                          {COMPANY_IMAGE_KINDS.map((kind) => {
                            const field = COMPANY_IMAGE_FIELDS[kind];
                            const imageName = formData[field];
                            const isLogo = kind === "company-logo";
                            const personalImage = isLogo ? formData.photoURL : formData.bannerURL;
                            return (
                              <CompanyImageField
                                key={kind}
                                kind={kind}
                                label={t(isLogo ? "settings.companyLogo" : "settings.companyCover")}
                                src={imageName ? storageImageUrl(user.uid, kind, imageName) : personalImage}
                                hasCompanyImage={Boolean(imageName)}
                                uploading={uploading === kind}
                                disabled={loading || uploading !== null}
                                accept={PROFILE_IMAGE_ACCEPT}
                                onFileChange={(event) => handleFileChange(event, kind)}
                                onRemove={() => setValue(field, "", { shouldDirty: true })}
                              />
                            );
                          })}
                        </div>
                      </section>

                      <div className="space-y-4 pt-2">
                        <p id="profile-availability-label" className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.availability")}
                        </p>
                        <div role="group" aria-labelledby="profile-availability-label" className="flex flex-wrap gap-2">
                          {AVAILABILITY_OPTIONS.map((day) => {
                            const isSelected =
                              formData.availability?.includes(day);
                            return (
                              <Button
                                key={day}
                                type="button"
                                aria-pressed={isSelected}
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
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
                                    : "bg-primary/10 text-primary hover:bg-primary/15"
                                }`}
                              >
                                {labels.day(day)}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label htmlFor={profileFieldId("serviceHours")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.serviceHours")}
                        </Label>
                        <Input
                          {...fieldProps("serviceHours")}
                          {...register("serviceHours")}
                          autoComplete="off"
                          placeholder={t("settings.hoursPlaceholder")}
                          maxLength={PROFILE_LIMITS.serviceHours}
                          className={`bg-surface focus:bg-card transition-all text-sm h-12 ${errors.serviceHours ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("serviceHours", t("settings.hoursHint", { max: PROFILE_LIMITS.serviceHours }))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-x-3 gap-y-5 md:gap-6">
                      <div className="col-span-3">
                        <h4 className="text-sm font-bold text-text-main">
                          {t("settings.businessAddress")}{" "}
                          <span className="text-text-muted text-xs font-medium">
                            {t("settings.optional")}
                          </span>
                        </h4>
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-2">
                        <Label htmlFor={profileFieldId("businessAddress")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.street")}
                        </Label>
                        <Input
                          {...fieldProps("businessAddress")}
                          {...register("businessAddress")}
                          autoComplete="address-line1"
                          placeholder={t("settings.streetPlaceholder")}
                          maxLength={PROFILE_LIMITS.address}
                          className={`bg-surface focus:bg-card transition-all h-12 ${errors.businessAddress ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("businessAddress", t("settings.upTo", { max: PROFILE_LIMITS.address }))}
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor={profileFieldId("businessAddressNumber")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.number")}
                        </Label>
                        <Input
                          {...fieldProps("businessAddressNumber")}
                          {...register("businessAddressNumber")}
                          autoComplete="off"
                          placeholder={t("settings.numberPlaceholder")}
                          maxLength={PROFILE_LIMITS.addressNumber}
                          className={`bg-surface focus:bg-card transition-all h-12 ${errors.businessAddressNumber ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("businessAddressNumber", t("settings.upTo", { max: PROFILE_LIMITS.addressNumber }))}
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor={profileFieldId("businessNeighborhood")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.neighborhood")}
                        </Label>
                        <Input
                          {...fieldProps("businessNeighborhood")}
                          {...register("businessNeighborhood")}
                          autoComplete="address-level3"
                          placeholder={t("settings.neighborhoodPlaceholder")}
                          maxLength={PROFILE_LIMITS.neighborhood}
                          className={`bg-surface focus:bg-card transition-all h-12 ${errors.businessNeighborhood ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("businessNeighborhood", t("settings.upTo", { max: PROFILE_LIMITS.neighborhood }))}
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor={profileFieldId("businessState")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.state")}
                        </Label>
                        <Input
                          {...fieldProps("businessState")}
                          {...register("businessState")}
                          autoComplete="address-level1"
                          placeholder={t("settings.statePlaceholder")}
                          maxLength={PROFILE_LIMITS.state}
                          className={`focus:bg-card bg-surface text-sm h-12 ${errors.businessState ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("businessState", t("settings.upTo", { max: PROFILE_LIMITS.state }))}
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor={profileFieldId("businessComplement")} className="text-xs md:text-sm font-medium text-text-muted">
                          {t("settings.complement")}
                        </Label>
                        <Input
                          {...fieldProps("businessComplement")}
                          {...register("businessComplement")}
                          autoComplete="address-line2"
                          placeholder={t("settings.complementPlaceholder")}
                          maxLength={PROFILE_LIMITS.complement}
                          className={`focus:bg-card bg-surface text-sm h-12 ${errors.businessComplement ? "ring-2 ring-destructive" : ""}`}
                        />
                        {fieldFeedback("businessComplement", t("settings.upTo", { max: PROFILE_LIMITS.complement }))}
                      </div>
                    </div>

                    <Separator />
                    <section
                      ref={contactSectionRef}
                      aria-labelledby="profile-service-contacts"
                      className="scroll-mt-20 space-y-4"
                    >
                      <div className="space-y-1">
                        <h3 id="profile-service-contacts" className="text-base font-semibold text-text-main md:text-lg">
                          {t("settings.publicContactsTitle")}
                        </h3>
                        <p className="text-xs font-normal text-text-muted">
                          {t("settings.publicContactsText")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <Label htmlFor={profileFieldId("whatsapp")} className="text-xs md:text-sm font-medium text-text-muted">
                            WhatsApp
                          </Label>
                          <Input
                            {...fieldProps("whatsapp")}
                            {...register("whatsapp")}
                            type="tel"
                            autoComplete="tel"
                            placeholder={t("settings.whatsappPlaceholder")}
                            inputMode="numeric"
                            maxLength={PROFILE_LIMITS.whatsappDigitsMax}
                            className={`bg-surface text-sm h-12 ${errors.whatsapp ? "ring-2 ring-destructive" : ""}`}
                          />
                          {fieldFeedback("whatsapp", t("settings.whatsappHint", { min: PROFILE_LIMITS.whatsappDigitsMin, max: PROFILE_LIMITS.whatsappDigitsMax }))}
                        </div>
                        <div className="space-y-2 md:col-span-1 col-span-2">
                          <Label htmlFor={profileFieldId("phone")} className="text-xs md:text-sm font-medium text-text-muted">
                            {t("settings.phone")}
                            <span className="text-text-main text-xs font-normal">
                              {t("settings.optional")}
                            </span>
                          </Label>
                          <Input
                            {...fieldProps("phone")}
                            {...register("phone")}
                            type="tel"
                            autoComplete="tel"
                            placeholder={t("settings.phonePlaceholder")}
                            inputMode="numeric"
                            maxLength={PROFILE_LIMITS.phoneDigitsMax}
                            className={`bg-surface text-sm h-12 ${errors.phone ? "ring-2 ring-destructive" : ""}`}
                          />
                          {fieldFeedback("phone", t("settings.phoneHint", { max: PROFILE_LIMITS.phoneDigitsMax }))}
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor={profileFieldId("instagram")} className="text-xs md:text-sm font-medium text-text-muted">
                            Instagram
                          </Label>
                          <Input
                            {...fieldProps("instagram")}
                            {...register("instagram")}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder={t("settings.instagramPlaceholder")}
                            maxLength={PROFILE_LIMITS.socialHandle}
                            className={`bg-surface text-sm h-12 ${errors.instagram ? "ring-2 ring-destructive" : ""}`}
                          />
                          {fieldFeedback("instagram", t("settings.instagramHint", { max: PROFILE_LIMITS.socialHandle }))}
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor={profileFieldId("facebook")} className="text-xs md:text-sm font-medium text-text-muted">
                            Facebook
                          </Label>
                          <Input
                            {...fieldProps("facebook")}
                            {...register("facebook")}
                            type="url"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder={t("settings.profileLink")}
                            maxLength={PROFILE_LIMITS.socialUrl}
                            className={`bg-surface text-sm h-12 ${errors.facebook ? "ring-2 ring-destructive" : ""}`}
                          />
                          {fieldFeedback("facebook", t("settings.upTo", { max: PROFILE_LIMITS.socialUrl }))}
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor={profileFieldId("linkedin")} className="text-xs md:text-sm font-medium text-text-muted">
                            LinkedIn
                          </Label>
                          <Input
                            {...fieldProps("linkedin")}
                            {...register("linkedin")}
                            type="url"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder={t("settings.profileLink")}
                            maxLength={PROFILE_LIMITS.socialUrl}
                            className={`bg-surface text-sm h-12 ${errors.linkedin ? "ring-2 ring-destructive" : ""}`}
                          />
                          {fieldFeedback("linkedin", t("settings.upTo", { max: PROFILE_LIMITS.socialUrl }))}
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor={profileFieldId("website")} className="text-xs md:text-sm font-medium text-text-muted">
                            {t("settings.website")}
                          </Label>
                          <Input
                            {...fieldProps("website")}
                            {...register("website")}
                            type="url"
                            autoComplete="url"
                            spellCheck={false}
                            placeholder={t("settings.websitePlaceholder")}
                            maxLength={PROFILE_LIMITS.website}
                            className={`bg-surface h-12 text-sm  ${errors.website ? "ring-2 ring-destructive" : ""}`}
                          />
                          {fieldFeedback("website", t("settings.websiteHint", { max: PROFILE_LIMITS.website }))}
                        </div>
                      </div>
                    </section>

                    <Separator />
                    <section aria-labelledby="profile-service-media" className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h3 id="profile-service-media" className="text-base font-semibold text-text-main md:text-lg">
                            {t("settings.media")}
                          </h3>
                          <Badge
                            className={`text-xs font-bold px-2 py-0.5 ${formData.gallery.length >= PROFILE_LIMITS.galleryMaxItems ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/5 text-primary border-primary/10"}`}
                          >
                            {formData.gallery.length}/{PROFILE_LIMITS.galleryMaxItems}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={uploading !== null || galleryFull}
                          aria-describedby="profile-gallery-help"
                          aria-busy={uploading === "gallery"}
                          className="h-10 px-4 font-bold"
                        >
                          {uploading === "gallery" ? (
                            <Loader2 size={16} className="mr-2 animate-spin" />
                          ) : (
                            <Plus size={16} className="mr-2 text-white" />
                          )}{" "}
                          {t("settings.addPhoto")}
                        </Button>
                        <input
                          type="file"
                          ref={galleryInputRef}
                          className="hidden"
                          accept={PROFILE_IMAGE_ACCEPT}
                          onChange={(e) => handleFileChange(e, "gallery")}
                        />
                      </div>
                      <div id="profile-gallery-help" className="border border-primary/20 bg-primary/5 p-4 text-xs text-text-muted space-y-1">
                        <p className="font-semibold text-text-main">
                          {t("settings.galleryRules")}
                        </p>
                        <p>
                          {t("settings.galleryRuleCount", {
                            max: PROFILE_LIMITS.galleryMaxItems,
                            formats: t("settings.imageFormats"),
                            size: MAX_PROFILE_IMAGE_MB,
                          })}
                        </p>
                        <p>{t("settings.imageStoredLimit", { size: MAX_STORED_IMAGE_MB })}</p>
                        <p>
                          {t("settings.galleryRuleDescription", {
                            max: PROFILE_LIMITS.galleryDescription,
                          })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {formData.gallery.map((photo, index) => {
                          const id = `profile-gallery-description-${index + 1}`;
                          const error = errors.gallery?.[index]?.description?.message;
                          return (
                            <div key={index} className="flex flex-col gap-2">
                              <div className="relative aspect-square overflow-hidden border border-border-subtle">
                                <Image
                                  src={photo.url}
                                  alt={t("settings.galleryAlt", { n: index + 1 })}
                                  fill
                                  sizes="(min-width: 1024px) 20vw, 50vw"
                                  unoptimized={USE_STORAGE_EMULATOR}
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  aria-label={t("settings.removePhoto", { n: index + 1 })}
                                  className="absolute right-2 top-2 text-destructive"
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                </Button>
                              </div>
                              <Label htmlFor={id} className="text-xs text-text-muted">
                                {t("settings.galleryDescriptionLabel", { n: index + 1 })}
                              </Label>
                              <Textarea
                                id={id}
                                name={`gallery.${index}.description`}
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? `${id}-help ${id}-error` : `${id}-help`}
                                placeholder={t("settings.commentPlaceholder")}
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
                                className="text-xs min-h-[50px] h-auto p-2 bg-surface border border-border-subtle resize-none"
                              />
                              <FieldDescription id={`${id}-help`} className="tabular-nums">
                                {t("settings.charactersUsed", { count: (photo.description || "").length, max: PROFILE_LIMITS.galleryDescription })}
                              </FieldDescription>
                              {error && <FieldError id={`${id}-error`}>{tv(error)}</FieldError>}
                            </div>
                          );
                        })}
                        {formData.gallery.length === 0 && (
                          <div className="col-span-full py-12 text-center bg-surface border-2 border-dashed border-border-subtle">
                            <Camera className="mx-auto h-10 w-10 text-text-muted/20 mb-3" />
                            <p className="text-sm text-text-muted font-medium">
                              {t("settings.galleryEmpty")}
                            </p>
                          </div>
                        )}
                      </div>

                    </section>
                  </div>
                )}
              </section>

              <div className="bg-card md:border border-y md:p-8 p-4 space-y-6">
                <div className="flex flex-col gap-4 border border-destructive/30 bg-destructive/5 p-4 md:p-5">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">
                      {t("settings.cancelTitle")}
                    </p>
                    <p className="text-xs text-destructive">
                      {t("settings.cancelText")}
                    </p>
                  </div>

                  <div className="flex justify-start">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleCancelAccount}
                      disabled={cancelingAccount || loading}
                      className="h-10 px-4"
                    >
                      {cancelingAccount ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          {t("settings.canceling")}
                        </>
                      ) : (
                        t("settings.cancelAccount")
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
