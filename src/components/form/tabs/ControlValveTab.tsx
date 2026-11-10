// src/components/form/tabs/ControlValveTab.tsx

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Typography,
  Divider,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { RadioControl } from '../../controls/RadioControl';
import { SelectControl } from '../../controls/SelectControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import { ResultRow } from '../ResultRow';
import type { InputData } from '../../../core/types';
import { calcSteamFlow } from '../../../core/calc/steamPipeTabCalc';
import {
  calcKv,
  calcValveDeltaP,
  getValveKvs,
  selectActuatorByParams,
  selectValveCode,
} from '../../../core/calc/controlValveTabCalc';

const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';
const MODE_REQUIRED_MSG = 'Выберите режим подбора';

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

const helperSx = { mx: 1.75, mt: 0.5, color: 'error.main' } as const;

interface ActuatorRow {
  du: string;
  name: string;
  code: string;
  controlType: string;
  voltage: string;
  suSd: string;
}

export function ControlValveTab() {
  const { control, setValue } = useFormContext<InputData>();

  const tabModeRaw = useWatch({ control, name: 'controlValve.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const enthalpySteamInput = useWatch({ control, name: 'steamThermo.enthalpySteam' });
  const enthalpyCondensateInput = useWatch({ control, name: 'steamThermo.enthalpyCondensate' });
  const steamPressureInput = useWatch({ control, name: 'steamFlow.steamPressureBar' });
  const dpAssumedInput = useWatch({ control, name: 'controlValve.valveDeltaPAssumed' });

  const valveType = useWatch({ control, name: 'controlValve.valveType' });
  const valveDu = useWatch({ control, name: 'controlValve.valveDu' });

  const actuatorControlInput = useWatch({ control, name: 'controlValve.actuatorControl' });
  const actuatorVoltageInput = useWatch({ control, name: 'controlValve.actuatorVoltage' });
  const actuatorSuSdInput = useWatch({ control, name: 'controlValve.actuatorSuSd' });

  const isVfs2r = valveType === 'VFS-2R';

  // 1. Приведение
  const loadKw = toNumberOrNull(loadKwInput);
  const enthalpySteam = toNumberOrNull(enthalpySteamInput);
  const enthalpyCondensate = toNumberOrNull(enthalpyCondensateInput);
  const steamPressureNum = toNumberOrNull(steamPressureInput);
  const dpAssumedNum = toNumberOrNull(dpAssumedInput);

  // 2. Валидация обязательности
  const loadKwEmpty = loadKw === null;
  const steamPressureEmpty = steamPressureNum === null;
  const enthalpySteamEmpty = enthalpySteam === null;
  const enthalpyCondensateEmpty = enthalpyCondensate === null;
  const dpEmpty = dpAssumedNum === null;
  const duEmpty = isEmptyString(valveDu);
  const typeEmpty = isEmptyString(valveType);
  const controlEmpty = isEmptyString(actuatorControlInput);
  const voltageEmpty = isEmptyString(actuatorVoltageInput);
  const suSdEmpty = isEmptyString(actuatorSuSdInput);

  // 2a. Валидация отрицательных значений
  const loadKwNegative = loadKw !== null && loadKw < 0;
  const steamPressureNegative = steamPressureNum !== null && steamPressureNum < 0;
  const enthalpySteamNegative = enthalpySteam !== null && enthalpySteam < 0;
  const enthalpyCondensateNegative = enthalpyCondensate !== null && enthalpyCondensate < 0;
  const dpNegative = dpAssumedNum !== null && dpAssumedNum < 0;

  const commonErrors =
    modeEmpty ||
    loadKwEmpty || loadKwNegative ||
    steamPressureEmpty || steamPressureNegative ||
    enthalpySteamEmpty || enthalpySteamNegative ||
    enthalpyCondensateEmpty || enthalpyCondensateNegative;

  const manualErrors =
    isManual &&
    (dpEmpty || dpNegative || duEmpty || typeEmpty || controlEmpty || voltageEmpty || suSdEmpty);

  const hasInputErrors = commonErrors || manualErrors;
  const canCalc = !hasInputErrors;

  // 3. Опции
  const valveTypeOptions = [
    { value: 'KM125F', label: 'КМ125Ф Аналоговый привод' },
    { value: 'KM125F_pneu', label: 'КМ125Ф Пневматический привод' },
    { value: 'KM225F', label: 'КМ225Ф Аналоговый привод / трёхпозиционный PSL' },
    { value: 'VFS-2R', label: 'VFS-2R' },
  ];

  const valveDuOptions = [
    { value: '15 (0,63)', label: '15 (0.63)' },
    { value: '15 (1)', label: '15 (1)' },
    { value: '15 (1,6)', label: '15 (1.6)' },
    { value: '15 (4)', label: '15 (4)' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
    { value: '32', label: '32' },
    { value: '40', label: '40' },
    { value: '50', label: '50' },
    { value: '65', label: '65' },
    { value: '80', label: '80' },
    { value: '100', label: '100' },
    { value: '125', label: '125' },
    { value: '150', label: '150' },
    { value: '200', label: '200' },
    { value: '250', label: '250' },
    { value: '300', label: '300' },
  ];

  // 4. Расчёты
  const steamFlow =
    canCalc && loadKw && enthalpySteam && enthalpyCondensate
      ? calcSteamFlow(loadKw, enthalpySteam, enthalpyCondensate)
      : 0;

  const p1 = canCalc ? steamPressureNum ?? 0 : 0;
  const dp = canCalc ? dpAssumedNum ?? 0 : 0;
  const p2 = Math.max(p1 - dp, 0);
  const x = p1 > 0 ? dp / p1 : 0;

  const kvRequired = canCalc && steamFlow && p1 > 0 ? calcKv(steamFlow, p1, dp) : 0;

  const kvsActual = getValveKvs(valveType, valveDu ?? undefined);

  const actualDeltaP =
    canCalc && steamFlow && kvsActual && p1 > 0
      ? calcValveDeltaP(steamFlow, kvsActual, p1)
      : 0;

  const valveOverloaded = Number.isNaN(actualDeltaP);

  // 5. Подбор (для текущего выбранного Ду)
  const vfsActuator = isVfs2r
    ? selectActuatorByParams(
        valveDu ?? undefined,
        actuatorVoltageInput,
        actuatorControlInput,
        actuatorSuSdInput,
      )
    : null;

  const otherValveCode = !isVfs2r
    ? selectValveCode(valveType, valveDu ?? undefined)
    : null;

  const nothingFound = isVfs2r
    ? vfsActuator === null
    : otherValveCode === null;

  // 5a. Табличка «возможные приводы по Ду» — для всех valveDuOptions
  const actuatorRowsByDu: ActuatorRow[] = valveDuOptions.map(({ value: du }) => {
    if (isVfs2r) {
      const act = selectActuatorByParams(
        du,
        actuatorVoltageInput,
        actuatorControlInput,
        actuatorSuSdInput,
      );
      return {
        du,
        name: act?.name ?? '—',
        code: act?.code ?? '—',
        controlType:
          act?.controlType
          ?? (actuatorControlInput === 'impulse' ? 'Импульсное'
            : actuatorControlInput === 'analog' ? 'Аналоговое'
            : '—'),
        voltage:
          act?.voltage != null
            ? `${act.voltage}В`
            : actuatorVoltageInput
              ? `${actuatorVoltageInput}В`
              : '—',
        suSd:
          act?.suSd
          ?? (actuatorSuSdInput === 'no_spring' ? 'Без пружины'
            : actuatorSuSdInput === 'spring' ? 'С пружиной'
            : '—'),
      };
    }

    const codeSel = selectValveCode(valveType, du);
    return {
      du,
      name: codeSel?.name ?? '—',
      code: codeSel?.code ?? '—',
      controlType: '—',
      voltage: '—',
      suSd: '—',
    };
  });

  // 6. Лейблы
  const controlTypeFromInput =
    actuatorControlInput === 'impulse' ? 'Импульсное'
    : actuatorControlInput === 'analog' ? 'Аналоговое'
    : '';

  const suSdFromInput =
    actuatorSuSdInput === 'no_spring' ? 'Без пружины'
    : actuatorSuSdInput === 'spring' ? 'С пружиной'
    : '';

  // 7. Сохранение
  useEffect(() => {
    if (!canCalc) {
      setValue('results.valveSteamFlowKgH', undefined);
      setValue('results.valveP1Bar', undefined);
      setValue('results.valveDeltaPBar', undefined);
      setValue('results.valveP2Bar', undefined);
      setValue('results.valveX', undefined);
      setValue('results.valveKvRequired', undefined);
      setValue('results.valveKvActual', undefined);
      setValue('results.valveActualDeltaP', undefined);
      setValue('results.valveOverloaded', undefined);
      setValue('results.valveType', undefined);
      setValue('results.valveDu', undefined);
      setValue('results.actuatorName', undefined);
      setValue('results.actuatorCode', undefined);
      setValue('results.actuatorControlType', undefined);
      setValue('results.actuatorVoltage', undefined);
      setValue('results.actuatorSuSd', undefined);
      return;
    }

    setValue('results.valveSteamFlowKgH', steamFlow);
    setValue('results.valveP1Bar', p1);
    setValue('results.valveDeltaPBar', dp);
    setValue('results.valveP2Bar', p2);
    setValue('results.valveX', x);
    setValue('results.valveKvRequired', kvRequired);
    setValue('results.valveKvActual', kvsActual);
    setValue('results.valveActualDeltaP', Number.isNaN(actualDeltaP) ? undefined : actualDeltaP);
    setValue('results.valveOverloaded', valveOverloaded);

    setValue('results.valveType', valveType);
    setValue('results.valveDu', valveDu ?? undefined);

    setValue('results.actuatorName', vfsActuator?.name ?? otherValveCode?.name ?? '');
    setValue('results.actuatorCode', vfsActuator?.code ?? otherValveCode?.code ?? '');
    setValue('results.actuatorControlType',
      vfsActuator?.controlType ?? (controlTypeFromInput || ''));
    setValue('results.actuatorVoltage',
      vfsActuator?.voltage
        ?? (actuatorVoltageInput ? Number(actuatorVoltageInput) : undefined));
    setValue('results.actuatorSuSd',
      vfsActuator?.suSd ?? (suSdFromInput || ''));
  }, [
    canCalc,
    steamFlow, p1, dp, p2, x, kvRequired, kvsActual, actualDeltaP, valveOverloaded,
    valveType, valveDu, vfsActuator, otherValveCode,
    controlTypeFromInput, suSdFromInput, actuatorVoltageInput,
    setValue,
  ]);

  // 8. LaTeX
  const flowFormula = steamFlow > 0
    ? `G = \\frac{${loadKw} \\cdot 3600}{${enthalpySteam} - ${enthalpyCondensate}} \\cdot 0.99 = ${steamFlow.toFixed(6)}`
    : '';

  const kvFormula = kvRequired > 0
    ? `Kv = \\frac{${steamFlow.toFixed(6)}}{12 \\cdot ${p1} \\cdot \\sqrt{1 - 5.67 \\cdot (0.42 - ${x.toFixed(6)})^2}} = ${kvRequired.toFixed(6)}`
    : '';

  const dpFormula = (actualDeltaP > 0 && !valveOverloaded)
    ? `\\Delta P = \\left(0.42 - \\sqrt{\\frac{1 - \\left(\\frac{${steamFlow.toFixed(6)}}{${kvsActual} \\cdot 12 \\cdot ${p1}}\\right)^2}{5.67}}\\right) \\cdot ${p1} = ${actualDeltaP.toFixed(6)}`
    : '';

  const dash = '—';

  const actuatorName = vfsActuator?.name ?? otherValveCode?.name ?? dash;
  const actuatorCode = vfsActuator?.code ?? otherValveCode?.code ?? dash;
  const controlTypeLabel = vfsActuator?.controlType ?? (controlTypeFromInput || dash);
  const voltageLabel = vfsActuator
    ? `${vfsActuator.voltage}В`
    : actuatorVoltageInput
      ? `${actuatorVoltageInput}В`
      : dash;
  const suSdLabel = vfsActuator?.suSd ?? (suSdFromInput || dash);

  // Хелпер приоритета: пусто → отрицательное
  const buildHelper = (empty: boolean, negative: boolean): string | undefined =>
    empty ? REQUIRED_MSG : negative ? NEGATIVE_MSG : undefined;

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="controlValve.mode"
          label="Режим подбора"
          control={control}
          options={[
            { value: 'auto', label: 'Автоматический' },
            { value: 'manual', label: 'Ручной' },
          ]}
          error={modeEmpty}
          helperText={modeEmpty ? MODE_REQUIRED_MSG : undefined}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <GlobalDataWrapper>
        <SectionCard title="Данные по системам">
          <TextControl
            name="system.loadKw"
            label="Мощность, кВт"
            control={control}
            type="number"
            error={loadKwEmpty || loadKwNegative}
            helperText={buildHelper(loadKwEmpty, loadKwNegative)}
          />
        </SectionCard>
        <SectionCard title="Данные по пару в первичном контуре">
          <TextControl
            name="steamFlow.steamPressureBar"
            label="Давление пара (до РК), Бар (и)"
            control={control}
            type="number"
            error={steamPressureEmpty || steamPressureNegative}
            helperText={buildHelper(steamPressureEmpty, steamPressureNegative)}
          />
        </SectionCard>
        <SectionCard title="Данные по параметрам пара">
          <TextControl
            name="steamThermo.enthalpySteam"
            label="Энтальпия пара, кДж/кг"
            control={control}
            type="number"
            error={enthalpySteamEmpty || enthalpySteamNegative}
            helperText={buildHelper(enthalpySteamEmpty, enthalpySteamNegative)}
          />
          <TextControl
            name="steamThermo.enthalpyCondensate"
            label="Энтальпия конденсата, кДж/кг"
            control={control}
            type="number"
            error={enthalpyCondensateEmpty || enthalpyCondensateNegative}
            helperText={buildHelper(enthalpyCondensateEmpty, enthalpyCondensateNegative)}
          />
        </SectionCard>
      </GlobalDataWrapper>

      {isManual && (
        <>
          <SectionCard title="Дополнительные параметры РК">
            <TextControl
              name="controlValve.valveDeltaPAssumed"
              label="Перепад на клапане (ΔP)"
              control={control}
              type="number"
              error={dpEmpty || dpNegative}
              helperText={buildHelper(dpEmpty, dpNegative)}
            />

            <SelectControl
              name="controlValve.valveType"
              label="Тип РК"
              control={control}
              error={typeEmpty}
              helperText={typeEmpty ? REQUIRED_MSG : undefined}
              options={valveTypeOptions}
            />

            <SelectControl
              name="controlValve.actuatorControl"
              label="Тип управления"
              control={control}
              error={controlEmpty}
              helperText={controlEmpty ? REQUIRED_MSG : undefined}
              options={[
                { value: 'impulse', label: 'Импульсное' },
                { value: 'analog', label: 'Аналоговое' },
              ]}
            />

            <SelectControl
              name="controlValve.actuatorVoltage"
              label="Напряжение"
              control={control}
              error={voltageEmpty}
              helperText={voltageEmpty ? REQUIRED_MSG : undefined}
              options={[
                { value: '24', label: '24В' },
                { value: '220', label: '220В' },
              ]}
            />

            <SelectControl
              name="controlValve.actuatorSuSd"
              label="SU|SD"
              control={control}
              error={suSdEmpty}
              helperText={suSdEmpty ? REQUIRED_MSG : undefined}
              options={[
                { value: 'no_spring', label: 'Без пружины' },
                { value: 'spring', label: 'С пружиной' },
              ]}
            />
          </SectionCard>

          {canCalc && (
            <>
              <Divider sx={{ my: 4, borderBottomWidth: 2, borderColor: '#8B0000' }} />
              <Box>
                <Typography variant="h6" gutterBottom>Результаты расчёта</Typography>

                <ResultRow label="Расход пара" value={steamFlow.toFixed(6)} unit="кг/ч" latexFormulaWithNumbers={flowFormula} />
                <ResultRow label="Давление после клапана" value={p2.toFixed(6)} unit="бар" latexFormulaWithNumbers={`P_2 = ${p1} - ${dp} = ${p2.toFixed(6)}`} />
                <ResultRow label="Коэффициент x (ΔP / P1)" value={x.toFixed(6)} unit="" latexFormulaWithNumbers={`x = \\frac{${dp}}{${p1}} = ${x.toFixed(6)}`} />
                <ResultRow label="Расчетная пропускная способность Kv" value={kvRequired.toFixed(6)} unit="м³/ч" latexFormulaWithNumbers={kvFormula} />

                {kvsActual >= 0 && (
                  <>
                    <ResultRow
                      label="Kv РК (паспортный)"
                      value={kvsActual.toString()}
                      unit="м³/ч"
                      highlightError={valveOverloaded}
                    />

                    {valveOverloaded ? (
                      <FormHelperText error sx={helperSx}>
                        Расход пара ({steamFlow.toFixed(6)} кг/ч) превышает пропускную способность
                        выбранного клапана (Kvs = {kvsActual}). Перепад на РК рассчитать нельзя —
                        выберите клапан с бо́льшим Ду.
                      </FormHelperText>
                    ) : (
                      <ResultRow
                        label="Перепад давления на РК (поверочный)"
                        value={actualDeltaP.toFixed(6)}
                        unit="бар"
                        latexFormulaWithNumbers={dpFormula}
                      />
                    )}
                  </>
                )}

                {/* Селект Ду РК — после перепада давления на РК */}
                <SelectControl
                  name="controlValve.valveDu"
                  label="Ду РК"
                  control={control}
                  error={duEmpty || nothingFound}
                  helperText={
                    duEmpty
                      ? REQUIRED_MSG
                      : nothingFound
                        ? isVfs2r
                          ? 'Для выбранного Ду не найден электропривод в каталоге VFS-2R.'
                          : 'Для выбранного Ду не найден код клапана в каталоге компонентов.'
                        : undefined
                  }
                  options={valveDuOptions}
                />

                {/* Табличка возможных приводов по Ду (показывается до выбора Ду) */}
                {actuatorRowsByDu.length > 0 && (
                  <TableContainer component={Paper} variant="outlined" sx={{ my: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Ду</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Наименование</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Код</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Тип управления</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Напряжение</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>SU|SD</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {actuatorRowsByDu.map((row) => {
                          const isSelected = !duEmpty && valveDu === row.du;
                          return (
                            <TableRow
                              key={row.du}
                              sx={
                                isSelected
                                  ? {
                                      bgcolor: '#fdecea',
                                      '& td': { fontWeight: 'bold' },
                                    }
                                  : undefined
                              }
                            >
                              <TableCell>{row.du}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.code}</TableCell>
                              <TableCell>{row.controlType}</TableCell>
                              <TableCell>{row.voltage}</TableCell>
                              <TableCell>{row.suSd}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {!nothingFound && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Электропривод</Typography>

                    <Typography variant="body2">Наименование: {actuatorName}</Typography>
                    <Typography variant="body2">Код: {actuatorCode}</Typography>
                    <Typography variant="body2">Тип управления: {controlTypeLabel}</Typography>
                    <Typography variant="body2">Напряжение: {voltageLabel}</Typography>
                    <Typography variant="body2">SU|SD: {suSdLabel}</Typography>
                  </Box>
                )}

              </Box>
            </>
          )}
        </>
      )}

      {!isManual && !modeEmpty && (
        <Box sx={{ mt: 4, p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">
            В автоматическом режиме параметры РК подбираются автоматически на основе глобальных данных.
          </Typography>
        </Box>
      )}
    </Box>
  );
}