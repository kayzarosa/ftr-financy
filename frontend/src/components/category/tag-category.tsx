type TagCategoryProps = {
  color: string;
  name: string;
};

export function TagCategory({ color, name }: TagCategoryProps) {
  return (
    <div
      className="rounded-full font-medium text-[14px] pt-1 pb-1 pr-3 pl-3 w-fit"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, white)`,
        color: `${color}`,
      }}
    >
      {name}
    </div>
  );
}
