import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { clockInOut } from '../../service/hrEmployeeService';
import type { MyToday } from '../../types/hr';
import { haversineMeters } from '../../utils/geo';
import { drawAttendanceWatermark } from '../../utils/attendanceWatermark';
import StatusBadge from '../../components/hr/StatusBadge';
import { formatTime } from '../../utils/hrFormat';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface AttendanceTabProps {
  data: MyToday | null;
  serverNow: Date;
  onRefresh: () => void;
}

export default function AttendanceTab({ data, serverNow, onRefresh }: AttendanceTabProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [geoError, setGeoError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kamera tidak tersedia di browser ini.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraReady(true);
      setCameraError('');
    } catch {
      setCameraError('Izin kamera ditolak. Izinkan akses kamera di browser lalu muat ulang halaman.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation tidak didukung di browser ini.');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (geoPosition) => {
        setPosition({
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
        });
        setGeoError('');
      },
      () => {
        setGeoError('Izin lokasi ditolak. Aktifkan GPS/lokasi lalu muat ulang halaman.');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const hrStore = data?.hr_store || null;
  const distance =
    position && hrStore && hrStore.latitude !== null && hrStore.longitude !== null
      ? haversineMeters(position.latitude, position.longitude, hrStore.latitude, hrStore.longitude)
      : null;
  const inRadius = distance !== null && hrStore !== null && distance <= hrStore.radius_meters;
  const locationConfigured = Boolean(hrStore?.location_configured);

  function capturePhoto(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        toast.error('Kamera belum siap.');
        resolve(null);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(null);
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const positionForWatermark = position || { latitude: 0, longitude: 0, accuracy: 0 };
      const name = data?.profile?.user?.nama || localStorage.getItem('auth_nama') || 'Pegawai';
      const store = hrStore?.nama_toko || '';

      drawAttendanceWatermark(canvas, context, {
        name,
        store,
        timestamp: new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(serverNow),
        latitude: positionForWatermark.latitude,
        longitude: positionForWatermark.longitude,
        distanceMeters: distance ?? 0,
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          setCapturedPhoto(blob);
          setCapturedPreview(canvas.toDataURL('image/jpeg', 0.85));
          resolve(blob);
        },
        'image/jpeg',
        0.85,
      );
    });
  }

  async function submit(type: 'IN' | 'OUT') {
    if (!data) return;
    if (!inRadius) {
      toast.error('Anda berada di luar area toko.');
      return;
    }
    if (!position) {
      toast.error('Lokasi belum terdeteksi.');
      return;
    }
    if (!capturedPhoto) {
      toast.error('Ambil foto selfie terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('latitude', String(position.latitude));
    formData.append('longitude', String(position.longitude));
    formData.append('accuracy', String(position.accuracy));
    formData.append('photo', capturedPhoto, 'selfie.jpg');

    setSubmitting(true);
    const res = await clockInOut(formData);
    setSubmitting(false);
    if (res.status) {
      toast.success(res.message || 'Absensi berhasil.');
      setCapturedPhoto(null);
      setCapturedPreview(null);
      onRefresh();
    } else {
      toast.error(res.message || 'Absensi gagal diproses.');
    }
  }

  const attendance = data?.attendance || null;
  const clockText = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(serverNow);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white text-center">
        <div className="text-sm opacity-80">{hrStore?.nama_toko || 'Toko'}</div>
        <div className="text-4xl font-bold mt-1 tabular-nums">{clockText}</div>
        <div className="mt-2 text-xs opacity-80">
          Jam kerja {hrStore?.work_start_time || '-'} – {hrStore?.work_end_time || '-'} WIB
        </div>
      </div>

      {attendance && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Absensi hari ini</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Masuk {formatTime(attendance.check_in_time)} · Pulang {formatTime(attendance.check_out_time)}
            </div>
          </div>
          <StatusBadge status={attendance.status} />
        </div>
      )}

      <div
        className={`rounded-2xl border p-4 ${
          inRadius
            ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
            : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Status Lokasi</span>
          <span className={`text-xs font-bold ${inRadius ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {!locationConfigured
              ? 'LOKASI TOKO BELUM DIATUR'
              : inRadius
                ? 'DALAM AREA'
                : 'LUAR AREA'}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          {position
            ? `Jarak ke toko: ${distance !== null ? `${Math.round(distance)} m` : '-'} (akurasi ±${Math.round(position.accuracy)} m)`
            : 'Mencari lokasi...'}
          {geoError ? ` — ${geoError}` : ''}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {cameraError ? (
          <div className="p-6 text-center text-sm text-red-600">{cameraError}</div>
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full aspect-[4/3] object-cover bg-gray-900"
          />
        )}
        {capturedPreview && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex items-center gap-3">
            <img src={capturedPreview} alt="Hasil foto" className="w-20 h-20 object-cover rounded-lg" />
            <div className="text-xs text-gray-500">Foto siap dikirim. Ambil ulang jika perlu.</div>
          </div>
        )}
        <div className="p-3 flex gap-2">
          <button
            onClick={async () => {
              await capturePhoto();
            }}
            disabled={!cameraReady}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-40"
          >
            Ambil Foto
          </button>
          <button
            onClick={() => {
              setCapturedPhoto(null);
              setCapturedPreview(null);
            }}
            disabled={!capturedPhoto}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-40"
          >
            Ulang
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => submit('IN')}
          disabled={Boolean(attendance) || !inRadius || submitting || !locationConfigured}
          className="px-4 py-3 rounded-xl bg-green-600 text-white font-bold disabled:opacity-40"
        >
          {submitting ? 'Memproses...' : 'ABSEN MASUK'}
        </button>
        <button
          onClick={() => submit('OUT')}
          disabled={!attendance || Boolean(attendance?.check_out_time) || !inRadius || submitting || !locationConfigured}
          className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-40"
        >
          {submitting ? 'Memproses...' : 'ABSEN PULANG'}
        </button>
      </div>
      {!locationConfigured && (
        <p className="text-xs text-center text-amber-600">
          Lokasi toko belum diatur admin. Hubungi admin untuk mengatur titik lokasi toko.
        </p>
      )}
    </div>
  );
}
