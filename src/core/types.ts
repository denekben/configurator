// src/core/types.ts

// ==========================================
// ВХОДНЫЕ ДАННЫЕ (InputData)
// ==========================================

export interface CalcModeParams {
  calcMode: 'auto' | 'manual' | '';
}

export interface SteamFlowParams {
  steamTempC: number | null;
  steamPressureBar: number | null;
  condensateTempC: number | null;
  condensateLinePressureBar: number | null;
}

export interface SteamThermoParams {
  enthalpySteam: number | null;
  enthalpyCondensate: number | null;
  specificVolumeSteam: number | null;
  specificVolumeAfterValve: number | null;
}

export interface SystemParams {
  loadKw: number | null;
  supplyTempC: number | null;
  returnTempC: number | null;
  hydraulicLossM: number | null;
  staticPressureM?: number | null;
  systemVolumeL?: number | null;
  makeupPressureM?: number | null;
  designPressureBar: number | string | null;
}

export interface SchemePrimaryParams {
  hasSeparator: 'yes' | 'no' | '';
  hasAccountingPrimary: 'yes' | 'no' | 'none' | '';
  trapReserve: '2x100' | '2x75' | '2x50' | 'none' | '';
}

export interface SchemeSecondaryParams {
  hxReserve: '2x100' | '2x75' | '2x50' | 'none' | '';
  pumpReserve: '3x50' | '2x100' | 'none' | '';
  hasAccountingSecondary: 'yes' | 'no' | 'none' | '';
}

export interface SchemeMakeupParams {
  makeupConfig:
    | 'solenoid'
    | 'solenoid_bypass'
    | 'solenoid_pump_1x100'
    | 'solenoid_pump_1x100_bypass'
    | 'solenoid_pumps_2x100'
    | 'solenoid_pumps_2x100_bypass'
    | 'pump_1x100'
    | 'pumps_2x100'
    | '';
  hasExpansionTank: 'yes' | 'no' | '';
  aupdConfig: 'none' | 'aupd' | 'aupdz' | '';
}

export interface SchemeParams {
  primary: SchemePrimaryParams;
  secondary: SchemeSecondaryParams;
  makeup: SchemeMakeupParams;
}

export interface PumpsParams {
  pumpCount: number | null;
  hxLossM: number | null;
  reserveM: number | null;
  extraLossM: number | null;
  mode: 'auto' | 'manual' | '';
}

export interface SteamPipeParams {
  steamSpeedMs: number | null;
  mode: 'auto' | 'manual' | '';
}

export interface CondensateTrapParams {
  trapReserveFactor: number | null;
  trapDu: number | string | null;
  trapDesignDeltaP: number | string | null;
  trapSelectedDeltaP: number | string | null;
  mode: 'auto' | 'manual' | '';
}

export interface ControlValveParams {
  valveDeltaPAssumed: number | null;
  valveType: 'KM125F' | 'KM125F_pneu' | 'KM225F' | 'VFS-2R' | '';
  valveDu: number | string | null;
  actuatorControl: 'impulse' | 'analog' | '';
  actuatorVoltage: 24 | 220 | string | null;
  actuatorSuSd: 'no_spring' | 'spring' | '';
  mode: 'auto' | 'manual' | '';
}

export interface SafetyValveParams {
  safetyValveDu: number | string | null;
  mode: 'auto' | 'manual' | '';
}

export interface SecondaryCircuitParams {
  secondaryPreliminarySpeed: number | null;
  secondaryStandardDu: number | string | null;
  editStandardDu?: boolean;
  mode: 'auto' | 'manual' | '';
}

export interface MakeUpParams {
  makeupVolumeCoef: number | string | null;
  makeupPreliminarySpeed: number | null;
  makeupStandardDu: number | string | null;
  editStandardDu?: boolean;
  mode: 'auto' | 'manual' | '';
}

export interface ChoiceSecondaryArmatureParams {
  connectionType: 'thread' | 'weld' | 'flange' | 'interflange' | '';
  valveName:
    | 'BVR-R'
    | 'BVS-R'
    | 'RJIP_Standard_FF'
    | 'RJIP_Standard_WW'
    | 'RJIP_Premium_FF'
    | 'RJIP_Premium_WW'
    | 'RJIP_Premium_FF_Reducer_25'
    | 'RJIP_Premium_FF_Reducer_16'
    | 'RIDAN_ZDM'
    | '';
  checkValveName: 'RIDAN_ZOD' | 'NVD_812R' | 'NRV_R' | '';
  filterName: 'FSF' | 'FVR-R' | 'FVF_Standard' | '';
  mode: 'auto' | 'manual' | '';
}

export interface ChoiceMakeupArmatureParams {
  connectionType: 'thread' | 'weld' | 'flange' | 'interflange' | '';
  valveName:
    | 'BVR-R'
    | 'BVS-R'
    | 'RJIP_Standard_FF'
    | 'RJIP_Standard_WW'
    | 'RJIP_Premium_FF'
    | 'RJIP_Premium_WW'
    | 'RJIP_Premium_FF_Reducer_25'
    | 'RJIP_Premium_FF_Reducer_16'
    | 'RIDAN_ZDM'
    | '';
  checkValveName: 'RIDAN_ZOD' | 'NVD_812R' | 'NRV_R' | '';
  mode: 'auto' | 'manual' | '';
}

export interface ChoicePtoParams {
  name: string;
  code: string;
  reserve: 'none' | '100' | '75' | '50' | '';
  primaryFlow: number | null;
  secondaryFlow: number | null;
  primaryLoss: number | null;
  secondaryLoss: number | null;
  priceHi: number | null;
  margin: number | null;
}

export interface ChoicePumpParams {
  pumpName: string;
  pumpCode: string;
  headM: number | null;
  flowM3h: number | null;
}

export interface DesignData {
  systemName: string;
  objectName: string;
  author: string;
  taskAuthor: string;
  taskAuthorPhone: string;
  calcNumber: string;
  schemeKind: 'scheme1' | 'scheme2' | 'scheme3' | '';
}

export interface InputData {
  calcMode: CalcModeParams;
  steamFlow: SteamFlowParams;
  steamThermo: SteamThermoParams;
  system: SystemParams;
  scheme: SchemeParams;
  pumps: PumpsParams;
  steamPipe: SteamPipeParams;
  condensateTrap: CondensateTrapParams;
  controlValve: ControlValveParams;
  safetyValve: SafetyValveParams;
  secondaryCircuit: SecondaryCircuitParams;
  makeUp: MakeUpParams;
  secondaryArmature: ChoiceSecondaryArmatureParams;
  makeupArmature: ChoiceMakeupArmatureParams;
  pto: ChoicePtoParams;
  choicePump: ChoicePumpParams;
  design: DesignData;
  results: CalcResult;
}

// ==========================================
// ВЫХОДНЫЕ ДАННЫЕ (CalcResult)
// ==========================================

export interface SteamPipeResult {
  steamFlowKgH?: number;
  preliminarySpeedMs?: number;
  estimatedPipeAreaM2?: number;
  estimatedDiameterMm?: number;
  standardDiameterMm?: number;
  pipeCrossSectionAreaM2?: number;
  actualSpeedMs?: number;
}

export interface CondensateTrapResult {
  trapSteamFlowKgH?: number;
  trapReserveFactor?: number;
  trapDeltaP?: number;
  trapRequiredFlowKgH?: number;
  trapDu?: number;
  trapDesignDeltaP?: number;
  trapTypeDeltaP?: number;
  trapActualCapacityKgH?: number;
  trapSelectedDeltaP?: number;
  trapIsSufficient?: boolean;
}

export interface ControlValveResult {
  valveSteamFlowKgH?: number;
  valveP1Bar?: number;
  valveDeltaPBar?: number;
  valveP2Bar?: number;
  valveX?: number;
  valveKvRequired?: number;
  valveType?: string;
  valveDu?: number | string;
  valveKvActual?: number;
  valveActualDeltaP?: number;
  valveOverloaded?: boolean;
  actuatorName?: string;
  actuatorCode?: string;
  actuatorControlType?: string;
  actuatorVoltage?: number;
  actuatorSuSd?: string;
}

export interface SafetyValveResult {
  safetyValveDuMm?: number;
}

export interface SecondaryCircuitResult {
  secondaryFlowM3h?: number;
  secondaryPreliminarySpeed?: number;
  secondaryEstimatedDuMm?: number;
  secondaryStandardDuMm?: number;
  secondaryActualSpeedMs?: number;
}

export interface PumpsResult {
  pumpFlowM3h?: number;
  pumpHeadM?: number;
}

export interface MakeUpResult {
  makeupVolumeCoef?: string;
  makeupFlowM3h?: number;
  makeupPreliminarySpeed?: number;
  makeupEstimatedDuMm?: number;
  makeupStandardDuMm?: number;
  makeupActualSpeedMs?: number;
}

export interface CalcResult {
  steamPipe?: SteamPipeResult;
  trap?: CondensateTrapResult;
  controlValve?: ControlValveResult;
  safetyValve?: SafetyValveResult;
  secondaryCircuit?: SecondaryCircuitResult;
  pumps?: PumpsResult;
  makeUp?: MakeUpResult;
}