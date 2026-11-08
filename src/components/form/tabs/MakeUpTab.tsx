// src/components/form/tabs/MakeUpTab.tsx

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
import { SelectControl } from '../../controls/SelectControl';
import { RadioControl } from '../../controls/RadioControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import { ResultRow } from '../ResultRow';
import type { InputData } from '../../../core/types';
import {
  calcMakeupFlow,
  calcMakeupEstimatedDu,
  calcMakeupActualSpeed,
} from '../../../core/calc/makeUpTabCalc';

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

export function MakeUpTab() {
  const { control, setValue } = useFormContext<InputData>();

  // Локальный режим — читаем как есть, без дефолта.
  const tabModeRaw = useWatch({ control, name: 'makeUp.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  // Глобальные данные
  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const systemVolumeLInput = useWatch({ control, name: 'system.systemVolumeL' });

  // Локальные данные
  const volumeCoefInput = useWatch({ control, name: 'makeUp.makeupVolumeCoef' });
  const preliminarySpeedInput = useWatch({ control, name: 'makeUp.makeupPreliminarySpeed' });
  const standardDuInput = useWatch({ control, name: 'makeUp.makeupStandardDu' });
  const editStandardDu = useWatch({ control, name: 'makeUp.editStandardDu' }) ?? false;

  // Приведение к числам
  const loadKw = toNumberOrNull(loadKwInput);
  const systemVolumeL = toNumberOrNull(systemVolumeLInput);
  const volumeCoef = toNumberOrNull(volumeCoefInput);
  const preliminarySpeed = toNumberOrNull(preliminarySpeedInput);
  const standardDuNum = toNumberOrNull(standardDuInput);

  // Обязательность
  // loadKw обязателен всегда
  const loadKwEmpty = loadKw === null;
  // system.systemVolumeL — НЕ обязателен
  // локальные поля обязательны только в ручном режиме
  const volumeCoefEmpty = isEmptyString(volumeCoefInput);
  const preliminarySpeedEmpty = preliminarySpeed === null;
  const standardDuEmpty = isEmptyString(standardDuInput);

  // Отрицательные значения
  const loadKwNegative = loadKw !== null && loadKw < 0;
  const systemVolumeLNegative = systemVolumeL !== null && systemVolumeL < 0;
  const preliminarySpeedNegative = preliminarySpeed !== null && preliminarySpeed < 0;

  const commonErrors =
    modeEmpty ||
    loadKwEmpty || loadKwNegative;

  const manualErrors =
    isManual &&
    (volumeCoefEmpty || preliminarySpeedEmpty || preliminarySpeedNegative || standardDuEmpty);

  const hasInputErrors = commonErrors || manualErrors;
  const canCalc = !hasInputErrors;

  const standardDus = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300]
    .map(v => ({ value: String(v), label: String(v) }));

  // 1. Расход
  const flow = canCalc
    ? calcMakeupFlow(loadKw ?? 0, volumeCoef ?? 0, systemVolumeL ?? undefined)
    : 0;

  // 2. Ориентировочный Ду
  const estimatedDu = (canCalc && flow && preliminarySpeed)
    ? calcMakeupEstimatedDu(flow, preliminarySpeed)
    : 0;

  // 3. Скорость воды
  const actualSpeed = (canCalc && flow && standardDuNum)
    ? calcMakeupActualSpeed(flow, standardDuNum)
    : 0;

  // Сохранение результатов.
  // ВАЖНО: при отсутствии валидного расчёта очищаем results.* (undefined),
  // чтобы после «Сброса данных» не оставалось нулей / старых значений.
  useEffect(() => {
    if (!canCalc) {
      setValue('results.makeupVolumeCoef', undefined);
      setValue('results.makeupFlowM3h', undefined);
      setValue('results.makeupPreliminarySpeed', undefined);
      setValue('results.makeupEstimatedDuMm', undefined);
      setValue('results.makeupStandardDuMm', undefined);
      setValue('results.makeupActualSpeedMs', undefined);
      return;
    }

    setValue('results.makeupVolumeCoef', volumeCoef ?? undefined);
    setValue('results.makeupFlowM3h', flow);
    setValue('results.makeupPreliminarySpeed', preliminarySpeed ?? undefined);
    setValue('results.makeupEstimatedDuMm', estimatedDu);
    setValue('results.makeupStandardDuMm', standardDuNum ?? undefined);
    setValue('results.makeupActualSpeedMs', actualSpeed);
  }, [
    canCalc,
    volumeCoef,
    flow,
    preliminarySpeed,
    estimatedDu,
    standardDuNum,
    actualSpeed,
    setValue,
  ]);

  // LaTeX
  const isVolumeBased = (systemVolumeL ?? 0) > 0;

  const flowFormula = flow > 0
    ? isVolumeBased
      ? `G = \\frac{${systemVolumeL}}{5000} = ${flow.toFixed(4)}`
      : `G = \\frac{${loadKw} \\cdot ${volumeCoef}}{5 \\cdot 1000} = ${flow.toFixed(4)}`
    : '';

  const estimatedDuFormula = estimatedDu > 0
    ? `d' = 18.8 \\cdot \\sqrt{\\frac{${flow.toFixed(4)}}{${preliminarySpeed}}} = ${estimatedDu.toFixed(2)}`
    : '';

  const actualSpeedFormula = actualSpeed > 0
    ? `v = ${flow.toFixed(4)} \\cdot \\left(\\frac{18.8}{${standardDuNum}}\\right)^2 = ${actualSpeed.toFixed(4)}`
    : '';

  // Хелпер приоритета: пусто → отрицательное
  const buildHelper = (empty: boolean, negative: boolean): string | undefined =>
    empty ? REQUIRED_MSG : negative ? NEGATIVE_MSG : undefined;

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="makeUp.mode"
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
          {/* Объём системы — НЕ обязателен, но отрицательное значение подсвечиваем */}
          <TextControl
            name="system.systemVolumeL"
            label="Объём системы (если есть), л"
            control={control}
            type="number"
            error={systemVolumeLNegative}
            helperText={systemVolumeLNegative ? NEGATIVE_MSG : undefined}
          />
        </SectionCard>
      </GlobalDataWrapper>

      {isManual && (
        <>
          <SectionCard title="Дополнительные параметры Подпитки">
            {/* Коэффициент объёма — обычный SelectControl */}
            <SelectControl
              name="makeUp.makeupVolumeCoef"
              label="Коэффициент объёма, л/кВт"
              control={control}
              options={[
                { value: '15', label: '15' },
                { value: '8.5', label: '8.5' },
              ]}
              error={volumeCoefEmpty}
              helperText={volumeCoefEmpty ? REQUIRED_MSG : undefined}
            />

            <TextControl
              name="makeUp.makeupPreliminarySpeed"
              label="Скорость в первом приближении, м/с"
              control={control}
              type="number"
              error={preliminarySpeedEmpty || preliminarySpeedNegative}
              helperText={buildHelper(preliminarySpeedEmpty, preliminarySpeedNegative)}
            />

            {/* Галочка «Редактировать Ду» — как в SecondaryCircuitTab */}
            <Controller
              name="makeUp.editStandardDu"
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
                        Редактировать Ду (повлияет на Выбор запорной арматуры (Подпитка))
                      </Typography>
                    }
                    sx={{ mt: -1, mb: -1.5 }}
                  />
                </Tooltip>
              )}
            />

            {/* Ду блокируется, пока не поставлена галочка «Редактировать Ду» */}
            <Controller
              name="makeUp.makeupStandardDu"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  size="small"
                  error={standardDuEmpty}
                  disabled={!editStandardDu}
                >
                  <InputLabel id="makeup-standard-du-label">Стандартный Ду</InputLabel>
                  <Select
                    labelId="makeup-standard-du-label"
                    id="makeup-standard-du-select"
                    value={field.value ?? ''}
                    label="Стандартный Ду"
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                  >
                    {standardDus.map(opt => (
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
                  value={flow.toFixed(4)}
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
            В автоматическом режиме параметры подпитки подбираются автоматически.
          </Typography>
        </Box>
      )}
    </Box>
  );
}