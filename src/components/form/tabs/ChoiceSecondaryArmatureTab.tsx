// src/components/form/tabs/SecondaryArmatureTab.tsx

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

const FILTER_OPTIONS = [
  { value: 'FSF', label: 'ФСФ' },
  { value: 'FVR-R', label: 'FVR-R' },
  { value: 'FVF_Standard', label: 'FVF-Standard' },
];

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ChoiceSecondaryArmatureTab() {
  const { control } = useFormContext<InputData>();

  // Локальный режим — читаем как есть, без дефолта.
  const tabModeRaw = useWatch({ control, name: 'secondaryArmature.mode' });
  const tabMode = tabModeRaw ?? '';
  const modeEmpty = tabMode === '';
  const isManual = tabMode === 'manual';

  const editStandardDu = useWatch({ control, name: 'secondaryCircuit.editStandardDu' }) ?? false;

  // Глобальные поля (видны только в авторежиме)
  const loadKwInput = useWatch({ control, name: 'system.loadKw' });
  const supplyTempCInput = useWatch({ control, name: 'system.supplyTempC' });
  const returnTempCInput = useWatch({ control, name: 'system.returnTempC' });

  // Локальные поля
  const standardDuInput = useWatch({ control, name: 'secondaryCircuit.secondaryStandardDu' });
  const connectionTypeInput = useWatch({ control, name: 'secondaryArmature.connectionType' });
  const valveNameInput = useWatch({ control, name: 'secondaryArmature.valveName' });
  const checkValveNameInput = useWatch({ control, name: 'secondaryArmature.checkValveName' });
  const filterNameInput = useWatch({ control, name: 'secondaryArmature.filterName' });

  // Приведение к числам
  const loadKwNum = toNumberOrNull(loadKwInput);
  const supplyTempCNum = toNumberOrNull(supplyTempCInput);
  const returnTempCNum = toNumberOrNull(returnTempCInput);

  // Валидация обязательности
  const loadKwEmpty = loadKwNum === null;
  const supplyTempCEmpty = supplyTempCNum === null;
  const returnTempCEmpty = returnTempCNum === null;

  const standardDuEmpty = isEmptyString(standardDuInput);
  const connectionTypeEmpty = isEmptyString(connectionTypeInput);
  const valveNameEmpty = isEmptyString(valveNameInput);
  const checkValveNameEmpty = isEmptyString(checkValveNameInput);
  const filterNameEmpty = isEmptyString(filterNameInput);

  // Отрицательные значения (только у числовых полей)
  const loadKwNegative = loadKwNum !== null && loadKwNum < 0;
  const supplyTempCNegative = supplyTempCNum !== null && supplyTempCNum < 0;
  const returnTempCNegative = returnTempCNum !== null && returnTempCNum < 0;

  // Хелпер приоритета: пусто → отрицательное
  const buildHelper = (empty: boolean, negative: boolean): string | undefined =>
    empty ? REQUIRED_MSG : negative ? NEGATIVE_MSG : undefined;

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
        <RadioControl
          name="secondaryArmature.mode"
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

      {!isManual && !modeEmpty && (
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
      )}

      {isManual && (
        <SectionCard title="Дополнительные параметры запорной арматуры (Вторичный контур)">
          {/* Галочка «Редактировать Ду» — структура как в MakeUpTab */}
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
                      Редактировать Ду (повлияет на Вторичный контур)
                    </Typography>
                  }
                  sx={{ mt: -1, mb: -1.5 }}
                />
              </Tooltip>
            )}
          />

          {/* Ду блокируется, пока не поставлена галочка «Редактировать Ду» */}
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
                <InputLabel id="arm-secondary-standard-du-label">Ду</InputLabel>
                <Select
                  labelId="arm-secondary-standard-du-label"
                  id="arm-secondary-standard-du-select"
                  value={field.value ?? ''}
                  label="Ду"
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

          <SelectControl
            name="secondaryArmature.connectionType"
            label="Тип присоединения"
            control={control}
            options={CONNECTION_OPTIONS}
            error={connectionTypeEmpty}
            helperText={connectionTypeEmpty ? REQUIRED_MSG : undefined}
          />
          <SelectControl
            name="secondaryArmature.valveName"
            label="Наименование"
            control={control}
            options={VALVE_OPTIONS}
            error={valveNameEmpty}
            helperText={valveNameEmpty ? REQUIRED_MSG : undefined}
          />
          <SelectControl
            name="secondaryArmature.checkValveName"
            label="Обратный клапан"
            control={control}
            options={CHECK_VALVE_OPTIONS}
            error={checkValveNameEmpty}
            helperText={checkValveNameEmpty ? REQUIRED_MSG : undefined}
          />
          <SelectControl
            name="secondaryArmature.filterName"
            label="Фильтр"
            control={control}
            options={FILTER_OPTIONS}
            error={filterNameEmpty}
            helperText={filterNameEmpty ? REQUIRED_MSG : undefined}
          />
        </SectionCard>
      )}
    </Box>
  );
}