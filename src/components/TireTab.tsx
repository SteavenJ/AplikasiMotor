import { useState } from 'react';
import { CheckCircle2, Gauge, Plus, Trash2, Users, User } from 'lucide-react';
import { formatISODateLocal } from '../defaultData';
import { GasType, MotorProfile, TireCondition, TireLog } from '../types';
import { formatDateID, formatIDR, formatNumber } from '../utils';

interface TireTabProps {
  profile: MotorProfile;
  tireLogs: TireLog[];
  daysSinceLastCheck: number | null;
  dueDaysLeft: number | null;
  onAddTireLog: (log: Omit<TireLog, 'id'>) => void;
  onDeleteTireLog: (id: string) => void;
}

export function TireTab({
  profile,
  tireLogs,
  daysSinceLastCheck,
  dueDaysLeft,
  onAddTireLog,
  onDeleteTireLog,
}: TireTabProps) {
  const [rideMode, setRideMode] = useState<'solo' | 'tandem'>('solo');
  const [date, setDate] = useState(formatISODateLocal(new Date()));
  const [odoKm, setOdoKm] = useState(String(profile.currentOdo));
  const [frontPsi, setFrontPsi] = useState(
    profile.recommendedPsiFrontSolo > 0
      ? String(profile.recommendedPsiFrontSolo)
      : ''
  );
  const [rearPsi, setRearPsi] = useState(
    profile.recommendedPsiRearSolo > 0
      ? String(profile.recommendedPsiRearSolo)
      : ''
  );
  const [gasType, setGasType] = useState<GasType>('Nitrogen');
  const [tireCondition, setTireCondition] = useState<TireCondition>('Baik');
  const [filledToStandard, setFilledToStandard] = useState(true);
  const [cost, setCost] = useState('10000');
  const [notes, setNotes] = useState('');

  const idealFront =
    rideMode === 'solo'
      ? profile.recommendedPsiFrontSolo
      : profile.recommendedPsiFrontTandem;
  const idealRear =
    rideMode === 'solo'
      ? profile.recommendedPsiRearSolo
      : profile.recommendedPsiRearTandem;

  function applyIdealToForm(mode: 'solo' | 'tandem') {
    setRideMode(mode);
    setFrontPsi(
      String(
        mode === 'solo'
          ? profile.recommendedPsiFrontSolo
          : profile.recommendedPsiFrontTandem
      )
    );
    setRearPsi(
      String(
        mode === 'solo'
          ? profile.recommendedPsiRearSolo
          : profile.recommendedPsiRearTandem
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAddTireLog({
      date,
      odoKm: Math.max(0, Number(odoKm) || 0),
      frontPsi: Math.max(10, Number(frontPsi) || idealFront),
      rearPsi: Math.max(10, Number(rearPsi) || idealRear),
      filledToStandard,
      gasType,
      tireCondition,
      cost: Math.max(0, Number(cost) || 0),
      notes: notes.trim(),
    });
    setNotes('');
  }

  const latest = tireLogs[0] ?? null;
  const hasTireHistory = tireLogs.length > 0;
  const isDue = hasTireHistory && (dueDaysLeft === null || dueDaysLeft <= 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Gauge size={20} style={{ color: 'var(--accent-orange)' }} />
            Tekanan Ban &amp; Kondisi Roda
          </h1>
          <p className="section-subtitle">
            {profile.name
              ? `Panduan tekanan angin ideal untuk ${profile.name} & pencatatan cek ban rutin`
              : 'Panduan tekanan angin & pencatatan cek ban rutin (isi profil motor untuk setel PSI ideal)'}
          </p>
        </div>
      </div>

      {/* Visual Guide + Next Check Status */}
      <div className="grid-2">
        <div className="card">
          <div className="section-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Panduan Tekanan Ban Ideal</h3>
            <div className="chip-row">
              <button
                type="button"
                className={`chip ${rideMode === 'solo' ? 'active' : ''}`}
                onClick={() => applyIdealToForm('solo')}
              >
                <User size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                Sendiri (Solo)
              </button>
              <button
                type="button"
                className={`chip ${rideMode === 'tandem' ? 'active' : ''}`}
                onClick={() => applyIdealToForm('tandem')}
              >
                <Users size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                Boncengan
              </button>
            </div>
          </div>

          <div className="tire-visual-grid">
            <div className="tire-box">
              <span className="badge info">Ban Depan</span>
              <div className="tire-psi-big tabular">
                {idealFront > 0 ? `${idealFront} PSI` : '- PSI'}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {idealFront > 0
                  ? `${(idealFront * 0.0689476).toFixed(2)} bar • `
                  : 'Belum diatur • '}
                {rideMode === 'solo' ? 'Solo' : 'Beban Berat'}
              </span>
            </div>

            <div className="tire-box">
              <span className="badge info">Ban Belakang</span>
              <div className="tire-psi-big tabular">
                {idealRear > 0 ? `${idealRear} PSI` : '- PSI'}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {idealRear > 0
                  ? `${(idealRear * 0.0689476).toFixed(2)} bar • `
                  : 'Belum diatur • '}
                {rideMode === 'solo' ? 'Solo' : 'Beban Berat'}
              </span>
            </div>
          </div>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            Tips: Ukur tekanan ban saat ban masih dingin (sebelum dipakai jarak jauh) agar
            pembacaan PSI paling akurat.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="section-header">
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Status Pengecekan Rutin</h3>
            <span className={`badge ${!hasTireHistory ? 'neutral' : isDue ? 'warning' : 'ok'}`}>
              {!hasTireHistory
                ? 'Belum Ada Data'
                : isDue
                ? 'Perlu Cek Ban'
                : 'Terjadwal Aman'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card-elevated)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Pengecekan Terakhir
              </div>
              <div className="tabular" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>
                {latest ? formatDateID(latest.date) : 'Belum ada'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {daysSinceLastCheck !== null
                  ? daysSinceLastCheck === 0
                    ? 'Hari ini'
                    : `${daysSinceLastCheck} hari yang lalu`
                  : 'Segera lakukan cek awal'}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card-elevated)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Jadwal Cek Berikutnya
              </div>
              <div
                className="tabular"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginTop: '4px',
                  color: isDue ? 'var(--warning)' : 'var(--success)',
                }}
              >
                {dueDaysLeft === null
                  ? 'Sekarang'
                  : dueDaysLeft <= 0
                  ? `Lewat ${Math.abs(dueDaysLeft)} hari`
                  : `${dueDaysLeft} hari lagi`}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Interval tiap {profile.tireCheckIntervalDays} hari
              </div>
            </div>
          </div>

          {latest && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginTop: 'auto',
              }}
            >
              <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span>
                Terakhir diisi{' '}
                <strong>
                  {latest.frontPsi}/{latest.rearPsi} PSI
                </strong>{' '}
                ({latest.gasType}) • Kondisi alur ban:{' '}
                <strong>{latest.tireCondition}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Log Tire Check Form */}
      <form className="card" onSubmit={handleSubmit}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>
          Catat Cek / Isi Angin Ban
        </h3>
        <div className="form-grid">
          <div className="field">
            <label>Tanggal Cek</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input
              className="input"
              type="number"
              min={0}
              value={odoKm}
              onChange={(e) => setOdoKm(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Tekanan Depan (PSI)</label>
            <input
              className="input"
              type="number"
              min={10}
              max={60}
              value={frontPsi}
              onChange={(e) => setFrontPsi(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Tekanan Belakang (PSI)</label>
            <input
              className="input"
              type="number"
              min={10}
              max={65}
              value={rearPsi}
              onChange={(e) => setRearPsi(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Jenis Pengisian</label>
            <select
              className="select"
              value={gasType}
              onChange={(e) => setGasType(e.target.value as GasType)}
            >
              <option value="Nitrogen">Nitrogen</option>
              <option value="Angin Biasa">Angin Biasa</option>
            </select>
          </div>
          <div className="field">
            <label>Kondisi Alur Ban</label>
            <select
              className="select"
              value={tireCondition}
              onChange={(e) => setTireCondition(e.target.value as TireCondition)}
            >
              <option value="Baik">Baik (Tebal)</option>
              <option value="Mulai Aus">Mulai Aus</option>
              <option value="Perlu Ganti">Perlu Ganti</option>
            </select>
          </div>
          <div className="field">
            <label>Biaya Isi / Tambal (Rp)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={1000}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Catatan (Opsional)</label>
            <input
              className="input"
              placeholder="Contoh: Tambah angin SPBU"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              checked={filledToStandard}
              onChange={(e) => setFilledToStandard(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-orange)' }}
            />
            <span>Sudah disesuaikan ke tekanan standar pabrikan</span>
          </label>
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            Simpan Cek Ban
          </button>
        </div>
      </form>

      {/* Tire Check History */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <h2 className="section-title">Riwayat Pengecekan Ban</h2>
          <span className="badge neutral">{tireLogs.length} catatan</span>
        </div>

        {tireLogs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Belum ada catatan pengecekan tekanan ban.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Odometer</th>
                  <th>Depan / Belakang</th>
                  <th>Gas &amp; Kondisi</th>
                  <th>Biaya</th>
                  <th>Catatan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tireLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="tabular" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateID(log.date)}
                    </td>
                    <td className="tabular" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatNumber(log.odoKm)} km
                    </td>
                    <td className="tabular" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {log.frontPsi} / {log.rearPsi} PSI
                    </td>
                    <td>
                      <div className="chip-row">
                        <span className="badge info">{log.gasType}</span>
                        <span
                          className={`badge ${
                            log.tireCondition === 'Baik'
                              ? 'ok'
                              : log.tireCondition === 'Mulai Aus'
                              ? 'warning'
                              : 'danger'
                          }`}
                        >
                          {log.tireCondition}
                        </span>
                      </div>
                    </td>
                    <td className="tabular" style={{ whiteSpace: 'nowrap' }}>
                      {formatIDR(log.cost)}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {log.notes || '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onDeleteTireLog(log.id)}
                        title="Hapus catatan ban"
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
