// src/components/form/tabs/ChoicePtoTab.tsx

import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Typography, Divider } from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import { SelectControl } from '../../controls/SelectControl';
import type { InputData } from '../../../core/types';

const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ChoicePtoTab() {
  const { control } = useFormContext<InputData>();

  // Значения полей
  const nameInput = useWatch({ control, name: 'pto.name' });
  const codeInput = useWatch({ control, name: 'pto.code' });
  const reserveInput = useWatch({ control, name: 'pto.reserve' });
  const primaryFlowInput = useWatch({ control, name: 'pto.primaryFlow' });
  const secondaryFlowInput = useWatch({ control, name: 'pto.secondaryFlow' });
  const primaryLossInput = useWatch({ control, name: 'pto.primaryLoss' });
  const secondaryLossInput = useWatch({ control, name: 'pto.secondaryLoss' });
  const priceHiInput = useWatch({ control, name: 'pto.priceHi' });
  const marginInput = useWatch({ control, name: 'pto.margin' });

  // Приведение к числам
  const primaryFlowNum = toNumberOrNull(primaryFlowInput);
  const secondaryFlowNum = toNumberOrNull(secondaryFlowInput);
  const primaryLossNum = toNumberOrNull(primaryLossInput);
  const secondaryLossNum = toNumberOrNull(secondaryLossInput);
  const priceHiNum = toNumberOrNull(priceHiInput);
  const marginNum = toNumberOrNull(marginInput);

  // Валидация обязательности
  const nameEmpty = isEmptyString(nameInput);
  const codeEmpty = isEmptyString(codeInput);
  const reserveEmpty = isEmptyString(reserveInput);
  const primaryFlowEmpty = primaryFlowNum === null;
  const secondaryFlowEmpty = secondaryFlowNum === null;
  const primaryLossEmpty = primaryLossNum === null;
  const secondaryLossEmpty = secondaryLossNum === null;
  const priceHiEmpty = priceHiNum === null;
  const marginEmpty = marginNum === null;

  // Проверка на отрицательные значения
  const primaryFlowNegative = primaryFlowNum !== null && primaryFlowNum < 0;
  const secondaryFlowNegative = secondaryFlowNum !== null && secondaryFlowNum < 0;
  const primaryLossNegative = primaryLossNum !== null && primaryLossNum < 0;
  const secondaryLossNegative = secondaryLossNum !== null && secondaryLossNum < 0;
  const priceHiNegative = priceHiNum !== null && priceHiNum < 0;
  const marginNegative = marginNum !== null && marginNum < 0;

  return (
    <Box>
      <SectionCard title="Параметры ПТО">
        <TextControl
          name="pto.name"
          label="Название ПТО"
          control={control}
          error={nameEmpty}
          helperText={nameEmpty ? REQUIRED_MSG : undefined}
        />
        <TextControl
          name="pto.code"
          label="Кодовый номер"
          control={control}
          error={codeEmpty}
          helperText={codeEmpty ? REQUIRED_MSG : undefined}
        />

        <SelectControl
          name="pto.reserve"
          label="Процент резервирования"
          control={control}
          options={[
            { value: 'none', label: 'Без резерва' },
            { value: '100', label: '100%' },
            { value: '75', label: '75%' },
            { value: '50', label: '50%' },
          ]}
          error={reserveEmpty}
          helperText={reserveEmpty ? REQUIRED_MSG : undefined}
        />

        <TextControl
          name="pto.primaryFlow"
          label="Расход по первичке"
          control={control}
          type="number"
          error={primaryFlowEmpty || primaryFlowNegative}
          helperText={
            primaryFlowEmpty
              ? REQUIRED_MSG
              : primaryFlowNegative
                ? NEGATIVE_MSG
                : undefined
          }
        />
        <TextControl
          name="pto.secondaryFlow"
          label="Расход по вторичке"
          control={control}
          type="number"
          error={secondaryFlowEmpty || secondaryFlowNegative}
          helperText={
            secondaryFlowEmpty
              ? REQUIRED_MSG
              : secondaryFlowNegative
                ? NEGATIVE_MSG
                : undefined
          }
        />
        <TextControl
          name="pto.primaryLoss"
          label="Потери давления по первичке"
          control={control}
          type="number"
          error={primaryLossEmpty || primaryLossNegative}
          helperText={
            primaryLossEmpty
              ? REQUIRED_MSG
              : primaryLossNegative
                ? NEGATIVE_MSG
                : undefined
          }
        />
        <TextControl
          name="pto.secondaryLoss"
          label="Потери давления по вторичке"
          control={control}
          type="number"
          error={secondaryLossEmpty || secondaryLossNegative}
          helperText={
            secondaryLossEmpty
              ? REQUIRED_MSG
              : secondaryLossNegative
                ? NEGATIVE_MSG
                : undefined
          }
        />
        <TextControl
          name="pto.priceHi"
          label="Цена из HI"
          control={control}
          type="number"
          error={priceHiEmpty || priceHiNegative}
          helperText={
            priceHiEmpty
              ? REQUIRED_MSG
              : priceHiNegative
                ? NEGATIVE_MSG
                : undefined
          }
        />
        <TextControl
          name="pto.margin"
          label="Запас"
          control={control}
          type="number"
          error={marginEmpty || marginNegative}
          helperText={
            marginEmpty
              ? REQUIRED_MSG
              : marginNegative
                ? NEGATIVE_MSG
                : undefined
          }
        />
      </SectionCard>
    </Box>
  );
}