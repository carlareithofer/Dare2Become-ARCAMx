// Locația GPS la semnare – doar dacă utilizatorul permite. Nu blochează niciodată fluxul.
export function getPositionSafe(timeoutMs = 6000): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(null), // refuzat / indisponibil (ex. pe http, fără HTTPS)
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}
