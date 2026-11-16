import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bike,
  CalendarClock,
  Fuel,
  Gauge,
  LayoutDashboard,
  Moon,
  Sun,
  Wrench,
} from 'lucide-react';
import { DashboardTab } from './components/DashboardTab';
import { FuelTab } from './components/FuelTab';
import {
  EditProfileModal,
  QuickOdoModal,
  RecordServiceModal,
  ResetEmptyModal,
} from './components/Modals';
import { ServiceTab } from './components/ServiceTab';
import { StatsTab } from './components/StatsTab';
import { TaxTab } from './components/TaxTab';
import { TireTab } from './components/TireTab';
import { formatISODateLocal, getServicePresetsByType } from './defaultData';
import {
  clearAllStorageData,
  exportMotoCareJSON,
  loadMotoCareData,
  parseImportedMotoCareJSON,
  resetToEmptyMotor,
  resetToSampleData,
  saveMotoCareData,
} from './storage';
import {
  FuelLog,
  MotoCareData,
  MotorProfile,
  MotorType,
  ServiceScheduleItem,
  TabId,
  TaxType,
  TireLog,
} from './types';
import {
  addYearsISO,
  computeFuelStats,
  computeMonthlyExpenses,
  computeServiceStatus,
  diffDaysBetween,
  generateId,
  getMonthKey,
} from './utils';

const THEME_STORAGE_KEY = 'motocare_theme_v1';

interface NavItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', shortLabel: 'Beranda', icon: LayoutDashboard },
  { id: 'servis', label: 'Servis & Perawatan', shortLabel: 'Servis', icon: Wrench },
  { id: 'bensin', label: 'Bensin & BBM', shortLabel: 'Bensin', icon: Fuel },
  { id: 'ban', label: 'Tekanan Ban', shortLabel: 'Ban', icon: Gauge },
  { id: 'pajak', label: 'Pajak & STNK', shortLabel: 'Pajak', icon: CalendarClock },
  { id: 'statistik', label: 'Statistik & Data', shortLabel: 'Statistik', icon: BarChart3 },
];

export default function App() {
  const [data, setData] = useState<MotoCareData>(() => loadMotoCareData());
  const [activeTab, setActiveTab] = useState<TabId>('beranda');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const [showQuickOdo, setShowQuickOdo] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [recordServiceIds, setRecordServiceIds] = useState<string[] | null>(null);
  const [showResetEmpty, setShowResetEmpty] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    saveMotoCareData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = window.setTimeout(() => setToastMsg(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMsg]);

  const todayISO = formatISODateLocal(new Date());

  const serviceStatuses = useMemo(() => {
    const list = data.serviceSchedules.map((item) =>
      computeServiceStatus(item, data.profile.currentOdo, todayISO)
    );
    const rank = { danger: 0, warning: 1, ok: 2 };
    return list.sort((a, b) => rank[a.status] - rank[b.status]);
  }, [data.serviceSchedules, data.profile.currentOdo, todayISO]);

  const fuelStats = useMemo(() => computeFuelStats(data.fuelLogs), [data.fuelLogs]);

  const sortedTireLogs = useMemo(
    () =>
      [...data.tireLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [data.tireLogs]
  );

  const daysSinceTireCheck = useMemo(() => {
    if (!sortedTireLogs[0]) return null;
    return Math.max(0, diffDaysBetween(sortedTireLogs[0].date, todayISO));
  }, [sortedTireLogs, todayISO]);

  const tireDueDaysLeft = useMemo(() => {
    if (daysSinceTireCheck === null) return null;
    return data.profile.tireCheckIntervalDays - daysSinceTireCheck;
  }, [daysSinceTireCheck, data.profile.tireCheckIntervalDays]);

  const annualTaxDaysLeft = useMemo(
    () =>
      data.profile.annualTaxDate
        ? diffDaysBetween(todayISO, data.profile.annualTaxDate)
        : null,
    [todayISO, data.profile.annualTaxDate]
  );

  const stnkDaysLeft = useMemo(
    () =>
      data.profile.stnkFiveYearDate
        ? diffDaysBetween(todayISO, data.profile.stnkFiveYearDate)
        : null,
    [todayISO, data.profile.stnkFiveYearDate]
  );

  const monthlyExpenses = useMemo(
    () => computeMonthlyExpenses(data, 6),
    [data]
  );

  const thisMonthExpense = useMemo(() => {
    const thisMonthKey = getMonthKey(todayISO);
    const found = monthlyExpenses.find((m) => m.monthKey === thisMonthKey);
    return found ? found.total : 0;
  }, [monthlyExpenses, todayISO]);

  const serviceAlertCount = serviceStatuses.filter(
    (s) => s.status === 'danger' || s.status === 'warning'
  ).length;
  const tireAlertCount =
    tireDueDaysLeft !== null && tireDueDaysLeft <= 0 ? 1 : 0;
  const taxAlertCount =
    (annualTaxDaysLeft !== null && annualTaxDaysLeft <= 30 ? 1 : 0) +
    (stnkDaysLeft !== null && stnkDaysLeft <= 30 ? 1 : 0);

  function notify(msg: string) {
    setToastMsg(msg);
  }

  function handleSaveQuickOdo(newOdo: number) {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, currentOdo: newOdo },
    }));
    notify(`Odometer diperbarui ke ${newOdo.toLocaleString('id-ID')} km`);
  }

  function handleSaveProfile(updated: MotorProfile) {
    setData((prev) => ({ ...prev, profile: updated }));
    notify('Profil motor berhasil diperbarui');
  }

  function handleRecordService(payload: {
    date: string;
    odoKm: number;
    scheduleIds: string[];
    totalCost: number;
    workshopName: string;
    notes: string;
  }) {
    setData((prev) => {
      const selectedItems = prev.serviceSchedules.filter((s) =>
        payload.scheduleIds.includes(s.id)
      );
      const updatedSchedules = prev.serviceSchedules.map((s) => {
        if (!payload.scheduleIds.includes(s.id)) return s;
        if (payload.odoKm >= s.lastServiceOdo || payload.date >= s.lastServiceDate) {
          return {
            ...s,
            lastServiceOdo: payload.odoKm,
            lastServiceDate: payload.date,
          };
        }
        return s;
      });
      const newLog = {
        id: generateId('sh'),
        date: payload.date,
        odoKm: payload.odoKm,
        items: selectedItems.map((i) => i.name),
        totalCost: payload.totalCost,
        workshopName: payload.workshopName,
        notes: payload.notes,
      };
      return {
        ...prev,
        profile: {
          ...prev.profile,
          currentOdo: Math.max(prev.profile.currentOdo, payload.odoKm),
        },
        serviceSchedules: updatedSchedules,
        serviceHistory: [newLog, ...prev.serviceHistory].sort((a, b) =>
          b.date.localeCompare(a.date)
        ),
      };
    });
    notify('Catatan servis tersimpan & jadwal diperbarui');
  }

  function handleAddSchedule(item: Omit<ServiceScheduleItem, 'id'>) {
    setData((prev) => ({
      ...prev,
      serviceSchedules: [
        ...prev.serviceSchedules,
        { ...item, id: generateId('svc') },
      ],
    }));
    notify(`Jadwal "${item.name}" ditambahkan`);
  }

  function handleDeleteSchedule(id: string) {
    setData((prev) => ({
      ...prev,
      serviceSchedules: prev.serviceSchedules.filter((s) => s.id !== id),
    }));
    notify('Jadwal servis dihapus');
  }

  function handleDeleteServiceHistory(id: string) {
    setData((prev) => ({
      ...prev,
      serviceHistory: prev.serviceHistory.filter((h) => h.id !== id),
    }));
    notify('Riwayat servis dihapus');
  }

  function handleAddFuelLog(log: Omit<FuelLog, 'id'>) {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        currentOdo: Math.max(prev.profile.currentOdo, log.odoKm),
      },
      fuelLogs: [{ ...log, id: generateId('fuel') }, ...prev.fuelLogs],
    }));
    notify('Catatan pengisian BBM disimpan');
  }

  function handleDeleteFuelLog(id: string) {
    setData((prev) => ({
      ...prev,
      fuelLogs: prev.fuelLogs.filter((l) => l.id !== id),
    }));
    notify('Catatan BBM dihapus');
  }

  function handleAddTireLog(log: Omit<TireLog, 'id'>) {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        currentOdo: Math.max(prev.profile.currentOdo, log.odoKm),
      },
      tireLogs: [{ ...log, id: generateId('tire') }, ...prev.tireLogs],
    }));
    notify('Pengecekan tekanan ban tersimpan');
  }

  function handleDeleteTireLog(id: string) {
    setData((prev) => ({
      ...prev,
      tireLogs: prev.tireLogs.filter((t) => t.id !== id),
    }));
    notify('Catatan cek ban dihapus');
  }

  function handleMarkTaxPaid(type: TaxType, cost: number, notes: string) {
    setData((prev) => {
      const nextAnnual =
        type === 'Pajak Tahunan'
          ? addYearsISO(prev.profile.annualTaxDate || todayISO, 1)
          : prev.profile.annualTaxDate;
      const nextStnk =
        type === 'STNK 5 Tahunan'
          ? addYearsISO(prev.profile.stnkFiveYearDate || todayISO, 5)
          : prev.profile.stnkFiveYearDate;

      return {
        ...prev,
        profile: {
          ...prev.profile,
          annualTaxDate: nextAnnual,
          stnkFiveYearDate: nextStnk,
        },
        taxLogs: [
          {
            id: generateId('tax'),
            date: todayISO,
            type,
            cost,
            notes,
          },
          ...prev.taxLogs,
        ],
      };
    });
    notify(`${type} dicatat lunas & jatuh tempo dimajukan`);
  }

  function handleUpdateTaxDates(updates: {
    annualTaxDate: string;
    annualTaxCost: number;
    stnkFiveYearDate: string;
    stnkFiveYearCost: number;
  }) {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
      },
    }));
    notify('Tanggal & estimasi pajak diperbarui');
  }

  function handleDeleteTaxLog(id: string) {
    setData((prev) => ({
      ...prev,
      taxLogs: prev.taxLogs.filter((t) => t.id !== id),
    }));
    notify('Riwayat pembayaran pajak dihapus');
  }

  function handleExportJSON() {
    const json = exportMotoCareJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motocare-backup-${todayISO}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Backup JSON berhasil diunduh');
  }

  function handleImportJSON(text: string) {
    const imported = parseImportedMotoCareJSON(text);
    setData(imported);
    notify('Data backup JSON berhasil dipulihkan');
  }

  function handleLoadPresetSchedules() {
    setData((prev) => ({
      ...prev,
      serviceSchedules: getServicePresetsByType(
        prev.profile.type,
        prev.profile.currentOdo,
        todayISO
      ),
    }));
    notify('Jadwal servis standar dimuat');
  }

  function handleClearAllData() {
    const blank = clearAllStorageData();
    setData(blank);
    setActiveTab('beranda');
    notify('Semua data & storage aplikasi telah dihapus');
  }

  function handleResetSample() {
    setData(resetToSampleData());
    notify('Data contoh berhasil dimuat ulang');
  }

  function handleResetEmpty(overrides: {
    name: string;
    plateNumber: string;
    type: MotorType;
    currentOdo: number;
  }) {
    setData(resetToEmptyMotor(overrides));
    setActiveTab('beranda');
    notify(`Profil baru "${overrides.name}" siap digunakan`);
  }

  function getBadgeForTab(tabId: TabId): { count: number; isDanger?: boolean } {
    if (tabId === 'servis') {
      const hasDanger = serviceStatuses.some((s) => s.status === 'danger');
      return { count: serviceAlertCount, isDanger: hasDanger };
    }
    if (tabId === 'ban') {
      return { count: tireAlertCount, isDanger: false };
    }
    if (tabId === 'pajak') {
      const hasDanger =
        (annualTaxDaysLeft !== null && annualTaxDaysLeft <= 7) ||
        (stnkDaysLeft !== null && stnkDaysLeft <= 7);
      return { count: taxAlertCount, isDanger: hasDanger };
    }
    return { count: 0 };
  }

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">
            <Bike size={22} />
          </div>
          <div>
            <div className="brand-title">MotoCare ID</div>
            <div className="brand-sub">Asisten Rawat Motor</div>
          </div>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = getBadgeForTab(item.id);
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-item-left">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </span>
                {badge.count > 0 && (
                  <span
                    className={`nav-badge ${badge.isDanger ? '' : 'warning'}`}
                  >
                    {badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', padding: '0 4px' }}>
            Offline-First • Tersimpan lokal di perangkat
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo" style={{ width: 34, height: 34, borderRadius: 10 }}>
              <Bike size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', lineHeight: 1.15 }}>
                MotoCare ID
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {data.profile.name || 'Belum ada data motor'}
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label="Ubah tema"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </header>

        <main className="content-container">
          {activeTab === 'beranda' && (
            <DashboardTab
              data={data}
              serviceStatuses={serviceStatuses}
              fuelStats={fuelStats}
              daysSinceTireCheck={daysSinceTireCheck}
              tireDueDaysLeft={tireDueDaysLeft}
              annualTaxDaysLeft={annualTaxDaysLeft}
              stnkDaysLeft={stnkDaysLeft}
              thisMonthExpense={thisMonthExpense}
              onOpenQuickOdo={() => setShowQuickOdo(true)}
              onOpenEditProfile={() => setShowEditProfile(true)}
              onNavigateTab={setActiveTab}
              onQuickRecordService={(id) => setRecordServiceIds([id])}
            />
          )}

          {activeTab === 'servis' && (
            <ServiceTab
              currentOdo={data.profile.currentOdo}
              serviceStatuses={serviceStatuses}
              serviceHistory={data.serviceHistory}
              onOpenRecordService={(ids) => setRecordServiceIds(ids ?? [])}
              onAddSchedule={handleAddSchedule}
              onLoadPresetSchedules={handleLoadPresetSchedules}
              onDeleteSchedule={handleDeleteSchedule}
              onDeleteHistory={handleDeleteServiceHistory}
            />
          )}

          {activeTab === 'bensin' && (
            <FuelTab
              currentOdo={data.profile.currentOdo}
              tankCapacityLiters={data.profile.tankCapacityLiters}
              fuelLogs={data.fuelLogs}
              fuelStats={fuelStats}
              onAddFuelLog={handleAddFuelLog}
              onDeleteFuelLog={handleDeleteFuelLog}
            />
          )}

          {activeTab === 'ban' && (
            <TireTab
              profile={data.profile}
              tireLogs={sortedTireLogs}
              daysSinceLastCheck={daysSinceTireCheck}
              dueDaysLeft={tireDueDaysLeft}
              onAddTireLog={handleAddTireLog}
              onDeleteTireLog={handleDeleteTireLog}
            />
          )}

          {activeTab === 'pajak' && (
            <TaxTab
              profile={data.profile}
              taxLogs={data.taxLogs}
              annualTaxDaysLeft={annualTaxDaysLeft}
              stnkDaysLeft={stnkDaysLeft}
              onMarkTaxPaid={handleMarkTaxPaid}
              onUpdateTaxDates={handleUpdateTaxDates}
              onDeleteTaxLog={handleDeleteTaxLog}
            />
          )}

          {activeTab === 'statistik' && (
            <StatsTab
              data={data}
              monthlyExpenses={monthlyExpenses}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              onClearAllData={handleClearAllData}
              onResetSample={handleResetSample}
              onOpenResetEmpty={() => setShowResetEmpty(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const badge = getBadgeForTab(item.id);
          return (
            <button
              key={item.id}
              className={`bottom-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.shortLabel}</span>
              {badge.count > 0 && <span className="bottom-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      {showQuickOdo && (
        <QuickOdoModal
          currentOdo={data.profile.currentOdo}
          onClose={() => setShowQuickOdo(false)}
          onSave={handleSaveQuickOdo}
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          profile={data.profile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {recordServiceIds !== null && (
        <RecordServiceModal
          currentOdo={data.profile.currentOdo}
          schedules={data.serviceSchedules}
          initialSelectedIds={recordServiceIds}
          onClose={() => setRecordServiceIds(null)}
          onSubmit={handleRecordService}
        />
      )}

      {showResetEmpty && (
        <ResetEmptyModal
          onClose={() => setShowResetEmpty(false)}
          onConfirm={handleResetEmpty}
        />
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
