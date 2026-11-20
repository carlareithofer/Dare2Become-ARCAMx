'use client';
/** Încearcă să obțină locația (dacă utilizatorul permite). Nu blochează fluxul dacă refuză. */
export function getLocation(timeoutMs = 6000): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve({});
    const timer = setTimeout(() => resolve({}), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ latitude: +pos.coords.latitude.toFixed(5), longitude: +pos.coords.longitude.toFixed(5) });
      },
      () => {
        clearTimeout(timer);
        resolve({});
      },
      { enableHighAccuracy: true, timeout: timeoutMs },
    );
  });
}
