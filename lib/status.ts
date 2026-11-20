// Etichete în română + culori + iconițe pentru enum-urile din types.ts.
// Statusul se afișează mereu cu text + iconiță, nu doar prin culoare.
import {
  Ban,
  CalendarClock,
  CircleCheck,
  FileCheck2,
  FilePen,
  FileText,
  PackageCheck,
  Receipt,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { BodyType, EcmrStatus, RemarkCategory, SignatureParty, Stage, TripStatus } from "./types";

export interface StatusStyle {
  label: string;
  icon: LucideIcon;
  className: string; // fundal + text (light și dark)
}

export const TRIP_STATUS: Record<TripStatus, StatusStyle> = {
  planned: {
    label: "Planificată",
    icon: CalendarClock,
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  in_progress: {
    // Galben, nu portocaliu, ca să nu se confunde cu butoanele (accent).
    label: "În curs",
    icon: Truck,
    className: "bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F] dark:text-[#FEF3C7]",
  },
  loaded: {
    label: "Încărcată",
    icon: PackageCheck,
    className: "bg-blue-50 text-brand dark:bg-blue-950 dark:text-blue-100",
  },
  delivered: {
    label: "Livrată",
    icon: CircleCheck,
    className: "bg-green-50 text-status-delivered dark:bg-green-950 dark:text-green-200",
  },
  invoiced: {
    label: "Facturată",
    icon: Receipt,
    className: "bg-brand text-white dark:bg-slate-700",
  },
  cancelled: {
    label: "Anulată",
    icon: Ban,
    className: "bg-red-50 text-status-problem dark:bg-red-950 dark:text-red-200",
  },
};

export const ECMR_STATUS: Record<EcmrStatus, StatusStyle> = {
  draft: { label: "Ciornă", icon: FilePen, className: TRIP_STATUS.planned.className },
  issued: { label: "Emis", icon: FileText, className: TRIP_STATUS.planned.className },
  loaded: { label: "Încărcat", icon: PackageCheck, className: TRIP_STATUS.loaded.className },
  delivered: { label: "Livrat", icon: CircleCheck, className: TRIP_STATUS.delivered.className },
  closed: { label: "Închis", icon: FileCheck2, className: TRIP_STATUS.invoiced.className },
};

/** Ordinea în care apar filtrele în dashboard. */
export const TRIP_STATUS_ORDER: TripStatus[] = [
  "planned",
  "in_progress",
  "loaded",
  "delivered",
  "invoiced",
  "cancelled",
];

export const REMARK_LABEL: Record<RemarkCategory, string> = {
  missing_packages: "Lipsesc colete",
  damaged_packaging: "Ambalaj deteriorat",
  damaged_goods: "Marfă deteriorată",
  delay: "Întârziere",
  other: "Altceva",
};

export const PARTY_LABEL: Record<SignatureParty, string> = {
  sender: "Expeditor",
  carrier: "Transportator",
  consignee: "Destinatar",
};

export const STAGE_LABEL: Record<Stage, string> = {
  loading: "Încărcare",
  delivery: "Livrare",
};

export const BODY_TYPE_LABEL: Record<BodyType, string> = {
  tarp: "Prelată",
  reefer: "Frigorific",
  tanker: "Cisternă",
  box: "Furgon / Box",
  flatbed: "Platformă",
  other: "Altul",
};
