"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { REPORT_REASON_LABELS, REPORT_REASON_OPTIONS } from "@/lib/reporting";
import {
  reportPostSchema,
  type ReportPostFormData,
} from "@/lib/validations";
import { Post } from "@/models/types";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type PostPublicActionsProps = {
  post: Post;
  redirectOnDelete?: string;
  compact?: boolean;
};

export function PostPublicActions({
  post,
  redirectOnDelete,
  compact = false,
}: PostPublicActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, startDeleting] = useTransition();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isSubmittingReport, startSubmittingReport] = useTransition();

  const reportForm = useForm<ReportPostFormData>({
    resolver: zodResolver(reportPostSchema),
    mode: "onBlur",
    defaultValues: {
      reason: "informacao_falsa",
      details: "",
    },
  });
  const reportDetailsValue =
    useWatch({ control: reportForm.control, name: "details" }) || "";

  const isOwnPost = user?.uid === post.authorId;
  const canReport = Boolean(user && !isOwnPost && post.status === "published");
  const containerClassName = compact
    ? "flex flex-wrap items-center gap-2"
    : "flex flex-wrap items-center gap-3";

  const handleDelete = () => {
    if (!isOwnPost || !post.id) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja realmente apagar esta publicação? Esta ação não pode ser desfeita.",
    );

    if (!confirmed) {
      return;
    }

    startDeleting(async () => {
      try {
        await PostService.deleteOwnPost(post.id!);
        toast.success("Publicação apagada com sucesso.");

        if (redirectOnDelete) {
          router.push(redirectOnDelete);
          return;
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível apagar a publicação.");
      }
    });
  };

  const handleReportSubmit = (data: ReportPostFormData) => {
    if (!user) {
      toast.error("Login necessário", {
        description: "Você precisa estar logado para denunciar uma publicação.",
      });
      return;
    }

    if (!post.id) {
      toast.error("Publicação inválida");
      return;
    }

    startSubmittingReport(async () => {
      try {
        await PostService.createReport({
          postId: post.id!,
          postTitle: post.title,
          postSlug: post.slug,
          postAuthorId: post.authorId,
          reason: data.reason,
          details: data.details || "",
        });
        toast.success("Denúncia enviada.");
        reportForm.reset({
          reason: "informacao_falsa",
          details: "",
        });
        setReportDialogOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível enviar a denúncia.");
      }
    });
  };

  const reportReasonOptions = useMemo(
    () =>
      REPORT_REASON_OPTIONS.map((reason) => ({
        value: reason,
        label: REPORT_REASON_LABELS[reason],
      })),
    [],
  );

  return (
    <div className={containerClassName}>
      {isOwnPost && post.id ? (
        <>
          <Link href={`/meus-artigos/${post.id}/editar`}>
            <Button variant="outline" size={compact ? "sm" : "default"}>
              <Pencil size={16} className="mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 size={16} className="mr-2" />
            {isDeleting ? "Apagando..." : "Apagar"}
          </Button>
        </>
      ) : null}

      {canReport ? (
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size={compact ? "sm" : "default"}>
              <Flag size={16} className="mr-2" />
              Denunciar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Denunciar publicação</DialogTitle>
              <DialogDescription>
                Conte para a equipe por que esta publicação precisa ser revisada.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={reportForm.handleSubmit(handleReportSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="post-report-reason">Motivo</Label>
                <select
                  id="post-report-reason"
                  {...reportForm.register("reason")}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {reportReasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {reportForm.formState.errors.reason ? (
                  <p className="text-xs font-medium text-red-500">
                    {reportForm.formState.errors.reason.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-report-details">Detalhes</Label>
                <Textarea
                  id="post-report-details"
                  rows={5}
                  placeholder="Explique rapidamente o problema encontrado."
                  {...reportForm.register("details")}
                />
                <div className="text-right text-xs text-text-muted">
                  {reportDetailsValue.length}/1000
                </div>
                {reportForm.formState.errors.details ? (
                  <p className="text-xs font-medium text-red-500">
                    {reportForm.formState.errors.details.message}
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmittingReport}>
                  {isSubmittingReport ? "Enviando..." : "Enviar denúncia"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
