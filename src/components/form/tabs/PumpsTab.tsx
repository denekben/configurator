// src/components/form/tabs/PumpsTab.tsx

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Typography, Divider } from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { SelectControl } from '../../controls/SelectControl';
import { RadioControl } from '../../controls/RadioControl';
import { GlobalDataWrapper } from '../GlobalDataWrapper';
import { ResultRow } from '../ResultRow';
import type { InputData } from '../../../core/types';
import {
  calcSecondaryFlowForPumps,
  calcPumpFlow,
  calcPumpHead,
} from '../../../core/calc/pumpsTabCalc';

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

export function PumpsTab() {
  const { control, setValue } = useFormContext<InputData>();

  // Локальный режим — читаем "сырое" значение из формы, без дефолта.
  const rawMode = useWatch({ control, name: 'pumps.mode' });
  const tabMode = rawMode ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  // Глобальные данные
  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const supplyTempCInput = useWatch({ control, name: 'system.supplyTempC' });
  const returnTempCInput = useWatch({ control, name: 'system.returnTempC' });
  const hydraulicLossMInput = useWatch({ control, name: 'system.hydraulicLossM' });

  // Локальные данные
  const pumpCountInput = useWatch({ control, name: 'pumps.pumpCount' });
  const hxLossMInput = useWatch({ control, name: 'pumps.hxLossM' });
  const reserveMInput = useWatch({ control, name: 'pumps.reserveM' });
  const extraLossMInput = useWatch({ control, name: 'pumps.extraLossM' });

  // Приведение к числам
  const loadKw = toNumberOrNull(loadKwInput);
  const supplyTempC = toNumberOrNull(supplyTempCInput);
  const returnTempC = toNumberOrNull(returnTempCInput);
  const hydraulicLossM = toNumberOrNull(hydraulicLossMInput);
  const pumpCountNum = toNumberOrNull(pumpCountInput);
  const hxLossM = toNumberOrNull(hxLossMInput);
  const reserveM = toNumberOrNull(reserveMInput);
  const extraLossM = toNumberOrNull(extraLossMInput);

  // Обязательность — глобальные поля
  const loadKwEmpty = loadKw === null;
  const supplyTempCEmpty = supplyTempC === null;
  const returnTempCEmpty = returnTempC === null;
  const hydraulicLossMEmpty = hydraulicLossM === null;

  // Обязательность — локальные поля (только в ручном)
  const pumpCountEmpty = isEmptyString(pumpCountInput);
  const hxLossMEmpty = hxLossM === null;
  const reserveMEmpty = reserveM === null;
  const extraLossMEmpty = extraLossM === null;

  // Отрицательные значения
  const loadKwNegative = loadKw !== null && loadKw < 0;
  const supplyTempCNegative = supplyTempC !== null && supplyTempC < 0;
  const returnTempCNegative = returnTempC !== null && returnTempC < 0;
  const hydraulicLossMNegative = hydraulicLossM !== null && hydraulicLossM < 0;
  const hxLossMNegative = hxLossM !== null && hxLossM < 0;
  const reserveMNegative = reserveM !== null && reserveM < 0;
  const extraLossMNegative = extraLossM !== null && extraLossM < 0;

  const commonErrors =
    modeEmpty ||
    loadKwEmpty || loadKwNegative ||
    supplyTempCEmpty || supplyTempCNegative ||
    returnTempCEmpty || returnTempCNegative ||
    hydraulicLossMEmpty || hydraulicLossMNegative;

  const manualErrors =
    isManual &&
    (pumpCountEmpty ||
      hxLossMEmpty || hxLossMNegative ||
      reserveMEmpty || reserveMNegative ||
      extraLossMEmpty || extraLossMNegative);

  const hasInputErrors = commonErrors || manualErrors;
  const canCalc = !hasInputErrors;

  // 1. Расход вторичного контура
  const secondaryFlow =
    canCalc && loadKw && supplyTempC && returnTempC
      ? calcSecondaryFlowForPumps(loadKw, supplyTempC, returnTempC)
      : 0;

  // 2. Расход насоса
  const pumpFlow =
    canCalc && secondaryFlow && pumpCountNum
      ? calcPumpFlow(secondaryFlow, pumpCountNum)
      : 0;

  // 3. Напор насоса
  const pumpHead = canCalc
    ? calcPumpHead(
        hydraulicLossM ?? 0,
        hxLossM ?? 0,
        reserveM ?? 0,
        extraLossM ?? 0,
      )
    : 0;

  // Сохранение результатов.
  // ВАЖНО: при отсутствии валидного расчёта очищаем results.* (undefined),
  // чтобы после «Сброса данных» не оставалось нулей / старых значений.
  useEffect(() => {
    if (!canCalc) {
      setValue('results.pumpFlowM3h', undefined);
      setValue('results.pumpHeadM', undefined);
      return;
    }
    setValue('results.pumpFlowM3h', pumpFlow);
    setValue('results.pumpHeadM', pumpHead);
  }, [canCalc, pumpFlow, pumpHead, setValue]);

  // LaTeX
  const pumpFlowFormula = pumpFlow > 0
    ? `G_{нас} = \\frac{0.86 \\cdot ${loadKw}}{${supplyTempC} - ${returnTempC}} \\cdot \\frac{1}{${pumpCountNum}} = ${pumpFlow.toFixed(4)}`
    : '';

  const pumpHeadFormula = pumpHead > 0
    ? `H = ${hydraulicLossM ?? 0} + ${hxLossM ?? 0} + ${reserveM ?? 0} + ${extraLossM ?? 0} = ${pumpHead.toFixed(3)}`
    : '';

  // Хелпер приоритета: пусто → отрицательное
  const buildHelper = (empty: boolean, negative: boolean): string | undefined =>
    empty ? REQUIRED_MSG : negative ? NEGATIVE_MSG : undefined;

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="pumps.mode"
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
          <TextControl
            name="system.hydraulicLossM"
            label="Гидравлические потери в системе, м.вод.ст."
            control={control}
            type="number"
            error={hydraulicLossMEmpty || hydraulicLossMNegative}
            helperText={buildHelper(hydraulicLossMEmpty, hydraulicLossMNegative)}
          />
        </SectionCard>
      </GlobalDataWrapper>

      {isManual && (
        <>
          <SectionCard title="Дополнительные параметры Циркуляционных насосов">
            <SelectControl
              name="pumps.pumpCount"
              label="Кол-во одновременно работающих насосов"
              control={control}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
              ]}
              error={pumpCountEmpty}
              helperText={pumpCountEmpty ? REQUIRED_MSG : undefined}
            />
            <TextControl
              name="pumps.hxLossM"
              label="Потери в ПТО, м.вод.ст."
              control={control}
              type="number"
              error={hxLossMEmpty || hxLossMNegative}
              helperText={buildHelper(hxLossMEmpty, hxLossMNegative)}
            />
            <TextControl
              name="pumps.reserveM"
              label="Запас по напору, м.вод.ст."
              control={control}
              type="number"
              error={reserveMEmpty || reserveMNegative}
              helperText={buildHelper(reserveMEmpty, reserveMNegative)}
            />
            <TextControl
              name="pumps.extraLossM"
              label="Доп. потери (Балансир, грязевик и т.п…), м.вод.ст."
              control={control}
              type="number"
              error={extraLossMEmpty || extraLossMNegative}
              helperText={buildHelper(extraLossMEmpty, extraLossMNegative)}
            />
          </SectionCard>

          {canCalc && (
            <>
              <Divider sx={{ my: 4, borderBottomWidth: 2, borderColor: '#8B0000' }} />
              <Box>
                <Typography variant="h6" gutterBottom>Результаты расчёта</Typography>

                <ResultRow
                  label="Расход насоса"
                  value={pumpFlow.toFixed(4)}
                  unit="м³/ч"
                  latexFormulaWithNumbers={pumpFlowFormula}
                />
                <ResultRow
                  label="Напор насоса"
                  value={pumpHead.toFixed(3)}
                  unit="м.вод.ст."
                  latexFormulaWithNumbers={pumpHeadFormula}
                />
              </Box>
            </>
          )}
        </>
      )}

      {!isManual && !modeEmpty && (
        <Box sx={{ mt: 4, p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">
            В автоматическом режиме параметры насосов подбираются автоматически.
          </Typography>
        </Box>
      )}
    </Box>
  );
}