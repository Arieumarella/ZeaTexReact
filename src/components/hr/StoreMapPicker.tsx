import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
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
  const hasLocation = latitude !== null && longitude !== null;
  const center: [number, number] = hasLocation
    ? [latitude as number, longitude as number]
    : [-2.5489, 118.0149];

  return (
    <div>
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
