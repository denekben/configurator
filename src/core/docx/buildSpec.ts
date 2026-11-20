// src/core/spec/buildSpec.ts

import type { InputData, SpecData } from '../types';
import {
  findRowByDn,
  pickField,
  type SteamCatalog,
  type CatalogTable,
} from './lookup';

import steamCatalogJson from '../../data/Компоненты_на_ПАР.json';
import additionalCatalogJson from '../../data/Компоненты_ДОП.json';
import secondaryCatalogJson from '../../data/Компоненты_на_ВТОРИЧКУ.json';
import pumpsCatalogJson from '../../data/Компоненты_НАСОСЫ.json';

const STEAM_CATALOG = steamCatalogJson as unknown as SteamCatalog;
const VALVES = STEAM_CATALOG.sections.valves_fittings;
const ADDITIONAL = additionalCatalogJson as unknown as {
  'Манометры'?: Array<{
    Наименование: string;
    Ру: string | null;
    КОД: string | null;
    Цена: number | string | null;
  }>;
  'Термометры'?: Array<{
    Наименование: string;
    L: number | null;
    Диапазон: number | null;
    КОД: string | null;
    Цена: number | string | null;
  }>;
  'Датчики давления'?: Array<{
    Наименование: string;
    Диапазон: string | null;
    КОД: string | null;
    Цена: number | string | null;
  }>;
  'Датчики температуры'?: Array<{
    Наименование: string;
    L: number | null;
    КОД: string | null;
    Цена: number | string | null;
  }>;
  'Прессостаты'?: Array<{
    Наименование: string;
    Ру: string | null;
    КОД: string | null;
    Цена: number | string | null;
  }>;
  'Соленоидные клапаны'?: Array<{
    Наименование: string;
    Ду: number | null;
    Ру: number | null;
    Tmax: number | null;
    Присоед: string | null;
    Материал: string | null;
    КОД: string | null;
    Цена: number | null;
  }>;
  'Привод для РК'?: Array<{
    Наименование: string;
    Ду: number | null;
    Напр: number | null;
    Тип: string | null;
    'SU|SD': string | null;
    КОД: string | null;
  }>;
};
// === Вторичка ===
type SecondaryRow = {
  Наименование: string;
  Ду: number | null;
  Ру: number | null;
  Tmax: number | null;
  Присоед: string | null;
  Материал: string | null;
  КОД: string | null;
  Цена: number | string | null;
};

type PumpRow = {
  Артикул: string;
  Модель: string;
  'Мощность, Вт': string;
  'Монтажная длина, мм': string;
  'Трубное присоединение': string;
  'Материал корпуса': string;
  'Кол-во скоростей': string;
  'Напряжение питания': string;
  'Цена, руб без НДС': string;
};

const PUMPS = pumpsCatalogJson as unknown as PumpRow[];

type SecondaryCatalog = {
  'Шаровые краны'?: Record<string, SecondaryRow[]>;
  'Дисковые затворы'?: Record<string, SecondaryRow[]>;
  'Обратные клапаны'?: Record<string, SecondaryRow[]>;
  'Фильтры'?: Record<string, SecondaryRow[]>;
  'Вибровставки'?: Record<string, SecondaryRow[]>;
};

const SECONDARY = secondaryCatalogJson as unknown as SecondaryCatalog;

function findSecondaryByDu(
  list: SecondaryRow[] | undefined,
  du: number,
): SecondaryRow | undefined {
  if (!list) return undefined;
  return list.find((r) => r.Ду === du);
}

function formatSecondaryValveLine(
  prefix: string,
  valveName: string,
  row: SecondaryRow,
  du: number,
): string {
  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';
  return `${prefix} ${valveName} Ду/${du}/Ру${pn}/Tmax${tmax} ${material} ${conn}`;
}

const REGULATING = STEAM_CATALOG.sections.regulating_valves;

export function buildSpec(input: InputData): SpecData {
  return {
    ...primaryValve(input),            // Запорный вентиль KV31 Ду 32*
    ...primaryThermometer(input),      // Термометр БТ-51.220 ... L=64
    ...manifoldValve(input),           // Кран трёхходовой MV25-015*
    ...perkinsTube(input),             // Трубка Перкинса
    ...primaryManometer(input),        // Манометр ТМ521 0..16 бар
    ...separator(input),               // Сепаратор ГРАНСТИМ СПГ25 Ду 32*
    ...separatorValve(input),          // Запорный вентиль KV31 Ду 15*
    ...separatorFilter(input),         // Фильтр IS16 Ду 15*
    ...separatorTrap(input),           // Поплавковый конденсатоотводчик A 11HC Ду 15 dP 10*
    ...separatorCheck(input),          // Обратный клапан CVS40 Ду 15*
    ...supplyFilter(input),            // Фильтр IS16 Ду 32*
    ...controlValve(input),            // Регулирующий клапан VFS-2R Ду 25 KVs 10
    ...actuator(input),                // Электропривод AMV-1800R, 220V, импульсное
    ...safetyValve(input),             // ПК ПРЕГРАН КПП 496-01-ЗН 20x32*
    ...vacuumBallValve(input),         // Шаровой кран BV15*
    ...vacuumBreaker(input),           // Прерыватель вакуума VBS25-015*
    ...vacuumThermoTrap(input),        // Термостатический конденсатоотводчик ТК42 Ду15*
    ...condensateThermometer(input),   // Термометр БТ-51.220 ... (на конденсат)
    ...condensateValve(input),         // Запорный вентиль KV31 Ду 25*
    ...condensateFilter(input),        // Фильтр IS16 Ду 25*
    ...condensateTrap(input),          // Поплавковый конденсатоотводчик A 11HC Ду 25 dP 10*
    ...condensateCheck(input),         // Обратный клапан CVS40 Ду 25*
    ...heatExchanger(input),           // Теплообменник HH-19-7-TK
    ...secondaryAirVent(input),        // Воздушник BVR-R Ду/15/Ру40/Tmax120 ...
    ...secondaryManifoldValve(input),  // Трехходовой кран под манометр Ду 15 Ру 40 Tmax 150
    ...secondaryManometer(input),      // Манометр Ридан 0..10 бар ...
    ...secondaryThermometer(input),    // Термометр биметаллический O80мм 0..120С, L=150 ...
    ...secondaryBallValve(input),      // Шаровой кран BVR-R Ду/50/Ру40/Tmax120 ...
    ...secondaryTempSensor(input),     // Датчик температуры MBT 5250R ...
    ...secondaryPressSensor(input),    // Датчик давления MBS1700R ...
    ...secondaryCheckValve(input),     // Обратный клапан NRV-R Ду/50/Ру25/Tmax110 ...
    ...secondaryDrain(input),          // Спускник BVR-R Ду/25/Ру40/Tmax120 ...
    ...secondaryVibroInsert(input),    // Вибровставка ZKV EPDM Ду/50/Ру16/Tmax100 - ф/ф
    ...pump(input),                    // Насос RMV 5-3F
    ...secondaryFilter(input),         // Фильтр FVR-R Ду/50/Ру25/Tmax130 ...
    ...secondaryBallValve2(input),     // Шаровой кран BVR-R Ду/15/Ру40/Tmax120 ...
    ...secondaryCheckValve2(input),    // Обратный клапан NRV-R Ду/15/Ру25/Tmax110 ...
    ...solenoidValve(input),           // Соленоидный клапан EV220WR Ду/15/Ру16/Tmax130 ...
    ...pressostat(input),              // Прессостат KPI 35R ...
    ...makeupDrain(input),           // Спускник BVR-R Ду/15/Ру40/Tmax120 ...
    ...uzk(input),                     // Контроль сварных соединений ...
    ...pipeTs(input),                  // Трубопровод ТС ...
    ...pipeSosv(input),                // Трубопровод СО/СВ ...
  };
}

// ============================================================
// 1. Запорный вентиль KV31 Ду 32*
// ============================================================
function primaryValve(input: InputData): SpecData {
  const dn = input.results.steamPipe?.standardDiameterMm;
  if (!dn) return {};

  const name = pickField(VALVES.shutoff_valves, dn, 'name');
  const code = pickField(VALVES.shutoff_valves, dn, 'code');
  const price = pickField(VALVES.shutoff_valves, dn, 'price');
  if (!name) return {};

  const reserve = input.scheme.secondary.hxReserve;
  const qty =
    reserve === 'none' ? 1
    : reserve === '2x100' ? 3
    : 1;

  const basePrice = price != null ? Number(price) : undefined;

  return {
    primaryValve: {
      name: `Запорный вентиль ${name}*`,
      qty,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: code ? String(code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 2. Термометр БТ-51.220 (0-200°С) G1/2.64.1,5 100мм.
//    Резьба G1/2. L=64 мм.*
// ============================================================
function primaryThermometer(input: InputData): SpecData {
  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  const steamTemp = input.steamFlow.steamTempC;

  if (dnSteam == null || steamTemp == null) return {};

  let l: 64 | 100 | 150;
  if (dnSteam < 65) l = 64;
  else if (dnSteam > 250) l = 150;
  else l = 100;

  const range: 200 | 250 = steamTemp < 200 ? 200 : 250;

  const thermometers = (additionalCatalogJson as any).Термометры as Array<{
    Наименование: string;
    L: number | null;
    Диапазон: number | null;
    КОД: string | null;
    Цена: number | string | null;
  }>;

  const row = thermometers.find(
    (t) => t.L === l && t.Диапазон === range,
  );
  if (!row) return {};

  return {
    primaryThermometer: {
      name: row.Наименование,
      qty: 2,
      price: row.Цена != null && typeof row.Цена === 'number' ? row.Цена : undefined,
      code: row.КОД ?? undefined,
      vendor: undefined
    },
  };
}

// ============================================================
// 3. Кран трёхходовой MV25-015*
// ============================================================
function manifoldValve(_input: InputData): SpecData {
  const table = VALVES.manometer_cocks;
  const row = table.rows[0];
  if (!row) return {};

  return {
    manifoldValve: {
      name: row.name,
      qty: 6,
      price: row.price != null ? Number(row.price) : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 4. Трубка Перкинса
// ============================================================
function perkinsTube(_input: InputData): SpecData {
  return {
    perkinsTube: {
      name: 'Трубка Перкинса',
      qty: 6,
      price: undefined,
      code: undefined,
      vendor: undefined
    },
  };
}

// ============================================================
// 5. Манометр показывающий ТМ521 0..16бар.
//    О100. G1/2 кл. точн. 1,0 IP64*
// ============================================================
function primaryManometer(_input: InputData): SpecData {
  const row = ADDITIONAL['Манометры']?.find((m) =>
    m['Наименование'].startsWith('Манометр показывающий ТМ521'),
  );
  if (!row) return {};

  return {
    primaryManometer: {
      name: row['Наименование'],
      qty: 6,
      price: row['Цена'] != null && typeof row['Цена'] === 'number' ? row['Цена'] : undefined,
      code: row['КОД'] ? String(row['КОД']) : undefined,
      vendor: undefined
    },
  };
}

// ============================================================
// 6. Сепаратор ГРАНСТИМ СПГ25 Ду 32*
// ============================================================
function separator(input: InputData): SpecData {
  const dn = input.results.steamPipe?.standardDiameterMm;
  if (dn == null) return {};

  const row = findRowByDn(dn, VALVES.separators);
  if (!row) return {};

  const basePrice = row.price != null ? Number(row.price) : undefined;

  return {
    separator: {
      name: `Сепаратор ${row.name}*`,
      qty: 1,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 7. Запорный вентиль KV31 Ду 15*
// ============================================================
function separatorValve(input: InputData): SpecData {
  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  if (dnSteam == null) return {};

  const sepRow = findRowByDn(dnSteam, VALVES.separators);
  if (!sepRow) return {};

  const dnOutlet = sepRow['dn_outlet'];
  if (typeof dnOutlet !== 'number') return {};

  const valveRow = findRowByDn(dnOutlet, VALVES.shutoff_valves);
  if (!valveRow) return {};

  const basePrice = valveRow.price != null ? Number(valveRow.price) : undefined;

  return {
    separatorValve: {
      name: `Запорный вентиль ${valveRow.name}*`,
      qty: 3,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: valveRow.code ? String(valveRow.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 8. Фильтр IS16 Ду 15*
// ============================================================
function separatorFilter(input: InputData): SpecData {
  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  if (dnSteam == null) return {};

  const sepRow = findRowByDn(dnSteam, VALVES.separators);
  if (!sepRow) return {};

  const dnOutlet = sepRow['dn_outlet'];
  if (typeof dnOutlet !== 'number') return {};

  const filterRow = findRowByDn(dnOutlet, VALVES.filters);
  if (!filterRow) return {};

  const basePrice = filterRow.price != null ? Number(filterRow.price) : undefined;

  return {
    separatorFilter: {
      name: `Фильтр ${filterRow.name}*`,
      qty: 1,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: filterRow.code ? String(filterRow.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 9. Поплавковый конденсатоотводчик СТИМАКС A 11HC Ду 15 dP 10*
// ============================================================
function separatorTrap(input: InputData): SpecData {
  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  if (dnSteam == null) return {};

  const sepRow = findRowByDn(dnSteam, VALVES.separators);
  if (!sepRow) return {};

  const dnOutlet = sepRow['dn_outlet'];
  if (typeof dnOutlet !== 'number') return {};

  const p = input.steamFlow.steamPressureBar;
  if (p == null) return {};

  const dp: 4.5 | 10 | 14 = p <= 4.5 ? 4.5 : p <= 10 ? 10 : 14;

  const trapRow = VALVES.steam_traps.rows.find(
    (r) => r.type === 'A 11HC' && r.dn === dnOutlet && r.dp === dp,
  );
  if (!trapRow) return {};

  const basePrice = trapRow.price != null ? Number(trapRow.price) : undefined;

  return {
    separatorTrap: {
      name: trapRow.name,
      qty: 1,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: trapRow.code ? String(trapRow.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 10. Обратный клапан CVS40 Ду 15*
// ============================================================
function separatorCheck(input: InputData): SpecData {
  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  if (dnSteam == null) return {};

  const sepRow = findRowByDn(dnSteam, VALVES.separators);
  if (!sepRow) return {};

  const dnOutlet = sepRow['dn_outlet'];
  if (typeof dnOutlet !== 'number') return {};

  const checkRow = findRowByDn(dnOutlet, VALVES.check_valves);
  if (!checkRow) return {};

  const basePrice = checkRow.price != null ? Number(checkRow.price) : undefined;

  return {
    separatorCheck: {
      name: `Обратный клапан ${checkRow.name}*`,
      qty: 1,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: checkRow.code ? String(checkRow.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 11. Фильтр IS16 Ду 32*
// ============================================================
function supplyFilter(input: InputData): SpecData {
  const dn = input.results.steamPipe?.standardDiameterMm;
  if (dn == null) return {};

  const row = findRowByDn(dn, VALVES.filters);
  if (!row) return {};

  const basePrice = row.price != null ? Number(row.price) : undefined;

  return {
    supplyFilter: {
      name: `Фильтр ${row.name}*`,
      qty: 1,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 12. Регулирующий клапан VFS-2R Ду 25 KVs 10
// ============================================================
function controlValve(input: InputData): SpecData {
  const valveType = input.controlValve.valveType;
  if (!valveType) return {};

  const dn = input.controlValve.valveDu;
  if (dn == null || dn === '') return {};

  let table: CatalogTable;
  switch (valveType) {
    // case 'KM125F':
    //   table = REGULATING.KM125F_analog;
    //   break;
    // case 'KM125F_pneu':
    //   table = REGULATING.KM125F_pneumatic;
    //   break;
    // case 'KM225F':
    //   table = REGULATING.KM225F_analog_PSL;
    //   break;
    case 'VFS-2R':
      table = REGULATING['VFS-2R'];
      break;
    default:
      return {};
  }

  const row = findRowByDn(dn, table);
  if (!row) return {};

  let price = row.price != null ? Number(row.price) : undefined;
  if(price!=null && valveType != undefined &&
    valveType != 'VFS-2R'
  ) price = price * 1.05 * 1.22 * 3.5

  return {
    controlValve: {
      name: `Регулирующий клапан ${row.name}`,
      qty: 1,
      price: price != null ? price : undefined,
      code: row.code ? String(row.code) : undefined,
      type: valveType,
      vendor: 'РИДАН'
    },
  };
}

// ============================================================
// 13. Электропривод AMV-1800R , 220V, импульсное управление
// ============================================================
function actuator(input: InputData): SpecData {
  const name = input.results.controlValve?.actuatorName;
  if (!name) return {};

  const voltage = input.controlValve.actuatorVoltage;
  const control = input.controlValve.actuatorControl;

  const controlRu =
    control === 'impulse' ? 'импульсное'
    : control === 'analog' ? 'аналоговое'
    : control;

  const parts: string[] = [`Электропривод ${name}`];
  if (voltage != null && voltage !== '') parts.push(`${voltage}V`);
  if (controlRu) parts.push(`${controlRu} управление`);

  return {
    actuator: {
      name: parts.join(', '),
      qty: 1,
      price: 52,
      code: input.results.controlValve?.actuatorCode
        ? String(input.results.controlValve.actuatorCode)
        : undefined,
      vendor: 'РИДАН',
      type: name
    },
  };
}

// ============================================================
// 14. Предохранительный клапан ПРЕГРАН КПП 496-01-ЗН 20x32*
// ============================================================
function safetyValve(input: InputData): SpecData {
  const dn = input.safetyValve.safetyValveDu;
  if (dn == null || dn === '') return {};

  const dnNum = typeof dn === 'number' ? dn : Number(dn);
  if (!Number.isFinite(dnNum)) return {};

  const row = VALVES.safety_valves.rows.find(
    (r) => r.dn_outlet === dnNum,
  );
  if (!row) return {};

  const basePrice = row.price != null ? Number(row.price) : undefined;
  return {
    safetyValve: {
      name: `Предохранительный клапан ${row.name}*`,
      qty: 1,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ'
    },
  };
}

// ============================================================
// 15. Шаровой кран BV15*
// ============================================================
function vacuumBallValve(input: InputData): SpecData {
  const row = VALVES.vacuum_breakers.rows.find(
    (r) => r.type === 'Шаровой кран',
  );
  if (!row) return {};

  const qty = input.scheme.secondary.hxReserve === 'none' ? 1 : 2;

  return {
    vacuumBallValve: {
      name: `Шаровой кран ${row.name}*`,
      qty,
      price: row.price != null ? Number(row.price) : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 16. Прерыватель вакуума VBS25-015*
// ============================================================
function vacuumBreaker(input: InputData): SpecData {
  const row = VALVES.vacuum_breakers.rows.find(
    (r) => r.type === 'Прерыватель вакуума',
  );
  if (!row) return {};

  const qty = input.scheme.secondary.hxReserve === 'none' ? 1 : 2;

  return {
    vacuumBreaker: {
      name: `Прерыватель вакуума ${row.name}*`,
      qty,
      price: row.price != null ? Number(row.price) : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 17. Термостатический конденсатоотводчик ТК42 Ду15*
// ============================================================
function vacuumThermoTrap(input: InputData): SpecData {
  const row = VALVES.vacuum_breakers.rows.find(
    (r) => r.type === 'Термостатический конденсатоотводчик',
  );
  if (!row) return {};

  const qty = input.scheme.secondary.hxReserve === 'none' ? 1 : 2;

  return {
    vacuumThermoTrap: {
      name: `Термостатический конденсатоотводчик ${row.name}*`,
      qty,
      price: row.price != null ? Number(row.price) : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 18. Термометр БТ-51.220 (0-200°С) G1/2.64.1,5 100мм. L=64 мм.*
//     (на конденсатопровод)
// ============================================================
function condensateThermometer(input: InputData): SpecData {
  const dnTrap = input.results.trap?.trapDu;
  if (dnTrap == null) return {};

  let l: 64 | 100 | 150;
  if (dnTrap < 65) l = 64;
  else if (dnTrap > 250) l = 150;
  else l = 100;

  const condensateTemp = input.steamFlow.condensateTempC;
  if (condensateTemp == null) return {};

  const range: 200 | 250 = condensateTemp < 200 ? 200 : 250;

  const row = ADDITIONAL['Термометры']?.find(
    (t) => t.L === l && t['Диапазон'] === range,
  );
  if (!row) return {};

  const qty = input.scheme.primary.trapReserve === 'none' ? 1 : 2;

  return {
    condensateThermometer: {
      name: row['Наименование'],
      qty,
      price: row['Цена'] != null && typeof row['Цена'] === 'number' ? row['Цена'] : undefined,
      code: row['КОД'] ? String(row['КОД']) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 19. Запорный вентиль KV31 Ду 25*
// ============================================================
function condensateValve(input: InputData): SpecData {
  const dn = input.results.trap?.trapDu;
  if (dn == null) return {};

  const row = findRowByDn(dn, VALVES.shutoff_valves);
  if (!row) return {};

  const qty = input.scheme.primary.trapReserve === 'none' ? 3 : 6;

  const basePrice = row.price != null ? Number(row.price) : undefined;

  return {
    condensateValve: {
      name: `Запорный вентиль ${row.name}*`,
      qty,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 20. Фильтр IS16 Ду 25*
// ============================================================
function condensateFilter(input: InputData): SpecData {
  const dn = input.results.trap?.trapDu;
  if (dn == null) return {};

  const row = findRowByDn(dn, VALVES.filters);
  if (!row) return {};

  const qty = input.scheme.primary.trapReserve === 'none' ? 1 : 2;

  const basePrice = row.price != null ? Number(row.price) : undefined;

  return {
    condensateFilter: {
      name: `Фильтр ${row.name}*`,
      qty,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 21. Поплавковый конденсатоотводчик СТИМАКС A 11HC Ду 25 dP 10*
// ============================================================
function condensateTrap(input: InputData): SpecData {
  const dn = input.results.trap?.trapDu;
  if (dn == null) return {};

  const p = input.steamFlow.steamPressureBar;
  if (p == null) return {};

  const dp: 4.5 | 10 | 14 = p <= 4.5 ? 4.5 : p <= 10 ? 10 : 14;

  const row = VALVES.steam_traps.rows.find(
    (r) => r.type === 'A 12HC' && r.dn === dn && r.dp === dp,
  );
  if (!row) return {};

  const qty = input.scheme.primary.trapReserve === 'none' ? 1 : 2;

  const basePrice = row.price != null ? Number(row.price) : undefined;

  return {
    condensateTrap: {
      name: row.name,
      qty,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 22. Обратный клапан CVS40 Ду 25*
// ============================================================
function condensateCheck(input: InputData): SpecData {
  const dn = input.results.trap?.trapDu;
  if (dn == null) return {};

  const row = findRowByDn(dn, VALVES.check_valves);
  if (!row) return {};

  const qty = input.scheme.primary.trapReserve === 'none' ? 1 : 2;

  const basePrice = row.price != null ? Number(row.price) : undefined;

  return {
    condensateCheck: {
      name: `Обратный клапан ${row.name}*`,
      qty,
      price: basePrice != null ? basePrice * 1.05 * 1.22 * 3.5 : undefined,
      code: row.code ? String(row.code) : undefined,
      vendor: 'АДЛ',
    },
  };
}

// ============================================================
// 23. Теплообменник HH-19-7-TK
// ============================================================
function heatExchanger(input: InputData): SpecData {
  const name = input.pto.name;
  if (!name) return {};

  const qty = input.scheme.secondary.hxReserve === 'none' ? 1 : 2;

  return {
    heatExchanger: {
      name: `Теплообменник ${name}`,
      qty,
      price: input.pto.priceHi != null ? Number(input.pto.priceHi) : undefined,
      code: input.pto.code ? String(input.pto.code) : undefined,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 24. Воздушник BVR-R Ду/15/Ру40/Tmax120 латунь р/р
// ============================================================
function secondaryAirVent(_input: InputData): SpecData {
  const du = 15; 
  const TYPE = 'BVR-R';
  const row = findSecondaryByDu(SECONDARY['Шаровые краны']?.['BVR-R'], du);
  if (!row) return {};

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  return {
    secondaryAirVent: {
      name: `Воздушник ${row.Наименование} Ду/${du}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty: 1,
      price: row.Цена != null && typeof row.Цена === 'number' ? row.Цена : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: TYPE,
      vendor: 'РИДАН'
    },
  };
}

// ============================================================
// 25. Трехходовой кран под манометр Ду 15 Ру 40 Tmax 150
// ============================================================
function secondaryManifoldValve(input: InputData): SpecData {
  const du = 15;
  const pn = 40;
  const tmax = 150;

  // B33 + B45 + 3
  const b33 = input.scheme.secondary.hxReserve === 'none' ? 7 : 9;

  const pumpReserve = input.scheme.secondary.pumpReserve;
  const b45 =
    pumpReserve === 'none' ? 2
    : pumpReserve === '2x100' ? 4
    : 6;

  return {
    secondaryManifoldValve: {
      name: `Трехходовой кран под манометр Ду ${du} Ру ${pn} Tmax ${tmax}`,
      qty: b33 + b45 + 3,
      price: 15,
      code: '065B8316RG',
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 26. Манометр показывающий Ридан 0..10 бар. O100мм. G1/2. кл. точн. 1.5.
// ============================================================
function secondaryManometer(input: InputData): SpecData {
  const dp = input.system.designPressureBar;
  if (dp == null || dp === '') return {};

  const dpNum = typeof dp === 'number' ? dp : Number(dp);
  if (!Number.isFinite(dpNum)) return {};

  const wantedPrefix =
    dpNum <= 10
      ? 'показывающий Ридан 0..10 бар'
      : dpNum === 16
        ? 'показывающий Ридан 0..16 бар'
        : 'показывающий Ридан 0..25 бар';

  const row = ADDITIONAL['Манометры']?.find((m) =>
    m['Наименование'].startsWith(wantedPrefix),
  );
  if (!row) return {};

  // B33: по резерву ПТО
  const b33 = input.scheme.secondary.hxReserve === 'none' ? 7 : 9;

  // B45: по резерву насосов
  const pumpReserve = input.scheme.secondary.pumpReserve;
  const b45 =
    pumpReserve === 'none' ? 2
    : pumpReserve === '2x100' ? 4
    : 6;

  return {
    secondaryManometer: {
      name: `Манометр ${row['Наименование']}`,
      qty: b33 + b45,
      price: row['Цена'] != null && typeof row['Цена'] === 'number' ? row['Цена'] : undefined,
      code: row['КОД'] ? String(row['КОД']) : undefined,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 27. Термометр биметаллический O80мм 0..120С, L=150 мм. кл. точн. 1.5. IP54*
// ============================================================
function secondaryThermometer(input: InputData): SpecData {
  const hxReserve = input.scheme.secondary.hxReserve;
  const qty =
    hxReserve === 'none' ? 3
    : hxReserve === '2x100' ? 5
    : 2;

  return {
    secondaryThermometer: {
      name: 'Термометр биметаллический O80мм 0..120С, L=150 мм. кл. точн. 1.5. IP54*',
      qty,
      price: undefined,
      code: undefined,
    },
  };
}

// ============================================================
// 28. Шаровой кран BVR-R Ду/50/Ру40/Tmax120 латунь р/р
// ============================================================
function valveNameToJsonKey(valveName: string): string {
  switch (valveName) {
    case 'RIDAN_ZDM':                  return 'РИДАН-ЗДМ';
    case 'RJIP_Standard_FF':           return 'RJIP Standard FF';
    case 'RJIP_Standard_WW':           return 'RJIP Standard WW';
    case 'RJIP_Premium_FF':            return 'RJIP Premium FF (рукоятка)';
    case 'RJIP_Premium_WW':            return 'RJIP Premium WW'; // в JSON нет — вернётся undefined в таблице
    case 'RJIP_Premium_FF_Reducer_25': return 'RJIP Premium FF (Редуктор) 25 бар';
    case 'RJIP_Premium_FF_Reducer_16': return 'RJIP Premium FF (Редуктор) 16 бар';
    case 'BVR-R':                      return 'BVR-R';
    case 'BVS-R':                      return 'BVS-R';
    default:                           return valveName;
  }
}

function getSecondaryValveTable(jsonKey: string): SecondaryRow[] | undefined {
  const SK = SECONDARY['Шаровые краны'];
  const DZ = SECONDARY['Дисковые затворы'];
  switch (jsonKey) {
    case 'РИДАН-ЗДМ':                     return DZ?.['РИДАН-ЗДМ'];
    case 'BVR-R':                         return SK?.['BVR-R'];
    case 'BVS-R':                         return SK?.['BVS-R'];
    case 'RJIP Standard FF':              return SK?.['RJIP Standard FF'];
    case 'RJIP Standard WW':              return SK?.['RJIP Standard WW'];
    case 'RJIP Premium FF (рукоятка)':    return SK?.['RJIP Premium FF (рукоятка)'];
    case 'RJIP Premium FF (Редуктор) 25 бар': return SK?.['RJIP Premium FF (Редуктор) 25 бар'];
    case 'RJIP Premium FF (Редуктор) 16 бар': return SK?.['RJIP Premium FF (Редуктор) 16 бар'];
    case 'КШЧ':                           return SK?.['КШЧ'];
    default:                              return undefined;
  }
}

function secondaryBallValve(input: InputData): SpecData {
  const valveName = input.secondaryArmature.valveName;
  if (!valveName) return {};

  const du =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (du == null) return {};

  const jsonKey = valveNameToJsonKey(valveName);
  const table = getSecondaryValveTable(jsonKey);
  if (!table) return {};

  const row = findSecondaryByDu(table, du);
  if (!row) return {};

  const prefix = jsonKey === 'РИДАН-ЗДМ' ? 'Дисковый затвор' : 'Шаровой кран';

  return {
    secondaryBallValve: {
      name: formatSecondaryValveLine(prefix, row.Наименование, row, du),
      qty: 6,
      price: row.Цена != null && typeof row.Цена === 'number' ? row.Цена : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: jsonKey,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 29. Датчик температуры MBT 5250R погружной с гильзой из нерж. стали, L=100 мм, Pt1000, T=-50...+200°С, G1/2", IP65
// ============================================================
function secondaryTempSensor(input: InputData): SpecData {
  const du =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (du == null) return {};

  const l: 100 | 200 = du < 200 ? 100 : 200;

  const row = ADDITIONAL['Датчики температуры']?.find((t) => t.L === l);
  if (!row) return {};

  return {
    secondaryTempSensor: {
      name: `Датчик температуры ${row['Наименование']}`,
      qty: 1,
      price:
        row['Цена'] != null && typeof row['Цена'] === 'number'
          ? row['Цена']
          : undefined,
      code: row['КОД'] ? String(row['КОД']) : undefined,
      vendor: 'РИДАН',
      type: 'МВТ'
    },
  };
}

// ============================================================
// 30. Датчик давления MBS1700R. 4-20 мА/0-10 бар
// ============================================================
function secondaryPressSensor(input: InputData): SpecData {
  const dp = input.system.designPressureBar;
  if (dp == null || dp === '') return {};

  const dpNum = typeof dp === 'number' ? dp : Number(dp);
  if (!Number.isFinite(dpNum)) return {};

  // U4 → [0], U5 → [1], U6 → [2]
  const idx = dpNum <= 10 ? 0 : dpNum <= 16 ? 1 : 2;

  const list = ADDITIONAL['Датчики давления'];
  const row = list?.[idx];
  if (!row) return {};

  return {
    secondaryPressSensor: {
      name: row['Наименование'],
      qty: 2,
      price:
        row['Цена'] != null && typeof row['Цена'] === 'number'
          ? row['Цена']
          : undefined,
      code: row['КОД'] ? String(row['КОД']) : undefined,
      vendor: 'РИДАН'
    },
  };
}

// ============================================================
// 31. Обратный клапан NRV-R Ду/50/Ру25/Tmax110 латунь р/р
// ============================================================
function checkValveNameToJsonKey(valveName: string): string | null {
  switch (valveName) {
    case 'NRV_R':     return 'NRV-R';
    case 'RIDAN_ZOD': return 'РИДАН-ЗОД';
    case 'NVD_812R':  return 'NVD-812R';
    // на случай уже маппленных значений:
    case 'NRV-R':     return 'NRV-R';
    case 'РИДАН-ЗОД': return 'РИДАН-ЗОД';
    case 'NVD-812R':  return 'NVD-812R';
    default:          return null;
  }
}
function secondaryCheckValve(input: InputData): SpecData {
  const valveName = input.secondaryArmature.checkValveName;
  if (!valveName) return {};

  const du =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (du == null) return {};

  const jsonKey = checkValveNameToJsonKey(valveName);
  if (!jsonKey) return {};

  const table = SECONDARY['Обратные клапаны']?.[jsonKey];
  if (!table) return {};

  const row = findSecondaryByDu(table, du);
  if (!row) return {};

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  const pumpReserve = input.scheme.secondary.pumpReserve;
  const qty =
    pumpReserve === 'none' ? 1
    : pumpReserve === '2x100' ? 2
    : 3;

  return {
    secondaryCheckValve: {
      name: `Обратный клапан ${jsonKey} Ду/${du}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty,
      price: row.Цена != null && typeof row.Цена === 'number' ? row.Цена : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: jsonKey,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 32. Спускник BVR-R Ду/25/Ру40/Tmax120 латунь р/р
// ============================================================
function secondaryDrain(input: InputData): SpecData {
  const type = 'BVR-R';

  const du =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (du == null) return {};


  const row = findSecondaryByDu(SECONDARY['Шаровые краны']?.['BVR-R'], du);
  if (!row) return {};

  const duForName = du > 25 ? 25 : 15;

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  // B28: по резерву ПТО
  const b28 = input.scheme.secondary.hxReserve === 'none' ? 1 : 2;

  // B43: по резерву насосов
  const pumpReserve = input.scheme.secondary.pumpReserve;
  const b43 =
    pumpReserve === 'none' ? 1
    : pumpReserve === '2x100' ? 2
    : 3;

  return {
    secondaryDrain: {
      name: `Спускник ${row.Наименование} Ду/${duForName}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty: b28 + b43 + 1,
      price:
        row.Цена != null && typeof row.Цена === 'number'
          ? row.Цена
          : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 33. Вибровставка ZKV EPDM Ду/50/Ру16/Tmax100 - ф/ф
// ============================================================
function secondaryVibroInsert(input: InputData): SpecData {
  const duRaw =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (duRaw == null) return {};

  const du = duRaw > 25 ? duRaw : 32;

  const row = findSecondaryByDu(SECONDARY['Вибровставки']?.['ZKV'], du);
  if (!row) return {};

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  // B45: по резерву насосов
  const pumpReserve = input.scheme.secondary.pumpReserve;
  const qty =
    pumpReserve === 'none' ? 2
    : pumpReserve === '2x100' ? 4
    : 6;

  return {
    secondaryVibroInsert: {
      name: `Вибровставка ${row.Наименование} Ду/${du}/Ру${pn}/Tmax${tmax} ${material} - ${conn}`,
      qty,
      price:
        row.Цена != null && typeof row.Цена === 'number'
          ? row.Цена
          : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: 'ZKV',
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 34. Насос RMV 5-3F
// ============================================================
function pump(input: InputData): SpecData {
  const name = input.choicePump.pumpName;
  if (!name) return {};

  const code = input.choicePump.pumpCode || undefined;

  let price: number | undefined;
  if (code) {
    const row = PUMPS.find((p) => p['Артикул'] === code);
    if (row) {
      const raw = row['Цена, руб без НДС'];
      const normalized = raw.replace(/\s/g, '').replace(',', '.');
      const n = Number(normalized);
      if (Number.isFinite(n)) price = n;
    }
  }

  // B43: по резерву насосов
  const pumpReserve = input.scheme.secondary.pumpReserve;
  const qty =
    pumpReserve === 'none' ? 1
    : pumpReserve === '2x100' ? 2
    : 3;

  return {
    pump: {
      name: `Насос ${name}`,
      qty,
      price,
      code,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 35. Фильтр FVR-R Ду/50/Ру25/Tmax130 латунь р/р
// ============================================================
function filterNameToJsonKey(filterName: string): string | null {
  switch (filterName) {
    case 'FVR-R':        return 'FVR-R';
    case 'FSF':          return 'ФСФ';
    case 'FVF_Standard': return 'FVF-Standard';
    // на случай уже маппленных:
    case 'ФСФ':          return 'ФСФ';
    case 'FVF-Standard': return 'FVF-Standard';
    default:             return null;
  }
}
function secondaryFilter(input: InputData): SpecData {
  // B64: тип фильтра
  const filterName = input.secondaryArmature.filterName;
  if (!filterName) return {};

  // C64: Ду
  const du =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);
  if (du == null) return {};

  // Таблица по типу
  const jsonKey = filterNameToJsonKey(filterName);
  if (!jsonKey) return {};

  const table = SECONDARY['Фильтры']?.[jsonKey];
  if (!table) return {};

  const row = findSecondaryByDu(table, du);
  if (!row) return {};

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  return {
    secondaryFilter: {
      name: `Фильтр ${row.Наименование} Ду/${du}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty: 1,
      price:
        row.Цена != null && typeof row.Цена === 'number'
          ? row.Цена
          : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: filterName,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 36. Шаровой кран BVR-R Ду/15/Ру40/Tmax120 латунь р/р
// ============================================================
function secondaryBallValve2(input: InputData): SpecData {
  // B62: тип
  const valveName = input.makeupArmature.valveName;
  if (!valveName) return {};

  // C62: Ду подпитки
  const duMakeupRaw = input.makeUp.makeupStandardDu;
  const duMakeup =
    duMakeupRaw != null && duMakeupRaw !== '' ? Number(duMakeupRaw) : null;

  // C60: Ду вторички
  const duSecondaryRaw =
    input.results.secondaryCircuit?.secondaryStandardDuMm
    ?? (input.secondaryCircuit.secondaryStandardDu
      ? Number(input.secondaryCircuit.secondaryStandardDu)
      : null);

  // C13: Ду регулирующего клапана
  const duValveRaw = input.controlValve.valveDu;
  const duValve =
    duValveRaw != null && duValveRaw !== '' ? Number(duValveRaw) : null;

  // Какой Ду использовать для конкретного типа
  const jsonKey = valveNameToJsonKey(valveName);

  let du: number | null;
  switch (jsonKey) {
    case 'RJIP Premium FF (Редуктор) 25 бар':
      du = duSecondaryRaw;
      break;
    case 'RJIP Premium FF (Редуктор) 16 бар':
      du = duValve;
      break;
    default:
      du = duMakeup;
  }
  if (du == null || !Number.isFinite(du)) return {};

  // Таблица по типу
  const table = getSecondaryValveTable(valveName);
  if (!table) return {};

  // Строка по Ду
  const row = findSecondaryByDu(table, du);
  if (!row) return {};

  // A62: префикс
  const prefix = jsonKey === 'РИДАН-ЗДМ' ? 'Дисковый затвор' : 'Шаровой кран';

  return {
    secondaryBallValve2: {
      name: formatSecondaryValveLine(prefix, valveName, row, du),
      qty: 2,
      price: row.Цена != null && typeof row.Цена === 'number' ? row.Цена : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: valveName,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 37. Обратный клапан NRV-R Ду/15/Ру25/Tmax110 латунь р/р
// ============================================================
function secondaryCheckValve2(input: InputData): SpecData {
  // B63: тип обратного клапана
  const valveName = input.makeupArmature.checkValveName;
  if (!valveName) return {};

  // C63: Ду
  const duRaw = input.makeUp.makeupStandardDu;
  const du = duRaw != null && duRaw !== '' ? Number(duRaw) : null;
  if (du == null || !Number.isFinite(du)) return {};

  // Какой ключ искать в JSON
  const jsonKey = checkValveNameToJsonKey(valveName);
  if (!jsonKey) return {};

  const table = SECONDARY['Обратные клапаны']?.[jsonKey];
  if (!table) return {};

  const row = findSecondaryByDu(table, du);
  if (!row) return {};

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  return {
    secondaryCheckValve2: {
      name: `Обратный клапан ${row.Наименование} Ду/${du}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty: 1,
      price: row.Цена != null && typeof row.Цена === 'number' ? row.Цена : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: jsonKey,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 38. Соленоидный клапан EV220WR Ду/15/Ру16/Tmax130 латунь р/р
// ============================================================
function solenoidValve(input: InputData): SpecData {
  const duRaw = input.secondaryCircuit.secondaryStandardDu;;
  const du = duRaw != null && duRaw !== '' ? Number(duRaw) : null;
  if (du == null || !Number.isFinite(du)) return {};

  // Поиск в таблице «Соленоидные клапаны»
  const row = ADDITIONAL['Соленоидные клапаны']?.find((r) => r.Ду === du);
  if (!row) return {};

  const duForNameRaw = input.makeUp.makeupStandardDu;
  const duForNameNum =
    duForNameRaw != null && duForNameRaw !== '' ? Number(duForNameRaw) : null;
  const duForName = duForNameNum != null ? (duForNameNum <= 50 ? duForNameNum : 50) : null;

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';
  return {
    solenoidValve: {
      name: `Соленоидный клапан ${row.Наименование} Ду/${duForName}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty: 1,
      price: row.Цена ?? undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      type: 'EV220WR',
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 39. Прессостат KPI 35R, диап. настр. давл. -0,2-7,5 бар, PN17,
//     Tmax=120°C, G1/2", IP44
// ============================================================
function pressostat(input: InputData): SpecData {
  // E75: Ру по статическому давлению
  const sp = input.system.staticPressureM;
  if (sp == null) return {};

  const spNum = typeof sp === 'number' ? sp : Number(sp);
  if (!Number.isFinite(spNum)) return {};

  const wantedPn = spNum < 75 ? '7,5 бар' : '14 бар';

  // Поиск в таблице «Прессостаты»
  const row = ADDITIONAL['Прессостаты']?.find(
    (r) => r['Ру'] === wantedPn,
  );
  if (!row) return {};

  return {
    pressostat: {
      name: `Прессостат ${row['Наименование']}`,
      qty: 1,
      price:
        row['Цена'] != null && typeof row['Цена'] === 'number'
          ? row['Цена']
          : undefined,
      code: row['КОД'] ? String(row['КОД']) : undefined,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 40. Спускник BVR-R Ду/15/Ру40/Tmax120 латунь р/р
// ============================================================
function makeupDrain(input: InputData): SpecData {
  const duRaw = input.secondaryCircuit.secondaryStandardDu;;
  const du = duRaw != null && duRaw !== '' ? Number(duRaw) : null;
  if (du == null || !Number.isFinite(du)) return {};

  // Таблица BVR-R
  const row = findSecondaryByDu(SECONDARY['Шаровые краны']?.['BVR-R'], du);
  if (!row) return {};

  const pn = row.Ру ?? '';
  const tmax = row.Tmax ?? '';
  const material = row.Материал ?? '';
  const conn = row.Присоед ?? '';

  const duForNameRaw = input.makeUp.makeupStandardDu;
  const duForNameNum =
    duForNameRaw != null && duForNameRaw !== '' ? Number(duForNameRaw) : null;
  const duForName =
    duForNameNum != null && Number.isFinite(duForNameNum)
      ? (duForNameNum > 25 ? 25 : 15)
      : null;

  return {
    makeupDrain: {
      name: `Спускник ${row.Наименование} Ду/${duForName}/Ру${pn}/Tmax${tmax} ${material} ${conn}`,
      qty: 1,
      price:
        row.Цена != null && typeof row.Цена === 'number'
          ? row.Цена
          : undefined,
      code: row.КОД ? String(row.КОД) : undefined,
      vendor: 'РИДАН',
    },
  };
}

// ============================================================
// 41. Контроль сварных соединений согласно РД 153-34.1-003-1
// ============================================================
function uzk(input: InputData): SpecData {
  const dn = input.results.steamPipe?.standardDiameterMm;
  if (dn == null) return {};

  const price = dn <= 80 ? 2941.18 : dn >= 200 ? 8823.53 : 5882.35;

  return {
    uzk: {
      name: 'Контроль сварных соединений согласно РД 153-34.1-003-1',
      qty: 1,
      price: price,
      code: 'tstpipe',
    },
  };
}

// ============================================================
// 42. Трубопровод ТС стандарт из черной стали СТ20
//     (ГОСТ10704-91, ГОСТ3262-75)
// ============================================================
function pipeTs(_input: InputData): SpecData {
  return {
    pipeTs: {
      name: 'Трубопровод ТС стандарт из черной стали СТ20 (ГОСТ10704-91, ГОСТ3262-75)',
      qty: 1,
      price: undefined,
      code: undefined,
    },
  };
}

// ============================================================
// 43. Трубопровод СО/СВ стандарт из оцинкованной стали СТ20
//     (ГОСТ10704-91, ГОСТ3262-75)
// ============================================================
function pipeSosv(_input: InputData): SpecData {
  return {
    pipeSosv: {
      name: 'Трубопровод СО/СВ стандарт из оцинкованной стали СТ20 (ГОСТ10704-91, ГОСТ3262-75)',
      qty: 1,
      price: undefined,
      code: undefined,
    },
  };
}