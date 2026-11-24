import { redirectSystemPath } from "@/app/+native-intent";

import {
  inviteUrl,
  isPikToken,
  normalizeInviteCode,
  paramOf,
  parseSlotLink,
  personalUrl,
  recoveryUrl,
  slotLinkPath,
  tokenOfFragment,
} from "./links";
import { clearSecret, holdSecret, readSecret } from "./pending-secret";

// 52 lowercase base32 characters, the shape of a pik token.
const TOKEN = "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst";

describe("normalizeInviteCode", () => {
  it("takes a code in any case, with spaces or dashes", () => {
    expect(normalizeInviteCode("k7q2m9xp")).toBe("K7Q2M9XP");
    expect(normalizeInviteCode(" K7Q2 M9XP ")).toBe("K7Q2M9XP");
    expect(normalizeInviteCode("K7Q2-M9XP")).toBe("K7Q2M9XP");
  });

  it("takes the code out of a pasted invite link", () => {
    expect(normalizeInviteCode("https://kancha.pilotariak.com/slot/join?code=k7q2m9xp")).toBe(
      "K7Q2M9XP",
    );
    expect(normalizeInviteCode("kancha.pilotariak.com/slot/join?x=1&code=K7Q2M9XP#top")).toBe(
      "K7Q2M9XP",
    );
  });

  it("refuses what cannot be a code: length, 0, O, 1 or I", () => {
    expect(normalizeInviteCode("K7Q2M9X")).toBeNull();
    expect(normalizeInviteCode("K7Q2M9XPA")).toBeNull();
    expect(normalizeInviteCode("K7Q2M9X0")).toBeNull();
    expect(normalizeInviteCode("K7Q2M9XO")).toBeNull();
    expect(normalizeInviteCode("K7Q2M9X1")).toBeNull();
    expect(normalizeInviteCode("K7Q2M9XI")).toBeNull();
    expect(normalizeInviteCode("https://kancha.pilotariak.com/slot/join")).toBeNull();
    expect(normalizeInviteCode("")).toBeNull();
    expect(normalizeInviteCode(undefined)).toBeNull();
  });
});

describe("tokens", () => {
  it("accepts the shape of a pik token only", () => {
    expect(isPikToken(TOKEN)).toBe(true);
    expect(isPikToken(TOKEN.toUpperCase())).toBe(false);
    expect(isPikToken(TOKEN.slice(1))).toBe(false);
    expect(isPikToken(`${TOKEN.slice(1)}0`)).toBe(false);
    expect(isPikToken(null)).toBe(false);
  });

  it("reads t= from a fragment, with or without its #", () => {
    expect(tokenOfFragment(`#t=${TOKEN}`)).toBe(TOKEN);
    expect(tokenOfFragment(`t=${TOKEN}`)).toBe(TOKEN);
    expect(tokenOfFragment(`#x=1&t=${TOKEN}`)).toBe(TOKEN);
    expect(tokenOfFragment("#t=short")).toBeNull();
    expect(tokenOfFragment("")).toBeNull();
  });

  it("reads a malformed escape as no value", () => {
    expect(paramOf("code=%E0%A4%A", "code")).toBeNull();
    expect(paramOf("a=1&code=K7Q2M9XP", "code")).toBe("K7Q2M9XP");
  });
});

describe("share URLs", () => {
  it("puts the invite code in the query of the Kancha site", () => {
    expect(inviteUrl("K7Q2M9XP")).toBe("https://kancha.pilotariak.com/slot/join?code=K7Q2M9XP");
  });

  it("puts the secrets in the fragment, never in the path or the query", () => {
    expect(personalUrl(TOKEN)).toBe(`https://kancha.pilotariak.com/slot/me#t=${TOKEN}`);
    expect(recoveryUrl(TOKEN)).toBe(`https://kancha.pilotariak.com/slot/recover#t=${TOKEN}`);
    for (const url of [personalUrl(TOKEN), recoveryUrl(TOKEN)]) {
      expect(url.split("#")[0]).not.toContain(TOKEN);
    }
  });
});

describe("parseSlotLink", () => {
  it.each([
    "https://kancha.pilotariak.com/slot/join?code=k7q2m9xp",
    "https://kancha.pilotariak.com/slot/join/?code=K7Q2M9XP",
    "kancha://slot/join?code=K7Q2M9XP",
    "kancha:///slot/join?code=K7Q2M9XP",
    "exp://192.168.1.2:8081/--/slot/join?code=K7Q2M9XP",
    "/slot/join?code=K7Q2M9XP",
  ])("reads the invite link %s", (url) => {
    expect(parseSlotLink(url)).toEqual({ kind: "join", code: "K7Q2M9XP" });
  });

  it("keeps a join link without a valid code, for the code screen", () => {
    expect(parseSlotLink("https://kancha.pilotariak.com/slot/join")).toEqual({
      kind: "join",
      code: null,
    });
    expect(parseSlotLink("kancha://slot/join?code=nope")).toEqual({ kind: "join", code: null });
  });

  it("reads the token of a personal or recovery link from its fragment", () => {
    expect(parseSlotLink(`https://kancha.pilotariak.com/slot/me#t=${TOKEN}`)).toEqual({
      kind: "me",
      token: TOKEN,
    });
    expect(parseSlotLink(`kancha://slot/recover#t=${TOKEN}`)).toEqual({
      kind: "recover",
      token: TOKEN,
    });
  });

  it("ignores a token in the query", () => {
    expect(parseSlotLink(`https://kancha.pilotariak.com/slot/me?t=${TOKEN}`)).toEqual({
      kind: "me",
      token: null,
    });
  });

  it("returns null for any other path or site", () => {
    expect(parseSlotLink("https://kancha.pilotariak.com/competitions/details?id=1")).toBeNull();
    expect(parseSlotLink("https://example.com/slot/join?code=K7Q2M9XP")).toBeNull();
    expect(parseSlotLink("kancha://")).toBeNull();
    expect(parseSlotLink("exp+kancha://expo-development-client/?url=x")).toBeNull();
    expect(parseSlotLink("https://kancha.pilotariak.com/slot")).toBeNull();
  });

  it("gives app paths without the secret", () => {
    expect(slotLinkPath({ kind: "join", code: "K7Q2M9XP" })).toBe("/slot/join?code=K7Q2M9XP");
    expect(slotLinkPath({ kind: "join", code: null })).toBe("/slot/join");
    expect(slotLinkPath({ kind: "me", token: TOKEN })).toBe("/slot/me");
    expect(slotLinkPath({ kind: "recover", token: TOKEN })).toBe("/slot/recover");
  });
});

describe("pending secret", () => {
  afterEach(() => {
    clearSecret("me");
    clearSecret("recover");
  });

  it("keeps one secret for its kind until it is cleared", () => {
    holdSecret("me", TOKEN);
    expect(readSecret("recover")).toBeNull();
    expect(readSecret("me")).toBe(TOKEN);
    expect(readSecret("me")).toBe(TOKEN);
    clearSecret("recover");
    expect(readSecret("me")).toBe(TOKEN);
    clearSecret("me");
    expect(readSecret("me")).toBeNull();
  });
});

describe("redirectSystemPath (+native-intent)", () => {
  afterEach(() => {
    clearSecret("me");
    clearSecret("recover");
  });

  it("opens the join screen with its code", () => {
    expect(
      redirectSystemPath({
        path: "https://kancha.pilotariak.com/slot/join?code=k7q2m9xp",
        initial: true,
      }),
    ).toBe("/slot/join?code=K7Q2M9XP");
  });

  it("keeps the token in memory and out of the path", () => {
    const path = redirectSystemPath({
      path: `https://kancha.pilotariak.com/slot/recover#t=${TOKEN}`,
      initial: false,
    });
    expect(path).toBe("/slot/recover");
    expect(readSecret("recover")).toBe(TOKEN);
  });

  it("sends every other link to the start, as before", () => {
    expect(
      redirectSystemPath({
        path: "https://kancha.pilotariak.com/competitions/details?id=1",
        initial: true,
      }),
    ).toBe("/");
    expect(redirectSystemPath({ path: "kancha://", initial: true })).toBe("/");
  });
});
