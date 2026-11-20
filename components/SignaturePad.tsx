'use client';
import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

/** Câmp de semnătură pe ecran. Întoarce imaginea semnăturii (dataURL) sau null dacă e gol. */
export function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<SignatureCanvas>(null);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const resize = () => box.current && setWidth(box.current.clientWidth);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const clear = () => {
    ref.current?.clear();
    setEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <div ref={box} className="relative overflow-hidden rounded-2xl border-2 border-dashed border-muted bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="#0F2A4A"
          minWidth={1.2}
          maxWidth={3}
          canvasProps={{ width, height: 200, className: 'block touch-none', 'aria-label': 'Zona de semnătură' }}
          onEnd={() => {
            setEmpty(false);
            onChange(ref.current?.getTrimmedCanvas().toDataURL('image/png') ?? null);
          }}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-[15px] text-slate-400">
            Semnați aici cu degetul
          </span>
        )}
        <span className="pointer-events-none absolute bottom-10 left-6 right-6 border-b border-slate-300" />
      </div>
      <button type="button" onClick={clear} className="mt-2 inline-flex h-10 items-center gap-1.5 px-1 text-[15px] font-semibold text-muted">
        <Eraser size={17} aria-hidden /> Șterge semnătura
      </button>
    </div>
  );
}
