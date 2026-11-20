import { shareUrl } from "./share-url";

describe("shareUrl", () => {
  it("drops route groups from the path", () => {
    expect(shareUrl("/(tabs)/competitions/details?id=502")).toBe(
      "https://kancha.pilotariak.com/competitions/details?id=502",
    );
  });

  it("keeps an encoded query as it is", () => {
    expect(shareUrl("/(tabs)/competitions/player?licence=A%2F12")).toBe(
      "https://kancha.pilotariak.com/competitions/player?licence=A%2F12",
    );
  });

  it("drops a group at the end of the path", () => {
    expect(shareUrl("/(tabs)")).toBe("https://kancha.pilotariak.com");
  });

  it("keeps parentheses inside a query value", () => {
    expect(shareUrl("/competitions/player?licence=(12)")).toBe(
      "https://kancha.pilotariak.com/competitions/player?licence=(12)",
    );
  });
});
