import type { ComponentProps } from "react";
import { Button } from "./button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
  "aria-label": string;
};

export function IconButton(props: IconButtonProps) {
  return <Button variant="iconButton" size="icon" {...props} />;
}
