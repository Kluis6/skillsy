"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/user-service";
import type { UserProfile, UserReport } from "@/models/types";
import { REPORT_REASON_LABELS } from "@/lib/reporting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SLA_HOURS = 48;
type QueueFilter = "open" | "all" | "overdue" | "resolved";
type ModerationStatus = "new" | "in_review" | "resolved" | "dismissed";
type Priority = "low" | "normal" | "high";

const statusMeta: Record<
  ModerationStatus,
  { label: string; className: string }
> = {
  new: {
    label: "Nova",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  in_review: {
    label: "Em análise",
    className: "bg-amber-500/10 text-amber-800 border-amber-500/20",
  },
  resolved: {
    label: "Resolvida",
    className: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  dismissed: {
    label: "Descartada",
    className: "bg-muted text-text-muted border-border-subtle",
  },
};

const priorityMeta: Record<Priority, { label: string; className: string }> = {
  high: {
    label: "Alta",
    className: "bg-red-500/10 text-red-700 border-red-500/20",
  },
  normal: {
    label: "Normal",
    className: "bg-surface text-text-main border-border-subtle",
  },
  low: {
    label: "Baixa",
    className: "bg-muted text-text-muted border-border-subtle",
  },
};

function normalizedStatus(status: UserReport["status"]): ModerationStatus {
  return status === "reviewed" ? "in_review" : status;
}

function reportDate(report: UserReport) {
  const seconds = report.createdAt?.seconds;
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

function isOpen(report: UserReport) {
  const status = normalizedStatus(report.status);
  return status === "new" || status === "in_review";
}

function isOverdue(report: UserReport, now: number) {
  const createdAt = reportDate(report);
  return Boolean(
    createdAt &&
    isOpen(report) &&
    now - createdAt.getTime() > SLA_HOURS * 60 * 60 * 1000,
  );
}

export function AdminModerationClient() {
  const { profile, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QueueFilter>("open");
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [status, setStatus] = useState<ModerationStatus>("new");
  const [priority, setPriority] = useState<Priority>("normal");
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);
  const [now] = useState(() => Date.now());

  const loadQueue = useCallback(async () => {
    if (profile?.role !== "admin") return;
    setLoading(true);
    try {
      const [loadedReports, loadedUsers] = await Promise.all([
        UserService.getAllReports(),
        UserService.getAllUsers(),
      ]);
      setReports(loadedReports);
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Unable to load moderation queue", error);
      toast.error("Não foi possível carregar a fila de moderação.");
    } finally {
      setLoading(false);
    }
  }, [profile?.role]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const userById = useMemo(
    () => new Map(users.map((user) => [user.uid, user])),
    [users],
  );

  const metrics = useMemo(() => {
    const open = reports.filter(isOpen);
    return {
      open: open.length,
      overdue: open.filter((report) => isOverdue(report, now)).length,
      inReview: reports.filter(
        (report) => normalizedStatus(report.status) === "in_review",
      ).length,
      resolved: reports.filter(
        (report) => normalizedStatus(report.status) === "resolved",
      ).length,
    };
  }, [reports, now]);

  const visibleReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      if (filter === "open") return isOpen(report);
      if (filter === "overdue") return isOverdue(report, now);
      if (filter === "resolved")
        return ["resolved", "dismissed"].includes(
          normalizedStatus(report.status),
        );
      return true;
    });

    return filtered.sort((a, b) => {
      const priorityOrder: Record<Priority, number> = {
        high: 0,
        normal: 1,
        low: 2,
      };
      const priorityDifference =
        priorityOrder[a.priority || "normal"] -
        priorityOrder[b.priority || "normal"];
      if (priorityDifference !== 0) return priorityDifference;
      return (reportDate(a)?.getTime() || 0) - (reportDate(b)?.getTime() || 0);
    });
  }, [filter, now, reports]);

  const openReport = (report: UserReport) => {
    setSelectedReport(report);
    setStatus(normalizedStatus(report.status));
    setPriority(report.priority || "normal");
    setResolution(report.resolution || "");
  };

  const saveReport = async () => {
    if (!selectedReport?.id || !profile) return;
    setSaving(true);
    try {
      await UserService.updateUserReport(selectedReport.id, {
        status,
        priority,
        assignedAdminId: profile.uid,
        assignedAdminName: profile.name,
        resolution: resolution.trim(),
      });
      toast.success("Decisão registrada na fila.");
      setSelectedReport(null);
      await loadQueue();
    } catch (error) {
      console.error("Unable to update report", error);
      toast.error("Não foi possível registrar a decisão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="size-8 animate-spin text-primary"
          aria-label="Carregando fila de moderação"
        />
      </div>
    );
  }

  if (profile?.role !== "admin") return null;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-main">
            Fila de moderação
          </h1>
          <p className="max-w-2xl text-sm text-text-muted">
            Revise denúncias de perfis com uma meta operacional de até{" "}
            {SLA_HOURS} horas. Priorize os itens vencidos antes das novas
            entradas.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadQueue()}
        >
          Atualizar fila
        </Button>
      </header>

      <section
        aria-label="Resumo da fila"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          {
            label: "Abertas",
            value: metrics.open,
            detail: "Aguardam decisão",
            icon: ShieldAlert,
            tone: "text-primary",
          },
          {
            label: "Vencidas",
            value: metrics.overdue,
            detail: "Passaram do SLA",
            icon: AlertTriangle,
            tone: "text-red-600",
          },
          {
            label: "Em análise",
            value: metrics.inReview,
            detail: "Com responsável",
            icon: Clock3,
            tone: "text-amber-700",
          },
          {
            label: "Resolvidas",
            value: metrics.resolved,
            detail: "Decisões concluídas",
            icon: CheckCircle2,
            tone: "text-green-700",
          },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-lg border border-border-subtle bg-card p-4"
          >
            <Icon className={`mb-3 size-5 ${tone}`} aria-hidden="true" />
            <p className="text-2xl font-semibold tabular-nums text-text-main">
              {value}
            </p>
            <p className="text-sm font-medium text-text-main">{label}</p>
            <p className="text-xs text-text-muted">{detail}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-border-subtle bg-card">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text-main">Casos para revisar</h2>
            <p className="text-xs text-text-muted">
              Ordenados por prioridade e prazo mais próximo.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            Mostrar
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as QueueFilter)}
              className="h-9 rounded-md border border-border-subtle bg-card px-2 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="open">Abertas</option>
              <option value="overdue">Vencidas</option>
              <option value="resolved">Concluídas</option>
              <option value="all">Todas</option>
            </select>
          </label>
        </div>

        {visibleReports.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2
              className="mx-auto mb-3 size-8 text-green-600"
              aria-hidden="true"
            />
            <p className="font-medium text-text-main">
              Nenhum caso nesta visão
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Quando houver novas denúncias, elas aparecerão nesta fila.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {visibleReports.map((report) => {
              const createdAt = reportDate(report);
              const reportStatus = normalizedStatus(report.status);
              const reportPriority = report.priority || "normal";
              const subject = userById.get(report.reportedUserId);
              const overdue = isOverdue(report, now);
              const reason =
                REPORT_REASON_LABELS[
                  report.reason as keyof typeof REPORT_REASON_LABELS
                ] || report.reason;
              return (
                <article
                  key={report.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-text-main">
                        {report.reportedUserName ||
                          subject?.name ||
                          "Perfil sem nome"}
                      </p>
                      <Badge className={statusMeta[reportStatus].className}>
                        {statusMeta[reportStatus].label}
                      </Badge>
                      <Badge className={priorityMeta[reportPriority].className}>
                        {priorityMeta[reportPriority].label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{reason}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span>
                        {createdAt
                          ? formatDistanceToNow(createdAt, {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : "Data indisponível"}
                      </span>
                      <span>
                        {report.assignedAdminName
                          ? `Responsável: ${report.assignedAdminName}`
                          : "Sem responsável"}
                      </span>
                      <span
                        className={overdue ? "font-medium text-red-700" : ""}
                      >
                        {overdue ? "SLA vencido" : `SLA: ${SLA_HOURS} h`}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openReport(report)}
                  >
                    Revisar caso
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(selectedReport)}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar denúncia</DialogTitle>
            <DialogDescription>
              Registre a decisão para manter uma trilha de moderação clara para
              a equipe.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-5">
              <div className="rounded-md bg-surface p-4 text-sm">
                <p className="font-medium text-text-main">
                  Perfil denunciado:{" "}
                  {selectedReport.reportedUserName ||
                    selectedReport.reportedUserId}
                </p>
                <p className="mt-2 text-text-muted">
                  <span className="font-medium text-text-main">Motivo:</span>{" "}
                  {REPORT_REASON_LABELS[
                    selectedReport.reason as keyof typeof REPORT_REASON_LABELS
                  ] || selectedReport.reason}
                </p>
                {selectedReport.details && (
                  <p className="mt-2 whitespace-pre-wrap break-words text-text-muted">
                    <span className="font-medium text-text-main">Relato:</span>{" "}
                    {selectedReport.details}
                  </p>
                )}
                <p className="mt-3 text-xs text-text-muted">
                  Denúncia enviada por {selectedReport.reporterEmail}.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="moderation-status">Situação</Label>
                  <select
                    id="moderation-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as ModerationStatus)
                    }
                    className="h-10 w-full rounded-md border border-border-subtle bg-card px-3 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="new">Nova</option>
                    <option value="in_review">Em análise</option>
                    <option value="resolved">Resolvida</option>
                    <option value="dismissed">Descartada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moderation-priority">Prioridade</Label>
                  <select
                    id="moderation-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as Priority)
                    }
                    className="h-10 w-full rounded-md border border-border-subtle bg-card px-3 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="high">Alta</option>
                    <option value="normal">Normal</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderation-resolution">
                  Decisão e observações
                </Label>
                <Textarea
                  id="moderation-resolution"
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                  maxLength={1000}
                  placeholder="Ex.: Perfil bloqueado após confirmação de tentativa de golpe…"
                />
                <p className="text-right text-xs text-text-muted">
                  {resolution.length}/1000
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedReport(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void saveReport()}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <UserRound className="mr-2 size-4" />
              )}
              Registrar decisão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
