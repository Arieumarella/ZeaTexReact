import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getStoreProfile } from '../../service/barangKeluarService';

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaksi: any;
  type?: 'keluar' | 'masuk';
  storeProfile?: any;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  transaksi,
  type = 'keluar',
  storeProfile,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [activeProfile, setActiveProfile] = useState<any>(storeProfile || null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storeProfile) {
      setActiveProfile(storeProfile);
    } else {
      getStoreProfile().then((res) => {
        if (res) setActiveProfile(res);
      });
    }
  }, [storeProfile]);

  if (!isOpen || !transaksi) return null;

  const isKeluar = type === 'keluar';
  const party = isKeluar ? (transaksi.pelanggan || {}) : (transaksi.supplier || {});
  const partyName = party.nama || (isKeluar ? 'Pelanggan Umum' : 'Supplier');
  const partyPhone = party.no_tlp || '-';
  const partyAddress = party.alamat || '-';
  const partyNpwp = party.npwp || '-';
  const partyEmail = party.email || '-';

  // BILL TO values:
  // - Barang Keluar: NPWP pelanggan, Nama Pelanggan, Alamat Pelanggan, Telp Pelanggan, Email Pelanggan
  // - Barang Masuk: 1000000010816967, PT Zea Textile, Profile Alamat, Profile No Telepon 1, zeatextile@gmail.com
  const billToNpwp = isKeluar ? partyNpwp : '1000000010816967';
  const billToCompanyName = isKeluar ? partyName : 'PT Zea Textile';
  const billToAddress = isKeluar ? partyAddress : (activeProfile?.alamat || '-');
  const billToPhone = isKeluar ? partyPhone : (activeProfile?.nomor_telepon_1 || '-');
  const billToEmail = isKeluar ? partyEmail : 'zeatextile@gmail.com';

  // SHIP TO values:
  // - Barang Keluar: Nama Pelanggan, Alamat Pelanggan, Telp Pelanggan
  // - Barang Masuk: Profile Nama Toko, Profile Alamat, Profile No Telepon 1
  const shipToName = isKeluar
    ? partyName
    : (activeProfile?.nama_toko || activeProfile?.nama || 'PT Zea Textile');
  const shipToAddress = isKeluar
    ? (partyAddress !== '-' ? partyAddress : 'Alamat sesuai data penerima')
    : (activeProfile?.alamat || '-');
  const shipToPhone = isKeluar
    ? (partyPhone !== '-' ? `Telp: ${partyPhone}` : '')
    : (activeProfile?.nomor_telepon_1 ? `Telp: ${activeProfile.nomor_telepon_1}` : '');

  const details = transaksi.details || [];
  const toNumber = (val: any) => Number(val || 0);

  const grossBeforeRetur = details.reduce(
    (sum: number, d: any) => sum + toNumber(d.jml_yard || 0) * toNumber(d.harga_satuan || 0),
    0
  );
  const totalReturNominal = details.reduce(
    (sum: number, d: any) => sum + toNumber(d.jml_yard_retur || 0) * toNumber(d.harga_satuan || 0),
    0
  );
  const netBarang = Math.max(0, grossBeforeRetur - totalReturNominal);

  const discountNominal =
    transaksi.tipe_discount === 'persen'
      ? (netBarang * toNumber(transaksi.jml_discount)) / 100
      : toNumber(transaksi.jml_discount);

  const subtotal = netBarang - discountNominal;
  // Rumus DPP Nilai Lain: (11 / 12) * Subtotal (tanpa pembulatan)
  const dppNilaiLain = (11 / 12) * subtotal;
  // Tax 12% dari DPP Nilai Lain (setara 11% dari Subtotal) (tanpa pembulatan)
  const tax = 0.12 * dppNilaiLain;
  const grandTotal = subtotal + tax;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(dateString);
    }
  };

  const paymentTerms =
    transaksi.status_pembayaran === '1'
      ? `Tempo (${transaksi.tenor || 1} Hari)`
      : 'Cash / Lunas';

  const dueDate =
    transaksi.status_pembayaran === '1' && transaksi.berjangka && transaksi.berjangka.length > 0
      ? formatDate(transaksi.berjangka[0].tgl_jatuh_tempo)
      : formatDate(transaksi.tgl_transaksi);

  // Pad items to at least 4 rows for clean layout; if there are 4 or more items, no empty padding rows
  const displayRows = [...details];
  const emptyRowsCount = Math.max(0, 4 - displayRows.length);

  // Compact padding if there are many items (> 8) so invoice fits neatly
  const isCompact = displayRows.length > 8;
  const tableCellPadding = isCompact ? 'py-1.5 px-3' : 'py-2 px-3';

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, jspdfModule] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);
      const { jsPDF } = jspdfModule as any;

      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc: Document) => {
          clonedDoc.documentElement.classList.remove('dark');
          clonedDoc.body.classList.remove('dark');
          const printable = clonedDoc.getElementById('printable-invoice');
          if (printable) {
            printable.style.backgroundColor = '#ffffff';
            printable.style.color = '#111827';
            printable.style.height = 'auto';
            printable.style.minHeight = '1123px';
            printable.style.boxShadow = 'none';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const contentHeight = (canvas.height * pageWidth) / canvas.width;

      if (contentHeight <= pageHeight) {
        // Fits within 1 single A4 page perfectly
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, contentHeight);
      } else if (contentHeight <= pageHeight * 1.4) {
        // Slightly taller (e.g. 10-18 items): scale proportionally so 100% of invoice fits on 1 page without cutting off signature/bank info
        const scale = pageHeight / contentHeight;
        const scaledWidth = pageWidth * scale;
        const marginX = (pageWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'JPEG', marginX, 0, scaledWidth, pageHeight);
      } else {
        // Multi-page handling for very long orders
        let heightLeft = contentHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, contentHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - contentHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, contentHeight);
          heightLeft -= pageHeight;
        }
      }

      const filename = `Invoice-${isKeluar ? 'Penjualan' : 'Pembelian'}-ZeaTextile-${transaksi.id || Date.now()}.pdf`;
      pdf.save(filename);
      toast.success('Nota PDF berhasil diunduh!');
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
      toast.error('Gagal membuat PDF nota');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Print Stylesheet for Direct Browser Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #111827 !important;
            z-index: 9999999 !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
              Pratinjau Invoice ({isKeluar ? 'Barang Keluar' : 'Barang Masuk'})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg text-lg leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-200 dark:bg-gray-950 min-h-0">
          {/* Printable Invoice Page (A4 Paper Representation) */}
          <div
            ref={invoiceRef}
            id="printable-invoice"
            className="w-full max-w-[794px] mx-auto bg-white text-gray-900 shadow-2xl p-6 sm:p-8 relative flex flex-col justify-between shrink-0"
            style={{
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              minHeight: '1123px',
              height: 'auto',
              backgroundColor: '#ffffff',
              color: '#111827',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Section */}
            <div className="bg-white text-gray-900 flex-1" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
              {/* Header Banner */}
              <div className="flex justify-between items-start mb-6">
                {/* Logo Area */}
                <div className="pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-8 bg-[#e50914] rounded-sm inline-block"></span>
                    <div>
                      <div className="font-extrabold text-2xl tracking-[0.16em] text-gray-900 leading-tight">
                        ZEA TEXTILE
                      </div>
                      <div className="text-[10px] text-gray-500 tracking-[0.25em] font-semibold uppercase mt-0.5">
                        Grosir & Supplier Tekstil
                      </div>
                    </div>
                  </div>
                </div>

                {/* Red/Black Invoice Banner */}
                <div className="flex flex-col items-end">
                  <div className="flex items-stretch shadow-sm rounded-l-md overflow-hidden">
                    <div className="bg-[#e50914] w-24 sm:w-36 flex items-center justify-center">
                      <div className="h-0.5 w-10 bg-white/40 rounded-full"></div>
                    </div>
                    <div className="bg-black px-6 sm:px-10 py-2.5 flex items-center justify-center">
                      <span
                        className="text-white text-2xl sm:text-3xl font-serif italic font-black tracking-widest"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        INVOICE
                      </span>
                    </div>
                  </div>

                  {/* Date & Invoice No */}
                  <div className="text-xs text-gray-800 mt-2.5 space-y-1 text-right font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-gray-400 text-[11px] uppercase tracking-wider">Date :</span>
                      <span className="font-semibold text-gray-900">{formatDate(transaksi.tgl_transaksi)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-gray-400 text-[11px] uppercase tracking-wider">Invoice No :</span>
                      <span className="font-extrabold text-gray-900">{transaksi.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BILL TO & SHIP TO Boxes */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* BILL TO Box */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs">
                  <div className="border-b border-gray-200 px-3.5 py-1.5 bg-gray-900 text-white font-bold text-[11px] tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e50914]"></span>
                    BILL TO
                  </div>
                  <div className="p-3.5 text-xs space-y-1.5 leading-relaxed text-gray-800">
                    <div className="grid grid-cols-[105px_1fr]">
                      <span className="text-gray-500 font-medium">NPWP</span>
                      <span className="font-semibold text-gray-900">: {billToNpwp}</span>
                    </div>
                    <div className="grid grid-cols-[105px_1fr]">
                      <span className="text-gray-500 font-medium">Company Name</span>
                      <span className="font-bold text-gray-900">: {billToCompanyName}</span>
                    </div>
                    <div className="grid grid-cols-[105px_1fr]">
                      <span className="text-gray-500 font-medium">Street Address</span>
                      <span className="text-gray-800">: {billToAddress}</span>
                    </div>
                    <div className="grid grid-cols-[105px_1fr]">
                      <span className="text-gray-500 font-medium">Phone</span>
                      <span className="text-gray-800">: {billToPhone}</span>
                    </div>
                    <div className="grid grid-cols-[105px_1fr]">
                      <span className="text-gray-500 font-medium">Email</span>
                      <span className="text-gray-800">: {billToEmail}</span>
                    </div>
                  </div>
                </div>

                {/* SHIP TO Box */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs">
                  <div className="border-b border-gray-200 px-3.5 py-1.5 bg-gray-900 text-white font-bold text-[11px] tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e50914]"></span>
                    SHIP TO
                  </div>
                  <div className="p-3.5 text-xs space-y-1.5 leading-relaxed text-gray-800">
                    <div className="font-bold text-gray-900 text-sm">{shipToName}</div>
                    <div className="text-gray-700">
                      {shipToAddress && shipToAddress !== '-' ? shipToAddress : 'Alamat sesuai data penerima'}
                    </div>
                    {shipToPhone && <div className="text-gray-700 font-medium">{shipToPhone}</div>}
                  </div>
                </div>
              </div>

              {/* Info Bar */}
              <div className="border border-gray-300 rounded-lg overflow-hidden mb-5 shadow-xs">
                <div className="bg-gray-900 text-white text-[11px] font-bold grid grid-cols-5 text-center py-2 px-1">
                  <div className="border-r border-gray-700">Sales Rep.</div>
                  <div className="border-r border-gray-700">Shipping Method</div>
                  <div className="border-r border-gray-700">Delivery Date</div>
                  <div className="border-r border-gray-700">Payment Terms</div>
                  <div>Due Date</div>
                </div>
                <div className="grid grid-cols-5 text-center text-xs py-2 px-1 bg-gray-50 text-gray-800 font-medium">
                  <div className="border-r border-gray-200">{transaksi.penginput?.username || '-'}</div>
                  <div className="border-r border-gray-200">-</div>
                  <div className="border-r border-gray-200">{formatDate(transaksi.tgl_transaksi)}</div>
                  <div className="border-r border-gray-200">{paymentTerms}</div>
                  <div>{dueDate}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-300 rounded-lg overflow-hidden mb-6 shadow-xs">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#e50914] text-white font-bold uppercase tracking-wider text-[11px]">
                      <th className={`${tableCellPadding} text-center w-12 border-r border-red-500/50`}>Item</th>
                      <th className={`${tableCellPadding} text-left border-r border-red-500/50`}>Description</th>
                      <th className={`${tableCellPadding} text-center w-16 border-r border-red-500/50`}>QTY</th>
                      <th className={`${tableCellPadding} text-center w-16 border-r border-red-500/50`}>UOM</th>
                      <th className={`${tableCellPadding} text-right w-28 border-r border-red-500/50`}>Price</th>
                      <th className={`${tableCellPadding} text-right w-32`}>Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayRows.map((detail: any, idx: number) => {
                      const actualYard = Math.max(0, toNumber(detail.jml_yard || 0) - toNumber(detail.jml_yard_retur || 0));
                      const rowTotal = actualYard * toNumber(detail.harga_satuan || 0);
                      const isGray = idx % 2 === 1;
                      return (
                        <tr
                          key={detail.id || idx}
                          className={isGray ? 'bg-gray-50/70' : 'bg-white'}
                        >
                          <td className={`${tableCellPadding} text-center text-gray-500 font-medium`}>{idx + 1}</td>
                          <td className={`${tableCellPadding} font-semibold text-gray-900`}>
                            {detail.barang?.nama_barang || detail.nama_barang || 'Kain'}
                          </td>
                          <td className={`${tableCellPadding} text-center font-medium text-gray-800`}>{actualYard}</td>
                          <td className={`${tableCellPadding} text-center text-gray-500 lowercase`}>yard</td>
                          <td className={`${tableCellPadding} text-right text-gray-700`}>
                            {toNumber(detail.harga_satuan).toLocaleString('id-ID')}
                          </td>
                          <td className={`${tableCellPadding} text-right font-bold text-gray-900`}>
                            {rowTotal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Empty Padding Rows to match the height of reference PDF */}
                    {Array.from({ length: emptyRowsCount }).map((_, i) => {
                      const isGray = (displayRows.length + i) % 2 === 1;
                      return (
                        <tr
                          key={`empty-${i}`}
                          className={`${isGray ? 'bg-gray-50/70' : 'bg-white'} h-7`}
                        >
                          <td className={`${tableCellPadding} text-center text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-center text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-center text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-right text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-right text-gray-300`}>0</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-72 sm:w-80 text-xs bg-white border border-gray-300 rounded-lg overflow-hidden shadow-xs">
                  <div className="p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-gray-600 font-medium">
                      <span className="uppercase tracking-wider text-[11px]">SUBTOTAL</span>
                      <span className="font-bold text-gray-900">{subtotal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 font-medium">
                      <span className="uppercase tracking-wider text-[11px]">DPP NILAI LAIN</span>
                      <span className="font-bold text-gray-900">{dppNilaiLain.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 font-medium">
                      <span className="uppercase tracking-wider text-[11px]">TAX (12%)</span>
                      <span className="font-bold text-gray-900">{tax.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Grand Total in Red Banner */}
                  <div className="flex justify-between items-center bg-[#e50914] text-white px-4 py-2.5 shadow-sm">
                    <span className="font-bold text-xs uppercase tracking-wider">GRAND TOTAL</span>
                    <span className="font-black text-base tracking-tight">Rp {grandTotal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Bank Info */}
            <div className="mt-8 bg-white pt-2 text-gray-900" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
              <div className="flex justify-between items-end pb-6 bg-white" style={{ backgroundColor: '#ffffff' }}>
                {/* Account Bank Card */}
                <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/80 w-80 text-xs space-y-1 shadow-xs">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Informasi Pembayaran</div>
                  <div className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]"></span>
                    PT Zea Textile Group
                  </div>
                  {activeProfile?.rekening && (
                    <div className="text-gray-700 font-semibold pt-1">
                      {activeProfile.nama_rekening ? `${activeProfile.nama_rekening} - ` : ''}
                      <span className="text-gray-900 font-mono text-sm">{activeProfile.rekening}</span>
                    </div>
                  )}
                </div>

                {/* Signature Box */}
                <div className="text-center w-56 text-xs">
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Hormat Kami,</div>
                  <div className="font-bold text-gray-900 mb-14">PT Zea Textile Group</div>
                  <div className="font-black text-gray-900 text-sm tracking-wide">Aji Gumilang</div>
                  <div className="text-[11px] text-gray-500 font-medium">Direktur</div>
                </div>
              </div>

              {/* Decorative Geometric Footer (Black & Red Curved Shape) */}
              <div className="relative h-6 w-full overflow-hidden rounded-b-sm">
                <div
                  className="absolute inset-0 bg-[#e50914]"
                  style={{
                    clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0% 100%)',
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-black"
                  style={{
                    width: '45%',
                    clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
