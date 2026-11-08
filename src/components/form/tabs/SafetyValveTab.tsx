// src/components/form/tabs/SafetyValveTab.tsx

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Typography, Divider } from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { SelectControl } from '../../controls/SelectControl';
import { RadioControl } from '../../controls/RadioControl';
import type { InputData } from '../../../core/types';

// Диаметры отвода предохранительного клапана, мм
const SAFETY_VALVE_DUS = [20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200];

const REQUIRED_MSG = 'Обязательное поле';
const MODE_REQUIRED_MSG = 'Выберите режим подбора';

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function SafetyValveTab() {
  const { control, setValue } = useFormContext<InputData>();

  const tabModeRaw = useWatch({ control, name: 'safetyValve.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  const safetyValveDuInput = useWatch({ control, name: 'safetyValve.safetyValveDu' });

  const safetyValveDuNum = toNumberOrNull(safetyValveDuInput);

  // Поле считается заполненным, только если выбран один из допустимых Ду.
  // (0 / '' / undefined / любое «левое» число → пусто)
  const duSelected =
    safetyValveDuNum !== null && SAFETY_VALVE_DUS.includes(safetyValveDuNum);

  // Обязательность — только в ручном режиме
  const duEmpty = isManual && !duSelected;

  // Расчёт возможен, только когда режим выбран и (если ручной) Ду выбран.
  const canCalc = !modeEmpty && (!isManual || duSelected);

  // Сохранение результата: при отсутствии валидного расчёта очищаем results.*
  // (undefined), чтобы после «Сброса данных» не оставалось нулей / старых значений.
  useEffect(() => {
    if (!canCalc) {
      setValue('results.safetyValveDuMm', undefined);
      return;
    }
    setValue('results.safetyValveDuMm', safetyValveDuNum ?? undefined);
  }, [canCalc, safetyValveDuNum, setValue]);

  const options = SAFETY_VALVE_DUS.map(v => ({ value: String(v), label: String(v) }));

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="safetyValve.mode"
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

      {isManual && (
        <SectionCard title="Параметры предохранительного клапана">
          <SelectControl
            name="safetyValve.safetyValveDu"
            label="Диаметр отвода, мм"
            control={control}
            options={options}
            error={duEmpty}
            helperText={duEmpty ? REQUIRED_MSG : undefined}
          />
        </SectionCard>
      )}

      {!isManual && !modeEmpty && (
        <Box sx={{ mt: 4, p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">
            В автоматическом режиме параметры предохранительного клапана подбираются автоматически.
          </Typography>
        </Box>
      )}
    </Box>
  );
}