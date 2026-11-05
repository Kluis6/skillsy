"use client";

import Link from "@/lib/i18n/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag, Pencil, Share2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { REPORT_REASON_OPTIONS } from "@/lib/reporting";
import { reportPostSchema, type ReportPostFormData } from "@/lib/validations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT, useValidationMessage } from "@/lib/i18n/provider";
import { useLabels } from "@/lib/i18n/labels";

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
  const t = useT();
  const labels = useLabels();
  const tv = useValidationMessage();
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
  const shareUrl =
    typeof window === "undefined"
      ? `/artigosevagas/${post.slug}`
      : `${window.location.origin}/artigosevagas/${post.slug}`;
  const canUseNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;
  const containerClassName = compact
    ? "flex justify-between items-center gap-2"
    : "flex justify-between items-center gap-3";

  const handleDelete = () => {
    if (!isOwnPost || !post.id) {
      return;
    }

    const confirmed = window.confirm(t("posts.deleteConfirm"));

    if (!confirmed) {
      return;
    }

    startDeleting(async () => {
      try {
        await PostService.deleteOwnPost(post.id!);
        toast.success(t("posts.deleted"));

        if (redirectOnDelete) {
          router.push(redirectOnDelete);
          return;
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(t("posts.deleteError"));
      }
    });
  };

  const handleReportSubmit = (data: ReportPostFormData) => {
    if (!user) {
      toast.error(t("posts.loginRequired"), {
        description: t("posts.loginToReport"),
      });
      return;
    }

    if (!post.id) {
      toast.error(t("posts.invalidPost"));
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
        toast.success(t("posts.reportSent"));
        reportForm.reset({
          reason: "informacao_falsa",
          details: "",
        });
        setReportDialogOpen(false);
      } catch (error) {
        console.error(error);
        toast.error(t("posts.reportError"));
      }
    });
  };

  const reportReasonOptions = useMemo(
    () =>
      REPORT_REASON_OPTIONS.map((reason) => ({
        value: reason,
        label: labels.reason(reason),
      })),
    [labels],
  );

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("posts.linkCopied"), {
        description: t("posts.linkCopiedText"),
      });
    } catch {
      toast.error(t("posts.copyError"));
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;

    if (canUseNativeShare) {
      try {
        await navigator.share({
          title: post.title,
          text:
            post.category === "job"
              ? t("posts.shareJob", { title: post.title })
              : t("posts.sharePost", { title: post.title }),
          url: shareUrl,
        });
        return;
      } catch {
        // Usuario cancelou ou o navegador bloqueou a acao.
      }
    }

    await handleCopyLink();
  };

  return (
    <div className={`${containerClassName} w-full`}>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={handleShare}
      >
        <Share2 size={16} className="mr-2" />
        {t("posts.share")}
      </Button>

      {isOwnPost && post.id ? (
        <div className="space-x-2 flex">
          <Button
            render={<Link href={`/meus-artigos/${post.id}/editar`} />}
            nativeButton={false}
            variant="outline"
            size={compact ? "sm" : "default"}
          >
            <Pencil size={16} className="sm:mr-2" />
            <p className="hidden sm:flex"> {t("posts.edit")}</p>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size={compact ? "sm" : "default"}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 size={16} className="sm:mr-2" />
            <p className="hidden sm:flex"> {isDeleting ? t("posts.deleting") : t("posts.delete")}</p>
          </Button>
        </div>
      ) : null}

      {canReport ? (
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger
            render={
              <Button variant="destructive" size={compact ? "sm" : "default"} />
            }
          >
            <Flag size={16} className="mr-2" />
            {t("posts.report")}
          </DialogTrigger>
          <DialogContent className="md:w-fit md:h-auto">
            <DialogHeader>
              <DialogTitle>{t("posts.reportTitle")}</DialogTitle>
              <DialogDescription>
                {t("posts.reportText")}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={reportForm.handleSubmit(handleReportSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="post-report-reason">{t("posts.reason")}</Label>
                <Controller
                  control={reportForm.control}
                  name="reason"
                  render={({ field }) => (
                    <Select
                      items={reportReasonOptions}
                      name={field.name}
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                    >
                      <SelectTrigger
                        id="post-report-reason"
                        ref={field.ref}
                        onBlur={field.onBlur}
                        aria-invalid={Boolean(reportForm.formState.errors.reason)}
                        className="h-10 w-full px-3 text-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportReasonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {reportForm.formState.errors.reason ? (
                  <p className="text-xs font-medium text-destructive">
                    {tv(reportForm.formState.errors.reason.message)}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-report-details">{t("posts.details")}</Label>
                <Textarea
                className="w-full h-full placeholder:text-sm"
                  id="post-report-details"
                  rows={5}
                  placeholder={t("posts.detailsPlaceholder")}
                  {...reportForm.register("details")}
                />
                <div className="text-right text-xs text-text-muted">
                  {reportDetailsValue.length}/1000
                </div>
                {reportForm.formState.errors.details ? (
                  <p className="text-xs font-medium text-destructive">
                    {tv(reportForm.formState.errors.details.message)}
                  </p>
                ) : null}
              </div>

              <DialogFooter className="">
                <Button className="h-10 w-full" type="submit" disabled={isSubmittingReport}>
                  {isSubmittingReport ? t("posts.sending") : t("posts.sendReport")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
