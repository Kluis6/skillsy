"use client";

import { useId, useState } from "react";
import { Flag } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useLabels } from "@/lib/i18n/labels";
import { useT, useValidationMessage } from "@/lib/i18n/provider";
import { REPORT_REASON_OPTIONS } from "@/lib/reporting";
import { reportUserSchema, type ReportUserFormData } from "@/lib/validations";
import { UserService } from "@/services/user-service";

export function PublicReportButton({ ownerId, ownerName, companyName }: {
  ownerId: string;
  ownerName: string;
  companyName?: string;
}) {
  const { user } = useAuth();
  const t = useT();
  const tv = useValidationMessage();
  const labels = useLabels();
  const title = t(companyName ? "products.reportCompany" : "profile.reportProfile");
  const reasonId = useId();
  const detailsId = useId();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

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

  const handleSubmitReport = async (data: ReportUserFormData) => {
    if (!user) {
      toast.error(t("profile.loginRequired"), {
        description: t("profile.loginToReport"),
      });
      return;
    }

    if (user.uid === ownerId) {
      toast.error(t("profile.invalidAction"), {
        description: t("profile.cantReportSelf"),
      });
      return;
    }

    try {
      await UserService.submitUserReport({
        reportedUserId: ownerId,
        reportedUserName: ownerName,
        reportedCompanyName: companyName,
        reason: data.reason,
        details: data.details?.trim(),
      });

      toast.success(t("profile.reportSent"), {
        description: t("profile.reportSentText"),
      });
      reportForm.reset({
        reason: "informacao_falsa",
        details: "",
      });
      setReportDialogOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(t("profile.reportError"));
    }
  };

  if (!user || user.uid === ownerId) return null;

  return (
    <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="destructive"
              size="icon-lg"
              aria-label={title}
              onClick={() => setReportDialogOpen(true)}
            />
          }
        >
          <Flag className="text-destructive" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md sm:h-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t(companyName ? "products.reportCompanyText" : "profile.reportText")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={reportForm.handleSubmit(handleSubmitReport)}
          className="space-y-4"
        >
          <div className="border border-warning-border bg-warning-surface px-4 py-3 text-xs text-warning-foreground">
            {t("profile.reportWarning")}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={reasonId}
              className="text-sm font-medium text-text-main"
            >
              {t("profile.reason")}
            </Label>
            <Controller
              control={reportForm.control}
              name="reason"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries(REPORT_REASON_OPTIONS.map((reason) => [reason, labels.reason(reason)]))}
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger
                    id={reasonId}
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
                        {labels.reason(reason)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {reportForm.formState.errors.reason && (
              <p className="text-xs font-bold text-destructive">
                {tv(reportForm.formState.errors.reason.message)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={detailsId}
              className="text-sm font-medium text-text-main"
            >
              {t("profile.details")}
            </Label>
            <Textarea
              id={detailsId}
              {...reportForm.register("details")}
              placeholder={t("profile.detailsPlaceholder")}
              maxLength={1000}
              className="min-h-28"
            />
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{t("profile.detailsHint")}</span>
              <span>{(reportDetails || "").length}/1000</span>
            </div>
            {reportForm.formState.errors.details && (
              <p className="text-xs font-bold text-destructive">
                {tv(reportForm.formState.errors.details.message)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              size="lg"
              variant="default"
              className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-medium"
              disabled={reportForm.formState.isSubmitting}
            >
              {reportForm.formState.isSubmitting
                ? t("profile.sending")
                : t("profile.sendReport")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
