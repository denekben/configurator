// src/core/spec/buildLod.ts

import type { InputData } from '../types';
import {
  findRowByDn,
  type SteamCatalog,
} from './lookup';

import steamCatalogJson from '../../data/Компоненты_на_ПАР.json';

const STEAM_CATALOG = steamCatalogJson as unknown as SteamCatalog;
const VALVES = STEAM_CATALOG.sections.valves_fittings;

export type LodData = Record<string, string | number | undefined>;

export function buildLod(input: InputData): LodData {
  const out: LodData = {};

  const dnSteam = input.results.steamPipe?.standardDiameterMm;
  if (dnSteam != null) {
    const sepRow = findRowByDn(dnSteam, VALVES.separators);
    if (sepRow && typeof sepRow['dn_outlet'] === 'number') {
      out.steamPipeDu = sepRow['dn_outlet'];
    }
  }

  return out;
}