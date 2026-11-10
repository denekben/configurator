// src/core/tabFieldMap.ts

import type { InputData } from './types';

/**
 * Список путей (dot-notation) к полям InputData, которые редактирует каждая вкладка.
 * Ключи должны совпадать с key из NAV_GROUPS в InputForm.
 *
 * ВАЖНО: сюда надо включать ВСЕ поля, которые видны на вкладке,
 * включая «глобальные» (system.*, steamFlow.*, steamThermo.*) и селекты,
 * которые пишут в results.* (например, results.trapDu).
 * Иначе «Сбросить данные» на этой вкладке их не очистит.
 */
export const TAB_FIELDS: Record<string, string[]> = {
  global: [
    'steamFlow.steamTempC',
    'steamFlow.steamPressureBar',
    'steamFlow.condensateTempC',
    'steamFlow.condensateLinePressureBar',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
    'steamThermo.specificVolumeSteam',
    'steamThermo.specificVolumeAfterValve',
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    'system.hydraulicLossM',
    'system.staticPressureM',
    'system.systemVolumeL',
    'system.designPressureBar',
  ],
  scheme: [
    'scheme.hasSeparator',
    'scheme.hasAccountingPrimary',
    'scheme.trapReserve',
    'scheme.hxReserve',
    'scheme.pumpReserve',
    'scheme.hasAccountingSecondary',
    'scheme.makeupConfig',
    'scheme.hasExpansionTank',
    'scheme.aupdConfig',
  ],

  'steam-pipe': [
    'steamPipe.mode',
    'steamPipe.steamSpeedMs',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
    'steamThermo.specificVolumeSteam',
    // ручной Ду (хранится в results)
    'results.standardDiameterMm',
  ],

  trap: [
    'condensateTrap.mode',
    'condensateTrap.trapReserveFactor',
    // селекты ручного режима (пишут в results.*)
    'results.trapDu',
    'results.trapDesignDeltaP',
    'results.trapTypeDeltaP',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'steamFlow.steamPressureBar',
    'steamFlow.condensateLinePressureBar',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
  ],

  'control-valve': [
    'controlValve.mode',
    'controlValve.valveDeltaPAssumed',
    'controlValve.valveType',
    'controlValve.valveDu',
    'controlValve.actuatorControl',
    'controlValve.actuatorVoltage',
    'controlValve.actuatorSuSd',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'steamFlow.steamPressureBar',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
  ],

  'safety-valve': [
    'safetyValve.mode',
    'safetyValve.safetyValveDu',
    // если на вкладке видны глобальные поля — добавь их сюда:
    // 'system.loadKw',
    // 'steamFlow.steamPressureBar',
    // 'steamThermo.enthalpySteam',
    // 'steamThermo.enthalpyCondensate',
    // 'steamThermo.specificVolumeSteam',
  ],

  secondary: [
    'secondaryCircuit.mode',
    'secondaryCircuit.secondaryPreliminarySpeed',
    'secondaryCircuit.secondaryStandardDu',
    'secondaryCircuit.editStandardDu',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
  ],

    pumps: [
    'pumps.mode',
    'pumps.pumpCount',
    'pumps.hxLossM',
    'pumps.reserveM',
    'pumps.extraLossM',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    'system.hydraulicLossM',
    ],

    makeup: [
    'makeUp.mode',
    'makeUp.makeupVolumeCoef',
    'makeUp.makeupPreliminarySpeed',
    'makeUp.makeupStandardDu',
    'makeUp.editStandardDu',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'system.systemVolumeL',
    ],

    'arm-secondary': [
    'secondaryArmature.mode',
    'secondaryArmature.connectionType',
    'secondaryArmature.valveName',
    'secondaryArmature.checkValveName',
    'secondaryArmature.filterName',
    // поле Ду — то же, что на вкладке «Вторичный контур» (пишет в secondaryCircuit)
    'secondaryCircuit.secondaryStandardDu',
    'secondaryCircuit.editStandardDu',
    // глобальные поля, отображаемые в авторежиме
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    ],

    'arm-makeup': [
    'makeupArmature.mode',
    'makeupArmature.connectionType',
    'makeupArmature.valveName',
    'makeupArmature.checkValveName',
    // поля подпитки, отображаемые на вкладке
    'makeUp.makeupVolumeCoef',
    'makeUp.makeupPreliminarySpeed',
    'makeUp.makeupStandardDu',
    'makeUp.editStandardDu',
    // глобальные поля, отображаемые на вкладке
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    'system.hydraulicLossM',
    ],

  'pump-choice': [
    'choicePump.pumpName',
    'choicePump.pumpCode',
    'choicePump.headM',
    'choicePump.flowM3h',
  ],

  pto: [
    'pto.name',
    'pto.code',
    'pto.reserve',
    'pto.primaryFlow',
    'pto.secondaryFlow',
    'pto.primaryLoss',
    'pto.secondaryLoss',
    'pto.priceHi',
    'pto.margin',
  ],

  design: [
    'design.systemName',
    'design.objectName',
    'design.author',
    'design.taskAuthor',
    'design.taskAuthorPhone',
    'design.calcNumber',
    'design.schemeKind',
  ],
};

/** Возвращает пустое значение для конкретного пути на основе EMPTY_INPUT. */
export function getEmptyValueForPath(
  emptyInput: InputData,
  path: string,
): unknown {
  const parts = path.split('.');
  let cur: unknown = emptyInput;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}