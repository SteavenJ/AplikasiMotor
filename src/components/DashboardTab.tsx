import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Fuel,
  Gauge,
  Receipt,
  Wrench,
} from 'lucide-react';
import {
  FuelSummaryStats,
  MotoCareData,
  ServiceStatusInfo,
  TabId,
} from '../types';
import { formatDateID, formatIDR, formatNumber } from '../utils';

interface DashboardTabProps {
  data: MotoCareData;
  serviceStatuses: ServiceStatusInfo[];
  fuelStats: FuelSummaryStats;
  daysSinceTireCheck: number | null;
  tireDueDaysLeft: number | null;
  annualTaxDaysLeft: number | null;
  stnkDaysLeft: number | null;
  thisMonthExpense: number;
  onOpenQuickOdo: () => void;
  onOpenEditProfile: () => void;
  onNavigateTab: (tab: TabId) => void;
  onQuickRecordService: (scheduleId: string) => void;
}

const MOTOR_TYPE_LABEL: Record<string, string> = {
  matic: 'Skutik / Matic',
  bebek: 'Cub / Bebek',
  sport: 'Sport / Kopling',
};

export function DashboardTab({
  data,
  serviceStatuses,
  fuelStats,
  daysSinceTireCheck,
  tireDueDaysLeft,
  annualTaxDaysLeft,
  stnkDaysLeft,
  thisMonthExpense,
  onOpenQuickOdo,
  onOpenEditProfile,
  onNavigateTab,
  onQuickRecordService,
}: DashboardTabProps) {
  const { profile, tireLogs } = data;
  const latestTire = tireLogs[0] ?? null;
  const hasMotor = Boolean(profile.name.trim());

  const urgentServices = serviceStatuses.filter(
    (s) => s.status === 'danger' || s.status === 'warning'
  );
  const tireNeedsAlert =
    tireDueDaysLeft !== null && tireDueDaysLeft <= 0;
  const annualTaxAlert =
    annualTaxDaysLeft !== null && annualTaxDaysLeft <= 30;
  const stnkAlert = stnkDaysLeft !== null && stnkDaysLeft <= 30;

  const hasAnyAlert =
    urgentServices.length > 0 || tireNeedsAlert || annualTaxAlert || stnkAlert;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Hero Motor Card */}
      <div className="card card-hero">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hasMotor ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge info">
                    {MOTOR_TYPE_LABEL[profile.type] ?? profile.type}
                  </span>
                  {profile.year > 0 && (
                    <span className="badge neutral">{profile.year}</span>
                  )}
                  <span className="badge neutral" style={{ fontFamily: 'monospace' }}>
                    {profile.plateNumber || 'Belum ada plat'}
                  </span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {profile.name}
                </h1>
                {profile.specs && (
                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Wrench size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                    <span>{profile.specs}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginTop: '2px',
                  }}
                >
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Odometer Saat Ini:
                  </span>
                  <span
                    className="tabular"
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: 'var(--accent-orange)',
                    }}
                  >
                    {formatNumber(profile.currentOdo)} km
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="badge neutral">Kosong / Belum Diisi</span>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Belum Ada Data Motor
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '520px',
                  }}
                >
                  Aplikasi saat ini kosong dan tidak menyimpan data apa pun. Klik{' '}
                  <strong>Edit Profil Motor</strong> untuk mulai mengisi data motor
                  Anda, atau catat langsung di tab Servis, Bensin, Ban, dan Pajak.
                </p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onOpenQuickOdo}>
              <Gauge size={16} />
              Update Odo Cepat
            </button>
            <button className="btn btn-secondary" onClick={onOpenEditProfile}>
              <Edit3 size={16} />
              Edit Profil Motor
            </button>
          </div>
        </div>
      </div>

      {/* 4 Main Metric Cards */}
      <div className="grid-4">
        <div
          className="card metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('bensin')}
        >
          <div className="metric-top">
            <span>Konsumsi BBM</span>
            <span className="metric-icon blue">
              <Fuel size={17} />
            </span>
          </div>
          <div className="metric-value tabular">
            {fuelStats.avgKmPerLiter !== null
              ? `${formatNumber(fuelStats.avgKmPerLiter, 1)} km/L`
              : 'Belum ada data'}
          </div>
          <div className="metric-note tabular">
            {fuelStats.avgCostPerKm !== null
              ? `Biaya ${formatIDR(fuelStats.avgCostPerKm)} / km${
                  fuelStats.isEstimated ? ' (Est.)' : ''
                }`
              : 'Catat min. 2x pengisian penuh'}
          </div>
        </div>

        <div
          className="card metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('ban')}
        >
          <div className="metric-top">
            <span>Tekanan Ban Terakhir</span>
            <span className="metric-icon orange">
              <Gauge size={17} />
            </span>
          </div>
          <div className="metric-value tabular">
            {latestTire
              ? `${latestTire.frontPsi} / ${latestTire.rearPsi} PSI`
              : 'Belum dicek'}
          </div>
          <div className="metric-note">
            {daysSinceTireCheck !== null
              ? daysSinceTireCheck === 0
                ? 'Dicek hari ini'
                : `Dicek ${daysSinceTireCheck} hari lalu`
              : profile.recommendedPsiFrontSolo > 0
              ? `Ideal solo: ${profile.recommendedPsiFrontSolo}/${profile.recommendedPsiRearSolo} PSI`
              : 'Belum ada data tekanan ban'}
          </div>
        </div>

        <div
          className="card metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('pajak')}
        >
          <div className="metric-top">
            <span>Pajak &amp; STNK</span>
            <span className="metric-icon amber">
              <CalendarClock size={17} />
            </span>
          </div>
          <div className="metric-value tabular">
            {annualTaxDaysLeft === null
              ? 'Belum diatur'
              : annualTaxDaysLeft < 0
              ? `Lewat ${Math.abs(annualTaxDaysLeft)} hr`
              : `${annualTaxDaysLeft} hari lagi`}
          </div>
          <div className="metric-note tabular">
            STNK 5 thn:{' '}
            {stnkDaysLeft === null
              ? 'Belum diatur'
              : stnkDaysLeft < 0
              ? `Lewat ${Math.abs(stnkDaysLeft)} hr`
              : `${stnkDaysLeft} hr lagi`}
          </div>
        </div>

        <div
          className="card metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('statistik')}
        >
          <div className="metric-top">
            <span>Pengeluaran Bulan Ini</span>
            <span className="metric-icon green">
              <Receipt size={17} />
            </span>
          </div>
          <div className="metric-value tabular">{formatIDR(thisMonthExpense)}</div>
          <div className="metric-note">BBM, servis, ban &amp; pajak</div>
        </div>
      </div>

      {/* Smart Alerts Center */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '14px' }}>
          <div>
            <h2 className="section-title">
              <BellRing size={19} style={{ color: 'var(--accent-orange)' }} />
              Pusat Pengingat Aktif
            </h2>
            <p className="section-subtitle">
              Prioritas perawatan, ban, dan pajak berdasarkan odometer serta tanggal hari ini
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('servis')}
          >
            Semua Jadwal ({serviceStatuses.length})
          </button>
        </div>

        {!hasAnyAlert ? (
          <div
            className="alert-item"
            style={{
              background: 'var(--success-soft)',
              borderColor: 'rgba(34, 197, 94, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
              <div>
                <div style={{ fontWeight: 700 }}>
                  {!hasMotor && serviceStatuses.length === 0
                    ? 'Belum Ada Pengingat (Data Kosong)'
                    : 'Semua Kondisi Terpantau Aman'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {!hasMotor && serviceStatuses.length === 0
                    ? 'Isi profil motor, jadwal servis, atau tanggal pajak untuk mengaktifkan pengingat otomatis.'
                    : 'Belum ada jadwal servis, cek ban, atau pajak yang mendekati jatuh tempo.'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {urgentServices.map((svc) => (
              <div key={svc.item.id} className={`alert-item ${svc.status}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle
                    size={19}
                    style={{
                      color:
                        svc.status === 'danger'
                          ? 'var(--danger)'
                          : 'var(--warning)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {svc.item.name}{' '}
                      <span
                        className={`badge ${svc.status}`}
                        style={{ marginLeft: '6px' }}
                      >
                        {svc.status === 'danger' ? 'Jatuh Tempo!' : 'Segera Servis'}
                      </span>
                    </div>
                    <div
                      className="tabular"
                      style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
                    >
                      {svc.reason} (Target: {formatNumber(svc.nextServiceOdo)} km /{' '}
                      {formatDateID(svc.nextServiceDate)})
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onQuickRecordService(svc.item.id)}
                >
                  <Wrench size={14} />
                  Catat Servis
                </button>
              </div>
            ))}

            {tireNeedsAlert && (
              <div
                className={`alert-item ${
                  daysSinceTireCheck === null ||
                  daysSinceTireCheck >= profile.tireCheckIntervalDays + 7
                    ? 'danger'
                    : 'warning'
                }`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Gauge size={19} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Waktunya Cek Tekanan Ban{' '}
                      <span className="badge warning" style={{ marginLeft: '6px' }}>
                        {daysSinceTireCheck === null
                          ? 'Belum Pernah Dicek'
                          : `${daysSinceTireCheck} hari lalu`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Disarankan cek setiap {profile.tireCheckIntervalDays} hari. Ideal
                      solo: {profile.recommendedPsiFrontSolo}/
                      {profile.recommendedPsiRearSolo} PSI.
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigateTab('ban')}
                >
                  Cek Ban Sekarang
                </button>
              </div>
            )}

            {annualTaxAlert && annualTaxDaysLeft !== null && (
              <div
                className={`alert-item ${
                  annualTaxDaysLeft <= 7 ? 'danger' : 'warning'
                }`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarClock
                    size={19}
                    style={{
                      color:
                        annualTaxDaysLeft <= 7 ? 'var(--danger)' : 'var(--warning)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Pajak Tahunan (PKB) Mendekati Jatuh Tempo
                    </div>
                    <div
                      className="tabular"
                      style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
                    >
                      Jatuh tempo {formatDateID(profile.annualTaxDate)} (
                      {annualTaxDaysLeft < 0
                        ? `Terlambat ${Math.abs(annualTaxDaysLeft)} hari`
                        : `${annualTaxDaysLeft} hari lagi`}
                      ) • Estimasi {formatIDR(profile.annualTaxCost)}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigateTab('pajak')}
                >
                  Buka Pajak &amp; STNK
                </button>
              </div>
            )}

            {stnkAlert && stnkDaysLeft !== null && (
              <div
                className={`alert-item ${stnkDaysLeft <= 7 ? 'danger' : 'warning'}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarClock
                    size={19}
                    style={{
                      color: stnkDaysLeft <= 7 ? 'var(--danger)' : 'var(--warning)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      STNK 5 Tahunan (Ganti Plat) Segera Jatuh Tempo
                    </div>
                    <div
                      className="tabular"
                      style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
                    >
                      Jatuh tempo {formatDateID(profile.stnkFiveYearDate)} (
                      {stnkDaysLeft < 0
                        ? `Terlambat ${Math.abs(stnkDaysLeft)} hari`
                        : `${stnkDaysLeft} hari lagi`}
                      )
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigateTab('pajak')}
                >
                  Buka Pajak &amp; STNK
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
