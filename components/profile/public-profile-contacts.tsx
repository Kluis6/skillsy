import { Globe } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { whatsappUrl } from "@skillsy/shared/contact";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import type { UserProfile } from "@skillsy/shared/types";
import { buttonVariants } from "@/components/ui/button";

type PublicContacts = Pick<UserProfile, "whatsapp" | "phone" | "instagram" | "facebook" | "linkedin" | "website">;

function webLink(value?: string) {
  const text = value?.trim();
  if (!text) return null;

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`);
    const isWebUrl = url.protocol === "https:" || url.protocol === "http:";
    return isWebUrl && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function PublicProfileContacts({ profile, t }: { profile: PublicContacts; t: TranslateFn }) {
  const whatsapp = profile.whatsapp?.trim();
  const phone = profile.phone?.trim();
  const phoneDigits = phone?.replace(/\D/g, "");
  const instagram = profile.instagram?.trim().replace(/^@/, "");
  const contacts = [
    {
      id: "whatsapp",
      href: whatsapp ? whatsappUrl(whatsapp) : null,
      text: whatsapp,
      label: t("profile.whatsapp"),
      icon: <FaWhatsapp aria-hidden="true" className="text-success" />,
    },
    {
      id: "phone",
      href: phoneDigits ? `tel:${phone?.startsWith("+") ? "+" : ""}${phoneDigits}` : null,
      text: phone,
      sameWindow: true,
      icon: <FaPhone aria-hidden="true" className="text-primary" />,
    },
    {
      id: "instagram",
      href: instagram ? `https://instagram.com/${encodeURIComponent(instagram)}` : null,
      text: profile.instagram,
      icon: <FaInstagram aria-hidden="true" className="text-pink-600" />,
    },
    { id: "facebook", href: webLink(profile.facebook), text: profile.facebook, icon: <FaFacebookF aria-hidden="true" className="text-blue-600" /> },
    { id: "linkedin", href: webLink(profile.linkedin), text: profile.linkedin, icon: <FaLinkedinIn aria-hidden="true" className="text-sky-700" /> },
    { id: "website", href: webLink(profile.website), text: profile.website, icon: <Globe aria-hidden="true" className="text-primary" /> },
  ].filter((contact) => contact.href);

  if (contacts.length === 0) return null;

  return (
    <section aria-labelledby="public-profile-contacts" className="border-y border-border-subtle bg-card">
      <div className="container mx-auto space-y-4 p-4">
        <h2 id="public-profile-contacts" className="text-base font-semibold text-text-main md:text-xl">
          {t("profile.contactAndSocial")}
        </h2>
        <ul className="space-y-3">
          {contacts.map(({ id, href, text, icon, label, sameWindow }) => (
            <li key={id}>
              <a
                href={href ?? undefined}
                target={sameWindow ? undefined : "_blank"}
                rel={sameWindow ? undefined : "noopener noreferrer"}
                className={buttonVariants({
                  variant: "outline",
                  className: "h-auto min-h-11 w-full justify-start gap-3 border-border-subtle bg-surface px-3 py-2.5 text-left whitespace-normal text-text-main hover:border-primary/30 dark:bg-surface",
                })}
              >
                {icon}
                {label && <span className="sr-only">{label} </span>}
                <span className="min-w-0 wrap-anywhere">{text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
