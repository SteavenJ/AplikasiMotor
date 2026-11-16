import { useState } from 'react';
import { X } from 'lucide-react';
import { formatISODateLocal, getRecommendedPsiByType } from '../defaultData';
import { MotorProfile, MotorType, ServiceScheduleItem } from '../types';
import { formatIDR, formatNumber } from '../utils';

interface QuickOdoModalProps {
  currentOdo: number;
  onClose: () => void;
  onSave: (newOdo: number) => void;
}

export function QuickOdoModal({
  currentOdo,
  onClose,
  onSave,
}: QuickOdoModalProps) {
  const [odo, setOdo] = useState(String(currentOdo));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(Math.max(0, Number(odo) || 0));
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h2 className="modal-title">Update Odometer Cepat</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="field">
          <label>Odometer Saat Ini (km)</label>
          <input
            className="input tabular"
            type="number"
            min={0}
            value={odo}
            onChange={(e) => setOdo(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="chip-row">
          {[50, 100, 250, 500].map((inc) => (
            <button
              key={inc}
              type="button"
              className="chip"
              onClick={() => setOdo(String((Number(odo) || 0) + inc))}
            >
              +{inc} km
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Odometer
          </button>
        </div>
      </form>
    </div>
  );
}

interface EditProfileModalProps {
  profile: MotorProfile;
  onClose: () => void;
  onSave: (updated: MotorProfile) => void;
}

export function EditProfileModal({
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [form, setForm] = useState<MotorProfile>({ ...profile });

  function handleTypeChange(newType: MotorType) {
    const psi = getRecommendedPsiByType(newType);
    setForm((prev) => ({
      ...prev,
      type: newType,
      recommendedPsiFrontSolo: psi.frontSolo,
      recommendedPsiRearSolo: psi.rearSolo,
      recommendedPsiFrontTandem: psi.frontTandem,
      recommendedPsiRearTandem: psi.rearTandem,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h2 className="modal-title">Edit Profil Motor</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Nama / Tipe Motor</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Nomor Polisi (Plat)</label>
            <input
              className="input"
              value={form.plateNumber}
              onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Jenis Motor</label>
            <select
              className="select"
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value as MotorType)}
            >
              <option value="matic">Skutik / Matic</option>
              <option value="bebek">Cub / Bebek</option>
              <option value="sport">Sport / Kopling</option>
            </select>
          </div>
          <div className="field">
            <label>Tahun Pembuatan</label>
            <input
              className="input"
              type="number"
              min={1980}
              max={2035}
              placeholder="2023"
              value={form.year || ''}
              onChange={(e) =>
                setForm({ ...form, year: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Spesifikasi / Modifikasi (Opsional)</label>
            <input
              className="input"
              placeholder="Contoh: CVT Fullset Modif (Roller 11gr), Koil KTC, Busi Iridium"
              value={form.specs ?? ''}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={0.1}
              value={form.currentOdo}
              onChange={(e) =>
                setForm({ ...form, currentOdo: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
          <div className="field">
            <label>Kapasitas Tangki (Liter)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={0.1}
              placeholder="4.2"
              value={form.tankCapacityLiters || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  tankCapacityLiters: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="field">
            <label>PSI Solo (Depan)</label>
            <input
              className="input"
              type="number"
              placeholder="29"
              value={form.recommendedPsiFrontSolo || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  recommendedPsiFrontSolo: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="field">
            <label>PSI Solo (Belakang)</label>
            <input
              className="input"
              type="number"
              placeholder="33"
              value={form.recommendedPsiRearSolo || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  recommendedPsiRearSolo: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="field">
            <label>PSI Boncengan (Depan)</label>
            <input
              className="input"
              type="number"
              placeholder="29"
              value={form.recommendedPsiFrontTandem || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  recommendedPsiFrontTandem: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="field">
            <label>PSI Boncengan (Belakang)</label>
            <input
              className="input"
              type="number"
              placeholder="36"
              value={form.recommendedPsiRearTandem || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  recommendedPsiRearTandem: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="field">
            <label>Interval Pengingat Cek Ban (Hari)</label>
            <input
              className="input"
              type="number"
              min={3}
              max={60}
              value={form.tireCheckIntervalDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  tireCheckIntervalDays: Math.max(3, Number(e.target.value) || 14),
                })
              }
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Profil
          </button>
        </div>
      </form>
    </div>
  );
}

interface RecordServiceModalProps {
  currentOdo: number;
  schedules: ServiceScheduleItem[];
  initialSelectedIds: string[];
  onClose: () => void;
  onSubmit: (payload: {
    date: string;
    odoKm: number;
    scheduleIds: string[];
    totalCost: number;
    workshopName: string;
    notes: string;
  }) => void;
}

export function RecordServiceModal({
  currentOdo,
  schedules,
  initialSelectedIds,
  onClose,
  onSubmit,
}: RecordServiceModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds.length > 0
      ? initialSelectedIds
      : schedules[0]
      ? [schedules[0].id]
      : []
  );
  const [date, setDate] = useState(formatISODateLocal(new Date()));
  const [odoKm, setOdoKm] = useState(String(currentOdo));
  const [totalCost, setTotalCost] = useState(() => {
    const sum = schedules
      .filter((s) =>
        (initialSelectedIds.length > 0
          ? initialSelectedIds
          : schedules[0]
          ? [schedules[0].id]
          : []
        ).includes(s.id)
      )
      .reduce((acc, s) => acc + s.estimatedCost, 0);
    return String(sum);
  });
  const [workshopName, setWorkshopName] = useState('');
  const [notes, setNotes] = useState('');

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      const estimatedSum = schedules
        .filter((s) => next.includes(s.id))
        .reduce((acc, s) => acc + s.estimatedCost, 0);
      setTotalCost(String(estimatedSum));
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    onSubmit({
      date,
      odoKm: Math.max(0, Number(odoKm) || 0),
      scheduleIds: selectedIds,
      totalCost: Math.max(0, Number(totalCost) || 0),
      workshopName: workshopName.trim(),
      notes: notes.trim(),
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h2 className="modal-title">Catat Servis Motor</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            Pilih Komponen yang Diservis ({selectedIds.length} dipilih)
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '190px',
              overflowY: 'auto',
            }}
          >
            {schedules.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `1px solid ${
                      checked ? 'var(--accent-orange)' : 'var(--border)'
                    }`,
                    background: checked
                      ? 'var(--accent-orange-soft)'
                      : 'var(--bg-card-elevated)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(item.id)}
                      style={{ accentColor: 'var(--accent-orange)' }}
                    />
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </span>
                  <span className="tabular" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Est. {formatIDR(item.estimatedCost)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Tanggal Servis</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Odometer Saat Servis (km)</label>
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
            <label>Total Biaya Servis (Rp)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={1000}
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Nama Bengkel (Opsional)</label>
            <input
              className="input"
              placeholder="Contoh: AHASS / Bengkel Resmi"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Catatan (Opsional)</label>
          <input
            className="input"
            placeholder="Contoh: Ganti oli SPX2, kampas rem masih 60%"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={selectedIds.length === 0}
          >
            Simpan Servis ({formatNumber(Number(odoKm) || 0)} km)
          </button>
        </div>
      </form>
    </div>
  );
}

interface ResetEmptyModalProps {
  onClose: () => void;
  onConfirm: (overrides: {
    name: string;
    plateNumber: string;
    type: MotorType;
    currentOdo: number;
  }) => void;
}

export function ResetEmptyModal({ onClose, onConfirm }: ResetEmptyModalProps) {
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState<MotorType>('matic');
  const [currentOdo, setCurrentOdo] = useState('0');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm({
      name: name.trim() || 'Motor Saya',
      plateNumber: plateNumber.trim() || '-',
      type,
      currentOdo: Math.max(0, Number(currentOdo) || 0),
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h2 className="modal-title">Mulai dari Motor Baru (Kosong)</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Data catatan sebelumnya akan dihapus dan diganti dengan jadwal perawatan
          bawaan sesuai jenis motor Anda.
        </p>

        <div className="form-grid">
          <div className="field">
            <label>Nama Motor</label>
            <input
              className="input"
              placeholder="Contoh: Yamaha NMAX / Honda Beat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Plat Nomor</label>
            <input
              className="input"
              placeholder="Contoh: D 1234 ABC"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Jenis Motor</label>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value as MotorType)}
            >
              <option value="matic">Skutik / Matic</option>
              <option value="bebek">Cub / Bebek</option>
              <option value="sport">Sport / Kopling</option>
            </select>
          </div>
          <div className="field">
            <label>Odometer Sekarang (km)</label>
            <input
              className="input"
              type="number"
              min={0}
              value={currentOdo}
              onChange={(e) => setCurrentOdo(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Mulai Baru
          </button>
        </div>
      </form>
    </div>
  );
}
