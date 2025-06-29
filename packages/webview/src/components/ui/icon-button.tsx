export function IconButton(
  props: Omit<React.ComponentPropsWithoutRef<"button">, "className">,
) {
  return (
    <button
      className="p-1 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/20"
      {...props}
    />
  );
}
