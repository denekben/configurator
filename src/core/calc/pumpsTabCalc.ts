/**
 * Расход воды во вторичном контуре, м³/ч.
 * Считается с нуля (не читает results):
 *   G = 0.86 * Q / (Tподачи - Tобратки)
 */
export function calcSecondaryFlowForPumps(
  loadKw: number,
  supplyTempC: number,
  returnTempC: number,
): number {
  const dt = supplyTempC - returnTempC;
  if (!loadKw || dt <= 0) return 0;
  return (0.86 * loadKw) / dt;
}

/**
 * Расход одного насоса, м³/ч.
 * G_насоса = G_втор / pumpCount
 */
export function calcPumpFlow(secondaryFlowM3h: number, pumpCount: number): number {
  if (!secondaryFlowM3h || !pumpCount || pumpCount <= 0) return 0;
  return secondaryFlowM3h / pumpCount;
}

/**
 * Напор насоса, м.вод.ст.
 * H = hydraulicLossM + hxLossM + reserveM + extraLossM
 */
export function calcPumpHead(
  hydraulicLossM: number,
  hxLossM: number,
  reserveM: number,
  extraLossM: number,
): number {
  return (hydraulicLossM || 0) + (hxLossM || 0) + (reserveM || 0) + (extraLossM || 0);
}