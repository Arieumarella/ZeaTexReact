import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

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
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaksi) return null;

  const isKeluar = type === 'keluar';
  const party = isKeluar ? (transaksi.pelanggan || {}) : (transaksi.supplier || {});
  const partyName = party.nama || (isKeluar ? 'Pelanggan Umum' : 'Supplier');
  const partyPhone = party.no_tlp || '-';
  const partyAddress = party.alamat || '-';
  const partyNpwp = party.npwp || '-';
  const partyEmail = party.email || '-';

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
  // Rumus DPP Nilai Lain: (11 / 12) * Subtotal
  const dppNilaiLain = Math.round((11 / 12) * subtotal);
  // Tax 12% dari DPP Nilai Lain (setara 11% dari Subtotal)
  const tax = Math.round(0.12 * dppNilaiLain);
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
              <div className="flex justify-between items-start mb-4">
                {/* Logo Area */}
                <div className="pt-2">
                  <div className="font-extrabold text-2xl tracking-wider text-gray-800">
                    ZEA TEXTILE
                  </div>
                  <div className="text-xs text-gray-500 tracking-widest font-semibold uppercase mt-0.5">
                    Grosir & Supplier Tekstil
                  </div>
                </div>

                {/* Red/Black Invoice Banner */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center shadow-sm">
                    <div className="bg-[#e50914] h-12 w-48 sm:w-64 flex items-center justify-end px-4"></div>
                    <div className="bg-black h-12 px-6 sm:px-10 flex items-center justify-center">
                      <span
                        className="text-white text-2xl sm:text-3xl font-serif italic font-bold tracking-wider"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        INVOICE
                      </span>
                    </div>
                  </div>

                  {/* Date, Invoice No, PO Number */}
                  <div className="text-xs text-gray-800 mt-3 space-y-1 text-right font-medium">
                    <div>
                      <span className="font-bold">DATE :</span> {formatDate(transaksi.tgl_transaksi)}
                    </div>
                    <div>
                      <span className="font-bold">Invoice No :</span> {transaksi.id}
                    </div>
                    <div>
                      <span className="font-bold">PO Number :</span> {transaksi.catatan || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* BILL TO & SHIP TO Boxes */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* BILL TO Box */}
                <div className="border border-black rounded-none">
                  <div className="border-b border-black px-3 py-1 bg-white font-bold text-xs tracking-wider uppercase">
                    BILL TO
                  </div>
                  <div className="p-3 text-xs space-y-1 leading-relaxed text-gray-800">
                    <div className="grid grid-cols-[90px_1fr]">
                      <span className="font-semibold">NPWP</span>
                      <span>: {partyNpwp}</span>
                    </div>
                    <div className="grid grid-cols-[90px_1fr]">
                      <span className="font-semibold">Company Name</span>
                      <span className="font-bold">: {partyName}</span>
                    </div>
                    <div className="grid grid-cols-[90px_1fr]">
                      <span className="font-semibold">Street Address</span>
                      <span>: {partyAddress}</span>
                    </div>
                    <div className="grid grid-cols-[90px_1fr]">
                      <span className="font-semibold">Phone</span>
                      <span>: {partyPhone}</span>
                    </div>
                    <div className="grid grid-cols-[90px_1fr]">
                      <span className="font-semibold">Email</span>
                      <span>: {partyEmail}</span>
                    </div>
                  </div>
                </div>

                {/* SHIP TO Box */}
                <div className="border border-black rounded-none">
                  <div className="border-b border-black px-3 py-1 bg-white font-bold text-xs tracking-wider uppercase">
                    SHIP TO
                  </div>
                  <div className="p-3 text-xs space-y-1 leading-relaxed text-gray-800">
                    <div className="font-bold">{partyName}</div>
                    <div>{partyAddress !== '-' ? partyAddress : 'Alamat sesuai data penerima'}</div>
                    <div>Telp: {partyPhone}</div>
                  </div>
                </div>
              </div>

              {/* Black Info Bar */}
              <div className="bg-black text-white text-[11px] font-bold grid grid-cols-5 text-center py-2 px-1 mb-4">
                <div>Sales Rep.</div>
                <div>Shipping Method</div>
                <div>Delivery Date</div>
                <div>Payment Terms</div>
                <div>Due Date</div>
              </div>
              <div className="grid grid-cols-5 text-center text-xs py-1 px-1 mb-5 border-b border-gray-200 text-gray-800 font-medium">
                <div>{transaksi.penginput?.username || '-'}</div>
                <div>-</div>
                <div>{formatDate(transaksi.tgl_transaksi)}</div>
                <div>{paymentTerms}</div>
                <div>{dueDate}</div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#e50914] text-white font-bold">
                      <th className={`${tableCellPadding} text-center w-12 border-r border-red-500`}>Item</th>
                      <th className={`${tableCellPadding} text-left border-r border-red-500`}>Description</th>
                      <th className={`${tableCellPadding} text-center w-16 border-r border-red-500`}>QTY</th>
                      <th className={`${tableCellPadding} text-center w-16 border-r border-red-500`}>UOM</th>
                      <th className={`${tableCellPadding} text-right w-28 border-r border-red-500`}>Price</th>
                      <th className={`${tableCellPadding} text-right w-32`}>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((detail: any, idx: number) => {
                      const actualYard = Math.max(0, toNumber(detail.jml_yard || 0) - toNumber(detail.jml_yard_retur || 0));
                      const rowTotal = actualYard * toNumber(detail.harga_satuan || 0);
                      const isGray = idx % 2 === 1;
                      return (
                        <tr
                          key={detail.id || idx}
                          className={`${isGray ? 'bg-gray-100' : 'bg-white'} border-b border-gray-100`}
                        >
                          <td className={`${tableCellPadding} text-center text-gray-700`}>{idx + 1}</td>
                          <td className={`${tableCellPadding} font-semibold text-gray-800`}>
                            {detail.barang?.nama_barang || detail.nama_barang || 'Kain'}
                          </td>
                          <td className={`${tableCellPadding} text-center text-gray-700`}>{actualYard}</td>
                          <td className={`${tableCellPadding} text-center text-gray-700`}>yard</td>
                          <td className={`${tableCellPadding} text-right text-gray-700`}>
                            {toNumber(detail.harga_satuan).toLocaleString('id-ID')}
                          </td>
                          <td className={`${tableCellPadding} text-right font-semibold text-gray-900`}>
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
                          className={`${isGray ? 'bg-gray-100' : 'bg-white'} border-b border-gray-100 h-7`}
                        >
                          <td className={`${tableCellPadding} text-center text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-center text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-center text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-right text-transparent`}>-</td>
                          <td className={`${tableCellPadding} text-right text-gray-400`}>0</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-72 sm:w-80 text-xs space-y-1.5 bg-white text-gray-900" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex justify-between items-center py-0.5 text-gray-700 font-bold">
                    <span>SUBTOTAL</span>
                    <span>{subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-gray-700 font-bold">
                    <span>DPP NILAI LAIN</span>
                    <span>{dppNilaiLain.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-gray-700 font-bold">
                    <span>TAX</span>
                    <span>{tax.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Grand Total in Red Banner */}
                  <div className="flex justify-between items-center bg-[#e50914] text-white font-extrabold px-3 py-2 text-sm mt-2 shadow-sm">
                    <span>GRAND TOTAL</span>
                    <span>{grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Bank Info */}
            <div className="mt-8 bg-white pt-2 text-gray-900" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
              <div className="flex justify-between items-end pb-6 bg-white" style={{ backgroundColor: '#ffffff' }}>
                {/* Account Bank */}
                <div className="text-xs text-gray-800 space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>Account Bank :</span>
                    <span className="font-extrabold text-sm text-gray-900">PT Zea Textile Group</span>
                  </div>
                  {storeProfile?.rekening && (
                    <div className="text-gray-600 font-medium pl-28">
                      {storeProfile.nama_rekening ? `${storeProfile.nama_rekening} - ` : ''}
                      {storeProfile.rekening}
                    </div>
                  )}
                </div>

                {/* Signature Box */}
                <div className="text-center w-52 text-xs">
                  <div className="font-bold text-gray-900 mb-10">PT Zea Textile Group</div>
                  <div className="border-b border-gray-900 mx-6 mb-1"></div>
                  <div className="font-bold text-gray-900">Aji Gumilang</div>
                </div>
              </div>

              {/* Decorative Geometric Footer (Black & Red Curved Shape) */}
              <div className="relative h-6 w-full overflow-hidden">
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
