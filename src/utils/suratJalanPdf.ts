import type { jsPDF as JsPdf } from "jspdf";
import type { StoreProfile } from "../service/barangKeluarService";

type Rgb = [number, number, number];

interface SuratJalanBarang {
  kd_barang?: string | null;
  nama_barang?: string | null;
}

interface SuratJalanDetail {
  jml_yard?: number | string | null;
  jml_rol?: number | string | null;
  kode_barang?: string | null;
  nama_barang?: string | null;
  barang?: SuratJalanBarang | null;
}

export interface SuratJalanPelanggan {
  nama?: string | null;
  no_tlp?: string | null;
  alamat?: string | null;
}

export interface SuratJalanTransaksi {
  id: number;
  tgl_transaksi?: string | null;
  pelanggan?: SuratJalanPelanggan | null;
  details?: SuratJalanDetail[] | null;
}

export interface SuratJalanPdfOptions {
  transaksi: SuratJalanTransaksi;
  pelanggan?: SuratJalanPelanggan | null;
  store?: Partial<StoreProfile> | null;
  expedisi: string;
  alamat: string;
}

interface LoadedLogo {
  dataUrl: string;
  width: number;
  height: number;
}

const PAGE_WIDTH = 210;
const MARGIN_X = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_BOTTOM = 276;

const COLORS: Record<string, Rgb> = {
  navy: [15, 23, 42],
  accent: [13, 148, 136],
  slate: [51, 65, 85],
  muted: [100, 116, 139],
  line: [226, 232, 240],
  soft: [248, 250, 252],
  white: [255, 255, 255],
  amberSoft: [255, 251, 235],
  amberLine: [253, 230, 138],
  amberText: [146, 64, 14],
};

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function toNumber(value: number | string | null | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatQty(value: number | string | null | undefined): string {
  return toNumber(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatDateId(value: string | null | undefined): string {
  if (!value) return "-";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS_ID[date.getMonth()];
  return `${day} ${month} ${date.getFullYear()}`;
}

function getDetailCode(detail: SuratJalanDetail): string {
  return detail.barang?.kd_barang || detail.kode_barang || "-";
}

function getDetailName(detail: SuratJalanDetail): string {
  return detail.barang?.nama_barang || detail.nama_barang || "-";
}

function getPhones(store: Partial<StoreProfile> | null | undefined): string {
  return [store?.nomor_telepon_1, store?.nomor_telepon_2, store?.nomor_telepon3]
    .filter((phone): phone is string => Boolean(phone && String(phone).trim()))
    .join(" / ");
}

function fitText(pdf: JsPdf, text: string, maxWidth: number): string {
  if (pdf.getTextWidth(text) <= maxWidth) return text;

  let truncated = text;
  while (truncated.length > 0) {
    const next = truncated.slice(0, -1).trimEnd();
    if (pdf.getTextWidth(`${next}...`) <= maxWidth) {
      return next ? `${next}...` : "...";
    }
    truncated = next;
  }

  return "...";
}

function safeFileName(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadLogo(src: string): Promise<LoadedLogo | null> {
  if (typeof document === "undefined") return null;

  try {
    const image = new Image();
    image.crossOrigin = "anonymous";

    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gagal memuat logo"));
    });

    image.src = src;
    await loaded;

    const naturalWidth = image.naturalWidth || 500;
    const naturalHeight = image.naturalHeight || 500;
    const maxSide = 900;
    const scale = Math.min(3, maxSide / Math.max(naturalWidth, naturalHeight));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) return null;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      width,
      height,
    };
  } catch (error) {
    console.warn("Logo surat jalan gagal dimuat, memakai placeholder.", error);
    return null;
  }
}

function drawContinuationHeader(
  pdf: JsPdf,
  companyName: string,
  documentNumber: string,
): void {
  pdf.setFillColor(...COLORS.navy);
  pdf.rect(0, 0, PAGE_WIDTH, 4, "F");
  pdf.setFillColor(...COLORS.accent);
  pdf.rect(0, 4, PAGE_WIDTH, 1.2, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.navy);
  pdf.text(companyName.toUpperCase(), MARGIN_X, 13);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(`Surat Jalan ${documentNumber}`, PAGE_WIDTH - MARGIN_X, 13, {
    align: "right",
  });

  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, 16.5, PAGE_WIDTH - MARGIN_X, 16.5);
}

function drawFooter(pdf: JsPdf, page: number, totalPages: number): void {
  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN_X, 282, PAGE_WIDTH - MARGIN_X, 282);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(
    "Dokumen ini dihasilkan otomatis oleh sistem Zea Textile.",
    MARGIN_X,
    286.5,
  );
  pdf.text(`Halaman ${page} dari ${totalPages}`, PAGE_WIDTH - MARGIN_X, 286.5, {
    align: "right",
  });

  pdf.setFillColor(...COLORS.accent);
  pdf.rect(0, 292.5, PAGE_WIDTH, 1.2, "F");
  pdf.setFillColor(...COLORS.navy);
  pdf.rect(0, 293.7, PAGE_WIDTH, 3.3, "F");
}

function drawTableHeader(pdf: JsPdf, top: number): void {
  const columns = getTableColumns();

  pdf.setFillColor(...COLORS.navy);
  pdf.rect(MARGIN_X, top, CONTENT_WIDTH, 8, "F");
  pdf.setFillColor(...COLORS.accent);
  pdf.rect(MARGIN_X, top + 7.3, CONTENT_WIDTH, 0.7, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.white);
  pdf.text("NO", columns.no + columns.noWidth / 2, top + 5.1, {
    align: "center",
  });
  pdf.text("KODE", columns.code + 2, top + 5.1);
  pdf.text("NAMA BARANG", columns.name + 2, top + 5.1);
  pdf.text("QTY YARD", columns.yard + columns.yardWidth - 2, top + 5.1, {
    align: "right",
  });
  pdf.text("QTY ROL", columns.rol + columns.rolWidth / 2, top + 5.1, {
    align: "center",
  });
  pdf.text("KETERANGAN", columns.note + 2, top + 5.1);
}

function getTableColumns() {
  const noWidth = 10;
  const codeWidth = 30;
  const nameWidth = 66;
  const yardWidth = 22;
  const rolWidth = 20;
  const noteWidth = 34;

  const no = MARGIN_X;
  const code = no + noWidth;
  const name = code + codeWidth;
  const yard = name + nameWidth;
  const rol = yard + yardWidth;
  const note = rol + rolWidth;

  return {
    no,
    code,
    name,
    yard,
    rol,
    note,
    noWidth,
    codeWidth,
    nameWidth,
    yardWidth,
    rolWidth,
    noteWidth,
  };
}

function drawInfoCard(
  pdf: JsPdf,
  x: number,
  top: number,
  width: number,
  height: number,
  accentColor: Rgb,
): void {
  pdf.setFillColor(...COLORS.white);
  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(x, top, width, height, 2.5, 2.5, "FD");

  pdf.setFillColor(...accentColor);
  pdf.roundedRect(x, top, 2, height, 1, 1, "F");
}

function drawInfoLabel(
  pdf: JsPdf,
  text: string,
  x: number,
  top: number,
): void {
  pdf.setFillColor(...COLORS.accent);
  pdf.rect(x + 5, top + 5.2, 1.6, 1.6, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(text.toUpperCase(), x + 8.5, top + 6.4);
}

export async function createSuratJalanPdf({
  transaksi,
  pelanggan,
  store,
  expedisi,
  alamat,
}: SuratJalanPdfOptions): Promise<JsPdf> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const details = transaksi.details ?? [];
  const documentNumber = `SJ-${String(transaksi.id || 0).padStart(6, "0")}`;
  const companyName = (store?.nama_toko || "Zea Textile").trim();
  const companyAddress = String(store?.alamat || "").trim();
  const companyPhones = getPhones(store);
  const customerName =
    String(pelanggan?.nama || transaksi.pelanggan?.nama || "-").trim() || "-";
  const customerPhone =
    String(pelanggan?.no_tlp || transaksi.pelanggan?.no_tlp || "-").trim() ||
    "-";
  const customerAddress = String(alamat || "").trim() || "-";
  const dateText = formatDateId(transaksi.tgl_transaksi);
  const expeditionText = String(expedisi || "").trim() || "-";
  const totalYard = details.reduce(
    (total, detail) => total + toNumber(detail.jml_yard),
    0,
  );
  const totalRol = details.reduce(
    (total, detail) => total + toNumber(detail.jml_rol),
    0,
  );

  const logo = await loadLogo("/images/logo aji transparant.svg");

  pdf.setProperties({
    title: `Surat Jalan ${documentNumber}`,
    subject: `Surat jalan untuk ${customerName}`,
    author: companyName,
    creator: "Zea Textile",
  });

  pdf.setFillColor(...COLORS.navy);
  pdf.rect(0, 0, PAGE_WIDTH, 6, "F");
  pdf.setFillColor(...COLORS.accent);
  pdf.rect(0, 6, PAGE_WIDTH, 1.5, "F");

  const logoBox = 24;
  const logoTop = 15;

  if (logo) {
    const ratio = logo.width / logo.height;
    const logoWidth = ratio >= 1 ? logoBox : logoBox * ratio;
    const logoHeight = ratio >= 1 ? logoBox / ratio : logoBox;
    pdf.addImage(
      logo.dataUrl,
      "PNG",
      MARGIN_X,
      logoTop + (logoBox - logoHeight) / 2,
      logoWidth,
      logoHeight,
    );
  } else {
    pdf.setFillColor(...COLORS.navy);
    pdf.roundedRect(MARGIN_X, logoTop, logoBox, logoBox, 3, 3, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.setTextColor(...COLORS.white);
    pdf.text("Z", MARGIN_X + logoBox / 2, logoTop + logoBox / 2 + 2.5, {
      align: "center",
    });
  }

  const companyX = MARGIN_X + logoBox + 6;
  const companyTextWidth = 76;

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...COLORS.navy);
  const companyLabel = companyName.toUpperCase();
  let companyFontSize = 15;
  pdf.setFontSize(companyFontSize);
  while (
    companyFontSize > 10 &&
    pdf.getTextWidth(companyLabel) > companyTextWidth + 6
  ) {
    companyFontSize -= 0.5;
    pdf.setFontSize(companyFontSize);
  }
  pdf.text(companyLabel, companyX, 20.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.muted);

  let companyY = 26;
  if (companyAddress) {
    const addressLines = pdf.splitTextToSize(companyAddress, companyTextWidth);
    pdf.text(addressLines, companyX, companyY);
    companyY += addressLines.length * 3.8;
  }
  if (companyPhones) {
    pdf.text(`Telp. ${companyPhones}`, companyX, companyY + 0.8);
  }

  const documentCardX = 136;
  const documentCardY = 15;
  const documentCardWidth = 60;
  const documentCardHeight = 34;

  pdf.setFillColor(...COLORS.soft);
  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(
    documentCardX,
    documentCardY,
    documentCardWidth,
    documentCardHeight,
    3,
    3,
    "FD",
  );
  pdf.setFillColor(...COLORS.accent);
  pdf.roundedRect(documentCardX, documentCardY, 2, documentCardHeight, 1, 1, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(...COLORS.accent);
  pdf.text("DOKUMEN PENGIRIMAN", documentCardX + 6, documentCardY + 7.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...COLORS.navy);
  pdf.text("SURAT JALAN", documentCardX + 6, documentCardY + 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.slate);
  pdf.text(documentNumber, documentCardX + 6, documentCardY + 22);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(`Tanggal: ${dateText}`, documentCardX + 6, documentCardY + 27);
  pdf.text(`Ref: #${transaksi.id || "-"}`, documentCardX + 6, documentCardY + 31);

  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(0.4);
  pdf.line(MARGIN_X, 54, PAGE_WIDTH - MARGIN_X, 54);

  const infoTop = 60;
  const leftCardX = MARGIN_X;
  const rightCardX = 130;
  const leftCardWidth = 108;
  const rightCardWidth = 66;
  const addressLines = pdf.splitTextToSize(
    customerAddress,
    leftCardWidth - 14,
  );
  const leftCardHeight = Math.max(32, 26 + addressLines.length * 4);
  const infoCardHeight = Math.max(leftCardHeight, 32);

  drawInfoCard(
    pdf,
    leftCardX,
    infoTop,
    leftCardWidth,
    infoCardHeight,
    COLORS.accent,
  );
  drawInfoLabel(pdf, "Kepada", leftCardX, infoTop);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...COLORS.navy);
  pdf.text(customerName, leftCardX + 5, infoTop + 14);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.slate);
  pdf.text(
    customerPhone === "-" ? "Telp. -" : `Telp. ${customerPhone}`,
    leftCardX + 5,
    infoTop + 19.5,
  );
  pdf.setTextColor(...COLORS.muted);
  pdf.text(addressLines, leftCardX + 5, infoTop + 25);

  drawInfoCard(
    pdf,
    rightCardX,
    infoTop,
    rightCardWidth,
    infoCardHeight,
    COLORS.navy,
  );
  drawInfoLabel(pdf, "Informasi Pengiriman", rightCardX, infoTop);

  const shippingRows = [
    ["Ekspedisi", expeditionText],
    ["Plat Kendaraan", "-"],
    ["Jumlah Item", `${details.length} barang`],
  ];

  shippingRows.forEach(([label, value], index) => {
    const rowY = infoTop + 14 + index * 5;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(label, rightCardX + 5, rowY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.8);
    pdf.setTextColor(...COLORS.slate);
    pdf.text(value, rightCardX + rightCardWidth - 5, rowY, {
      align: "right",
    });
  });

  let y = infoTop + infoCardHeight + 11;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.navy);
  pdf.text("RINCIAN BARANG", MARGIN_X, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(`${details.length} item`, PAGE_WIDTH - MARGIN_X, y, {
    align: "right",
  });

  y += 4;
  const columns = getTableColumns();
  drawTableHeader(pdf, y);
  y += 8;

  if (details.length === 0) {
    pdf.setFillColor(...COLORS.soft);
    pdf.rect(MARGIN_X, y, CONTENT_WIDTH, 12, "F");
    pdf.setDrawColor(...COLORS.line);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN_X, y + 12, PAGE_WIDTH - MARGIN_X, y + 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text("Tidak ada barang.", PAGE_WIDTH / 2, y + 7, {
      align: "center",
    });
    y += 12;
  }

  details.forEach((detail, index) => {
    const name = getDetailName(detail);
    const code = getDetailCode(detail);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.8);
    const nameLines = pdf.splitTextToSize(name, columns.nameWidth - 4);
    const rowHeight = Math.max(8, 4 + nameLines.length * 3.6);

    if (y + rowHeight > CONTENT_BOTTOM - 12) {
      pdf.addPage();
      y = 24;
      drawTableHeader(pdf, y);
      y += 8;
    }

    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.soft);
      pdf.rect(MARGIN_X, y, CONTENT_WIDTH, rowHeight, "F");
    }

    pdf.setDrawColor(...COLORS.line);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN_X, y + rowHeight, PAGE_WIDTH - MARGIN_X, y + rowHeight);

    const textTop = y + 4.6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLORS.slate);
    pdf.text(String(index + 1), columns.no + columns.noWidth / 2, textTop, {
      align: "center",
    });

    pdf.setFontSize(7.2);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(
      fitText(pdf, code, columns.codeWidth - 6),
      columns.code + 2,
      textTop,
    );

    pdf.setFontSize(7.8);
    pdf.setTextColor(...COLORS.navy);
    pdf.text(nameLines, columns.name + 2, textTop);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.8);
    pdf.setTextColor(...COLORS.navy);
    pdf.text(
      formatQty(detail.jml_yard),
      columns.yard + columns.yardWidth - 2,
      textTop,
      { align: "right" },
    );
    pdf.text(
      formatQty(detail.jml_rol),
      columns.rol + columns.rolWidth / 2,
      textTop,
      { align: "center" },
    );

    y += rowHeight;
  });

  if (y + 9 > CONTENT_BOTTOM) {
    pdf.addPage();
    y = 24;
    drawTableHeader(pdf, y);
    y += 8;
  }

  pdf.setFillColor(241, 245, 249);
  pdf.rect(MARGIN_X, y, CONTENT_WIDTH, 9, "F");
  pdf.setDrawColor(...COLORS.navy);
  pdf.setLineWidth(0.6);
  pdf.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.navy);
  pdf.text("TOTAL", columns.yard - 2, y + 5.7, { align: "right" });
  pdf.text(
    formatQty(totalYard),
    columns.yard + columns.yardWidth - 2,
    y + 5.7,
    { align: "right" },
  );
  pdf.text(
    formatQty(totalRol),
    columns.rol + columns.rolWidth / 2,
    y + 5.7,
    { align: "center" },
  );

  y += 17;

  const noticeLines = [
    "Surat Jalan ini merupakan bukti resmi penerimaan barang, bukan bukti penjualan.",
    "Penukaran barang reject / cacat pabrik maksimal 7 hari dengan syarat belum dipotong.",
  ];
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  const noticeBullets = noticeLines.map((line) =>
    pdf.splitTextToSize(line, CONTENT_WIDTH - 36),
  );
  const noticeLineCount = noticeBullets.reduce(
    (total, lines) => total + lines.length,
    0,
  );
  const noticeHeight = 14 + noticeLineCount * 4;

  if (y + noticeHeight + 12 + 38 > CONTENT_BOTTOM) {
    pdf.addPage();
    y = 24;
  }

  pdf.setFillColor(...COLORS.amberSoft);
  pdf.setDrawColor(...COLORS.amberLine);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(MARGIN_X, y, CONTENT_WIDTH, noticeHeight, 2.5, 2.5, "FD");
  pdf.setFillColor(...COLORS.amberText);
  pdf.roundedRect(MARGIN_X, y, 2.2, noticeHeight, 1, 1, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...COLORS.amberText);
  pdf.text("PERHATIAN", MARGIN_X + 7, y + 6.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(120, 53, 15);

  let noticeLineY = y + 11.5;
  noticeBullets.forEach((lines) => {
    pdf.setFillColor(...COLORS.amberText);
    pdf.circle(MARGIN_X + 8.5, noticeLineY - 1.1, 0.6, "F");
    pdf.text(lines, MARGIN_X + 11.5, noticeLineY);
    noticeLineY += lines.length * 4;
  });

  y += noticeHeight + 12;

  let signatureTop = y;
  if (signatureTop + 38 > CONTENT_BOTTOM) {
    pdf.addPage();
    signatureTop = 30;
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...COLORS.muted);
  pdf.text("Dibuat pada", PAGE_WIDTH - MARGIN_X, signatureTop, {
    align: "right",
  });
  pdf.text(dateText, PAGE_WIDTH - MARGIN_X, signatureTop + 4, {
    align: "right",
  });

  const signatureCenters = [45, 105, 165];
  const signatureLabels = [
    "Penerima / Pembeli",
    "Bagian Pengiriman",
    "Petugas Gudang",
  ];
  const signatureLineY = signatureTop + 25;

  signatureLabels.forEach((label, index) => {
    const center = signatureCenters[index];
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.slate);
    pdf.text(label, center, signatureTop + 13, { align: "center" });

    pdf.setDrawColor(148, 163, 184);
    pdf.setLineWidth(0.35);
    pdf.line(center - 26, signatureLineY, center + 26, signatureLineY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.8);
    pdf.setTextColor(...COLORS.muted);
    pdf.text("Nama & Tanda Tangan", center, signatureLineY + 4, {
      align: "center",
    });
  });

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    if (page > 1) {
      drawContinuationHeader(pdf, companyName, documentNumber);
    }
    drawFooter(pdf, page, totalPages);
  }

  return pdf;
}

export async function downloadSuratJalanPdf(
  options: SuratJalanPdfOptions,
): Promise<string> {
  const pdf = await createSuratJalanPdf(options);
  const customerName = String(
    options.pelanggan?.nama || options.transaksi.pelanggan?.nama || "Pelanggan",
  );
  const documentNumber = `SJ-${String(options.transaksi.id || 0).padStart(6, "0")}`;
  const fileName = safeFileName(
    `Surat Jalan ${documentNumber} - ${customerName}.pdf`,
  );

  pdf.save(fileName);
  return fileName;
}
