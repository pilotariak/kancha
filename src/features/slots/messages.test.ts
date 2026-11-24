import type { SessionSummary } from "@/api/pik-client";
import { createInstance } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import { dateNames, type Translate } from "./format";
import { messageText, outcomeMessage, reminderMessage } from "./messages";

const LOCALES = { en, fr, es, eu } as const;

function translate(lng: keyof typeof LOCALES): Translate {
  const instance = createInstance();
  void instance.init({
    lng,
    resources: { [lng]: { translation: LOCALES[lng] } },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance.t.bind(instance) as Translate;
}

// Thursday 26 November 2026, answers until Wednesday 25 at 20:00 in Paris (19:00 UTC).
const session = (changes: Partial<SessionSummary> = {}): SessionSummary => ({
  date: "2026-11-26",
  starts_at: "2026-11-26T19:00:00Z",
  deadline: "2026-11-25T19:00:00Z",
  deadline_passed: false,
  state: "missing",
  missing: 1,
  min_players: 4,
  places: 6,
  cancelled: false,
  counts: { ok: 3, dispo: 1, ko: 2, none: 2 },
  my_answer: "ok",
  ...changes,
});

const SLOT = "Jeudi soir";
const CODE = "K7Q2M9XP";

describe("reminderMessage (Relancer)", () => {
  it("writes the issue's French example, the invite link last", () => {
    const t = translate("fr");
    const message = reminderMessage(t, dateNames(t), {
      slotName: SLOT,
      session: session(),
      inviteCode: CODE,
    });
    expect(message.url).toBe("https://kancha.pilotariak.com/slot/join?code=K7Q2M9XP");
    expect(messageText(message)).toBe(
      [
        "Jeudi soir · jeu. 26 nov.",
        "3 OK, il en faut 4",
        "Réponds avant mercredi 20h :",
        "https://kancha.pilotariak.com/slot/join?code=K7Q2M9XP",
      ].join("\n"),
    );
  });

  it("counts the places left once the game is on", () => {
    const t = translate("fr");
    const names = dateNames(t);
    const on = (ok: number) =>
      reminderMessage(t, names, {
        slotName: SLOT,
        session: session({ state: "on", missing: 0, counts: { ok, dispo: 0, ko: 0, none: 0 } }),
        inviteCode: CODE,
      }).text.split("\n")[1];
    expect(on(4)).toBe("4 OK, encore 2 places");
    expect(on(5)).toBe("5 OK, encore 1 place");
    expect(on(6)).toBe("6 OK, complet");
  });

  it.each(
    [
      ["en", "3 OK, 4 needed", "Answer before Wednesday 20:00:"],
      ["es", "3 OK, hacen falta 4", "Responde antes del miércoles 20:00:"],
      ["eu", "3 Bai, 4 behar dira", "Erantzun asteazkena 20:00 baino lehen:"],
    ] as const,
  )("writes it in %s", (lng, count, before) => {
    const t = translate(lng);
    const lines = reminderMessage(t, dateNames(t), {
      slotName: SLOT,
      session: session(),
      inviteCode: CODE,
    }).text.split("\n");
    expect(lines.slice(1)).toEqual([count, before]);
  });
});

describe("outcomeMessage (Prévenir)", () => {
  it("writes the issue's French example for a session cancelled at the deadline", () => {
    const t = translate("fr");
    const message = outcomeMessage(t, dateNames(t), {
      slotName: SLOT,
      session: session({ state: "cancelled_short", deadline_passed: true, missing: 0 }),
      next: { date: "2026-12-10" },
    });
    expect(message).toEqual({
      text: [
        "Jeudi soir · jeu. 26 nov.",
        "Annulée : 3 OK à la date limite",
        "Prochaine séance : jeu. 10 déc.",
      ].join("\n"),
    });
    expect(message && messageText(message)).toBe(message?.text);
  });

  it("announces the game with its free places", () => {
    const t = translate("fr");
    const names = dateNames(t);
    const on = (ok: number) =>
      outcomeMessage(t, names, {
        slotName: SLOT,
        session: session({ state: "on", missing: 0, counts: { ok, dispo: 0, ko: 0, none: 0 } }),
        next: { date: "2026-12-10" },
      })?.text.split("\n");
    expect(on(4)).toEqual(["Jeudi soir · jeu. 26 nov.", "Assurée : 4 OK, 2 places libres"]);
    expect(on(6)?.[1]).toBe("Assurée : 6 OK, complet");
  });

  it("announces a cancelled date, without a next session at the end of the season", () => {
    const t = translate("fr");
    expect(
      outcomeMessage(t, dateNames(t), {
        slotName: SLOT,
        session: session({ state: "cancelled", cancelled: true, missing: 0 }),
        next: null,
      })?.text,
    ).toBe("Jeudi soir · jeu. 26 nov.\nAnnulée");
  });

  it("has nothing to say while players are missing or Dispo answers may complete", () => {
    const t = translate("fr");
    const names = dateNames(t);
    for (const state of ["missing", "to_complete"] as const) {
      expect(
        outcomeMessage(t, names, { slotName: SLOT, session: session({ state }), next: null }),
      ).toBeNull();
    }
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])("writes every line in %s", (lng) => {
    const t = translate(lng);
    const names = dateNames(t);
    for (const state of ["on", "cancelled_short", "cancelled"] as const) {
      const text = outcomeMessage(t, names, {
        slotName: SLOT,
        session: session({ state }),
        next: { date: "2026-12-10" },
      })?.text;
      expect(text).toBeTruthy();
      expect(text).not.toMatch(/slot\.session_message|\{\{/);
    }
  });
});
