import {
  MotoCareData,
  MotorProfile,
  MotorType,
  ServiceScheduleItem,
} from './types';

export interface FuelPreset {
  name: string;
  defaultPrice: number;
  ron: string;
}

export const FUEL_PRESETS: FuelPreset[] = [
  { name: 'Pertalite', defaultPrice: 10000, ron: 'RON 90' },
  { name: 'Pertamax', defaultPrice: 12100, ron: 'RON 92' },
  { name: 'Pertamax Green 95', defaultPrice: 13150, ron: 'RON 95' },
  { name: 'Pertamax Turbo', defaultPrice: 13500, ron: 'RON 98' },
  { name: 'Shell Super', defaultPrice: 12290, ron: 'RON 92' },
  { name: 'Shell V-Power', defaultPrice: 13340, ron: 'RON 95' },
  { name: 'BP 92', defaultPrice: 12290, ron: 'RON 92' },
];

export function formatISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function offsetDateISO(daysOffset: number, base = new Date()): string {
  const copy = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  copy.setDate(copy.getDate() + daysOffset);
  return formatISODateLocal(copy);
}

export function getRecommendedPsiByType(type: MotorType): {
  frontSolo: number;
  rearSolo: number;
  frontTandem: number;
  rearTandem: number;
} {
  switch (type) {
    case 'matic':
      return {
        frontSolo: 29,
        rearSolo: 33,
        frontTandem: 29,
        rearTandem: 36,
      };
    case 'bebek':
      return {
        frontSolo: 29,
        rearSolo: 33,
        frontTandem: 29,
        rearTandem: 36,
      };
    case 'sport':
      return {
        frontSolo: 29,
        rearSolo: 33,
        frontTandem: 32,
        rearTandem: 36,
      };
  }
}

export function getServicePresetsByType(
  type: MotorType,
  currentOdo = 0,
  todayISO = formatISODateLocal(new Date())
): ServiceScheduleItem[] {
  const commonBase: Omit<ServiceScheduleItem, 'id'>[] = [
    {
      name: 'Oli Mesin',
      intervalKm: type === 'sport' ? 2500 : 2000,
      intervalMonths: 2,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: type === 'sport' ? 95000 : 65000,
    },
    {
      name: 'Filter Udara',
      intervalKm: 12000,
      intervalMonths: 12,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 55000,
    },
    {
      name: 'Busi',
      intervalKm: 8000,
      intervalMonths: 8,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 35000,
    },
    {
      name: 'Kampas Rem Depan & Belakang',
      intervalKm: 8000,
      intervalMonths: 8,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 110000,
    },
    {
      name: 'Air Radiator (Coolant)',
      intervalKm: 12000,
      intervalMonths: 12,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 45000,
    },
  ];

  const typeSpecific: Omit<ServiceScheduleItem, 'id'>[] =
    type === 'matic'
      ? [
          {
            name: 'Oli Gardan / Transmisi',
            intervalKm: 4000,
            intervalMonths: 4,
            lastServiceOdo: currentOdo,
            lastServiceDate: todayISO,
            estimatedCost: 25000,
          },
          {
            name: 'Servis CVT & Pembersihan Roller',
            intervalKm: 8000,
            intervalMonths: 8,
            lastServiceOdo: currentOdo,
            lastServiceDate: todayISO,
            estimatedCost: 85000,
          },
          {
            name: 'V-Belt CVT',
            intervalKm: 24000,
            intervalMonths: 24,
            lastServiceOdo: currentOdo,
            lastServiceDate: todayISO,
            estimatedCost: 175000,
          },
        ]
      : [
          {
            name: 'Pelumasan & Setel Rantai',
            intervalKm: 1000,
            intervalMonths: 1,
            lastServiceOdo: currentOdo,
            lastServiceDate: todayISO,
            estimatedCost: 20000,
          },
          {
            name: 'Gir Set & Rantai',
            intervalKm: 16000,
            intervalMonths: 16,
            lastServiceOdo: currentOdo,
            lastServiceDate: todayISO,
            estimatedCost: 240000,
          },
        ];

  return [...commonBase, ...typeSpecific].map((item, idx) => ({
    ...item,
    id: `svc-${type}-${idx + 1}`,
  }));
}

export function createInitialMotorData(): MotoCareData {
  return {
    version: 1,
    profile: {
      name: 'Honda Scoopy 2023',
      plateNumber: 'DD3777XAB',
      type: 'matic',
      year: 2023,
      specs: 'CVT fullset Modif [Roller 11Gr], Koil KTC, Busing 300Gr, Busi Iridium',
      currentOdo: 45992,
      tankCapacityLiters: 4.2,
      recommendedPsiFrontSolo: 29,
      recommendedPsiRearSolo: 33,
      recommendedPsiFrontTandem: 29,
      recommendedPsiRearTandem: 33,
      annualTaxDate: '',
      annualTaxCost: 0,
      stnkFiveYearDate: '',
      stnkFiveYearCost: 0,
      tireCheckIntervalDays: 14,
    },
    serviceSchedules: [],
    serviceHistory: [],
    fuelLogs: [
      {
        id: 'fuel-1',
        date: '2026-10-17',
        odoKm: 44480,
        tripKm: 191,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.61,
        totalCost: Math.round(3.61 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-2',
        date: '2026-10-19',
        odoKm: 44656.2,
        tripKm: 176.2,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.43,
        totalCost: Math.round(3.43 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-3',
        date: '2026-10-23',
        odoKm: 44836.8,
        tripKm: 180.6,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.35,
        totalCost: Math.round(3.35 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-4',
        date: '2026-10-27',
        odoKm: 45030,
        tripKm: 193.2,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.56,
        totalCost: Math.round(3.56 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-5',
        date: '2026-10-31',
        odoKm: 45222.2,
        tripKm: 192.2,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.67,
        totalCost: Math.round(3.67 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-6',
        date: '2026-11-04',
        odoKm: 45403.7,
        tripKm: 181.5,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.43,
        totalCost: Math.round(3.43 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-7',
        date: '2026-11-08',
        odoKm: 45601.2,
        tripKm: 197.5,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.67,
        totalCost: Math.round(3.67 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-8',
        date: '2026-11-12',
        odoKm: 45805.2,
        tripKm: 204.0,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.88,
        totalCost: Math.round(3.88 * 10000),
        isFullTank: true,
      },
      {
        id: 'fuel-9',
        date: '2026-11-15',
        odoKm: 45992,
        tripKm: 186.8,
        fuelType: 'Pertalite',
        pricePerLiter: 10000,
        liters: 3.04,
        totalCost: Math.round(3.04 * 10000),
        isFullTank: true,
      },
    ],
    tireLogs: [],
    taxLogs: [],
  };
}

export function createBlankData(): MotoCareData {
  return {
    version: 1,
    profile: {
      name: '',
      plateNumber: '',
      type: 'matic',
      year: 0,
      specs: '',
      currentOdo: 0,
      tankCapacityLiters: 0,
      recommendedPsiFrontSolo: 0,
      recommendedPsiRearSolo: 0,
      recommendedPsiFrontTandem: 0,
      recommendedPsiRearTandem: 0,
      annualTaxDate: '',
      annualTaxCost: 0,
      stnkFiveYearDate: '',
      stnkFiveYearCost: 0,
      tireCheckIntervalDays: 14,
    },
    serviceSchedules: [],
    serviceHistory: [],
    fuelLogs: [],
    tireLogs: [],
    taxLogs: [],
  };
}

export function createSampleData(baseDate = new Date()): MotoCareData {
  const currentOdo = 45992;
  const todayISO = formatISODateLocal(baseDate);

  const profile: MotorProfile = {
    name: 'Honda Scoopy 2023',
    plateNumber: 'DD3777XAB',
    type: 'matic',
    year: 2023,
    specs: 'CVT Fullset Modif (Roller 11gr), Koil KTC, Bushing 300gr, Busi Iridium',
    currentOdo,
    tankCapacityLiters: 4.2,
    recommendedPsiFrontSolo: 29,
    recommendedPsiRearSolo: 33,
    recommendedPsiFrontTandem: 29,
    recommendedPsiRearTandem: 36,
    annualTaxDate: offsetDateISO(180, baseDate),
    annualTaxCost: 275000,
    stnkFiveYearDate: offsetDateISO(365 * 2, baseDate),
    stnkFiveYearCost: 450000,
    tireCheckIntervalDays: 14,
  };

  const serviceSchedules: ServiceScheduleItem[] = [
    {
      id: 'svc-1',
      name: 'Oli Mesin',
      intervalKm: 2000,
      intervalMonths: 2,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 65000,
    },
    {
      id: 'svc-2',
      name: 'Oli Gardan / Transmisi',
      intervalKm: 4000,
      intervalMonths: 4,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 25000,
    },
    {
      id: 'svc-3',
      name: 'Servis CVT & Pembersihan Roller',
      intervalKm: 8000,
      intervalMonths: 8,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 85000,
    },
    {
      id: 'svc-4',
      name: 'Kampas Rem Depan & Belakang',
      intervalKm: 8000,
      intervalMonths: 8,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 110000,
    },
    {
      id: 'svc-5',
      name: 'Busi',
      intervalKm: 8000,
      intervalMonths: 8,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 35000,
    },
    {
      id: 'svc-6',
      name: 'Filter Udara',
      intervalKm: 12000,
      intervalMonths: 12,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 55000,
    },
    {
      id: 'svc-7',
      name: 'Pengecekan Aki & Minyak Rem',
      intervalKm: 12000,
      intervalMonths: 12,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 45000,
    },
    {
      id: 'svc-8',
      name: 'V-Belt CVT',
      intervalKm: 24000,
      intervalMonths: 24,
      lastServiceOdo: currentOdo,
      lastServiceDate: todayISO,
      estimatedCost: 175000,
    },
  ];

  const serviceHistory: MotoCareData['serviceHistory'] = [];

  const fuelLogs: MotoCareData['fuelLogs'] = [];

  const tireLogs: MotoCareData['tireLogs'] = [];

  const taxLogs: MotoCareData['taxLogs'] = [];

  return {
    version: 1,
    profile,
    serviceSchedules,
    serviceHistory,
    fuelLogs,
    tireLogs,
    taxLogs,
  };
}

export function createEmptyMotorData(
  customProfile?: Partial<MotorProfile>
): MotoCareData {
  const todayISO = formatISODateLocal(new Date());
  const type: MotorType = customProfile?.type ?? 'matic';
  const psi = getRecommendedPsiByType(type);
  const currentOdo = customProfile?.currentOdo ?? 45992;

  const profile: MotorProfile = {
    name: customProfile?.name ?? 'Honda Scoopy 2023',
    plateNumber: customProfile?.plateNumber ?? 'DD3777XAB',
    type,
    year: customProfile?.year ?? 2023,
    currentOdo,
    tankCapacityLiters: customProfile?.tankCapacityLiters ?? 4.2,
    recommendedPsiFrontSolo: customProfile?.recommendedPsiFrontSolo ?? psi.frontSolo,
    recommendedPsiRearSolo: customProfile?.recommendedPsiRearSolo ?? psi.rearSolo,
    recommendedPsiFrontTandem:
      customProfile?.recommendedPsiFrontTandem ?? psi.frontTandem,
    recommendedPsiRearTandem:
      customProfile?.recommendedPsiRearTandem ?? psi.rearTandem,
    annualTaxDate: customProfile?.annualTaxDate ?? offsetDateISO(180),
    annualTaxCost: customProfile?.annualTaxCost ?? 275000,
    stnkFiveYearDate: customProfile?.stnkFiveYearDate ?? offsetDateISO(365 * 2),
    stnkFiveYearCost: customProfile?.stnkFiveYearCost ?? 450000,
    tireCheckIntervalDays: customProfile?.tireCheckIntervalDays ?? 14,
  };

  return {
    version: 1,
    profile,
    serviceSchedules: getServicePresetsByType(type, currentOdo, todayISO),
    serviceHistory: [],
    fuelLogs: [],
    tireLogs: [],
    taxLogs: [],
  };
}
