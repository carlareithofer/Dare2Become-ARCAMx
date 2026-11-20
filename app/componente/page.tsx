"use client";
// Pagină temporară de verificare a componentelor de bază (etapa 1). Se poate șterge după etapa 3.
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomBar } from "@/components/BottomBar";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { EcmrView } from "@/components/EcmrView";
import { Input } from "@/components/Input";
import { PhotoPicker, type PickedPhoto } from "@/components/PhotoPicker";
import { Select } from "@/components/Select";
import { SignaturePad } from "@/components/SignaturePad";
import { StatusBadge } from "@/components/StatusBadge";
import { getTrip, resetDemoData } from "@/lib/data";
import { TRIP_STATUS_ORDER } from "@/lib/status";
import { useAsync } from "@/lib/use-async";

export default function ComponentsPage() {
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const trip = useAsync(() => getTrip("t_115"), []);

  return (
    <div className="pb-32">
      <AppHeader title="Componente de bază" subtitle="Pagină de verificare (etapa 1)" backHref="/" />
      <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
        <Card>
          <CardTitle>Statusuri</CardTitle>
          <div className="flex flex-wrap gap-2">
            {TRIP_STATUS_ORDER.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle>Butoane</CardTitle>
          <Button size="lg" fullWidth icon={<Check className="size-6" aria-hidden />}>Buton principal</Button>
          <Button variant="secondary" fullWidth>Buton secundar</Button>
          <Button variant="ghost">Buton discret</Button>
          <Button loading fullWidth>Se salvează</Button>
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle>Câmpuri</CardTitle>
          <Input label="Numele destinatarului" placeholder="ex. Florin Câmpean" hint="Cum apare în buletin" />
          <Input label="Cu eroare" defaultValue="x" error="Numele e prea scurt" />
          <Select
            label="Șofer"
            placeholder="Alege șoferul"
            defaultValue=""
            options={[
              { value: "d_ion", label: "Ion Popescu" },
              { value: "d_mihai", label: "Mihai Dumitru" },
            ]}
          />
        </Card>

        <Card>
          <CardTitle>Poze ({photos.length})</CardTitle>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </Card>

        <Card>
          <SignaturePad onChange={setSignature} label="Semnătura destinatarului" />
          <p className="mt-2 text-sm text-ink-muted">{signature ? "Semnătură capturată ✓" : "Nicio semnătură încă"}</p>
        </Card>

        {trip.loading && <p>Se încarcă eCMR-ul…</p>}
        {trip.error && <p className="text-status-problem">{trip.error}</p>}
        {trip.data && <EcmrView details={trip.data} />}
      </main>

      <BottomBar>
        <Button
          variant="secondary"
          fullWidth
          icon={<RotateCcw className="size-5" aria-hidden />}
          onClick={() => {
            resetDemoData();
            trip.reload();
          }}
        >
          Resetează datele demo
        </Button>
      </BottomBar>
    </div>
  );
}
