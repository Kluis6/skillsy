/** wa.me link for a Brazilian number typed in any format; adds the 55 country
 * code when missing. Returns null when there are no digits. */
export function whatsappUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Domestic numbers can also start with 55, the area code for part of RS.
  const hasCountryCode = digits.startsWith("55") && digits.length >= 12;
  const number = hasCountryCode ? digits : `55${digits}`;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
