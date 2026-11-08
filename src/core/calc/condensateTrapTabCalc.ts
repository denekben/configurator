import trapTable from '../../data/Данные_для_конденсатоотводчика.json';

export interface TrapDataBlock {
  title: string | null;
  dn: string; // "Ду25", "Ду40", "Ду50"
  header: {
    columns: string[]; // ["0.1", "0.3", ..., "14"]
  };
  rows: {
    type: string; // "4.5", "10", "14"
    values: (number | null)[];
  }[];
}

export interface TrapTableRow {
  deltaPType: string; // "4.5 бар"
  capacity: number | null; // Расход
}

/**
 * Возвращает данные для таблицы 3x2 (Тип перепада | Расход)
 * @param du Выбранный Ду (25, 40, 50)
 * @param selectedDeltaP Выбранный расчетный перепад (0.1, 0.3 ... 14)
 */
export function getTrapSelectionTable(du: number, selectedDeltaP: number): TrapTableRow[] {
  const blocks = (trapTable as any).blocks as TrapDataBlock[];
  
  // 1. Ищем блок по Ду
  const dnString = `Ду${du}`;
  const block = blocks.find(b => b.dn === dnString);
  if (!block) return [];

  // 2. Находим индекс столбца, соответствующего выбранному перепаду
  const dpString = selectedDeltaP.toString();
  const colIndex = block.header.columns.indexOf(dpString);
  
  if (colIndex === -1) {
    // Если такого перепада нет в таблице, возвращаем пустые значения
    return block.rows.map(row => ({ deltaPType: `${row.type} бар`, capacity: null }));
  }

  // 3. Формируем строки для таблицы
  return block.rows.map(row => ({
    deltaPType: `${row.type} бар`,
    capacity: row.values[colIndex]
  }));
}

/**
 * Возвращает пропускную способность для конкретного типа (4.5, 10, 14)
 * по выбранному Ду и расчетному перепаду.
 */
export function getSelectedTrapCapacity(du: number, designDeltaP: number, typeDeltaP: number): number | null {
  const table = getTrapSelectionTable(du, designDeltaP);
  const row = table.find(r => r.deltaPType === `${typeDeltaP} бар`);
  return row ? row.capacity : null;
}