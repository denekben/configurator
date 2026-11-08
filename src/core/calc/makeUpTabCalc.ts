/**
 * Расход подпитки, м³/ч.
 * Если объём системы не задан (0):
 *   G = (Q * coef) / (5 * 1000)
 * Иначе:
 *   G = V / 5000
 *
 * Q — кВт, coef — л/кВт, V — л.
 */
export function calcMakeupFlow(
  loadKw: number,
  volumeCoef: number,
  systemVolumeL: number | undefined,
): number {
  const volume = systemVolumeL ?? 0;

  if (volume === 0) {
    if (!loadKw || !volumeCoef) return 0;
    return (loadKw * volumeCoef) / (5 * 1000);
  }

  return volume / 5000;
}

/**
 * Ориентировочный Ду, мм.
 * d' = 18.8 * sqrt(G / v)
 * G — м³/ч, v — м/с.
 */
export function calcMakeupEstimatedDu(flowM3h: number, speedMs: number): number {
  if (!flowM3h || !speedMs || speedMs <= 0) return 0;
  return 18.8 * Math.sqrt(flowM3h / speedMs);
}

/**
 * Скорость воды при выбранном стандартном Ду, м/с.
 * v = G * (18.8 / Ду)^2
 */
export function calcMakeupActualSpeed(flowM3h: number, standardDuMm: number): number {
  if (!flowM3h || !standardDuMm || standardDuMm <= 0) return 0;
  const k = 18.8 / standardDuMm;
  return flowM3h * k * k;
}