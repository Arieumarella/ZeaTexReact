export interface WatermarkData {
  name: string;
  store: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

export function drawAttendanceWatermark(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: WatermarkData,
) {
  const { width, height } = canvas;

  const bandHeight = Math.max(70, Math.round(height * 0.22));
  context.fillStyle = 'rgba(0, 0, 0, 0.55)';
  context.fillRect(0, 0, width, bandHeight);

  context.fillStyle = '#ffffff';
  context.font = 'bold 22px Arial, sans-serif';
  context.textBaseline = 'top';
  context.fillText(data.name, 14, 12);

  context.font = '16px Arial, sans-serif';
  context.fillText(`${data.store}  |  ${data.timestamp}`, 14, 40);

  const coordinateText = `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)} (${Math.round(data.distanceMeters)} m)`;
  context.fillText(coordinateText, 14, 60);
}
