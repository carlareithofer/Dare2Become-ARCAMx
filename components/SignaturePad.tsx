"use client";
// Semnătură pe ecran. Fundalul rămâne alb și în modul întunecat (semnătura trebuie să fie lizibilă în eCMR).
import { Eraser } from "lucide-react";
import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "./Button";

interface SignaturePadProps {
  /** Se apelează la fiecare trăsătură terminată (PNG dataURL) sau cu null după „Șterge”. */
  onChange: (dataUrl: string | null) => void;
  label?: string;
}

export function SignaturePad({ onChange, label = "Semnătura" }: SignaturePadProps) {
  const ref = useRef<SignatureCanvas>(null);

  const clear = () => {
    ref.current?.clear();
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">{label}</span>
        <Button variant="ghost" icon={<Eraser className="size-5" aria-hidden />} onClick={clear}>
          Șterge
        </Button>
      </div>
      <div className="relative h-56 overflow-hidden rounded-2xl border-2 border-dashed border-slate-400 bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="#0F2A4A"
          minWidth={1.2}
          maxWidth={3}
          // Canvasul își ia mărimea din CSS; librăria îl redimensionează (și îl golește) la rotirea ecranului.
          canvasProps={{ className: "absolute inset-0 h-full w-full touch-none", "aria-label": label }}
          onEnd={() => {
            const pad = ref.current;
            if (pad && !pad.isEmpty()) onChange(pad.toDataURL("image/png"));
          }}
        />
        <div className="pointer-events-none absolute right-4 bottom-10 left-4 border-b-2 border-slate-300" aria-hidden />
        <span className="pointer-events-none absolute bottom-3 left-4 text-sm text-slate-400">Semnați deasupra liniei</span>
      </div>
    </div>
  );
}
