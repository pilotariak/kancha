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
