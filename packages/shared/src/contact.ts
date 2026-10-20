/** wa.me link for a Brazilian number typed in any format; adds the 55 country
 * code when missing. Returns null when there are no digits. */
export function whatsappUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
