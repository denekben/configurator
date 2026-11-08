// src/components/form/tabs/ChoiceMakeupArmatureTab.tsx

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
import type { InputData } from '../../../core/types';

const REQUIRED_MSG = 'Обязательное поле';
const NEGATIVE_MSG = 'Значение не может быть отрицательным';
const MODE_REQUIRED_MSG = 'Выберите режим подбора';

const STANDARD_DUS = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300]
  .map(v => ({ value: String(v), label: String(v) }));

const CONNECTION_OPTIONS = [
  { value: 'thread', label: 'Резьба' },
  { value: 'weld', label: 'Сварка' },
  { value: 'flange', label: 'Фланец' },
  { value: 'interflange', label: 'Межфланцевое' },
];

const VALVE_OPTIONS = [
  { value: 'BVR-R', label: 'BVR-R' },
  { value: 'BVS-R', label: 'BVS-R' },
  { value: 'RJIP_Premium_FF', label: 'RJIP Premium FF' },
  { value: 'RJIP_Premium_WW', label: 'RJIP Premium WW' },
  { value: 'RJIP_Standard_FF', label: 'RJIP Standard FF' },
  { value: 'RJIP_Standard_WW', label: 'RJIP Standard WW' },
  { value: 'RJIP_Premium_FF_Reducer_25', label: 'RJIP Premium FF (Редуктор) 25 бар' },
  { value: 'RJIP_Premium_FF_Reducer_16', label: 'RJIP Premium FF (Редуктор) 16 бар' },
  { value: 'RIDAN_ZDM', label: 'РИДАН-ЗДМ' },
];

const CHECK_VALVE_OPTIONS = [
  { value: 'RIDAN_ZOD', label: 'РИДАН-ЗОД' },
  { value: 'NVD_812R', label: 'NVD-812R' },
  { value: 'NRV_R', label: 'NRV-R' },
];

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ChoiceMakeupArmatureTab() {
  const { control } = useFormContext<InputData>();

  const tabModeRaw = useWatch({ control, name: 'makeupArmature.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';
  const editStandardDu = useWatch({ control, name: 'makeUp.editStandardDu' }) ?? false;

  // Авторежим: мощность и объём системы
  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const systemVolumeLInput = useWatch({ control, name: 'system.systemVolumeL' });

  // Ручной режим: локальные поля
  const makeupStandardDuInput = useWatch({ control, name: 'makeUp.makeupStandardDu' });
  const connectionTypeInput = useWatch({ control, name: 'makeupArmature.connectionType' });
  const valveNameInput = useWatch({ control, name: 'makeupArmature.valveName' });
  const checkValveNameInput = useWatch({ control, name: 'makeupArmature.checkValveName' });

  // Приведение к числам
  const loadKwNum = toNumberOrNull(loadKwInput);
  const systemVolumeLNum = toNumberOrNull(systemVolumeLInput);

  // Обязательность — авторежим
  const loadKwEmpty = loadKwNum === null;
  const loadKwNegative = loadKwNum !== null && loadKwNum < 0;
  // systemVolumeL не обязателен, но отрицательное значение подсвечиваем
  const systemVolumeLNegative = systemVolumeLNum !== null && systemVolumeLNum < 0;

  // Обязательность — ручной режим
  const makeupStandardDuEmpty = isEmptyString(makeupStandardDuInput);
  const connectionTypeEmpty = isEmptyString(connectionTypeInput);
  const valveNameEmpty = isEmptyString(valveNameInput);
  const checkValveNameEmpty = isEmptyString(checkValveNameInput);

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="makeupArmature.mode"
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

      {/* Авторежим: только мощность и объём системы */}
      {!isManual && !modeEmpty && (
        <GlobalDataWrapper>
          <SectionCard title="Данные по системам">
            <TextControl
              name="system.loadKw"
              label="Мощность, кВт"
              control={control}
              type="number"
              error={loadKwEmpty || loadKwNegative}
              helperText={
                loadKwEmpty
                  ? REQUIRED_MSG
                  : loadKwNegative
                    ? NEGATIVE_MSG
                    : undefined
              }
            />
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
      )}

      {/* Ручной режим: Ду, тип присоединения, наименование, обратный клапан */}
      {isManual && (
        <SectionCard title="Дополнительные параметры Выбор запорной арматуры (Подпитка)">
          {/* Галочка «Редактировать Ду» — общий флаг с вкладкой «Подпитка» */}
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
                      Редактировать Ду (повлияет на Подпитка)
                    </Typography>
                  }
                  sx={{ mt: -1, mb: -1.5 }}
                />
              </Tooltip>
            )}
          />

          {/* Стандартный Ду — блокируется без галочки */}
          <Controller
            name="makeUp.makeupStandardDu"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={makeupStandardDuEmpty}
                disabled={!editStandardDu}
              >
                <InputLabel id="arm-makeup-standard-du-label">Стандартный Ду</InputLabel>
                <Select
                  labelId="arm-makeup-standard-du-label"
                  id="arm-makeup-standard-du-select"
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
                {makeupStandardDuEmpty && (
                  <FormHelperText>{REQUIRED_MSG}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <SelectControl
            name="makeupArmature.connectionType"
            label="Тип присоединения"
            control={control}
            options={CONNECTION_OPTIONS}
            error={connectionTypeEmpty}
            helperText={connectionTypeEmpty ? REQUIRED_MSG : undefined}
          />

          <SelectControl
            name="makeupArmature.valveName"
            label="Наименование"
            control={control}
            options={VALVE_OPTIONS}
            error={valveNameEmpty}
            helperText={valveNameEmpty ? REQUIRED_MSG : undefined}
          />

          <SelectControl
            name="makeupArmature.checkValveName"
            label="Обратный клапан"
            control={control}
            options={CHECK_VALVE_OPTIONS}
            error={checkValveNameEmpty}
            helperText={checkValveNameEmpty ? REQUIRED_MSG : undefined}
          />
        </SectionCard>
      )}
    </Box>
  );
}