// src/core/spec/lookup.ts

/** Одна строка каталога. */
export interface CatalogRow {
  name: string;
  dn?: number | string;
  code?: string | null;
  price?: number | string | null;
  [extra: string]: unknown;
}

/** Таблица каталога. */
export interface CatalogTable {
  header: string[];
  rows: CatalogRow[];
}

/** Структура JSON каталога «Компоненты на ПАР». */
export interface SteamCatalog {
  sheet_name: string;
  sheet_index_num: number;
  sections: {
    regulating_valves: {
      title: string;
      KM125F_analog: CatalogTable;
      KM125F_pneumatic: CatalogTable;
      KM225F_analog_PSL: CatalogTable;
      'VFS-2R': CatalogTable;
    };
    valves_fittings: {
      title: string;
      shutoff_valves: CatalogTable;
      check_valves: CatalogTable;
      filters: CatalogTable;
      separators: CatalogTable;
      vacuum_breakers: CatalogTable;
      steam_traps: CatalogTable;
      safety_valves: CatalogTable;
      manometer_cocks: CatalogTable;
    };
  };
}

/**
 * Ищет строку в таблице по значению поля `key`.
 * По умолчанию ищет по `dn` (Ду).
 *
 * - Приводит `dn` к строке для сравнения (числа — без «.0»).
 * - Возвращает `undefined`, если не нашёл.
 */
export function findRowBy<K extends keyof CatalogRow>(
  key: K,
  value: CatalogRow[K],
  table: CatalogTable,
): CatalogRow | undefined {
  const normalizedValue = normalizeForCompare(value);

  return table.rows.find((row) => {
    const rowValue = normalizeForCompare(row[key]);
    return rowValue === normalizedValue;
  });
}

/** Ищет строку по `dn` (Ду). */
export function findRowByDn(
  dn: number | string | null | undefined,
  table: CatalogTable,
): CatalogRow | undefined {
  if (dn == null) return undefined;
  return findRowBy('dn', dn, table);
}

/**
 * Возвращает значение поля `field` из найденной строки.
 * Если строки нет — возвращает `undefined`.
 */
export function pickField<K extends keyof CatalogRow>(
  table: CatalogTable,
  dn: number | string | null | undefined,
  field: K,
): CatalogRow[K] | undefined {
  const row = findRowByDn(dn, table);
  return row?.[field];
}

/** Приводит значение к строке для сравнения. */
function normalizeForCompare(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') return String(v);
  return String(v).trim();
}