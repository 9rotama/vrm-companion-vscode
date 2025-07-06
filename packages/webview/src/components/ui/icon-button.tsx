export function IconButton(
  props: Omit<React.ComponentPropsWithoutRef<"button">, "className">,
) {
  return (
    <button
      className="bg-popover-bg border-popover-border hover:bg-popover-bg rounded-full border p-1"
      {...props}
    />
  );
}
