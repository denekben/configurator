/**
 * Расход воды во вторичном контуре, м³/ч.
 * Формула: G = 0.86 * Q / (Tподачи - Tобратки)
 * Q — кВт, T — °C.
 */
export function calcSecondaryFlow(loadKw: number, supplyTempC: number, returnTempC: number): number {
  const dt = supplyTempC - returnTempC;
  if (!loadKw || dt <= 0) return 0;
  return (0.86 * loadKw) / dt;
}

/**
 * Ориентировочный Ду, мм.
 * Формула: d' = 18.8 * sqrt(G / v)
 * G — м³/ч, v — м/с.
 */
export function calcSecondaryEstimatedDu(flowM3h: number, speedMs: number): number {
  if (!flowM3h || !speedMs || speedMs <= 0) return 0;
  return 18.8 * Math.sqrt(flowM3h / speedMs);
}

/**
 * Скорость воды при выбранном стандартном Ду, м/с.
 * Формула: v = G * (18.8 / Ду)^2
 * G — м³/ч, Ду — мм.
 */
export function calcSecondaryActualSpeed(flowM3h: number, standardDuMm: number): number {
  if (!flowM3h || !standardDuMm || standardDuMm <= 0) return 0;
  const k = 18.8 / standardDuMm;
  return flowM3h * k * k;
}