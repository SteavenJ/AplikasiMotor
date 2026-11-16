import { useRef, useState } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { MonthlyExpensePoint, MotoCareData } from '../types';
import { formatIDR, formatNumber } from '../utils';

interface StatsTabProps {
  data: MotoCareData;
  monthlyExpenses: MonthlyExpensePoint[];
  onExportJSON: () => void;
  onImportJSON: (fileText: string) => void;
  onClearAllData: () => void;
  onResetSample: () => void;
  onOpenResetEmpty: () => void;
}

export function StatsTab({
  data,
  monthlyExpenses,
  onExportJSON,
  onImportJSON,
  onClearAllData,
  onResetSample,
  onOpenResetEmpty,
}: StatsTabProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const totalFuel = data.fuelLogs.reduce((s, l) => s + l.totalCost, 0);
  const totalService = data.serviceHistory.reduce((s, l) => s + l.totalCost, 0);
  const totalTire = data.tireLogs.reduce((s, l) => s + l.cost, 0);
  const totalTax = data.taxLogs.reduce((s, l) => s + l.cost, 0);
  const totalTaxAndTire = totalTire + totalTax;
  const grandTotal = totalFuel + totalService + totalTaxAndTire;

  // Estimate total operational cost per km across observed odometer span
  const allOdos: number[] = [
    ...data.fuelLogs.map((l) => l.odoKm),
    ...data.serviceHistory.map((l) => l.odoKm),
    ...data.tireLogs.map((l) => l.odoKm),
  ].filter((v) => v > 0);

  const minOdo = allOdos.length > 0 ? Math.min(...allOdos) : 0;
  const maxOdo = Math.max(data.profile.currentOdo, ...(allOdos.length ? allOdos : [0]));
  const trackedSpanKm = maxOdo > minOdo ? maxOdo - minOdo : 0;
  const totalOperationalPerKm =
    trackedSpanKm > 0 && grandTotal > 0 ? grandTotal / trackedSpanKm : null;

  const maxMonthTotal = Math.max(
    1,
    ...monthlyExpenses.map((m) => m.total)
  );

  const categories = [
    {
      label: 'Bensin / BBM',
      amount: totalFuel,
      color: 'var(--accent-blue)',
      fillCls: 'blue',
    },
    {
      label: 'Servis & Suku Cadang',
      amount: totalService,
      color: 'var(--accent-orange)',
      fillCls: 'orange',
    },
    {
      label: 'Pajak, STNK & Ban',
      amount: totalTaxAndTire,
      color: 'var(--success)',
      fillCls: 'ok',
    },
  ];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      onImportJSON(text);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Gagal membaca file JSON.'
      );
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <BarChart3 size={20} style={{ color: 'var(--accent-orange)' }} />
            Statistik Pengeluaran &amp; Manajemen Data
          </h1>
          <p className="section-subtitle">
            Ringkasan biaya operasional motor dan backup data offline
          </p>
        </div>
      </div>

      {/* Top Operational Summary */}
      <div className="grid-3">
        <div className="card metric-card">
          <div className="metric-top">
            <span>Total Pengeluaran Tercatat</span>
          </div>
          <div className="metric-value tabular">{formatIDR(grandTotal)}</div>
          <div className="metric-note">
            Gabungan seluruh catatan BBM, servis, ban &amp; pajak
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span>Biaya Operasional / km</span>
          </div>
          <div className="metric-value tabular">
            {totalOperationalPerKm !== null
              ? `${formatIDR(totalOperationalPerKm)} / km`
              : '-'}
          </div>
          <div className="metric-note tabular">
            Rentang odo tercatat: {formatNumber(trackedSpanKm)} km
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span>Rata-Rata Bulanan ({monthlyExpenses.length} Bln)</span>
          </div>
          <div className="metric-value tabular">
            {formatIDR(
              monthlyExpenses.reduce((s, m) => s + m.total, 0) /
                Math.max(1, monthlyExpenses.length)
            )}
          </div>
          <div className="metric-note">
            Rata-rata per bulan dari {monthlyExpenses.length} bulan terpantau
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart & Category Distribution */}
      <div className="grid-2">
        <div className="card">
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              Pengeluaran Bulanan ({monthlyExpenses.length} Bulan)
            </h3>
          </div>

          <div className="bar-chart">
            {monthlyExpenses.map((m) => {
              const fuelPct = (m.fuel / maxMonthTotal) * 100;
              const svcPct = (m.service / maxMonthTotal) * 100;
              const otherPct = (m.taxAndTire / maxMonthTotal) * 100;
              return (
                <div key={m.monthKey} className="bar-col">
                  <div className="bar-amount tabular">
                    {m.total > 0 ? `${Math.round(m.total / 1000)}rb` : '0'}
                  </div>
                  <div
                    className="bar-stack-track"
                    title={`${m.label}: Total ${formatIDR(m.total)} (BBM ${formatIDR(
                      m.fuel
                    )}, Servis ${formatIDR(m.service)}, Pajak & Ban ${formatIDR(
                      m.taxAndTire
                    )})`}
                  >
                    <div
                      className="bar-seg-fuel"
                      style={{ height: `${fuelPct}%` }}
                    />
                    <div
                      className="bar-seg-service"
                      style={{ height: `${svcPct}%` }}
                    />
                    <div
                      className="bar-seg-other"
                      style={{ height: `${otherPct}%` }}
                    />
                  </div>
                  <div className="bar-label">{m.label}</div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              marginTop: '14px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: 'var(--accent-blue)',
                }}
              />
              Bensin
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: 'var(--accent-orange)',
                }}
              />
              Servis
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: 'var(--success)',
                }}
              />
              Pajak &amp; Ban
            </span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>
            Distribusi Pengeluaran per Kategori
          </h3>

          {categories.map((cat) => {
            const pct =
              grandTotal > 0 ? Math.round((cat.amount / grandTotal) * 100) : 0;
            return (
              <div
                key={cat.label}
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <div
                  className="tabular"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{cat.label}</span>
                  <span>
                    <strong>{formatIDR(cat.amount)}</strong> ({pct}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${cat.fillCls}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: 'auto',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--bg-card-elevated)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            Semua perhitungan disimpan 100% secara lokal di perangkat Anda (offline-first).
          </div>
        </div>
      </div>

      {/* Data Management / Backup & Reset */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <div>
            <h2 className="section-title">Manajemen Data &amp; Backup Offline</h2>
            <p className="section-subtitle">
              Ekspor cadangan JSON sebelum mengganti HP/browser, atau mulai dari motor kosong
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onExportJSON}>
            <Download size={16} />
            Export Backup JSON
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Import Backup JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <button className="btn btn-secondary" onClick={onOpenResetEmpty}>
            <RotateCcw size={16} />
            Buat Profil Motor Baru
          </button>

          <button className="btn btn-danger-soft" onClick={onClearAllData}>
            <Trash2 size={16} />
            Hapus Semua Data
          </button>

          <button className="btn btn-ghost" onClick={onResetSample}>
            <RefreshCw size={16} />
            Muat Data Contoh
          </button>
        </div>

        {importError && (
          <div
            className="alert-item danger"
            style={{ marginTop: '12px', fontSize: '0.86rem' }}
          >
            {importError}
          </div>
        )}
      </div>
    </div>
  );
}
