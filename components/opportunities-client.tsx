"use client";

import {
  opportunityWhatsappUrl,
  sortOpportunities,
} from "@skillsy/shared/opportunities";
import { OPPORTUNITY_DAYS, OPPORTUNITY_REMINDER_DAYS } from "@skillsy/shared/terms";
import { formatDate } from "@skillsy/shared/i18n/format";
import { INTL_LOCALE } from "@skillsy/shared/i18n/locales";
import type { MessageKey, TranslateFn } from "@skillsy/shared/i18n/keys";
import { useLocale, useT } from "@/lib/i18n/provider";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ClipboardPlus,
  Clock3,
  LayoutList,
  MapPin,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Opportunity, UserProfile } from "@/models/types";
import {
  OpportunityFormInput,
  OpportunityService,
  getOpportunityStatus,
  needsOpportunityFollowUp,
} from "@/services/opportunity-service";
import { PROVIDER_CATEGORIES } from "@/lib/profile-form";
import { BRAZIL_STATES } from "@/lib/brazil-states";
import { useAuth } from "@/hooks/use-auth";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  EmptyState,
  SurfacePanel,
} from "@/components/ui/page-layout";

const emptyForm: OpportunityFormInput = {
  category: "",
  title: "",
  description: "",
  city: "",
  neighborhood: "",
  state: "",
  urgency: "normal",
};

const followUpToggleClass =
  "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground";

const urgencyMeta = {
  normal: {
    label: "opportunities.urgencyNormal",
    help: "opportunities.urgencyNormalHelp",
    className: "border-border bg-background text-text-muted",
  },
  soon: {
    label: "opportunities.urgencySoon",
    help: "opportunities.urgencySoonHelp",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  urgent: {
    label: "opportunities.urgencyUrgent",
    help: "opportunities.urgencyUrgentHelp",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
} as const satisfies Record<string, { label: MessageKey; help: MessageKey; className: string }>;

function OpportunityCard({
  opportunity,
  profile,
  onStatus,
}: {
  opportunity: Opportunity;
  profile: UserProfile | null;
  onStatus: (id: string, status: "active" | "closed") => Promise<void>;
}) {
  const t = useT();
  const locale = useLocale();
  const isOwner = profile?.uid === opportunity.authorId;
  const status = getOpportunityStatus(opportunity);
  const canContact = Boolean(
    profile?.isProvider && !isOwner && status === "active",
  );
  const urgency = opportunity.urgency || "normal";
  const urgencyInfo = urgencyMeta[urgency];

  return (
    <article className="flex h-full flex-col gap-5 border border-border-subtle bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-primary">
              {opportunity.category}
            </p>
            {urgency !== "normal" ? (
              <Badge variant="outline" className={urgencyInfo.className}>
                {urgency === "urgent" ? (
                  <AlertTriangle className="size-3" />
                ) : (
                  <Clock3 className="size-3" />
                )}
                {t(urgencyInfo.label)}
              </Badge>
            ) : null}
          </div>
          <h2 className="font-heading text-xl font-semibold text-text-main">
            {opportunity.title}
          </h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-muted">
          <Clock3 className="size-3.5" />{" "}
          {formatDate(opportunity.createdAt, INTL_LOCALE[locale]) || t("opportunities.now")}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
        {opportunity.description}
      </p>

      <div className="flex items-center gap-2 border-t border-border-subtle pt-4 text-sm text-text-muted">
        <MapPin className="size-4 shrink-0 text-primary" />
        <span>
          {opportunity.neighborhood}, {opportunity.city} — {opportunity.state}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {canContact ? (
          <Button
            render={
              <a
                href={opportunityWhatsappUrl(opportunity, profile!.name) ?? undefined}
                target="_blank"
                rel="noreferrer"
              />
            }
            nativeButton={false}
            // Same green WhatsApp button as the profile page.
            className="w-full bg-success font-bold text-success-foreground hover:bg-success/90 active:bg-success/80 sm:w-auto"
          >
            <FaWhatsapp className="size-4" />{" "}
            {t("opportunities.talkTo", { name: opportunity.authorName.split(" ")[0] })}
          </Button>
        ) : null}
        {!profile && (
          <p className="text-sm text-text-muted">
            {t("opportunities.signInToTalk")}
          </p>
        )}
        {profile && !profile.isProvider && !isOwner ? (
          <p className="text-sm text-text-muted">
            {t("opportunities.completeProfile")}
          </p>
        ) : null}
        {isOwner && status === "active" ? (
          <Button
            variant="outline"
            onClick={() => onStatus(opportunity.id!, "closed")}
          >
            {t("opportunities.close")}
          </Button>
        ) : null}
        {isOwner && status !== "active" ? (
          <Button
            variant="outline"
            onClick={() => onStatus(opportunity.id!, "active")}
          >
            {t("opportunities.reopen")}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

type OpportunitiesMode = "all" | "for-you" | "help";

function getModeCopy(mode: OpportunitiesMode, t: TranslateFn) {
  if (mode === "for-you") {
    return {
      eyebrow: t("opportunities.forYouEyebrow"),
      title: t("opportunities.forYouTitle"),
      description: t("opportunities.forYouDescription"),
      createLabel: t("opportunities.create"),
    };
  }

  if (mode === "help") {
    return {
      eyebrow: t("opportunities.helpEyebrow"),
      title: t("opportunities.helpTitle"),
      description: t("opportunities.helpDescription"),
      createLabel: t("opportunities.publish"),
    };
  }

  return {
    eyebrow: t("opportunities.allEyebrow"),
    title: t("opportunities.allTitle"),
    description: t("opportunities.allDescription"),
    createLabel: t("opportunities.create"),
  };
}

export function OpportunitiesClient({
  initialOpportunities,
  mode = "all",
}: {
  initialOpportunities: Opportunity[];
  mode?: OpportunitiesMode;
}) {
  const router = useRouter();
  const { profile, user } = useAuth();
  const t = useT();
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [form, setForm] = useState<OpportunityFormInput>(() => ({
    ...emptyForm,
    city: profile?.location || "",
    state: profile?.businessState || "",
  }));
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [followUpDrafts, setFollowUpDrafts] = useState<
    Record<string, { receivedResponse: boolean; platformSatisfied: boolean }>
  >({});
  const modeCopy = getModeCopy(mode, t);
  // Sync state with props/profile during render instead of in effects
  // (https://react.dev/learn/you-might-not-need-an-effect).
  const [syncedOpportunities, setSyncedOpportunities] =
    useState(initialOpportunities);
  if (initialOpportunities !== syncedOpportunities) {
    setSyncedOpportunities(initialOpportunities);
    setOpportunities(initialOpportunities);
  }

  // Prefill the form location from the profile.
  const formDefaultsKey = profile
    ? [profile.uid, profile.location, profile.businessState].join("|")
    : "";
  const [syncedFormDefaultsKey, setSyncedFormDefaultsKey] = useState("");
  if (profile && formDefaultsKey !== syncedFormDefaultsKey) {
    setSyncedFormDefaultsKey(formDefaultsKey);
    setForm((current) => ({
      ...current,
      city: current.city || profile.location || "",
      state: current.state || profile.businessState || "",
    }));
  }

  // Providers start with the filters set to their own service and state.
  const providerFiltersKey = profile?.isProvider
    ? [profile.uid, profile.category, profile.businessState].join("|")
    : "";
  const [syncedProviderFiltersKey, setSyncedProviderFiltersKey] = useState("");
  if (profile?.isProvider && providerFiltersKey !== syncedProviderFiltersKey) {
    setSyncedProviderFiltersKey(providerFiltersKey);
    setCategory(profile.category || "");
    setState(profile.businessState || "");
  }
  useEffect(() => {
    if (
      mode !== "for-you" ||
      !profile?.isProvider ||
      !profile.category ||
      !profile.businessState
    )
      return;
    let active = true;
    OpportunityService.getActive({
      category: profile.category,
      state: profile.businessState,
    })
      .then((items) => {
        if (active) setOpportunities(items);
      })
      .catch(() => {
        if (active)
          toast.error(t("opportunities.loadError"));
      });
    return () => {
      active = false;
    };
  }, [
    mode,
    profile?.uid,
    profile?.isProvider,
    profile?.category,
    profile?.businessState,
    t,
  ]);
  const myFollowUps = useMemo(
    () =>
      opportunities.filter(
        (item) =>
          profile?.uid === item.authorId &&
          needsOpportunityFollowUp(item) &&
          !item.followUpAnsweredAt,
      ),
    [opportunities, profile?.uid],
  );
  const visible = useMemo(() => {
    return sortOpportunities(
      opportunities.filter(
        (item) =>
          (!category || item.category === category) &&
          (!state || item.state === state),
      ),
    );
  }, [opportunities, category, state]);

  const updateStatus = async (id: string, status: "active" | "closed") => {
    try {
      await OpportunityService.setStatus(id, status);
      setOpportunities((items) =>
        items.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      toast.success(
        status === "closed"
          ? t("opportunities.closed")
          : t("opportunities.reopened"),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("opportunities.updateError"),
      );
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) {
      toast.error(t("opportunities.signInToCreate"));
      return;
    }
    setCreating(true);
    try {
      await OpportunityService.createForProfile(form, {
        name: profile.name,
        whatsapp: profile.whatsapp,
      });
      toast.success(t("opportunities.published"));
      setShowForm(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("opportunities.publishError"),
      );
    } finally {
      setCreating(false);
    }
  };

  const answerFollowUp = async (
    opportunity: Opportunity,
    closeRequest: boolean,
  ) => {
    const draft = followUpDrafts[opportunity.id!] || {
      receivedResponse: true,
      platformSatisfied: true,
    };
    const { receivedResponse, platformSatisfied } = draft;
    try {
      await OpportunityService.answerFollowUp(opportunity.id!, {
        receivedResponse,
        platformSatisfied,
        closeRequest,
      });
      setOpportunities((items) =>
        items.map((item) =>
          item.id === opportunity.id
            ? {
                ...item,
                receivedResponse,
                platformSatisfied,
                followUpAnsweredAt: new Date(),
                status: closeRequest ? "closed" : item.status,
              }
            : item,
        ),
      );
      setFollowUpDrafts((items) => {
        const next = { ...items };
        delete next[opportunity.id!];
        return next;
      });
      toast.success(
        closeRequest
          ? t("opportunities.followUpClosed")
          : t("opportunities.followUpKept"),
      );
    } catch {
      toast.error(t("opportunities.followUpError"));
    }
  };

  return (
    <main className="container mx-auto space-y-8 px-4 py-8 md:py-10">
      <PageHeader
        eyebrow={modeCopy.eyebrow}
        title={modeCopy.title}
        description={modeCopy.description}
        action={
          mode === "help" ? undefined : (
            <Button
              onClick={() =>
                user
                  ? setShowForm((open) => !open)
                  : toast.error(t("opportunities.signInToCreate"))
              }
            >
              <Plus className="size-4" /> {modeCopy.createLabel}
            </Button>
          )
        }
      />

      {mode === "help" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SurfacePanel className="flex flex-col gap-4">
            <Search className="size-5 text-primary" />
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold text-text-main">
                {t("opportunities.findProfessional")}
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                {t("opportunities.findProfessionalText")}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-auto"
              render={<Link href="/search" />}
              nativeButton={false}
            >
              {t("opportunities.searchNow")}
            </Button>
          </SurfacePanel>
          <SurfacePanel className="flex flex-col gap-4 border-primary/30 bg-primary/5">
            <ClipboardPlus className="size-5 text-primary" />
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold text-text-main">
                {t("opportunities.publish")}
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                {t("opportunities.publishText")}
              </p>
            </div>
            <Button
              className="mt-auto"
              onClick={() =>
                user
                  ? setShowForm(true)
                  : toast.error(t("opportunities.signInToCreate"))
              }
            >
              {t("opportunities.publish")}
            </Button>
          </SurfacePanel>
          <SurfacePanel className="flex flex-col gap-4">
            <LayoutList className="size-5 text-primary" />
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold text-text-main">
                {t("opportunities.seeOpportunities")}
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                {t("opportunities.seeOpportunitiesText")}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-auto"
              render={<Link href="/oportunidades" />}
              nativeButton={false}
            >
              {t("opportunities.openBoard")}
            </Button>
          </SurfacePanel>
        </div>
      ) : null}

      {showForm && (
        <SurfacePanel>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="opportunity-title"
                className="text-sm font-medium"
              >
                {t("opportunities.titleLabel")}
              </Label>
              <Input
                id="opportunity-title"
                required
                minLength={5}
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("opportunities.titlePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="opportunity-category"
                className="text-sm font-medium"
              >
                {t("opportunities.serviceType")}
              </Label>
              <Select
                required
                value={form.category || null}
                onValueChange={(value) =>
                  setForm({ ...form, category: value ?? "" })
                }
              >
                <SelectTrigger
                  id="opportunity-category"
                  className="h-10 w-full px-3 text-sm"
                >
                  <SelectValue>{form.category || t("opportunities.select")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="opportunity-urgency"
                className="text-sm font-medium"
              >
                {t("opportunities.urgency")}
              </Label>
              <Select
                required
                value={form.urgency}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    urgency: (value ??
                      "normal") as OpportunityFormInput["urgency"],
                  })
                }
              >
                <SelectTrigger
                  id="opportunity-urgency"
                  className="h-10 w-full px-3 text-sm"
                >
                  <SelectValue>{t(urgencyMeta[form.urgency].label)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(urgencyMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {t(meta.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-text-muted">
                {t(urgencyMeta[form.urgency].help)}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="opportunity-state"
                className="text-sm font-medium"
              >
                {t("opportunities.state")}
              </Label>
              <Select
                required
                value={form.state || null}
                onValueChange={(value) =>
                  setForm({ ...form, state: value ?? "" })
                }
              >
                <SelectTrigger
                  id="opportunity-state"
                  className="h-10 w-full px-3 text-sm"
                >
                  <SelectValue>
                    {BRAZIL_STATES.find((item) => item.value === form.state)
                      ?.label || t("opportunities.select")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BRAZIL_STATES.filter((item) => item.value !== "all").map(
                    (item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opportunity-city" className="text-sm font-medium">
                {t("opportunities.city")}
              </Label>
              <Input
                id="opportunity-city"
                required
                minLength={2}
                maxLength={100}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="opportunity-neighborhood"
                className="text-sm font-medium"
              >
                {t("opportunities.neighborhood")}
              </Label>
              <Input
                id="opportunity-neighborhood"
                required
                minLength={2}
                maxLength={100}
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="opportunity-description"
                className="text-sm font-medium"
              >
                {t("opportunities.descriptionLabel")}
              </Label>
              <Textarea
                id="opportunity-description"
                required
                minLength={20}
                maxLength={2000}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder={t("opportunities.descriptionPlaceholder")}
                rows={5}
              />
            </div>
            <p className="text-xs leading-relaxed text-text-muted md:col-span-2">
              {t("opportunities.formNotice", { days: OPPORTUNITY_DAYS })}
            </p>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={creating}>
                <Send className="size-4" />{" "}
                {creating ? t("opportunities.publishing") : t("opportunities.publish")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                {t("opportunities.cancel")}
              </Button>
            </div>
          </form>
        </SurfacePanel>
      )}

      {myFollowUps.map((opportunity) => {
        const draft = followUpDrafts[opportunity.id!] || {
          receivedResponse: true,
          platformSatisfied: true,
        };
        const updateDraft = (next: Partial<typeof draft>) =>
          setFollowUpDrafts((items) => ({
            ...items,
            [opportunity.id!]: { ...draft, ...next },
          }));

        return (
          <SurfacePanel
            key={`follow-up-${opportunity.id}`}
            className="border-primary/30 bg-primary/5"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-text-main">
                    {t("opportunities.followUpTitle", { title: opportunity.title })}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t("opportunities.followUpText", { days: OPPORTUNITY_REMINDER_DAYS })}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium text-text-main">
                      {t("opportunities.followUpResponse")}
                    </legend>
                    <ToggleGroup
                      variant="outline"
                      size="sm"
                      className="flex-wrap"
                      value={[draft.receivedResponse ? "yes" : "no"]}
                      onValueChange={(value) => {
                        if (value[0])
                          updateDraft({ receivedResponse: value[0] === "yes" });
                      }}
                    >
                      <ToggleGroupItem value="yes" className={followUpToggleClass}>
                        {t("opportunities.yes")}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="no" className={followUpToggleClass}>
                        {t("opportunities.notYet")}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </fieldset>
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium text-text-main">
                      {t("opportunities.followUpSatisfied")}
                    </legend>
                    <ToggleGroup
                      variant="outline"
                      size="sm"
                      className="flex-wrap"
                      value={[draft.platformSatisfied ? "yes" : "no"]}
                      onValueChange={(value) => {
                        if (value[0])
                          updateDraft({ platformSatisfied: value[0] === "yes" });
                      }}
                    >
                      <ToggleGroupItem value="yes" className={followUpToggleClass}>
                        {t("opportunities.yes")}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="no" className={followUpToggleClass}>
                        {t("opportunities.couldBeBetter")}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </fieldset>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => answerFollowUp(opportunity, false)}
                >
                  {t("opportunities.keepVisible")}
                </Button>
                <Button onClick={() => answerFollowUp(opportunity, true)}>
                  {t("opportunities.answerAndClose")}
                </Button>
              </div>
            </div>
          </SurfacePanel>
        );
      })}

      {mode === "all" ? (
        <SurfacePanel className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="w-full space-y-1.5">
            <Label htmlFor="filter-category" className="text-sm font-medium">
              {t("opportunities.service")}
            </Label>
            <Select
              value={category || "all"}
              onValueChange={(value) =>
                setCategory(!value || value === "all" ? "" : value)
              }
            >
              <SelectTrigger
                id="filter-category"
                className="h-10 w-full px-3 text-sm"
              >
                <SelectValue>{category || t("opportunities.allServices")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("opportunities.allServices")}</SelectItem>
                {PROVIDER_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-1.5">
            <Label htmlFor="filter-state" className="text-sm font-medium">
              {t("opportunities.state")}
            </Label>
            <Select
              value={state || "all"}
              onValueChange={(value) =>
                setState(!value || value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="filter-state" className="h-10 w-full px-3 text-sm">
                <SelectValue>
                  {BRAZIL_STATES.find((item) => item.value === state)?.label ||
                    t("opportunities.allStates")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("opportunities.allStates")}</SelectItem>
                {BRAZIL_STATES.filter((item) => item.value !== "all").map(
                  (item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </SurfacePanel>
      ) : null}

      {visible.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              profile={profile}
              onStatus={updateStatus}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BriefcaseBusiness className="size-6" />}
          title={t("opportunities.emptyTitle")}
          description={
            mode === "all" && (category || state)
              ? t("opportunities.emptyFiltered")
              : t("opportunities.empty")
          }
        />
      )}
    </main>
  );
}
