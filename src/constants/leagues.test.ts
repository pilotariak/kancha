import { LEAGUES } from "./leagues";

describe("LEAGUES", () => {
  it("gives every league its own code", () => {
    const codes = LEAGUES.map((league) => league.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  // "BÉ" as E + U+0301 can take its accent from a fallback font on web.
  it.each(LEAGUES.map((league) => [league.id, league.code]))(
    "keeps the code of %s precomposed",
    (_id, code) => {
      expect(code).toBe(code.normalize("NFC"));
    },
  );
});
