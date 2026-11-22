import type { Result } from "@/types/competition";

import { graphqlRequest } from "./client";
import { matchesApi, RESULTS_PAGE_SIZE } from "./matches";

jest.mock("./client", () => ({ graphqlRequest: jest.fn() }));

const request = graphqlRequest as jest.MockedFunction<typeof graphqlRequest>;
const page = (from: number, count: number) => ({
  results: Array.from({ length: count }, (_, i) => ({ id: String(from + i) }) as Result),
});

describe("matchesApi.listAll", () => {
  beforeEach(() => request.mockReset());

  it("asks for the next page while a page comes back full", async () => {
    request
      .mockResolvedValueOnce(page(0, RESULTS_PAGE_SIZE))
      .mockResolvedValueOnce(page(500, RESULTS_PAGE_SIZE))
      .mockResolvedValueOnce(page(1000, 8));

    const results = await matchesApi.listAll({ clubId: "4063", competitionId: "502" });

    expect(results).toHaveLength(1008);
    expect(request.mock.calls.map(([, variables]) => variables)).toEqual([
      { clubId: "4063", competitionId: "502", limit: 500, offset: 0 },
      { clubId: "4063", competitionId: "502", limit: 500, offset: 500 },
      { clubId: "4063", competitionId: "502", limit: 500, offset: 1000 },
    ]);
  });

  it("sends one request when the first page is short", async () => {
    request.mockResolvedValueOnce(page(0, 108));
    expect(await matchesApi.listAll({ clubId: "4063", competitionId: "502" })).toHaveLength(108);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("returns nothing for a club without a match", async () => {
    request.mockResolvedValueOnce(page(0, 0));
    expect(await matchesApi.listAll({ clubId: "1", competitionId: "500" })).toEqual([]);
  });
});
