// src/core/docx/flattenForTemplate.ts

import type { InputData } from '../types';
import { buildSpec } from './buildSpec';
import { buildLod } from './buildLod';
import { buildPrice } from './buildPrice';
import { buildDate } from './buildDate';

function round4(n: number): number {
  if (!Number.isFinite(n)) return n;
  return Math.round(n * 10000) / 10000;
}

export function flattenForTemplate(
  input: InputData,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};

  // today.* и прочие скаляры
  Object.assign(out, buildDate());

  const walk = (value: unknown, prefix: string) => {
    if (value === null || value === undefined) {
      if (prefix) out[prefix] = '';
      return;
    }
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}.${k}` : k);
      }
      return;
    }
    out[prefix] =
      typeof value === 'number'
        ? round4(value)
        : (value as string | number | boolean);
  };

  walk(input, '');

  // === Спецификация (sp.*) ===
  const spec = buildSpec(input);
  for (const [key, component] of Object.entries(spec)) {
    if (!component) continue;
    for (const [field, value] of Object.entries(component)) {
      if (value === undefined || value === null) continue;
      out[`sp.${field}.${key}`] =
        typeof value === 'number'
          ? round4(value)
          : (value as string | number | boolean);
    }
  }

  // === ЛОД (lod.*) ===
  const lod = buildLod(input);
  for (const [field, value] of Object.entries(lod)) {
    if (value === undefined || value === null) continue;
    out[`lod.${field}`] =
      typeof value === 'number'
        ? round4(value)
        : (value as string | number | boolean);
  }

  // === Цена (price.*) ===
  const price = buildPrice(input);
  out['price.total'] = round4(price.total);
  out['price.totalWithVat'] = round4(price.totalWithVat);
  for (const [field, value] of Object.entries(price.breakdown)) {
    if (value === undefined || value === null) continue;
    out[`price.${field}`] =
      typeof value === 'number'
        ? round4(value)
        : (value as string | number | boolean);
  }

  return out;
}