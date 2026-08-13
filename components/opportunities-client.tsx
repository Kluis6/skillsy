"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, BriefcaseBusiness, ClipboardPlus, Clock3, ListChecks, MapPin, MessageCircle, Plus, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Opportunity, UserProfile } from "@/models/types";
import { OpportunityFormInput, OpportunityService, getOpportunityStatus, needsOpportunityFollowUp } from "@/services/opportunity-service";
import { PROVIDER_CATEGORIES } from "@/lib/profile-form";
import { BRAZIL_STATES } from "@/lib/brazil-states";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState, SurfacePanel } from "@/components/ui/page-layout";

const emptyForm: OpportunityFormInput = {
  category: "",
  title: "",
  description: "",
  city: "",
  neighborhood: "",
  state: "",
  urgency: "normal",
};

const urgencyMeta = {
  normal: {
    label: "Sem pressa",
    help: "Pode ser atendido dentro do prazo normal de 30 dias.",
    className: "border-border bg-background text-text-muted",
    rank: 1,
  },
  soon: {
    label: "Nos próximos dias",
    help: "Bom para pedidos que precisam de retorno ainda esta semana.",
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
  if (!value || typeof value !== "object" || !("seconds" in value)) return "agora";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(Number(value.seconds) * 1000));
}

function whatsappUrl(opportunity: Opportunity, professional: UserProfile) {
  const phone = opportunity.authorWhatsApp.replace(/\D/g, "");
  const brief = opportunity.description.replace(/\s+/g, " ").trim().slice(0, 130);
  const message = `Olá, eu sou membro ${professional.name}. Vi seu pedido de “${brief}” no Skillsy e acredito que posso ajudar.`;
  return `https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(message)}`;
}

function OpportunityCard({ opportunity, profile, onStatus }: { opportunity: Opportunity; profile: UserProfile | null; onStatus: (id: string, status: "active" | "closed") => Promise<void> }) {
  const isOwner = profile?.uid === opportunity.authorId;
  const status = getOpportunityStatus(opportunity);
  const canContact = Boolean(profile?.isProvider && !isOwner && status === "active");
  const urgency = opportunity.urgency || "normal";
  const urgencyInfo = urgencyMeta[urgency];

  return (
    <article className="skillsy-surface flex h-full flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-primary">{opportunity.category}</p>
            {urgency !== "normal" ? (
              <Badge variant="outline" className={urgencyInfo.className}>
                {urgency === "urgent" ? <AlertTriangle className="size-3" /> : <Clock3 className="size-3" />}
                {urgencyInfo.label}
              </Badge>
            ) : null}
          </div>
          <h2 className="font-heading text-xl font-semibold text-text-main">{opportunity.title}</h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-muted">
          <Clock3 className="size-3.5" /> {dateLabel(opportunity.createdAt)}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">{opportunity.description}</p>

      <div className="flex items-center gap-2 border-t border-border-subtle pt-4 text-sm text-text-muted">
        <MapPin className="size-4 shrink-0 text-primary" />
        <span>{opportunity.neighborhood}, {opportunity.city} — {opportunity.state}</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {canContact ? (
          <Button render={<a href={whatsappUrl(opportunity, profile!)} target="_blank" rel="noreferrer" />} nativeButton={false} className="w-full sm:w-auto">
            <MessageCircle className="size-4" /> Falar com {opportunity.authorName.split(" ")[0]}
          </Button>
        ) : null}
        {!profile && <p className="text-sm text-text-muted">Entre para falar diretamente com quem publicou o pedido.</p>}
        {profile && !profile.isProvider && !isOwner ? <p className="text-sm text-text-muted">Complete um perfil profissional para responder por WhatsApp.</p> : null}
        {isOwner && status === "active" ? <Button variant="outline" onClick={() => onStatus(opportunity.id!, "closed")}>Encerrar pedido</Button> : null}
        {isOwner && status !== "active" ? <Button variant="outline" onClick={() => onStatus(opportunity.id!, "active")}>Reativar pedido</Button> : null}
      </div>
    </article>
  );
}

type OpportunitiesMode = "all" | "for-you" | "help";

function getModeCopy(mode: OpportunitiesMode) {
  if (mode === "for-you") {
    return {
      eyebrow: "Oportunidades compatíveis",
      title: "Pedidos para o seu serviço",
      description: "Estes pedidos combinam com a categoria e o estado informados no seu perfil profissional.",
      createLabel: "Criar pedido",
    };
  }

  if (mode === "help") {
    return {
      eyebrow: "Encontrar ajuda",
      title: "O que você precisa resolver?",
      description: "Busque um profissional agora ou publique um pedido para profissionais da categoria e localização receberem alerta.",
      createLabel: "Publicar pedido",
    };
  }

  return {
    eyebrow: "Oportunidades da comunidade",
    title: "Encontre ajuda ou ofereça seu talento",
    description: "Pedidos ativos são mostrados a profissionais do mesmo tipo de serviço e estado. Você decide quando encerrar a exibição.",
    createLabel: "Criar pedido",
  };
}

export function OpportunitiesClient({ initialOpportunities, mode = "all" }: { initialOpportunities: Opportunity[]; mode?: OpportunitiesMode }) {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [form, setForm] = useState<OpportunityFormInput>(() => ({ ...emptyForm, city: profile?.location || "", state: profile?.businessState || "" }));
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const modeCopy = getModeCopy(mode);
  useEffect(() => {
    setOpportunities(initialOpportunities);
  }, [initialOpportunities]);
  useEffect(() => {
    if (!profile) return;
    setForm((current) => ({
      ...current,
      city: current.city || profile.location || "",
      state: current.state || profile.businessState || "",
    }));
  }, [profile?.uid, profile?.location, profile?.businessState]);
  useEffect(() => {
    if (!profile?.isProvider) return;
    setCategory(profile.category || "");
    setState(profile.businessState || "");
  }, [profile?.uid, profile?.isProvider, profile?.category, profile?.businessState]);
  useEffect(() => {
    if (mode !== "for-you" || !profile?.isProvider || !profile.category || !profile.businessState) return;
    let active = true;
    OpportunityService.getActive({ category: profile.category, state: profile.businessState })
      .then((items) => { if (active) setOpportunities(items); })
      .catch(() => { if (active) toast.error("Não foi possível carregar suas oportunidades."); });
    return () => { active = false; };
  }, [mode, profile?.uid, profile?.isProvider, profile?.category, profile?.businessState]);
  const myFollowUps = useMemo(() => opportunities.filter((item) => profile?.uid === item.authorId && needsOpportunityFollowUp(item) && !item.followUpAnsweredAt), [opportunities, profile?.uid]);
  const visible = useMemo(() => {
    return [...opportunities]
      .filter((item) => (!category || item.category === category) && (!state || item.state === state))
      .sort((a, b) => {
        const urgencyDiff = urgencyMeta[b.urgency || "normal"].rank - urgencyMeta[a.urgency || "normal"].rank;
        if (urgencyDiff) return urgencyDiff;
        const bCreated = b.createdAt && typeof b.createdAt === "object" && "seconds" in b.createdAt ? Number(b.createdAt.seconds) : 0;
        const aCreated = a.createdAt && typeof a.createdAt === "object" && "seconds" in a.createdAt ? Number(a.createdAt.seconds) : 0;
        return bCreated - aCreated;
      });
  }, [opportunities, category, state]);

  const updateStatus = async (id: string, status: "active" | "closed") => {
    try {
      await OpportunityService.setStatus(id, status);
      setOpportunities((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      toast.success(status === "closed" ? "Pedido encerrado. Profissionais não o verão mais." : "Pedido reativado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o pedido.");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) {
      toast.error("Faça login para criar um pedido.");
      return;
    }
    setCreating(true);
    try {
      await OpportunityService.createForProfile(form, { name: profile.name, whatsapp: profile.whatsapp });
      toast.success("Pedido publicado para profissionais compatíveis.");
      setShowForm(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível publicar o pedido.");
    } finally {
      setCreating(false);
    }
  };

  const answerFollowUp = async (opportunity: Opportunity, closeRequest: boolean) => {
    const receivedResponse = window.confirm("Você recebeu resposta de algum profissional?");
    const platformSatisfied = window.confirm("Você ficou satisfeito(a) com a experiência no Skillsy?");
    try {
      await OpportunityService.answerFollowUp(opportunity.id!, { receivedResponse, platformSatisfied, closeRequest });
      setOpportunities((items) => items.map((item) => item.id === opportunity.id ? { ...item, receivedResponse, platformSatisfied, followUpAnsweredAt: new Date(), status: closeRequest ? "closed" : item.status } : item));
      toast.success(closeRequest ? "Obrigado. O pedido foi encerrado." : "Obrigado pelo retorno. O pedido continuará ativo.");
    } catch {
      toast.error("Não foi possível registrar sua resposta.");
    }
  };

  return (
    <main className="container mx-auto space-y-8 px-4 py-8 md:py-10">
        <PageHeader eyebrow={modeCopy.eyebrow} title={modeCopy.title} description={modeCopy.description} action={<Button onClick={() => user ? setShowForm((open) => !open) : toast.error("Faça login para criar um pedido.")}><Plus className="size-4" /> {modeCopy.createLabel}</Button>} />

        {mode === "help" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <SurfacePanel className="flex flex-col gap-4">
              <Search className="size-5 text-primary" />
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold text-text-main">Buscar profissional</h2>
                <p className="text-sm leading-relaxed text-text-muted">Use quando já sabe o serviço e quer escolher alguém pelo perfil.</p>
              </div>
              <Button variant="outline" render={<Link href="/search" />} nativeButton={false}>
                Buscar agora
              </Button>
            </SurfacePanel>
            <SurfacePanel className="flex flex-col gap-4 border-primary/30 bg-primary/5">
              <ClipboardPlus className="size-5 text-primary" />
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold text-text-main">Publicar pedido</h2>
                <p className="text-sm leading-relaxed text-text-muted">Seu pedido entra no mural e alerta profissionais compatíveis.</p>
              </div>
              <Button onClick={() => user ? setShowForm(true) : toast.error("Faça login para criar um pedido.")}>
                Publicar pedido
              </Button>
            </SurfacePanel>
            <SurfacePanel className="flex flex-col gap-4">
              <ListChecks className="size-5 text-primary" />
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold text-text-main">Ver pedidos abertos</h2>
                <p className="text-sm leading-relaxed text-text-muted">Veja o mural da comunidade por serviço e estado.</p>
              </div>
              <Button variant="outline" render={<Link href="/oportunidades" />} nativeButton={false}>
                Abrir mural
              </Button>
            </SurfacePanel>
          </div>
        ) : null}

        {showForm && (
          <SurfacePanel>
            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2"><label htmlFor="opportunity-title" className="text-sm font-medium">Título do pedido</label><Input id="opportunity-title" required minLength={5} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Preciso de eletricista para instalar ventiladores" /></div>
              <div className="space-y-1.5"><label htmlFor="opportunity-category" className="text-sm font-medium">Tipo de serviço</label><select id="opportunity-category" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Selecione</option>{PROVIDER_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="space-y-1.5"><label htmlFor="opportunity-urgency" className="text-sm font-medium">Urgência</label><select id="opportunity-urgency" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as OpportunityFormInput["urgency"] })}>{Object.entries(urgencyMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select><p className="text-xs leading-relaxed text-text-muted">{urgencyMeta[form.urgency].help}</p></div>
              <div className="space-y-1.5"><label htmlFor="opportunity-state" className="text-sm font-medium">Estado</label><select id="opportunity-state" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}><option value="">Selecione</option>{BRAZIL_STATES.filter((item) => item.value !== "all").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
              <div className="space-y-1.5"><label htmlFor="opportunity-city" className="text-sm font-medium">Cidade</label><Input id="opportunity-city" required minLength={2} maxLength={100} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-1.5"><label htmlFor="opportunity-neighborhood" className="text-sm font-medium">Bairro</label><Input id="opportunity-neighborhood" required minLength={2} maxLength={100} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></div>
              <div className="space-y-1.5 md:col-span-2"><label htmlFor="opportunity-description" className="text-sm font-medium">Descreva o serviço</label><Textarea id="opportunity-description" required minLength={20} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explique o que precisa, detalhes importantes e quando gostaria de realizar o serviço." rows={5} /></div>
              <p className="text-xs leading-relaxed text-text-muted md:col-span-2">Seu WhatsApp será exibido apenas como ação de contato deste pedido. Ele ficará ativo por até 30 dias e você pode encerrar antes. Pedidos urgentes ajudam a priorizar o contato, mas não substituem canais de emergência.</p>
              <div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={creating}><Send className="size-4" /> {creating ? "Publicando…" : "Publicar pedido"}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button></div>
            </form>
          </SurfacePanel>
        )}

        {myFollowUps.map((opportunity) => <SurfacePanel key={`follow-up-${opportunity.id}`} className="border-primary/30 bg-primary/5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold text-text-main">Seu pedido “{opportunity.title}” ainda está ativo.</p><p className="text-sm text-text-muted">Já se passaram 20 dias. Ele foi respondido? Você está satisfeito com o Skillsy?</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => answerFollowUp(opportunity, false)}>Responder e manter</Button><Button onClick={() => answerFollowUp(opportunity, true)}>Responder e encerrar</Button></div></div></SurfacePanel>)}

        {mode === "all" ? <SurfacePanel className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="w-full space-y-1.5"><label htmlFor="filter-category" className="text-sm font-medium">Serviço</label><select id="filter-category" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Todos os serviços</option>{PROVIDER_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="w-full space-y-1.5"><label htmlFor="filter-state" className="text-sm font-medium">Estado</label><select id="filter-state" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={state} onChange={(e) => setState(e.target.value)}><option value="">Todos os estados</option>{BRAZIL_STATES.filter((item) => item.value !== "all").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        </SurfacePanel> : null}

        {visible.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} profile={profile} onStatus={updateStatus} />)}</div> : <EmptyState icon={<BriefcaseBusiness className="size-6" />} title="Nenhum pedido encontrado" description="Ajuste os filtros ou crie o primeiro pedido desta necessidade na comunidade." />}
    </main>
  );
}
