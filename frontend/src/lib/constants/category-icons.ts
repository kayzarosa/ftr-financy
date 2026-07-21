import type { LucideIcon } from "lucide-react";
import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Tag,
  Ticket,
  ToolCase,
  Utensils,
} from "lucide-react";

export const categoryIcons = {
  BriefcaseBusiness,
  CarFront,
  HeartPulse,
  PiggyBank,
  ShoppingCart,
  Ticket,
  Gift,
  BookOpen,
  PawPrint,
  Utensils,
  ToolCase,
  BaggageClaim,
  ReceiptText,
  Mailbox,
  Dumbbell,
  House,
} satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof categoryIcons;

export const categoryIconNames = Object.keys(categoryIcons) as CategoryIconName[];

export const DEFAULT_CATEGORY_ICON = Tag;

const iconsByName: Record<string, LucideIcon> = categoryIcons;

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  return (icon && iconsByName[icon]) || DEFAULT_CATEGORY_ICON;
}
