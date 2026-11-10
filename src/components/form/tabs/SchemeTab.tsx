// src/components/form/tabs/SchemeTab.tsx

import { useFormContext } from 'react-hook-form';
import { Box } from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { SelectControl } from '../../controls/SelectControl';
import type { InputData } from '../../../core/types';

export function SchemeTab() {
  const { control } = useFormContext<InputData>();

  return (
    <Box>
      <SectionCard title="Первичный контур">
        <SelectControl
          name="scheme.hasSeparator"
          label="Наличие сепаратора"
          control={control}
          options={[
            { value: 'yes', label: 'Да' },
            { value: 'no', label: 'Нет' },
          ]}
        />
        <SelectControl
          name="scheme.hasAccountingPrimary"
          label="Наличие учёта"
          control={control}
          options={[
            { value: 'yes', label: 'Да' },
            { value: 'no', label: 'Нет' },
            { value: 'none', label: 'Проставка' },
          ]}
        />
        <SelectControl
          name="scheme.trapReserve"
          label="Резерв конденсатоотводчиков"
          control={control}
          options={[
            { value: 'none', label: 'Нет' },
            { value: '2x100', label: '2 по 100' },
            { value: '2x75', label: '2 по 75' },
            { value: '2x50', label: '2 по 50' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Вторичный контур">
        <SelectControl
          name="scheme.hxReserve"
          label="Резерв ПТО"
          control={control}
          options={[
            { value: 'none', label: 'Нет' },
            { value: '2x100', label: '2 по 100' },
            { value: '2x75', label: '2 по 75' },
            { value: '2x50', label: '2 по 50' },
          ]}
        />
        <SelectControl
          name="scheme.pumpReserve"
          label="Резерв насосов"
          control={control}
          options={[
            { value: 'none', label: 'Нет' },
            { value: '2x100', label: '2 по 100' },
            { value: '3x50', label: '3 по 50' },
          ]}
        />
        <SelectControl
          name="scheme.hasAccountingSecondary"
          label="Наличие учёта"
          control={control}
          options={[
            { value: 'yes', label: 'Да' },
            { value: 'no', label: 'Нет' },
            { value: 'none', label: 'Проставка' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Линия подпитки">
        <SelectControl
          name="scheme.makeupConfig"
          label="Конфигурация подпитки"
          control={control}
          options={[
            { value: 'solenoid', label: 'Соленоид' },
            { value: 'solenoid_bypass', label: 'Соленоид с байпасом' },
            { value: 'solenoid_pump_1x100', label: 'Соленоид с насосом 1 по 100' },
            { value: 'solenoid_pump_1x100_bypass', label: 'Соленоид с насосом 1 по 100 с байпасом' },
            { value: 'solenoid_pumps_2x100', label: 'Соленоид с насосами 2 по 100' },
            { value: 'solenoid_pumps_2x100_bypass', label: 'Соленоид с насосами 2 по 100 с байпасом' },
            { value: 'pump_1x100', label: 'Насос 1 по 100' },
            { value: 'pumps_2x100', label: 'Насосы 2 по 100' },
          ]}
        />
        <SelectControl
          name="scheme.hasExpansionTank"
          label="Наличие РБ"
          control={control}
          options={[
            { value: 'yes', label: 'Да' },
            { value: 'no', label: 'Нет' },
          ]}
        />
        <SelectControl
          name="scheme.aupdConfig"
          label="Наличие АУПД / АУПДз"
          control={control}
          options={[
            { value: 'none', label: 'Нет' },
            { value: 'aupd', label: 'АУПД' },
            { value: 'aupdz', label: 'АУПДз' },
          ]}
        />
      </SectionCard>
    </Box>
  );
}