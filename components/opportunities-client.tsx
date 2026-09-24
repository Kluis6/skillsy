"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ClipboardPlus,
  Clock3,
  ListChecks,
  MapPin,
  MessageCircle,
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
    label: "Sem pressa",
    help: "Pode ser atendido dentro do prazo normal de 30 dias.",
    className: "border-border bg-background text-text-muted",
    rank: 1,
  },
  soon: {
    label: "Nos próximos dias",
    help: "Bom para oportunidades que precisam de retorno ainda esta semana.",
    className: "border-primary/20 bg-primary/10 text-primary",
    rank: 2,
  },
  urgent: {
    label: "Urgente",
    help: "Use quando precisa de contato rápido. Não substitui emergência ou serviço público.",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
    rank: 3,
  },
} as const;

function dateLabel(value: unknown) {
  if (!value || typeof value !== "object" || !("seconds" in value))
    return "agora";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(Number(value.seconds) * 1000),
  );
}

function whatsappUrl(opportunity: Opportunity, professional: UserProfile) {
  const phone = opportunity.authorWhatsApp.replace(/\D/g, "");
  const brief = opportunity.description
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 130);
  const message = `Olá, eu sou membro ${professional.name}. Vi sua oportunidade de “${brief}” no Skillsy e acredito que posso ajudar.`;
  return `https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(message)}`;
}

function OpportunityCard({
  opportunity,
  profile,
  onStatus,
}: {
  opportunity: Opportunity;
  profile: UserProfile | null;
  onStatus: (id: string, status: "active" | "closed") => Promise<void>;
}) {
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
                {urgencyInfo.label}
              </Badge>
            ) : null}
          </div>
          <h2 className="font-heading text-xl font-semibold text-text-main">
            {opportunity.title}
          </h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-muted">
          <Clock3 className="size-3.5" /> {dateLabel(opportunity.createdAt)}
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
                href={whatsappUrl(opportunity, profile!)}
                target="_blank"
                rel="noreferrer"
              />
            }
            nativeButton={false}
            className="w-full sm:w-auto"
          >
            <MessageCircle className="size-4" /> Falar com{" "}
            {opportunity.authorName.split(" ")[0]}
          </Button>
        ) : null}
        {!profile && (
          <p className="text-sm text-text-muted">
            Entre para falar diretamente com quem publicou a oportunidade.
          </p>
        )}
        {profile && !profile.isProvider && !isOwner ? (
          <p className="text-sm text-text-muted">
            Complete um perfil profissional para responder por WhatsApp.
          </p>
        ) : null}
        {isOwner && status === "active" ? (
          <Button
            variant="outline"
            onClick={() => onStatus(opportunity.id!, "closed")}
          >
            Encerrar oportunidade
          </Button>
        ) : null}
        {isOwner && status !== "active" ? (
          <Button
            variant="outline"
            onClick={() => onStatus(opportunity.id!, "active")}
          >
            Reativar oportunidade
          </Button>
        ) : null}
      </div>
    </article>
  );
}

type OpportunitiesMode = "all" | "for-you" | "help";

function getModeCopy(mode: OpportunitiesMode) {
  if (mode === "for-you") {
    return {
      eyebrow: "Oportunidades compatíveis",
      title: "Oportunidades para o seu serviço",
      description:
        "Estas oportunidades combinam com a categoria e o estado informados no seu perfil profissional.",
      createLabel: "Criar oportunidade",
    };
  }

  if (mode === "help") {
    return {
      eyebrow: "Encontrar ajuda",
      title: "O que você precisa resolver?",
      description:
        "Busque um profissional ou publique uma oportunidade no mural, onde profissionais filtram por serviço e estado.",
      createLabel: "Publicar oportunidade",
    };
  }

  return {
    eyebrow: "Oportunidades da comunidade",
    title: "Encontre ajuda ou ofereça seu talento",
    description:
      "Oportunidades ativas são mostradas a profissionais do mesmo tipo de serviço e estado. Você decide quando encerrar a exibição.",
    createLabel: "Criar oportunidade",
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
  const modeCopy = getModeCopy(mode);
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
          toast.error("Não foi possível carregar suas oportunidades.");
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
    return [...opportunities]
      .filter(
        (item) =>
          (!category || item.category === category) &&
          (!state || item.state === state),
      )
      .sort((a, b) => {
        const urgencyDiff =
          urgencyMeta[b.urgency || "normal"].rank -
          urgencyMeta[a.urgency || "normal"].rank;
        if (urgencyDiff) return urgencyDiff;
        const bCreated =
          b.createdAt &&
          typeof b.createdAt === "object" &&
          "seconds" in b.createdAt
            ? Number(b.createdAt.seconds)
            : 0;
        const aCreated =
          a.createdAt &&
          typeof a.createdAt === "object" &&
          "seconds" in a.createdAt
            ? Number(a.createdAt.seconds)
            : 0;
        return bCreated - aCreated;
      });
  }, [opportunities, category, state]);

  const updateStatus = async (id: string, status: "active" | "closed") => {
    try {
      await OpportunityService.setStatus(id, status);
      setOpportunities((items) =>
        items.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      toast.success(
        status === "closed"
          ? "Oportunidade encerrada. Profissionais não a verão mais."
          : "Oportunidade reativada.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a oportunidade.",
      );
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) {
      toast.error("Faça login para criar uma oportunidade.");
      return;
    }
    setCreating(true);
    try {
      await OpportunityService.createForProfile(form, {
        name: profile.name,
        whatsapp: profile.whatsapp,
      });
      toast.success("Oportunidade publicada para profissionais compatíveis.");
      setShowForm(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar a oportunidade.",
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
          ? "Obrigado. A oportunidade foi encerrada."
          : "Obrigado pelo retorno. A oportunidade continuará ativa.",
      );
    } catch {
      toast.error("Não foi possível registrar sua resposta.");
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
                  : toast.error("Faça login para criar uma oportunidade.")
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
                Buscar profissional
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                Use quando já sabe o serviço e quer escolher alguém pelo perfil.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-auto"
              render={<Link href="/search" />}
              nativeButton={false}
            >
              Buscar agora
            </Button>
          </SurfacePanel>
          <SurfacePanel className="flex flex-col gap-4 border-primary/30 bg-primary/5">
            <ClipboardPlus className="size-5 text-primary" />
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold text-text-main">
                Publicar oportunidade
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                Sua oportunidade entra no mural, visível para profissionais do mesmo serviço e estado.
              </p>
            </div>
            <Button
              className="mt-auto"
              onClick={() =>
                user
                  ? setShowForm(true)
                  : toast.error("Faça login para criar uma oportunidade.")
              }
            >
              Publicar oportunidade
            </Button>
          </SurfacePanel>
          <SurfacePanel className="flex flex-col gap-4">
            <ListChecks className="size-5 text-primary" />
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold text-text-main">
                Ver oportunidades
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                Veja o mural da comunidade por serviço e estado.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-auto"
              render={<Link href="/oportunidades" />}
              nativeButton={false}
            >
              Abrir mural
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
                Título da oportunidade
              </Label>
              <Input
                id="opportunity-title"
                required
                minLength={5}
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex.: Preciso de eletricista para instalar ventiladores"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="opportunity-category"
                className="text-sm font-medium"
              >
                Tipo de serviço
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
                  <SelectValue>{form.category || "Selecione"}</SelectValue>
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
                Urgência
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
                  <SelectValue>{urgencyMeta[form.urgency].label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(urgencyMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-text-muted">
                {urgencyMeta[form.urgency].help}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="opportunity-state"
                className="text-sm font-medium"
              >
                Estado
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
                      ?.label || "Selecione"}
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
                Cidade
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
                Bairro
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
                Descreva o serviço
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
                placeholder="Explique o que precisa, detalhes importantes e quando gostaria de realizar o serviço."
                rows={5}
              />
            </div>
            <p className="text-xs leading-relaxed text-text-muted md:col-span-2">
              Seu WhatsApp será exibido apenas como ação de contato desta
              oportunidade. Ela ficará ativa por até 30 dias e você pode encerrar
              antes. Oportunidades urgentes ajudam a priorizar o contato, mas não
              substituem canais de emergência.
            </p>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={creating}>
                <Send className="size-4" />{" "}
                {creating ? "Publicando…" : "Publicar oportunidade"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
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
                    Sua oportunidade “{opportunity.title}” ainda está ativa.
                  </p>
                  <p className="text-sm text-text-muted">
                    Já se passaram 20 dias. Conte como foi e escolha se quer
                    manter a oportunidade visível.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium text-text-main">
                      Algum profissional respondeu?
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
                        Sim
                      </ToggleGroupItem>
                      <ToggleGroupItem value="no" className={followUpToggleClass}>
                        Ainda não
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </fieldset>
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium text-text-main">
                      Você ficou satisfeito com o Skillsy?
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
                        Sim
                      </ToggleGroupItem>
                      <ToggleGroupItem value="no" className={followUpToggleClass}>
                        Pode melhorar
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
                  Manter visível
                </Button>
                <Button onClick={() => answerFollowUp(opportunity, true)}>
                  Responder e encerrar
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
              Serviço
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
                <SelectValue>{category || "Todos os serviços"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
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
              Estado
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
                    "Todos os estados"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
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
          title="Nenhuma oportunidade encontrada"
          description={
            mode === "all" && (category || state)
              ? "Ajuste os filtros ou crie a primeira oportunidade desta necessidade na comunidade."
              : "Ainda não há oportunidades abertas. Publique a primeira e ela aparece aqui no mural."
          }
        />
      )}
    </main>
  );
}
