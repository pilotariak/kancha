import type { SlotCard, SlotDetail } from "@/api/pik-client";

import {
  canAddName,
  candidateSlots,
  isSlotOfCode,
  memberActions,
  myName,
  nameKey,
  nameProblem,
  nothingToPick,
  suggestCoOrganizer,
} from "./join";

const FREE = [
  { member_id: "m_peio", name: "Peio" },
  { member_id: "m_eneko", name: "Énéko" },
];

describe("nameProblem", () => {
  it("accepts a new name", () => {
    expect(nameProblem("  Maite  ", FREE)).toBeUndefined();
  });

  it("asks for a name", () => {
    expect(nameProblem("   ", FREE)).toEqual({ code: "required" });
  });

  it("counts characters, not UTF-16 units, up to 40", () => {
    expect(nameProblem("é".repeat(40), FREE)).toBeUndefined();
    expect(nameProblem("😀".repeat(40), FREE)).toBeUndefined();
    expect(nameProblem("a".repeat(41), FREE)).toEqual({ code: "too_long", max: 40 });
  });

  it("points to a free name typed again, whatever its case or form", () => {
    expect(nameProblem("peio", FREE)).toEqual({ code: "in_list", memberId: "m_peio" });
    // "É" written as E and a combining acute accent: the same name in NFC.
    expect(nameProblem("E\u0301ne\u0301ko", FREE)).toEqual({
      code: "in_list",
      memberId: "m_eneko",
    });
  });

  it("compares as pik does: white space collapsed, lowercase, NFC", () => {
    expect(nameKey("  Jean   Pierre ")).toBe("jean pierre");
  });
});

describe("list state", () => {
  it("lets a player add a name only while the list is open", () => {
    expect(canAddName({ list_closed: false })).toBe(true);
    expect(canAddName({ list_closed: true })).toBe(false);
  });

  it("has nothing to pick when the list is closed and every name taken", () => {
    expect(nothingToPick({ list_closed: true, free_names: [] })).toBe(true);
    expect(nothingToPick({ list_closed: true, free_names: FREE })).toBe(false);
    expect(nothingToPick({ list_closed: false, free_names: [] })).toBe(false);
  });
});

/** Slot ids as pik writes them: UUID v7. */
const SLOT_ID_1 = "01a216ce-e9ef-702d-af5d-a04307776c1b";
const SLOT_ID_2 = "01a216ce-e9f6-75ae-85fd-f45ff0cd5526";
const SLOT_ID_3 = "01a216ce-e9fa-7667-a01e-7b5d3204e6e5";
const SLOT_ID_4 = "01a216ce-e9fd-740a-9265-2fba94195dcc";

const card = (id: string, name: string, weekday = 3, time = "18:00") =>
  ({
    id,
    name,
    member_id: `m_${id}`,
    role: "player",
    venue: "Trinquet Moderne",
    court: "trinquet",
    specialty: "gomme_creuse",
    schedule: { weekday, time_from: time, interval_weeks: 1 },
  }) as SlotCard;

describe("recognized slot", () => {
  const preview = { name: "Mercredi soir", weekday: 3, time_from: "18:00" };

  it("narrows the device's slots on the name, the weekday and the time", () => {
    const slots = [
      card(SLOT_ID_1, "Mercredi soir"),
      card(SLOT_ID_2, "Mercredi soir", 4),
      card(SLOT_ID_3, "Mercredi soir", 3, "19:00"),
      card(SLOT_ID_4, "Jeudi"),
    ];
    expect(candidateSlots(slots, preview).map((slot) => slot.id)).toEqual([SLOT_ID_1]);
  });

  it("settles on the invite code, in any case", () => {
    expect(isSlotOfCode({ invite_code: "K7Q2M9XP" }, "k7q2m9xp")).toBe(true);
    expect(isSlotOfCode({ invite_code: "K7Q2M9XP" }, "K7Q2M9XQ")).toBe(false);
  });
});

const detail = (
  me: { member_id: string; role: "organizer" | "player" },
  members: { id: string; name: string | null; role: "organizer" | "player"; claimed: boolean }[],
) => ({ me, members }) as unknown as SlotDetail;

describe("organizer actions", () => {
  const organizer = { member_id: "m_maite", role: "organizer" as const };

  it("gives none to a player", () => {
    expect(
      memberActions(
        { id: "m_peio", role: "player", claimed: true },
        { member_id: "m_eneko", role: "player" },
      ),
    ).toEqual([]);
  });

  it("gives none on the organizer's own name", () => {
    expect(memberActions({ id: "m_maite", role: "organizer", claimed: true }, organizer)).toEqual(
      [],
    );
  });

  it("frees only a claimed name", () => {
    expect(memberActions({ id: "m_peio", role: "player", claimed: true }, organizer)).toEqual([
      "make_organizer",
      "recovery_link",
      "release_name",
    ]);
    expect(memberActions({ id: "m_peio", role: "player", claimed: false }, organizer)).toEqual([
      "make_organizer",
      "recovery_link",
    ]);
  });

  it("removes the role of another organizer", () => {
    expect(memberActions({ id: "m_peio", role: "organizer", claimed: true }, organizer)[0]).toBe(
      "remove_organizer",
    );
  });

  it("suggests a second organizer to a slot's only one", () => {
    const alone = detail(organizer, [
      { id: "m_maite", name: "Maite", role: "organizer", claimed: true },
      { id: "m_peio", name: "Peio", role: "player", claimed: false },
    ]);
    expect(suggestCoOrganizer(alone)).toBe(true);
    expect(myName(alone)).toBe("Maite");

    const two = detail(organizer, [
      { id: "m_maite", name: "Maite", role: "organizer", claimed: true },
      { id: "m_peio", name: "Peio", role: "organizer", claimed: false },
    ]);
    expect(suggestCoOrganizer(two)).toBe(false);
    expect(suggestCoOrganizer(detail({ member_id: "m_peio", role: "player" }, []))).toBe(false);
  });
});
