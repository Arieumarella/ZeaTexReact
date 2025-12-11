import React, { useEffect, useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWhatsAppStatus, getWhatsAppQR } from "../../service/whatsappService";

export default function Wa() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await getWhatsAppStatus();
      setReady(Boolean(data.ready));
      setLastChecked(Date.now());
    } catch (err) {
      setReady(null);
      setLastChecked(Date.now());
      console.error("Error fetching WA status:", err);
      toast.error(err instanceof Error ? err.message : 'Gagal menghubungi server status WhatsApp');
    }
  };

  useEffect(() => {
    // initial fetch
    fetchStatus();
    // poll every 3 seconds
    // intervalRef.current = window.setInterval(fetchStatus, 3000) as unknown as number;
    // return () => {
    //   if (intervalRef.current) window.clearInterval(intervalRef.current);
    // };
  }, []);

  const handleGenerateQr = async () => {
    setLoading(true);
    try {
      const data = await getWhatsAppQR();
      // server returns { qr: "data:image/png;base64,..." } or just base64
      if (data.qr.startsWith("data:")) {
        setQr(data.qr);
      } else {
        setQr(`data:image/png;base64,${data.qr}`);
      }
    } catch (err) {
      console.error("Error fetching QR:", err);
      toast.error(err instanceof Error ? err.message : 'Gagal menghubungi server QR');
      setQr(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearQr = () => setQr(null);

  const statusLabel = ready === null ? "Unknown" : ready ? "Ready" : "Not Ready";
  const statusColor = ready === null
    ? "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-white/[0.03]"
    : ready
      ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20"
      : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20";

  return (
    <>
      <PageMeta title="Konfigurasi WhatsApp" description="Konfigurasi WhatsApp Web client" />
      <PageBreadcrumb pageTitle="Konfigurasi WhatsApp" />

      <div className="space-y-6">
        <ComponentCard title="WhatsApp Configuration">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusColor}`}>
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm">{statusLabel}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last checked: {lastChecked ? new Date(lastChecked).toLocaleTimeString() : "-"}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchStatus}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm"
                >
                  Check Now
                </button>
                <button
                  type="button"
                  onClick={handleGenerateQr}
                  disabled={loading}
                  className={`px-3 py-2 rounded text-white text-sm ${loading ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'}`}
                >
                  {loading ? 'Generating...' : 'Generate QR'}
                </button>
                <button
                  type="button"
                  onClick={handleClearQr}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-sm"
                >
                  Clear QR
                </button>
              </div>
            </div>

            <div className="pt-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <h4 className="text-sm font-semibold mb-3 text-gray-500 dark:text-gray-400">QR Code</h4>
                {qr ? (
                  <div className="flex flex-col items-start gap-3">
                    <img src={qr} alt="WhatsApp QR" className="max-w-xs rounded-md border border-gray-200 dark:border-white/[0.06]" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Scan this QR with WhatsApp Web (mobile) to authenticate client.</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No QR generated. Click "Generate QR" to request a new QR code from the server.</div>
                )}
              </div>
            </div>
          </div>
        </ComponentCard>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
      </div>
    </>
  );
}
