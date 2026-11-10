// src/components/form/tabs/ChoicePumpTab.tsx

import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import type { InputData } from '../../../core/types';
import {
  searchPumpsByName,
  searchPumpsByCode,
  findPumpByCode,
  findPumpByName,
  type PumpCatalogItem,
} from '../../../core/calc/choicePumpTabCalc';

const REQUIRED_MSG = 'Обязательное поле';
const MISMATCH_MSG = 'Код и название не соответствуют друг другу. Выберите насос из списка.';

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ChoicePumpTab() {
  const { control, setValue } = useFormContext<InputData>();

  // Текущие значения из формы
  const pumpName = useWatch({ control, name: 'choicePump.pumpName' }) ?? '';
  const pumpCode = useWatch({ control, name: 'choicePump.pumpCode' }) ?? '';
  const headMInput = useWatch({ control, name: 'choicePump.headM' });
  const flowM3hInput = useWatch({ control, name: 'choicePump.flowM3h' });

  // Опции для автокомплитов
  const nameOptions = useMemo(() => searchPumpsByName(pumpName), [pumpName]);
  const codeOptions = useMemo(() => searchPumpsByCode(pumpCode), [pumpCode]);

  // Обязательность
  const nameEmpty = isEmptyString(pumpName);
  const codeEmpty = isEmptyString(pumpCode);
  const headMEmpty = toNumberOrNull(headMInput) === null;
  const flowM3hEmpty = toNumberOrNull(flowM3hInput) === null;

  // Проверка согласованности «код ↔ название»
  const codeMatchesName = useMemo(() => {
    if (nameEmpty || codeEmpty) return true;

    const byCode = findPumpByCode(pumpCode);
    const byName = findPumpByName(pumpName);

    if (!byCode || !byName) return false;
    return byCode.code === byName.code;
  }, [pumpName, pumpCode, nameEmpty, codeEmpty]);

  const mismatch = !nameEmpty && !codeEmpty && !codeMatchesName;

  const nameError = nameEmpty || mismatch;
  const codeError = codeEmpty || mismatch;

  // При выборе из списка — синхронизируем второе поле.
  // Сигнатура совместима с freeSolo: value может быть string.
  const handleSelectByName = (
    _e: unknown,
    value: PumpCatalogItem | string | null,
  ) => {
    if (value && typeof value !== 'string') {
      setValue('choicePump.pumpName', value.model, { shouldDirty: true });
      setValue('choicePump.pumpCode', value.code, { shouldDirty: true });
    }
  };

  const handleSelectByCode = (
    _e: unknown,
    value: PumpCatalogItem | string | null,
  ) => {
    if (value && typeof value !== 'string') {
      setValue('choicePump.pumpCode', value.code, { shouldDirty: true });
      setValue('choicePump.pumpName', value.model, { shouldDirty: true });
    }
  };

  return (
    <Box>
      <SectionCard title="Параметры насоса">
        {/* Название насоса — автокомплит по модели */}
        <Controller
          name="choicePump.pumpName"
          control={control}
          render={({ field }) => (
            <Autocomplete
              freeSolo
              size="small"
              options={nameOptions}
              getOptionLabel={(opt) =>
                typeof opt === 'string' ? opt : opt.model
              }
              isOptionEqualToValue={(opt, val) => {
                if (typeof opt === 'string' || typeof val === 'string') {
                  return opt === val;
                }
                return opt.model === val.model;
              }}
              value={
                nameOptions.find(o => o.model === field.value) ??
                (field.value || null)
              }
              inputValue={field.value ?? ''}
              onInputChange={(_e, val) => field.onChange(val)}
              onChange={handleSelectByName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Название насоса"
                  variant="outlined"
                  fullWidth
                  margin="none"
                  error={nameError}
                  helperText={
                    nameEmpty
                      ? REQUIRED_MSG
                      : mismatch
                        ? MISMATCH_MSG
                        : undefined
                  }
                />
              )}
              renderOption={(props, opt) => {
                const item = opt as PumpCatalogItem;
                return (
                  <li {...props} key={item.code}>
                    <Box>
                      <Typography variant="body2">{item.model}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.code}
                        {item.powerW ? ` · ${item.powerW} Вт` : ''}
                        {item.connection ? ` · ${item.connection}` : ''}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText="Ничего не найдено"
            />
          )}
        />

        {/* Код насоса — автокомплит по артикулу */}
        <Controller
          name="choicePump.pumpCode"
          control={control}
          render={({ field }) => (
            <Autocomplete
              freeSolo
              size="small"
              options={codeOptions}
              getOptionLabel={(opt) =>
                typeof opt === 'string' ? opt : opt.code
              }
              isOptionEqualToValue={(opt, val) => {
                if (typeof opt === 'string' || typeof val === 'string') {
                  return opt === val;
                }
                return opt.code === val.code;
              }}
              value={
                codeOptions.find(o => o.code === field.value) ??
                (field.value || null)
              }
              inputValue={field.value ?? ''}
              onInputChange={(_e, val) => field.onChange(val)}
              onChange={handleSelectByCode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Код насоса"
                  variant="outlined"
                  fullWidth
                  margin="none"
                  error={codeError}
                  helperText={
                    codeEmpty
                      ? REQUIRED_MSG
                      : mismatch
                        ? MISMATCH_MSG
                        : undefined
                  }
                />
              )}
              renderOption={(props, opt) => {
                const item = opt as PumpCatalogItem;
                return (
                  <li {...props} key={item.code}>
                    <Box>
                      <Typography variant="body2">{item.code}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.model}
                        {item.powerW ? ` · ${item.powerW} Вт` : ''}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText="Ничего не найдено"
            />
          )}
        />

        {/* Напор и расход — ручной ввод */}
        <TextControl
          name="choicePump.headM"
          label="Напор насоса, м.вод.ст."
          control={control}
          type="number"
          error={headMEmpty}
          helperText={headMEmpty ? REQUIRED_MSG : undefined}
        />
        <TextControl
          name="choicePump.flowM3h"
          label="Расход насоса, м³/ч"
          control={control}
          type="number"
          error={flowM3hEmpty}
          helperText={flowM3hEmpty ? REQUIRED_MSG : undefined}
        />
      </SectionCard>

      {mismatch && (
        <FormHelperText error sx={{ mx: 1.75, mt: 1 }}>
          {MISMATCH_MSG}
        </FormHelperText>
      )}
    </Box>
  );
}