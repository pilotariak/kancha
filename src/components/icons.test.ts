import * as icons from "./icons";

// tsc accepts any path under "lucide-react-native/dist/cjs/icons/" (see src/types/lucide-icons.d.ts),
// so this is where a mistyped icon module path fails.
describe("icons", () => {
  it.each(Object.entries(icons))("exports %s as an icon component", (_name, Icon) => {
    expect(Icon).toEqual(expect.objectContaining({ render: expect.any(Function) }));
  });
});
