// src/core/calc/steamPipeTabCalc.ts

/** Рекомендованная скорость пара в первом приближении, м/с (по методичке). */
export const AUTO_STEAM_SPEED_MS_DEFAULT = 25;

/** Допустимый диапазон скорости пара в паропроводе, м/с (по методичке). */
export const STEAM_SPEED_MIN_MS = 20;
export const STEAM_SPEED_MAX_MS = 40;

/** Максимальный допустимый Ду паропровода, мм (по методичке). */
export const MAX_STANDARD_DU_MM = 300;

export const STANDARD_DIAMETERS = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300];

export function calcSteamFlow(loadKw: number, enthalpySteam: number, enthalpyCondensate: number): number {
  return (loadKw * 3600) / (enthalpySteam - enthalpyCondensate) * 0.99;
}

export function calcEstimatedPipeArea(flowKgH: number, specificVolume: number, speedMs: number): number {
  return (flowKgH * specificVolume) / (speedMs * 3600);
}

export function calcEstimatedDiameter(estimatedPipeAreaM2: number): number {
  return Math.sqrt((4 * estimatedPipeAreaM2) / Math.PI) * 1000;
}

export function calcStandardPipeArea(standardDuMm: number): number {
  const d = standardDuMm / 1000;
  return (Math.PI * d * d) / 4;
}

export function calcActualSteamSpeed(flowKgH: number, standardPipeAreaM2: number, specificVolume: number): number {
  return (flowKgH * specificVolume) / (standardPipeAreaM2 * 3600);
}

/** Проверка: скорость в допустимом диапазоне (20–40 м/с). */
export function isSpeedInRange(speedMs: number): boolean {
  if (!speedMs || speedMs <= 0) return false;
  return speedMs >= STEAM_SPEED_MIN_MS && speedMs <= STEAM_SPEED_MAX_MS;
}

/** Проверка: ориентировочный Ду не превышает 300 мм. */
export function isDuInRange(duMm: number): boolean {
  if (!duMm || duMm <= 0) return false;
  return duMm <= MAX_STANDARD_DU_MM;
}

/**
 * Подбор ближайшего стандартного Ду по методичке (по модулю).
 * Без проверки скорости и без ограничения 300 — только «ближайший».
 */
export function selectStandardDu(estimatedDuMm: number): number {
  if (!estimatedDuMm || estimatedDuMm <= 0) return 0;

  let best = STANDARD_DIAMETERS[0];
  let bestDist = Math.abs(best - estimatedDuMm);

  for (const du of STANDARD_DIAMETERS) {
    const dist = Math.abs(du - estimatedDuMm);
    if (dist < bestDist) {
      bestDist = dist;
      best = du;
    }
  }

  return best;
}