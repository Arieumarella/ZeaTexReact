import React, { useEffect, useState } from 'react';
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { getProfile, updateProfile, ProfileData } from '../../service/profileService';
import { toast, ToastContainer } from 'react-toastify';

const ProfilePage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [profile, setProfile] = useState<Partial<ProfileData>>({});

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			const data = await getProfile();
			if (data) setProfile(data);
			setLoading(false);
		};
		load();
	}, []);

	const handleChange = (key: keyof ProfileData, value: any) => {
		setProfile(prev => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const payload: Partial<ProfileData> = {
			nama_toko: profile.nama_toko || null,
			alamat: profile.alamat || null,
			nomor_telepon_1: profile.nomor_telepon_1 || null,
			nomor_telepon_2: profile.nomor_telepon_2 || null,
			nomor_telepon3: profile.nomor_telepon3 || null,
			rekening: profile.rekening || null,
			nama_rekening: profile.nama_rekening || null,
			maps: profile.maps || null,
		};

		const res = await updateProfile(payload);
		if (res && res.status) {
			setProfile(res.data || profile);
		} else if (res && !res.status) {
			toast.error(res.message || 'Gagal memperbarui profile');
		}
		setSaving(false);
	};

	return (
		<div className="p-4">
			<ComponentCard title="Profile Toko">
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label>Nama Toko</Label>
							<input value={profile.nama_toko || ''} onChange={e => handleChange('nama_toko', e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div>
							<Label>Nomor Telepon 1</Label>
							<input value={profile.nomor_telepon_1 || ''} onChange={e => handleChange('nomor_telepon_1', e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div>
							<Label>Nomor Telepon 2</Label>
							<input value={profile.nomor_telepon_2 || ''} onChange={e => handleChange('nomor_telepon_2', e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div>
							<Label>Nomor Telepon 3</Label>
							<input value={profile.nomor_telepon3 || ''} onChange={e => handleChange('nomor_telepon3', e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div className="md:col-span-2">
							<Label>Alamat</Label>
							<textarea value={profile.alamat || ''} onChange={e => handleChange('alamat', e.target.value)} rows={3} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div>
							<Label>Rekening</Label>
							<input value={profile.rekening || ''} onChange={e => handleChange('rekening', e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div>
							<Label>Nama Rekening</Label>
							<input value={profile.nama_rekening || ''} onChange={e => handleChange('nama_rekening', e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>

						<div className="md:col-span-2">
							<Label>Maps (embed URL / json)</Label>
							<textarea value={profile.maps || ''} onChange={e => handleChange('maps', e.target.value)} rows={3} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white/90" />
						</div>
					</div>

					<div className="mt-4 flex items-center gap-2">
						<button type="submit" disabled={saving} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
						<button type="button" onClick={async () => { setLoading(true); const data = await getProfile(); if (data) setProfile(data); setLoading(false); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded">{loading ? 'Memuat...' : 'Muat Ulang'}</button>
					</div>
				</form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 9999999 }} />
			</ComponentCard>
		</div>
	);
};

export default ProfilePage;
