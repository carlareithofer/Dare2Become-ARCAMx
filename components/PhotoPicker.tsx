"use client";
// Poze cu camera telefonului (input type=file + capture). Pozele se micșorează înainte de salvare.
import { Camera, Loader2, X } from "lucide-react";
import { useId, useState } from "react";
import { fileToCompressedDataUrl } from "@/lib/image";
import { cn } from "@/lib/cn";
import { buttonClass } from "./Button";

export interface PickedPhoto {
  dataUrl: string;
  takenAt: string;
}

interface PhotoPickerProps {
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  max?: number;
}

export function PhotoPicker({ photos, onChange, max = 6 }: PhotoPickerProps) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const full = photos.length >= max;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const room = max - photos.length;
      const added = await Promise.all(
        Array.from(files)
          .slice(0, room)
          .map(async (f) => ({ dataUrl: await fileToCompressedDataUrl(f), takenAt: new Date().toISOString() })),
      );
      onChange([...photos, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut salva poza.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <li key={p.takenAt + i} className="relative aspect-square overflow-hidden rounded-xl bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- dataURL local, nu are rost next/image */}
              <img src={p.dataUrl} alt={`Poza ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 flex size-10 items-center justify-center rounded-full bg-black/70 text-white"
                aria-label={`Șterge poza ${i + 1}`}
              >
                <X className="size-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label
        htmlFor={inputId}
        className={cn(
          buttonClass({ variant: "secondary", size: "lg", fullWidth: true }),
          "cursor-pointer",
          (full || busy) && "pointer-events-none opacity-50",
        )}
      >
        {busy ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <Camera className="size-6" aria-hidden />}
        {full ? `Maxim ${max} poze` : photos.length ? "Mai fă o poză" : "Fă o poză"}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        disabled={full || busy}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = ""; // permite aceeași poză din nou
        }}
      />
      {error && <p className="text-sm font-medium text-status-problem">{error}</p>}
    </div>
  );
}
