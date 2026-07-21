import type { LucideIcon } from "lucide-react";

type IconCategory = {
  color?: string;
  icon: LucideIcon;
};

export function IconCategory({ color, icon: Icon }: IconCategory) {
  return (
    <div
      className="h-10 w-10 rounded-lg flex items-center justify-center"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, white)`,
      }}
    >
      <Icon className="size-4" color={color} />
    </div>
  );
}
