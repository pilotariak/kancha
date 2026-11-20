import { AccessibilityInfo, Platform } from "react-native";

import { subscribeReducedMotion } from "./use-reduced-motion";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => jest.clearAllMocks());

describe("subscribeReducedMotion on iOS and Android", () => {
  const isReduceMotionEnabled = AccessibilityInfo.isReduceMotionEnabled as jest.Mock;
  const addEventListener = AccessibilityInfo.addEventListener as jest.Mock;
  let remove: jest.Mock;
  let emit: (reduced: boolean) => void;

  beforeEach(() => {
    remove = jest.fn();
    addEventListener.mockImplementation((_event: string, handler: (r: boolean) => void) => {
      emit = handler;
      return { remove };
    });
  });

  it("reports the setting read at subscription", async () => {
    isReduceMotionEnabled.mockResolvedValueOnce(true);
    const onChange = jest.fn();
    subscribeReducedMotion(onChange);
    await flush();
    expect(addEventListener).toHaveBeenCalledWith("reduceMotionChanged", expect.any(Function));
    expect(onChange.mock.calls).toEqual([[true]]);
  });

  it("reports every change", async () => {
    isReduceMotionEnabled.mockResolvedValueOnce(false);
    const onChange = jest.fn();
    subscribeReducedMotion(onChange);
    await flush();
    emit(true);
    emit(false);
    expect(onChange.mock.calls).toEqual([[false], [true], [false]]);
  });

  it("ignores a first answer that arrives after a change", async () => {
    isReduceMotionEnabled.mockResolvedValueOnce(false);
    const onChange = jest.fn();
    subscribeReducedMotion(onChange);
    emit(true);
    await flush();
    expect(onChange.mock.calls).toEqual([[true]]);
  });

  it("stops listening and ignores a late answer after the unsubscribe", async () => {
    isReduceMotionEnabled.mockResolvedValueOnce(true);
    const onChange = jest.fn();
    subscribeReducedMotion(onChange)();
    await flush();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("subscribeReducedMotion on web", () => {
  let matches: boolean;
  let listeners: Set<(e: { matches: boolean }) => void>;
  const matchMedia = jest.fn((query: string) => ({
    get matches() {
      return matches;
    },
    addEventListener: (_type: string, l: (e: { matches: boolean }) => void) => listeners.add(l),
    removeEventListener: (_type: string, l: (e: { matches: boolean }) => void) =>
      listeners.delete(l),
  }));
  const change = (next: boolean) => {
    matches = next;
    listeners.forEach((l) => l({ matches: next }));
  };

  let os: jest.ReplaceProperty<typeof Platform.OS>;

  beforeEach(() => {
    os = jest.replaceProperty(Platform, "OS", "web");
    Object.defineProperty(window, "matchMedia", { value: matchMedia, configurable: true });
    matches = false;
    listeners = new Set();
  });

  afterEach(() => os.restore());

  it("reads the media query at once, without AccessibilityInfo", () => {
    matches = true;
    const onChange = jest.fn();
    subscribeReducedMotion(onChange);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(onChange.mock.calls).toEqual([[true]]);
    expect(AccessibilityInfo.isReduceMotionEnabled).not.toHaveBeenCalled();
  });

  it("reports every change until the unsubscribe", () => {
    const onChange = jest.fn();
    const unsubscribe = subscribeReducedMotion(onChange);
    change(true);
    unsubscribe();
    change(false);
    expect(onChange.mock.calls).toEqual([[false], [true]]);
    expect(listeners.size).toBe(0);
  });

  it("keeps two subscribers apart", () => {
    const first = jest.fn();
    const second = jest.fn();
    const unsubscribeFirst = subscribeReducedMotion(first);
    subscribeReducedMotion(second);
    unsubscribeFirst();
    change(true);
    expect(first.mock.calls).toEqual([[false]]);
    expect(second.mock.calls).toEqual([[false], [true]]);
  });
});
