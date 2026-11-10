// src/app/collectMissing.ts

import type { InputData } from '../core/types';

/**
 * «Ручные» поля, которые физически лежат в results.*, но по смыслу — ввод пользователя.
 * Проверяем их только при выполнении условия `when`.
 */
const CONDITIONAL_RESULT_FIELDS: Array<{
  path: string;
  when: (input: InputData) => boolean;
}> = [
  {
    path: 'standardDiameterMm',
    when: (input) => input.steamPipe.mode === 'manual',
  },
  {
    path: 'trapDu',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
  {
    path: 'trapDesignDeltaP',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
  {
    path: 'trapTypeDeltaP',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
  {
    path: 'trapActualCapacityKgH',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
];

/**
 * Собирает «служебные» пути незаполненных полей InputData.
 * Возвращает пути в dot-notation, например `system.loadKw`, `results.trapDu`.
 */
export function collectMissing(input: InputData): string[] {
  const SKIP_KEYS = new Set(['results', 'mode', 'editStandardDu']);
  const missing: string[] = [];

  const isEmptyValue = (v: unknown): boolean =>
    v === undefined ||
    v === null ||
    v === '' ||
    (typeof v === 'number' && Number.isNaN(v));

  const walk = (obj: unknown, prefix: string) => {
    if (isEmptyValue(obj)) {
      missing.push(prefix);
      return;
    }
    if (typeof obj !== 'object') return;

    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (SKIP_KEYS.has(k)) continue;
      const path = prefix ? `${prefix}.${k}` : k;
      walk(v, path);
    }
  };

  for (const [k, v] of Object.entries(input)) {
    if (k === 'results') continue;
    walk(v, k);
  }

  for (const { path, when } of CONDITIONAL_RESULT_FIELDS) {
    if (!when(input)) continue;
    const value = (input.results as Record<string, unknown>)?.[path];
    if (isEmptyValue(value)) {
      missing.push(`results.${path}`);
    }
  }

  return missing;
}