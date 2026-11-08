// src/core/calc/controlValveTabCalc.ts

// ---------------------------------------------------------------------------
// Импорты JSON
// ---------------------------------------------------------------------------
import valveData from '../../data/Компоненты_на_ПАР.json';
import actuatorData from '../../data/Данные_для_электропривода_VFS-2R.json';

// ---------------------------------------------------------------------------
// Типы: клапаны
// ---------------------------------------------------------------------------
export interface ValveComponent {
  name: string;
  dn: number | string;
  kvs: number;
  code: string;
  price: number;
}

// ---------------------------------------------------------------------------
// Типы: электроприводы
// ---------------------------------------------------------------------------
export interface ActuatorRow {
  name: string;
  dn: number | string;
  voltage: number;
  type: string;
  su_sd: string;
  connection: string | null;
  material: string | null;
  code: string;
}

export interface ActuatorSelection {
  name: string;
  code: string;
  controlType: string;
  voltage: number;
  suSd: string;
  dn: number | string;
}

/** Результат подбора кода клапана из Компоненты_на_ПАР.json */
export interface ValveCodeSelection {
  name: string;
  code: string;
  price: number;
}

// ---------------------------------------------------------------------------
// Утилиты
// ---------------------------------------------------------------------------
/**
 * Нормализация Ду для сравнения с JSON.
 * В JSON у VFS-2R встречаются строки вида "15 (0,63)".
 * Приводим запятую к точке, убираем лишние пробелы.
 */
function normalizeDn(dn: string | number | null | undefined): string {
  if (dn === null || dn === undefined) return '';
  return String(dn).trim().replace(/\s+/g, ' ').replace(/,/g, '.');
}

/**
 * Приводит Ду вида '15' или '15 (0,63)' к числу.
 * Возвращает 0, если распарсить не удалось.
 */
function parseDnToNumber(
  dn: number | string | null | undefined,
): number {
  if (dn === undefined || dn === null) return 0;
  if (typeof dn === 'number') return dn;
  const m = String(dn).match(/\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(',', '.')) : 0;
}

// ---------------------------------------------------------------------------
// Клапаны: Kvs по типу и Ду
// ---------------------------------------------------------------------------
export function getValveKvs(
  valveType: string | null | undefined,
  dn: string | number | null | undefined,
): number {
  const dnStr = normalizeDn(dn);
  if (dnStr === '') return 0;

  let rows: ValveComponent[] = [];

  if (valveType === 'KM125F' || valveType === 'KM125F_pneu') {
    const key = valveType === 'KM125F' ? 'KM125F_analog' : 'KM125F_pneumatic';
    // @ts-ignore
    rows = valveData.sections.regulating_valves[key]?.rows || [];
  } else if (valveType === 'KM225F') {
    // @ts-ignore
    rows = valveData.sections.regulating_valves.KM225F_analog_PSL?.rows || [];
  } else {
    // @ts-ignore
    rows = valveData.sections.regulating_valves['VFS-2R']?.rows || [];
  }

  const found = rows.find(r => normalizeDn(r.dn) === dnStr);
  return found ? found.kvs : 0;
}

// ---------------------------------------------------------------------------
// Клапаны: Kv и поверочный перепад
// ---------------------------------------------------------------------------
/**
 * Kv регулирующего клапана (формула 4).
 * Kv = G / (12 * P1 * sqrt(1 - 5.67 * (0.42 - x)^2))
 */
export function calcKv(flowKgH: number, p1Bar: number, dpBar: number): number {
  const x = dpBar / p1Bar;
  const term = 0.42 - x;
  const denom = 12 * p1Bar * Math.sqrt(1 - 5.67 * term * term);
  return flowKgH / denom;
}

/**
 * Поверочный перепад на клапане (формула 5, обратная к calcKv).
 * ΔP = (0.42 - sqrt((1 - (G / (Kv * 12 * P1))^2) / 5.67)) * P1
 *
 * @returns перепад в бар, либо NaN, если расход превышает пропускную
 *          способность клапана (подкоренное выражение < 0).
 */
export function calcValveDeltaP(flowKgH: number, kv: number, p1Bar: number): number {
  if (kv <= 0 || p1Bar <= 0) return 0;

  const ratio = flowKgH / (kv * 12 * p1Bar);
  const inner = 1 - ratio * ratio;

  // Расход выше пропускной способности клапана — физически перепад
  // посчитать нельзя (клапан «захлёбывается»).
  if (inner < 0) return NaN;

  const x = 0.42 - Math.sqrt(inner / 5.67);
  return x * p1Bar;
}

// ---------------------------------------------------------------------------
// Электроприводы: подбор по ВВЕДЁННЫМ параметрам (VFS-2R)
// ---------------------------------------------------------------------------
/**
 * Подбор электропривода VFS-2R по Ду, напряжению, типу управления и SU|SD.
 * Используется, когда valveType === 'VFS-2R'.
 *
 * Особенность JSON: в каталоге VFS-2R есть только Ду 80 и 200.
 * Поэтому ищем «по группе»:
 *   - dn <= 80  → ищем по dn = 80
 *   - dn >  80  → ищем по dn = 200
 *
 * @returns ActuatorSelection | null
 */
export function selectActuatorByParams(
  dn: number | string | null | undefined,
  voltage: number | string | null | undefined,
  controlType: 'impulse' | 'analog' | string | null | undefined,
  suSd: 'no_spring' | 'spring' | string | null | undefined,
): ActuatorSelection | null {
  const dnNum = parseDnToNumber(dn);
  if (!dnNum) return null;

  const wantedVoltage = Number(voltage);
  if (!Number.isFinite(wantedVoltage) || wantedVoltage <= 0) return null;

  // Групповой Ду: <=80 → 80, иначе 200
  const wantedDn = dnNum <= 80 ? '80' : '200';

  const wantedType =
    controlType === 'impulse' ? 'импульсное'
    : controlType === 'analog' ? 'аналоговое'
    : controlType ?? '';

  if (!wantedType) return null;

  const wantedSuSd =
    suSd === 'no_spring' ? 'Без пружины'
    : suSd === 'spring' ? 'С пружиной'
    : suSd ?? '';

  if (!wantedSuSd) return null;

  const rows: ActuatorRow[] = actuatorData.automatic_mode.rows;

  const found = rows.find(r =>
    String(r.dn) === wantedDn &&
    Number(r.voltage) === wantedVoltage &&
    r.type === wantedType &&
    r.su_sd === wantedSuSd
  );

  if (!found) return null;

  return {
    name: found.name,
    code: found.code,
    controlType: found.type,
    voltage: found.voltage,
    suSd: found.su_sd,
    dn: found.dn, // фактический Ду из JSON (80 или 200)
  };
}

// ---------------------------------------------------------------------------
// Клапаны (не-VFS-2R): подбор кода по типу и Ду
// ---------------------------------------------------------------------------
/**
 * Подбор кода клапана по типу и Ду.
 * Используется, когда valveType !== 'VFS-2R'.
 *
 * @param valveType - 'KM125F' | 'KM125F_pneu' | 'KM225F' | 'VFS-2R'
 * @param dn - диаметр условного прохода
 * @returns ValveCodeSelection | null
 */
export function selectValveCode(
  valveType: string | null | undefined,
  dn: number | string | null | undefined,
): ValveCodeSelection | null {
  const dnStr = normalizeDn(dn);
  if (dnStr === '') return null;

  let rows: ValveComponent[] = [];

  if (valveType === 'KM125F' || valveType === 'KM125F_pneu') {
    const key = valveType === 'KM125F' ? 'KM125F_analog' : 'KM125F_pneumatic';
    // @ts-ignore
    rows = valveData.sections.regulating_valves[key]?.rows || [];
  } else if (valveType === 'KM225F') {
    // @ts-ignore
    rows = valveData.sections.regulating_valves.KM225F_analog_PSL?.rows || [];
  } else {
    // @ts-ignore
    rows = valveData.sections.regulating_valves['VFS-2R']?.rows || [];
  }

  const found = rows.find(r => normalizeDn(r.dn) === dnStr);
  if (!found) return null;

  return {
    name: found.name,
    code: found.code,
    price: found.price,
  };
}