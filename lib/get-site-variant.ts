import { headers } from "next/headers";
import { getSiteVariantFromHost } from "./site-config";

export async function getSiteVariant() {
  const requestHeaders = await headers();
  return getSiteVariantFromHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
}
