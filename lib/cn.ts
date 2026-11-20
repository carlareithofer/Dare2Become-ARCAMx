/** Unește clase Tailwind, ignorând valorile goale. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
