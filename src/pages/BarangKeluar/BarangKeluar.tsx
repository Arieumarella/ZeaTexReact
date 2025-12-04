import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import { deleteTransaksiKeluar, getTransaksiKeluar, getAllCustomers, getTransaksiKeluarById, sendNotaFile, getStoreProfile } from "../../service/barangKeluarService";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

const calculateTotalPayment = (berjangka: any[]): number => {
  return (berjangka || []).reduce((sum, b) => sum + (Number(b.jml_bayar) || 0), 0);
};

const extractStorePhones = (profile: any) => (
  [
    profile?.nomor_telepon_1 && { label: 'Admin 1', value: profile.nomor_telepon_1 },
    profile?.nomor_telepon_2 && { label: 'Admin 2', value: profile.nomor_telepon_2 },
    profile?.nomor_telepon3 && { label: 'Admin 3', value: profile.nomor_telepon3 },
  ].filter(Boolean) as { label: string; value: string }[]
);

// CSS untuk print
const printStyles = `
  @page {
    margin: 12mm;
  }

  @media print {
    @page {
      margin: 8mm;
      size: A4;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: white;
      width: 100%;
      height: auto;
    }

    /* Hide everything first */
    * {
      visibility: hidden;
    }

    /* Then show only print wrapper and its descendants */
    .print-source-wrapper,
    .print-source-wrapper * {
      visibility: visible !important;
    }

    /* Position print wrapper */
    .print-source-wrapper {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      opacity: 1 !important;
      z-index: 9999 !important;
      pointer-events: auto !important;
      overflow: visible !important;
    }

    /* Hide modal parts */
    .modal-header,
    .modal-footer,
    .print-content,
    .modal-content > .print-content {
      display: none !important;
      visibility: hidden !important;
    }

    /* Only show print-source-wrapper */
    .print-source-wrapper {
      display: block !important;
    }

    /* Style the print content - COMPACT VERSION */
    .print-content-modern {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 10px 12px !important;
      border: none !important;
      box-shadow: none !important;
      background: white !important;
      border-radius: 0 !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      overflow: visible !important;
      font-size: 9px !important;
      line-height: 1.3 !important;
    }

    /* Compact header */
    .print-content-modern .modern-header {
      margin-bottom: 8px !important;
      padding-bottom: 6px !important;
      gap: 12px !important;
    }

    .print-content-modern .nota-pill {
      font-size: 8px !important;
      padding: 2px 8px !important;
      margin-bottom: 3px !important;
    }

    .print-content-modern h1 {
      font-size: 14px !important;
      margin: 0 0 2px !important;
    }

    .print-content-modern .muted {
      font-size: 8px !important;
    }

    .print-content-modern .store-inline {
      margin-top: 6px !important;
      padding-top: 6px !important;
      gap: 4px !important;
    }

    .print-content-modern .store-address {
      font-size: 8px !important;
    }

    .print-content-modern .store-contact-heading {
      font-size: 7px !important;
      margin-bottom: 2px !important;
    }

    .print-content-modern .store-contact-grid {
      font-size: 8px !important;
      gap: 4px 8px !important;
    }

    .print-content-modern .store-contact-label {
      font-size: 7px !important;
    }

    .print-content-modern .store-bank {
      font-size: 8px !important;
      gap: 1px !important;
    }

    .print-content-modern .modern-meta {
      gap: 6px 10px !important;
      font-size: 8px !important;
    }

    .print-content-modern .modern-meta span {
      font-size: 7px !important;
    }

    .print-content-modern .modern-meta strong {
      font-size: 9px !important;
    }

    /* Compact info grid */
    .print-content-modern .modern-info-grid {
      gap: 8px !important;
      margin-bottom: 8px !important;
    }

    .print-content-modern .modern-info-card {
      padding: 6px 8px !important;
      border-radius: 8px !important;
    }

    .print-content-modern .modern-info-card span {
      font-size: 7px !important;
      margin-bottom: 2px !important;
    }

    .print-content-modern .modern-info-card strong {
      font-size: 9px !important;
    }

    /* Compact status card */
    .print-content-modern .modern-status-card {
      padding: 8px 10px !important;
      margin-bottom: 8px !important;
      border-radius: 10px !important;
    }

    .print-content-modern .section-label {
      font-size: 7px !important;
      margin-bottom: 4px !important;
    }

    .print-content-modern .status-chip {
      font-size: 8px !important;
      padding: 2px 8px !important;
      margin-bottom: 6px !important;
    }

    .print-content-modern .status-values {
      gap: 8px !important;
    }

    .print-content-modern .status-values .amount-card {
      padding: 6px 8px !important;
      border-radius: 8px !important;
    }

    .print-content-modern .status-values span {
      font-size: 7px !important;
      margin-bottom: 2px !important;
    }

    .print-content-modern .status-values strong {
      font-size: 10px !important;
    }

    .print-content-modern .modern-installments {
      margin-top: 8px !important;
      padding-top: 6px !important;
    }

    .print-content-modern .modern-installments .installment-row {
      padding: 4px 0 !important;
      font-size: 8px !important;
    }

    .print-content-modern .modern-installments strong {
      font-size: 8px !important;
    }

    .print-content-modern .modern-installments span {
      font-size: 7px !important;
    }

    .print-content-modern .modern-installments .installment-value {
      font-size: 8px !important;
    }

    /* Compact table */
    .print-content-modern .modern-table-section {
      padding: 8px 10px !important;
      margin-bottom: 8px !important;
      border-radius: 10px !important;
      page-break-inside: auto;
      overflow: visible !important;
    }

    .print-content-modern .modern-table-title {
      font-size: 9px !important;
      margin-bottom: 6px !important;
    }

    .print-content-modern table {
      font-size: 7px !important;
      border-radius: 6px !important;
      page-break-inside: auto;
      overflow: visible !important;
      width: 100% !important;
    }

    .print-content-modern table thead th {
      padding: 4px 3px !important;
      font-size: 7px !important;
      letter-spacing: 0.02em !important;
    }

    .print-content-modern table tbody td {
      padding: 4px 3px !important;
      font-size: 7px !important;
    }

    .print-content-modern thead {
      display: table-header-group;
    }

    .print-content-modern tbody {
      display: table-row-group;
      overflow: visible !important;
    }

    .print-content-modern tbody tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    .print-content-modern .modern-table-summary {
      gap: 12px !important;
      margin-top: 6px !important;
      font-size: 7px !important;
    }

    .print-content-modern .modern-table-summary strong {
      font-size: 8px !important;
    }

    /* Compact totals */
    .print-content-modern .modern-totals {
      padding: 8px 10px !important;
      margin-bottom: 8px !important;
      border-radius: 10px !important;
      page-break-inside: avoid;
    }

    .print-content-modern .modern-totals .row {
      margin-bottom: 3px !important;
      font-size: 8px !important;
    }

    .print-content-modern .modern-totals .grand {
      font-size: 11px !important;
      margin-top: 6px !important;
      padding-top: 6px !important;
    }

    /* Compact notes */
    .print-content-modern .modern-notes {
      padding: 6px 8px !important;
      margin-bottom: 6px !important;
      border-radius: 8px !important;
      font-size: 7px !important;
      page-break-inside: avoid;
    }

    .print-content-modern .modern-notes strong {
      font-size: 8px !important;
    }

    .print-content-modern .modern-notes p {
      margin-top: 2px !important;
      font-size: 7px !important;
    }

    /* Compact footer */
    .print-content-modern .modern-footer {
      font-size: 7px !important;
      margin-top: 6px !important;
      page-break-inside: avoid;
    }

    .print-content-modern .modern-footer p {
      margin: 1px 0 !important;
    }
  }
    .print-content-modern.print-view .modern-header,
    .print-content-modern.print-view .modern-status-card,
    .print-content-modern.print-view .modern-table-section,
    .print-content-modern.print-view .modern-totals,
    .print-content-modern.print-view .modern-notes,
    .print-content-modern.print-view .modern-footer {
      page-break-inside: avoid;
    }
    .print-content-modern.print-view .modern-header {
      margin-bottom: 16px !important;
      padding-bottom: 12px !important;
    }
    .print-content-modern.print-view .nota-pill {
      font-size: 11px !important;
      padding: 3px 12px !important;
    }
    .print-content-modern.print-view h1 {
      font-size: 22px !important;
      margin-bottom: 4px !important;
    }
    .print-content-modern.print-view .muted {
      font-size: 12px !important;
    }
    .print-content-modern.print-view .store-inline {
      margin-top: 10px !important;
      padding-top: 10px !important;
    }
    .print-content-modern.print-view .store-address {
      font-size: 12px !important;
    }
    .print-content-modern.print-view .store-contact-heading {
      font-size: 10px !important;
      margin-bottom: 4px !important;
    }
    .print-content-modern.print-view .store-contact-grid {
      font-size: 11px !important;
      gap: 8px 12px !important;
    }
    .print-content-modern.print-view .store-contact-label {
      font-size: 10px !important;
    }
    .print-content-modern.print-view .store-bank {
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-meta {
      gap: 8px 12px !important;
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-meta span {
      font-size: 10px !important;
    }
    .print-content-modern.print-view .modern-meta strong {
      font-size: 13px !important;
    }
    .print-content-modern.print-view .modern-info-grid {
      gap: 12px !important;
      margin-bottom: 16px !important;
    }
    .print-content-modern.print-view .modern-info-card {
      padding: 10px 12px !important;
    }
    .print-content-modern.print-view .modern-info-card span {
      font-size: 10px !important;
      margin-bottom: 3px !important;
    }
    .print-content-modern.print-view .modern-info-card strong {
      font-size: 13px !important;
    }
    .print-content-modern.print-view .modern-status-card {
      padding: 14px 16px !important;
      margin-bottom: 16px !important;
    }
    .print-content-modern.print-view .section-label {
      font-size: 10px !important;
      margin-bottom: 8px !important;
    }
    .print-content-modern.print-view .status-chip {
      font-size: 11px !important;
      padding: 3px 12px !important;
      margin-bottom: 12px !important;
    }
    .print-content-modern.print-view .status-values {
      gap: 12px !important;
    }
    .print-content-modern.print-view .status-values .amount-card {
      padding: 10px !important;
    }
    .print-content-modern.print-view .status-values span {
      font-size: 10px !important;
      margin-bottom: 4px !important;
    }
    .print-content-modern.print-view .status-values strong {
      font-size: 14px !important;
    }
    .print-content-modern.print-view .modern-installments {
      margin-top: 14px !important;
      padding-top: 10px !important;
    }
    .print-content-modern.print-view .modern-installments .installment-row {
      padding: 8px 0 !important;
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-installments strong {
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-installments span {
      font-size: 11px !important;
    }
    .print-content-modern.print-view .modern-installments .installment-value {
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-table-section {
      padding: 14px 16px !important;
      margin-bottom: 16px !important;
    }
    .print-content-modern.print-view .modern-table-title {
      font-size: 14px !important;
      margin-bottom: 10px !important;
    }
    .print-content-modern.print-view .modern-table-section table {
      font-size: 11px !important;
    }
    .print-content-modern.print-view .modern-table-section table thead th {
      padding: 8px 6px !important;
      font-size: 10px !important;
    }
    .print-content-modern.print-view .modern-table-section table tbody td {
      padding: 8px 6px !important;
    }
    .print-content-modern.print-view .modern-table-summary {
      gap: 16px !important;
      margin-top: 12px !important;
      font-size: 11px !important;
    }
    .print-content-modern.print-view .modern-totals {
      padding: 14px 16px !important;
      margin-bottom: 14px !important;
    }
    .print-content-modern.print-view .modern-totals .row {
      margin-bottom: 6px !important;
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-totals .grand {
      font-size: 15px !important;
      margin-top: 10px !important;
      padding-top: 10px !important;
      border-top: 2px solid #e2e8f0 !important;
    }
    .print-content-modern.print-view .modern-notes {
      padding: 12px 14px !important;
      margin-bottom: 12px !important;
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-notes strong {
      font-size: 12px !important;
    }
    .print-content-modern.print-view .modern-notes p {
      margin-top: 4px !important;
    }
    .print-content-modern.print-view .modern-footer {
      font-size: 11px !important;
      margin-top: 12px !important;
    }
    .print-content-modern.print-view .modern-footer p {
      margin: 2px 0 !important;
    }
  }

  /* Ketika membuat PDF/WA, kita menambahkan class 'print-pdf' */
  .print-content-modern.print-pdf {
    font-size: 18px;
    line-height: 1.6;
    padding: 40px;
    box-shadow: none;
  }

  .print-content-modern.print-pdf .modern-table-section table {
    font-size: 16px;
  }

  .print-content-modern.print-pdf .modern-status-card,
  .print-content-modern.print-view .modern-status-card {
    background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.02));
  }

  /* Wrapper default disembunyikan hingga siap */
  .print-source-wrapper {
    position: fixed;
    left: -99999px;
    top: 0;
    width: 100%;
    pointer-events: none;
    opacity: 0;
    z-index: -1;
  }
  .print-content-modern {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    background: #ffffff;
    color: #0f172a;
    padding: 32px;
    border-radius: 24px;
    font-family: 'Segoe UI', Arial, sans-serif;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
    border: 1px solid #e2e8f0;
  }
  .print-content-modern.print-view {
    font-size: 13px;
    line-height: 1.55;
    color: #0f172a;
  }
  .print-content-modern.print-view .nota-pill {
    background: #e0f2fe;
    color: #0c4a6e;
  }
  .print-content-modern.print-view .modern-info-card,
  .print-content-modern.print-view .modern-status-card,
  .print-content-modern.print-view .modern-totals,
  .print-content-modern.print-view .modern-notes {
    border-color: #dbeafe;
    background: #fff;
  }
  .print-content-modern.print-view .modern-status-card {
    background: linear-gradient(135deg, rgba(14,165,233,0.06), rgba(14,165,233,0.015));
  }
  .print-content-modern.print-view .modern-table-section {
    border-color: #dbeafe;
  }
  .print-content-modern.print-view .modern-table-section table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .print-content-modern.print-view .modern-table-section table thead th {
    background: #eff6ff;
    color: #1e293b;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.06em;
    border-bottom: 1px solid #bfdbfe;
  }
  .print-content-modern.print-view .modern-table-section table td,
  .print-content-modern.print-view .modern-table-section table th {
    padding: 10px;
    border-right: 1px solid #e2e8f0;
  }
  .print-content-modern.print-view .modern-table-section table td:last-child,
  .print-content-modern.print-view .modern-table-section table th:last-child {
    border-right: none;
  }
  .print-content-modern.print-view .modern-table-section table tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  .print-content-modern.print-view .modern-totals .row span:last-child,
  .print-content-modern.print-view .grand span:last-child {
    font-family: 'Roboto Mono', 'Menlo', 'Consolas', monospace;
  }
  .print-content-modern .modern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .print-content-modern .header-brand {
    min-width: 220px;
  }
  .print-content-modern .nota-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: #ecfeff;
    color: #0e7490;
    margin-bottom: 6px;
    line-height: 1;
  }
  .print-content-modern h1 {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 6px;
    line-height: 1.25;
  }
  .print-content-modern .muted {
    color: #64748b;
    font-size: 14px;
  }
  .print-content-modern .modern-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px 18px;
    font-size: 14px;
  }
  .print-content-modern .modern-meta span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .print-content-modern .modern-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  .print-content-modern .store-info-card {
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 18px 20px;
    margin-bottom: 20px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .print-content-modern .store-inline {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .print-content-modern .store-info-top {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .print-content-modern .store-name {
    font-weight: 700;
    font-size: 17px;
    color: #0f172a;
  }
  .print-content-modern .store-address {
    color: #475569;
    font-size: 14px;
  }
  .print-content-modern .store-contact-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 18px;
    font-size: 13px;
    color: #0f172a;
  }
  .print-content-modern .store-contact-heading {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .print-content-modern .store-contact-grid span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .print-content-modern .store-contact-label {
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .print-content-modern .store-bank {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 14px;
    color: #0f172a;
  }
  .print-content-modern .modern-info-card {
    background: #f8fafc;
    border-radius: 16px;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
  }
  .print-content-modern .modern-info-card span {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .print-content-modern .modern-info-card strong {
    font-size: 15px;
    color: #0f172a;
  }
  .print-content-modern .modern-status-card {
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.02));
  }
  .print-content-modern .section-label {
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.08em;
    color: #94a3b8;
    margin-bottom: 10px;
    font-weight: 600;
  }
  .print-content-modern .status-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1;
  }
  .print-content-modern .status-chip.success { background: #dcfce7; color: #166534; }
  .print-content-modern .status-chip.warning { background: #fef9c3; color: #854d0e; }
  .print-content-modern .status-values {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
  }
  .print-content-modern .status-values .amount-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
  }
  .print-content-modern .status-values span {
    display: block;
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  .print-content-modern .status-values strong {
    font-size: 16px;
    color: #0f172a;
  }
  .print-content-modern .modern-installments {
    margin-top: 18px;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
  }
  .print-content-modern .modern-installments .installment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 14px;
  }
  .print-content-modern .modern-installments .installment-row:last-child {
    border-bottom: none;
  }
  .print-content-modern .modern-installments strong {
    font-size: 14px;
    color: #0f172a;
  }
  .print-content-modern .modern-installments span {
    font-size: 13px;
    color: #64748b;
  }
  .print-content-modern .modern-installments .installment-value {
    font-family: 'Roboto Mono', 'Menlo', 'Consolas', monospace;
    color: #0f172a;
    font-weight: 600;
  }
  .print-content-modern .modern-table-section {
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .print-content-modern .modern-table-title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 12px;
    color: #0f172a;
  }
  .print-content-modern table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }
  .print-content-modern table thead th {
    text-align: left;
    padding: 12px 10px;
    background: #f1f5f9;
    color: #475569;
    font-weight: 600;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
  }
  .print-content-modern table thead th:last-child { border-right: none; }
  .print-content-modern table tbody td {
    padding: 12px 10px;
    border-bottom: 1px solid #e2e8f0;
    color: #0f172a;
    border-right: 1px solid #e2e8f0;
  }
  .print-content-modern table tbody tr:last-child td { border-bottom: none; }
  .print-content-modern table tbody td:last-child { border-right: none; }
  .print-content-modern .modern-table-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-top: 16px;
    font-size: 13px;
    color: #475569;
  }
  .print-content-modern .modern-table-summary div {
    min-width: 140px;
  }
  .print-content-modern .modern-totals {
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    background: #f8fafc;
  }
  .print-content-modern .modern-totals .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .print-content-modern .modern-totals .row span:last-child {
    font-family: 'Roboto Mono', 'Menlo', 'Consolas', monospace;
  }
  .print-content-modern .modern-totals .grand {
    font-weight: 700;
    font-size: 18px;
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
  }
  .print-content-modern .modern-notes {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fff;
    font-size: 14px;
  }
  .print-content-modern .modern-footer {
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
    margin-top: 16px;
  }
  .print-content-modern .text-danger {
    color: #dc2626;
  }
  .print-content-modern .text-right { text-align: right; }
  .print-content-modern .text-center { text-align: center; }
  .print-source-wrapper.print-ready {
    position: relative;
    left: 0;
    top: 0;
    opacity: 1;
    pointer-events: auto;
    z-index: 9999;
  }
  .print-source-wrapper.print-ready .print-content-modern {
    box-shadow: none;
  }

  /* Modal Animation */
  @keyframes modalFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modalZoomIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-overlay {
    animation: modalFadeIn 0.4s ease-out;
  }

  .modal-content {
    animation: modalZoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

// Helper function to format date with month name
const formatDateWithMonth = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const days = String(date.getDate()).padStart(2, '0');
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${days} ${month} ${year}`;
};

// (printStyles applied directly where needed; helper removed because it's unused)
export default function BarangKeluar() {
  const navigate = useNavigate();
  const [sendingWA, setSendingWA] = useState(false);
  const [storeProfile, setStoreProfile] = useState<any>(null);
  const storePhones: { label: string; value: string }[] = storeProfile ? extractStorePhones(storeProfile) : [];

  const renderModernNota = (transaksi: any, extraClass = '') => {
    if (!transaksi) return null;
    const details = transaksi.details || [];
    const toNumber = (val: any) => Number(val || 0);
    const grossBeforeRetur = details.reduce((sum: number, detail: any) => sum + (toNumber(detail.jml_yard) * toNumber(detail.harga_satuan)), 0);
    const totalReturNominal = details.reduce((sum: number, detail: any) => sum + (toNumber(detail.jml_yard_retur) * toNumber(detail.harga_satuan)), 0);
    const totalReturYard = details.reduce((sum: number, detail: any) => sum + toNumber(detail.jml_yard_retur), 0);
    const totalReturRol = details.reduce((sum: number, detail: any) => sum + toNumber(detail.jml_rol_retur), 0);
    const totalQtyYard = details.reduce((sum: number, detail: any) => sum + toNumber(detail.jml_yard), 0);
    const totalQtyRol = details.reduce((sum: number, detail: any) => sum + toNumber(detail.jml_rol), 0);
    const netBarang = Math.max(0, grossBeforeRetur - totalReturNominal);
    const discountNominal = transaksi.tipe_discount === "persen"
      ? (netBarang * toNumber(transaksi.jml_discount)) / 100
      : toNumber(transaksi.jml_discount);
    const subtotal = netBarang - discountNominal;
    const ppnNominal = transaksi.tipe_ppn === "persen"
      ? (subtotal * toNumber(transaksi.jml_ppn)) / 100
      : toNumber(transaksi.jml_ppn);
    const totalKeseluruhan = subtotal + ppnNominal;
    const statusBerjangka = transaksi.status_pembayaran === "1";
    const totalBayar = statusBerjangka
      ? calculateTotalPayment(transaksi.berjangka || [])
      : totalKeseluruhan;
    const sisaBayar = Math.max(0, totalKeseluruhan - totalBayar);
    const sudahLunas = !statusBerjangka || totalBayar >= totalKeseluruhan;
    const pelanggan = transaksi.pelanggan || {};
    const storeInfo = storeProfile;
    const discountLabel = transaksi.tipe_discount === "persen" ? `${transaksi.jml_discount || 0}%` : 'Nominal';
    const ppnLabel = transaksi.tipe_ppn === "persen" ? `${transaksi.jml_ppn || 0}%` : 'Nominal';

    return (
      <div className={`print-content-modern ${extraClass}`.trim()}>
        <header className="modern-header">
          <div className="header-brand">
            <span className="nota-pill">Zea Textile</span>
            <h1>Nota Pembelian</h1>
            <p className="muted">Tanggal Transaksi: {formatDateWithMonth(transaksi.tgl_transaksi)}</p>
            {storeInfo && (
              <div className="store-inline">
                {storeInfo.alamat && <p className="store-address">{storeInfo.alamat}</p>}
                {storePhones.length > 0 && (
                  <div>
                    <p className="store-contact-heading">Kontak / Nomor Telepon · WhatsApp</p>
                    <div className="store-contact-grid">
                      {storePhones.map((phone: { label: string; value: string }) => (
                        <span key={phone.label}>
                          <span className="store-contact-label">{phone.label}</span>
                          <span>{phone.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(storeInfo.rekening || storeInfo.nama_rekening) && (
                  <div className="store-bank">
                    {storeInfo.rekening && <span>{storeInfo.rekening}</span>}
                    {storeInfo.nama_rekening && <span>{storeInfo.nama_rekening}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modern-meta">
            <div>
              <span>No. Nota</span>
              <strong>#{transaksi.id}</strong>
            </div>
            <div>
              <span>Kasir</span>
              <strong>{transaksi.penginput?.username || '-'}</strong>
            </div>
            <div>
              <span>Total Item</span>
              <strong>{details.length} barang</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{statusBerjangka ? (sudahLunas ? 'Lunas (Berjangka)' : 'Berjangka') : 'Lunas'}</strong>
            </div>
          </div>
        </header>

        <section className="modern-info-grid">
          <div className="modern-info-card">
            <span>Pelanggan</span>
            <strong>{pelanggan.nama || '-'}</strong>
          </div>
        </section>

        <section className="modern-status-card">
          <p className="section-label">Status Pembayaran</p>
          <div className={`status-chip ${sudahLunas ? 'success' : 'warning'}`}>
            {statusBerjangka ? (sudahLunas ? 'Lunas - Berjangka' : 'Pembayaran Berjangka') : 'Lunas'}
          </div>
          <div className="status-values">
            <div className="amount-card">
              <span>Total Tagihan</span>
              <strong>Rp {totalKeseluruhan.toLocaleString()}</strong>
            </div>
            <div className="amount-card">
              <span>Telah Dibayar</span>
              <strong>Rp {totalBayar.toLocaleString()}</strong>
            </div>
            <div className="amount-card">
              <span>Sisa</span>
              <strong className={sisaBayar > 0 ? 'text-danger' : ''}>Rp {sisaBayar.toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className="modern-table-section">
          <div className="modern-table-title">Rincian Barang</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Barang</th>
                <th className="text-center">Yard</th>
                <th className="text-center">Rol</th>
                <th className="text-center">Retur Yard</th>
                <th className="text-center">Retur Rol</th>
                <th className="text-right">Harga/Yard</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail: any, idx: number) => {
                const actualYard = Math.max(0, toNumber(detail.jml_yard) - toNumber(detail.jml_yard_retur));
                const rowTotal = actualYard * toNumber(detail.harga_satuan);
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{detail.barang?.nama_barang || detail.nama_barang || '-'}</td>
                    <td className="text-center">{toNumber(detail.jml_yard).toLocaleString()}</td>
                    <td className="text-center">{toNumber(detail.jml_rol).toLocaleString()}</td>
                    <td className="text-center">{toNumber(detail.jml_yard_retur).toLocaleString()}</td>
                    <td className="text-center">{toNumber(detail.jml_rol_retur).toLocaleString()}</td>
                    <td className="text-right">Rp {toNumber(detail.harga_satuan).toLocaleString()}</td>
                    <td className="text-right">Rp {rowTotal.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="modern-table-summary">
            <div>
              <strong>Total Yard</strong>
              <div>{totalQtyYard.toLocaleString()} yard</div>
            </div>
            <div>
              <strong>Total Rol</strong>
              <div>{totalQtyRol.toLocaleString()} rol</div>
            </div>
            <div>
              <strong>Retur</strong>
              <div>{totalReturYard.toLocaleString()} yard / {totalReturRol.toLocaleString()} rol</div>
            </div>
          </div>
        </section>

        <section className="modern-totals">
          <div className="row">
            <span>Gross</span>
            <span>Rp {grossBeforeRetur.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>Retur</span>
            <span>- Rp {totalReturNominal.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>Discount ({discountLabel})</span>
            <span>- Rp {discountNominal.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>PPN ({ppnLabel})</span>
            <span>+ Rp {ppnNominal.toLocaleString()}</span>
          </div>
          <div className="grand">
            <span>Total Tagihan</span>
            <span>Rp {totalKeseluruhan.toLocaleString()}</span>
          </div>
        </section>

        <section className="modern-notes">
          <strong>Catatan</strong>
          <p>{transaksi.catatan || 'Tidak ada catatan tambahan.'}</p>
        </section>

        <footer className="modern-footer">
          <p>Terima kasih telah mempercayakan kebutuhan tekstil kepada kami.</p>
          <p>Hubungi admin untuk bantuan lebih lanjut.</p>
        </footer>
      </div>
    );
  };

  const handleDeleteTransaksi = async (transaksiId: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus transaksi?',
      text: `Data yang dihapus tidak dapat dikembalikan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = await deleteTransaksiKeluar(transaksiId);
        if (data && data.status) {
          window.location.reload();
        }
      }
    });
  };

  // Fungsi export Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet((transactions || []).map((item, idx) => ({
      No: (page - 1) * rowsPerPage + idx + 1,
      "Tanggal Transaksi": formatDateWithMonth(item.tgl_transaksi),
      "Customer": item.pelanggan?.nama || '',
      "Total Harga": item.total_transaksi,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BarangKeluar");
    XLSX.writeFile(wb, "barang-keluar.xlsx");
  };

  // State transaksi dari server
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalPagesState, setTotalPagesState] = useState(1);

  // State untuk modal cetak nota
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedTransaksiForPrint, setSelectedTransaksiForPrint] = useState<any>(null);
  const [loadingPrintData, setLoadingPrintData] = useState(false);

  // Handler untuk buka modal dan fetch data
  const handleOpenPrintModal = async (transaksiId: number) => {
    setShowPrintModal(true);
    setLoadingPrintData(true);
    try {
      const data = await getTransaksiKeluarById(transaksiId);
      if (data) {
        setSelectedTransaksiForPrint(data);
      } else {
        toast.error('Gagal memuat data transaksi');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoadingPrintData(false);
    }
  };

  // (Removed unused buildWhatsAppMessage helper — caption is fixed now)

  const sendWhatsAppViaServer = async () => {
    if (!selectedTransaksiForPrint) return toast.error('Data transaksi belum tersedia');
    const transaksi = selectedTransaksiForPrint;
    const phoneRaw = transaksi.pelanggan?.no_tlp || '';
    if (!phoneRaw) return toast.error('Nomor telepon customer tidak tersedia');
    const number = phoneRaw.toString().replace(/[^0-9]/g, '');
    if (!number) return toast.error('Nomor telepon customer tidak valid');

    const caption = 'NOTA PEMBELIAN BARANG - Zea Textile';

    // Find the hidden modern layout inside the print wrapper
    const printSourceWrapper = document.querySelector('.print-source-wrapper') as HTMLElement | null;
    const printEl = printSourceWrapper?.querySelector('.print-content-modern') as HTMLElement | null;
    if (!printEl) return toast.error('Konten nota untuk dicetak tidak ditemukan');
    let captureContainer: HTMLDivElement | null = null;
    let captureEl: HTMLElement | null = null;

    setSendingWA(true);
    try {
      try { printSourceWrapper?.classList.add('print-ready'); } catch (e) { /* ignore */ }
      // Dynamically import libraries to avoid hard dependency at build-time
      const [{ default: html2canvas }, jspdfModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const { jsPDF } = jspdfModule as any;

      // Render DOM to canvas by cloning the modern layout into a visible container
      let canvas: HTMLCanvasElement | null = null;
      captureEl = printEl.cloneNode(true) as HTMLElement;
      captureEl.classList.add('print-pdf');
      captureContainer = document.createElement('div');
      captureContainer.style.position = 'fixed';
      captureContainer.style.left = '0';
      captureContainer.style.top = '0';
      captureContainer.style.width = '100%';
      captureContainer.style.minHeight = '100vh';
      captureContainer.style.padding = '24px';
      captureContainer.style.background = '#f8fafc';
      captureContainer.style.zIndex = '2147483647';
      captureContainer.style.overflow = 'auto';
      captureEl.style.margin = '0 auto';
      captureEl.style.maxWidth = '820px';
      captureEl.style.position = 'relative';
      captureEl.style.left = '0';
      captureEl.style.top = '0';
      captureEl.style.opacity = '1';
      captureContainer.appendChild(captureEl);
      document.body.appendChild(captureContainer);
      await new Promise((resolve) => setTimeout(resolve, 200));
      canvas = await html2canvas(captureEl as HTMLElement, {
        scale: 3.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      });

      if (!canvas) throw new Error('Gagal merender nota menjadi canvas');
      // Use JPEG with high quality for clearer text while keeping size reasonable.
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create PDF sized to match nota width
      const pdf = new jsPDF({
        orientation: canvas.height >= canvas.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      // Export PDF as blob
      const pdfBlob = pdf.output && typeof pdf.output === 'function'
        ? pdf.output('blob')
        : null;

      if (!pdfBlob) throw new Error('Gagal membuat PDF');

      // Prepare file and send via service
      const fileName = `Nota Pembelian Zea Textile- Nomor Transaksi : ${transaksi.id || Date.now()}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      const data = await sendNotaFile(file, number, caption);
      // API returns { ok: true, id: '...' } on success
      if (data && data.ok === true) {
        toast.success('nota berhasil dikirim');
        // keep the print modal open after successful send
      } else {
        toast.error('nota gagal dikirim');
      }
    } catch (err: any) {
      console.error('Error sending nota PDF via server', err);
      if (err && err.code === 'ERR_MODULE_NOT_FOUND') {
        toast.error('Butuh library tambahan: jalankan `npm i html2canvas jspdf`');
      } else if (err && /html2canvas/i.test(String(err.message || ''))) {
        toast.error('Gagal merender konten nota menjadi PDF');
      } else {
        toast.error('Terjadi kesalahan saat mengirim file nota');
      }
    } finally {
      try { captureContainer?.remove(); } catch (e) { /* ignore */ }
      captureEl = null;
      captureContainer = null;
      try { printSourceWrapper?.classList.remove('print-ready'); } catch (e) { /* ignore */ }
      setSendingWA(false);
    }
  };

  const handlePrintNota = () => {
    if (!selectedTransaksiForPrint) return toast.error('Data transaksi belum tersedia');
    window.print();
  };

  // State filter dan pagination
  const [customer, setCustomer] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [tanggalStart, setTanggalStart] = useState("");
  const [tanggalEnd, setTanggalEnd] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = totalPagesState;
  const paginatedData = transactions;

  // TODO: Fetch transaksi from server when filters / page change
  useEffect(() => {
    let mounted = true;
    async function fetchTransaksi() {
      const data = await getTransaksiKeluar({
        page,
        customerId: customer ? Number(customer) : undefined,
        waktuAwal: tanggalStart,
        waktuAkhir: tanggalEnd
      });
      if (mounted && data) {
        setTransactions(data.data || []);
        setTotalPagesState(data.totalPages || 1);
      }
    }
    fetchTransaksi();
    return () => { mounted = false; };
  }, [page, customer, tanggalStart, tanggalEnd]);

  useEffect(() => {
    let mounted = true;
    async function fetchCustomers() {
      const data = await getAllCustomers();
      if (mounted && data) setCustomers(data);
    }
    fetchCustomers();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        const profile = await getStoreProfile();
        if (mounted) setStoreProfile(profile);
      } catch (error) {
        console.warn('Gagal mengambil info toko', error);
      }
    }
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <PageMeta
        title="Zea. Textile - Barang Keluar"
        description="Data barang keluar yang tersedia di Zea. Textile"
      />
      <PageBreadcrumb pageTitle="Barang Keluar" />
      <div className="space-y-6">
        <ComponentCard title="Daftar Barang Keluar Per Transaksi">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate('/tambah-keluar')}
            >
              + Tambah Data
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleExportExcel}
            >
              Export Excel
            </button>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Cari atau pilih customer..."
                value={selectedCustomerName || customerQuery}
                onChange={e => { setCustomerQuery(e.target.value); setSelectedCustomerName(''); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="border rounded px-3 py-2 text-sm w-full bg-white dark:bg-gray-900 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {showCustomerDropdown && (
                <ul className="absolute z-40 w-full max-h-48 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded shadow-sm">
                  <li className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onMouseDown={() => { setCustomer(''); setSelectedCustomerName(''); setCustomerQuery(''); setShowCustomerDropdown(false); }}>Semua Customer</li>
                  {customers.filter(s => s.nama.toLowerCase().includes((customerQuery || selectedCustomerName).toLowerCase())).map(s => (
                    <li key={s.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                      onMouseDown={() => { setCustomer(String(s.id)); setSelectedCustomerName(s.nama); setCustomerQuery(''); setShowCustomerDropdown(false); }}
                    >
                      <span className="truncate">{s.nama}</span>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{s.no_tlp}</span>
                    </li>
                  ))}
                  {customers.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Tidak ada customer</li>}
                </ul>
              )}
            </div>
            <input
              type="date"
              value={tanggalStart}
              onChange={e => setTanggalStart(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white/90"
              placeholder="Tanggal Awal"
            />
            <span className="text-gray-500 dark:text-gray-400">s/d</span>
            <input
              type="date"
              value={tanggalEnd}
              onChange={e => setTanggalEnd(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white/90"
              placeholder="Tanggal Akhir"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-12 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Tanggal Transaksi</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Customer</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Total Harga</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Status Pembayaran</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Penginput/Pengedit Data</TableCell>
                    <TableCell isHeader className="w-64 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <td colSpan={7} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                    </TableRow>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <TableRow key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{formatDateWithMonth(item.tgl_transaksi)}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.pelanggan?.nama || ''}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {(() => {
                            const details = item.details || [];
                            const gross = details.reduce((s: number, d: any) => s + (Number(d.jml_yard || 0) * Number(d.harga_satuan || 0)), 0);
                            const deduction = details.reduce((s: number, d: any) => s + (Number(d.jml_yard_retur || 0) * Number(d.harga_satuan || 0)), 0);
                            const net = Math.max(0, gross - deduction);
                            const totalReturYard = details.reduce((s: number, d: any) => s + Number(d.jml_yard_retur || 0), 0);
                            const hasRetur = deduction > 0;
                            return (
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold">Rp {net.toLocaleString()}</span>
                                  {hasRetur && <span className="inline-block text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">Retur</span>}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>Gross: Rp {gross.toLocaleString()}</span>
                                  {hasRetur && (
                                    <span className="ml-2 text-red-600 dark:text-red-400">− Rp {deduction.toLocaleString()} ({totalReturYard.toLocaleString()}y)</span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              {item.status_pembayaran === "0" ? (
                                <div className="text-sm font-bold px-3 py-1.5 rounded-full inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                  Lunas
                                </div>
                              ) : (
                                (() => {
                                  const totalBayar = calculateTotalPayment(item.berjangka || []);
                                  const totalTransaksi = Number(item.total_transaksi);
                                  const isSudahLunas = totalBayar >= totalTransaksi;

                                  return (
                                    <div>
                                      <div className={`text-sm font-bold px-3 py-1.5 rounded-full inline-block ${isSudahLunas
                                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                        : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                        }`}>
                                        {isSudahLunas ? "Lunas - " : ""}Pembayaran Berjangka
                                      </div>
                                    </div>
                                  );
                                })()
                              )}
                              {item.status_pembayaran === "1" && item.berjangka && item.berjangka.length > 0 && (
                                <div className="text-xs space-y-2 mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                                  {item.berjangka
                                    .sort((a: any, b: any) => a.id - b.id)
                                    .map((tenor: any, tIdx: number) => (
                                      <div key={tenor.id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                          Angsuran {tIdx + 1}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          Jatuh Tempo: {formatDateWithMonth(tenor.tgl_jatuh_tempo)}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          Jumlah Bayar: Rp {Number(tenor.jml_bayar || 0).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.penginput?.username || ''}</TableCell>
                        <TableCell className="w-64 px-2 py-2 border text-center">
                          <button className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded mr-1 hover:bg-blue-600" onClick={() => navigate(`/detail-keluar/${item.id}`)}>Detail</button>
                          <button className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded mr-1 hover:bg-yellow-600" onClick={() => navigate(`/edit-keluar/${item.id}`)}>Edit</button>
                          {item.status_pembayaran === "1" && (
                            <button className="px-1.5 py-0.5 text-xs bg-purple-500 text-white rounded mr-1 hover:bg-purple-600" onClick={() => navigate(`/input-cicilan-keluar/${item.id}`)}>Input Cicilan</button>
                          )}
                          <button className="px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded mr-1 hover:bg-orange-600" onClick={() => navigate(`/retur-keluar/${item.id}`)}>Retur</button>
                          <button className="px-1.5 py-0.5 text-xs bg-green-500 text-white rounded mr-1 hover:bg-green-600" onClick={() => handleOpenPrintModal(item.id)}>Cetak Nota</button>
                          <button className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDeleteTransaksi(item.id)}>Hapus</button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex justify-end items-center gap-2 w-full">
              <span className="dark:bg-gray-900 dark:text-white/90">Halaman:</span>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                  onClick={() => setPage(i + 1)}
                  disabled={page === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </ComponentCard>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />

      {/* Modal Cetak Nota */}
      {showPrintModal && selectedTransaksiForPrint && (
        <div className="modal-overlay fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999999]">
          <style>{printStyles}</style>
          <div className="modal-content bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="modal-header flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Cetak Nota</h2>
              <button onClick={() => setShowPrintModal(false)} disabled={loadingPrintData} className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50">&times;</button>
            </div>

            {/* Loading State */}
            {loadingPrintData && (
              <div className="p-6 flex justify-center items-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Memuat data...</p>
                </div>
              </div>
            )}

            {/* Content Modal - Nota (tetap menggunakan layout lama) */}
            {!loadingPrintData && (
              <div className="print-content p-6 bg-white text-gray-800">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-800">NOTA PEMBELIAN BARANG - Zea Textile</h3>
                  <p className="text-sm text-gray-600">No. Transaksi: {selectedTransaksiForPrint.id}</p>
                </div>

                {storeProfile && (
                  <div className="mb-4 pb-4 border-b text-sm text-gray-700 space-y-1">
                    <p className="text-base font-semibold text-gray-900">{storeProfile.nama_toko}</p>
                    {storeProfile.alamat && <p>{storeProfile.alamat}</p>}
                    {storePhones.length > 0 && (
                      <div className="flex flex-col gap-1 pt-1">
                        <p className="text-xs font-semibold tracking-wide text-gray-500">Kontak / Nomor Telepon · WhatsApp</p>
                        <div className="flex flex-wrap gap-4">
                          {storePhones.map((phone: { label: string; value: string }) => (
                            <span key={phone.label} className="text-xs uppercase tracking-wide text-gray-500">
                              {phone.label}: <span className="text-sm font-medium text-gray-800 normal-case">{phone.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(storeProfile.rekening || storeProfile.nama_rekening) && (
                      <div className="text-sm text-gray-800 pt-1">
                        {storeProfile.rekening && <p>{storeProfile.rekening}</p>}
                        {storeProfile.nama_rekening && <p>{storeProfile.nama_rekening}</p>}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tanggal:</p>
                    <p className="text-sm text-gray-700">{formatDateWithMonth(selectedTransaksiForPrint.tgl_transaksi)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Pelanggan :</p>
                    <p className="text-sm text-gray-700">{selectedTransaksiForPrint.pelanggan?.nama || '-'}</p>
                  </div>
                </div>

                {/* Status Pembayaran (ditampilkan di modal dan pada PDF nota) */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm font-semibold text-gray-800">Status Pembayaran:</p>
                  {(() => {
                    const totalBayar = calculateTotalPayment(selectedTransaksiForPrint.berjangka || []);
                    const totalTransaksi = Number(selectedTransaksiForPrint.total_transaksi || 0);
                    if (selectedTransaksiForPrint.status_pembayaran === "1") {
                      const sudahLunasBerjangka = totalBayar >= totalTransaksi;
                      return (
                        <div className="text-sm text-gray-700 mt-2">
                          <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${sudahLunasBerjangka ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {sudahLunasBerjangka ? 'Lunas - Pembayaran Berjangka' : 'Pembayaran Berjangka'}
                          </div>
                          <div className="mt-3 space-y-2 installments-list">
                            {(selectedTransaksiForPrint.berjangka || []).length === 0 && (
                              <div className="text-sm text-gray-600">Tidak ada data cicilan.</div>
                            )}
                            {(selectedTransaksiForPrint.berjangka || []).map((b: any, i: number) => (
                              <div key={b.id || i} className="bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-center">
                                  <div className="text-sm pr-4 whitespace-nowrap">Angsuran {i + 1} - Jatuh Tempo: {formatDateWithMonth(b.tgl_jatuh_tempo)}</div>
                                  <div className="text-sm font-semibold text-right whitespace-nowrap" style={{ fontFamily: 'Roboto Mono, Menlo, Consolas, monospace', fontVariantNumeric: 'tabular-nums', minWidth: '200px' }}>
                                    Rp {Number(b.jml_bayar || 0).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between mt-2 text-sm items-center">
                              <div>Total Terbayar:</div>
                              <div className="font-semibold text-right whitespace-nowrap" style={{ fontFamily: 'Roboto Mono, Menlo, Consolas, monospace', fontVariantNumeric: 'tabular-nums', minWidth: '200px' }}>Rp {totalBayar.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="text-sm text-gray-700 mt-2">
                        <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap bg-green-100 text-green-800">Lunas</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Tabel Detail Barang */}
                <div className="mb-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 bg-gray-100">
                        <th className="text-left py-2 px-2 text-gray-800">No</th>
                        <th className="text-left py-2 px-2 text-gray-800">Barang</th>
                        <th className="text-center py-2 px-2 text-gray-800">Yard</th>
                        <th className="text-center py-2 px-2 text-gray-800">Rol</th>
                        <th className="text-center py-2 px-2 text-gray-800">Retur Yard</th>
                        <th className="text-center py-2 px-2 text-gray-800">Retur Rol</th>
                        <th className="text-right py-2 px-2 text-gray-800">Harga Per Yard</th>
                        <th className="text-right py-2 px-2 text-gray-800">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedTransaksiForPrint.details || []).map((detail: any, idx: number) => {
                        const actualYard = Math.max(0, (detail.jml_yard || 0) - (detail.jml_yard_retur || 0));
                        const rowTotal = actualYard * detail.harga_satuan;
                        return (
                          <tr key={idx} className="border-b">
                            <td className="py-2 text-gray-800">{idx + 1}</td>
                            <td className="py-2 text-gray-800">{detail.barang?.nama_barang || '-'}</td>
                            <td className="text-center py-2 text-gray-800">{detail.jml_yard}</td>
                            <td className="text-center py-2 text-gray-800">{detail.jml_rol}</td>
                            <td className="text-center py-2 text-gray-800" style={{ backgroundColor: (detail.jml_yard_retur || 0) > 0 ? '#fed7aa' : 'transparent' }}>​{detail.jml_yard_retur || 0}</td>
                            <td className="text-center py-2 text-gray-800" style={{ backgroundColor: (detail.jml_rol_retur || 0) > 0 ? '#fed7aa' : 'transparent' }}>{detail.jml_rol_retur || 0}</td>
                            <td className="text-right py-2 text-gray-800">Rp {Number(detail.harga_satuan).toLocaleString()}</td>
                            <td className="text-right py-2 text-gray-800">Rp {rowTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total dengan Breakdown */}
                <div className="space-y-2 pb-4 border-b text-sm">
                  {(() => {
                    const totalBarang = (selectedTransaksiForPrint.details || []).reduce((sum: number, detail: any) => {
                      const actualYard = Math.max(0, (detail.jml_yard || 0) - (detail.jml_yard_retur || 0));
                      return sum + (actualYard * detail.harga_satuan);
                    }, 0);

                    const discountNominal = selectedTransaksiForPrint.tipe_discount === "persen"
                      ? (totalBarang * selectedTransaksiForPrint.jml_discount) / 100
                      : selectedTransaksiForPrint.jml_discount;

                    const subtotal = totalBarang - discountNominal;

                    const ppnNominal = selectedTransaksiForPrint.tipe_ppn === "persen"
                      ? (subtotal * selectedTransaksiForPrint.jml_ppn) / 100
                      : selectedTransaksiForPrint.jml_ppn;

                    const totalKeseluruhan = subtotal + ppnNominal;

                    return (
                      <>
                        <div>
                          <span>Total Harga Barang:</span>
                          <span>Rp {totalBarang.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Discount:</span>
                          <span>- Rp {discountNominal.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Subtotal:</span>
                          <span>Rp {subtotal.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>PPN:</span>
                          <span>+ Rp {ppnNominal.toLocaleString()}</span>
                        </div>
                        <div className="font-bold text-base">
                          <span>Total Harga Keseluruhan:</span>
                          <span>Rp {totalKeseluruhan.toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {!loadingPrintData && selectedTransaksiForPrint && (
              <div className="print-source-wrapper" aria-hidden="true">
                {renderModernNota(selectedTransaksiForPrint)}
              </div>
            )}

            {/* Footer Modal */}
            <div className="modal-footer flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setShowPrintModal(false)} disabled={loadingPrintData || sendingWA} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50">Tutup</button>
              <button onClick={() => sendWhatsAppViaServer()} disabled={loadingPrintData || sendingWA} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center">
                {sendingWA ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  'Kirim WhatsApp'
                )}
              </button>
              <button onClick={handlePrintNota} disabled={loadingPrintData || sendingWA} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">Print</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 9999999 }} />
    </>
  );
}
