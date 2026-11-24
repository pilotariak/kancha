import { parseSlotLink, slotLinkPath } from "@/features/slots/links";
import { holdSecret } from "@/features/slots/pending-secret";

/**
 * Where a link that opens the app lands (universal links, App Links, `kancha://`). The slot links
 * reach their screens: the invite link (`/slot/join?code=…`), the personal link (`/slot/me#t=…`)
 * and the recovery link (`/slot/recover#t=…`). Their token stays in memory for the screen and
 * out of the route, where the fragment would become a param. Every other path opens the app at
 * its start, as before.
 */
export function redirectSystemPath({
  path,
  initial: _initial,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    const link = parseSlotLink(path);
    if (!link) return "/";
    if (link.kind !== "join" && link.token) holdSecret(link.kind, link.token);
    return slotLinkPath(link);
  } catch {
    return "/";
  }
}
