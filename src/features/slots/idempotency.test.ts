import { creationKey, stableJson } from "./idempotency";

const keys = () => {
  let n = 0;
  return () => `key-${++n}`;
};

describe("creationKey", () => {
  it("keeps the key while the body stays the same", () => {
    const newKey = keys();
    const first = creationKey(null, { name: "Mercredi", places: 8 }, newKey);
    const retry = creationKey(first, { places: 8, name: "Mercredi" }, newKey);
    expect(first.key).toBe("key-1");
    expect(retry).toBe(first);
  });

  it("draws a new key once the body changes", () => {
    const newKey = keys();
    const first = creationKey(null, { name: "Mercredi", places: 8 }, newKey);
    expect(creationKey(first, { name: "Mercredi", places: 10 }, newKey).key).toBe("key-2");
  });
});

describe("stableJson", () => {
  it("sorts keys at every level and drops undefined values", () => {
    expect(stableJson({ b: 1, a: { d: [2, { f: null, e: "x" }], c: undefined } })).toBe(
      "{\"a\":{\"d\":[2,{\"e\":\"x\",\"f\":null}]},\"b\":1}",
    );
  });
});
