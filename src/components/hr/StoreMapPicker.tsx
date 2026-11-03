import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

interface FlyTarget {
  lat: number;
  lng: number;
  nonce: number;
}

function FlyToLocation({ target }: { target: FlyTarget | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 17), {
      duration: 0.8,
    });
  }, [target, map]);

  return null;
}

interface StoreMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
}

export default function StoreMapPicker({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
}: StoreMapPickerProps) {
  const [locating, setLocating] = useState(false);
  const [locateMessage, setLocateMessage] = useState<string | null>(null);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);

  const hasLocation = latitude !== null && longitude !== null;
  const center: [number, number] = hasLocation
    ? [latitude as number, longitude as number]
    : [-2.5489, 118.0149];

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocateError('Browser ini tidak mendukung akses lokasi.');
      return;
    }
    setLocating(true);
    setLocateError(null);
    setLocateMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(7));
        const lng = Number(position.coords.longitude.toFixed(7));
        const accuracy = Math.round(position.coords.accuracy);
        onLocationChange(lat, lng);
        setFlyTarget({ lat, lng, nonce: Date.now() });
        setLocating(false);
        setLocateMessage(
          `Titik lokasi Anda berhasil dipakai (akurasi ±${accuracy} m). Silakan simpan konfigurasi.`
        );
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocateError(
            'Izin lokasi ditolak browser. Izinkan akses lokasi untuk situs ini lalu coba lagi.'
          );
        } else if (error.code === error.TIMEOUT) {
          setLocateError(
            'Waktu mencari lokasi habis. Coba lagi di tempat dengan sinyal GPS/lokasi lebih baik.'
          );
        } else {
          setLocateError(
            'Gagal mendapatkan lokasi. Pastikan GPS/lokasi perangkat aktif lalu coba lagi.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Berdiri di titik lokasi kantor, lalu gunakan tombol ini untuk menandai posisinya otomatis.
        </span>
        <button
          onClick={useMyLocation}
          disabled={locating}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {locating ? 'Mencari lokasi...' : '📍 Gunakan Lokasi Saya Sekarang'}
        </button>
      </div>

      {locateError && (
        <p className="mb-2 text-xs text-red-600 dark:text-red-400">{locateError}</p>
      )}
      {locateMessage && (
        <p className="mb-2 text-xs text-emerald-600 dark:text-emerald-400">{locateMessage}</p>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-[380px]">
        <MapContainer center={center} zoom={hasLocation ? 17 : 5} scrollWheelZoom className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            onPick={(lat, lng) => {
              onLocationChange(Number(lat.toFixed(7)), Number(lng.toFixed(7)));
            }}
          />
          <FlyToLocation target={flyTarget} />
          {hasLocation && (
            <>
              <Circle
                center={[latitude as number, longitude as number]}
                radius={radius}
                pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }}
              />
              <Marker
                icon={defaultIcon}
                draggable
                position={[latitude as number, longitude as number]}
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    onLocationChange(Number(position.lat.toFixed(7)), Number(position.lng.toFixed(7)));
                  },
                }}
              />
            </>
          )}
        </MapContainer>
      </div>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Radius: {radius} m
        </label>
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={radius}
          onChange={(event) => onRadiusChange(parseInt(event.target.value, 10))}
          className="flex-1 min-w-[200px]"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {hasLocation
          ? 'Klik peta atau geser marker untuk mengubah titik lokasi toko.'
          : 'Klik peta untuk menentukan titik lokasi toko.'}
      </p>
    </div>
  );
}
