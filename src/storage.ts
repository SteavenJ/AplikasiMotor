import {
  createBlankData,
  createEmptyMotorData,
  createInitialMotorData,
  createSampleData,
} from './defaultData';
import { MotoCareData, MotorProfile } from './types';

export const STORAGE_KEY = 'motocare_clean_v3';

const LEGACY_STORAGE_KEYS = [
  'motocare_data_v1',
  'motocare_data_v2',
  'motocare_data_v3',
  'motocare_data_v4',
  'motocare_data_v5',
  'motocare_clean_v1',
  'motocare_clean_v2',
];

function purgeLegacyStorageKeys(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }
}

export function isCompletelyBlankData(data: MotoCareData): boolean {
  const p = data.profile;
  return (
    !p.name.trim() &&
    !p.plateNumber.trim() &&
    !(p.specs ?? '').trim() &&
    p.year === 0 &&
    p.currentOdo === 0 &&
    p.tankCapacityLiters === 0 &&
    p.recommendedPsiFrontSolo === 0 &&
    p.recommendedPsiRearSolo === 0 &&
    p.recommendedPsiFrontTandem === 0 &&
    p.recommendedPsiRearTandem === 0 &&
    !p.annualTaxDate &&
    p.annualTaxCost === 0 &&
    !p.stnkFiveYearDate &&
    p.stnkFiveYearCost === 0 &&
    data.serviceSchedules.length === 0 &&
    data.serviceHistory.length === 0 &&
    data.fuelLogs.length === 0 &&
    data.tireLogs.length === 0 &&
    data.taxLogs.length === 0
  );
}

function isValidMotoCareData(raw: unknown): raw is MotoCareData {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<MotoCareData>;
  return (
    typeof candidate.profile === 'object' &&
    candidate.profile !== null &&
    typeof candidate.profile.name === 'string' &&
    typeof candidate.profile.currentOdo === 'number' &&
    Array.isArray(candidate.serviceSchedules) &&
    Array.isArray(candidate.serviceHistory) &&
    Array.isArray(candidate.fuelLogs) &&
    Array.isArray(candidate.tireLogs) &&
    Array.isArray(candidate.taxLogs)
  );
}

export function loadMotoCareData(): MotoCareData {
  purgeLegacyStorageKeys();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialMotorData();
      saveMotoCareData(initial);
      return initial;
    }
    const parsed: unknown = JSON.parse(raw);
    if (isValidMotoCareData(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback to initial data if localStorage is unavailable or corrupted
  }
  const fallback = createInitialMotorData();
  saveMotoCareData(fallback);
  return fallback;
}

export function saveMotoCareData(data: MotoCareData): void {
  try {
    purgeLegacyStorageKeys();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota/storage errors in restricted contexts
  }
}

export function clearAllStorageData(): MotoCareData {
  const blank = createBlankData();
  try {
    purgeLegacyStorageKeys();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blank));
  } catch {
    // Ignore storage errors
  }
  return blank;
}

export function exportMotoCareJSON(data: MotoCareData): string {
  return JSON.stringify(data, null, 2);
}

export function parseImportedMotoCareJSON(jsonText: string): MotoCareData {
  const parsed: unknown = JSON.parse(jsonText);
  if (!isValidMotoCareData(parsed)) {
    throw new Error(
      'Format file JSON tidak valid. Pastikan file berasal dari backup MotoCare ID.'
    );
  }
  return parsed;
}

export function resetToSampleData(): MotoCareData {
  const sample = createSampleData();
  saveMotoCareData(sample);
  return sample;
}

export function resetToEmptyMotor(
  profileOverrides?: Partial<MotorProfile>
): MotoCareData {
  const fresh = createEmptyMotorData(profileOverrides);
  saveMotoCareData(fresh);
  return fresh;
}
