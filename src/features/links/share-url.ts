import { SITE_URL } from "@/constants/site";

/**
 * The public web address of an app path, for Share and Copy link. Route groups such as
 * `(tabs)` are not part of a URL: `/(tabs)/competitions/details?id=1` is served at
 * `/competitions/details?id=1`.
 */
export function shareUrl(path: string): string {
  return SITE_URL + path.replace(/\/\([^/?#]+\)(?=[/?#]|$)/g, "");
}
