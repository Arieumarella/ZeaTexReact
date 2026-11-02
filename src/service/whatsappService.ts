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
