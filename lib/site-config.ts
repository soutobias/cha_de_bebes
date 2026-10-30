export type SiteVariant = "br" | "uk";

export const UK_GIFT_LIST_URL =
  "https://www.amazon.co.uk/baby-reg/vanessa-rodrigues-november-2026-liverpool/37MCPW5EP469F";
export const UK_CONFIRMATION_URL = "https://forms.gle/GcwYR5CktKobe28S8";

export function getSiteVariantFromHost(host: string | null): SiteVariant {
  const hostname = host?.split(":")[0].toLowerCase();
  return hostname === "uk.tonessa.baby" || hostname === "uk.localhost"
    ? "uk"
    : "br";
}
