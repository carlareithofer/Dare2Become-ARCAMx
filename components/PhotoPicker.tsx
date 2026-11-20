'use client';
import { Camera, X } from 'lucide-react';

/** Micșorează poza (max. 1280 px, JPEG) ca să nu umple memoria telefonului / a browserului. */
async function compress(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  });
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL('image/jpeg', 0.7);
}

export function PhotoPicker({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const added = await Promise.all(Array.from(files).map(compress));
    onChange([...photos, ...added]);
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p, i) => (
        <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p} alt={`Poza ${i + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(photos.filter((_, j) => j !== i))}
            className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
            aria-label="Șterge poza"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-muted bg-card text-[14px] font-semibold text-ink">
        <Camera size={26} aria-hidden />
        Fă o poză
        {/* capture="environment" deschide direct camera din spate pe telefon */}
        <input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={(e) => add(e.target.files)} />
      </label>
    </div>
  );
}
