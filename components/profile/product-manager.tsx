"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { deleteObject, ref } from "firebase/storage";
import { toast } from "sonner";
import { ProductCard } from "@/components/profile/product-card";
import { ProductGridLoading } from "@/components/profile/product-catalog-loading";
import { ProfileToolbar } from "@/components/profile/profile-toolbar";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, PageHeader } from "@/components/ui/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { auth, storage } from "@/lib/firebase";
import { uploadImageFile } from "@/lib/image-upload";
import Link from "@/lib/i18n/navigation";
import { useLocale, useT } from "@/lib/i18n/provider";
import {
  MAX_PRODUCTS, PRODUCT_DESCRIPTION_LIMIT, PRODUCT_NAME_LIMIT, parseProductPrice,
  type CatalogProduct, type ProductDetails,
} from "@/lib/product-catalog";
import { CatalogError, ProductService } from "@/services/product-service";
import { isActiveProvider } from "@/services/user-service";

async function removeImage(uid: string, imageName: string) {
  try {
    await deleteObject(ref(storage, `users/${uid}/products/${imageName}`));
  } catch (error) {
    console.error("Could not remove catalog image", error);
  }
}

function ProductManagerLayout({ action, children }: { action?: ReactNode; children: ReactNode }) {
  const t = useT();

  return (
    <>
      <ProfileToolbar backHref="/profile" backLabel={t("products.back")}>{action}</ProfileToolbar>
      <main className="container mx-auto w-full px-4 pb-6">
        <PageHeader title={t("products.manage")} description={t("products.manageDescription")} />
        {children}
      </main>
    </>
  );
}

export function ProductManager() {
  const { user, profile, loading } = useAuth();
  const t = useT();

  if (loading) {
    return (
      <ProductManagerLayout action={<Skeleton className="h-10 w-36" />}>
        <ProductGridLoading />
      </ProductManagerLayout>
    );
  }

  if (user && profile?.uid === user.uid && isActiveProvider(profile)) {
    return <CatalogEditor key={user.uid} uid={user.uid} />;
  }

  return (
    <ProductManagerLayout>
      <EmptyState
        title={t(user ? "products.providerRequired" : "products.signIn")}
        action={!user && (
          <Link href="/signin" className={buttonVariants()}>{t("common.signIn")}</Link>
        )}
      />
    </ProductManagerLayout>
  );
}

function CatalogEditor({ uid }: { uid: string }) {
  const locale = useLocale();
  const t = useT();
  const [items, setItems] = useState<CatalogProduct[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [editor, setEditor] = useState<{ product?: CatalogProduct } | null>(null);
  const [deleting, setDeleting] = useState<CatalogProduct | null>(null);
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => ProductService.watch(uid, setItems, () => setLoadFailed(true)), [uid, loadAttempt]);

  function openEditor(product?: CatalogProduct) {
    setErrorMessage("");
    setEditor({ product });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items || !editor || working || auth.currentUser?.uid !== uid) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const priceCents = parseProductPrice(String(form.get("price") ?? ""));
    const selectedFile = form.get("photo");
    const file = selectedFile instanceof File && selectedFile.name ? selectedFile : null;
    const oldImage = editor.product?.imageName;
    let imageName = form.has("removePhoto") ? undefined : oldImage;

    if (!name || !description) return setErrorMessage(t("products.requiredError"));
    if (Number.isNaN(priceCents)) return setErrorMessage(t("products.priceError"));
    if (file && (!file.size || !/^image\/(jpeg|png|webp)$/.test(file.type))) {
      return setErrorMessage(t("products.photoError"));
    }

    setWorking(true);
    setErrorMessage("");
    let uploadedImage: string | undefined;
    try {
      if (file) {
        uploadedImage = (await uploadImageFile(file, "products")).name;
        imageName = uploadedImage;
      }
      const details: ProductDetails = { name, description };
      if (priceCents !== undefined) details.priceCents = priceCents;
      if (imageName) details.imageName = imageName;
      await ProductService.save(uid, details, items, editor.product);
      if (oldImage && oldImage !== imageName) void removeImage(uid, oldImage);
      setEditor(null);
      toast.success(t("products.saved"));
    } catch (error) {
      // A transaction rejected for a conflict or by the rules cannot reference the upload.
      if (uploadedImage && (error instanceof CatalogError ||
          (error instanceof Error && "code" in error && error.code === "permission-denied"))) {
        void removeImage(uid, uploadedImage);
      }
      setErrorMessage(t(error instanceof CatalogError
        ? error.reason === "limit" ? "products.limit" : "products.staleError"
        : "products.saveError", { limit: MAX_PRODUCTS }));
    } finally {
      setWorking(false);
    }
  }

  async function remove() {
    if (!deleting || working) return;
    setWorking(true);
    setErrorMessage("");
    try {
      await ProductService.remove(uid, deleting);
      if (deleting.imageName) void removeImage(uid, deleting.imageName);
      setDeleting(null);
      toast.success(t("products.deleted"));
    } catch (error) {
      setErrorMessage(t(error instanceof CatalogError ? "products.staleError" : "products.deleteError"));
    } finally {
      setWorking(false);
    }
  }

  const full = (items?.length ?? 0) >= MAX_PRODUCTS;
  const originalPrice = editor?.product?.priceCents;

  return (
    <ProductManagerLayout
      action={!loadFailed && (items ? (
          <Button type="button" onClick={() => openEditor()} disabled={full}>
            <Plus aria-hidden="true" /> {t("products.add")}
          </Button>
        ) : <Skeleton className="h-10 w-36" />)}
    >
      {loadFailed ? (
        <EmptyState
          title={t("products.loadError")}
          action={<Button variant="outline" onClick={() => {
            setItems(null);
            setLoadFailed(false);
            setLoadAttempt((attempt) => attempt + 1);
          }}>{t("products.retry")}</Button>}
        />
      ) : items ? (
        <>
          <p className="mb-4 text-sm text-text-muted" aria-live="polite">
            {full ? t("products.limit", { limit: MAX_PRODUCTS })
              : t("products.count", { count: items.length, limit: MAX_PRODUCTS })}
          </p>
          {items.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <li key={product.id}>
                  <ProductCard uid={uid} product={product} locale={locale} actions={
                    <>
                      <Button size="sm" variant="outline" onClick={() => openEditor(product)}>
                        {t("products.edit")} <span className="sr-only">{product.name}</span>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setErrorMessage("");
                        setDeleting(product);
                      }}>
                        {t("products.delete")} <span className="sr-only">{product.name}</span>
                      </Button>
                    </>
                  } />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("products.empty")} description={t("products.emptyDescription")} />
          )}
        </>
      ) : <ProductGridLoading />}

      <Dialog open={editor !== null} onOpenChange={(open) => {
        if (!open && !working) setEditor(null);
      }}>
        {editor && (
          <DialogContent showCloseButton={false} className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t(editor.product ? "products.editTitle" : "products.add")}</DialogTitle>
              <DialogDescription>{t("products.manageDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <fieldset disabled={working} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">{t("products.name")}</Label>
                  <Input id="product-name" name="name" required maxLength={PRODUCT_NAME_LIMIT}
                    defaultValue={editor.product?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">{t("products.description")}</Label>
                  <Textarea id="product-description" name="description" required rows={4}
                    maxLength={PRODUCT_DESCRIPTION_LIMIT} defaultValue={editor.product?.description} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">{t("products.price")}</Label>
                  <Input id="product-price" name="price" inputMode="decimal" maxLength={10}
                    defaultValue={originalPrice === undefined ? "" : (originalPrice / 100).toFixed(2)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-photo">{t("products.photo")}</Label>
                  <Input id="product-photo" name="photo" type="file" aria-describedby="product-photo-help"
                    accept="image/jpeg,image/png,image/webp" />
                  <p id="product-photo-help" className="text-text-muted">{t("products.photoHelp")}</p>
                  {editor.product?.imageName && (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="removePhoto" /> {t("products.removePhoto")}
                    </label>
                  )}
                </div>
              </fieldset>
              {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" disabled={working} onClick={() => setEditor(null)}>
                  {t("products.cancel")}
                </Button>
                <Button type="submit" disabled={working}>{t(working ? "products.saving" : "products.save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => {
        if (!open && !working) setDeleting(null);
      }}>
        {deleting && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("products.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("products.deleteDescription", { name: deleting.name })}</AlertDialogDescription>
            </AlertDialogHeader>
            {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
            <AlertDialogFooter>
              <Button variant="outline" disabled={working} onClick={() => setDeleting(null)}>{t("products.cancel")}</Button>
              <Button variant="destructive" disabled={working} onClick={remove}>
                {t(working ? "products.deleting" : "products.delete")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ProductManagerLayout>
  );
}
