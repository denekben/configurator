// src/core/price/buildPrice.ts

/** Итоговая цена: разбивка по категориям + сумма. */
export interface PriceBreakdown {
  par?: number;
  condensate?: number;
  separator?: number;
  secondary?: number;
  steamComponent?: number;
  waterComponent?: number;
  pumps?: number;
  pto?: number;
  uzk?: number;
  [extra: string]: number | undefined;
}

/** Итог: разбивка + сумма. */
export interface PriceTotal {
  breakdown: PriceBreakdown;
  total: number;
  totalWithVat: number;
}

import type { InputData, SpecData } from '../types';

import { buildSpec } from './buildSpec';
import {
  findRowByDn,
  type SteamCatalog,
} from './lookup';

import pipeWrapCatalogJson from '../../data/Цена_трубной_обвязки_ХК.json';
import steamCatalogJson from '../../data/Компоненты_на_ПАР.json';

const STEAM_CATALOG = steamCatalogJson as unknown as SteamCatalog;
const VALVES = STEAM_CATALOG.sections.valves_fittings;

type PipeWrapRow = { Ду: number; Цена: number };

const PIPE_WRAP = pipeWrapCatalogJson as unknown as PipeWrapRow[];

/** Цена трубной обвязки по Ду. */
function pipeWrapPrice(du: number): number | undefined {
  return PIPE_WRAP.find((r) => r.Ду === du)?.Цена;
}

// ============================================================
// Ключи спецификации, которые входят в steamComponent
// (по блокам из Excel-«Упрощённой спецификации»)
// ============================================================
const STEAM_COMPONENT_KEYS = [
  // Блок сепаратора
  'separator',
  'separatorValve',
  'separatorFilter',
  'separatorCheck',
  'separatorTrap',

  // РК + привод
  'controlValve',
  'actuator',

  // Арматура на подаче
  'primaryValve',
  'supplyFilter',

  // Блок прерывания вакуума
  'vacuumBallValve',
  'vacuumBreaker',
  'vacuumThermoTrap',

  // Линия отвода конденсата
  'condensateValve',
  'condensateFilter',
  'condensateCheck',
  'condensateTrap',

  // КиП (паровой)
  'primaryManometer',
  'primaryThermometer',
  'condensateThermometer',
] as const;

// ============================================================
// Ключи спецификации, входящие в waterComponent
// (Вода: арматура и КиП вторички/подпитки)
// ============================================================
const WATER_COMPONENT_KEYS = [
  'secondaryBallValve',
  'secondaryCheckValve',
  'secondaryBallValve2',
  'secondaryCheckValve2',
  'secondaryFilter',
  'secondaryVibroInsert',
  'secondaryAirVent',
  'secondaryDrain',
  'secondaryManifoldValve',
  'secondaryManometer',
  'secondaryThermometer',
  'secondaryPressSensor',
  'solenoidValve',
  'makeupDrain',
  'pressostat',
  'secondaryTempSensor',
] as const;

const VAT = 1.22;

export function buildPrice(input: InputData): PriceTotal {
  const spec = buildSpec(input);

  const breakdown: PriceBreakdown = {
    ...buildSteam(input),
    ...buildCondensate(input),
    ...buildSeparator(input),
    ...buildSecondary(input),
    ...buildSteamComponent(spec),
    ...buildWaterComponent(spec),
    ...buildPumpsComponent(spec),
    ...buildPtoComponent(input),
    ...buildUzkComponent(spec),
  };

  const rawTotal = Object.values(breakdown).reduce<number>(
    (acc, v) => acc + (typeof v === 'number' && Number.isFinite(v) ? v : 0),
    0,
  );

  const rawTotalWithVat = rawTotal * VAT;

  const total = Math.ceil(rawTotal * 100) / 100;
  const totalWithVat = Math.ceil(rawTotalWithVat * 100) / 100;

  console.log('=== [price] breakdown ===');
  console.table(breakdown);
  console.log('=== [price] total ===', total);
  console.log('=== [price] totalWithVat (× 1.22) ===', totalWithVat);

  return { breakdown, total, totalWithVat };
}

// ============================================================
// Пар (трубная обвязка)
// ============================================================
function buildSteam(input: InputData): PriceBreakdown {
  const dn = input.results.steamPipe?.standardDiameterMm;
  if (dn == null || !Number.isFinite(dn)) return {};

  const basePrice = pipeWrapPrice(dn);
  if (basePrice == null) return {};

  const par = 3.5 * basePrice * 0.25;
  return { par };
}

// ============================================================
// Конденсат (трубная обвязка)
// ============================================================
function buildCondensate(input: InputData): PriceBreakdown {
  const dn = input.results.trap?.trapDu;
  if (dn == null || !Number.isFinite(dn)) return {};

  const basePrice = pipeWrapPrice(dn);
  if (basePrice == null) return {};

  const condensate = 3.5 * basePrice * 0.25;
  return { condensate };
}

// ============================================================
// Сепаратор (трубная обвязка)
// ============================================================
function buildSeparator(input: InputData): PriceBreakdown {
  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  if (dnSteam == null) return {};

  const sepRow = findRowByDn(dnSteam, VALVES.separators);
  if (!sepRow) return {};

  const dnOutlet = sepRow['dn_outlet'];
  if (typeof dnOutlet !== 'number') return {};

  const basePrice = pipeWrapPrice(dnOutlet);
  if (basePrice == null) return {};

  const separator = basePrice * 0.25;
  return { separator };
}

// ============================================================
// Вторичка (трубная обвязка)
// ============================================================
function buildSecondary(input: InputData): PriceBreakdown {
  const duRaw =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (duRaw == null || !Number.isFinite(duRaw)) return {};

  const basePrice = pipeWrapPrice(duRaw);
  if (basePrice == null) return {};

  const d29 = basePrice * 0.5;
  const secondary = 5 * d29;
  return { secondary };
}

// ============================================================
// Пар (компоненты)
// ============================================================
function buildSteamComponent(spec: SpecData): PriceBreakdown {
  const detail: Record<string, number> = {};
  let sum = 0;

  for (const key of STEAM_COMPONENT_KEYS) {
    const c = spec[key];
    if (!c) continue;
    const price = typeof c.price === 'number' && Number.isFinite(c.price) ? c.price : 0;
    const qty = typeof c.qty === 'number' && Number.isFinite(c.qty) ? c.qty : 0;
    const lineTotal = price * qty;
    detail[key] = lineTotal;
    sum += lineTotal;
  }

  return { steamComponent: sum };
}

// ============================================================
// Вода (компоненты)
// ============================================================
function buildWaterComponent(spec: SpecData): PriceBreakdown {
  const detail: Record<string, number> = {};
  let sum = 0;

  for (const key of WATER_COMPONENT_KEYS) {
    const c = spec[key];
    if (!c) continue;
    const price = typeof c.price === 'number' && Number.isFinite(c.price) ? c.price : 0;
    const qty = typeof c.qty === 'number' && Number.isFinite(c.qty) ? c.qty : 0;
    const lineTotal = price * qty;
    detail[key] = lineTotal;
    sum += lineTotal;
  }

  const water = 5 * sum;

  return { waterComponent: water };
}

// ============================================================
// Насосы (компоненты)
// ============================================================
function buildPumpsComponent(spec: SpecData): PriceBreakdown {
  const pump = spec['pump'];
  if (!pump) return {};

  const price = typeof pump.price === 'number' && Number.isFinite(pump.price) ? pump.price : 0;
  const qty = typeof pump.qty === 'number' && Number.isFinite(pump.qty) ? pump.qty : 0;
  const lineTotal = price * qty;

  const pumps = lineTotal * 2.5;

  return { pumps };
}

// ============================================================
// ПТО (компоненты)
// ============================================================
function buildPtoComponent(input: InputData): PriceBreakdown {
  const priceHi = input.pto.priceHi;
  if (priceHi == null || !Number.isFinite(Number(priceHi))) return {};

  const pto = 2.5 * Number(priceHi);

  return { pto };
}

// ============================================================
// УЗК (компоненты)
// ============================================================
function buildUzkComponent(spec: SpecData): PriceBreakdown {
  const uzk = spec['uzk'];
  if (!uzk) return {};

  const price = typeof uzk.price === 'number' && Number.isFinite(uzk.price) ? uzk.price : 0;
  const qty = typeof uzk.qty === 'number' && Number.isFinite(uzk.qty) ? uzk.qty : 0;
  const lineTotal = price * qty;

  return { uzk: lineTotal };
}