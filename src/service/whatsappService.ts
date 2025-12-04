// src/service/whatsappService.ts
const WA_API_BASE = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:5000';

export interface WhatsAppStatus {
    ready: boolean;
}

export interface WhatsAppQR {
    qr: string;
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
    const response = await fetch(`${WA_API_BASE}/status`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || 'Gagal mengambil status WhatsApp');
    }

    if (typeof data?.ready !== 'boolean') {
        throw new Error(data?.message || 'Response status tidak valid');
    }

    return data;
}

export async function getWhatsAppQR(): Promise<WhatsAppQR> {
    const response = await fetch(`${WA_API_BASE}/qr`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || 'Gagal mengambil QR dari server');
    }

    if (typeof data?.qr !== 'string') {
        throw new Error(data?.message || 'QR tidak tersedia');
    }

    return data;
}
