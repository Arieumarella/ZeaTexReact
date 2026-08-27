import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

export interface Pelanggan {
	id: number;
	nama: string;
	no_tlp: string;
	noWhatsapp?: string;
	created_at: string;
	updated_at: string;
}

export interface PelangganDetailResponse {
	status: boolean;
	pelanggan?: Pelanggan;
	message?: string;
}

export interface CreatePelangganPayload {
	nama: string;
	no_tlp: string;
}

export interface PelangganListResponse {
	status: boolean;
	data: Pelanggan[];
	page: number;
	total: number;
	totalPages: number;
	message?: string;
}

export async function deletePelanggan(id: number): Promise<{ status: boolean; message?: string }> {
	try {
		const response = await fetch(`${API_BASE}/pelanggan/${id}`, {
			method: 'DELETE',
			headers: getAuthHeaders(),
		});
		const data = await response.json();
		if (!response.ok || !data.status) {
			toast.error(data.message || 'Gagal menghapus pelanggan.');
			if (data.message === 'Invalid token') {
				window.location.replace('/');
			}
			return { status: false, message: data.message || 'Gagal menghapus pelanggan.' };
		}
		toast.success('Pelanggan berhasil dihapus!');
		return { status: true };
	} catch (error) {
		toast.error('Terjadi kesalahan jaringan.');
		return { status: false, message: 'Terjadi kesalahan jaringan.' };
	}
}

export async function getDetailPelanggan(id: number): Promise<PelangganDetailResponse | null> {
	try {
		const response = await fetch(`${API_BASE}/pelanggan/${id}`, {
			method: 'GET',
			headers: getAuthHeaders(),
		});
		if (!response.ok) {
			toast.error('Gagal mengambil detail pelanggan.');
			return null;
		}
		const data = await response.json();
		if (data && data.status === false && data.message === 'Invalid token') {
			toast.error('Token tidak valid, silakan login ulang.');
			window.location.replace('/');
			return null;
		}
		if (!data.status) {
			toast.error(data.message || 'Gagal mengambil detail pelanggan.');
			return null;
		}
		if (data.pelanggan) {
			data.pelanggan.noWhatsapp = data.pelanggan.no_tlp;
		}
		return data;
	} catch (error) {
		toast.error('Terjadi kesalahan jaringan.');
		return null;
	}
}

export async function updatePelanggan(id: number, payload: { nama: string; no_tlp: string }): Promise<{ status: boolean; message?: string }> {
	try {
		const response = await fetch(`${API_BASE}/pelanggan/${id}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		if (!response.ok || !data.status) {
			toast.error(data.message || 'Gagal update pelanggan.');
			if (data.message === 'Invalid token') {
				window.location.replace('/');
			}
			return { status: false, message: data.message || 'Gagal update pelanggan.' };
		}
		toast.success('Pelanggan berhasil diupdate!');
		return { status: true };
	} catch (error) {
		toast.error('Terjadi kesalahan jaringan.');
		return { status: false, message: 'Terjadi kesalahan jaringan.' };
	}
}

export async function createPelanggan(payload: CreatePelangganPayload): Promise<{ status: boolean; message?: string }> {
	try {
		const response = await fetch(API_BASE + '/pelanggan', {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		if (!response.ok || !data.status) {
			toast.error(data.message || 'Gagal menambah pelanggan.');
			if (data.message === 'Invalid token') {
				window.location.replace('/');
			}
			return { status: false, message: data.message || 'Gagal menambah pelanggan.' };
		}
		toast.success('Pelanggan berhasil ditambahkan!');
		return { status: true };
	} catch (error) {
		toast.error('Terjadi kesalahan jaringan.');
		return { status: false, message: 'Terjadi kesalahan jaringan.' };
	}
}

export async function getPelanggan(page: number = 1, search: string = ""): Promise<PelangganListResponse | null> {
	try {
		const params = new URLSearchParams({ page: String(page) });
		if (search) params.append('search', search);
		const response = await fetch(`${API_BASE}/pelanggan?${params.toString()}`, {
			method: 'GET',
			headers: getAuthHeaders(),
		});
		if (!response.ok) {
			toast.error('Gagal mengambil data pelanggan.');
			return null;
		}
		const data = await response.json();
		if (data && data.status === false && data.message === 'Invalid token') {
			toast.error('Token tidak valid, silakan login ulang.');
			window.location.replace('/');
			return null;
		}
		if (!data.status) {
			toast.error(data.message || 'Gagal mengambil data pelanggan.');
			return null;
		}
		const mapped = {
			...data,
			data: Array.isArray(data.data)
				? data.data.map((item: any) => ({ ...item, noWhatsapp: item.no_tlp }))
				: [],
		};
		return mapped;
	} catch (error) {
		toast.error('Terjadi kesalahan jaringan.');
		return null;
	}
}

