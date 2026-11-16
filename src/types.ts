export type MotorType = 'matic' | 'bebek' | 'sport';

export type TabId =
  | 'beranda'
  | 'servis'
  | 'bensin'
  | 'ban'
  | 'pajak'
  | 'statistik';

export interface MotorProfile {
  name: string;
  plateNumber: string;
  type: MotorType;
  year: number;
  specs?: string;
  currentOdo: number;
  tankCapacityLiters: number;
  recommendedPsiFrontSolo: number;
  recommendedPsiRearSolo: number;
  recommendedPsiFrontTandem: number;
  recommendedPsiRearTandem: number;
  annualTaxDate: string; // YYYY-MM-DD
  annualTaxCost: number;
  stnkFiveYearDate: string; // YYYY-MM-DD
  stnkFiveYearCost: number;
  tireCheckIntervalDays: number;
}

export interface ServiceScheduleItem {
  id: string;
  name: string;
  intervalKm: number;
  intervalMonths: number;
  lastServiceOdo: number;
  lastServiceDate: string; // YYYY-MM-DD
  estimatedCost: number;
}

export interface ServiceHistoryLog {
  id: string;
  date: string; // YYYY-MM-DD
  odoKm: number;
  items: string[];
  totalCost: number;
  workshopName: string;
  notes: string;
}

export interface FuelLog {
  id: string;
  date: string; // YYYY-MM-DD
  odoKm: number;
  tripKm?: number;
  fuelType: string;
  pricePerLiter: number;
  liters: number;
  totalCost: number;
  isFullTank: boolean;
}

export type GasType = 'Angin Biasa' | 'Nitrogen';
export type TireCondition = 'Baik' | 'Mulai Aus' | 'Perlu Ganti';

export interface TireLog {
  id: string;
  date: string; // YYYY-MM-DD
  odoKm: number;
  frontPsi: number;
  rearPsi: number;
  filledToStandard: boolean;
  gasType: GasType;
  tireCondition: TireCondition;
  cost: number;
  notes: string;
}

export type TaxType = 'Pajak Tahunan' | 'STNK 5 Tahunan';

export interface TaxPaymentLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: TaxType;
  cost: number;
  notes: string;
}

export interface MotoCareData {
  version: number;
  profile: MotorProfile;
  serviceSchedules: ServiceScheduleItem[];
  serviceHistory: ServiceHistoryLog[];
  fuelLogs: FuelLog[];
  tireLogs: TireLog[];
  taxLogs: TaxPaymentLog[];
}

export type AlertSeverity = 'danger' | 'warning' | 'ok';

export interface ServiceStatusInfo {
  item: ServiceScheduleItem;
  nextServiceOdo: number;
  remainingKm: number;
  kmProgressPct: number;
  nextServiceDate: string;
  remainingDays: number;
  timeProgressPct: number;
  overallProgressPct: number;
  status: AlertSeverity;
  reason: string;
}

export interface FuelEfficiencySegment {
  logId: string;
  deltaKm: number | null;
  kmPerLiter: number | null;
  costPerKm: number | null;
  isExactSegment: boolean;
}

export interface FuelSummaryStats {
  avgKmPerLiter: number | null;
  avgCostPerKm: number | null;
  totalLiters: number;
  totalFuelCost: number;
  trackedDistanceKm: number;
  isEstimated: boolean;
  segmentsByLogId: Record<string, FuelEfficiencySegment>;
}

export interface MonthlyExpensePoint {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "Jun 26"
  fuel: number;
  service: number;
  taxAndTire: number;
  total: number;
}
