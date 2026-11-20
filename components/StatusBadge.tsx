import { ECMR_STATUS, TRIP_STATUS } from "@/lib/status";
import type { EcmrStatus, TripStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props =
  | { kind?: "trip"; status: TripStatus; size?: "sm" | "md" }
  | { kind: "ecmr"; status: EcmrStatus; size?: "sm" | "md" };

/** Status = text + iconiță + culoare (niciodată doar culoare). */
export function StatusBadge(props: Props) {
  const style = props.kind === "ecmr" ? ECMR_STATUS[props.status] : TRIP_STATUS[props.status];
  const Icon = style.icon;
  const sm = props.size === "sm";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        sm ? "px-2.5 py-1 text-sm" : "px-3 py-1.5 text-base",
        style.className,
      )}
    >
      <Icon className={sm ? "size-4" : "size-5"} aria-hidden />
      {style.label}
    </span>
  );
}
