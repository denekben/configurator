// src/core/defaults.ts

import type { InputData } from './types';

/**
 * «Пустой» дефолт: все поля обнулены.
 * Используется при сбросе формы, чтобы сразу показать обязательные предупреждения.
 */
export const EMPTY_INPUT: InputData = {
  calcMode: {
    calcMode: '',
  },
  steamFlow: {
    steamTempC: null,
    steamPressureBar: null,
    condensateTempC: null,
    condensateLinePressureBar: null,
  },
  steamThermo: {
    enthalpySteam: null,
    enthalpyCondensate: null,
    specificVolumeSteam: null,
    specificVolumeAfterValve: null,
  },
  system: {
    loadKw: null,
    supplyTempC: null,
    returnTempC: null,
    hydraulicLossM: null,
    staticPressureM: null,
    systemVolumeL: null,
    designPressureBar: '',
  },
  scheme: {
    hasSeparator: '',
    hasAccountingPrimary: '',
    trapReserve: '',

    hxReserve: '',
    pumpReserve: '',
    hasAccountingSecondary: '',

    makeupConfig: '',
    hasExpansionTank: '',
    aupdConfig: '',
  },
  pumps: {
    pumpCount: null,
    hxLossM: null,
    reserveM: null,
    extraLossM: null,
    mode: '',
  },
  steamPipe: {
    steamSpeedMs: null,
    mode: '',
  },
  condensateTrap: {
    trapReserveFactor: null,
    trapDu: '',
    trapDesignDeltaP: '',
    trapSelectedDeltaP: '',
    mode: '',
  },
  controlValve: {
    valveDeltaPAssumed: null,
    valveType: '',
    valveDu: '',
    actuatorControl: '',
    actuatorVoltage: '',
    actuatorSuSd: '',
    mode: '',
  },
  safetyValve: {
    safetyValveDu: '',
    mode: '',
  },
  secondaryCircuit: {
    mode: '',
    secondaryPreliminarySpeed: null,
    secondaryStandardDu: '',
    editStandardDu: false,
  },
  makeUp: {
    makeupVolumeCoef: '',
    makeupPreliminarySpeed: null,
    makeupStandardDu: '',
    editStandardDu: false,
    mode: '',
  },
  secondaryArmature: {
    connectionType: '',
    valveName: '',
    checkValveName: '',
    filterName: '',
    mode: '',
  },
  makeupArmature: {
    connectionType: '',
    valveName: '',
    checkValveName: '',
    mode: '',
  },
  pto: {
    name: '',
    code: '',
    reserve: '',
    primaryFlow: null,
    secondaryFlow: null,
    primaryLoss: null,
    secondaryLoss: null,
    priceHi: null,
    margin: null,
  },
  choicePump: {
    pumpName: '',
    pumpCode: '',
    headM: null,
    flowM3h: null,
  },
  design: {
    systemName: '',
    objectName: '',
    author: '',
    taskAuthor: '',
    taskAuthorPhone: '',
    calcNumber: '',
    schemeKind: '',
  },
  results: {},
};

/**
 * Рабочий дефолт — с реальными значениями.
 * Оставлен для обратной совместимости (если где-то ещё используется).
 */
export const DEFAULT_INPUT: InputData = {
  calcMode: {
    calcMode: 'manual',
  },
  steamFlow: {
    steamTempC: 158,
    steamPressureBar: 4.8,
    condensateTempC: 90,
    condensateLinePressureBar: 0.3,
  },
  steamThermo: {
    enthalpySteam: 2762.8,
    enthalpyCondensate: 576.33,
    specificVolumeSteam: 0.272462,
    specificVolumeAfterValve: 0.789827,
  },
  system: {
    loadKw: 149,
    supplyTempC: 90,
    returnTempC: 65,
    hydraulicLossM: 6,
    staticPressureM: 1,
    designPressureBar: 10,
  },
  scheme: {
    hasSeparator: 'yes',
    hasAccountingPrimary: 'yes',
    trapReserve: '2x50',

    hxReserve: '2x100',
    pumpReserve: '3x50',
    hasAccountingSecondary: 'yes',

    makeupConfig: 'solenoid',
    hasExpansionTank: 'no',
    aupdConfig: 'none',
  },
  pumps: {
    pumpCount: 1,
    hxLossM: 2.769,
    reserveM: 2,
    extraLossM: 0,
    mode: 'auto',
  },
  steamPipe: {
    steamSpeedMs: 25,
    mode: 'auto',
  },
  condensateTrap: {
    trapReserveFactor: 2.5,
    trapDu: '25',
    trapDesignDeltaP: '4.5',
    trapSelectedDeltaP: '10',
    mode: 'auto',
  },
  controlValve: {
    valveDeltaPAssumed: 0.3,
    valveType: 'VFS-2R',
    valveDu: '25',
    actuatorControl: 'impulse',
    actuatorVoltage: '220',
    actuatorSuSd: 'no_spring',
    mode: 'auto',
  },
  safetyValve: {
    safetyValveDu: '20',
    mode: 'auto',
  },
  secondaryCircuit: {
    mode: 'auto',
    secondaryPreliminarySpeed: 0.8,
    secondaryStandardDu: '40',
    editStandardDu: false,
  },
  makeUp: {
    makeupVolumeCoef: '15',
    makeupPreliminarySpeed: 0.8,
    makeupStandardDu: '15',
    editStandardDu: false,
    mode: 'auto',
  },
  secondaryArmature: {
    connectionType: 'thread',
    valveName: 'BVR-R',
    checkValveName: 'NRV_R',
    filterName: 'FVR-R',
    mode: 'auto',
  },
  makeupArmature: {
    connectionType: 'thread',
    valveName: 'BVR-R',
    checkValveName: 'NRV_R',
    mode: 'auto',
  },
  pto: {
    name: 'HH-19-7-TK',
    code: 'w203123719',
    reserve: 'none',
    primaryFlow: 0.24,
    secondaryFlow: 5.425,
    primaryLoss: 0.402,
    secondaryLoss: 2.769,
    priceHi: 1500,
    margin: 96.8,
  },
  choicePump: {
    pumpName: 'RMV 5-3F',
    pumpCode: '015P2164',
    headM: 5.425,
    flowM3h: 11,
  },
  design: {
    systemName: 'Система вентиляции',
    objectName: 'Насосная при прудах',
    author: 'Снежков В.А.',
    taskAuthor: 'Сизых А.С.',
    taskAuthorPhone: '88005553535',
    calcNumber: 'N1410261476',
    schemeKind: 'scheme1', 
  },
  results: {},
};