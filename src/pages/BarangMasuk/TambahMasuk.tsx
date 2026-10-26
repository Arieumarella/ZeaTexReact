import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { getAllSuppliers, Supplier, getAllBarang, Barang, createTransaksiMasuk } from '../../service/barangMasuk';

export default function TambahMasuk() {
  const [tanggal, setTanggal] = useState("");
  const [suplier, setSuplier] = useState("");
  const [barangList, setBarangList] = useState([
    { namaBarang: "", kodeBarang: "", jumlahYard: "", jumlahRol: "", hargaSatuan: "" }
  ]);
  const [loading, setLoading] = useState(false);
  // State untuk discount, tipe discount, ppn, tipe ppn, dan catatan
  const [discountType, setDiscountType] = useState("persen");
  const [discountValue, setDiscountValue] = useState(0);
  const [catatan, setCatatan] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState("");
  const [allBarang, setAllBarang] = useState<Barang[]>([]);
  const [activeBarangDropdownIndex, setActiveBarangDropdownIndex] = useState<number | null>(null);

  // State for pembayaran
  const [statusPembayaran, setStatusPembayaran] = useState("0"); // "0" = Lunas, "1" = Berjangka
  const [tenor, setTenor] = useState(1); // default 1x cicilan
  const [tanggalTenor, setTanggalTenor] = useState<string[]>([""]);

  // State for nota upload
  const [nota, setNota] = useState<File | null>(null);
  const [notaKey, setNotaKey] = useState(Date.now());

  // Hitung total harga barang
  const totalBarang = barangList.reduce((sum, barang) => {
    return sum + (Number(barang.jumlahYard) * Number(barang.hargaSatuan));
  }, 0);

  // Hitung discount
  const discountNominal = discountType === "persen"
    ? (totalBarang * discountValue) / 100
    : discountValue;

  // Hitung subtotal setelah discount
  const subtotal = totalBarang - discountNominal;

  // Perhitungan Pajak Otomatis (DPP Nilai Lain & Tax)
  const dppNilaiLain = Math.round((11 / 12) * subtotal);
  const taxNominal = Math.round(0.12 * dppNilaiLain);
  const totalKeseluruhan = subtotal + taxNominal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suplier) {
      toast.error('Pilih supplier terlebih dahulu.');
      return;
    }
    if (barangList.length === 0) {
      toast.error('Tambahkan minimal 1 barang.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_supplier: suplier ? parseInt(suplier) : null,
        id_user: null,
        tgl_transaksi: tanggal || new Date().toISOString().slice(0, 10),
        total_transaksi: totalKeseluruhan,
        tipe_discount: discountType,
        jml_discount: discountValue,
        tipe_ppn: "persen",
        jml_ppn: 11,
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
      console.log('POST payload:', JSON.stringify(payload, null, 2));
      const data = await createTransaksiMasuk(payload, nota);
      if (!data || !data.status) {
        if (data && data.message === 'Invalid token') window.location.replace('/');
        toast.error(data?.message || 'Gagal menyimpan data.');
        return;
      }

      // Success notification
      toast.success('Data barang masuk berhasil disimpan!');

      // Clear form
      setBarangList([{ namaBarang: "", kodeBarang: "", jumlahYard: "", jumlahRol: "", hargaSatuan: "" }]);
      setTanggal("");
      setSuplier("");
      setSelectedSupplierName("");
      setStatusPembayaran("0");
      setTenor(1);
      setTanggalTenor([""]);
      setDiscountType("persen");
      setDiscountValue(0);
      setCatatan("");
      setNota(null);
      setNotaKey(Date.now());

    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchSup() {
      const list = await getAllSuppliers();
      if (mounted && list) setSuppliers(list);
    }
    fetchSup();
    async function fetchBarang() {
      const list = await getAllBarang();
      if (mounted && list) setAllBarang(list);
    }
    fetchBarang();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <PageMeta
        title="Tambah Barang Masuk"
        description="Form tambah barang masuk di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Tambah Barang Masuk"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Barang Masuk", link: "/barang-masuk" }}
      />

      <div className="w-full mt-8">
        <ComponentCard title="Form Tambah Barang Masuk">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Bagian Atas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Tanggal Transaksi</label>
                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Suplier</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari atau pilih supplier..."
                    value={selectedSupplierName || supplierQuery}
                    onChange={e => { setSupplierQuery(e.target.value); setSelectedSupplierName(''); setShowSupplierDropdown(true); }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                  {showSupplierDropdown && (
                    <ul className="absolute z-50 w-full max-h-48 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded shadow-sm dark:shadow-md">
                      {suppliers.filter(s => s.nama.toLowerCase().includes((supplierQuery || selectedSupplierName).toLowerCase())).map(s => (
                        <li
                          key={s.id}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                          onMouseDown={() => { setSuplier(String(s.id)); setSelectedSupplierName(s.nama); setSupplierQuery(''); setShowSupplierDropdown(false); }}
                        >
                          <span className="truncate">{s.nama}</span>
                          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{s.no_tlp}</span>
                        </li>
                      ))}
                      {suppliers.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Tidak ada supplier</li>}
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
                  <select
                    className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                    value={tenor}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setTenor(val);
                      setTanggalTenor(Array(val).fill(""));
                    }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}x</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tanggal Tenor, shown only if Berjangka */}
              {statusPembayaran === "1" && tenor > 0 && (
                <div className="col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Tanggal Pembayaran per Tenor</label>
                  <div className="grid grid-cols-1 gap-2">
                    {tanggalTenor.map((tgl, idx) => (
                      <div key={idx}>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Angsuran {idx + 1}</span>
                        <input
                          type="date"
                          value={tgl}
                          onChange={e => {
                            const arr = [...tanggalTenor];
                            arr[idx] = e.target.value;
                            setTanggalTenor(arr);
                          }}
                          className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6">

            </div>

            {/* Bagian Bawah: List Barang Dinamis */}
            <div className="space-y-4">
              {barangList.map((barang, idx) => {
                const totalHarga = Number(barang.jumlahYard) * Number(barang.hargaSatuan);
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
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
                          placeholder="Cari atau pilih barang..."
                          required
                        />
                        {activeBarangDropdownIndex === idx && (
                          <ul className="absolute z-40 w-full max-h-48 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded shadow-sm">
                            {allBarang.filter(b => {
                              const q = (barang.namaBarang || '').toLowerCase();
                              return b.nama_barang.toLowerCase().includes(q) || b.kd_barang.toLowerCase().includes(q);
                            }).map(b => (
                              <li key={b.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                                onMouseDown={() => {
                                  const newList = [...barangList];
                                  newList[idx].namaBarang = b.nama_barang;
                                  newList[idx].kodeBarang = b.kd_barang;
                                  // Do not prefill with stock; set to 0 because this is a purchase quantity
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
                        placeholder="Pilih barang untuk mengisi kode"
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
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Harga PerYard</label>
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
                        {/* Icon X untuk hapus baris */}
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
              <button type="button" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => setBarangList([...barangList, { namaBarang: "", kodeBarang: "", jumlahYard: "", jumlahRol: "", hargaSatuan: "" }])}>
                + Tambah Barang
              </button>
            </div>

            <div className="pt-6">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Discount (Opsional)</label>
              <div className="flex gap-2 max-w-md">
                <select className="border rounded px-2 py-2 dark:bg-gray-900 dark:text-white/90" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                  <option value="persen">%</option>
                  <option value="harga">Rp</option>
                </select>
                <input type="number" min="0" value={discountValue === 0 ? "" : discountValue.toString()} onChange={e => setDiscountValue(Number(e.target.value.replace(/^0+/, "")))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" placeholder="Discount" />
              </div>
            </div>
            {/* Catatan */}
            <div className="pt-6">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Catatan (Opsional)</label>
              <textarea className="border rounded px-3 py-2 w-full min-h-[80px] dark:bg-gray-900 dark:text-white/90" placeholder="Catatan tambahan..." value={catatan} onChange={e => setCatatan(e.target.value)} />
            </div>
            {/* Nota Pembayaran */}
            <div className="pt-6">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nota Pembayaran (Opsional)</label>
              <input
                key={notaKey}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Ukuran file maksimal 5 MB.");
                      e.target.value = "";
                      setNota(null);
                    } else {
                      setNota(file);
                    }
                  } else {
                    setNota(null);
                  }
                }}
                className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format gambar yang didukung: PNG, JPG, JPEG. Ukuran file maksimal 5 MB.
              </p>
            </div>
            <div className="pt-6">
              <div className="text-base font-medium text-gray-700 dark:text-white flex flex-col gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 max-w-lg">
                <div className="flex justify-between items-center">
                  <span>Total Harga Barang:</span>
                  <span className="font-semibold">Rp {totalBarang.toLocaleString('id-ID')}</span>
                </div>
                {discountNominal > 0 && (
                  <div className="flex justify-between items-center text-red-500">
                    <span>Discount:</span>
                    <span className="font-semibold">- Rp {discountNominal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-1.5 dark:border-gray-700">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>DPP Nilai Lain (Otomatis):</span>
                  <span>Rp {dppNilaiLain.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Tax / Pajak (Otomatis):</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">+ Rp {taxNominal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-red-600 dark:text-red-400 border-t pt-2 dark:border-gray-700">
                  <span>Grand Total:</span>
                  <span>Rp {totalKeseluruhan.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
