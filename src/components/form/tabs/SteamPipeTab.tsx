// src/components/form/tabs/SteamPipeTab.tsx

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { RadioControl } from '../../controls/RadioControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import { ResultRow } from '../ResultRow';
import type { InputData } from '../../../core/types';
import {
  AUTO_STEAM_SPEED_MS_DEFAULT,
  STEAM_SPEED_MIN_MS,
  STEAM_SPEED_MAX_MS,
  MAX_STANDARD_DU_MM,
  calcSteamFlow,
  calcEstimatedPipeArea,
  calcEstimatedDiameter,
  calcStandardPipeArea,
  calcActualSteamSpeed,
  isSpeedInRange,
  selectStandardDu,
  STANDARD_DIAMETERS,
} from '../../../core/calc/steamPipeTabCalc';

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';
const MODE_REQUIRED_MSG = 'Выберите режим подбора';

export function SteamPipeTab() {
  const { control, setValue } = useFormContext<InputData>();

  const tabModeRaw = useWatch({ control, name: 'steamPipe.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isAuto = tabMode === 'auto';
  const isManual = tabMode === 'manual';

  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const enthalpySteamInput = useWatch({ control, name: 'steamThermo.enthalpySteam' });
  const enthalpyCondensateInput = useWatch({ control, name: 'steamThermo.enthalpyCondensate' });
  const specificVolumeInput = useWatch({ control, name: 'steamThermo.specificVolumeSteam' });
  const speedMsInput = useWatch({ control, name: 'steamPipe.steamSpeedMs' });

  // nested path — matches CalcResult.steamPipe.standardDiameterMm
  const selectedStandardDu = useWatch({
    control,
    name: 'results.steamPipe.standardDiameterMm',
  });

  const loadKw = toNumberOrNull(loadKwInput);
  const enthalpySteam = toNumberOrNull(enthalpySteamInput);
  const enthalpyCondensate = toNumberOrNull(enthalpyCondensateInput);
  const specificVolume = toNumberOrNull(specificVolumeInput);
  const speedNum = toNumberOrNull(speedMsInput);
  const selectedStandardDuNum = toNumberOrNull(selectedStandardDu);

  const loadKwEmpty = loadKw === null;
  const enthalpySteamEmpty = enthalpySteam === null;
  const enthalpyCondensateEmpty = enthalpyCondensate === null;
  const specificVolumeEmpty = specificVolume === null;
  const speedEmpty = speedNum === null;

  const loadKwNegative = loadKw !== null && loadKw < 0;
  const enthalpySteamNegative = enthalpySteam !== null && enthalpySteam < 0;
  const enthalpyCondensateNegative = enthalpyCondensate !== null && enthalpyCondensate < 0;
  const specificVolumeNegative = specificVolume !== null && specificVolume < 0;
  const speedNegative = speedNum !== null && speedNum < 0;

  const speedIsValid = speedEmpty || speedNegative ? false : isSpeedInRange(speedNum!);
  const speedHasRangeError = !speedEmpty && !speedNegative && !speedIsValid;

  const hasInputErrors =
    modeEmpty ||
    loadKwEmpty || loadKwNegative ||
    enthalpySteamEmpty || enthalpySteamNegative ||
    enthalpyCondensateEmpty || enthalpyCondensateNegative ||
    specificVolumeEmpty || specificVolumeNegative ||
    speedEmpty || speedNegative || speedHasRangeError;

  const manualDuMissing = isManual && selectedStandardDuNum === null;

  const canCalc = !hasInputErrors;
  const effectiveSpeedMs = speedNum ?? AUTO_STEAM_SPEED_MS_DEFAULT;

  const flow = canCalc && loadKw && enthalpySteam && enthalpyCondensate
    ? calcSteamFlow(loadKw, enthalpySteam, enthalpyCondensate)
    : 0;

  const area = canCalc && flow && specificVolume && effectiveSpeedMs
    ? calcEstimatedPipeArea(flow, specificVolume, effectiveSpeedMs)
    : 0;

  const estimatedDu = canCalc && area ? calcEstimatedDiameter(area) : 0;

  const duOutOfRange = estimatedDu > MAX_STANDARD_DU_MM;

  const autoStandardDu = (isAuto && estimatedDu > 0) ? selectStandardDu(estimatedDu) : 0;
  const effectiveStandardDu = isAuto
    ? autoStandardDu
    : isManual
      ? (selectedStandardDuNum ?? 0)
      : 0;

  const standardArea = effectiveStandardDu ? calcStandardPipeArea(effectiveStandardDu) : 0;
  const actualSpeed = (canCalc && flow && standardArea && specificVolume)
    ? calcActualSteamSpeed(flow, standardArea, specificVolume)
    : 0;

  useEffect(() => {
    if (isManual) {
      const current = toNumberOrNull(selectedStandardDu);
      if (current !== null) {
        setValue('results.steamPipe.standardDiameterMm', undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabMode]);

  useEffect(() => {
    if (!canCalc) {
      setValue('results.steamPipe.steamFlowKgH', undefined);
      setValue('results.steamPipe.preliminarySpeedMs', undefined);
      setValue('results.steamPipe.estimatedPipeAreaM2', undefined);
      setValue('results.steamPipe.estimatedDiameterMm', undefined);
      if (isAuto) {
        setValue('results.steamPipe.standardDiameterMm', undefined);
      }
      setValue('results.steamPipe.pipeCrossSectionAreaM2', undefined);
      setValue('results.steamPipe.actualSpeedMs', undefined);
      return;
    }

    setValue('results.steamPipe.steamFlowKgH', flow);
    setValue('results.steamPipe.preliminarySpeedMs', effectiveSpeedMs);
    setValue('results.steamPipe.estimatedPipeAreaM2', area);
    setValue('results.steamPipe.estimatedDiameterMm', estimatedDu);
    if (isAuto) {
      setValue('results.steamPipe.standardDiameterMm', effectiveStandardDu);
    }
    setValue('results.steamPipe.pipeCrossSectionAreaM2', standardArea);
    setValue('results.steamPipe.actualSpeedMs', actualSpeed);
  }, [
    canCalc,
    flow,
    effectiveSpeedMs,
    area,
    estimatedDu,
    effectiveStandardDu,
    standardArea,
    actualSpeed,
    setValue,
    isAuto,
  ]);

  const handleStandardDuChange = (val: string) => {
    setValue(
      'results.steamPipe.standardDiameterMm',
      val === '' ? undefined : Number(val),
    );
  };

  const flowFormula = flow > 0
    ? `G = \\frac{${loadKw} \\cdot 3600}{${enthalpySteam} - ${enthalpyCondensate}} \\cdot 0.99 = ${flow.toFixed(6)}`
    : '';
  const areaFormula = area > 0
    ? `S = \\frac{${flow.toFixed(6)} \\cdot ${specificVolume}}{${effectiveSpeedMs} \\cdot 3600} = ${area.toFixed(6)}`
    : '';
  const duFormula = estimatedDu > 0
    ? `d' = \\sqrt{\\frac{4 \\cdot ${area.toFixed(6)}}{\\pi}} \\cdot 1000 = ${estimatedDu.toFixed(6)}`
    : '';

  const stdAreaFormula = effectiveStandardDu
    ? `S_{ст} = \\frac{\\pi \\cdot ${(effectiveStandardDu / 1000).toFixed(6)}^2}{4} = ${standardArea.toFixed(6)}`
    : '';
  const speedFormula = effectiveStandardDu
    ? `\\omega = \\frac{4 \\cdot ${flow.toFixed(6)} \\cdot ${specificVolume}}{${(effectiveStandardDu / 1000).toFixed(6)}^2 \\cdot 3600 \\cdot \\pi} = ${actualSpeed.toFixed(6)}`
    : '';

  const buildHelper = (
    empty: boolean,
    negative: boolean,
    rangeMsg?: string,
  ): string | undefined => {
    if (empty) return REQUIRED_MSG;
    if (negative) return NEGATIVE_MSG;
    return rangeMsg;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="steamPipe.mode"
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
          <TextControl
            name="steamThermo.specificVolumeSteam"
            label="Уд. объём пара, м³/кг"
            control={control}
            type="number"
            error={specificVolumeEmpty || specificVolumeNegative}
            helperText={buildHelper(specificVolumeEmpty, specificVolumeNegative)}
          />
        </SectionCard>
      </GlobalDataWrapper>

      <SectionCard title="Дополнительные параметры Паропровода">
        <TextControl
          name="steamPipe.steamSpeedMs"
          label={`Предварительная скорость пара, м/с (допустимо ${STEAM_SPEED_MIN_MS}–${STEAM_SPEED_MAX_MS})`}
          control={control}
          type="number"
          error={speedEmpty || speedNegative || speedHasRangeError}
          helperText={buildHelper(
            speedEmpty,
            speedNegative,
            speedHasRangeError
              ? `Вне диапазона ${STEAM_SPEED_MIN_MS}–${STEAM_SPEED_MAX_MS} м/с (сейчас ${(speedNum ?? 0).toFixed(6)}).`
              : undefined,
          )}
        />
      </SectionCard>

      {canCalc && (
        <>
          <Divider sx={{ my: 4, borderBottomWidth: 2, borderColor: '#8B0000' }} />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Результаты расчёта
            </Typography>

            <ResultRow
              label="Расход пара"
              value={flow.toFixed(6)}
              unit="кг/ч"
              latexFormulaWithNumbers={flowFormula}
            />
            <ResultRow
              label="Ориентировочная площадь"
              value={area.toFixed(6)}
              unit="м²"
              latexFormulaWithNumbers={areaFormula}
            />
            <ResultRow
              label="Ориентировочный Ду"
              value={estimatedDu.toFixed(6)}
              unit="мм"
              latexFormulaWithNumbers={duFormula}
              highlightError={duOutOfRange}
            />

            {duOutOfRange && (
              <FormHelperText error sx={{ mb: 2, mt: -1, color: 'error.main' }}>
                Ориентировочный Ду {estimatedDu.toFixed(6)} мм превышает максимум {MAX_STANDARD_DU_MM} мм.
              </FormHelperText>
            )}

            {isManual && (
              <FormControl fullWidth size="small" sx={{ mb: 3 }} error={manualDuMissing}>
                <InputLabel id="standard-du-label">Выберите стандартный Ду (мм)</InputLabel>
                <Select
                  labelId="standard-du-label"
                  id="standard-du-select"
                  value={selectedStandardDuNum ?? ''}
                  label="Выберите стандартный Ду (мм)"
                  onChange={(e) => handleStandardDuChange(String(e.target.value))}
                >
                  {STANDARD_DIAMETERS.map(du => (
                    <MenuItem key={du} value={du}>{du}</MenuItem>
                  ))}
                </Select>
                {manualDuMissing && <FormHelperText>{REQUIRED_MSG}</FormHelperText>}
              </FormControl>
            )}

            {effectiveStandardDu > 0 && (
              <>
                {isAuto && (
                  <ResultRow
                    label={`Стандартный Ду (авто, ближайший к ${estimatedDu.toFixed(6)} мм)`}
                    value={String(effectiveStandardDu)}
                    unit="мм"
                  />
                )}

                <ResultRow
                  label={`Площадь поперечного сечения трубы при Ду ${effectiveStandardDu} мм`}
                  value={standardArea.toFixed(6)}
                  unit="м²"
                  latexFormulaWithNumbers={stdAreaFormula}
                />

                <ResultRow
                  label={`Скорость пара при Ду ${effectiveStandardDu} мм`}
                  value={actualSpeed.toFixed(6)}
                  unit="м/с"
                  latexFormulaWithNumbers={speedFormula}
                />
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}