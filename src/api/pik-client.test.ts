import {
  createPikClient,
  type CreateSlot,
  pikBaseUrl,
  type PikClientOptions,
  PikError,
  type PikTokenStore,
  problemOf,
} from "./pik-client";

const BASE = "https://pik.test/api/v1";
const PROBLEMS = "https://pik.pilotariak.com/problems";

const SLOT: CreateSlot = {
  name: "Mercredi soir",
  venue: "Trinquet Moderne",
  court: "trinquet",
  specialty: "gomme_creuse",
  anchor_date: "2026-11-25",
  interval_weeks: 1,
  time_from: "18:00",
  time_to: "19:30",
  season_start: "2026-09-01",
  season_end: "2027-06-30",
  min_players: 4,
  places: 8,
  target: 40,
  deadline_days_before: 1,
  deadline_time: "20:00",
  organizer_name: "Maite",
};

const CREATED = { slot_id: "s_1", invite_code: "K7QW2MHT", member_id: "m_1" };

/** A fetch Response with what the client reads. */
function reply(status: number, body?: unknown, headers: Record<string, string> = {}): Response {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
    json: () =>
      typeof body === "string"
        ? Promise.reject(new SyntaxError("not JSON"))
        : Promise.resolve(body),
  } as unknown as Response;
}

const problem = (name: string, status: number, headers?: Record<string, string>) =>
  reply(status, { type: `${PROBLEMS}/${name}`, title: "…", status }, headers);

/** An in-memory token store, as on a device. */
function memoryTokens(initial: string | null = null) {
  let token = initial;
  const store: PikTokenStore & { value: () => string | null } = {
    get: jest.fn(async () => token),
    set: jest.fn(async (value: string) => {
      token = value;
    }),
    clear: jest.fn(async () => {
      token = null;
    }),
    value: () => token,
  };
  return store;
}

function client(
  responses: (Response | Error)[],
  options: Partial<PikClientOptions> = {},
) {
  const fetch = jest.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => {
    const next = responses.shift();
    if (!next) throw new Error("unexpected call");
    if (next instanceof Error) throw next;
    return next;
  });
  const api = createPikClient({ fetch, baseUrl: () => BASE, tokens: null, ...options });
  const call = (index: number) => {
    const [url, init] = fetch.mock.calls[index] ?? [];
    return {
      url,
      init: init as RequestInit,
      headers: (init?.headers ?? {}) as Record<string, string>,
    };
  };
  return { api, fetch, call };
}

describe("pikBaseUrl", () => {
  it("appends /api/v1 to pik's origin", () => {
    expect(pikBaseUrl("https://pik.pilotariak.com")).toBe("https://pik.pilotariak.com/api/v1");
    expect(pikBaseUrl(" http://10.0.2.2:8787/ ")).toBe("http://10.0.2.2:8787/api/v1");
  });

  it("is null without an origin", () => {
    expect(pikBaseUrl(undefined)).toBeNull();
    expect(pikBaseUrl("  ")).toBeNull();
  });
});

describe("problemOf", () => {
  it("reads the name after pik's problems URI", () => {
    expect(problemOf(`${PROBLEMS}/name-taken`)).toBe("name-taken");
    expect(problemOf(`${PROBLEMS}/idempotency-key-reused`)).toBe("idempotency-key-reused");
  });

  it("reads anything else as unknown, the contract's variant names included", () => {
    expect(problemOf("NameTaken")).toBe("unknown");
    expect(problemOf(`${PROBLEMS}/no-such-problem`)).toBe("unknown");
    expect(problemOf("https://example.com/problems/name-taken")).toBe("unknown");
    expect(problemOf(undefined)).toBe("unknown");
  });
});

describe("mySlots on native", () => {
  it("makes no call while the device has no player", async () => {
    const { api, fetch } = client([], { tokens: memoryTokens() });
    await expect(api.mySlots()).resolves.toEqual({ slots: [] });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the token as Bearer, and no cookie", async () => {
    const slots = { slots: [{ id: "s_1" }] };
    const { api, call } = client([reply(200, slots)], { tokens: memoryTokens("t1") });
    await expect(api.mySlots()).resolves.toEqual(slots);
    expect(call(0).url).toBe(`${BASE}/me`);
    expect(call(0).init.method).toBe("GET");
    expect(call(0).headers.Authorization).toBe("Bearer t1");
    expect(call(0).init.credentials).toBe("omit");
  });

  it("drops a token pik no longer knows, and shows no slot", async () => {
    const tokens = memoryTokens("gone");
    const { api } = client([problem("unauthorized", 401)], { tokens });
    await expect(api.mySlots()).resolves.toEqual({ slots: [] });
    expect(tokens.value()).toBeNull();
  });

  it("keeps a token stored while the call was running", async () => {
    const tokens = memoryTokens("gone");
    const { api } = client([problem("unauthorized", 401)], { tokens });
    (tokens.get as jest.Mock)
      .mockResolvedValueOnce("gone") // read before the call
      .mockResolvedValueOnce("new"); // read after the 401
    await api.mySlots();
    expect(tokens.clear).not.toHaveBeenCalled();
  });

  it("keeps the token on any other failure", async () => {
    const tokens = memoryTokens("t1");
    const { api } = client([new TypeError("Network request failed")], { tokens });
    await expect(api.mySlots()).rejects.toMatchObject({ failure: "network", status: 0 });
    expect(tokens.value()).toBe("t1");
  });
});

describe("mySlots on the web", () => {
  it("relies on pik's cookie, sent to pik's origin", async () => {
    const { api, call } = client([reply(200, { slots: [] })]);
    await api.mySlots();
    expect(call(0).headers.Authorization).toBeUndefined();
    expect(call(0).init.credentials).toBe("include");
  });

  it("shows no slot when the browser has no player", async () => {
    const { api } = client([problem("unauthorized", 401)]);
    await expect(api.mySlots()).resolves.toEqual({ slots: [] });
  });
});

describe("createSlot", () => {
  it("posts the slot with its Idempotency-Key and keeps the new player's token", async () => {
    const tokens = memoryTokens();
    const { api, call } = client([reply(201, { ...CREATED, player_token: "t-new" })], { tokens });

    await expect(api.createSlot(SLOT, "key-1")).resolves.toEqual(CREATED);

    expect(call(0).url).toBe(`${BASE}/slots`);
    expect(call(0).init.method).toBe("POST");
    expect(JSON.parse(call(0).init.body as string)).toEqual(SLOT);
    expect(call(0).headers).toMatchObject({
      "Content-Type": "application/json",
      "Idempotency-Key": "key-1",
    });
    expect(call(0).headers.Authorization).toBeUndefined();
    expect(tokens.value()).toBe("t-new");
  });

  it("sends the device's token, and keeps it when pik returns none", async () => {
    const tokens = memoryTokens("t1");
    const { api, call } = client([reply(201, { ...CREATED, player_token: null })], { tokens });
    await api.createSlot(SLOT, "key-1");
    expect(call(0).headers.Authorization).toBe("Bearer t1");
    expect(tokens.set).not.toHaveBeenCalled();
    expect(tokens.value()).toBe("t1");
  });

  it("stores the fresh token of a replayed key, which replaces the first", async () => {
    const tokens = memoryTokens("t-first");
    const { api } = client([reply(201, { ...CREATED, player_token: "t-fresh" })], { tokens });
    await api.createSlot(SLOT, "key-1");
    expect(tokens.value()).toBe("t-fresh");
  });

  it("creates the slot under a new player when pik no longer knows the token", async () => {
    const tokens = memoryTokens("gone");
    const { api, call, fetch } = client(
      [problem("unauthorized", 401), reply(201, { ...CREATED, player_token: "t-new" })],
      { tokens },
    );
    await expect(api.createSlot(SLOT, "key-1")).resolves.toEqual(CREATED);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(call(1).headers.Authorization).toBeUndefined();
    expect(call(1).headers["Idempotency-Key"]).toBe("key-1");
    expect(tokens.value()).toBe("t-new");
  });

  it("never keeps the token on the web, where pik's cookie holds it", async () => {
    const { api, call } = client([reply(201, { ...CREATED, player_token: "t-cookie" })]);
    const created = await api.createSlot(SLOT, "key-1");
    expect(created).not.toHaveProperty("player_token");
    expect(call(0).init.credentials).toBe("include");
  });

  it("throws pik's problem", async () => {
    const { api } = client([problem("idempotency-key-reused", 422)]);
    await expect(api.createSlot(SLOT, "key-1")).rejects.toMatchObject({
      failure: "idempotency-key-reused",
      status: 422,
    });
  });

  it("reads Retry-After from a 429", async () => {
    const { api } = client([problem("rate-limited", 429, { "Retry-After": "60" })]);
    const error = await api.createSlot(SLOT, "key-1").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PikError);
    expect(error).toMatchObject({ failure: "rate-limited", status: 429, retryAfter: 60 });
  });
});

describe("failures", () => {
  it("reads a body that is not a problem as unknown", async () => {
    const { api } = client([reply(404, "Not Found")]);
    await expect(api.slotSessions("s_1")).rejects.toMatchObject({
      failure: "unknown",
      status: 404,
    });
  });

  it("times out", async () => {
    const fetch = jest.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("Aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    );
    const api = createPikClient({ fetch, baseUrl: () => BASE, tokens: null, timeoutMs: 5 });
    await expect(api.slotSessions("s_1")).rejects.toMatchObject({ failure: "timeout", status: 0 });
  });

  it("makes no call without a base URL", async () => {
    const { api, fetch } = client([], { baseUrl: () => null });
    await expect(api.slotSessions("s_1")).rejects.toMatchObject({ failure: "config" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("slotSessions", () => {
  it("asks for a slot's sessions in a date range", async () => {
    const sessions = { sessions: [] };
    const { api, call } = client([reply(200, sessions)], { tokens: memoryTokens("t1") });
    await expect(api.slotSessions("s/1", { from: "2026-12-01", to: "2026-12-31" }))
      .resolves.toEqual(sessions);
    expect(call(0).url).toBe(`${BASE}/slots/s%2F1/sessions?from=2026-12-01&to=2026-12-31`);
    expect(call(0).headers.Authorization).toBe("Bearer t1");
  });

  it("leaves the range to pik by default", async () => {
    const { api, call } = client([reply(200, { sessions: [] })]);
    await api.slotSessions("s_1");
    expect(call(0).url).toBe(`${BASE}/slots/s_1/sessions`);
  });
});

describe("joining with an invite link", () => {
  const JOINED = { slot_id: "s_1", member_id: "m_2" };

  it("previews the slot of a code without a token", async () => {
    const preview = { name: "Mercredi soir", free_names: [], list_closed: false };
    const { api, call } = client([reply(200, preview)], { tokens: memoryTokens("t1") });
    await expect(api.previewJoin("K7Q2M9XP")).resolves.toEqual(preview);
    expect(call(0).url).toBe(`${BASE}/join/K7Q2M9XP`);
    expect(call(0).init.method).toBe("GET");
    expect(call(0).headers.Authorization).toBeUndefined();
  });

  it("claims a free name with the device's token", async () => {
    const tokens = memoryTokens("t1");
    const { api, call } = client([reply(200, { ...JOINED, player_token: null })], { tokens });
    await expect(api.joinSlot("K7Q2M9XP", { memberId: "m_2" })).resolves.toEqual(JOINED);
    expect(call(0).url).toBe(`${BASE}/join/K7Q2M9XP/claim`);
    expect(call(0).init.method).toBe("POST");
    expect(JSON.parse(call(0).init.body as string)).toEqual({ member_id: "m_2" });
    expect(call(0).headers.Authorization).toBe("Bearer t1");
    expect(tokens.set).not.toHaveBeenCalled();
  });

  it("adds the player's own name, and keeps the token of a new player", async () => {
    const tokens = memoryTokens();
    const { api, call } = client([reply(201, { ...JOINED, player_token: "t_new" })], { tokens });
    const joined = await api.joinSlot("K7Q2M9XP", { name: "Peio" });
    expect(call(0).url).toBe(`${BASE}/join/K7Q2M9XP/members`);
    expect(JSON.parse(call(0).init.body as string)).toEqual({ name: "Peio" });
    expect(call(0).headers.Authorization).toBeUndefined();
    expect(tokens.value()).toBe("t_new");
    expect(joined).toEqual(JOINED);
    expect(joined).not.toHaveProperty("player_token");
  });

  it("never hands the token to the web page, where pik's cookie holds it", async () => {
    const { api, call } = client([reply(201, { ...JOINED, player_token: "t_new" })]);
    await expect(api.joinSlot("K7Q2M9XP", { name: "Peio" })).resolves.toEqual(JOINED);
    expect(call(0).init.credentials).toBe("include");
  });

  it("throws a name taken meanwhile", async () => {
    const { api } = client([problem("name-taken", 409)]);
    await expect(api.joinSlot("K7Q2M9XP", { memberId: "m_2" })).rejects.toMatchObject({
      failure: "name-taken",
      status: 409,
    });
  });
});

describe("recovery links", () => {
  const RECOVERY = "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst";
  const JOINED = { slot_id: "s_1", member_id: "m_2" };

  it("redeems the link in pik's path and keeps the new player's token", async () => {
    const tokens = memoryTokens();
    const { api, call } = client([reply(200, { ...JOINED, player_token: "t_new" })], { tokens });
    await expect(api.redeemRecovery(RECOVERY)).resolves.toEqual(JOINED);
    expect(call(0).url).toBe(`${BASE}/recover/${RECOVERY}`);
    expect(call(0).init.method).toBe("POST");
    expect(tokens.value()).toBe("t_new");
  });

  it("redeems it again under a new player when pik no longer knows the token", async () => {
    const tokens = memoryTokens("t_old");
    const { api, call } = client(
      [problem("unauthorized", 401), reply(200, { ...JOINED, player_token: "t_new" })],
      { tokens },
    );
    await expect(api.redeemRecovery(RECOVERY)).resolves.toEqual(JOINED);
    expect(call(0).headers.Authorization).toBe("Bearer t_old");
    expect(call(1).headers.Authorization).toBeUndefined();
    expect(tokens.value()).toBe("t_new");
  });

  it("retries once on the web, whose cookie pik's 401 cleared", async () => {
    const { api, fetch } = client([problem("unauthorized", 401), reply(200, JOINED)]);
    await expect(api.redeemRecovery(RECOVERY)).resolves.toEqual(JOINED);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("throws a link used or expired, without retrying", async () => {
    const { api, fetch } = client([problem("recovery-link-gone", 410)], {
      tokens: memoryTokens("t1"),
    });
    await expect(api.redeemRecovery(RECOVERY)).rejects.toMatchObject({
      failure: "recovery-link-gone",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("creates a link with its Idempotency-Key and no body", async () => {
    const link = { token: RECOVERY, expires_at: "2026-11-25T10:00:00Z" };
    const { api, call } = client([reply(201, link)], { tokens: memoryTokens("t1") });
    await expect(api.createRecoveryLink("s_1", "m_2", "key-1")).resolves.toEqual(link);
    expect(call(0).url).toBe(`${BASE}/slots/s_1/members/m_2/recovery`);
    expect(call(0).init.method).toBe("POST");
    expect(call(0).headers["Idempotency-Key"]).toBe("key-1");
    expect(call(0).init.body).toBeUndefined();
  });
});

describe("the personal link", () => {
  it("reads a link's slots with its own token, without keeping it", async () => {
    const tokens = memoryTokens("t_device");
    const { api, call } = client([reply(200, { slots: [] })], { tokens });
    await expect(api.playerSlots("t_link")).resolves.toEqual({ slots: [] });
    expect(call(0).url).toBe(`${BASE}/me`);
    expect(call(0).headers.Authorization).toBe("Bearer t_link");
    expect(tokens.value()).toBe("t_device");
  });

  it("keeps the link's token on native, never on the web", async () => {
    const tokens = memoryTokens("t_device");
    await expect(client([], { tokens }).api.adoptToken("t_link")).resolves.toBe(true);
    expect(tokens.value()).toBe("t_link");
    await expect(client([]).api.adoptToken("t_link")).resolves.toBe(false);
  });

  it("gives the device's token on native only", async () => {
    await expect(client([], { tokens: memoryTokens("t1") }).api.deviceToken()).resolves.toBe("t1");
    await expect(client([]).api.deviceToken()).resolves.toBeNull();
  });
});

describe("organizer actions", () => {
  it("reads a slot with the device's token", async () => {
    const { api, call } = client([reply(200, { id: "s_1" })], { tokens: memoryTokens("t1") });
    await api.slot("s_1");
    expect(call(0).url).toBe(`${BASE}/slots/s_1`);
    expect(call(0).headers.Authorization).toBe("Bearer t1");
  });

  it("adds a name, and changes a member's role", async () => {
    const { api, call } = client([reply(201, {}), reply(200, {})]);
    await api.addMember("s_1", "Peio");
    await api.updateMember("s_1", "m_2", { role: "organizer" });
    expect(call(0).url).toBe(`${BASE}/slots/s_1/members`);
    expect(JSON.parse(call(0).init.body as string)).toEqual({ name: "Peio" });
    expect(call(1).url).toBe(`${BASE}/slots/s_1/members/m_2`);
    expect(call(1).init.method).toBe("PATCH");
    expect(JSON.parse(call(1).init.body as string)).toEqual({ role: "organizer" });
  });

  it("frees a name, which pik answers with 204 and no body", async () => {
    const { api, call } = client([reply(204, "")]);
    await expect(api.releaseName("s_1", "m_2")).resolves.toBeUndefined();
    expect(call(0).url).toBe(`${BASE}/slots/s_1/members/m_2/claim`);
    expect(call(0).init.method).toBe("DELETE");
  });

  it("rotates the invite code, and closes the list", async () => {
    const { api, call } = client([
      reply(200, { invite_code: "N3WC0DE2" }),
      reply(200, { closed: true }),
    ]);
    await expect(api.rotateInviteCode("s_1")).resolves.toEqual({ invite_code: "N3WC0DE2" });
    await expect(api.setListClosed("s_1", true)).resolves.toEqual({ closed: true });
    expect(call(0).url).toBe(`${BASE}/slots/s_1/invite-code`);
    expect(call(0).init.method).toBe("POST");
    expect(call(1).url).toBe(`${BASE}/slots/s_1/list`);
    expect(call(1).init.method).toBe("PUT");
    expect(JSON.parse(call(1).init.body as string)).toEqual({ closed: true });
  });

  it("throws the last organizer's problem", async () => {
    const { api } = client([problem("last-organizer", 409)]);
    await expect(api.updateMember("s_1", "m_1", { role: "player" })).rejects.toMatchObject({
      failure: "last-organizer",
    });
  });
});

describe("one session and its answers", () => {
  it("reads a session by its Paris date, with the device's token", async () => {
    const { api, call } = client([reply(200, { date: "2026-11-26", answers: [] })], {
      tokens: memoryTokens("t1"),
    });
    await expect(api.session("s_1", "2026-11-26")).resolves.toMatchObject({ date: "2026-11-26" });
    expect(call(0).url).toBe(`${BASE}/slots/s_1/sessions/2026-11-26`);
    expect(call(0).init.method).toBe("GET");
    expect(call(0).headers.Authorization).toBe("Bearer t1");
  });

  it("answers for the device's member without naming it", async () => {
    const result = { member_id: "m_1", status: "ok", session: { state: "on" } };
    const { api, call } = client([reply(200, result)], { tokens: memoryTokens("t1") });
    await expect(api.answerSession("s_1", "2026-11-26", "ok")).resolves.toEqual(result);
    expect(call(0).url).toBe(`${BASE}/slots/s_1/sessions/2026-11-26/answer`);
    expect(call(0).init.method).toBe("PUT");
    expect(JSON.parse(call(0).init.body as string)).toEqual({ status: "ok" });
    expect(call(0).headers.Authorization).toBe("Bearer t1");
    // pik takes no If-Match on answers: the last write wins.
    expect(call(0).headers["If-Match"]).toBeUndefined();
  });

  it("answers for another member (organizer) with their id", async () => {
    const { api, call } = client([reply(200, {})]);
    await api.answerSession("s_1", "2026-11-26", "dispo", "m_7");
    expect(JSON.parse(call(0).init.body as string)).toEqual({ status: "dispo", member_id: "m_7" });
    expect(call(0).init.credentials).toBe("include");
  });

  it("throws the deadline and the cancellation as pik's problems", async () => {
    const { api } = client([problem("deadline-passed", 409), problem("session-cancelled", 409)]);
    await expect(api.answerSession("s_1", "2026-11-26", "ok")).rejects.toMatchObject({
      failure: "deadline-passed",
      status: 409,
    });
    await expect(api.answerSession("s_1", "2026-11-26", "ko")).rejects.toMatchObject({
      failure: "session-cancelled",
    });
  });

  it("cancels a date, and undoes it", async () => {
    const { api, call } = client([
      reply(200, { state: "cancelled" }),
      reply(200, { state: "missing" }),
    ]);
    await expect(api.updateSession("s_1", "2026-11-26", { cancelled: true })).resolves
      .toEqual({ state: "cancelled" });
    await api.updateSession("s_1", "2026-11-26", { cancelled: false });
    expect(call(0).url).toBe(`${BASE}/slots/s_1/sessions/2026-11-26`);
    expect(call(0).init.method).toBe("PATCH");
    expect(JSON.parse(call(0).init.body as string)).toEqual({ cancelled: true });
    expect(JSON.parse(call(1).init.body as string)).toEqual({ cancelled: false });
  });

  it("throws organizer-only for a player who cancels", async () => {
    const { api } = client([problem("organizer-only", 403)]);
    await expect(api.updateSession("s_1", "2026-11-26", { cancelled: true })).rejects
      .toMatchObject({ failure: "organizer-only", status: 403 });
  });
});
