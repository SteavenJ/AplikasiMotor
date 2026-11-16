import { useState } from 'react';
import { CalendarClock, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { MotorProfile, TaxPaymentLog, TaxType } from '../types';
import { formatDateID, formatIDR } from '../utils';

interface TaxTabProps {
  profile: MotorProfile;
  taxLogs: TaxPaymentLog[];
  annualTaxDaysLeft: number | null;
  stnkDaysLeft: number | null;
  onMarkTaxPaid: (type: TaxType, cost: number, notes: string) => void;
  onUpdateTaxDates: (updates: {
    annualTaxDate: string;
    annualTaxCost: number;
    stnkFiveYearDate: string;
    stnkFiveYearCost: number;
  }) => void;
  onDeleteTaxLog: (id: string) => void;
}

export function TaxTab({
  profile,
  taxLogs,
  annualTaxDaysLeft,
  stnkDaysLeft,
  onMarkTaxPaid,
  onUpdateTaxDates,
  onDeleteTaxLog,
}: TaxTabProps) {
  const [editing, setEditing] = useState(false);
  const [annualTaxDate, setAnnualTaxDate] = useState(profile.annualTaxDate);
  const [annualTaxCost, setAnnualTaxCost] = useState(String(profile.annualTaxCost));
  const [stnkFiveYearDate, setStnkFiveYearDate] = useState(profile.stnkFiveYearDate);
  const [stnkFiveYearCost, setStnkFiveYearCost] = useState(
    String(profile.stnkFiveYearCost)
  );

  const [payingType, setPayingType] = useState<TaxType | null>(null);
  const [payCost, setPayCost] = useState('');
  const [payNotes, setPayNotes] = useState('');

  function openPayForm(type: TaxType) {
    setPayingType(type);
    setPayCost(
      String(
        type === 'Pajak Tahunan' ? profile.annualTaxCost : profile.stnkFiveYearCost
      )
    );
    setPayNotes(
      type === 'Pajak Tahunan'
        ? 'Perpanjangan PKB tahunan'
        : 'Perpanjangan STNK 5 tahunan & ganti plat nomor'
    );
  }

  function handleConfirmPay(e: React.FormEvent) {
    e.preventDefault();
    if (!payingType) return;
    onMarkTaxPaid(payingType, Math.max(0, Number(payCost) || 0), payNotes.trim());
    setPayingType(null);
  }

  function handleSaveTaxSettings(e: React.FormEvent) {
    e.preventDefault();
    onUpdateTaxDates({
      annualTaxDate,
      annualTaxCost: Math.max(0, Number(annualTaxCost) || 0),
      stnkFiveYearDate,
      stnkFiveYearCost: Math.max(0, Number(stnkFiveYearCost) || 0),
    });
    setEditing(false);
  }

  function getBadgeStatus(daysLeft: number | null): { cls: string; text: string } {
    if (daysLeft === null) {
      return { cls: 'neutral', text: 'Belum diatur' };
    }
    if (daysLeft < 0) {
      return { cls: 'danger', text: `Terlambat ${Math.abs(daysLeft)} hari!` };
    }
    if (daysLeft <= 30) {
      return { cls: 'warning', text: `${daysLeft} hari lagi` };
    }
    return { cls: 'ok', text: `${daysLeft} hari lagi` };
  }

  const annualBadge = getBadgeStatus(annualTaxDaysLeft);
  const stnkBadge = getBadgeStatus(stnkDaysLeft);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <CalendarClock size={20} style={{ color: 'var(--accent-amber)' }} />
            Pengingat Pajak &amp; STNK
          </h1>
          <p className="section-subtitle">
            Pantau jatuh tempo PKB tahunan dan penggantian plat nomor STNK 5 tahunan
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setAnnualTaxDate(profile.annualTaxDate);
            setAnnualTaxCost(String(profile.annualTaxCost));
            setStnkFiveYearDate(profile.stnkFiveYearDate);
            setStnkFiveYearCost(String(profile.stnkFiveYearCost));
            setEditing((v) => !v);
          }}
        >
          <Edit3 size={16} />
          {editing ? 'Tutup Pengaturan' : 'Ubah Tanggal & Estimasi'}
        </button>
      </div>

      {editing && (
        <form className="card" onSubmit={handleSaveTaxSettings}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>
            Atur Tanggal Jatuh Tempo &amp; Estimasi Biaya
          </h3>
          <div className="form-grid">
            <div className="field">
              <label>Jatuh Tempo Pajak Tahunan (PKB)</label>
              <input
                className="input"
                type="date"
                value={annualTaxDate}
                onChange={(e) => setAnnualTaxDate(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Estimasi Biaya Pajak Tahunan (Rp)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={5000}
                value={annualTaxCost}
                onChange={(e) => setAnnualTaxCost(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Jatuh Tempo STNK 5 Tahunan</label>
              <input
                className="input"
                type="date"
                value={stnkFiveYearDate}
                onChange={(e) => setStnkFiveYearDate(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Estimasi Biaya STNK 5 Tahunan (Rp)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={5000}
                value={stnkFiveYearCost}
                onChange={(e) => setStnkFiveYearCost(e.target.value)}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setEditing(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Pengaturan Pajak
            </button>
          </div>
        </form>
      )}

      {/* Two Tax Cards */}
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="section-header">
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Pajak Tahunan (PKB)</h3>
            <span className={`badge ${annualBadge.cls}`}>{annualBadge.text}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tanggal Jatuh Tempo
            </div>
            <div className="tabular" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {profile.annualTaxDate
                ? formatDateID(profile.annualTaxDate)
                : 'Belum diatur'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Estimasi Biaya
            </div>
            <div className="tabular" style={{ fontSize: '1.08rem', fontWeight: 700 }}>
              {profile.annualTaxCost > 0 ? formatIDR(profile.annualTaxCost) : '-'}
            </div>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => openPayForm('Pajak Tahunan')}
            >
              <CheckCircle2 size={16} />
              Tandai Sudah Dibayar (+1 Tahun)
            </button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="section-header">
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
              STNK 5 Tahunan (Ganti Plat)
            </h3>
            <span className={`badge ${stnkBadge.cls}`}>{stnkBadge.text}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tanggal Jatuh Tempo
            </div>
            <div className="tabular" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {profile.stnkFiveYearDate
                ? formatDateID(profile.stnkFiveYearDate)
                : 'Belum diatur'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Estimasi Biaya
            </div>
            <div className="tabular" style={{ fontSize: '1.08rem', fontWeight: 700 }}>
              {profile.stnkFiveYearCost > 0
                ? formatIDR(profile.stnkFiveYearCost)
                : '-'}
            </div>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => openPayForm('STNK 5 Tahunan')}
            >
              <CheckCircle2 size={16} />
              Tandai Sudah Dibayar (+5 Tahun)
            </button>
          </div>
        </div>
      </div>

      {/* Inline Pay Confirmation Box */}
      {payingType && (
        <form
          className="card"
          style={{ borderColor: 'var(--accent-orange)' }}
          onSubmit={handleConfirmPay}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>
            Konfirmasi Pembayaran {payingType}
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Tanggal jatuh tempo akan otomatis dimajukan{' '}
            {payingType === 'Pajak Tahunan' ? '1 tahun' : '5 tahun'} dan nominal dicatat
            ke riwayat pengeluaran.
          </p>
          <div className="form-grid">
            <div className="field">
              <label>Nominal Dibayar (Rp)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={1000}
                value={payCost}
                onChange={(e) => setPayCost(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Catatan</label>
              <input
                className="input"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Contoh: Samsat / Signal Digital"
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPayingType(null)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Konfirmasi &amp; Catat Pembayaran
            </button>
          </div>
        </form>
      )}

      {/* Tax Payment History */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <h2 className="section-title">Riwayat Pembayaran Pajak &amp; STNK</h2>
          <span className="badge neutral">{taxLogs.length} catatan</span>
        </div>

        {taxLogs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Belum ada riwayat pembayaran pajak tercatat.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal Bayar</th>
                  <th>Jenis</th>
                  <th>Biaya</th>
                  <th>Catatan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {taxLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="tabular" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateID(log.date)}
                    </td>
                    <td>
                      <span className="badge info">{log.type}</span>
                    </td>
                    <td className="tabular" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {formatIDR(log.cost)}
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      {log.notes || '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onDeleteTaxLog(log.id)}
                        title="Hapus riwayat pajak"
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
