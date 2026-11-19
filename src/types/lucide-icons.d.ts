// lucide-react-native ships typings for its package entry only. This types the per-icon
// modules that src/components/icons.ts imports.
declare module "lucide-react-native/dist/cjs/icons/*" {
  import type { LucideIcon } from "lucide-react-native";

  const icon: LucideIcon;
  export default icon;
}
