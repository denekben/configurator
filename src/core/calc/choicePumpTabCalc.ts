// Импортируем JSON с насосами (Vite умеет)
import pumpData from '../../data/Компоненты_НАСОСЫ.json';

/** Строка каталога насосов. */
export interface PumpCatalogItem {
  code: string;        // Артикул
  model: string;       // Модель
  powerW: string;      // Мощность, Вт
  lengthMm: string;    // Монтажная длина, мм
  connection: string;  // Трубное присоединение
  material: string;    // Материал корпуса
  speeds: string;      // Кол-во скоростей
  voltage: string;     // Напряжение питания
  priceRub: string;    // Цена, руб без НДС
}

/**
 * Нормализация строки для поиска:
 *  - toLowerCase
 *  - убираем лишние пробелы
 *  - убираем кавычки (чтобы G1" и G1 совпадали, если понадобится)
 */
function norm(s: string | undefined | null): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/["'`]/g, '')
    .trim();
}

/**
 * Преобразует «сырой» объект из JSON в PumpCatalogItem.
 * Ключи в JSON — на русском, поэтому маппим вручную.
 */
function mapRow(raw: Record<string, string>): PumpCatalogItem {
  return {
    code: raw['Артикул'] ?? '',
    model: raw['Модель'] ?? '',
    powerW: raw['Мощность, Вт'] ?? '',
    lengthMm: raw['Монтажная длина, мм'] ?? '',
    connection: raw['Трубное присоединение'] ?? '',
    material: raw['Материал корпуса'] ?? '',
    speeds: raw['Кол-во скоростей'] ?? '',
    voltage: raw['Напряжение питания'] ?? '',
    priceRub: raw['Цена, руб без НДС'] ?? '',
  };
}

/** Полный каталог насосов, приведённый к PumpCatalogItem. */
export const PUMP_CATALOG: PumpCatalogItem[] = (pumpData as Record<string, string>[])
  .map(mapRow)
  .filter(r => r.code || r.model);

/** Поиск по названию (модели). Возвращает до `limit` совпадений. */
export function searchPumpsByName(query: string, limit = 20): PumpCatalogItem[] {
  const q = norm(query);
  if (!q) return PUMP_CATALOG.slice(0, limit);
  return PUMP_CATALOG
    .filter(r => norm(r.model).includes(q))
    .slice(0, limit);
}

/** Поиск по коду (артикулу). Возвращает до `limit` совпадений. */
export function searchPumpsByCode(query: string, limit = 20): PumpCatalogItem[] {
  const q = norm(query);
  if (!q) return PUMP_CATALOG.slice(0, limit);
  return PUMP_CATALOG
    .filter(r => norm(r.code).includes(q))
    .slice(0, limit);
}

/** Найти строку по точному коду (для обратной синхронизации). */
export function findPumpByCode(code: string): PumpCatalogItem | undefined {
  const q = norm(code);
  if (!q) return undefined;
  return PUMP_CATALOG.find(r => norm(r.code) === q);
}

/** Найти строку по точной модели (для обратной синхронизации). */
export function findPumpByName(model: string): PumpCatalogItem | undefined {
  const q = norm(model);
  if (!q) return undefined;
  return PUMP_CATALOG.find(r => norm(r.model) === q);
}