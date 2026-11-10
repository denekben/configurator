// src/components/form/tabs/SecondaryCircuitTab.tsx

import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { RadioControl } from '../../controls/RadioControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import { ResultRow } from '../ResultRow';
import type { InputData } from '../../../core/types';
import {
  calcSecondaryFlow,
  calcSecondaryEstimatedDu,
  calcSecondaryActualSpeed,
} from '../../../core/calc/secondaryCircuitTabCalc';

const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';
const MODE_REQUIRED_MSG = 'Выберите режим подбора';

const STANDARD_DUS = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300]
  .map(v => ({ value: String(v), label: String(v) }));

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

export function SecondaryCircuitTab() {
  const { control, setValue } = useFormContext<InputData>();

  // Локальный режим
  const tabModeRaw = useWatch({ control, name: 'secondaryCircuit.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  // Входные данные
  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const supplyTempCInput = useWatch({ control, name: 'system.supplyTempC' });
  const returnTempCInput = useWatch({ control, name: 'system.returnTempC' });
  const preliminarySpeedInput = useWatch({ control, name: 'secondaryCircuit.secondaryPreliminarySpeed' });
  const standardDuInput = useWatch({ control, name: 'secondaryCircuit.secondaryStandardDu' });
  const editStandardDu = useWatch({ control, name: 'secondaryCircuit.editStandardDu' }) ?? false;

  // Приведение к числам
  const loadKw = toNumberOrNull(loadKwInput);
  const supplyTempC = toNumberOrNull(supplyTempCInput);
  const returnTempC = toNumberOrNull(returnTempCInput);
  const preliminarySpeed = toNumberOrNull(preliminarySpeedInput);
  const standardDuNum = toNumberOrNull(standardDuInput);

  // Валидация обязательности
  const loadKwEmpty = loadKw === null;
  const supplyTempCEmpty = supplyTempC === null;
  const returnTempCEmpty = returnTempC === null;
  const preliminarySpeedEmpty = preliminarySpeed === null;

  // Ду обязателен всегда, вне зависимости от чекбокса «Редактировать»
  const standardDuEmpty = isEmptyString(standardDuInput);

  // Отрицательные значения
  const loadKwNegative = loadKw !== null && loadKw < 0;
  const supplyTempCNegative = supplyTempC !== null && supplyTempC < 0;
  const returnTempCNegative = returnTempC !== null && returnTempC < 0;
  const preliminarySpeedNegative = preliminarySpeed !== null && preliminarySpeed < 0;

  // Общие ошибки — всегда
  const commonErrors =
    modeEmpty ||
    loadKwEmpty || loadKwNegative ||
    supplyTempCEmpty || supplyTempCNegative ||
    returnTempCEmpty || returnTempCNegative;

  // Локальные ошибки — только в ручном режиме
  const manualErrors =
    isManual &&
    (preliminarySpeedEmpty || preliminarySpeedNegative || standardDuEmpty);

  const hasInputErrors = commonErrors || manualErrors;
  const canCalc = !hasInputErrors;

  // 1. Расход — только при валидном вводе
  const flow = canCalc && loadKw && supplyTempC && returnTempC
    ? calcSecondaryFlow(loadKw, supplyTempC, returnTempC)
    : 0;

  // 2. Ориентировочный Ду
  const estimatedDu = canCalc && flow && preliminarySpeed
    ? calcSecondaryEstimatedDu(flow, preliminarySpeed)
    : 0;

  // 3. Скорость воды при стандартном Ду
  const actualSpeed = canCalc && flow && standardDuNum
    ? calcSecondaryActualSpeed(flow, standardDuNum)
    : 0;

  // Сохранение результатов (вложенные пути results.secondaryCircuit.*).
  useEffect(() => {
    if (!canCalc) {
      setValue('results.secondaryCircuit.secondaryFlowM3h', undefined);
      setValue('results.secondaryCircuit.secondaryPreliminarySpeed', undefined);
      setValue('results.secondaryCircuit.secondaryEstimatedDuMm', undefined);
      setValue('results.secondaryCircuit.secondaryStandardDuMm', undefined);
      setValue('results.secondaryCircuit.secondaryActualSpeedMs', undefined);
      return;
    }

    setValue('results.secondaryCircuit.secondaryFlowM3h', flow);
    setValue('results.secondaryCircuit.secondaryPreliminarySpeed', preliminarySpeed ?? undefined);
    setValue('results.secondaryCircuit.secondaryEstimatedDuMm', estimatedDu);
    setValue('results.secondaryCircuit.secondaryStandardDuMm', standardDuNum ?? undefined);
    setValue('results.secondaryCircuit.secondaryActualSpeedMs', actualSpeed);
  }, [canCalc, flow, preliminarySpeed, estimatedDu, standardDuNum, actualSpeed, setValue]);

  // LaTeX
  const flowFormula = flow > 0
    ? `G = \\frac{0.86 \\cdot ${loadKw}}{${supplyTempC} - ${returnTempC}} = ${flow.toFixed(3)}`
    : '';

  const estimatedDuFormula = estimatedDu > 0
    ? `d' = 18.8 \\cdot \\sqrt{\\frac{${flow.toFixed(3)}}{${preliminarySpeed}}} = ${estimatedDu.toFixed(2)}`
    : '';

  const actualSpeedFormula = actualSpeed > 0
    ? `v = ${flow.toFixed(3)} \\cdot \\left(\\frac{18.8}{${standardDuNum}}\\right)^2 = ${actualSpeed.toFixed(4)}`
    : '';

  // Хелпер приоритета: пусто → отрицательное
  const buildHelper = (empty: boolean, negative: boolean): string | undefined =>
    empty ? REQUIRED_MSG : negative ? NEGATIVE_MSG : undefined;

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="secondaryCircuit.mode"
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
          <TextControl
            name="system.supplyTempC"
            label="Температура подачи, °C"
            control={control}
            type="number"
            error={supplyTempCEmpty || supplyTempCNegative}
            helperText={buildHelper(supplyTempCEmpty, supplyTempCNegative)}
          />
          <TextControl
            name="system.returnTempC"
            label="Температура обратки, °C"
            control={control}
            type="number"
            error={returnTempCEmpty || returnTempCNegative}
            helperText={buildHelper(returnTempCEmpty, returnTempCNegative)}
          />
        </SectionCard>
      </GlobalDataWrapper>

      {isManual && (
        <>
          <SectionCard title="Дополнительные параметры Вторичного контура">
            <TextControl
              name="secondaryCircuit.secondaryPreliminarySpeed"
              label="Скорость в первом приближении, м/с"
              control={control}
              type="number"
              error={preliminarySpeedEmpty || preliminarySpeedNegative}
              helperText={buildHelper(preliminarySpeedEmpty, preliminarySpeedNegative)}
            />

            <Controller
              name="secondaryCircuit.editStandardDu"
              control={control}
              render={({ field }) => (
                <Tooltip title="Может повлиять на расчёты других компонентов">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Редактировать Ду (повлияет на Выбор запорной арматуры (Вторичка))
                      </Typography>
                    }
                    sx={{ mt: -1, mb: -1.5 }}
                  />
                </Tooltip>
              )}
            />

            <Controller
              name="secondaryCircuit.secondaryStandardDu"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  size="small"
                  error={standardDuEmpty}
                  disabled={!editStandardDu}
                >
                  <InputLabel id="secondary-standard-du-label">Стандартный Ду</InputLabel>
                  <Select
                    labelId="secondary-standard-du-label"
                    id="secondary-standard-du-select"
                    value={field.value ?? ''}
                    label="Стандартный Ду"
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                  >
                    {STANDARD_DUS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {standardDuEmpty && (
                    <FormHelperText>{REQUIRED_MSG}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </SectionCard>

          {canCalc && (
            <>
              <Divider sx={{ my: 4, borderBottomWidth: 2, borderColor: '#8B0000' }} />
              <Box>
                <Typography variant="h6" gutterBottom>Результаты расчёта</Typography>

                <ResultRow
                  label="Расход"
                  value={flow.toFixed(3)}
                  unit="м³/ч"
                  latexFormulaWithNumbers={flowFormula}
                />
                <ResultRow
                  label="Ориентировочный Ду"
                  value={estimatedDu.toFixed(2)}
                  unit="мм"
                  latexFormulaWithNumbers={estimatedDuFormula}
                />
                <ResultRow
                  label="Скорость воды"
                  value={actualSpeed.toFixed(4)}
                  unit="м/с"
                  latexFormulaWithNumbers={actualSpeedFormula}
                />
              </Box>
            </>
          )}
        </>
      )}

      {!isManual && !modeEmpty && (
        <Box sx={{ mt: 4, p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">
            В автоматическом режиме параметры вторичного контура подбираются автоматически.
          </Typography>
        </Box>
      )}
    </Box>
  );
}