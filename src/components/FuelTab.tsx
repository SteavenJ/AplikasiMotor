import { useState } from 'react';
import { Calculator, Droplets, Fuel, Plus, Trash2 } from 'lucide-react';
import { FUEL_PRESETS, formatISODateLocal } from '../defaultData';
import { FuelLog, FuelSummaryStats } from '../types';
import { formatDateID, formatIDR, formatNumber } from '../utils';

interface FuelTabProps {
  currentOdo: number;
  tankCapacityLiters: number;
  fuelLogs: FuelLog[];
  fuelStats: FuelSummaryStats;
  onAddFuelLog: (log: Omit<FuelLog, 'id'>) => void;
  onDeleteFuelLog: (id: string) => void;
}

export function FuelTab({
  currentOdo,
  tankCapacityLiters,
  fuelLogs,
  fuelStats,
  onAddFuelLog,
  onDeleteFuelLog,
}: FuelTabProps) {
  const [date, setDate] = useState(formatISODateLocal(new Date()));
  const [tripKm, setTripKm] = useState('');
  const [odoKm, setOdoKm] = useState('');
  const [fuelType, setFuelType] = useState('Pertalite');
  const [pricePerLiter, setPricePerLiter] = useState('10000');
  const [totalCost, setTotalCost] = useState('35000');
  const [liters, setLiters] = useState(() => (35000 / 10000).toFixed(2));
  const [isFullTank, setIsFullTank] = useState(true);

  function handleSelectPreset(name: string, defaultPrice: number) {
    setFuelType(name);
    setPricePerLiter(String(defaultPrice));
    const costNum = Number(totalCost) || 0;
    if (costNum > 0 && defaultPrice > 0) {
      setLiters((costNum / defaultPrice).toFixed(2));
    }
  }

  function handlePriceChange(val: string) {
    setPricePerLiter(val);
    const p = Number(val) || 0;
    const c = Number(totalCost) || 0;
    if (p > 0 && c > 0) {
      setLiters((c / p).toFixed(2));
    }
  }

  function handleCostChange(val: string) {
    setTotalCost(val);
    const c = Number(val) || 0;
    const p = Number(pricePerLiter) || 0;
    if (p > 0 && c >= 0) {
      setLiters((c / p).toFixed(2));
    }
  }

  function handleLitersChange(val: string) {
    setLiters(val);
    const l = Number(val) || 0;
    const p = Number(pricePerLiter) || 0;
    if (p > 0 && l >= 0) {
      setTotalCost(String(Math.round(l * p)));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const odoVal = odoKm.trim() !== '' ? Math.max(0, Number(odoKm) || 0) : 0;
    const tripVal = tripKm.trim() !== '' ? Number(tripKm) : NaN;
    const priceVal = Math.max(1, Number(pricePerLiter) || 10000);
    const litersVal = Math.max(0.1, Number(liters) || 0);
    const costVal = Math.max(0, Number(totalCost) || Math.round(litersVal * priceVal));

    onAddFuelLog({
      date,
      odoKm: Number(odoVal.toFixed(1)),
      tripKm: !Number.isNaN(tripVal) && tripVal > 0 ? Number(tripVal.toFixed(1)) : undefined,
      fuelType,
      pricePerLiter: priceVal,
      liters: Number(litersVal.toFixed(2)),
      totalCost: costVal,
      isFullTank,
    });
    setTripKm('');
    setOdoKm('');
  }

  const sortedDesc = [...fuelLogs].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return b.odoKm - a.odoKm;
  });

  const estimatedFullRangeKm =
    fuelStats.avgKmPerLiter !== null && tankCapacityLiters > 0
      ? Math.round(fuelStats.avgKmPerLiter * tankCapacityLiters)
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Fuel size={20} style={{ color: 'var(--accent-blue)' }} />
            Bensin &amp; Kalkulator Konsumsi BBM
          </h1>
          <p className="section-subtitle">
            Catat pengisian BBM untuk menghitung keiritan (km/L) &amp; biaya per km otomatis
          </p>
        </div>
      </div>

      {/* Fuel Summary Stats */}
      <div className="grid-4">
        <div className="card metric-card">
          <div className="metric-top">
            <span>Rata-Rata Konsumsi</span>
            <span className="metric-icon blue">
              <Calculator size={16} />
            </span>
          </div>
          <div className="metric-value tabular">
            {fuelStats.avgKmPerLiter !== null
              ? `${formatNumber(fuelStats.avgKmPerLiter, 1)} km/L`
              : '-'}
          </div>
          <div className="metric-note">
            {fuelStats.isEstimated
              ? 'Estimasi sementara (tandai Full Tank untuk akurasi 100%)'
              : 'Dihitung akurat antar Full Tank'}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span>Biaya BBM / km</span>
            <span className="metric-icon orange">
              <Fuel size={16} />
            </span>
          </div>
          <div className="metric-value tabular">
            {fuelStats.avgCostPerKm !== null
              ? `${formatIDR(fuelStats.avgCostPerKm)} / km`
              : '-'}
          </div>
          <div className="metric-note tabular">
            Jarak terpantau: {formatNumber(fuelStats.trackedDistanceKm, 1)} km
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span>Estimasi Jarak 1 Tangki</span>
            <span className="metric-icon green">
              <Droplets size={16} />
            </span>
          </div>
          <div className="metric-value tabular">
            {estimatedFullRangeKm !== null
              ? `~${formatNumber(estimatedFullRangeKm)} km`
              : '-'}
          </div>
          <div className="metric-note tabular">
            {tankCapacityLiters > 0
              ? `Kapasitas tangki: ${formatNumber(tankCapacityLiters, 1)} L`
              : 'Kapasitas tangki: Belum diatur'}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <span>Total Pengisian BBM</span>
            <span className="metric-icon amber">
              <Fuel size={16} />
            </span>
          </div>
          <div className="metric-value tabular">
            {formatIDR(fuelStats.totalFuelCost)}
          </div>
          <div className="metric-note tabular">
            Total {formatNumber(fuelStats.totalLiters, 1)} liter ({fuelLogs.length}x isi)
          </div>
        </div>
      </div>

      {/* Add Fuel Log Form */}
      <form className="card" onSubmit={handleSubmit}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>
          Catat Pengisian BBM Baru
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Pilihan Cepat Jenis BBM
          </div>
          <div className="chip-row">
            {FUEL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className={`chip ${fuelType === preset.name ? 'active' : ''}`}
                onClick={() => handleSelectPreset(preset.name, preset.defaultPrice)}
              >
                {preset.name} ({formatIDR(preset.defaultPrice)})
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Tanggal</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Jarak Tempuh / Trip (km) — opsional</label>
            <input
              className="input"
              type="number"
              min={0}
              step={0.1}
              placeholder="Contoh: 186.8"
              value={tripKm}
              onChange={(e) => setTripKm(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Odometer Saat Isi (km) — opsional</label>
            <input
              className="input"
              type="number"
              min={0}
              step={0.1}
              placeholder={
                currentOdo > 0 ? `Contoh: ${currentOdo}` : 'Contoh: 45992'
              }
              value={odoKm}
              onChange={(e) => setOdoKm(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Jenis BBM</label>
            <input
              className="input"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Harga / Liter (Rp)</label>
            <input
              className="input"
              type="number"
              min={1000}
              step={50}
              value={pricePerLiter}
              onChange={(e) => handlePriceChange(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Total Bayar (Rp) — otomatis hitung liter</label>
            <input
              className="input"
              type="number"
              min={0}
              step={500}
              value={totalCost}
              onChange={(e) => handleCostChange(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Jumlah Liter — otomatis hitung rupiah</label>
            <input
              className="input"
              type="number"
              min={0.1}
              step={0.01}
              value={liters}
              onChange={(e) => handleLitersChange(e.target.value)}
              required
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '14px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isFullTank}
              onChange={(e) => setIsFullTank(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-orange)' }}
            />
            <span>
              <strong>Isi Penuh (Full Tank)</strong> — direkomendasikan agar hitung km/L akurat
            </span>
          </label>

          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            Simpan Catatan BBM
          </button>
        </div>
      </form>

      {/* Fuel History Table */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <h2 className="section-title">Riwayat Pengisian BBM</h2>
          <span className="badge neutral">{fuelLogs.length} catatan</span>
        </div>

        {sortedDesc.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Belum ada catatan pengisian bensin. Isi form di atas untuk mulai melacak konsumsi BBM.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Odometer</th>
                  <th>BBM</th>
                  <th>Liter</th>
                  <th>Total</th>
                  <th>Jarak &amp; Efisiensi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedDesc.map((log) => {
                  const seg = fuelStats.segmentsByLogId[log.id];
                  return (
                    <tr key={log.id}>
                      <td className="tabular" style={{ whiteSpace: 'nowrap' }}>
                        {formatDateID(log.date)}
                      </td>
                      <td className="tabular" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {log.odoKm > 0 ? `${formatNumber(log.odoKm, 1)} km` : '-'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.fuelType}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {log.isFullTank ? 'Full Tank' : 'Isi Sebagian'} •{' '}
                          {formatIDR(log.pricePerLiter)}/L
                        </div>
                      </td>
                      <td className="tabular" style={{ whiteSpace: 'nowrap' }}>
                        {formatNumber(log.liters, 2)} L
                      </td>
                      <td className="tabular" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatIDR(log.totalCost)}
                      </td>
                      <td className="tabular">
                        {seg && seg.kmPerLiter !== null ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span
                              className={`badge ${
                                seg.isExactSegment ? 'ok' : 'info'
                              }`}
                            >
                              {formatNumber(seg.kmPerLiter, 1)} km/L
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              +{formatNumber(seg.deltaKm ?? 0, 1)} km •{' '}
                              {seg.costPerKm !== null ? formatIDR(seg.costPerKm) : '-'}/km
                            </span>
                          </div>
                        ) : seg && seg.deltaKm !== null ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            +{formatNumber(seg.deltaKm, 1)} km (menunggu full tank)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Titik awal ukur
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onDeleteFuelLog(log.id)}
                          title="Hapus catatan BBM"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
