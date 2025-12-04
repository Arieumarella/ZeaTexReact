const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function deletePelanggan(id: number): Promise<{ status: boolean; message?: string }> {
	const token = localStorage.getItem('auth_token');
	if (!token) {
		toast.error('Token tidak ditemukan, silakan login ulang.');
		window.location.replace('/');
		return { status: false, message: 'Token tidak ditemukan' };
	}
	try {
		const response = await fetch(`${API_BASE}/pelanggan/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
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
export interface PelangganDetailResponse {
	status: boolean;
	pelanggan?: Pelanggan;
	message?: string;
}

export async function getDetailPelanggan(id: number): Promise<PelangganDetailResponse | null> {
	const token = localStorage.getItem('auth_token');
	if (!token) {
		toast.error('Token tidak ditemukan, silakan login ulang.');
		window.location.replace('/');
		return null;
	}
	try {
		const response = await fetch(`${API_BASE}/pelanggan/${id}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
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
		// Map no_tlp to noWhatsapp
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
	const token = localStorage.getItem('auth_token');
	if (!token) {
		toast.error('Token tidak ditemukan, silakan login ulang.');
		window.location.replace('/');
		return { status: false, message: 'Token tidak ditemukan' };
	}
	try {
		const response = await fetch(`${API_BASE}/pelanggan/${id}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
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
export interface CreatePelangganPayload {
	nama: string;
	no_tlp: string;
}

export async function createPelanggan(payload: CreatePelangganPayload): Promise<{ status: boolean; message?: string }> {
	const token = localStorage.getItem('auth_token');
	if (!token) {
		toast.error('Token tidak ditemukan, silakan login ulang.');
		window.location.replace('/');
		return { status: false, message: 'Token tidak ditemukan' };
	}
	try {
		const response = await fetch(API_BASE + '/pelanggan', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
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
import { toast } from 'react-toastify';

export interface Pelanggan {
	id: number;
	nama: string;
	no_tlp: string;
	noWhatsapp?: string;
	created_at: string;
	updated_at: string;
}

export interface PelangganListResponse {
	status: boolean;
	data: Pelanggan[];
	page: number;
	total: number;
	totalPages: number;
	message?: string;
}

export async function getPelanggan(page: number = 1, search: string = ""): Promise<PelangganListResponse | null> {
	const token = localStorage.getItem('auth_token');
	if (!token) {
		toast.error('Token tidak ditemukan, silakan login ulang.');
		window.location.replace('/');
		return null;
	}
	try {
		const params = new URLSearchParams({ page: String(page) });
		if (search) params.append('search', search);
		const response = await fetch(`${API_BASE}/pelanggan?${params.toString()}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
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
		// Map no_tlp to noWhatsapp for frontend compatibility
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
