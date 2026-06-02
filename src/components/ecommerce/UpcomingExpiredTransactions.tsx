import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import { getJatuhTempoPiutang } from "../../service/dashboardService";
import { useNavigate } from "react-router-dom";

interface UpcomingExpired {
  id: number;
  nomorTransaksi: string;
  pelanggan: string;
  totalHarga: number;
  sisaTagihan: number;
  hariHitung: number | null;
  status: "urgent" | "warning" | "normal";
  tanggalJatuhTempo?: string;
}

// Format tanggal ke format Indonesia
function formatTanggalIndo(dateStr?: string) {
  if (!dateStr) return "";
  // Ambil hanya bagian tanggal (YYYY-MM-DD)
  const [dateOnly] = dateStr.split("T");
  const [tahun, bulanIdx, hari] = dateOnly.split("-");
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  if (!tahun || !bulanIdx || !hari) return dateStr;
  return `${parseInt(hari)} ${bulan[parseInt(bulanIdx) - 1]} ${tahun}`;
}

export default function UpcomingExpiredTransactions() {
  const [masuk, setMasuk] = useState<UpcomingExpired[]>([]);
  const [keluar, setKeluar] = useState<UpcomingExpired[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const result = await getJatuhTempoPiutang();
      if (result && result.status) {
        const normalizeStatus = (status: string): "urgent" | "warning" | "normal" => {
          const s = status?.toLowerCase();
          if (s === "urgent") return "urgent";
          if (s === "warning") return "warning";
          return "normal";
        };
        setMasuk(
          (result.datatransaksiMasuk || []).map((item: any) => ({
            ...item,
            status: item.status ? normalizeStatus(item.status) : "normal",
            tanggalJatuhTempo: formatTanggalIndo(item.tanggalJatuhTempo),
            nomorTransaksi: String(item.nomorTransaksi),
          }))
        );
        setKeluar(
          (result.datatransaksiKeluar || []).map((item: any) => ({
            ...item,
            status: item.status ? normalizeStatus(item.status) : "normal",
            tanggalJatuhTempo: formatTanggalIndo(item.tanggalJatuhTempo),
            nomorTransaksi: String(item.nomorTransaksi),
          }))
        );
      } else {
        setMasuk([]);
        setKeluar([]);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "urgent":
        return "Sangat Mendesak";
      case "warning":
        return "Segera";
      case "normal":
        return "Normal";
      default:
        return "";
    }
  };

  const TransactionList = ({ data, title, tipe }: { data: UpcomingExpired[]; title: string; tipe: "masuk" | "keluar" }) => {
    const totalSisa = data.reduce((sum, item) => sum + (item.sisaTagihan || 0), 0);
    return (
      <div className="space-y-3 flex flex-col h-full">
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <div className="space-y-3 flex-1">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-white/[0.05] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition"
              onClick={() =>
                tipe === "masuk"
                  ? navigate(`/input-cicilan/${item.id}`)
                  : navigate(`/input-cicilan-keluar/${item.id}`)
              }
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.nomorTransaksi}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.pelanggan}</p>
                <p className="mt-1 text-xs font-semibold text-gray-800 dark:text-white">
                  Sisa: Rp {item.sisaTagihan.toLocaleString()} <span className="text-gray-500 font-normal dark:text-gray-400"> (Total: Rp {item.totalHarga.toLocaleString()})</span>
                </p>
                {item.tanggalJatuhTempo && (
                  <p className="text-xs text-blue-600 dark:text-blue-300">Jatuh Tempo: {item.tanggalJatuhTempo}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.hariHitung !== null ? item.hariHitung : "-"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">hari</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>{getStatusLabel(item.status)}</span>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
              Tidak ada transaksi mendekati jatuh tempo.
            </div>
          )}
        </div>
        <div className="pt-3 border-t border-gray-200 dark:border-white/[0.05] flex justify-between items-center mt-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sisa:</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">Rp {totalSisa.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <ComponentCard title="Transaksi Mendekati Jatuh Tempo">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TransactionList data={masuk} title="Transaksi Barang Masuk" tipe="masuk" />
        <TransactionList data={keluar} title="Transaksi Barang Keluar" tipe="keluar" />
      </div>
    </ComponentCard>
  );
}
