import { useState } from 'react';
import { History, Plus, Trash2, Wrench } from 'lucide-react';
import {
  ServiceHistoryLog,
  ServiceScheduleItem,
  ServiceStatusInfo,
} from '../types';
import { formatDateID, formatIDR, formatNumber } from '../utils';

interface ServiceTabProps {
  currentOdo: number;
  serviceStatuses: ServiceStatusInfo[];
  serviceHistory: ServiceHistoryLog[];
  onOpenRecordService: (preselectedIds?: string[]) => void;
  onAddSchedule: (item: Omit<ServiceScheduleItem, 'id'>) => void;
  onLoadPresetSchedules: () => void;
  onDeleteSchedule: (id: string) => void;
  onDeleteHistory: (id: string) => void;
}

export function ServiceTab({
  currentOdo,
  serviceStatuses,
  serviceHistory,
  onOpenRecordService,
  onAddSchedule,
  onLoadPresetSchedules,
  onDeleteSchedule,
  onDeleteHistory,
}: ServiceTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [intervalKm, setIntervalKm] = useState('4000');
  const [intervalMonths, setIntervalMonths] = useState('4');
  const [lastServiceOdo, setLastServiceOdo] = useState(String(currentOdo));
  const [lastServiceDate, setLastServiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [estimatedCost, setEstimatedCost] = useState('50000');

  function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSchedule({
      name: name.trim(),
      intervalKm: Math.max(200, Number(intervalKm) || 2000),
      intervalMonths: Math.max(1, Number(intervalMonths) || 2),
      lastServiceOdo: Math.max(0, Number(lastServiceOdo) || 0),
      lastServiceDate,
      estimatedCost: Math.max(0, Number(estimatedCost) || 0),
    });
    setName('');
    setShowAddForm(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Wrench size={20} style={{ color: 'var(--accent-orange)' }} />
            Jadwal Servis &amp; Perawatan
          </h1>
          <p className="section-subtitle">
            Odometer aktif: <strong className="tabular">{formatNumber(currentOdo)} km</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAddForm((v) => !v)}
          >
            <Plus size={16} />
            {showAddForm ? 'Tutup Form' : 'Tambah Komponen'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onOpenRecordService()}
            disabled={serviceStatuses.length === 0}
          >
            <Wrench size={16} />
            Catat Servis Multi-Item
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="card" onSubmit={handleCreateSchedule}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>
            Tambah Jadwal Perawatan Baru
          </h3>
          <div className="form-grid">
            <div className="field">
              <label>Nama Komponen / Servis</label>
              <input
                className="input"
                placeholder="Contoh: Minyak Rem / Laher Roda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Interval Jarak (km)</label>
              <input
                className="input"
                type="number"
                min={200}
                step={100}
                value={intervalKm}
                onChange={(e) => setIntervalKm(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Interval Waktu (bulan)</label>
              <input
                className="input"
                type="number"
                min={1}
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Odo Servis Terakhir (km)</label>
              <input
                className="input"
                type="number"
                min={0}
                value={lastServiceOdo}
                onChange={(e) => setLastServiceOdo(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Tanggal Servis Terakhir</label>
              <input
                className="input"
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Estimasi Biaya (Rp)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={5000}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowAddForm(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Jadwal
            </button>
          </div>
        </form>
      )}

      {/* Service Component Cards */}
      {serviceStatuses.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              Belum Ada Jadwal Komponen Servis
            </h3>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
              }}
            >
              Tambahkan komponen servis satu per satu atau muat daftar jadwal standar
              (Oli Mesin, Oli Gardan, CVT, Kampas Rem, dll.).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={15} />
              Tambah Komponen Sendiri
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onLoadPresetSchedules}
            >
              <Wrench size={15} />
              Muat Preset Jadwal Standar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-2">
        {serviceStatuses.map((s) => {
          const badgeText =
            s.status === 'danger'
              ? 'Waktunya Servis!'
              : s.status === 'warning'
              ? 'Segera'
              : 'Aman';
          return (
            <div
              key={s.item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor:
                  s.status === 'danger'
                    ? 'rgba(239, 68, 68, 0.45)'
                    : s.status === 'warning'
                    ? 'rgba(245, 158, 11, 0.45)'
                    : undefined,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem' }}>
                    {s.item.name}
                  </div>
                  <div
                    className="tabular"
                    style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                  >
                    Setiap {formatNumber(s.item.intervalKm)} km /{' '}
                    {s.item.intervalMonths} bln • Est. {formatIDR(s.item.estimatedCost)}
                  </div>
                </div>
                <span className={`badge ${s.status}`}>{badgeText}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  className="tabular"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>
                    Terakhir: {formatNumber(s.item.lastServiceOdo)} km (
                    {formatDateID(s.item.lastServiceDate)})
                  </span>
                  <span>Target: {formatNumber(s.nextServiceOdo)} km</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${s.status}`}
                    style={{ width: `${Math.max(4, s.overallProgressPct)}%` }}
                  />
                </div>
                <div
                  className="tabular"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        s.status === 'danger'
                          ? 'var(--danger)'
                          : s.status === 'warning'
                          ? 'var(--warning)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {s.reason}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {s.overallProgressPct}%
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '4px',
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onDeleteSchedule(s.item.id)}
                  title="Hapus jadwal komponen"
                >
                  <Trash2 size={14} />
                  Hapus
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenRecordService([s.item.id])}
                >
                  <Wrench size={14} />
                  Catat Servis
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Service History */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <h2 className="section-title">
            <History size={18} style={{ color: 'var(--accent-blue)' }} />
            Riwayat Servis Bengkel
          </h2>
          <span className="badge neutral">{serviceHistory.length} catatan</span>
        </div>

        {serviceHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Belum ada riwayat servis tercatat. Klik &quot;Catat Servis&quot; saat motor selesai diservis.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Odometer</th>
                  <th>Item Servis</th>
                  <th>Bengkel &amp; Catatan</th>
                  <th>Biaya</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {serviceHistory.map((log) => (
                  <tr key={log.id}>
                    <td className="tabular" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateID(log.date)}
                    </td>
                    <td className="tabular" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {formatNumber(log.odoKm)} km
                    </td>
                    <td>
                      <div className="chip-row">
                        {log.items.map((it, idx) => (
                          <span key={idx} className="badge neutral">
                            {it}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {log.workshopName || '-'}
                      </div>
                      {log.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {log.notes}
                        </div>
                      )}
                    </td>
                    <td className="tabular" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {formatIDR(log.totalCost)}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onDeleteHistory(log.id)}
                        title="Hapus riwayat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
