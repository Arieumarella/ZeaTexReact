// src/service/whatsappService.ts
import { getErrorMessage } from '../utils/errorMessage';

const WA_API_BASE = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:5000';

export interface WhatsAppStatus {
    ready: boolean;
}

export interface WhatsAppQR {
    qr: string;
}

interface WhatsAppResponse {
    ready?: unknown;
    qr?: unknown;
    message?: string;
    error?: string;
}

async function requestJson(path: string, fallbackMessage: string): Promise<WhatsAppResponse> {
    try {
        const response = await fetch(`${WA_API_BASE}${path}`);
        const data: WhatsAppResponse | null = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || fallbackMessage);
        }

        return data ?? {};
    } catch (error) {
        throw new Error(getErrorMessage(error, fallbackMessage));
    }
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
    const data = await requestJson('/status', 'Gagal mengambil status WhatsApp.');

    if (typeof data?.ready !== 'boolean') {
        throw new Error(data?.message || 'Respons status WhatsApp tidak valid.');
    }

    return { ready: data.ready };
}

export async function getWhatsAppQR(): Promise<WhatsAppQR> {
    const data = await requestJson('/qr', 'Gagal mengambil QR dari server WhatsApp.');

    if (typeof data?.qr !== 'string' || !data.qr.trim()) {
        throw new Error(data?.message || 'QR WhatsApp tidak tersedia.');
    }

    return { qr: data.qr };
}

/**
 * Paksa buat sesi WhatsApp baru: sesi lama (jika ada) di-logout & dihapus.
 * Butuh login app (header Authorization Bearer <JWT>).
 * Endpoint: POST /session/reset -> { status:true, qr: "data:image/png;base64,..." }
 */
export async function resetWhatsAppSession(): Promise<WhatsAppQR> {
    const token = localStorage.getItem('auth_token');

    let response: Response;
    try {
        response = await fetch(`${WA_API_BASE}/session/reset`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Gagal menghubungi server WhatsApp.'));
    }

    const data: WhatsAppResponse | null = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error(data?.error || data?.message || 'Sesi login tidak valid. Silakan login kembali.');
        }
        throw new Error(data?.error || data?.message || 'Gagal membuat sesi WhatsApp baru.');
    }

    if (typeof data?.qr !== 'string' || !data.qr.trim()) {
        throw new Error(data?.error || data?.message || 'QR WhatsApp tidak tersedia.');
    }

    return { qr: data.qr };
}
