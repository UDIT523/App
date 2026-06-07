/**
 * Tiny className combiner — joins truthy class strings.
 * Keeps component code readable without pulling in clsx/tailwind-merge.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
