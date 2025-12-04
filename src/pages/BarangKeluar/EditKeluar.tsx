import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import { toast } from 'react-toastify';
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { getAllCustomers, Customer, getAllBarang, Barang, getTransaksiKeluarById, updateTransaksiKeluar } from '../../service/barangKeluarService';

export default function EditKeluar() {
  const { id } = useParams();
  const [tanggal, setTanggal] = useState("");
  const [customer, setCustomer] = useState("");
  const [barangList, setBarangList] = useState([
    { namaBarang: "", kodeBarang: "", jumlahYard: "", jumlahRol: "", hargaSatuan: "", jumlahYardRetur: "0", jumlahRolRetur: "0" }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [discountType, setDiscountType] = useState("persen");
  const [discountValue, setDiscountValue] = useState(0);
  const [ppnType, setPpnType] = useState("persen");
  const [ppnValue, setPpnValue] = useState(0);
  const [catatan, setCatatan] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [allBarang, setAllBarang] = useState<Barang[]>([]);
  const [activeBarangDropdownIndex, setActiveBarangDropdownIndex] = useState<number | null>(null);
  const [statusPembayaran, setStatusPembayaran] = useState("0");
  const [tenor, setTenor] = useState(1);
  const [tanggalTenor, setTanggalTenor] = useState<string[]>([]);
  const [berjangkaData, setBerjangkaData] = useState<any[]>([]);
  const [minTenor, setMinTenor] = useState(0);

  // Fetch data on mount
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const list = await getAllCustomers();
        if (mounted && list) setCustomers(list);
        const barangList = await getAllBarang();
        if (mounted && barangList) setAllBarang(barangList);

        if (id) {
          const trans = await getTransaksiKeluarById(parseInt(id));
          console.log('Fetched transaksi keluar data:', trans);
          if (mounted && trans) {
            // Extract date part only (YYYY-MM-DD) from ISO timestamp
            const tanggalFormatted = trans.tgl_transaksi ? trans.tgl_transaksi.split('T')[0] : '';
            setTanggal(tanggalFormatted);
            setCustomer(String(trans.pelanggan?.id || ''));
            setSelectedCustomerName(trans.pelanggan?.nama || '');
            setStatusPembayaran(trans.status_pembayaran || '0');
            setTenor(trans.tenor || 1);
            setDiscountType(trans.tipe_discount || 'persen');
            setDiscountValue(trans.jml_discount || 0);
            setPpnType(trans.tipe_ppn || 'persen');
            setPpnValue(trans.jml_ppn || 0);
            setCatatan(trans.catatan || '');

            if (trans.details && trans.details.length > 0) {
              console.log('trans.details:', trans.details);
              setBarangList(trans.details.map((d: any) => {
                // Ambil dari d.barang yang sudah disediakan API
                const barang = d.barang;
                console.log('Detail item d:', d);
                console.log('Found barang:', barang);
                const mapped = {
                  namaBarang: barang?.nama_barang || '',
                  kodeBarang: barang?.kd_barang || '',
                  jumlahYard: String(d.jml_yard),
                  jumlahRol: String(d.jml_rol),
                  hargaSatuan: String(d.harga_satuan),
                  jumlahYardRetur: String(d.jml_yard_retur || 0),
                  jumlahRolRetur: String(d.jml_rol_retur || 0),
                };
                console.log('Mapped barang:', mapped);
                return mapped;
              }));
            }

            if (trans.status_pembayaran === '1' && trans.berjangka && trans.berjangka.length > 0) {
              setBerjangkaData(trans.berjangka);
              setTanggalTenor(trans.berjangka.map((b: any) => b.tgl_jatuh_tempo.split('T')[0]));
              
              // Hitung berapa tenor sudah ada pembayaran (jml_bayar > 0)
              const tenorDenganPembayaran = trans.berjangka.filter((b: any) => b.jml_bayar > 0).length;
              setMinTenor(tenorDenganPembayaran);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Pilih customer terlebih dahulu.');
      return;
    }
    if (barangList.length === 0) {
      toast.error('Tambahkan minimal 1 barang.');
      return;
    }

    setSaving(true);
    try {
      const totalBarang = barangList.reduce((sum, barang) => {
        const actualYard = Math.max(0, Number(barang.jumlahYard || 0) - Number(barang.jumlahYardRetur || 0));
        return sum + (actualYard * Number(barang.hargaSatuan));
      }, 0);

      const discountNominal = discountType === "persen"
        ? (totalBarang * discountValue) / 100
        : discountValue;

      const subtotal = totalBarang - discountNominal;

      const ppnNominal = ppnType === "persen"
        ? (subtotal * ppnValue) / 100
        : ppnValue;

      const totalKeseluruhan = subtotal + ppnNominal;

      const payload = {
        id_pelanggan: customer ? parseInt(customer) : null,
        tgl_transaksi: tanggal || new Date().toISOString().slice(0, 10),
        total_transaksi: Math.round(totalKeseluruhan),
        tipe_discount: discountType,
        jml_discount: discountValue,
        tipe_ppn: ppnType,
        jml_ppn: ppnValue,
        catatan: catatan || null,
        status_pembayaran: statusPembayaran,
        tenor: statusPembayaran === "1" ? tenor : 1,
        tanggal_tenor: statusPembayaran === "1" ? tanggalTenor : [],
        details: barangList.map(b => ({
          id_barang: (allBarang.find(x => x.kd_barang === b.kodeBarang)?.id) ?? null,
          kode_barang: b.kodeBarang || null,
          nama_barang: b.namaBarang || null,
          jml_yard: Number(b.jumlahYard) || 0,
          jml_rol: Number(b.jumlahRol) || 0,
          harga_satuan: Number(b.hargaSatuan) || 0,
        }))
      };
      console.log('UPDATE payload:', JSON.stringify(payload, null, 2));

      const result = await updateTransaksiKeluar(parseInt(id!), payload);
      
      if (!result || !result.status) {
        toast.error(result?.message || 'Gagal memperbarui data.');
        return;
      }

      toast.success('Data barang keluar berhasil diperbarui!');
      // Redirect atau refresh setelah berhasil
      setTimeout(() => {
        window.location.href = '/barang-keluar';
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full mt-8 text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const totalBarang = barangList.reduce((sum, barang) => {
    const actualYard = Math.max(0, Number(barang.jumlahYard || 0) - Number(barang.jumlahYardRetur || 0));
    return sum + (actualYard * Number(barang.hargaSatuan));
  }, 0);

  const discountNominal = discountType === "persen"
    ? (totalBarang * discountValue) / 100
    : discountValue;

  const subtotal = totalBarang - discountNominal;

  const ppnNominal = ppnType === "persen"
    ? (subtotal * ppnValue) / 100
    : ppnValue;

  const totalKeseluruhan = subtotal + ppnNominal;

  return (
    <>
      <PageMeta
        title="Edit Barang Keluar"
        description="Edit data transaksi barang keluar"
      />
      <PageBreadcrumb
        pageTitle="Edit Barang Keluar"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Barang Keluar", link: "/barang-keluar" }}
      />

      <div className="w-full mt-8">
        <ComponentCard title="Form Edit Barang Keluar">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Bagian Atas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Tanggal Transaksi</label>
                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Customer</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari atau pilih customer..."
                    value={selectedCustomerName || customerQuery}
                    onChange={e => { setCustomerQuery(e.target.value); setSelectedCustomerName(''); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                  {showCustomerDropdown && (
                    <ul className="absolute z-50 w-full max-h-48 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded shadow-sm dark:shadow-md">
                      {customers.filter(c => c.nama.toLowerCase().includes((customerQuery || selectedCustomerName).toLowerCase())).map(c => (
                        <li
                          key={c.id}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                      onMouseDown={() => { setCustomer(String(c.id)); setSelectedCustomerName(c.nama); setCustomerQuery(''); setShowCustomerDropdown(false); }}
                        >
                          <span className="truncate">{c.nama}</span>
                          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{c.no_tlp}</span>
                        </li>
                      ))}
                      {customers.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Tidak ada customer</li>}
                    </ul>
                  )}
                </div>
              </div>

              {/* Status Pembayaran */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Status Pembayaran</label>
                <select
                  className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                  value={statusPembayaran}
                  onChange={e => setStatusPembayaran(e.target.value)}
                  required
                >
                  <option value="0">Lunas</option>
                  <option value="1">Berjangka</option>
                </select>
              </div>

              {/* Tenor, shown only if Berjangka */}
              {statusPembayaran === "1" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Tenor (Jumlah Cicilan)</label>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                      value={tenor}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setTenor(val);
                        // Pertahankan tanggal yang sudah ada, tambah kosong untuk tenor baru
                        const arr = [...tanggalTenor];
                        if (val > arr.length) {
                          arr.push(...Array(val - arr.length).fill(""));
                        } else {
                          arr.splice(val);
                        }
                        setTanggalTenor(arr);
                      }}
                    >
                      {[...Array(12)].map((_, i) => {
                        const isDisabled = minTenor > 0 && i + 1 < minTenor;
                        return (
                          <option key={i + 1} value={i + 1} disabled={isDisabled}>
                            {i + 1}x
                          </option>
                        );
                      })}
                    </select>
                    {minTenor > 0 && (
                      <span className="text-xs text-orange-600 dark:text-orange-400 whitespace-nowrap">
                        ⚠️ Min {minTenor} tenor
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tanggal Tenor, shown only if Berjangka */}
              {statusPembayaran === "1" && tenor > 0 && (
                <div className="col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Tanggal Pembayaran per Tenor</label>
                  <div className="grid grid-cols-1 gap-2">
                    {tanggalTenor.map((tgl, idx) => {
                      const berjangkaItem = berjangkaData[idx];
                      const isSudahBayar = berjangkaItem && berjangkaItem.jml_bayar > 0;
                      
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              Angsuran {idx + 1}
                              {isSudahBayar && (
                                <span className="text-orange-600 dark:text-orange-400 ml-2">
                                  (Sudah dibayar: Rp {Number(berjangkaItem.jml_bayar).toLocaleString()})
                                </span>
                              )}
                            </span>
                          </div>
                          <input
                            type="date"
                            value={tgl}
                            onChange={e => {
                              const arr = [...tanggalTenor];
                              arr[idx] = e.target.value;
                              setTanggalTenor(arr);
                            }}
                            disabled={isSudahBayar}
                            className={`border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 ${
                              isSudahBayar ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''
                            }`}
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bagian Bawah: List Barang Dinamis */}
            <div className="space-y-4">
              {barangList.map((barang, idx) => {
                console.log('barang:', barang);
                const actualYard = Math.max(0, Number(barang.jumlahYard || 0) - Number(barang.jumlahYardRetur || 0));
                const totalHarga = actualYard * Number(barang.hargaSatuan || 0);
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama Barang</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={barang.namaBarang}
                          onChange={e => {
                            const newList = [...barangList];
                            newList[idx].namaBarang = e.target.value;
                            setBarangList(newList);
                            setActiveBarangDropdownIndex(idx);
                          }}
                          onFocus={() => setActiveBarangDropdownIndex(idx)}
                          className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Cari barang..."
                          required
                        />
                        {activeBarangDropdownIndex === idx && (
                          <ul className="absolute z-40 w-full max-h-48 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded shadow-sm">
                            {allBarang.filter(b => b.nama_barang.toLowerCase().includes((barang.namaBarang || '').toLowerCase())).map(b => (
                              <li key={b.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                                onMouseDown={() => {
                                  const newList = [...barangList];
                                  newList[idx].namaBarang = b.nama_barang;
                                  newList[idx].kodeBarang = b.kd_barang;
                                  newList[idx].jumlahYard = "0";
                                  setBarangList(newList);
                                  setActiveBarangDropdownIndex(null);
                                }}
                              >
                                <div className="truncate">
                                  <div className="font-medium">{b.nama_barang}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">KD: {b.kd_barang} • Yard: {b.jml_yard}</div>
                                </div>
                                <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">{b.kd_barang}</div>
                              </li>
                            ))}
                            {allBarang.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Tidak ada barang</li>}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Kode Barang</label>
                      <input
                        type="text"
                        value={barang.kodeBarang}
                        readOnly
                        className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                        placeholder="Pilih barang terlebih dahulu"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Jumlah Yard</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="^[0-9]*[.]?[0-9]*$"
                        value={barang.jumlahYard}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          const cleanVal = val.split(".").length > 2 ? val.replace(/\.+$/, "") : val;
                          const newList = [...barangList];
                          newList[idx].jumlahYard = cleanVal;
                          setBarangList(newList);
                        }}
                        className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                        min="0"
                        required
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Retur: {barang.jumlahYardRetur || '0'} yard</div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Jumlah Rol</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="^[0-9]*[.]?[0-9]*$"
                        value={barang.jumlahRol}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          const cleanVal = val.split(".").length > 2 ? val.replace(/\.+$/, "") : val;
                          const newList = [...barangList];
                          newList[idx].jumlahRol = cleanVal;
                          setBarangList(newList);
                        }}
                        className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                        min="0"
                        required
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Retur: {barang.jumlahRolRetur || '0'} rol</div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Harga Per Yard</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="^[0-9]*$"
                        value={barang.hargaSatuan}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const newList = [...barangList];
                          newList[idx].hargaSatuan = val;
                          setBarangList(newList);
                        }}
                        className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Total Harga</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={totalHarga} readOnly className="border rounded px-3 py-2 w-full bg-gray-100 dark:bg-gray-800 dark:text-white/90" />
                        {barangList.length > 1 && (
                          <button type="button" className="text-red-500 hover:text-red-700 text-lg font-bold" title="Hapus baris" onClick={() => {
                            setBarangList(barangList.filter((_, i) => i !== idx));
                          }}>
                            &#10005;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="button" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => setBarangList([...barangList, { namaBarang: "", kodeBarang: "", jumlahYard: "", jumlahRol: "", hargaSatuan: "", jumlahYardRetur: "0", jumlahRolRetur: "0" }])}>
                + Tambah Barang
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Discount</label>
                <div className="flex gap-2">
                  <select className="border rounded px-2 py-2 dark:bg-gray-900 dark:text-white/90" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                    <option value="persen">%</option>
                    <option value="harga">Rp</option>
                  </select>
                  <input type="number" min="0" value={discountValue === 0 ? "" : discountValue.toString()} onChange={e => setDiscountValue(Number(e.target.value.replace(/^0+/, "")))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" placeholder="Discount" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">PPN</label>
                <div className="flex gap-2">
                  <select className="border rounded px-2 py-2 dark:bg-gray-900 dark:text-white/90" value={ppnType} onChange={e => setPpnType(e.target.value)}>
                    <option value="persen">%</option>
                    <option value="harga">Rp</option>
                  </select>
                  <input type="number" min="0" value={ppnValue === 0 ? "" : ppnValue.toString()} onChange={e => setPpnValue(Number(e.target.value.replace(/^0+/, "")))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" placeholder="PPN" />
                </div>
              </div>
            </div>
            {/* Catatan */}
            <div className="pt-6">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Catatan (Opsional)</label>
              <textarea className="border rounded px-3 py-2 w-full min-h-[80px] dark:bg-gray-900 dark:text-white/90" placeholder="Catatan tambahan..." value={catatan} onChange={e => setCatatan(e.target.value)} />
            </div>
            {/* Total Harga Keseluruhan */}
            <div className="pt-6">
              <div className="text-lg font-semibold text-gray-700 dark:text-white flex flex-col gap-1">
                <span>Total Harga Barang: <span className="font-bold">Rp {totalBarang.toLocaleString()}</span></span>
                <span>Discount: <span className="font-bold">Rp {discountNominal.toLocaleString()}</span></span>
                <span>Subtotal: <span className="font-bold">Rp {subtotal.toLocaleString()}</span></span>
                <span>PPN: <span className="font-bold">Rp {ppnNominal.toLocaleString()}</span></span>
                <span className="text-blue-600">Total Harga Keseluruhan: <span className="font-bold">Rp {totalKeseluruhan.toLocaleString()}</span></span>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
