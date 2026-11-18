import { formatISODateLocal } from './defaultData';
import {
  AlertSeverity,
  FuelEfficiencySegment,
  FuelLog,
  FuelSummaryStats,
  MonthlyExpensePoint,
  MotoCareData,
  ServiceScheduleItem,
  ServiceStatusInfo,
} from './types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatNumber(num: number, maxFractionDigits = 0): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxFractionDigits,
  }).format(num);
}

export function parseLocalISODate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function formatDateID(isoDate: string): string {
  if (!isoDate) return '-';
  const date = parseLocalISODate(isoDate);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function diffDaysBetween(fromISO: string, toISO: string): number {
  const from = parseLocalISODate(fromISO);
  const to = parseLocalISODate(toISO);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function addMonthsISO(isoDate: string, months: number): string {
  const date = parseLocalISODate(isoDate);
  const originalDay = date.getDate();
  date.setMonth(date.getMonth() + months);
  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }
  return formatISODateLocal(date);
}

export function addYearsISO(isoDate: string, years: number): string {
  const date = parseLocalISODate(isoDate);
  date.setFullYear(date.getFullYear() + years);
  return formatISODateLocal(date);
}

export function computeServiceStatus(
  item: ServiceScheduleItem,
  currentOdo: number,
  todayISO = formatISODateLocal(new Date())
): ServiceStatusInfo {
  const nextServiceOdo = item.lastServiceOdo + item.intervalKm;
  const remainingKm = nextServiceOdo - currentOdo;
  const usedKm = Math.max(0, currentOdo - item.lastServiceOdo);
  const kmProgressPct =
    item.intervalKm > 0
      ? Math.min(100, Math.round((usedKm / item.intervalKm) * 100))
      : 0;

  const nextServiceDate = addMonthsISO(
    item.lastServiceDate,
    item.intervalMonths
  );
  const remainingDays = diffDaysBetween(todayISO, nextServiceDate);
  const totalIntervalDays = Math.max(
    1,
    diffDaysBetween(item.lastServiceDate, nextServiceDate)
  );
  const elapsedDays = Math.max(0, diffDaysBetween(item.lastServiceDate, todayISO));
  const timeProgressPct = Math.min(
    100,
    Math.round((elapsedDays / totalIntervalDays) * 100)
  );

  const overallProgressPct = Math.max(kmProgressPct, timeProgressPct);

  let status: AlertSeverity = 'ok';
  let reason = 'Kondisi aman sesuai jadwal';

  if (remainingKm <= 0 || remainingDays <= 0) {
    status = 'danger';
    if (remainingKm <= 0 && remainingDays <= 0) {
      reason = `Lewat ${formatNumber(Math.abs(remainingKm))} km & ${Math.abs(
        remainingDays
      )} hari`;
    } else if (remainingKm <= 0) {
      reason = `Sudah melewati batas jarak ${formatNumber(
        Math.abs(remainingKm)
      )} km`;
    } else {
      reason = `Sudah melewati batas waktu ${Math.abs(remainingDays)} hari`;
    }
  } else if (remainingKm <= 500 || remainingDays <= 14) {
    status = 'warning';
    if (remainingKm <= 500 && remainingDays <= 14) {
      reason = `Sisa ${formatNumber(remainingKm)} km atau ${remainingDays} hari lagi`;
    } else if (remainingKm <= 500) {
      reason = `Sisa ${formatNumber(remainingKm)} km lagi sebelum servis`;
    } else {
      reason = `Sisa ${remainingDays} hari lagi sebelum jadwal waktu`;
    }
  } else {
    reason = `Sisa ${formatNumber(remainingKm)} km / ${remainingDays} hari`;
  }

  return {
    item,
    nextServiceOdo,
    remainingKm,
    kmProgressPct,
    nextServiceDate,
    remainingDays,
    timeProgressPct,
    overallProgressPct,
    status,
    reason,
  };
}

export function computeFuelStats(fuelLogs: FuelLog[]): FuelSummaryStats {
  const sortedAsc = [...fuelLogs].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.odoKm - b.odoKm;
  });

  const totalLiters = sortedAsc.reduce((sum, l) => sum + l.liters, 0);
  const totalFuelCost = sortedAsc.reduce((sum, l) => sum + l.totalCost, 0);

  const segmentsByLogId: Record<string, FuelEfficiencySegment> = {};

  // Exact full-tank-to-full-tank segment calculation
  let lastFullTankIdx: number | null = null;
  let exactTotalKm = 0;
  let exactTotalLiters = 0;
  let exactTotalCost = 0;

  for (let i = 0; i < sortedAsc.length; i++) {
    const log = sortedAsc[i];
    if (log.isFullTank) {
      const hasTripKm = typeof log.tripKm === 'number' && log.tripKm > 0;
      if (lastFullTankIdx !== null || hasTripKm) {
        const prevFull =
          lastFullTankIdx !== null ? sortedAsc[lastFullTankIdx] : null;
        const deltaKm = hasTripKm
          ? (log.tripKm as number)
          : prevFull && log.odoKm > 0 && prevFull.odoKm > 0
          ? log.odoKm - prevFull.odoKm
          : 0;
        const startIdx = lastFullTankIdx !== null ? lastFullTankIdx + 1 : 0;
        let segmentLiters = 0;
        let segmentCost = 0;
        for (let j = startIdx; j <= i; j++) {
          segmentLiters += sortedAsc[j].liters;
          segmentCost += sortedAsc[j].totalCost;
        }
        if (deltaKm > 0 && segmentLiters > 0) {
          exactTotalKm += deltaKm;
          exactTotalLiters += segmentLiters;
          exactTotalCost += segmentCost;
          segmentsByLogId[log.id] = {
            logId: log.id,
            deltaKm,
            kmPerLiter: deltaKm / segmentLiters,
            costPerKm: segmentCost / deltaKm,
            isExactSegment: true,
          };
        } else {
          segmentsByLogId[log.id] = {
            logId: log.id,
            deltaKm: deltaKm > 0 ? deltaKm : null,
            kmPerLiter: null,
            costPerKm: null,
            isExactSegment: true,
          };
        }
      } else {
        segmentsByLogId[log.id] = {
          logId: log.id,
          deltaKm: null,
          kmPerLiter: null,
          costPerKm: null,
          isExactSegment: true,
        };
      }
      lastFullTankIdx = i;
    } else {
      // Partial fill: track delta km from tripKm or previous entry for context
      const prev = i > 0 ? sortedAsc[i - 1] : null;
      const deltaKm =
        typeof log.tripKm === 'number' && log.tripKm > 0
          ? log.tripKm
          : prev && log.odoKm > prev.odoKm
          ? log.odoKm - prev.odoKm
          : null;
      segmentsByLogId[log.id] = {
        logId: log.id,
        deltaKm,
        kmPerLiter: null,
        costPerKm: null,
        isExactSegment: false,
      };
    }
  }

  if (exactTotalKm > 0 && exactTotalLiters > 0) {
    return {
      avgKmPerLiter: exactTotalKm / exactTotalLiters,
      avgCostPerKm: exactTotalCost / exactTotalKm,
      totalLiters,
      totalFuelCost,
      trackedDistanceKm: exactTotalKm,
      isEstimated: false,
      segmentsByLogId,
    };
  }

  // Fallback estimate if < 2 full-tank entries exist
  if (sortedAsc.length >= 2) {
    const first = sortedAsc[0];
    const last = sortedAsc[sortedAsc.length - 1];
    const odoSpanKm =
      first.odoKm > 0 && last.odoKm > first.odoKm ? last.odoKm - first.odoKm : 0;
    const litersAfterFirst = sortedAsc
      .slice(1)
      .reduce((sum, l) => sum + l.liters, 0);
    const costAfterFirst = sortedAsc
      .slice(1)
      .reduce((sum, l) => sum + l.totalCost, 0);

    let fallbackTripKm = 0;
    let fallbackTripLiters = 0;
    let fallbackTripCost = 0;

    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = sortedAsc[i - 1];
      const curr = sortedAsc[i];
      const dKm =
        typeof curr.tripKm === 'number' && curr.tripKm > 0
          ? curr.tripKm
          : curr.odoKm > 0 && prev.odoKm > 0
          ? curr.odoKm - prev.odoKm
          : 0;
      if (dKm > 0 && curr.liters > 0) {
        fallbackTripKm += dKm;
        fallbackTripLiters += curr.liters;
        fallbackTripCost += curr.totalCost;
        segmentsByLogId[curr.id] = {
          logId: curr.id,
          deltaKm: dKm,
          kmPerLiter: dKm / curr.liters,
          costPerKm: curr.totalCost / dKm,
          isExactSegment: false,
        };
      }
    }

    if (odoSpanKm > 0 && litersAfterFirst > 0) {
      return {
        avgKmPerLiter: odoSpanKm / litersAfterFirst,
        avgCostPerKm: costAfterFirst / odoSpanKm,
        totalLiters,
        totalFuelCost,
        trackedDistanceKm: odoSpanKm,
        isEstimated: true,
        segmentsByLogId,
      };
    }

    if (fallbackTripKm > 0 && fallbackTripLiters > 0) {
      return {
        avgKmPerLiter: fallbackTripKm / fallbackTripLiters,
        avgCostPerKm: fallbackTripCost / fallbackTripKm,
        totalLiters,
        totalFuelCost,
        trackedDistanceKm: fallbackTripKm,
        isEstimated: true,
        segmentsByLogId,
      };
    }
  }

  return {
    avgKmPerLiter: null,
    avgCostPerKm: null,
    totalLiters,
    totalFuelCost,
    trackedDistanceKm: 0,
    isEstimated: true,
    segmentsByLogId,
  };
}

export function getMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function formatMonthShortID(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  const date = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function computeMonthlyExpenses(
  data: MotoCareData,
  maxMonths = 6,
  refDate = new Date()
): MonthlyExpensePoint[] {
  const buckets: Record<string, MonthlyExpensePoint> = {};
  const orderedKeys: string[] = [];

  const allDates = [
    ...data.fuelLogs.map((l) => l.date),
    ...data.serviceHistory.map((l) => l.date),
    ...data.tireLogs.map((l) => l.date),
    ...data.taxLogs.map((l) => l.date),
  ].filter(Boolean);

  const currentMonthStart = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
  const minAllowedStart = new Date(
    refDate.getFullYear(),
    refDate.getMonth() - (maxMonths - 1),
    1
  );

  let startMonth = currentMonthStart;
  if (allDates.length > 0) {
    const earliestDate = [...allDates].sort()[0];
    const [y, m] = earliestDate.slice(0, 7).split('-').map(Number);
    if (y && m) {
      const earliestMonthStart = new Date(y, m - 1, 1);
      if (earliestMonthStart > currentMonthStart) {
        startMonth = currentMonthStart;
      } else if (earliestMonthStart > minAllowedStart) {
        startMonth = earliestMonthStart;
      } else {
        startMonth = minAllowedStart;
      }
    }
  }

  const cursor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
  while (cursor <= currentMonthStart) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
    orderedKeys.push(key);
    buckets[key] = {
      monthKey: key,
      label: formatMonthShortID(key),
      fuel: 0,
      service: 0,
      taxAndTire: 0,
      total: 0,
    };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const log of data.fuelLogs) {
    const k = getMonthKey(log.date);
    if (buckets[k]) {
      buckets[k].fuel += log.totalCost;
      buckets[k].total += log.totalCost;
    }
  }

  for (const log of data.serviceHistory) {
    const k = getMonthKey(log.date);
    if (buckets[k]) {
      buckets[k].service += log.totalCost;
      buckets[k].total += log.totalCost;
    }
  }

  for (const log of data.tireLogs) {
    const k = getMonthKey(log.date);
    if (buckets[k]) {
      buckets[k].taxAndTire += log.cost;
      buckets[k].total += log.cost;
    }
  }

  for (const log of data.taxLogs) {
    const k = getMonthKey(log.date);
    if (buckets[k]) {
      buckets[k].taxAndTire += log.cost;
      buckets[k].total += log.cost;
    }
  }

  return orderedKeys.map((k) => buckets[k]);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
